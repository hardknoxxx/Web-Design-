import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react'
import { ArrowIcon } from '../components/Icons'
import { CafePlato, CheesecakePlato, ChipaPlato, EnsaladaPlato, TePlato, TortaPlato, TostadoPlato } from '../components/Platos'
import { CARTA } from '../data/site'
import { gsap, lineasQueSuben, reducido } from './animar'
import { Sticker } from './Piezas'
import type { Mesa3D, Pose } from './tres/mesa3d'

/*
 * La mesa giratoria (referencia: el carrusel de frascos de Agrumea Farm).
 * Una mesa verde que no termina: el scroll le da una vuelta entera (de la mañana a la noche y otra vez al café)
 * y el arrastre o las flechas la siguen girando sin tope, como el carrusel de la referencia. Tocar un plato lo
 * trae al frente por el camino más corto y lo hace girar sobre la mesa.
 * Los platos son objetos 3D (three.js, tres/mesa3d.ts) que giran sobre su eje y se pintan al llegar al frente,
 * como el mantel para colorear. Mientras three.js baja (o si no hay WebGL) se ven los dibujos planos del HTML.
 * Todo corre en un rAF que escribe estilos o dibuja el lienzo: sin re-render por cuadro.
 */

const DIBUJOS: Record<string, ComponentType> = {
  cafe: CafePlato,
  chipa: ChipaPlato,
  te: TePlato,
  tostado: TostadoPlato,
  ensalada: EnsaladaPlato,
  cheesecake: CheesecakePlato,
  torta: TortaPlato,
}

const PLATOS = CARTA.flatMap((momento) =>
  momento.items.flatMap((item) =>
    item.kind === 'plato' ? [{ id: item.id, name: item.name, note: item.note, desc: item.desc, momento: momento.label, Dibujo: DIBUJOS[item.id] }] : [],
  ),
)
const N = PLATOS.length
// giro propio de cada plato, para que no queden todos alineados
const GIRO = [-14, 22, -6, 31, -24, 9, -18]

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
/** distancia de un plato al frente, por el lado más corto de la mesa: [-N/2, N/2) */
const wrap = (d: number) => ((((d + N / 2) % N) + N) % N) - N / 2
const mod = (i: number) => ((i % N) + N) % N

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
    '--rot': GIRO[i] - d * 24,
    '--s': 1 - 0.3 * Math.min(a, 2.2),
    opacity: clamp(3 - a, 0, 1),
    zIndex: 10 - Math.round(a * 2),
  } as CSSProperties
}
const colorInicial = (i: number): CSSProperties => {
  const c = clamp(1.5 - Math.abs(wrap(i)) * 1.5, 0, 1)
  return { clipPath: c >= 1 ? 'none' : `circle(${(c * 72).toFixed(1)}% at 50% 50%)` }
}

export function MesaGiratoria() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const mesaRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const colorRefs = useRef<(HTMLDivElement | null)[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
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
    let raf = 0
    let shown = -1
    let spacing = 0
    let narrow = false
    // giro extra de cada plato al tocarlo: objetivo y valor actual (resorte con un poco de rebote)
    const spinTarget = new Float32Array(N)
    const spin = new Float32Array(N)
    const spinVel = new Float32Array(N)
    let announce = false

    // medidas en píxeles: borde de la mesa y tamaño del plato salen del CSS (los mismos que usa el HTML inicial)
    let W = 0
    let H = 0
    let mesaTop = 0
    let size = 0
    const measure = () => {
      narrow = innerWidth < 768
      const sticky = section.firstElementChild as HTMLElement
      W = sticky.clientWidth
      H = sticky.clientHeight
      mesaTop = mesaRef.current!.parentElement!.getBoundingClientRect().top - sticky.getBoundingClientRect().top
      const p = itemRefs.current[0]!
      size = p.offsetWidth
      // separación proporcional al plato (en pantallas bajas los platos se achican y se juntan)
      spacing = narrow ? innerWidth * 0.62 : Math.min(innerWidth * 0.27, size * 1.05, 430)
      mesa3d?.resize(W, H, size)
    }

    let mesa3d: Mesa3D | null = null
    let visible = true
    let t0 = performance.now()
    const poses: Pose[] = Array.from({ length: N }, () => ({ x: 0, y: 0, s: 1, d: 0, spin: 0 }))

    const render = () => {
      for (let i = 0; i < N; i++) {
        const d = wrap(i - current)
        const a = Math.abs(d)
        const x = d * spacing * (1 - 0.06 * Math.min(a, 3))
        const y = -Math.min(a, 3) * spacing * (narrow ? 0.12 : 0.07)
        const s = 1 - 0.3 * Math.min(a, 2.2)
        if (mesa3d) {
          const p = poses[i]
          p.x = W / 2 + x
          // el plato 3D se apoya sobre el borde de la mesa (el dibujo plano flota un poco más arriba)
          p.y = mesaTop + size * 0.06 + y
          p.s = s
          p.d = d
          p.spin = spin[i]
          continue
        }
        const el = itemRefs.current[i]!
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(GIRO[i] - d * 24 + spin[i]).toFixed(2)}deg) scale(${s.toFixed(3)})`
        el.style.opacity = String(clamp(3 - a, 0, 1))
        el.style.zIndex = String(10 - Math.round(a * 2))
        // se pinta como con lápiz: el color se abre desde el centro del plato
        const c = clamp(1.5 - a * 1.5, 0, 1)
        colorRefs.current[i]!.style.clipPath = c >= 1 ? 'none' : `circle(${(c * 72).toFixed(1)}% at 50% 50%)`
      }
      if (mesa3d) mesa3d.render(poses, (performance.now() - t0) / 1000)
      mesaRef.current!.style.transform = `rotate(${(-current * (360 / N)).toFixed(2)}deg)`
      const idx = mod(Math.round(current))
      if (idx !== shown) {
        shown = idx
        setFocus(idx)
        if (announce) setAviso(`${PLATOS[idx].name}, ${PLATOS[idx].note}`)
      }
    }

    const frame = () => {
      raf = 0
      const target = scrollPart + offset
      current = reduced ? target : current + (target - current) * 0.12
      if (Math.abs(target - current) < 1e-3) current = target
      let spinning = false
      for (let i = 0; i < N; i++) {
        if (reduced) {
          spin[i] = spinTarget[i]
          continue
        }
        spinVel[i] = (spinVel[i] + (spinTarget[i] - spin[i]) * 0.06) * 0.82
        spin[i] += spinVel[i]
        if (Math.abs(spinTarget[i] - spin[i]) < 0.05 && Math.abs(spinVel[i]) < 0.05) spin[i] = spinTarget[i]
        else spinning = true
      }
      render()
      // con los platos 3D el bucle sigue mientras la mesa está en pantalla: giran sobre su eje en reposo
      if (current !== target || spinning || (mesa3d && visible && !reduced)) raf = requestAnimationFrame(frame)
    }
    const invalidate = () => {
      if (!raf) raf = requestAnimationFrame(frame)
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

    // Arrastre horizontal: la mesa sigue al dedo y al soltar se acomoda en el plato más cercano.
    // Un toque sin arrastre hace girar el plato tocado (y lo trae al frente si estaba a un costado).
    let downX = 0
    let downY = 0
    let dragFrom = 0
    let lastX = 0
    let lastT = 0
    let velocity = 0
    let dragging = false
    let moved = false
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      dragging = true
      moved = false
      downX = lastX = e.clientX
      downY = e.clientY
      lastT = e.timeStamp
      dragFrom = offset
      velocity = 0
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      if (!moved) {
        if (Math.abs(e.clientX - downX) < 8) return
        // gesto vertical: es scroll, no arrastre
        if (Math.abs(e.clientY - downY) > Math.abs(e.clientX - downX)) {
          dragging = false
          return
        }
        moved = true
        stage.setPointerCapture(e.pointerId)
        stage.dataset.dragging = ''
        firstTouch()
      }
      offset = dragFrom - (e.clientX - downX) / spacing
      const dt = Math.max(e.timeStamp - lastT, 1)
      velocity = (lastX - e.clientX) / spacing / dt
      lastX = e.clientX
      lastT = e.timeStamp
      invalidate()
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      delete stage.dataset.dragging
      announce = true
      if (!moved) {
        let i: number
        let izquierda: boolean
        if (mesa3d) {
          const k = mesa3d.pick(e.clientX, e.clientY)
          if (k === null) return
          i = k
          izquierda = e.clientX < poses[k].x
        } else {
          const hit = (document.elementFromPoint(e.clientX, e.clientY) as Element | null)?.closest<HTMLElement>('.plato')
          if (!hit) return
          i = Number(hit.dataset.i)
          izquierda = e.clientX < hit.getBoundingClientRect().left + hit.offsetWidth / 2
        }
        spinTarget[i] += 360 * (izquierda ? -1 : 1)
        offset = Math.round(current + wrap(i - current)) - scrollPart
        firstTouch()
        invalidate()
        return
      }
      // inercia corta y encaje en el plato más cercano (el total, no solo el arrastre)
      const fling = clamp(velocity * 180, -3, 3)
      offset = Math.round(scrollPart + offset + fling) - scrollPart
      invalidate()
    }
    const onCancel = () => {
      dragging = false
      delete stage.dataset.dragging
    }
    nudgeRef.current = (step) => {
      announce = true
      offset = Math.round(scrollPart + offset) + step - scrollPart
      // un giro corto del plato que llega, como si lo acomodaran en la mesa
      spinTarget[mod(Math.round(scrollPart + offset))] += 40 * step
      firstTouch()
      invalidate()
    }

    measure()
    onScroll()
    current = scrollPart + offset
    render()
    const onResize = () => {
      measure()
      render()
      onScroll()
    }

    // el bucle 3D solo corre con la mesa en pantalla
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) invalidate()
    })
    io.observe(section)

    // three.js se baja después de pintar la página; los platos 3D "se sirven" sobre la mesa
    let cancelado = false
    import('./tres/mesa3d')
      .then(({ createMesa3D }) => {
        if (cancelado) return
        mesa3d = createMesa3D(canvasRef.current!, PLATOS.map((p) => p.id))
        measure()
        t0 = performance.now()
        stage.dataset.tresd = ''
        if (!reduced) {
          const orden = [...mesa3d.entradas.keys()].sort((a, b) => Math.abs(wrap(a - current)) - Math.abs(wrap(b - current)))
          orden.forEach((i, k) => {
            const e = mesa3d!.entradas[i]
            gsap.fromTo(e, { y: H * 0.22, s: 0.55 }, { y: 0, s: 1, duration: 1.15, delay: 0.05 + k * 0.08, ease: 'expo.out' })
          })
        }
        invalidate()
      })
      // sin WebGL quedan los platos dibujados del HTML
      .catch(() => delete stage.dataset.tresd)
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onResize)
    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onCancel)
    return () => {
      cancelado = true
      io.disconnect()
      mesa3d?.dispose()
      cancelAnimationFrame(raf)
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

        <canvas ref={canvasRef} className="mesa-lienzo" aria-hidden="true" />

        <div ref={stageRef} className="escenario" aria-hidden="true">
          {PLATOS.map(({ id, Dibujo }, i) => (
            <div key={id} ref={(el) => void (itemRefs.current[i] = el)} data-i={i} className="plato" style={posicionInicial(i)}>
              <div className="plato-trazo">
                <Dibujo />
              </div>
              <div ref={(el) => void (colorRefs.current[i] = el)} className="plato-color" style={colorInicial(i)}>
                <Dibujo />
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
              Tocá un plato o deslizá la mesa
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
