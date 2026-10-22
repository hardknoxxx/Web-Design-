import { NAV_LINKS, SITE } from '../data/site'
import { LilyMark } from './Icons'

export function Footer() {
  return (
    <footer className="bg-hierro px-4 pt-16 pb-28 text-crema/70 sm:px-6 md:pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-3 text-crema">
            <LilyMark className="h-10 w-10 text-rosa [&_g]:stroke-crema" />
            <span className="leading-none">
              <span className="block font-script text-4xl">Lilium</span>
              <span className="text-[0.65rem] tracking-[0.3em] uppercase">House &amp; Coffee</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            Café de especialidad, chipas caseras y Bed &amp; Breakfast en el corazón de Puerto Iguazú.
          </p>
        </div>
        <nav aria-label="Secciones">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-turquesa">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <address className="text-sm leading-relaxed not-italic">
          {SITE.address}
          <br />
          {SITE.postalCode} · {SITE.city}
          <br />
          <a href={SITE.phoneHref} className="hover:text-turquesa">
            {SITE.phoneDisplay}
          </a>
          <br />
          <a href={SITE.bookingHref} target="_blank" rel="noopener noreferrer" className="hover:text-turquesa">
            Reservas online
          </a>
        </address>
      </div>
      <p className="mx-auto mt-12 max-w-6xl border-t border-crema/10 pt-6 text-xs text-crema/45">
        © {new Date().getFullYear()} {SITE.name} · Puerto Iguazú, Misiones, Argentina
      </p>
    </footer>
  )
}
