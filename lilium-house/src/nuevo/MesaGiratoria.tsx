import { useEffect, useRef, useState, type ComponentType } from 'react'
import { CafePlato, CheesecakePlato, ChipaPlato, EnsaladaPlato, TePlato, TortaPlato, TostadoPlato } from '../components/Platos'
import { CARTA, SITE } from '../data/site'
import { useOpenStatus } from '../hooks/useOpenStatus'

/*
 * La mesa giratoria (referencia: el carrusel de frascos de Agrumea Farm).
 * El scroll, el arrastre o las flechas hacen girar una mesa con los platos del día, de la mañana a la noche.
 * Como en los manteles de Lilium, los platos esperan sin pintar (solo el trazo) y se colorean al pasar
 * frente a vos. Todo corre en un rAF a demanda que escribe transform/opacity: sin re-render por cuadro.
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
    item.kind === 'plato' ? [{ id: item.id, name: item.name, note: item.note, momento: momento.label, Dibujo: DIBUJOS[item.id] }] : [],
  ),
)
const N = PLATOS.length
// giro propio de cada plato, para que no queden todos alineados
const GIRO = [-14, 22, -6, 31, -24, 9, -18]

const wrap = (d: number) => ((((d + N / 2) % N) + N) % N) - N / 2
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export function MesaGiratoria() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const mesaRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const colorRefs = useRef<(HTMLDivElement | null)[]>([])
  const nudgeRef = useRef<(step: number) => void>(() => {})
  const [focus, setFocus] = useState(0)
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

    const measure = () => {
      narrow = innerWidth < 768
      spacing = narrow ? innerWidth * 0.6 : Math.min(innerWidth * 0.25, 400)
    }

    const render = () => {
      for (let i = 0; i < N; i++) {
        const d = wrap(i - current)
        const a = Math.abs(d)
        const x = d * spacing * (1 - 0.06 * Math.min(a, 3))
        const y = -Math.min(a, 3) * spacing * (narrow ? 0.12 : 0.07)
        const s = 1 - 0.3 * Math.min(a, 2.2)
        const el = itemRefs.current[i]!
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(GIRO[i] - d * 24).toFixed(2)}deg) scale(${s.toFixed(3)})`
        el.style.opacity = String(clamp(3 - a, 0, 1))
        el.style.zIndex = String(10 - Math.round(a * 2))
        colorRefs.current[i]!.style.opacity = String(clamp(1.6 - a * 1.6, 0, 1))
      }
      mesaRef.current!.style.transform = `rotate(${(-current * (360 / N)).toFixed(2)}deg)`
      const idx = ((Math.round(current) % N) + N) % N
      if (idx !== shown) {
        shown = idx
        setFocus(idx)
      }
    }

    const frame = () => {
      raf = 0
      const target = scrollPart + offset
      current = reduced ? target : current + (target - current) * 0.12
      if (Math.abs(target - current) < 1e-3) current = target
      render()
      if (current !== target) raf = requestAnimationFrame(frame)
    }
    const invalidate = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const onScroll = () => {
      const r = section.getBoundingClientRect()
      const run = r.height - innerHeight
      scrollPart = run > 0 ? clamp(-r.top / run, 0, 1) * (N - 1) : 0
      invalidate()
    }

    // Arrastre horizontal: la mesa sigue al dedo y al soltar se acomoda en el plato más cercano.
    let dragX = 0
    let dragFrom = 0
    let lastX = 0
    let lastT = 0
    let velocity = 0
    let dragging = false
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as Element).closest('button, a')) return
      dragging = true
      dragX = lastX = e.clientX
      lastT = e.timeStamp
      dragFrom = offset
      velocity = 0
      stage.setPointerCapture(e.pointerId)
      stage.dataset.dragging = ''
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      offset = dragFrom - (e.clientX - dragX) / spacing
      const dt = Math.max(e.timeStamp - lastT, 1)
      velocity = (lastX - e.clientX) / spacing / dt
      lastX = e.clientX
      lastT = e.timeStamp
      invalidate()
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      delete stage.dataset.dragging
      // inercia corta y encaje en el plato más cercano (el total, no solo el arrastre)
      const fling = clamp(velocity * 180, -2, 2)
      offset = Math.round(scrollPart + offset + fling) - scrollPart
      invalidate()
    }
    nudgeRef.current = (step) => {
      offset = Math.round(scrollPart + offset) + step - scrollPart
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
    stage.addEventListener('pointercancel', onUp)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onUp)
    }
  }, [])

  const plato = PLATOS[focus]
  const estado = status ? `${status.state} ${status.detail}` : 'Martes a domingo'
  // SVG colapsa los espacios de los extremos: los separadores van con espacios duros para que la vuelta cierre pareja
  const ronda = ['Lilium Coffee Lounge', estado, SITE.address, 'Puerto Iguazú', 'Café de especialidad', ''].join('\u00a0·\u00a0')

  return (
    <section ref={sectionRef} id="mesa" aria-label="La mesa de Lilium" className="relative h-[360svh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-crema">
        <header className="relative z-30 grid grid-cols-[1fr_auto_1fr] items-start px-4 pt-4 md:px-7 md:pt-6">
          <p className="estado justify-self-start" data-open={status?.open ?? undefined}>
            <span aria-hidden="true" className="estado-punto" />
            {status ? (
              <>
                <span className="font-semibold">{status.state}</span> <span className="max-md:hidden">· {status.detail}</span>
              </>
            ) : (
              'Horario'
            )}
          </p>
          <a href="#visita" className="flex flex-col items-center text-laguna-deep" aria-label="Lilium Coffee Lounge">
            <span className="font-script text-[2.6rem] leading-[0.9] md:text-[3.2rem]">Lilium</span>
            <span className="font-elegante text-[0.8rem] font-semibold tracking-[0.18em] uppercase">Coffee Lounge</span>
          </a>
          <a href={SITE.mapsHref} target="_blank" rel="noopener" className="boton justify-self-end">
            Cómo llegar
          </a>
        </header>

        <h1 className="relative z-30 mx-auto mt-5 max-w-[18ch] px-4 text-center font-display text-[1.75rem] leading-[1.05] font-semibold text-laguna-deep md:mt-6 md:max-w-none md:text-[2.6rem]">
          Un café verde por dentro, <span className="md:block">en Puerto Iguazú</span>
        </h1>
        <p className="relative z-30 mx-auto mt-3 max-w-[30ch] px-4 text-center font-elegante text-base text-madera-soft md:mt-4 md:max-w-none md:text-lg">
          Desayunos, almuerzos y meriendas sobre Av. Tres Fronteras.
        </p>

        {/* la mesa: un disco enorme que asoma desde abajo y gira con los platos */}
        <div aria-hidden="true" className="mesa-wrap">
          <div ref={mesaRef} className="mesa">
            <svg viewBox="-500 -500 1000 1000" className="h-full w-full">
              <circle r="500" className="fill-laguna-deep" />
              <path id="mesa-ronda" d="M0,-436a436,436 0 1,1 0,872a436,436 0 1,1 0,-872" fill="none" />
              <text className="mesa-texto">
                <textPath href="#mesa-ronda" textLength="2735" lengthAdjust="spacing">
                  {ronda.toUpperCase()}
                </textPath>
              </text>
            </svg>
          </div>
        </div>

        <div ref={stageRef} className="escenario" aria-hidden="true">
          {PLATOS.map(({ id, Dibujo }, i) => (
            <div key={id} ref={(el) => void (itemRefs.current[i] = el)} className="plato">
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
          <button type="button" className="flecha" aria-label="Plato anterior" onClick={() => nudgeRef.current(-1)}>
            ←
          </button>
          <p aria-live="polite" className="min-w-0 flex-1 text-center">
            <span className="block font-elegante text-[0.8rem] font-semibold tracking-[0.18em] text-turquesa uppercase">{plato.momento}</span>
            <span className="block font-display text-[1.9rem] leading-tight font-semibold text-crema md:text-[2.6rem]">{plato.name}</span>
            <span className="block font-hand text-[1.4rem] leading-tight text-menta">{plato.note}</span>
          </p>
          <button type="button" className="flecha" aria-label="Plato siguiente" onClick={() => nudgeRef.current(1)}>
            →
          </button>
        </div>
      </div>
    </section>
  )
}
