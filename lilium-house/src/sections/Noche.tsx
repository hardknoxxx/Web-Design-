import { m, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { HojasTransicion } from '../components/HojasTransicion'
import { Parallax } from '../components/Parallax'
import { Reveal, RevealGroup, RevealItem, RevealWords } from '../components/Reveal'
import { ArrowIcon, CupHoursIcon, InstagramIcon, LilyMark, LilyPinIcon, RotaryPhoneIcon } from '../components/Icons'
import { SITE } from '../data/site'
import { useOpenStatus } from '../hooks/useOpenStatus'

// posiciones fijas (deterministas) para las luciérnagas
const FIREFLIES = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 92}%`,
  // cada luciérnaga vaga por uno de tres recorridos, con su propio ritmo y desfase
  anim: `luciernaga-${'abc'[i % 3]} ${7 + (i % 5) * 1.6}s ease-in-out ${-((i * 1.3) % 9)}s infinite`,
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
      data-phase="#0F2220|#FAF7F2|21:00"
      className="relative z-[7] overflow-x-clip px-9 pt-28 pb-12 text-crema sm:px-14"
      aria-label="Visitanos"
    >
      <HojasTransicion v="noche" />
      {/* dos planos de luciérnagas: las de atrás, chicas y tenues, casi quietas; las de adelante
          suben más rápido que el scroll (profundidad sin capas grandes: solo se mueven los puntos) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {[0, 1].map((plane) => (
          <Parallax key={plane} distance={plane ? 90 : -24} className="absolute inset-0">
            {FIREFLIES.filter((_, i) => i % 2 === plane).map((f) => (
              <span
                key={f.left + f.top}
                className={`absolute rounded-full bg-[#E4F0D0] will-change-transform ${
                  plane ? 'h-1.5 w-1.5 shadow-[0_0_12px_4px_rgb(171_204_190/0.45)]' : 'h-1 w-1 opacity-70 shadow-[0_0_8px_3px_rgb(171_204_190/0.35)]'
                }`}
                style={{ left: f.left, top: f.top, animation: f.anim }}
              />
            ))}
          </Parallax>
        ))}
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <m.div style={{ scale: signScale }} className="relative inline-block">
          <span className="font-script text-[clamp(5rem,24vw,11rem)] leading-[1.05] text-crema/25">Lilium</span>
          <m.span
            style={{ opacity: glow }}
            className="absolute inset-0 font-script text-[clamp(5rem,24vw,11rem)] leading-[1.05] text-[#FBFFFC] [text-shadow:0_0_16px_rgb(171_204_190/0.85),0_0_44px_rgb(100_188_176/0.45)]"
            aria-hidden="true"
          >
            Lilium
          </m.span>
        </m.div>
        <Reveal delay={0.1}>
          <p className="-mt-2 text-xs font-semibold tracking-[0.4em] text-arena uppercase">Coffee Lounge</p>
        </Reveal>

        <h2 className="mt-14 font-display text-[clamp(2.6rem,10vw,5rem)] leading-none font-semibold">
          <RevealWords text="Te esperamos" />
        </h2>
        <Reveal delay={0.2}>
          <p className="mt-3 inline-block -rotate-2 font-hand text-2xl text-arena">con la mesa lista y los lápices afilados</p>
        </Reveal>

        {/* tarjeta de datos, como una carta de café: entra la tarjeta y después cada columna */}
        <Reveal className="relative mx-auto mt-12 max-w-4xl">
          <div className="rounded-[28px] border border-arena/20 bg-[#163330]/85 p-7 text-left font-elegante text-crema [font-variant-numeric:lining-nums_tabular-nums] sm:p-10">
            <RevealGroup className="grid gap-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-dashed sm:divide-arena/20" delay={0.25} stagger={0.12}>
              <RevealItem className="sm:pr-8">
                <CupHoursIcon className="h-9 w-9 text-arena" />
                <p className="mt-4 font-sans text-[0.7rem] font-semibold tracking-[0.3em] text-arena uppercase">Horario</p>
                <p className="mt-2 text-xl font-normal tracking-[0.01em]">{SITE.hours.days}</p>
                <dl className="mt-2 space-y-1 text-[0.95rem]">
                  {SITE.hours.rows.map(([k, v]) => (
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
              </RevealItem>

              <RevealItem>
                <a href={SITE.mapsHref} target="_blank" rel="noopener noreferrer" className="group block border-t border-dashed border-arena/20 pt-8 sm:border-t-0 sm:px-8 sm:pt-0">
                  <LilyPinIcon className="h-9 w-9 text-arena" />
                  <p className="mt-4 font-sans text-[0.7rem] font-semibold tracking-[0.3em] text-arena uppercase">Dirección</p>
                  <p className="mt-2 text-xl font-normal tracking-[0.01em]">{SITE.address}</p>
                  <p className="mt-1 text-[0.95rem] text-crema/70">{SITE.postalCode}</p>
                  <p className="text-[0.95rem] text-crema/70">{SITE.city}</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-[0.2em] text-arena uppercase">
                    Cómo llegar
                    <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              </RevealItem>

              <RevealItem>
                <a href={SITE.phoneHref} className="group block border-t border-dashed border-arena/20 pt-8 sm:border-t-0 sm:pt-0 sm:pl-8">
                  <RotaryPhoneIcon className="h-9 w-9 text-arena" />
                  <p className="mt-4 font-sans text-[0.7rem] font-semibold tracking-[0.3em] text-arena uppercase">Teléfono</p>
                  <p className="mt-2 text-xl font-normal tracking-[0.01em] tabular-nums">{SITE.phoneDisplay}</p>
                  <p className="mt-1 text-[0.95rem] text-crema/70">o tocá la taza para escribirnos</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-[0.2em] text-arena uppercase">
                    Llamar
                    <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              </RevealItem>
            </RevealGroup>
          </div>
        </Reveal>

        <Reveal>
          <a
            href={SITE.instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group mx-auto mt-10 flex max-w-4xl items-center gap-4 rounded-[28px] border border-dashed border-arena/25 px-7 py-5 text-left font-elegante transition-colors hover:border-turquesa/70 sm:px-10"
          >
            <InstagramIcon className="h-9 w-9 shrink-0 text-turquesa" />
            <span className="flex-1">
              <span className="block font-sans text-[0.7rem] font-semibold tracking-[0.3em] text-arena uppercase">Lo del día, en Instagram</span>
              <span className="mt-1 block text-xl font-normal tracking-[0.01em]">@{SITE.instagram}</span>
            </span>
            <ArrowIcon className="h-5 w-5 text-arena transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>

        <footer className="mt-20 pb-24 font-sans text-[0.7rem] tracking-[0.2em] text-crema/45 uppercase sm:pb-6">
          <Reveal className="flex flex-col items-center gap-3">
            <LilyMark className="h-7 w-7 text-turquesa" />
            <span>
              © {new Date().getFullYear()} {SITE.brand} · Puerto Iguazú, Misiones
            </span>
          </Reveal>
        </footer>
      </div>
    </section>
  )
}
