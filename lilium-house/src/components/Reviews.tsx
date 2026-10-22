import { m } from 'framer-motion'
import { SITE } from '../data/site'
import { ArrowIcon } from './Icons'
import { EASE, fadeUp, SectionHeading, stagger } from './Reveal'

const fmt = (n: number) => n.toFixed(1).replace('.', ',')

function Stars({ score }: { score: number }) {
  return (
    <span className="relative inline-block text-2xl leading-none tracking-[0.15em]" aria-hidden="true">
      <span className="text-madera/15">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden text-mostaza" style={{ width: `${(score / 5) * 100}%` }}>
        ★★★★★
      </span>
    </span>
  )
}

export function Reviews() {
  const { score, count, breakdown, highlights } = SITE.rating
  return (
    <section id="opiniones" className="relative scroll-mt-16 bg-estuco/70 px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Opiniones"
          title={
            <>
              Lo que dicen <em className="text-rosa">quienes nos visitan</em>
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <m.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="rounded-[2rem] border border-madera/10 bg-crema p-8 sm:p-10"
          >
            <div className="flex items-end gap-4">
              <span className="font-display text-7xl leading-none font-medium">{fmt(score)}</span>
              <div className="pb-1">
                <Stars score={score} />
                <p className="mt-1 text-sm text-madera/65">{count} opiniones en Google</p>
              </div>
            </div>
            <span className="sr-only">
              Calificación {fmt(score)} de 5 según {count} opiniones en Google
            </span>

            <dl className="mt-8 space-y-4">
              {breakdown.map((b, i) => (
                <div key={b.label}>
                  <div className="flex justify-between text-sm">
                    <dt className="font-medium">{b.label}</dt>
                    <dd className="text-madera/70">{fmt(b.score)}</dd>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-madera/10">
                    <m.div
                      className="h-full origin-left rounded-full bg-turquesa"
                      style={{ width: `${(b.score / 5) * 100}%` }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, ease: EASE, delay: 0.2 + i * 0.12 }}
                    />
                  </div>
                </div>
              ))}
            </dl>

            <a
              href={SITE.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-turquesa-dark"
            >
              Ver opiniones en Google Maps
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </m.div>

          <div className="rounded-[2rem] border border-madera/10 bg-crema/60 p-8 sm:p-10">
            <p className="text-sm font-semibold tracking-[0.2em] text-madera/60 uppercase">Lo más destacado</p>
            <m.ul
              className="mt-6 flex flex-wrap gap-2.5"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              {highlights.map((h, i) => (
                <m.li
                  key={h}
                  variants={fadeUp}
                  className={`rounded-full border px-4 py-2 text-sm font-medium sm:text-base ${
                    i % 3 === 0
                      ? 'border-turquesa/30 bg-turquesa/10 text-turquesa-dark'
                      : i % 3 === 1
                        ? 'border-rosa/30 bg-rosa/10 text-[#A84A33]'
                        : 'border-salvia/30 bg-salvia/10 text-[#3F5A3E]'
                  }`}
                >
                  {h}
                </m.li>
              ))}
            </m.ul>
            <p className="mt-8 font-display text-xl leading-relaxed text-madera/80 italic sm:text-2xl">
              Comida fresca, café en porciones generosas y un ambiente limpio, tranquilo y con música suave.
            </p>
            <p className="mt-3 text-sm text-madera/55">Resumen de las opiniones publicadas en Google Maps</p>
          </div>
        </div>
      </div>
    </section>
  )
}
