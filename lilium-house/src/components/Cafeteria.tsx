import { m } from 'framer-motion'
import type { ComponentType, SVGProps } from 'react'
import { ChipaIcon, CupIcon, MandalaIcon } from './Icons'
import { MandalaColoring } from './MandalaColoring'
import { fadeUp, Reveal, SectionHeading, stagger } from './Reveal'

type Feature = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  text: string
  tags: string[]
  tone: string
}

const FEATURES: Feature[] = [
  {
    icon: CupIcon,
    title: 'Café de especialidad',
    text: 'Granos seleccionados y preparados con paciencia, en tazas generosas: del espresso intenso a opciones frías para el calor misionero.',
    tags: ['Espresso', 'Filtrados', 'Bebidas frías'],
    tone: 'bg-turquesa/12 text-turquesa-dark',
  },
  {
    icon: ChipaIcon,
    title: 'Chipas caseras',
    text: 'Horneadas con almidón de mandioca y queso, como manda la tradición del Litoral. Y una vitrina de tortas y pastelería para tentarse.',
    tags: ['Recién horneadas', 'Pastelería', 'Opciones para todos'],
    tone: 'bg-mostaza/18 text-[#9A6B12]',
  },
  {
    icon: MandalaIcon,
    title: 'Manteles mandala',
    text: 'Cada mesa espera con un mantel de ilustraciones florales para colorear y un frasco de lápices. Sin apuro: un ritual creativo para grandes y chicos.',
    tags: ['Experiencia', 'Para toda la familia'],
    tone: 'bg-rosa/14 text-[#B04F36]',
  },
]

export function Cafeteria() {
  return (
    <section id="cafeteria" className="relative scroll-mt-20 px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Lilium Coffee Lounge"
          title={
            <>
              Un ritual de <em className="text-rosa">café, chipa</em> y color
            </>
          }
          intro="Paredes de estuco, mesas de madera rústica, sillas turquesa y música suave: un rincón tranquilo donde el aroma del café se mezcla con el de las chipas recién salidas del horno."
        />

        <m.ul
          className="grid gap-5 md:grid-cols-3 md:gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {FEATURES.map(({ icon: Icon, title, text, tags, tone }) => (
            <m.li
              key={title}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] border border-madera/10 bg-crema/80 p-7 shadow-[0_20px_50px_-35px_rgb(61_35_20/0.5)] transition-[transform,box-shadow] duration-500 ease-organic hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgb(61_35_20/0.55)] sm:p-8"
            >
              <div className={`grid h-16 w-16 place-items-center rounded-2xl ${tone}`}>
                <Icon className="h-9 w-9" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-medium">{title}</h3>
              <p className="mt-3 leading-relaxed text-madera/75">{text}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <li key={t} className="rounded-full border border-madera/15 px-3 py-1 text-xs font-medium text-madera/70">
                    {t}
                  </li>
                ))}
              </ul>
              <span className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full border border-dashed border-madera/10 transition-transform duration-700 group-hover:rotate-45" />
            </m.li>
          ))}
        </m.ul>

        {/* Experiencia mandala interactiva */}
        <div
          id="mandalas"
          className="relative mt-24 scroll-mt-24 overflow-hidden rounded-[2.5rem] border border-madera/10 bg-estuco/80 px-5 py-12 sm:px-10 md:mt-32 md:px-14 md:py-16"
        >
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-turquesa/10" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-rosa/10" />
          <div className="relative">
            <MandalaColoring
              intro={
                <Reveal>
                  <p className="eyebrow text-turquesa-dark">
                    <span className="h-px w-8 bg-turquesa/60" />
                    Experiencia interactiva
                  </p>
                  <h3 className="mt-4 font-display text-4xl leading-tight font-medium text-balance sm:text-5xl">
                    Coloreá tu mantel mientras llega el café
                  </h3>
                  <p className="mt-5 text-lg leading-relaxed text-madera/75">
                    En Lilium, cada mesa es un lienzo. Probá acá mismo: elegí un color, tocá el mandala y llevate tu
                    diseño. En el local te esperan el mantel y el frasco de lápices.
                  </p>
                </Reveal>
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}
