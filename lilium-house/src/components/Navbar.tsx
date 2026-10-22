import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useState } from 'react'
import { NAV_LINKS, SITE, whatsappLink } from '../data/site'
import { CloseIcon, LilyMark, MenuIcon, WhatsAppIcon } from './Icons'
import { EASE } from './Reveal'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,padding] duration-500 ease-organic ${
        scrolled || open
          ? 'bg-crema/92 py-2 shadow-[0_1px_0_rgb(61_35_20/0.08),0_12px_30px_-20px_rgb(61_35_20/0.35)] md:backdrop-blur-md'
          : 'py-4'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Principal">
        <a href="#inicio" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <LilyMark className="h-9 w-9 text-rosa" />
          <span className="leading-none">
            <span className="block font-script text-[1.75rem] leading-[0.85]">Lilium</span>
            <span className="block text-[0.6rem] font-medium tracking-[0.3em] text-madera/70 uppercase">
              House &amp; Coffee
            </span>
          </span>
        </a>

        <ul className="hidden items-center gap-6 md:flex lg:gap-8">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="relative text-sm font-medium text-madera/80 transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-rosa after:transition-transform after:duration-300 hover:text-madera hover:after:scale-x-100"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={SITE.bookingHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary hidden min-h-10 px-5 py-2 text-sm sm:inline-flex"
          >
            Reservar online
          </a>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-madera/20 md:hidden"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            className="md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <ul className="flex flex-col gap-1 px-4 pt-4 pb-6">
              {NAV_LINKS.map((l, i) => (
                <m.li
                  key={l.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i + 0.1, ease: EASE }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 font-display text-2xl text-madera active:bg-estuco"
                  >
                    {l.label}
                  </a>
                </m.li>
              ))}
              <li className="mt-3 grid gap-3 px-4">
                <a href={SITE.bookingHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
                  Reservar online
                </a>
                <a
                  href={whatsappLink('Hola Lilium! Quería consultar disponibilidad.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Escribinos por WhatsApp
                </a>
              </li>
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  )
}
