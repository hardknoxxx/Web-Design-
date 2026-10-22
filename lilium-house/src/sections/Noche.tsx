import { m, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Edge } from '../components/Edge'
import { ArrowIcon, ClockIcon, MapPinIcon, PhoneIcon } from '../components/Icons'
import { SITE } from '../data/site'
import { useOpenStatus } from '../hooks/useOpenStatus'

// posiciones fijas (deterministas) para las luciérnagas
const FIREFLIES = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 92}%`,
  delay: `${(i * 0.37) % 4}s`,
  dur: `${3 + (i % 4)}s`,
}))

/** 09 · Noche. El cartel “Lilium” se enciende, luciérnagas, horarios y dirección. */
export function Noche() {
  const ref = useRef<HTMLElement>(null)
  const status = useOpenStatus()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  const glow = useTransform(p, [0.45, 0.9], [0, 1])
  const signScale = useTransform(p, [0.3, 1], [0.88, 1])

  return (
    <section
      ref={ref}
      id="visitanos"
      data-phase="#20140C|#FAF7F2|21:00"
      className="relative z-[6] overflow-x-clip bg-[#20140C] px-9 pt-28 pb-12 text-crema sm:px-14"
      aria-label="Visitanos"
    >
      <Edge color="#20140C" flip />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 animate-firefly rounded-full bg-[#E4F0D0] shadow-[0_0_12px_4px_rgb(171_204_190/0.45)]"
            style={{ left: f.left, top: f.top, animationDelay: f.delay, animationDuration: f.dur }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <m.div style={{ scale: signScale }} className="relative inline-block">
          <span className="font-script text-[clamp(5rem,24vw,11rem)] leading-[1.05] text-crema/25">Lilium</span>
          <m.span
            style={{ opacity: glow }}
            className="absolute inset-0 font-script text-[clamp(5rem,24vw,11rem)] leading-[1.05] text-[#FBFFFC] [text-shadow:0_0_16px_rgb(171_204_190/0.85),0_0_44px_rgb(0_168_150/0.45)]"
            aria-hidden="true"
          >
            Lilium
          </m.span>
        </m.div>
        <p className="-mt-2 text-xs font-semibold tracking-[0.4em] text-rosa-palido uppercase">Coffee Lounge</p>

        <h2 className="mt-14 font-display text-[clamp(2.6rem,10vw,5rem)] leading-none font-semibold">Te esperamos</h2>
        <p className="mt-3 inline-block -rotate-2 font-hand text-2xl text-rosa-palido">con la mesa lista y los lápices afilados</p>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
          <div className="rounded-3xl border border-crema/15 bg-crema/[0.04] p-6">
            <ClockIcon className="h-7 w-7 text-nenufar" />
            <p className="mt-4 text-xl font-semibold">{SITE.hours.days}</p>
            <p className="mt-1 text-lg lining-nums tabular-nums">{SITE.hours.slots.join('  ·  ')}</p>
            <p className="text-sm text-crema/55">{SITE.hours.closed}</p>
            {status && (
              <p
                aria-live="polite"
                className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                  status.open ? 'bg-turquesa/20 text-[#7FE3D6]' : 'bg-crema/10 text-crema/80'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${status.open ? 'bg-turquesa' : 'bg-rosa'}`} />
                {status.label}
              </p>
            )}
          </div>

          <a
            href={SITE.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-3xl border border-crema/15 bg-crema/[0.04] p-6 transition-colors hover:border-nenufar/50"
          >
            <MapPinIcon className="h-7 w-7 text-nenufar" />
            <p className="mt-4 text-xl font-semibold lining-nums tabular-nums">{SITE.address}</p>
            <p className="text-crema/70">
              {SITE.postalCode} · {SITE.city}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-nenufar">
              Cómo llegar
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>

          <a
            href={SITE.phoneHref}
            className="group rounded-3xl border border-crema/15 bg-crema/[0.04] p-6 transition-colors hover:border-nenufar/50"
          >
            <PhoneIcon className="h-7 w-7 text-nenufar" />
            <p className="mt-4 text-xl font-semibold lining-nums tabular-nums">{SITE.phoneDisplay}</p>
            <p className="text-crema/70">Llamanos o tocá la taza para escribirnos</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-nenufar">
              Llamar
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </div>

        <footer className="mt-24 flex flex-col items-center gap-2 pb-24 text-xs text-crema/45 sm:pb-6">
          <span>
            © {new Date().getFullYear()} {SITE.name} · Puerto Iguazú, Misiones
          </span>
        </footer>
      </div>
    </section>
  )
}
