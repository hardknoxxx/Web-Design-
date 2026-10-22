import { m } from 'framer-motion'
import { APARTMENTS, SITE, whatsappLink, type Apartment } from '../data/site'
import { ArrowIcon, BedIcon, CheckLeafIcon, UsersIcon, WhatsAppIcon } from './Icons'
import { fadeUp, Reveal, SectionHeading, stagger } from './Reveal'

/** Ilustración en arco (ventana colonial) con follaje: liviana, sin imágenes externas. */
function ArchArt({ apt, index }: { apt: Apartment; index: number }) {
  return (
    <div
      className="relative mx-5 mt-5 aspect-[4/3] overflow-hidden rounded-t-[999px] rounded-b-2xl"
      style={{ background: `linear-gradient(170deg, ${apt.accentSoft} 0%, #FAF7F2 75%)` }}
    >
      <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <circle cx={60 + index * 40} cy="58" r="22" fill={apt.accent} opacity="0.22" />
        <g fill="none" stroke="#3D2314" strokeWidth="1" strokeLinecap="round" opacity="0.55">
          <path d="M100 150V68M100 68a32 32 0 0 1 32 32v50M100 68a32 32 0 0 0-32 32v50" />
          <path d="M68 112h64" />
        </g>
        <g fill={apt.accent} opacity="0.85">
          <path d="M20 150c4-30 14-52 34-66-6 22-10 44-12 66Z" />
          <path d="M180 150c-4-28-16-48-36-60 8 20 12 40 14 60Z" />
        </g>
        <g fill="#5B7B5A">
          <path d="M8 150c10-22 22-34 40-40-10 12-18 26-22 40Z" />
          <path d="M192 150c-8-18-20-30-38-36 10 12 16 22 20 36Z" />
          <path d="M150 150c2-14 8-26 18-34-2 12-4 22-4 34Z" opacity="0.7" />
        </g>
        <path d="M0 150h200" stroke="#3D2314" strokeWidth="1.5" opacity="0.4" />
      </svg>
      <span className="absolute top-[38%] left-1/2 -translate-x-1/2 rounded-full bg-crema/90 px-3 py-1 text-xs font-semibold tracking-wide whitespace-nowrap text-madera shadow-sm">
        {apt.tagline}
      </span>
    </div>
  )
}

export function BedAndBreakfast() {
  return (
    <section id="alojamiento" className="wood-grain relative scroll-mt-16 overflow-hidden px-4 py-24 sm:px-6 md:py-32">
      <div className="pointer-events-none absolute top-0 left-1/2 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-mostaza/40 to-transparent" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          tone="dark"
          eyebrow="Bed & Breakfast"
          title={
            <>
              Quedate en <em className="text-rosa">Lilium</em>
            </>
          }
          intro="Departamentos de alquiler turístico con desayuno de la casa, a minutos del Hito Tres Fronteras y del camino a las Cataratas."
        />

        <m.ul
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {APARTMENTS.map((apt, i) => (
            <m.li
              key={apt.id}
              variants={fadeUp}
              className="group flex flex-col overflow-hidden rounded-[2rem] bg-crema text-madera shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-organic hover:-translate-y-2"
            >
              <ArchArt apt={apt} index={i} />
              <div className="flex flex-1 flex-col p-7">
                <h3 className="font-display text-3xl font-medium">{apt.name}</h3>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-madera/70">
                  <span className="inline-flex items-center gap-1.5">
                    <UsersIcon className="h-4 w-4" />
                    Hasta {apt.guests} huéspedes
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BedIcon className="h-4 w-4" />
                    {apt.layout}
                  </span>
                </div>
                <p className="mt-4 leading-relaxed text-madera/75">{apt.description}</p>
                <ul className="mt-5 space-y-2">
                  {apt.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm">
                      <CheckLeafIcon className="h-4 w-4 shrink-0" style={{ color: apt.accent }} />
                      {a}
                    </li>
                  ))}
                </ul>
                <a
                  href={whatsappLink(`Hola Lilium! Quería consultar disponibilidad para ${apt.name}. Fechas: `)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary mt-7 w-full"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Consultar disponibilidad
                </a>
              </div>
            </m.li>
          ))}
        </m.ul>

        <Reveal className="mt-12 flex flex-col items-center justify-between gap-5 rounded-[2rem] border border-crema/15 bg-crema/5 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <div>
            <p className="font-display text-2xl text-crema">¿Querés ver tarifas al instante?</p>
            <p className="mt-1 text-crema/70">Consultá precios y disponibilidad en nuestro sistema de reservas online.</p>
          </div>
          <a
            href={SITE.bookingHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn shrink-0 border-2 border-crema/70 text-crema hover:bg-crema hover:text-madera"
          >
            Reservar online
            <ArrowIcon className="h-4 w-4" />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
