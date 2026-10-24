import { m, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'
import { WHATSAPP_OPTIONS, whatsappLink } from '../data/site'
import { useDay } from '../day/DayProvider'
import { gsap } from '../lib/gsap'
import { PAPEL, playSprite } from '../lib/sprite'
import { CloseIcon, WhatsAppIcon } from './Icons'
import { TablaMadera } from './TablaMadera'

const EASE = [0.22, 1, 0.36, 1] as const
const INK = '#3D2314'

// centro de la bolita dentro de la película (cuadro de 300×420, la bola nace en 150,169)
const BALL_ORIGIN = '50% 40.24%'
// cuadros de la película: la bolita vuela con los primeros y se desenvuelve con el resto
const FLIGHT_FRAMES = 3
const LAST = PAPEL.frames - 1
// cuánto asoma la bolita por encima de la boca antes de salir volando (px)
const POP = 26

/**
 * Botón de WhatsApp: un tronco acostado en diagonal en la esquina y, encima, una taza vista
 * desde la silla (~55°) sobre su plato, con la cucharita al lado. El café se va sirviendo con
 * el día (scroll). Al tocarla cada pieza reacciona por su cuenta (la taza salta y se bambolea,
 * el plato se asienta después y la cucharita tintinea) y de la boca de la taza sale una bolita
 * de papel que sube hasta el centro de la pantalla y se desenvuelve en la comanda.
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
  // closed → open (la bolita vuela y se desenvuelve) → closing (se arruga y vuelve a la taza) → closed
  const [paper, setPaper] = useState<'closed' | 'open' | 'closing'>('closed')
  const open = paper === 'open'
  const close = () => setPaper((p) => (p === 'open' ? 'closing' : p))
  const filmRef = useRef<HTMLSpanElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const mouthRef = useRef<SVGEllipseElement>(null)

  /**
   * El golpe: cada pieza con su retardo, su curva y su eje. La taza recibe el toque (salta y
   * se bambolea sobre la base), el plato acusa el aterrizaje un instante después y la cucharita,
   * suelta sobre el plato, tintinea más rápido y por más tiempo. `force` < 1: un golpe suave
   * (la bolita que vuelve a caer en la taza).
   */
  const clink = (force = 1) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const q = gsap.utils.selector(svgRef)
    const [cup, shadow, saucer, spoon, slosh] = ['[data-cup]', '[data-cup-shadow]', '[data-saucer]', '[data-spoon]', '[data-slosh]'].map((s) => q(s))
    const all = [cup, shadow, saucer, spoon, slosh]
    gsap.killTweensOf(all)
    gsap.set(all, { x: 0, y: 0, rotation: 0, scaleX: 1, scale: 1, opacity: (_: number, el: Element) => (el.hasAttribute('data-cup-shadow') ? 0.2 : 1) })
    const k = (v: number) => v * force
    gsap.to(cup, {
      keyframes: { y: [0, k(-5.5), 0, k(-1.3), 0], rotation: [0, k(-6), k(3.6), k(-1.2), 0], easeEach: 'sine.inOut' },
      svgOrigin: '0 22',
      duration: 0.62,
      ease: 'power2.out',
    })
    // la sombra de la taza se achica mientras está en el aire
    gsap.to(shadow, { keyframes: { scale: [1, 0.82, 1, 0.95, 1], opacity: [0.2, 0.1, 0.2, 0.17, 0.2] }, svgOrigin: '3 19', duration: 0.62, ease: 'power2.out' })
    gsap.to(saucer, {
      keyframes: { y: [0, k(1.6), k(-0.6), k(0.3), 0], rotation: [0, k(1.3), k(-0.8), k(0.3), 0], easeEach: 'sine.inOut' },
      svgOrigin: '0 21',
      delay: 0.12,
      duration: 0.5,
      ease: 'power1.out',
    })
    gsap.to(spoon, {
      keyframes: { rotation: [0, k(-7), k(6), k(-4.5), k(3), k(-1.6), k(0.6), 0], y: [0, k(-1.1), 0, k(-0.5), 0, 0, 0, 0], easeEach: 'sine.inOut' },
      svgOrigin: '13 28',
      delay: 0.15,
      duration: 0.58,
      ease: 'power1.out',
    })
    gsap.to(slosh, {
      keyframes: { scaleX: [1, 1 + k(0.06), 1 - k(0.03), 1 + k(0.02), 1], rotation: [0, k(4), k(-3), k(1), 0], easeEach: 'sine.inOut' },
      svgOrigin: '0 -6',
      duration: 0.9,
      ease: 'power1.out',
    })
  }

  /** Distancia de la bolita (centro de la película sin transformar) a la boca de la taza. */
  const mouthOffset = (film: HTMLElement) => {
    const mouth = mouthRef.current?.getBoundingClientRect()
    gsap.set(film, { x: 0, y: 0, scale: 1, rotation: 0 })
    const box = film.getBoundingClientRect()
    if (!mouth) return { x: 0, y: 0 }
    return {
      x: mouth.left + mouth.width / 2 - (box.left + box.width / 2),
      y: mouth.top + mouth.height / 2 - (box.top + box.height * 0.4024),
    }
  }

  // abrir: la bolita sale de la boca de la taza (escala 0), sube en arco hasta el centro de la
  // pantalla y ahí se desenvuelve (película de Remotion); después el papel real queda encima.
  // cerrar: se vuelve a arrugar y cae de vuelta en la taza.
  useEffect(() => {
    const film = filmRef.current
    const sheet = sheetRef.current
    if (!film || !sheet || paper === 'closed') return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (paper === 'open') {
      if (reduce) {
        gsap.set(sheet, { opacity: 1 })
        gsap.set(film, { opacity: 0 })
        return
      }
      const from = mouthOffset(film)
      gsap.set(sheet, { opacity: 0 })
      const tl = gsap
        .timeline()
        .set(film, { opacity: 1, x: from.x, y: from.y, scale: 0, rotation: -140, transformOrigin: BALL_ORIGIN })
        // asoma: la bolita sale de la boca de la taza, ya con un tamaño que se lee
        .to(film, { y: from.y - POP, scale: 0.85, rotation: -90, duration: 0.2, ease: 'back.out(2.2)' }, 0)
        .add(playSprite(film, PAPEL, 0, 1, 0.2), 0)
        // vuela: primero sigue subiendo y después deriva hacia el centro (un arco, no una recta)
        .addLabel('vuelo', 0.2)
        .to(film, { y: 0, duration: 0.58, ease: 'power2.out' }, 'vuelo')
        .to(film, { x: 0, duration: 0.58, ease: 'sine.inOut' }, 'vuelo')
        .to(film, { scale: 1, rotation: 0, duration: 0.58, ease: 'power1.out' }, 'vuelo')
        .add(playSprite(film, PAPEL, 1, FLIGHT_FRAMES, 0.5), 'vuelo')
        // en el centro se desenvuelve (película de Remotion) y queda el papel real
        .add(playSprite(film, PAPEL, FLIGHT_FRAMES, LAST, 0.72), 'vuelo+=0.58')
        .set(sheet, { opacity: 1 })
        .set(film, { opacity: 0 })
      return () => void tl.kill()
    }
    gsap.set(sheet, { opacity: 0 })
    if (reduce) {
      setPaper('closed')
      return
    }
    // se arruga desde el cuadro en que esté (si se cierra a mitad de la apertura, no salta)
    const at = Number(film.dataset.frame ?? LAST)
    const crumple = Math.max(0, at - FLIGHT_FRAMES)
    const to = mouthOffset(film)
    gsap.set(film, { opacity: 1, transformOrigin: BALL_ORIGIN })
    const tl = gsap
      .timeline({
        onComplete: () => {
          setPaper('closed')
          clink(0.45)
        },
      })
      .add(playSprite(film, PAPEL, at, FLIGHT_FRAMES, crumple * 0.045), 0)
      // vuelve en arco hasta quedar justo encima de la taza…
      .addLabel('vuelo')
      .to(film, { y: to.y - POP, duration: 0.48, ease: 'power2.in' }, 'vuelo')
      .to(film, { x: to.x, duration: 0.48, ease: 'sine.inOut' }, 'vuelo')
      .to(film, { scale: 0.85, rotation: 120, duration: 0.48, ease: 'power1.in' }, 'vuelo')
      .add(playSprite(film, PAPEL, FLIGHT_FRAMES, 1, 0.4), 'vuelo')
      // …y cae adentro
      .addLabel('cae')
      .to(film, { y: to.y, scale: 0, rotation: 170, duration: 0.18, ease: 'power2.in' }, 'cae')
      .add(playSprite(film, PAPEL, 1, 0, 0.12), 'cae')
    return () => void tl.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper])
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
    clink()
  }

  return (
    <div ref={panelRef} className="pointer-events-none fixed right-0 bottom-0 z-50 flex flex-col items-end">
      {paper !== 'closed' && (
        <div
          id="comanda"
          role="dialog"
          aria-label="Escribinos por WhatsApp"
          className="pointer-events-auto fixed top-1/2 left-1/2 z-10 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2"
        >
          {/* la película del papel (Remotion → sprite): vuela desde la taza y se desenvuelve. La
              sombra va en cada pieza y no en el contenedor: un filtro en el contenedor obligaba a
              redibujar todo el trayecto de la bolita en cada cuadro */}
          <span
            ref={filmRef}
            aria-hidden="true"
            className="pointer-events-none absolute opacity-0 will-change-transform [filter:drop-shadow(0_14px_16px_rgb(0_0_0/0.35))]"
            style={{ left: '-2.083%', top: -4, width: '104.17%', aspectRatio: '300 / 420' }}
          />
          <div
            ref={sheetRef}
            className="relative rotate-[-2deg] rounded-[3px] bg-[#FFFDF9] p-5 pb-8 text-madera opacity-0 shadow-[0_18px_22px_-6px_rgb(0_0_0/0.4)] [background-image:repeating-linear-gradient(transparent_0_27px,rgb(100_188_176/0.14)_27px_28px)]"
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
                    transition={{ delay: 1.5 + i * 0.08, duration: 0.4, ease: EASE }}
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

        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="comanda"
          aria-label="Escribinos por WhatsApp"
          className="pointer-events-auto absolute top-[12%] left-[25%] h-[92px] w-[104px] sm:h-[110px] sm:w-[124px]"
        >
          <svg ref={svgRef} viewBox="-52 -56 104 92" className="h-full w-full overflow-visible" aria-hidden="true">
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
              <linearGradient id={`${uid}-spoon`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#F2E7CF" />
                <stop offset=".55" stopColor="#D8C7A2" />
                <stop offset="1" stopColor="#B49C72" />
              </linearGradient>
              <clipPath id={`${uid}-rim`}>
                <ellipse cx="0" cy="-6" rx="21.5" ry="8.4" />
              </clipPath>
            </defs>
            {/* sombra del plato sobre el tronco (no se mueve: el tronco no vibra) */}
            <ellipse cx="3" cy="25" rx="42" ry="15" fill="#000" opacity=".25" />
            {/* plato */}
            <g data-saucer="">
              <ellipse cx="0" cy="21" rx="41" ry="15.5" fill="#F7F2EA" stroke={INK} strokeOpacity=".35" />
              <ellipse cx="0" cy="20" rx="29" ry="10.5" fill="#EFE6DA" />
              {/* sombra de la taza sobre el plato: se achica cuando la taza salta */}
              <ellipse data-cup-shadow="" cx="3" cy="19" rx="19" ry="6.5" fill={INK} opacity=".2" />
            </g>
            {/* taza */}
            <g data-cup="">
              {/* asa */}
              <path d="M22-2C36-5 37 12 20 11" fill="none" stroke={INK} strokeOpacity=".5" strokeWidth="6.4" strokeLinecap="round" />
              <path d="M22-2C36-5 37 12 20 11" fill="none" stroke="#FFFFFF" strokeWidth="4.2" strokeLinecap="round" />
              {/* cuerpo */}
              <path d="M-24-6C-24 7-20 15-15 17.5Q0 23.5 15 17.5C20 15 24 7 24-6Z" fill={`url(#${uid}-cup)`} stroke={INK} strokeOpacity=".45" />
              <path d="M-23.4 2.4Q0 11.5 23.4 2.4" fill="none" stroke="#64BCB0" strokeWidth="3" />
              {/* borde y café: la boca de la taza es de donde sale la comanda */}
              <ellipse ref={mouthRef} cx="0" cy="-6" rx="24" ry="9.6" fill="#FFFFFF" stroke={INK} strokeOpacity=".5" />
              <ellipse cx="0" cy="-6" rx="21.5" ry="8.4" fill="#EFE6DA" />
              <g clipPath={`url(#${uid}-rim)`}>
                <m.g style={{ y: coffeeY, scale: coffeeS }}>
                  <g data-slosh="">
                    <ellipse cx="0" cy="-6" rx="21.5" ry="8.4" fill={`url(#${uid}-coffee)`} />
                    <ellipse cx="0" cy="-6" rx="19.6" ry="7.5" fill="none" stroke="#C08552" strokeWidth="1.3" opacity=".9" />
                    <m.path
                      d="M0-1.5C-6-3.5-7-7.5 0-10.5C7-7.5 6-3.5 0-1.5ZM0-2V-10M0-4L-3-5.6M0-6.2L3-7.6"
                      fill="#F3E3C8"
                      stroke="#E8D3B0"
                      strokeWidth=".6"
                      style={{ opacity: latte }}
                    />
                  </g>
                </m.g>
              </g>
            </g>
            {/* cucharita apoyada en el plato, al lado de la taza y paralela al asa. Se dibuja
                vista desde arriba y se aplasta como el plato (perspectiva de ~55°) */}
            <g data-spoon="">
              <ellipse cx="25" cy="25.6" rx="13.5" ry="2.2" fill={INK} opacity=".16" transform="rotate(-19 25 25.6)" />
              <g transform="translate(13 28) scale(1 0.4) rotate(-42)">
                <path
                  d="M5-1.3C12-1.6 22-1.4 29-2.2C31.6-2.5 33.4-1.6 33.4 0C33.4 1.6 31.6 2.5 29 2.2C22 1.4 12 1.6 5 1.3Z"
                  fill={`url(#${uid}-spoon)`}
                  stroke="#A8916A"
                  strokeWidth=".55"
                  vectorEffect="non-scaling-stroke"
                />
                <ellipse cx="0" cy="0" rx="6.4" ry="4.6" fill="#E2D3B2" stroke="#A8916A" strokeWidth=".6" vectorEffect="non-scaling-stroke" />
                <ellipse cx="-0.6" cy="-0.4" rx="4.4" ry="3" fill="#C9B48A" opacity=".55" />
                <ellipse cx="-1.6" cy="-1.4" rx="1.8" ry="1.1" fill="#FFF8E8" opacity=".9" />
              </g>
            </g>
          </svg>
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
        </button>
      </div>
    </div>
  )
}
