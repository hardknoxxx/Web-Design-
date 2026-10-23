import { m, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Edge } from '../components/Edge'
import { ArrowIcon, CupHoursIcon, LilyMark, LilyPinIcon, RotaryPhoneIcon } from '../components/Icons'
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
      className="relative z-[7] overflow-x-clip bg-[#20140C] px-9 pt-28 pb-12 text-crema sm:px-14"
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
        <p className="-mt-2 text-xs font-semibold tracking-[0.4em] text-arena uppercase">Coffee Lounge</p>

        <h2 className="mt-14 font-display text-[clamp(2.6rem,10vw,5rem)] leading-none font-semibold">Te esperamos</h2>
        <p className="mt-3 inline-block -rotate-2 font-hand text-2xl text-arena">con la mesa lista y los lápices afilados</p>

        {/* tarjeta de datos, como una carta de café */}
        <div className="relative mx-auto mt-12 max-w-4xl rounded-[28px] border border-arena/20 bg-[#2A1A10]/85 p-7 text-left font-ticket text-crema sm:p-10">
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-dashed sm:divide-arena/20">
            <div className="sm:pr-8">
              <CupHoursIcon className="h-9 w-9 text-arena" />
              <p className="mt-4 text-[0.7rem] tracking-[0.3em] text-arena uppercase">Horario</p>
              <p className="mt-2 text-lg font-bold">{SITE.hours.days}</p>
              <dl className="mt-2 space-y-1 text-[0.95rem]">
                {[
                  ['Mañana', SITE.hours.slots[0]],
                  ['Tarde', SITE.hours.slots[1]],
                  ['Lunes', 'cerrado'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-2">
                    <dt className="text-crema/70">{k}</dt>
                    <span className="flex-1 translate-y-[-3px] border-b border-dotted border-arena/35" aria-hidden="true" />
                    <dd className="tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              {status && (
                <p
                  aria-live="polite"
                  className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${
                    status.open ? 'bg-turquesa/20 text-[#7FE3D6]' : 'bg-crema/10 text-crema/80'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${status.open ? 'bg-turquesa' : 'bg-tierra'}`} />
                  {status.label}
                </p>
              )}
            </div>

            <a href={SITE.mapsHref} target="_blank" rel="noopener noreferrer" className="group block border-t border-dashed border-arena/20 pt-8 sm:border-t-0 sm:px-8 sm:pt-0">
              <LilyPinIcon className="h-9 w-9 text-arena" />
              <p className="mt-4 text-[0.7rem] tracking-[0.3em] text-arena uppercase">Dirección</p>
              <p className="mt-2 text-lg font-bold">{SITE.address}</p>
              <p className="mt-1 text-[0.95rem] text-crema/70">{SITE.postalCode}</p>
              <p className="text-[0.95rem] text-crema/70">{SITE.city}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.2em] text-arena uppercase">
                Cómo llegar
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>

            <a href={SITE.phoneHref} className="group block border-t border-dashed border-arena/20 pt-8 sm:border-t-0 sm:pt-0 sm:pl-8">
              <RotaryPhoneIcon className="h-9 w-9 text-arena" />
              <p className="mt-4 text-[0.7rem] tracking-[0.3em] text-arena uppercase">Teléfono</p>
              <p className="mt-2 text-lg font-bold tabular-nums">{SITE.phoneDisplay}</p>
              <p className="mt-1 text-[0.95rem] text-crema/70">o tocá la taza para escribirnos</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.2em] text-arena uppercase">
                Llamar
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </div>
        </div>

        <footer className="mt-20 flex flex-col items-center gap-3 pb-24 font-ticket text-[0.7rem] tracking-[0.15em] text-crema/45 uppercase sm:pb-6">
          <LilyMark className="h-6 w-6 text-tierra" />
          <span>
            © {new Date().getFullYear()} {SITE.name} · Puerto Iguazú, Misiones
          </span>
        </footer>
      </div>
    </section>
  )
}
