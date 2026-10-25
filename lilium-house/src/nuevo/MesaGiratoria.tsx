import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowIcon } from '../components/Icons'
import { CARTA } from '../data/site'
import { gsap, lineasQueSuben, reducido } from './animar'
import { Sticker } from './Piezas'

/*
 * La mesa giratoria (referencia: el carrusel de frascos de Agrumea Farm, decodificado).
 *
 * Agrumea no dibuja 3D en vivo: cada frasco es una imagen que se mueve con transform (arco, inclinación,
 * escala por profundidad) y filter (brillo y desenfoque por profundidad y por velocidad), y la etiqueta se
 * redibuja para simular el giro. Acá igual, sin WebGL: cada plato 3D (scripts/sprites) se fotografió girando
 * en 36 cuadros; la página solo cambia transform, filter y el cuadro de la hoja. Así no se traba en ningún
 * teléfono.
 *
 * - El scroll le da una vuelta entera a la mesa; el arrastre o las flechas la siguen girando sin tope.
 * - Al soltar la mesa sigue con la velocidad del gesto y frena en un par de segundos (inercia), y mientras va
 *   rápido los platos se desenfocan y se ladean hacia donde viajan.
 * - Arrastrar un plato lo gira sobre su eje (siguiendo al dedo); tocar uno del costado lo trae al frente.
 * Todo corre en un rAF que escribe estilos: sin re-render por cuadro.
 */

const PLATOS = CARTA.flatMap((momento) =>
  momento.items.flatMap((item) => (item.kind === 'plato' ? [{ id: item.id, name: item.name, note: item.note, desc: item.desc, momento: momento.label }] : [])),
)
const N = PLATOS.length

// las hojas de giro: 36 cuadros (cada 10°) en una grilla de 6 × 6; el centro del plato cae al 62 % del alto
const CUADROS = 36
const COLS = 6
const CENTRO_Y = 0.62
const ANCHO_CUADRO = 1.207 // ancho del cuadro respecto del diámetro del plato
const hoja = (id: string, t: 'm' | 'd') => `/platos/${id}-giro-${t}.webp`
const quieto = (id: string, t: 'm' | 'd') => `/platos/${id}-${t}.webp`

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
/** distancia de un plato al frente, por el lado más corto de la mesa: [-N/2, N/2) */
const wrap = (d: number) => ((((d + N / 2) % N) + N) % N) - N / 2
const mod = (i: number) => ((i % N) + N) % N

/** Brillo y desenfoque por profundidad (como Agrumea) más el desenfoque por velocidad del cambio. */
function filtro(a: number, vel: number) {
  const brillo = 1.03 - Math.min(a, 2.5) * 0.09
  const blur = Math.min(a, 2.5) * 1.3 + Math.min(Math.abs(vel) * 2.4, 9)
  return blur < 0.3 ? `brightness(${brillo.toFixed(3)})` : `brightness(${brillo.toFixed(3)}) blur(${blur.toFixed(2)}px)`
}

/**
 * Posición de cada plato con la mesa quieta en el café (current = 0), como variables CSS: así el HTML
 * generado al compilar ya trae los platos en su lugar antes de que corra JavaScript. Mismas fórmulas que render().
 */
function posicionInicial(i: number): CSSProperties {
  const d = wrap(i)
  const a = Math.abs(d)
  return {
    '--xf': d * (1 - 0.06 * Math.min(a, 3)),
    '--yf': -Math.min(a, 3),
    '--rot': -d * 6,
    '--s': 1 - 0.3 * Math.min(a, 2.2),
    opacity: clamp(3 - a, 0, 1),
    zIndex: 10 - Math.round(a * 2),
    filter: filtro(a, 0),
  } as CSSProperties
}

export function MesaGiratoria() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const mesaRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const capaA = useRef<(HTMLDivElement | null)[]>([])
  const capaB = useRef<(HTMLDivElement | null)[]>([])
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const nombreRef = useRef<HTMLSpanElement>(null)
  const nudgeRef = useRef<(step: number) => void>(() => {})
  const [focus, setFocus] = useState(0)
  const [aviso, setAviso] = useState('')
  const [tocada, setTocada] = useState(false)

  useEffect(() => {
    const section = sectionRef.current!
    const stage = stageRef.current!
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let scrollPart = 0
    let offset = 0
    let current = 0
    // la mesa tiene dos partes: la del scroll (sigue de cerca) y la de los gestos (sigue de largo y frena)
    let sCur = 0
    let oCur = 0
    let vel = 0
    let raf = 0
    let shown = -1
    let spacing = 0
    let narrow = false
    let size = 0
    let ultimo = performance.now()
    let announce = false
    // giro propio de cada plato (radianes): el dedo marca el objetivo y el plato lo sigue de cerca
    const angulo = new Float64Array(N)
    const anguloObj = new Float64Array(N)
    let girando = -1
    let dragging = false

    // hojas de giro: se bajan de a una (primero el plato del frente) y se sueltan las lejanas en el teléfono
    let talla: 'm' | 'd' = 'm'
    const hojas: (HTMLImageElement | null)[] = Array(N).fill(null)
    const listas = new Uint8Array(N)
    const pedir = (i: number) => {
      if (hojas[i]) return
      const img = new Image()
      img.decoding = 'async'
      img.src = hoja(PLATOS[i].id, talla)
      hojas[i] = img
      img
        .decode()
        .then(() => {
          if (hojas[i] !== img) return
          for (const capa of [capaA.current[i]!, capaB.current[i]!]) capa.style.backgroundImage = `url(${img.src})`
          listas[i] = 1
          itemRefs.current[i]!.dataset.hoja = ''
          invalidate()
        })
        .catch(() => (hojas[i] = null))
    }
    const soltar = (i: number) => {
      if (!hojas[i]) return
      hojas[i] = null
      listas[i] = 0
      delete itemRefs.current[i]!.dataset.hoja
      for (const capa of [capaA.current[i]!, capaB.current[i]!]) capa.style.backgroundImage = ''
    }
    const repartirHojas = () => {
      const orden = [...Array(N).keys()].sort((a, b) => Math.abs(wrap(a - current)) - Math.abs(wrap(b - current)))
      for (const i of orden) {
        const a = Math.abs(wrap(i - current))
        if (a <= 1.6 || !narrow) pedir(i)
        else if (a > 2.6) soltar(i)
      }
    }

    const measure = () => {
      narrow = innerWidth < 768
      size = itemRefs.current[0]!.offsetWidth / ANCHO_CUADRO
      // separación proporcional al plato (en pantallas bajas los platos se achican y se juntan)
      spacing = narrow ? innerWidth * 0.7 : Math.min(innerWidth * 0.27, size * 1.05, 430)
      const t = size * ANCHO_CUADRO * Math.min(devicePixelRatio || 1, 2) > 470 ? 'd' : 'm'
      if (t !== talla) {
        talla = t
        for (let i = 0; i < N; i++) soltar(i)
      }
    }

    const render = () => {
      const lado = Math.min(Math.abs(vel) * 2.2, 8) * Math.sign(vel)
      for (let i = 0; i < N; i++) {
        const d = wrap(i - current)
        const a = Math.abs(d)
        const x = d * spacing * (1 - 0.06 * Math.min(a, 3))
        const y = -Math.min(a, 3) * spacing * (narrow ? 0.12 : 0.07)
        const s = 1 - 0.3 * Math.min(a, 2.2)
        const el = itemRefs.current[i]!
        el.style.transform = `translate(-50%, ${-CENTRO_Y * 100}%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(-d * 6 - lado).toFixed(2)}deg) scale(${s.toFixed(3)})`
        el.style.opacity = String(clamp(3 - a, 0, 1))
        el.style.zIndex = String(10 - Math.round(a * 2))
        el.style.filter = reduced ? '' : filtro(a, vel)
        if (!listas[i]) continue
        // giro sobre su eje: el del viaje de la mesa más el del dedo; entre dos cuadros se funden
        const giro = -d * 0.9 + angulo[i]
        const f = (((giro / (Math.PI * 2)) * CUADROS) % CUADROS + CUADROS) % CUADROS
        const f0 = Math.floor(f)
        const k = f - f0
        const pos = (c: number) => {
          const col = c % COLS
          const fila = Math.floor(c / COLS)
          return `${((col / (COLS - 1)) * 100).toFixed(3)}% ${((fila / (COLS - 1)) * 100).toFixed(3)}%`
        }
        capaA.current[i]!.style.backgroundPosition = pos(f0)
        const b = capaB.current[i]!
        b.style.backgroundPosition = pos((f0 + 1) % CUADROS)
        b.style.opacity = k.toFixed(3)
      }
      mesaRef.current!.style.transform = `rotate(${(-current * (360 / N)).toFixed(2)}deg)`
      const idx = mod(Math.round(current))
      if (idx !== shown) {
        shown = idx
        setFocus(idx)
        if (announce) setAviso(`${PLATOS[idx].name}, ${PLATOS[idx].note}`)
      }
    }

    const frame = (now: number) => {
      raf = 0
      const dt = Math.min(0.05, Math.max(0.001, (now - ultimo) / 1000))
      ultimo = now
      const antes = current
      const sigue = (v: number, obj: number, tasa: number) => (reduced ? obj : v + (obj - v) * (1 - Math.exp(-dt * tasa)))
      sCur = sigue(sCur, scrollPart, 6)
      // con el dedo encima la mesa lo sigue; suelta, sigue de largo y frena en ~2 s (la inercia del cambio)
      oCur = sigue(oCur, offset, dragging && girando < 0 ? 24 : 2.4)
      if (Math.abs(scrollPart - sCur) < 1e-4) sCur = scrollPart
      if (Math.abs(offset - oCur) < 1e-4) oCur = offset
      current = sCur + oCur
      // velocidad de la mesa (platos/s), suavizada: alimenta el desenfoque y el ladeo
      vel = reduced ? 0 : sigue(vel, (current - antes) / dt, 12)
      if (Math.abs(vel) < 0.01) vel = 0
      let moviendo = current !== scrollPart + offset || vel !== 0
      for (let i = 0; i < N; i++) {
        angulo[i] = sigue(angulo[i], anguloObj[i], 18)
        if (Math.abs(anguloObj[i] - angulo[i]) < 1e-3) angulo[i] = anguloObj[i]
        else moviendo = true
      }
      render()
      if (moviendo || girando >= 0) raf = requestAnimationFrame(frame)
      else repartirHojas()
    }
    const invalidate = () => {
      if (raf) return
      ultimo = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const firstTouch = () => setTocada(true)

    const onScroll = () => {
      const r = section.getBoundingClientRect()
      const run = r.height - innerHeight
      // una vuelta entera de mesa a lo largo del scroll: al final vuelve a estar el café al frente
      scrollPart = run > 0 ? clamp(-r.top / run, 0, 1) * N : 0
      announce = false
      invalidate()
    }

    // Gestos (horizontales; el vertical es scroll de la página).
    let downX = 0
    let downY = 0
    let dragFrom = 0
    let lastX = 0
    let lastT = 0
    let velDedo = 0
    let moved = false
    let bajo: number | null = null
    // cuántos radianes gira un plato por cada píxel arrastrado (una vuelta ≈ dos anchos de plato)
    const radPorPx = () => (Math.PI * 2) / Math.max(size * 2, 200)
    // el plato bajo el dedo: el más cercano al frente cuyo óvalo (plato inclinado + lo que tiene arriba) lo contiene
    const platoBajo = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      let mejor: number | null = null
      let mejorA = 99
      for (let i = 0; i < N; i++) {
        const el = itemRefs.current[i]!
        const b = el.getBoundingClientRect()
        const cx = b.left + b.width / 2 - r.left
        const cy = b.top + b.height * CENTRO_Y - r.top
        const rx = (b.width / ANCHO_CUADRO) * 0.5
        const dx = (e.clientX - r.left - cx) / rx
        const dy = (e.clientY - r.top - cy + rx * 0.2) / (rx * 0.75)
        const a = Math.abs(wrap(i - current))
        if (dx * dx + dy * dy <= 1 && a < mejorA) {
          mejor = i
          mejorA = a
        }
      }
      return mejor
    }
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      dragging = true
      moved = false
      downX = lastX = e.clientX
      downY = e.clientY
      lastT = e.timeStamp
      dragFrom = offset
      velDedo = 0
      bajo = platoBajo(e)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      if (!moved) {
        if (Math.abs(e.clientX - downX) < 6) return
        if (Math.abs(e.clientY - downY) > Math.abs(e.clientX - downX)) {
          dragging = false
          return
        }
        moved = true
        stage.setPointerCapture(e.pointerId)
        stage.dataset.dragging = ''
        firstTouch()
        // solo el plato del frente se gira a mano; arrastrar sobre otro mueve la mesa
        if (bajo !== null && Math.abs(wrap(bajo - current)) < 0.5) {
          girando = bajo
          pedir(bajo)
        }
      }
      const dx = e.clientX - lastX
      const dt = Math.max(e.timeStamp - lastT, 1)
      if (girando >= 0) {
        anguloObj[girando] += dx * radPorPx()
      } else {
        offset = dragFrom - (e.clientX - downX) / spacing
        // velocidad del dedo en platos/s, suavizada: es la que se conserva al soltar
        velDedo = velDedo * 0.5 + (-dx / spacing / dt) * 1000 * 0.5
      }
      lastX = e.clientX
      lastT = e.timeStamp
      invalidate()
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      delete stage.dataset.dragging
      announce = true
      if (girando >= 0) {
        girando = -1
        invalidate()
        return
      }
      if (!moved) {
        if (bajo === null) return
        const i = bajo
        if (Math.abs(wrap(i - current)) < 0.5) return
        offset = Math.round(current + wrap(i - current)) - scrollPart
        firstTouch()
        invalidate()
        return
      }
      // inercia: con frenado exponencial (tasa 2,4/s) la mesa recorre v / 2,4 platos más; se acomoda en el más cercano
      const quieto = e.timeStamp - lastT > 80
      const fling = quieto ? 0 : clamp(velDedo / 2.4, -4, 4)
      offset = Math.round(scrollPart + offset + fling) - scrollPart
      invalidate()
    }
    const onCancel = () => {
      dragging = false
      girando = -1
      delete stage.dataset.dragging
    }
    nudgeRef.current = (step) => {
      announce = true
      offset = Math.round(scrollPart + offset) + step - scrollPart
      firstTouch()
      invalidate()
    }

    measure()
    onScroll()
    sCur = scrollPart
    oCur = offset
    current = scrollPart + offset
    render()
    const onResize = () => {
      measure()
      render()
      onScroll()
    }
    // las hojas de giro se piden cuando la página terminó de cargar (no compiten con la portada)
    const empezar = () => repartirHojas()
    if (document.readyState === 'complete') setTimeout(empezar, 300)
    else addEventListener('load', () => setTimeout(empezar, 300), { once: true })

    // los platos "se sirven" sobre la mesa al llegar
    if (!reduced) {
      const orden = [...Array(N).keys()].sort((a, b) => Math.abs(wrap(a)) - Math.abs(wrap(b)))
      gsap.from(
        orden.map((i) => itemRefs.current[i]!.firstElementChild),
        { y: '22%', scale: 0.7, opacity: 0, duration: 1.1, stagger: 0.08, delay: 0.15, ease: 'expo.out' },
      )
    }

    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onResize)
    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onCancel)
    return () => {
      cancelAnimationFrame(raf)
      for (let i = 0; i < N; i++) hojas[i] = null
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onCancel)
    }
  }, [])

  // el título sube línea por línea al cargar
  useEffect(() => lineasQueSuben(tituloRef.current!, { retraso: 0.15 }), [])
  // el nombre del plato cambia rodando desde abajo (corto: se ve muchas veces)
  const primera = useRef(true)
  useEffect(() => {
    if (primera.current || reducido()) {
      primera.current = false
      return
    }
    gsap.fromTo(nombreRef.current, { yPercent: 55, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45 })
  }, [focus])

  const plato = PLATOS[focus]

  return (
    <section
      ref={sectionRef}
      id="mesa"
      aria-label="La mesa de Lilium"
      className="relative h-[300svh] md:h-[340svh]"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault()
          nudgeRef.current(e.key === 'ArrowLeft' ? -1 : 1)
        }
      }}
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-crema">
        {/* la vitrina: título condensado enorme; en el teléfono, nada más que el título y la mesa */}
        <div className="mesa-portada">
          <Sticker className="mesa-sticker" giro={-9}>
            ¡Pedí lápices
            <br />y pintá el mantel!
          </Sticker>
          <h1 ref={tituloRef} className="titulo-vitrina mesa-titulo">
            Cafés especiales <span className="block">y delicias caseras</span>
          </h1>
          <p className="mesa-bajada">En Puerto Iguazú, sobre Av. Tres Fronteras. Desayunos, almuerzos y meriendas.</p>
        </div>

        {/* la mesa: un disco enorme con el mantel de mandala, que asoma desde abajo y gira con los platos */}
        <div aria-hidden="true" className="mesa-wrap">
          <div ref={mesaRef} className="mesa">
            <svg viewBox="-500 -500 1000 1000" className="h-full w-full">
              <circle r="500" className="fill-laguna-deep" />
              <g className="mesa-mandala" fill="none">
                <circle r="470" />
                <circle r="452" strokeDasharray="2 14" strokeLinecap="round" strokeWidth="4" />
                <circle r="300" />
                {Array.from({ length: 24 }, (_, k) => (
                  <path key={k} transform={`rotate(${k * 15})`} d="M0-448C26-420 26-372 0-330C-26-372-26-420 0-448Z" />
                ))}
                {Array.from({ length: 12 }, (_, k) => (
                  <path key={k} transform={`rotate(${k * 30 + 7.5})`} d="M0-300C40-262 40-206 0-170C-40-206-40-262 0-300Z" />
                ))}
              </g>
            </svg>
          </div>
        </div>

        <div ref={stageRef} className="escenario" aria-hidden="true">
          {PLATOS.map(({ id }, i) => (
            <div key={id} ref={(el) => void (itemRefs.current[i] = el)} data-i={i} className="plato" style={posicionInicial(i)}>
              <div className="plato-cuerpo">
                <img
                  className="plato-quieto"
                  src={quieto(id, 'd')}
                  srcSet={`${quieto(id, 'm')} 432w, ${quieto(id, 'd')} 600w`}
                  sizes="(max-width: 767px) 85vw, 483px"
                  alt=""
                  width={600}
                  height={450}
                  draggable={false}
                  fetchPriority={Math.abs(wrap(i)) < 0.5 ? 'high' : 'auto'}
                />
                <div ref={(el) => void (capaA.current[i] = el)} className="plato-cuadro" />
                <div ref={(el) => void (capaB.current[i] = el)} className="plato-cuadro" />
              </div>
            </div>
          ))}
        </div>

        <div className="pie-mesa">
          <button type="button" className="flecha" aria-label="Plato anterior" onClick={() => nudgeRef.current(-1)}>
            <ArrowIcon className="h-5 w-5 rotate-180" />
          </button>
          <p className="min-w-0 flex-1 text-center">
            <span className="pista" data-oculta={tocada || undefined} aria-hidden="true">
              Girá un plato o deslizá la mesa
            </span>
            <span className="block overflow-hidden">
              <span ref={nombreRef} className="titulo-vitrina block text-[2.3rem] leading-[0.95] text-crema md:text-[3.4rem]">
                {plato.name}
              </span>
            </span>
            <span className="mt-1 block font-hand text-[1.4rem] leading-tight text-menta">
              {plato.momento.toLowerCase()} · {plato.note}
            </span>
          </p>
          <button type="button" className="flecha" aria-label="Plato siguiente" onClick={() => nudgeRef.current(1)}>
            <ArrowIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {aviso}
        </p>
        <ul className="sr-only">
          {PLATOS.map((p) => (
            <li key={p.id}>
              {p.name}: {p.momento.toLowerCase()}, {p.note}. {p.desc}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
