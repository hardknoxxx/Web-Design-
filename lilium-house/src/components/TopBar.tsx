import { AnimatePresence, m, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { SCENES } from '../data/site'
import { useDay } from '../day/DayProvider'
import { Leaf, Monstera } from './Botanica'
import { CloseIcon, LilyMark, MenuIcon } from './Icons'

const EASE = [0.22, 1, 0.36, 1] as const

/** Dial sol/luna: gira 180° a lo largo del día. */
function SunMoon() {
  const { progress } = useDay()
  const rotate = useTransform(progress, [0, 1], [0, 180])
  return (
    <span className="relative block h-[11px] w-5 overflow-hidden border-b border-current/40" aria-hidden="true">
      <m.svg viewBox="-12 -12 24 24" className="absolute inset-0 h-5 w-5" style={{ rotate }}>
        <g transform="translate(0 -6)">
          <circle r="3.6" fill="#E9B44C" />
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d="M0 -5.4V-6.8" stroke="#E9B44C" strokeWidth="1.2" strokeLinecap="round" transform={`rotate(${i * 45})`} />
          ))}
        </g>
        <path d="M1.5 2.2a4 4 0 1 0 0 7.6 3.2 3.2 0 0 1 0-7.6Z" fill="#F3E3B8" transform="rotate(180 0 6)" />
      </m.svg>
    </span>
  )
}

export function TopBar() {
  const { fg, time } = useDay()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 sm:px-6"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <a href="#amanecer" className="pointer-events-auto flex items-center gap-1.5" aria-label="Lilium, ir al inicio">
          <LilyMark className="h-9 w-9 text-rosa" />
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
          {/* menú: una hoja */}
          <button
            type="button"
            className="group relative mt-1 grid h-11 w-11 place-items-center rounded-[4%_70%_4%_70%] bg-hoja-monet text-hierro shadow-[0_6px_14px_-6px_rgb(0_0_0/0.5)] ring-1 ring-hierro/15 transition-transform duration-300 hover:-rotate-12"
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="menu-escenas"
            onClick={() => setOpen(true)}
          >
            <span className="absolute inset-[18%] rotate-45 border-t border-hierro/20" aria-hidden="true" />
            <MenuIcon className="relative h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <m.nav
            id="menu-escenas"
            aria-label="Escenas"
            className="fixed inset-0 z-[60] overflow-hidden bg-musgo text-crema"
            initial={{ clipPath: 'circle(0% at 92% 4%)' }}
            animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Monstera className="absolute -bottom-10 -left-16 w-80 -rotate-12 opacity-60" color="#2C3A14" />
            <Monstera className="absolute -right-20 -bottom-16 w-96 rotate-[20deg] opacity-40" color="#5E7A2A" />
            <Leaf className="absolute top-24 right-10 w-16 rotate-45" color="#97AD3D" />
            <div className="relative flex h-full flex-col px-7 pt-6 pb-10">
              <div className="flex items-center justify-between">
                <span className="font-script text-3xl">Lilium</span>
                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center rounded-full border border-crema/30"
                  aria-label="Cerrar menú"
                  onClick={() => setOpen(false)}
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <ul className="mt-12 space-y-1">
                {SCENES.map((s, i) => (
                  <m.li
                    key={s.href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}
                  >
                    <a
                      href={s.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-4 py-2 font-display text-4xl sm:text-5xl"
                    >
                      <span className="w-16 font-hand text-2xl text-helecho">{s.time}</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-2">{s.label}</span>
                    </a>
                  </m.li>
                ))}
              </ul>
            </div>
          </m.nav>
        )}
      </AnimatePresence>
    </>
  )
}
