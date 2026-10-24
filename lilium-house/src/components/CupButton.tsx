import { m, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'
import { WHATSAPP_OPTIONS, whatsappLink } from '../data/site'
import { useDay } from '../day/DayProvider'
import { CloseIcon, WhatsAppIcon } from './Icons'
import { TablaMadera } from './TablaMadera'

const EASE = [0.22, 1, 0.36, 1] as const
const INK = '#3D2314'

/**
 * Botón de WhatsApp: ramas rústicas que nacen de los bordes se cruzan como un nido y en
 * el cruce se apoya una taza vista desde la silla (~55°). El café se va sirviendo con el día (scroll).
 * Al tocarla, la taza se corre con un tintineo y desde abajo del plato sale la comanda,
 * que se despliega como un papel doblado.
 */
export function CupButton() {
  const { progress } = useDay()
  const level = useSpring(progress, { stiffness: 110, damping: 28 })
  // el globo de mensaje se mece con la velocidad del scroll y vuelve con un resorte
  const { scrollY } = useScroll()
  const speed = useVelocity(scrollY)
  const sway = useSpring(useTransform(speed, [-2500, 0, 2500], [-16, 0, 16], { clamp: true }), { stiffness: 260, damping: 11 })
  const lift = useSpring(useTransform(speed, [-2500, 0, 2500], [-5, 0, -5], { clamp: true }), { stiffness: 260, damping: 14 })
  // el café sube dentro de la taza: la superficie se agranda y se acerca al borde
  const coffeeY = useTransform(level, [0, 1], [5, -1.5])
  const coffeeS = useTransform(level, [0, 1], [0.78, 1])
  const latte = useTransform(level, [0.86, 0.98], [0, 1])
  // closed → open (la bola se desenvuelve) → closing (se vuelve a arrugar) → closed
  const [paper, setPaper] = useState<'closed' | 'open' | 'closing'>('closed')
  const open = paper === 'open'
  const close = () => setPaper((p) => (p === 'open' ? 'closing' : p))
  const [bump, setBump] = useState(0)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    const onDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) close()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const toggle = () => {
    setPaper((p) => (p === 'open' ? 'closing' : 'open'))
    setBump((n) => n + 1)
  }

  return (
    <div ref={panelRef} className="pointer-events-none fixed right-0 bottom-0 z-50 flex flex-col items-end">
      {paper !== 'closed' && (
        <div
          id="comanda"
          role="dialog"
          aria-label="Escribinos por WhatsApp"
          className="pointer-events-auto relative mr-4 -mb-6 w-[min(18rem,calc(100vw-2rem))] [filter:drop-shadow(0_18px_22px_rgb(0_0_0/0.4))] sm:mr-8"
        >
          <div
            data-state={paper}
            onAnimationEnd={(e) => e.animationName === 'paper-crumple' && setPaper('closed')}
            className="paper-ball relative rounded-[3px] bg-[#FFFDF9] p-5 pb-8 text-madera [background-image:repeating-linear-gradient(transparent_0_27px,rgb(100_188_176/0.14)_27px_28px)]"
          >
              <div className="flex items-start justify-between gap-3 border-b border-dashed border-madera/25 pb-3">
                <div>
                  <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-turquesa-dark uppercase">Comanda</p>
                  <p className="font-hand text-3xl leading-none">¿Qué se te antoja?</p>
                </div>
                <button
                  type="button"
                  onClick={close}
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
                    transition={{ delay: 0.88 + i * 0.08, duration: 0.4, ease: EASE }}
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
        </div>
      )}

      {/* tabla de madera con borde natural, en diagonal desde la esquina: la taza se apoya encima */}
      <div className="relative h-[141px] w-[160px] sm:h-[173px] sm:w-[196px]">
        <TablaMadera className="absolute inset-0 h-full w-full [filter:drop-shadow(-4px_8px_10px_rgb(0_0_0/0.35))]" />

        <m.button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="comanda"
          aria-label="Escribinos por WhatsApp"
          whileTap={{ scale: 0.94 }}
          className="pointer-events-auto absolute top-[12%] left-[25%] h-[92px] w-[104px] sm:h-[110px] sm:w-[124px]"
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
          </m.svg>
          {/* vapor: capa aparte que se anima sin repintar la taza */}
          <span className="pointer-events-none absolute top-[2%] left-1/2 w-[26%] -translate-x-1/2 animate-steam will-change-transform" aria-hidden="true">
            <svg viewBox="-14 -46 28 32" className="w-full overflow-visible">
              <g fill="none" stroke="#FAF7F2" strokeOpacity=".7" strokeWidth="1.8" strokeLinecap="round">
                <path d="M-8-16C-12-24-4-28-8-36" />
                <path d="M2-18C-2-28 7-32 2-44" />
                <path d="M11-16C7-23 14-27 11-34" />
              </g>
            </svg>
          </span>
          {/* globo de mensaje (a la derecha, apuntando a la taza): escribe, se mece al scrollear y salta al tocar; se oculta con la comanda abierta */}
          <m.span
            style={{ rotate: sway, y: lift }}
            className={`pointer-events-none absolute top-0 -right-3 w-10 origin-[15%_95%] transition-[opacity,scale] duration-300 will-change-transform sm:w-11 ${paper === 'closed' ? 'opacity-100' : 'scale-75 opacity-0'}`}
            aria-hidden="true"
          >
            <m.span
              key={bump}
              className="block"
              initial={false}
              animate={bump ? { scale: [1, 1.32, 0.9, 1.06, 1], rotate: [0, -10, 6, -2, 0] } : undefined}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {/* trazo de lápiz: línea de grafito temblorosa y repasada, sobre papel */}
              <svg viewBox="0 0 44 36" className="block w-full -scale-x-100 overflow-visible">
                <defs>
                  <filter id={`${uid}-lapiz`} x="-10%" y="-10%" width="120%" height="120%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                </defs>
                <path
                  d="M7 2.5h30a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5h-5.5l2.5 7-9.5-7H7a5 5 0 0 1-5-5v-15a5 5 0 0 1 5-5Z"
                  fill="#FFFDF7"
                />
                <g filter={`url(#${uid}-lapiz)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path
                    d="M7 2.5h30a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5h-5.5l2.5 7-9.5-7H7a5 5 0 0 1-5-5v-15a5 5 0 0 1 5-5Z"
                    stroke="#3A3631"
                    strokeWidth="1.5"
                    strokeOpacity=".85"
                  />
                  <path
                    d="M7.6 3.1h29.2a4.6 4.6 0 0 1 4.8 4.9v14.6a4.8 4.8 0 0 1-5 4.7h-5.2l2.2 6.6-9.1-6.8H7.2a4.6 4.6 0 0 1-4.7-4.9V7.8a4.7 4.7 0 0 1 5.1-4.7Z"
                    stroke="#3A3631"
                    strokeWidth=".7"
                    strokeOpacity=".45"
                  />
                </g>
              </svg>
              <span className="absolute inset-x-0 top-[33%] flex justify-center gap-[4px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block h-[5px] w-[5px] animate-typing rounded-[45%_55%_50%_48%] bg-[#3A3631]/80 ring-1 ring-[#3A3631]/30 will-change-transform"
                    style={{ animationDelay: `${i * 0.16}s` }}
                  />
                ))}
              </span>
            </m.span>
          </m.span>
        </m.button>
      </div>
    </div>
  )
}
