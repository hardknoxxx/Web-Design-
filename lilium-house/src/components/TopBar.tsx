import { m, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { SCENES, SITE } from '../data/site'
import { useDay } from '../day/DayProvider'
import { gsap } from '../lib/gsap'
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

const LEAF = 44
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

// hoja cerrada: nace arriba a la derecha (pecíolo) y termina en punta abajo a la izquierda
const leafShape = (w: number): Shape => ({ x0: w - LEAF, y0: 0, x1: w, y1: LEAF, r: [30, 2, 30, 2], b: [1.5, 1.5, 1.5, 1.5] })
// hoja abierta: la misma hoja en grande, con la base firme donde está el botón (la X nunca
// se corta), lomos bien redondos y la punta marcada abajo a la izquierda
const openShape = (w: number, h: number): Shape => ({ x0: 0, y0: 0, x1: w, y1: h, r: [Math.min(104, w * 0.32), 8, Math.min(120, w * 0.36), 6], b: [7, 4, 9, 7] })

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Cada parte de la hoja crece a su ritmo: primero se estira hacia la izquierda, después cae,
 * las puntas se ablandan tarde y los bordes se ondulan en el medio del gesto (y vuelven).
 */
const GROW = {
  x0: { at: 0, len: 0.62, ease: 'power3.inOut' },
  y1: { at: 0.18, len: 0.82, ease: 'expo.inOut' },
  r: [
    { at: 0.3, len: 0.7, ease: 'power2.inOut' },
    { at: 0.05, len: 0.6, ease: 'power2.out' },
    { at: 0.45, len: 0.55, ease: 'power2.inOut' },
    { at: 0.2, len: 0.8, ease: 'power3.inOut' },
  ],
} as const
const WOBBLE: [number, number, number, number] = [10, 16, 26, 22]

function morphAt(w: number, h: number, t: number): string {
  const from = leafShape(w)
  const to = openShape(w, h)
  const step = (g: { at: number; len: number; ease: string }) => gsap.parseEase(g.ease)(clamp01((t - g.at) / g.len))
  const tx = step(GROW.x0)
  const ty = step(GROW.y1)
  const wave = Math.sin(Math.PI * t)
  return shapePath({
    x0: lerp(from.x0, to.x0, tx),
    y0: 0,
    x1: w,
    y1: lerp(from.y1, to.y1, ty),
    r: from.r.map((r, i) => lerp(r, to.r[i], step(GROW.r[i]))) as Shape['r'],
    b: from.b.map((b, i) => lerp(b, to.b[i], t) + WOBBLE[i] * wave * (i % 2 ? -0.6 : 1)) as Shape['b'],
  })
}

/**
 * Menú-hoja: la hoja y el panel son un solo elemento. El panel existe siempre, recortado
 * con un contorno orgánico (clip-path: path) que en la esquina dibuja la hoja; al tocarla
 * la hoja cambia de forma hasta volverse panel, y al cerrar vuelve a ser hoja.
 */
function LeafMenu() {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const morph = useRef({ t: 0 })
  const first = useRef(true)

  const paint = () => {
    const el = panel.current
    if (!el) return
    const d = `path('${morphAt(el.offsetWidth, el.offsetHeight, morph.current.t)}')`
    el.style.clipPath = d
    el.style.setProperty('-webkit-clip-path', d)
  }

  // estado inicial (y al cambiar el ancho de pantalla): la hoja en su esquina
  useEffect(() => {
    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(panel.current!)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = panel.current!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const q = gsap.utils.selector(el)
    if (first.current) {
      first.current = false
      return
    }
    gsap.killTweensOf([morph.current, q('[data-item]'), q('[data-line]'), q('[data-vein]'), q('[data-nerve]')])
    if (open) {
      const tl = gsap.timeline()
      tl.to(morph.current, { t: 1, duration: reduce ? 0 : 0.95, ease: 'none', onUpdate: paint })
        .to(q('[data-vein]'), { autoAlpha: 0, duration: reduce ? 0 : 0.2 }, 0)
        .to(q('[data-nerve]'), { autoAlpha: 1, duration: reduce ? 0 : 0.6, ease: 'power2.out' }, reduce ? 0 : 0.35)
        .to(q('[data-line="a"]'), { y: 6, rotation: 45, duration: reduce ? 0 : 0.45, ease: 'power3.inOut' }, 0)
        .to(q('[data-line="b"]'), { autoAlpha: 0, duration: reduce ? 0 : 0.2 }, 0)
        .to(q('[data-line="c"]'), { y: -6, rotation: -45, width: 18, duration: reduce ? 0 : 0.45, ease: 'power3.inOut' }, 0)
        .fromTo(q('[data-item]'), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: reduce ? 0 : 0.045, duration: reduce ? 0 : 0.5, ease: 'power3.out' }, reduce ? 0 : 0.42)
      ;(q('a')[0] as HTMLElement | undefined)?.focus({ preventScroll: true })
    } else {
      const tl = gsap.timeline()
      tl.to(q('[data-item]'), { autoAlpha: 0, y: 8, duration: reduce ? 0 : 0.18, stagger: -0.02, ease: 'power2.in' })
        .to(q('[data-nerve]'), { autoAlpha: 0, duration: reduce ? 0 : 0.2 }, 0)
        .to(morph.current, { t: 0, duration: reduce ? 0 : 0.8, ease: 'none', onUpdate: paint }, reduce ? 0 : 0.1)
        .to(q('[data-vein]'), { autoAlpha: 1, duration: reduce ? 0 : 0.2 }, '>-0.15')
        .to(q('[data-line]'), { y: 0, rotation: 0, autoAlpha: 1, width: (i: number) => (i === 2 ? 12 : 18), duration: reduce ? 0 : 0.4, ease: 'power3.inOut' }, 0)
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
    <div ref={wrap} className="relative mt-1 h-11 w-11 [filter:drop-shadow(0_8px_14px_rgb(0_0_0/0.35))]">
      <nav
        ref={panel}
        id="menu-escenas"
        aria-label="Escenas"
        className={`absolute top-0 right-0 w-[min(86vw,340px)] bg-laguna text-crema [background-image:radial-gradient(120%_70%_at_100%_0%,rgb(100_188_176/0.45),transparent_62%),radial-gradient(90%_60%_at_0%_100%,rgb(65_85_33/0.35),transparent_70%)] ${
          open ? '' : 'transition-transform duration-300 hover:-rotate-6'
        }`}
        style={{ clipPath: 'inset(0 0 100% 100%)', transformOrigin: '100% 0%' }}
      >
        <button
          type="button"
          className="absolute top-0 right-0 z-10 grid h-11 w-11 place-items-center"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="menu-escenas"
          onClick={() => setOpen((v) => !v)}
        >
          <span data-vein="" className="absolute inset-[16%] -rotate-45 border-t border-crema/25" aria-hidden="true" />
          <span className="relative flex h-4 w-[18px] flex-col items-end justify-between" aria-hidden="true">
            <span data-line="a" className="block h-[2px] w-[18px] rounded-full bg-crema" />
            <span data-line="b" className="block h-[2px] w-[18px] rounded-full bg-crema" />
            <span data-line="c" className="block h-[2px] w-[12px] rounded-full bg-crema" />
          </span>
        </button>

        {/* nervaduras de la hoja: la central va del pecíolo (botón) a la punta */}
        <svg data-nerve="" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-0" aria-hidden="true">
          <g fill="none" stroke="#FAF7F2" strokeLinecap="round" vectorEffect="non-scaling-stroke">
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

        <div inert={!open} className="relative pt-5 pr-10 pb-12 pl-10">
          <p data-item="" className="font-script text-3xl leading-none">Lilium</p>
          <ul className="mt-5 border-t border-crema/15">
            {SCENES.map((s) => (
              <li key={s.href} data-item="" className="border-b border-crema/10">
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
          <dl data-item="" className="mt-5 space-y-0.5 font-ticket text-xs text-crema/75">
            {SITE.hours.rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt>{k}</dt>
                <dd className="tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </nav>
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
