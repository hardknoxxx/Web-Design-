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
const leafClip = (w: number, h: number) => `inset(0px 0px ${h - LEAF}px ${w - LEAF}px round 3px 31px 3px 31px)`
const openClip = 'inset(0px 0px 0px 0px round 26px 26px 26px 26px)'

/**
 * Menú-hoja: la hoja y el panel son un solo elemento. El panel existe siempre, recortado
 * con clip-path a la forma de la hoja en su esquina; al tocarla se despliega en el lugar.
 */
function LeafMenu() {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const first = useRef(true)

  // estado inicial: recortado a la hoja
  useEffect(() => {
    const el = panel.current!
    gsap.set(el, { clipPath: leafClip(el.offsetWidth, el.offsetHeight) })
  }, [])

  useEffect(() => {
    const el = panel.current!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const q = gsap.utils.selector(el)
    if (first.current) {
      first.current = false
      return
    }
    const w = el.offsetWidth
    const h = el.offsetHeight
    gsap.killTweensOf([el, q('[data-item]'), q('[data-line]'), q('[data-vein]')])
    if (open) {
      const tl = gsap.timeline({ defaults: { duration: reduce ? 0 : 0.7, ease: 'expo.inOut' } })
      tl.fromTo(el, { clipPath: leafClip(w, h) }, { clipPath: openClip })
        .to(q('[data-vein]'), { autoAlpha: 0, duration: reduce ? 0 : 0.2 }, 0)
        .to(q('[data-line="a"]'), { y: 6, rotation: 45, duration: reduce ? 0 : 0.45, ease: 'power3.inOut' }, 0)
        .to(q('[data-line="b"]'), { autoAlpha: 0, duration: reduce ? 0 : 0.2 }, 0)
        .to(q('[data-line="c"]'), { y: -6, rotation: -45, width: 18, duration: reduce ? 0 : 0.45, ease: 'power3.inOut' }, 0)
        .fromTo(q('[data-item]'), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: reduce ? 0 : 0.045, duration: reduce ? 0 : 0.5, ease: 'power3.out' }, reduce ? 0 : 0.32)
      ;(q('a')[0] as HTMLElement | undefined)?.focus({ preventScroll: true })
    } else {
      const tl = gsap.timeline({ defaults: { duration: reduce ? 0 : 0.55, ease: 'expo.inOut' } })
      tl.to(q('[data-item]'), { autoAlpha: 0, y: 8, duration: reduce ? 0 : 0.18, stagger: -0.02, ease: 'power2.in' })
        .to(el, { clipPath: leafClip(w, h) }, reduce ? 0 : 0.08)
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
        className={`absolute top-0 right-0 w-[min(86vw,340px)] bg-[#2F4A22] text-crema [background-image:radial-gradient(120%_80%_at_100%_0%,rgb(151_173_61/0.28),transparent_60%)] ${
          open ? '' : 'transition-transform duration-300 hover:-rotate-6'
        }`}
        style={{ clipPath: 'inset(0px 0px 100% 100% round 3px 31px 3px 31px)', transformOrigin: '100% 0%' }}
      >
        <button
          type="button"
          className="absolute top-0 right-0 z-10 grid h-11 w-11 place-items-center"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="menu-escenas"
          onClick={() => setOpen((v) => !v)}
        >
          <span data-vein="" className="absolute inset-[16%] rotate-45 border-t border-crema/25" aria-hidden="true" />
          <span className="relative flex h-4 w-[18px] flex-col items-end justify-between" aria-hidden="true">
            <span data-line="a" className="block h-[2px] w-[18px] rounded-full bg-crema" />
            <span data-line="b" className="block h-[2px] w-[18px] rounded-full bg-crema" />
            <span data-line="c" className="block h-[2px] w-[12px] rounded-full bg-crema" />
          </span>
        </button>

        <div inert={!open} className="px-6 pt-4 pb-6">
          <p data-item="" className="font-script text-3xl leading-none">Lilium</p>
          <ul className="mt-5 border-t border-crema/15">
            {SCENES.map((s) => (
              <li key={s.href} data-item="" className="border-b border-crema/10">
                <a
                  href={s.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-4 py-2.5 transition-colors hover:text-helecho"
                >
                  <span className="w-12 shrink-0 font-ticket text-xs text-helecho tabular-nums">{s.time}</span>
                  <span className="font-display text-2xl font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-1.5">
                    {s.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p data-item="" className="mt-5 font-ticket text-xs leading-relaxed text-crema/70">
            {SITE.hours.days} · {SITE.hours.slots.join(' / ')}
          </p>
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
          <LilyMark className="h-9 w-9 text-tierra" />
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
