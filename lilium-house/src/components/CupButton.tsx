import { AnimatePresence, m, useSpring, useTransform } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'
import { WHATSAPP_OPTIONS, whatsappLink } from '../data/site'
import { useDay } from '../day/DayProvider'
import { CloseIcon, WhatsAppIcon } from './Icons'

const EASE = [0.22, 1, 0.36, 1] as const
const INK = '#3D2314'

/**
 * Botón de WhatsApp: la esquina de una mesa de madera asoma en la pantalla y sobre ella
 * hay una taza vista desde la silla (~55°). El café se va sirviendo con el día (scroll).
 * Al tocarla, la taza se corre con un tintineo y desde abajo del plato sale la comanda,
 * que se despliega como un papel doblado.
 */
export function CupButton() {
  const { progress } = useDay()
  const level = useSpring(progress, { stiffness: 110, damping: 28 })
  // el café sube dentro de la taza: la superficie se agranda y se acerca al borde
  const coffeeY = useTransform(level, [0, 1], [5, -1.5])
  const coffeeS = useTransform(level, [0, 1], [0.78, 1])
  const latte = useTransform(level, [0.86, 0.98], [0, 1])
  const [open, setOpen] = useState(false)
  const [bump, setBump] = useState(0)
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

  const toggle = () => {
    setOpen((v) => !v)
    setBump((n) => n + 1)
  }

  return (
    <div ref={panelRef} className="pointer-events-none fixed right-0 bottom-0 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <m.div
            id="comanda"
            role="dialog"
            aria-label="Escribinos por WhatsApp"
            initial={{ opacity: 0, y: 70, x: 10, rotate: 9, scale: 0.55 }}
            animate={{ opacity: 1, y: 0, x: 0, rotate: -2, scale: 1 }}
            exit={{ opacity: 0, y: 60, x: 6, rotate: 7, scale: 0.6, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', stiffness: 170, damping: 19, mass: 0.9 }}
            style={{ transformOrigin: '82% 100%', perspective: 900 }}
            className="pointer-events-auto relative mr-4 -mb-6 w-[min(18rem,calc(100vw-2rem))] sm:mr-8"
          >
            <div className="relative rounded-[3px] bg-[#FFFDF9] p-5 pb-8 text-madera shadow-[0_24px_50px_-18px_rgb(0_0_0/0.5)] [background-image:repeating-linear-gradient(transparent_0_27px,rgb(100_188_176/0.14)_27px_28px)] [transform-style:preserve-3d]">
              {/* pliegue del medio: se ve marcado al abrir y se va aplanando */}
              <m.span
                aria-hidden="true"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0.25 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="pointer-events-none absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 bg-[linear-gradient(to_bottom,transparent,rgb(61_35_20/0.1)_48%,rgb(255_255_255/0.7)_52%,transparent)]"
              />
              {/* solapa doblada: gira sobre el pliegue y desaparece al quedar abierta */}
              <m.span
                aria-hidden="true"
                initial={{ rotateX: 0 }}
                animate={{ rotateX: -180 }}
                transition={{ delay: 0.12, duration: 0.7, ease: EASE }}
                style={{ transformOrigin: '50% 100%', backfaceVisibility: 'hidden' }}
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/2 rounded-t-[3px] bg-[#F3EBDD] shadow-[0_6px_10px_-6px_rgb(0_0_0/0.35)]"
              />
              <div className="flex items-start justify-between gap-3 border-b border-dashed border-madera/25 pb-3">
                <div>
                  <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-turquesa-dark uppercase">Comanda</p>
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
                    initial={{ opacity: 0, x: -8, clipPath: 'inset(0 100% 0 0)' }}
                    animate={{ opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }}
                    transition={{ delay: 0.45 + i * 0.09, duration: 0.45, ease: EASE }}
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
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* esquina de la mesa */}
      <div className="relative h-[124px] w-[150px] sm:h-[150px] sm:w-[184px]">
        <svg viewBox="0 0 160 136" className="absolute inset-0 h-full w-full [filter:drop-shadow(-6px_-6px_10px_rgb(0_0_0/0.35))]" aria-hidden="true">
          <defs>
            <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8A6244" />
              <stop offset=".55" stopColor="#6B4A33" />
              <stop offset="1" stopColor="#4E3322" />
            </linearGradient>
            <clipPath id={`${uid}-top`}>
              <path d="M160 6C112 8 58 30 30 72C17 92 12 114 12 136H160Z" />
            </clipPath>
          </defs>
          <path d="M160 6C112 8 58 30 30 72C17 92 12 114 12 136H160Z" fill={`url(#${uid}-wood)`} />
          {/* vetas que siguen la curva del canto */}
          <g clipPath={`url(#${uid}-top)`} fill="none" strokeLinecap="round">
            {[10, 22, 34, 48, 62, 78, 96, 116].map((o, i) => (
              <path
                key={o}
                d={`M${170} ${6 + o}C${118 + o * 0.3} ${8 + o} ${66 + o * 0.6} ${30 + o * 0.8} ${38 + o * 0.7} ${72 + o * 0.6}C${26 + o * 0.7} ${92 + o * 0.5} ${22 + o * 0.8} ${114 + o * 0.3} ${22 + o * 0.8} 150`}
                stroke={i % 3 === 0 ? '#3D2314' : '#A57A55'}
                strokeOpacity={i % 3 === 0 ? 0.35 : 0.22}
                strokeWidth={i % 2 ? 1 : 1.6}
              />
            ))}
            <ellipse cx="118" cy="104" rx="7" ry="3.2" fill="#3D2314" fillOpacity=".4" transform="rotate(-38 118 104)" />
            <ellipse cx="118" cy="104" rx="11" ry="5.5" fill="none" stroke="#3D2314" strokeOpacity=".25" transform="rotate(-38 118 104)" />
          </g>
          {/* canto biselado */}
          <path d="M160 6C112 8 58 30 30 72C17 92 12 114 12 136" fill="none" stroke="#C99A68" strokeWidth="2.4" />
          <path d="M160 10C114 12 62 33 34 74C22 93 17 114 17 136" fill="none" stroke="#2E1E12" strokeOpacity=".35" strokeWidth="1.2" />
        </svg>

        <m.button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="comanda"
          aria-label="Escribinos por WhatsApp"
          whileTap={{ scale: 0.94 }}
          className="pointer-events-auto absolute right-2 bottom-[max(0.4rem,env(safe-area-inset-bottom))] h-[92px] w-[104px] sm:right-4 sm:h-[110px] sm:w-[124px]"
        >
          <m.svg
            key={bump}
            viewBox="-52 -56 104 92"
            className="h-full w-full overflow-visible"
            aria-hidden="true"
            initial={bump ? { rotate: 0, x: 0, y: 0 } : false}
            animate={bump ? { rotate: [0, -9, 5, -2, 0], x: [0, -6, -3, -4, open ? -4 : 0], y: [0, -5, 0, -1, 0] } : undefined}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <defs>
              <linearGradient id={`${uid}-cup`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#FFFFFF" />
                <stop offset=".6" stopColor="#F6F1E8" />
                <stop offset="1" stopColor="#D9CFC0" />
              </linearGradient>
              <radialGradient id={`${uid}-coffee`} cx="40%" cy="40%" r="70%">
                <stop offset="0" stopColor="#7A4526" />
                <stop offset="1" stopColor="#4E2A14" />
              </radialGradient>
              <clipPath id={`${uid}-rim`}>
                <ellipse cx="0" cy="-6" rx="21.5" ry="8.4" />
              </clipPath>
            </defs>
            {/* plato */}
            <ellipse cx="3" cy="25" rx="42" ry="15" fill="#000" opacity=".25" />
            <ellipse cx="0" cy="21" rx="41" ry="15.5" fill="#F7F2EA" stroke={INK} strokeOpacity=".35" />
            <ellipse cx="0" cy="20" rx="29" ry="10.5" fill="#EFE6DA" />
            {/* cucharita apoyada en el plato */}
            <path d="M-34 27L-14 19" stroke="#B8A27E" strokeWidth="2.4" strokeLinecap="round" />
            <ellipse cx="-37" cy="28.4" rx="4.4" ry="2.6" fill="#B8A27E" transform="rotate(-20 -37 28.4)" />
            {/* sombra de la taza */}
            <ellipse cx="3" cy="19" rx="19" ry="6.5" fill={INK} opacity=".2" />
            {/* asa */}
            <path d="M22-2C36-5 37 12 20 11" fill="none" stroke={INK} strokeOpacity=".5" strokeWidth="6.4" strokeLinecap="round" />
            <path d="M22-2C36-5 37 12 20 11" fill="none" stroke="#FFFFFF" strokeWidth="4.2" strokeLinecap="round" />
            {/* cuerpo */}
            <path d="M-24-6C-24 7-20 15-15 17.5Q0 23.5 15 17.5C20 15 24 7 24-6Z" fill={`url(#${uid}-cup)`} stroke={INK} strokeOpacity=".45" />
            <path d="M-23.4 2.4Q0 11.5 23.4 2.4" fill="none" stroke="#64BCB0" strokeWidth="3" />
            {/* borde y café */}
            <ellipse cx="0" cy="-6" rx="24" ry="9.6" fill="#FFFFFF" stroke={INK} strokeOpacity=".5" />
            <ellipse cx="0" cy="-6" rx="21.5" ry="8.4" fill="#EFE6DA" />
            <g clipPath={`url(#${uid}-rim)`}>
              <m.g style={{ y: coffeeY, scale: coffeeS }}>
                <m.g
                  initial={false}
                  animate={bump ? { scaleX: [1, 1.06, 0.97, 1.02, 1], rotate: [0, 4, -3, 1, 0] } : undefined}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                >
                  <ellipse cx="0" cy="-6" rx="21.5" ry="8.4" fill={`url(#${uid}-coffee)`} />
                  <ellipse cx="0" cy="-6" rx="19.6" ry="7.5" fill="none" stroke="#C08552" strokeWidth="1.3" opacity=".9" />
                  <m.path
                    d="M0-1.5C-6-3.5-7-7.5 0-10.5C7-7.5 6-3.5 0-1.5ZM0-2V-10M0-4L-3-5.6M0-6.2L3-7.6"
                    fill="#F3E3C8"
                    stroke="#E8D3B0"
                    strokeWidth=".6"
                    style={{ opacity: latte }}
                  />
                </m.g>
              </m.g>
            </g>
            {/* vapor */}
            <g fill="none" stroke="#FAF7F2" strokeOpacity=".7" strokeWidth="1.8" strokeLinecap="round" className="animate-steam [transform-box:fill-box]">
              <path d="M-8-16C-12-24-4-28-8-36" />
              <path d="M2-18C-2-28 7-32 2-44" />
              <path d="M11-16C7-23 14-27 11-34" />
            </g>
          </m.svg>
          {/* etiqueta de WhatsApp, como un sello sobre la mesa */}
          <span className="absolute -top-2 -left-3 grid h-7 w-7 -rotate-12 place-items-center rounded-[4%_70%_4%_70%] bg-turquesa text-crema shadow-[0_4px_8px_-3px_rgb(0_0_0/0.5)] ring-2 ring-crema/80">
            <WhatsAppIcon className="h-3.5 w-3.5" />
          </span>
        </m.button>
      </div>
    </div>
  )
}
