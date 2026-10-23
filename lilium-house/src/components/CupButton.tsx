import { AnimatePresence, m, useSpring, useTransform } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'
import { WHATSAPP_OPTIONS, whatsappLink } from '../data/site'
import { useDay } from '../day/DayProvider'
import { CloseIcon, WhatsAppIcon } from './Icons'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Botón de WhatsApp: una rodaja de tronco (posavasos) con una taza vista desde arriba
 * que se va llenando de café a medida que avanza el día (scroll). Al tocarlo se abre
 * una comanda con mensajes listos.
 */

// contorno irregular de la corteza
const BARK = (() => {
  const pts = Array.from({ length: 36 }, (_, k) => {
    const a = (k / 36) * Math.PI * 2
    const r = 37 + Math.sin(k * 2.7) * 1.1 + Math.cos(k * 5.3) * 0.7
    return `${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`
  })
  return `M${pts.join('L')}Z`
})()
export function CupButton() {
  const { progress } = useDay()
  const level = useSpring(progress, { stiffness: 110, damping: 28 })
  // el café se va sirviendo con el día; al final aparece el latte art
  const coffee = useTransform(level, [0, 1], [0.12, 1])
  const latte = useTransform(level, [0.88, 0.98], [0, 1])
  const [open, setOpen] = useState(false)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
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
                <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-tierra uppercase">Comanda</p>
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
            <ul className="mt-2 font-ticket text-[0.95rem]">
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
                      <span className="font-hand text-xl text-tierra">{String(i + 1).padStart(2, '0')}</span>
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

      <m.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="comanda"
        aria-label="Escribinos por WhatsApp"
        whileTap={{ scale: 0.92 }}
        className="group relative h-[78px] w-[78px] transition-transform duration-500 ease-organic [filter:drop-shadow(0_10px_10px_rgb(0_0_0/0.38))] hover:-translate-y-0.5 hover:rotate-[14deg]"
      >
        {/* rodaja de tronco (posavasos) con la taza vista desde arriba */}
        <svg viewBox="-40 -40 80 80" className="h-full w-full" aria-hidden="true">
          <defs>
            <radialGradient id={`${uid}-wood`} cx="45%" cy="40%" r="65%">
              <stop offset="0" stopColor="#E0B98B" />
              <stop offset="1" stopColor="#B9865A" />
            </radialGradient>
          </defs>
          <path d={BARK} fill="#4C3425" />
          <circle r="33" fill="#8E5F3C" />
          <circle r="31.5" fill={`url(#${uid}-wood)`} />
          <g fill="none" stroke="#9A6A42" strokeWidth=".8" opacity=".75">
            {[27, 22.5, 18.5, 14.5, 10.5, 6.5, 3].map((r, i) => (
              <ellipse key={r} cx={i % 2 ? 0.8 : -0.6} cy={i % 2 ? -0.6 : 0.5} rx={r} ry={r * 0.96} />
            ))}
          </g>
          <path d="M3 -2L12 -10L16 -9L27 -16" fill="none" stroke="#6E4628" strokeWidth="1" strokeLinecap="round" />
          {/* taza */}
          <g transform="translate(-3 3)">
            <circle r="21" fill="#3D2314" opacity=".18" transform="translate(1.5 2)" />
            <circle r="20" fill="#FAF7F2" stroke="#3D2314" strokeOpacity=".35" strokeWidth=".8" />
            <rect x="14" y="-3.5" width="11" height="7" rx="3.5" fill="#FFFFFF" stroke="#3D2314" strokeWidth="1.2" />
            <circle r="15" fill="#FFFFFF" stroke="#3D2314" strokeWidth="1.3" />
            <circle r="15" fill="none" stroke="#00A896" strokeWidth="1.1" strokeDasharray="2 2.2" transform="scale(.9)" />
            <circle r="12.4" fill="#EFE6DA" />
            <m.circle r="12.4" fill="#6B3A1E" style={{ scale: coffee }} />
            <m.circle r="11.2" fill="none" stroke="#C08552" strokeWidth="1.3" style={{ scale: coffee, opacity: coffee }} />
            <m.path
              d="M0 7C-5 3-6-3 0-8C6-3 5 3 0 7ZM0 7V-6M0 1L-3-2M0 -2L3-4"
              fill="#F3E3C8"
              stroke="#E8D3B0"
              strokeWidth=".6"
              style={{ opacity: latte }}
            />
          </g>
        </svg>
        <span className="absolute -top-1 -right-1 grid h-7 w-7 place-items-center rounded-[4%_70%_4%_70%] bg-turquesa text-crema ring-2 ring-crema/80">
          <WhatsAppIcon className="h-3.5 w-3.5" />
        </span>
      </m.button>
    </div>
  )
}
