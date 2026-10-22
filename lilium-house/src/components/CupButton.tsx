import { AnimatePresence, m, useSpring, useTransform } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'
import { WHATSAPP_OPTIONS, whatsappLink } from '../data/site'
import { useDay } from '../day/DayProvider'
import { CloseIcon, WhatsAppIcon } from './Icons'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Botón de WhatsApp con forma de taza: se va llenando de café a medida que avanza
 * el día (scroll). Al tocarlo se abre una comanda con mensajes listos.
 */
export function CupButton() {
  const { progress } = useDay()
  const level = useSpring(progress, { stiffness: 110, damping: 28 })
  const coffeeY = useTransform(level, [0, 1], [23, 2])
  const labelOpacity = useTransform(progress, [0.9, 0.97], [0, 1])
  const labelX = useTransform(labelOpacity, [0, 1], [10, 0])
  const [open, setOpen] = useState(false)
  const clip = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <div
      ref={panelRef}
      className="fixed right-4 z-50 flex flex-col items-end gap-3 sm:right-6"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <AnimatePresence>
        {open && (
          <m.div
            id="comanda"
            role="dialog"
            aria-label="Escribinos por WhatsApp"
            initial={{ opacity: 0, y: 16, rotate: 4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5, scale: 1 }}
            exit={{ opacity: 0, y: 12, rotate: 3, scale: 0.94 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ transformOrigin: '90% 100%' }}
            className="w-[min(18rem,calc(100vw-2rem))] rounded-[4px] bg-[#FFFDF9] p-5 text-madera shadow-[0_24px_50px_-18px_rgb(0_0_0/0.45)] [background-image:repeating-linear-gradient(transparent_0_27px,rgb(0_168_150/0.12)_27px_28px)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-dashed border-madera/25 pb-3">
              <div>
                <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-rosa uppercase">Comanda</p>
                <p className="font-hand text-3xl leading-none">¿Qué se te antoja?</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-madera/10"
                aria-label="Cerrar"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-2">
              {WHATSAPP_OPTIONS.map((o, i) => (
                <m.li
                  key={o.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.05, ease: EASE }}
                >
                  <a
                    href={whatsappLink(o.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 font-medium transition-colors hover:bg-turquesa/10"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="font-hand text-xl text-rosa">{String(i + 1).padStart(2, '0')}</span>
                      {o.label}
                    </span>
                    <WhatsAppIcon className="h-4 w-4 text-turquesa-dark opacity-60 transition-opacity group-hover:opacity-100" />
                  </a>
                </m.li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <m.span
          aria-hidden="true"
          style={{ opacity: labelOpacity, x: labelX }}
          className="pointer-events-none rounded-full bg-crema px-4 py-2 text-sm font-semibold text-madera shadow-lg"
        >
          Pedí por WhatsApp
        </m.span>
        <m.button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="comanda"
          aria-label="Escribinos por WhatsApp"
          whileTap={{ scale: 0.92 }}
          className="group relative grid h-16 w-16 place-items-center rounded-full bg-turquesa shadow-[0_14px_30px_-10px_rgb(0_0_0/0.45)] transition-transform duration-300 hover:-rotate-6"
        >
          <svg viewBox="-32 -32 64 64" className="h-16 w-16" aria-hidden="true">
            <defs>
              <clipPath id={clip}>
                <path d="M-13 -8H13V7C13 14 7 16 0 16C-7 16-13 14-13 7Z" />
              </clipPath>
            </defs>
            {/* hojita de la casa */}
            <path d="M-27 -12C-36 -30 -16 -36 -10 -25C-16 -22 -22 -18 -27 -12Z" fill="#415521" />
            {/* vapor al pasar el mouse */}
            <g className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none">
              <path className="animate-steam [transform-box:fill-box]" d="M-5 -13C-8 -17 -2 -19 -5 -24" />
              <path className="animate-steam [animation-delay:.4s] [transform-box:fill-box]" d="M4 -13C1 -17 7 -19 4 -24" />
            </g>
            <g clipPath={`url(#${clip})`}>
              <m.rect x="-13" y="-8" width="26" height="26" fill="#6B3A1E" style={{ y: coffeeY }} />
            </g>
            <path d="M-13 -8H13V7C13 14 7 16 0 16C-7 16-13 14-13 7Z" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M13 -3C21 -3 21 9 13 9" fill="none" stroke="#fff" strokeWidth="2.6" />
            <path d="M-18 19H18" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full bg-crema shadow">
            <WhatsAppIcon className="h-3.5 w-3.5 text-turquesa-dark" />
          </span>
        </m.button>
      </div>
    </div>
  )
}
