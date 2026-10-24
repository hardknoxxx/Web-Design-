import { m, useTransform } from 'framer-motion'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { SCENES, SITE } from '../data/site'
import { useDay } from '../day/DayProvider'
import { gsap } from '../lib/gsap'
import { HOJA, playSprite, spriteStyle } from '../lib/sprite'
import { LilyMark } from './Icons'

/** Dial sol/luna: gira 180° a lo largo del día. */
function SunMoon() {
  const { progress } = useDay()
  const rotate = useTransform(progress, [0, 1], [0, 180])
  return (
    <span className="relative block h-[11px] w-5 overflow-hidden border-b border-current/40" aria-hidden="true">
      <m.svg viewBox="-12 -12 24 24" className="absolute inset-0 h-5 w-5" style={{ rotate }}>
        <g transform="translate(0 -6)">
          <circle r="3.6" fill="#D9A441" />
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d="M0 -5.4V-6.8" stroke="#D9A441" strokeWidth="1.2" strokeLinecap="round" transform={`rotate(${i * 45})`} />
          ))}
        </g>
        <path d="M1.5 2.2a4 4 0 1 0 0 7.6 3.2 3.2 0 0 1 0-7.6Z" fill="#F3E3B8" transform="rotate(180 0 6)" />
      </m.svg>
    </span>
  )
}

const K = 0.5523 // manijas de bezier para un cuarto de círculo

type Shape = {
  x0: number; y0: number; x1: number; y1: number
  r: [number, number, number, number] // radios: arriba-izq, arriba-der, abajo-der, abajo-izq
  b: [number, number, number, number] // panza de cada borde hacia afuera: arriba, derecha, abajo, izquierda
}

/** Contorno orgánico de 8 tramos curvos: el mismo esqueleto sirve para la hoja y el panel. */
function shapePath({ x0, y0, x1, y1, r, b }: Shape) {
  const [tl, tr, br, bl] = r
  const f = (n: number) => n.toFixed(2)
  const edge = (ax: number, ay: number, bx: number, by: number, nx: number, ny: number, bulge: number) => {
    const o = bulge * 1.33
    return `C${f(ax + (bx - ax) / 3 + nx * o)} ${f(ay + (by - ay) / 3 + ny * o)} ${f(ax + ((bx - ax) * 2) / 3 + nx * o)} ${f(ay + ((by - ay) * 2) / 3 + ny * o)} ${f(bx)} ${f(by)}`
  }
  return [
    `M${f(x0 + tl)} ${f(y0)}`,
    edge(x0 + tl, y0, x1 - tr, y0, 0, -1, b[0]),
    `C${f(x1 - tr + tr * K)} ${f(y0)} ${f(x1)} ${f(y0 + tr - tr * K)} ${f(x1)} ${f(y0 + tr)}`,
    edge(x1, y0 + tr, x1, y1 - br, 1, 0, b[1]),
    `C${f(x1)} ${f(y1 - br + br * K)} ${f(x1 - br + br * K)} ${f(y1)} ${f(x1 - br)} ${f(y1)}`,
    edge(x1 - br, y1, x0 + bl, y1, 0, 1, b[2]),
    `C${f(x0 + bl - bl * K)} ${f(y1)} ${f(x0)} ${f(y1 - bl + bl * K)} ${f(x0)} ${f(y1 - bl)}`,
    edge(x0, y1 - bl, x0, y0 + tl, -1, 0, b[3]),
    `C${f(x0)} ${f(y0 + tl - tl * K)} ${f(x0 + tl - tl * K)} ${f(y0)} ${f(x0 + tl)} ${f(y0)}Z`,
  ].join('')
}

// hoja abierta: la misma hoja en grande, con la base firme donde está el botón (la X nunca
// se corta), lomos bien redondos y la punta marcada abajo a la izquierda
const openShape = (w: number, h: number): Shape => ({ x0: 0, y0: 0, x1: w, y1: h, r: [Math.min(104, w * 0.32), 8, Math.min(120, w * 0.36), 6], b: [7, 4, 9, 7] })


/**
 * Menú-hoja, como la hoja nueva de la referencia: brota enrollada desde el botón (pecíolo),
 * crece por la nervadura y se desenrolla hacia los dos lados. La animación está hecha con
 * Remotion (animaciones/HojaMenu) y se reproduce como sprite; su último cuadro es idéntico al
 * panel, que aparece encima con el contenido. Al cerrar, la misma película al revés.
 */
function LeafMenu() {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const sprite = useRef<HTMLSpanElement>(null)
  const first = useRef(true)

  // contorno de hoja fijo (se calcula una vez y al cambiar el tamaño)
  useEffect(() => {
    const el = panel.current!
    const set = () => {
      const d = `path('${shapePath(openShape(el.offsetWidth, el.offsetHeight))}')`
      el.style.clipPath = d
      el.style.setProperty('-webkit-clip-path', d)
      if (sprite.current) {
        sprite.current.style.width = `${el.offsetWidth}px`
        sprite.current.style.height = `${el.offsetHeight}px`
      }
    }
    set()
    gsap.set(el, { autoAlpha: 0 })
    gsap.set(sprite.current, { autoAlpha: 0 })
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = panel.current!
    const film = sprite.current!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const q = gsap.utils.selector(wrap)
    if (first.current) {
      first.current = false
      return
    }
    gsap.killTweensOf([el, film, q('[data-line]'), q('[data-bud]'), q('[data-nerve]')])
    const d = (v: number) => (reduce ? 0 : v)
    const tl = gsap.timeline({
      onStart: () => wrap.current?.setAttribute('data-moving', ''),
      onComplete: () => wrap.current?.removeAttribute('data-moving'),
    })
    if (open) {
      // la película: brota enrollada, crece y se desenrolla (20 cuadros)
      if (!reduce) tl.set(film, { autoAlpha: 1 }).add(playSprite(film, HOJA, 0, HOJA.frames - 1, 0.84), 0)
      tl.set(el, { autoAlpha: 1 }, d(0.84))
        .set(film, { autoAlpha: 0 }, d(0.86))
        .set(q('[data-nerve]'), { autoAlpha: 1 }, d(0.84))
        .to(q('[data-bud]'), { autoAlpha: 0, duration: d(0.25) }, d(0.35))
        .to(q('[data-line="a"]'), { y: 6, rotation: 45, duration: d(0.45), ease: 'power3.inOut' }, 0)
        .to(q('[data-line="b"]'), { autoAlpha: 0, duration: d(0.2) }, 0)
        .to(q('[data-line="c"]'), { y: -6, rotation: -45, width: 18, duration: d(0.45), ease: 'power3.inOut' }, 0)
      ;(gsap.utils.selector(el)('a')[0] as HTMLElement | undefined)?.focus({ preventScroll: true })
    } else {
      // las opciones se vuelven a colgar (transición CSS) y recién después la hoja se enrolla
      const t = d(0.36)
      if (!reduce) tl.set(film, { autoAlpha: 1 }, t).add(playSprite(film, HOJA, HOJA.frames - 1, 0, 0.6), t)
      tl.set(el, { autoAlpha: 0 }, t + 0.01)
        .set(q('[data-nerve]'), { autoAlpha: 0 }, t + 0.01)
        .to(q('[data-bud]'), { autoAlpha: 1, duration: d(0.25) }, t + d(0.34))
        .set(film, { autoAlpha: 0 }, t + d(0.62))
        .to(q('[data-line]'), { y: 0, rotation: 0, autoAlpha: 1, width: (i: number) => (i === 2 ? 12 : 18), duration: d(0.4), ease: 'power3.inOut' }, 0)
    }
  }, [open])

  // cerrar con Escape o tocando afuera
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <div ref={wrap} className="relative mt-1 h-11 w-11 [&:not([data-moving])]:[filter:drop-shadow(0_8px_14px_rgb(0_0_0/0.35))]">
      <nav
        ref={panel}
        id="menu-escenas"
        aria-label="Escenas"
        className="invisible absolute top-0 right-0 w-[min(86vw,340px)] bg-laguna text-crema [background-image:radial-gradient(120%_70%_at_100%_0%,rgb(100_188_176/0.45),transparent_62%),radial-gradient(90%_60%_at_0%_100%,rgb(65_85_33/0.35),transparent_70%)]"
      >
        {/* nervaduras de la hoja: la central va del pecíolo (botón) a la punta */}
        <svg data-nerve="" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-0" aria-hidden="true">
          <g fill="none" stroke="#FAF7F2" strokeLinecap="round">
            <path d="M97 3C74 26 44 58 3 97" strokeOpacity=".16" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
            <g strokeOpacity=".08" strokeWidth="1.2">
              {[18, 36, 54, 72].map((t) => {
                const x = 97 - t * 0.95
                const y = 3 + t * 0.95
                return (
                  <g key={t}>
                    <path d={`M${x} ${y}C${x - 14} ${y - 4} ${x - 26} ${y - 14} ${x - 30} ${y - 26}`} vectorEffect="non-scaling-stroke" />
                    <path d={`M${x} ${y}C${x + 4} ${y + 14} ${x + 14} ${y + 26} ${x + 26} ${y + 30}`} vectorEffect="non-scaling-stroke" />
                  </g>
                )
              })}
            </g>
          </g>
        </svg>
        <div inert={!open} data-open={open} className="relative pt-5 pr-10 pb-12 pl-10 [perspective:700px]">
          <p data-item="" className="hoja-item font-script text-3xl leading-none" style={{ '--i': 0 } as CSSProperties}>Lilium</p>
          <ul className="mt-5 border-t border-crema/15 [perspective:700px]">
            {SCENES.map((s, i) => (
              <li key={s.href} data-item="" className="hoja-item border-b border-crema/10" style={{ '--i': i + 1 } as CSSProperties}>
                <a
                  href={s.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-4 py-2.5 transition-colors hover:text-menta"
                >
                  <span className="w-12 shrink-0 font-ticket text-xs text-turquesa tabular-nums">{s.time}</span>
                  <span className="font-display text-2xl font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-1.5">
                    {s.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <dl data-item="" className="hoja-item mt-5 space-y-0.5 font-ticket text-xs text-crema/75" style={{ '--i': SCENES.length + 1 } as CSSProperties}>
            {SITE.hours.rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt>{k}</dt>
                <dd className="tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </nav>

      {/* la película de la hoja (sprite renderizado con Remotion) */}
      <span ref={sprite} aria-hidden="true" className="pointer-events-none invisible absolute top-0 right-0" style={spriteStyle(HOJA)} />

      <button
        type="button"
        className={`group absolute top-0 right-0 z-10 grid h-11 w-11 place-items-center ${open ? '' : 'transition-transform duration-300 hover:-rotate-6'}`}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        aria-controls="menu-escenas"
        onClick={() => setOpen((v) => !v)}
      >
        {/* la hoja cerrada (el brote): pecíolo arriba a la derecha, punta abajo a la izquierda */}
        <span
          data-bud=""
          className="absolute inset-0 rounded-[30px_3px_30px_3px] bg-laguna [background-image:radial-gradient(120%_90%_at_100%_0%,rgb(100_188_176/0.5),transparent_65%)]"
          aria-hidden="true"
        >
          <span className="absolute inset-[16%] rotate-45 border-t border-crema/25" />
        </span>
        <span className="relative flex h-4 w-[18px] flex-col items-end justify-between" aria-hidden="true">
          <span data-line="a" className="block h-[2px] w-[18px] rounded-full bg-crema" />
          <span data-line="b" className="block h-[2px] w-[18px] rounded-full bg-crema" />
          <span data-line="c" className="block h-[2px] w-[12px] rounded-full bg-crema" />
        </span>
      </button>
    </div>
  )
}

export function TopBar() {
  const { fg, time } = useDay()

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 sm:px-6"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <a href="#amanecer" className="pointer-events-auto flex items-center gap-1.5" aria-label="Lilium, ir al inicio">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-turquesa shadow-[0_4px_10px_-4px_rgb(23_63_59/0.6)]">
            <LilyMark className="h-7 w-7 text-white" />
          </span>
          <m.span className="font-script text-[1.9rem] leading-none" style={{ color: fg }}>
            Lilium
          </m.span>
        </a>
        <div className="pointer-events-auto flex items-start gap-2.5">
          {/* cartelito de madera colgado de dos hilos: la hora del día */}
          <div className="relative pt-3" aria-label="Hora del día en Lilium según tu recorrido">
            <span className="absolute top-0 left-3 h-3.5 w-px rotate-[8deg] bg-current/40" style={{ color: '#5E7A2A' }} />
            <span className="absolute top-0 right-3 h-3.5 w-px -rotate-[8deg] bg-current/40" style={{ color: '#5E7A2A' }} />
            <div className="wood-sign flex h-9 items-center gap-2 rounded-[10px_14px_9px_13px/12px_9px_14px_10px] px-3 text-sm font-semibold text-crema lining-nums tabular-nums">
              <span className="h-1.5 w-1.5 rounded-full bg-black/35 shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]" />
              <SunMoon />
              <m.span>{time}</m.span>
              <span className="h-1.5 w-1.5 rounded-full bg-black/35 shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]" />
            </div>
          </div>
          <LeafMenu />
        </div>
      </header>
    </>
  )
}
