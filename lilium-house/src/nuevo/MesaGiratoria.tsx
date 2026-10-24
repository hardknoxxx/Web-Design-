import { useEffect, useRef, useState, type ComponentType } from 'react'
import { Monstera } from '../components/Botanica'
import { Hummingbird } from '../components/Flora'
import { ArrowIcon } from '../components/Icons'
import { CafePlato, CheesecakePlato, ChipaPlato, EnsaladaPlato, TePlato, TortaPlato, TostadoPlato } from '../components/Platos'
import { CARTA, SITE } from '../data/site'
import { useOpenStatus } from '../hooks/useOpenStatus'
import { Lirio } from './Lirio'

/*
 * La mesa giratoria (referencia: el carrusel de frascos de Agrumea Farm).
 * El scroll recorre el día sobre una mesa verde: los platos pasan de la mañana a la noche, sin dar la vuelta,
 * para que la posición del scroll sea siempre la hora. El arrastre y las flechas adelantan o atrasan; el
 * siguiente scroll los devuelve con suavidad al ritmo del día. Tocar un plato lo hace girar sobre la mesa.
 * Como en los manteles de Lilium, los platos esperan sin pintar (solo el trazo) y se colorean al pasar
 * frente a vos. Todo corre en un rAF a demanda que escribe estilos: sin re-render por cuadro.
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
const LAST = N - 1
// giro propio de cada plato, para que no queden todos alineados
const GIRO = [-14, 22, -6, 31, -24, 9, -18]
const RONDA = ['Café de especialidad', 'Chipa recién horneada', 'Pastelería', 'Plantas en cada rincón', 'Manteles para colorear', ''].join(' · ')

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export function MesaGiratoria() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const mesaRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const colorRefs = useRef<(HTMLDivElement | null)[]>([])
  const nudgeRef = useRef<(step: number) => void>(() => {})
  const [focus, setFocus] = useState(0)
  const [aviso, setAviso] = useState('')
  const [tocada, setTocada] = useState(false)
  const status = useOpenStatus()

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

    const measure = () => {
      narrow = innerWidth < 768
      spacing = narrow ? innerWidth * 0.6 : Math.min(innerWidth * 0.25, 400)
    }

    const render = () => {
      for (let i = 0; i < N; i++) {
        const d = i - current
        const a = Math.abs(d)
        const x = d * spacing * (1 - 0.06 * Math.min(a, 3))
        const y = -Math.min(a, 3) * spacing * (narrow ? 0.12 : 0.07)
        const s = 1 - 0.3 * Math.min(a, 2.2)
        const el = itemRefs.current[i]!
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(GIRO[i] - d * 24 + spin[i]).toFixed(2)}deg) scale(${s.toFixed(3)})`
        el.style.opacity = String(clamp(3 - a, 0, 1))
        el.style.zIndex = String(10 - Math.round(a * 2))
        // se pinta como con lápiz: el color se abre desde el centro del plato
        const c = clamp(1.5 - a * 1.5, 0, 1)
        colorRefs.current[i]!.style.clipPath = c >= 1 ? 'none' : `circle(${(c * 72).toFixed(1)}% at 50% 50%)`
      }
      mesaRef.current!.style.transform = `rotate(${(-current * (360 / N)).toFixed(2)}deg)`
      const idx = clamp(Math.round(current), 0, LAST)
      if (idx !== shown) {
        shown = idx
        setFocus(idx)
        if (announce) setAviso(`${PLATOS[idx].name}, ${PLATOS[idx].note}`)
      }
    }

    const frame = () => {
      raf = 0
      const target = clamp(scrollPart + offset, 0, LAST)
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
      if (current !== target || spinning) raf = requestAnimationFrame(frame)
    }
    const invalidate = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const firstTouch = () => setTocada(true)

    const onScroll = () => {
      const r = section.getBoundingClientRect()
      const run = r.height - innerHeight
      scrollPart = run > 0 ? clamp(-r.top / run, 0, 1) * LAST : 0
      // el scroll vuelve a mandar: lo que se adelantó con el dedo se acomoda de a poco a la hora del día
      offset = Math.abs(offset) < 0.02 ? 0 : offset * 0.85
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
        const hit = (document.elementFromPoint(e.clientX, e.clientY) as Element | null)?.closest<HTMLElement>('.plato')
        if (!hit) return
        const i = Number(hit.dataset.i)
        spinTarget[i] += 360 * (e.clientX < hit.getBoundingClientRect().left + hit.offsetWidth / 2 ? -1 : 1)
        offset = i - scrollPart
        firstTouch()
        invalidate()
        return
      }
      // inercia corta y encaje en el plato más cercano (el total, no solo el arrastre)
      const fling = clamp(velocity * 180, -2, 2)
      offset = clamp(Math.round(scrollPart + offset + fling), 0, LAST) - scrollPart
      invalidate()
    }
    const onCancel = () => {
      dragging = false
      delete stage.dataset.dragging
    }
    nudgeRef.current = (step) => {
      announce = true
      offset = clamp(Math.round(scrollPart + offset) + step, 0, LAST) - scrollPart
      // un giro corto del plato que llega, como si lo acomodaran en la mesa
      spinTarget[clamp(Math.round(scrollPart + offset), 0, LAST)] += 40 * step
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
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onResize)
    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onCancel)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onCancel)
    }
  }, [])

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
        <header className="relative z-30 grid grid-cols-[1fr_auto_1fr] items-start gap-1.5 px-3 pt-4 md:gap-2 md:px-7 md:pt-6">
          <a href="#visita" className="estado justify-self-start" data-open={status?.open ?? undefined}>
            <span aria-hidden="true" className="estado-punto" />
            {status ? (
              <span>
                <span className="font-semibold">{status.state}</span> <span className="max-[359px]:hidden">{status.detail}</span>
              </span>
            ) : (
              'Horario'
            )}
          </a>
          <a href="#visita" className="flex flex-col items-center text-laguna-deep" aria-label="Lilium Coffee Lounge, horario y dirección">
            <span className="font-script text-[2.1rem] leading-[0.9] md:text-[3.2rem]">Lilium</span>
            <span className="font-elegante text-[0.8rem] font-semibold tracking-[0.18em] uppercase max-md:hidden">Coffee Lounge</span>
          </a>
          <a href={SITE.mapsHref} target="_blank" rel="noopener" className="boton justify-self-end">
            Cómo llegar
          </a>
        </header>

        <h1 className="relative z-30 mx-auto mt-5 max-w-[17ch] px-4 text-center font-display text-[1.75rem] leading-[1.05] font-semibold text-balance text-laguna-deep md:mt-6 md:max-w-none md:text-[2.6rem]">
          Un café verde por dentro, <span className="md:block">en Puerto Iguazú</span>
        </h1>
        <p className="relative z-30 mx-auto mt-3 max-w-[30ch] px-4 text-center font-elegante text-base text-madera-soft md:mt-4 md:max-w-none md:text-lg">
          Desayunos, almuerzos y meriendas sobre Av. Tres Fronteras.
        </p>
        <p className="pista relative z-30" data-oculta={tocada || undefined} aria-hidden="true">
          Tocá un plato o deslizá la mesa
        </p>

        {/* lo verde de adentro: lirios y una monstera asoman detrás de la mesa, con un picaflor que visita la flor */}
        <div aria-hidden="true" className="pointer-events-none">
          <Monstera className="planta planta-monstera" />
          <Lirio className="planta planta-lirio-a" tilt={-8} bud />
          <Lirio className="planta planta-lirio-b" tilt={10} />
          <Hummingbird className="picaflor" />
        </div>

        {/* la mesa: un disco enorme que asoma desde abajo y gira con los platos */}
        <div aria-hidden="true" className="mesa-wrap">
          <div ref={mesaRef} className="mesa">
            <svg viewBox="-500 -500 1000 1000" className="h-full w-full">
              <circle r="500" className="fill-laguna-deep" />
              <path id="mesa-ronda" d="M0,-450a450,450 0 1,1 0,900a450,450 0 1,1 0,-900" fill="none" />
              <text className="mesa-texto">
                <textPath href="#mesa-ronda" textLength="2820" lengthAdjust="spacing">
                  {RONDA.toUpperCase()}
                  {RONDA.toUpperCase()}
                </textPath>
              </text>
            </svg>
          </div>
        </div>

        <div ref={stageRef} className="escenario" aria-hidden="true">
          {PLATOS.map(({ id, Dibujo }, i) => (
            <div key={id} ref={(el) => void (itemRefs.current[i] = el)} data-i={i} className="plato">
              <div className="plato-trazo">
                <Dibujo />
              </div>
              <div ref={(el) => void (colorRefs.current[i] = el)} className="plato-color">
                <Dibujo />
              </div>
            </div>
          ))}
        </div>

        <div className="pie-mesa">
          <button type="button" className="flecha" aria-label="Plato anterior" aria-disabled={focus === 0} onClick={() => nudgeRef.current(-1)}>
            <ArrowIcon className="h-5 w-5 rotate-180" />
          </button>
          <p className="min-w-0 flex-1 text-center">
            <span className="block font-display text-[1.9rem] leading-tight font-semibold text-balance text-crema md:text-[2.6rem]">{plato.name}</span>
            <span className="block font-hand text-[1.4rem] leading-tight text-menta">
              {plato.momento.toLowerCase()} · {plato.note}
            </span>
            <span className="mt-1 block text-[0.95rem] text-menta/85 max-md:hidden">{plato.desc}</span>
          </p>
          <button type="button" className="flecha" aria-label="Plato siguiente" aria-disabled={focus === LAST} onClick={() => nudgeRef.current(1)}>
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
