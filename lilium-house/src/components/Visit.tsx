import { m } from 'framer-motion'
import { SITE, whatsappLink } from '../data/site'
import { useOpenStatus } from '../hooks/useOpenStatus'
import { ArrowIcon, ClockIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from './Icons'
import { fadeUp, SectionHeading, stagger } from './Reveal'

export function Visit() {
  const status = useOpenStatus()

  return (
    <section id="visitanos" className="relative scroll-mt-16 px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Visitanos"
          title={
            <>
              Te esperamos en <em className="text-turquesa-dark">Tres Fronteras</em>
            </>
          }
        />

        <m.div
          className="grid gap-5 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <m.a
            variants={fadeUp}
            href={SITE.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-[2rem] border border-madera/10 bg-crema/80 p-7 transition-colors hover:border-rosa/40"
          >
            <MapPinIcon className="h-8 w-8 text-rosa" />
            <h3 className="mt-5 text-sm font-semibold tracking-[0.2em] text-madera/60 uppercase">Dirección</h3>
            <p className="mt-2 font-display text-2xl leading-snug">{SITE.address}</p>
            <p className="text-madera/70">
              {SITE.postalCode} · {SITE.city}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-turquesa-dark">
              Cómo llegar
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </m.a>

          <m.div variants={fadeUp} className="rounded-[2rem] border border-madera/10 bg-crema/80 p-7">
            <ClockIcon className="h-8 w-8 text-rosa" />
            <h3 className="mt-5 text-sm font-semibold tracking-[0.2em] text-madera/60 uppercase">Horario</h3>
            <p className="mt-2 font-display text-2xl leading-snug">{SITE.hours.days}</p>
            <p className="mt-1 text-lg">
              {SITE.hours.slots[0]} <span className="text-madera/40">/</span> {SITE.hours.slots[1]} hs
            </p>
            <p className="text-sm text-madera/60">{SITE.hours.closed}</p>
            {status && (
              <p
                className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                  status.open ? 'bg-turquesa/12 text-turquesa-dark' : 'bg-rosa/12 text-[#A84A33]'
                }`}
                aria-live="polite"
              >
                <span className="relative flex h-2.5 w-2.5">
                  {status.open && <span className="absolute inset-0 animate-ping rounded-full bg-turquesa/70" />}
                  <span className={`relative h-2.5 w-2.5 rounded-full ${status.open ? 'bg-turquesa' : 'bg-rosa'}`} />
                </span>
                {status.label}
              </p>
            )}
          </m.div>

          <m.div variants={fadeUp} className="rounded-[2rem] border border-madera/10 bg-crema/80 p-7">
            <PhoneIcon className="h-8 w-8 text-rosa" />
            <h3 className="mt-5 text-sm font-semibold tracking-[0.2em] text-madera/60 uppercase">Contacto</h3>
            <a href={SITE.phoneHref} className="mt-2 block font-display text-2xl leading-snug hover:text-rosa">
              {SITE.phoneDisplay}
            </a>
            <p className="text-madera/70">Llamadas y WhatsApp</p>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mt-5 min-h-11 w-full py-2 text-sm"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Abrir WhatsApp
            </a>
          </m.div>
        </m.div>
      </div>
    </section>
  )
}
