import { m, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Monstera } from '../components/Botanica'
import { HojasCayendo, Hornero } from '../components/Ambiente'
import { ArrowIcon } from '../components/Icons'
import { SITE } from '../data/site'

const EASE = [0.22, 1, 0.36, 1] as const
const fmt = (n: number) => n.toFixed(1).replace('.', ',')

/** 08 · Atardecer. El puntaje cuenta con el scroll y las hojas empiezan a cerrarse. */
export function Opiniones() {
  const ref = useRef<HTMLElement>(null)
  const { score, count, breakdown, highlights } = SITE.rating

  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const scoreText = useTransform(enter, [0.25, 1], [0, score], { clamp: true })
  const scoreLabel = useTransform(scoreText, (v) => fmt(v))
  const stars = useTransform(enter, [0.3, 1], ['0%', `${(score / 5) * 100}%`])

  const { scrollYProgress: leave } = useScroll({ target: ref, offset: ['center end', 'end start'] })
  const leftX = useTransform(leave, [0, 1], ['-75%', '-10%'])
  const rightX = useTransform(leave, [0, 1], ['75%', '10%'])
  const leftR = useTransform(leave, [0, 1], [-30, 10])
  const rightR = useTransform(leave, [0, 1], [30, -10])

  return (
    <section
      ref={ref}
      id="opiniones"
      data-phase="#64BCB0|#173F3B|19:30"
      className="relative z-[6] overflow-x-clip px-9 pt-32 pb-48 text-laguna-deep sm:px-14"
      aria-label="Opiniones en Google"
    >
      <HojasCayendo />
      <Hornero className="top-4 -right-2 w-56 sm:top-8 sm:right-[4%] sm:w-72 lg:w-80" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="inline-block -rotate-2 font-hand text-3xl text-laguna">19:30 · lo que dicen</p>
        <p className="mt-4 font-display text-[clamp(7rem,34vw,13rem)] leading-none font-semibold text-white tabular-nums [text-shadow:0_2px_0_rgb(23_63_59/0.18)]" aria-hidden="true">
          <m.span>{scoreLabel}</m.span>
        </p>
        <p className="sr-only">
          Calificación {fmt(score)} de 5 según {count} opiniones en Google
        </p>
        <div className="mt-3 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="relative text-2xl tracking-[0.2em]">
            <span className="text-laguna/25">★★★★★</span>
            <m.span style={{ width: stars }} className="absolute inset-0 overflow-hidden whitespace-nowrap text-white">
              ★★★★★
            </m.span>
          </span>
          <span className="text-sm font-medium">{count} opiniones en Google</span>
        </div>

        <dl className="mx-auto mt-8 flex max-w-sm justify-center gap-10">
          {breakdown.map((b) => (
            <div key={b.label}>
              <dt className="text-xs font-semibold tracking-[0.2em] uppercase opacity-75">{b.label}</dt>
              <dd className="font-display text-3xl font-semibold tabular-nums">{fmt(b.score)}</dd>
            </div>
          ))}
        </dl>

        <m.ul
          className="mt-10 flex flex-wrap justify-center gap-2.5"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        >
          {highlights.map((h, i) => (
            <m.li
              key={h}
              variants={{
                hidden: { opacity: 0, y: 18, rotate: i % 2 ? 4 : -4 },
                show: { opacity: 1, y: 0, rotate: i % 2 ? 1.5 : -1.5, transition: { duration: 0.6, ease: EASE } },
              }}
              className="rounded-full bg-crema px-4 py-2 text-sm font-medium text-madera sm:text-base"
            >
              {h}
            </m.li>
          ))}
        </m.ul>

        <a
          href={SITE.mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-10 inline-flex items-center gap-2 border-b border-laguna/40 pb-1 font-semibold"
        >
          Ver opiniones en Google Maps
          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      {/* las hojas empiezan a cerrarse: llega la noche */}
      <m.div style={{ x: leftX, rotate: leftR }} className="absolute -bottom-[6%] -left-[10%] w-[70vw] max-w-[560px] origin-bottom-left">
        <Monstera color="#415521" className="w-full" />
      </m.div>
      <m.div style={{ x: rightX, rotate: rightR }} className="absolute -right-[10%] -bottom-[6%] w-[70vw] max-w-[560px] origin-bottom-right">
        <Monstera color="#415521" className="w-full -scale-x-100" />
      </m.div>
    </section>
  )
}
