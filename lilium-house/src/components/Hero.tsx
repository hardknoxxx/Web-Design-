import { m } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { SITE, whatsappLink } from '../data/site'
import { ArrowIcon, HandIcon, LilyMark, Sprig, WhatsAppIcon } from './Icons'
import { EASE } from './Reveal'

// three.js se carga en un chunk aparte: el texto y los CTAs pintan primero
const LilyCanvas = lazy(() => import('./three/LilyCanvas'))

function MandalaRing({ className }: { className?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="0.5">
        <circle r="96" />
        <circle r="90" strokeDasharray="1 3" />
        <circle r="70" />
        {Array.from({ length: 24 }, (_, i) => (
          <path key={i} d="M0 -70 C6 -78 6 -86 0 -90 C-6 -86 -6 -78 0 -70Z" transform={`rotate(${i * 15})`} />
        ))}
        {Array.from({ length: 48 }, (_, i) => (
          <circle key={i} cy="-93" r="1.1" transform={`rotate(${i * 7.5})`} />
        ))}
      </g>
    </svg>
  )
}

const intro = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: 0.15 + i * 0.12 } }),
}

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[100svh] flex-col items-center overflow-hidden px-4 pt-24 pb-14 text-center sm:pt-28"
    >
      {/* Decoración botánica */}
      <Sprig className="pointer-events-none absolute -top-6 -left-10 h-64 w-40 -rotate-[28deg] text-salvia/35 sm:h-96 sm:w-56" />
      <Sprig className="pointer-events-none absolute -right-12 bottom-10 h-72 w-44 rotate-[200deg] text-salvia/30 sm:h-[28rem] sm:w-64" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(60%_55%_at_50%_45%,rgb(224_122_95/0.16),transparent_70%)]" />

      <m.p
        custom={0}
        variants={intro}
        initial="hidden"
        animate="show"
        className="eyebrow text-[0.68rem] tracking-[0.2em] whitespace-nowrap text-rosa sm:text-xs sm:tracking-[0.28em]"
      >
        <span className="hidden h-px w-8 bg-rosa/60 sm:block" />
        Coffee Lounge · Bed &amp; Breakfast
        <span className="hidden h-px w-8 bg-rosa/60 sm:block" />
      </m.p>

      <m.h1
        custom={1}
        variants={intro}
        initial="hidden"
        animate="show"
        className="relative z-10 mt-3 font-display leading-[0.9] font-medium tracking-tight"
      >
        <span className="block px-4 font-script text-[clamp(4.4rem,19vw,9.5rem)] leading-[1.05] font-normal tracking-normal">
          Lilium
        </span>
        <span className="block text-[clamp(1.35rem,4.6vw,2.4rem)] font-normal text-madera/80 italic">
          House <span className="text-turquesa not-italic">&amp;</span> Coffee
        </span>
      </m.h1>

      {/* Lienzo 3D central */}
      <m.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
        className="relative -my-2 aspect-square w-[min(92vw,56svh,580px)] sm:-my-6"
      >
        <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(240_234_225)_0%,rgb(240_234_225/0.6)_45%,transparent_70%)]" />
        <MandalaRing className="absolute inset-[4%] animate-spin-slow text-madera/25 motion-reduce:animate-none" />
        <Suspense
          fallback={
            <div className="absolute inset-0 grid place-items-center">
              <LilyMark className="h-24 w-24 animate-pulse text-rosa/70" />
            </div>
          }
        >
          {/* desvanece el tallo hacia abajo en lugar de cortarlo */}
          <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_62%,transparent_94%)]">
            <LilyCanvas />
          </div>
        </Suspense>
      </m.div>

      <m.p
        custom={2}
        variants={intro}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-xl text-lg leading-relaxed text-pretty text-madera/80 sm:text-xl"
      >
        Café de especialidad, chipas recién horneadas y pastelería en Puerto Iguazú, con habitaciones para descansar
        a pasos de la Triple Frontera.
      </m.p>

      <m.div
        custom={3}
        variants={intro}
        initial="hidden"
        animate="show"
        className="relative z-10 mt-8 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row"
      >
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          <WhatsAppIcon className="h-5 w-5" />
          Escribinos por WhatsApp
        </a>
        <a href="#alojamiento" className="btn btn-outline">
          Ver alojamiento
          <ArrowIcon className="h-4 w-4" />
        </a>
      </m.div>

      <m.p
        custom={4}
        variants={intro}
        initial="hidden"
        animate="show"
        className="mt-6 inline-flex items-center gap-2 text-sm text-madera/60"
      >
        <HandIcon className="h-4 w-4" />
        Arrastrá o tocá la flor
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1 font-medium text-madera/75">
          <span className="text-mostaza">★</span> {String(SITE.rating.score).replace('.', ',')} en Google
        </span>
      </m.p>
    </section>
  )
}
