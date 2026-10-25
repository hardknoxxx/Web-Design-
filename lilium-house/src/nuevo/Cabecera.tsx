import { useEffect, useRef, useState } from 'react'
import { InstagramIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from '../components/Icons'
import { SITE, whatsappLink } from '../data/site'
import { useOpenStatus } from '../hooks/useOpenStatus'
import { gsap, reducido } from './animar'
import { LogoLilium } from './LogoLilium'
import { Estado } from './Piezas'
import { FondoAnimado } from './primitivas/FondoAnimado'

/*
 * Cabecera fija (barra crema con el logo, como la de la referencia) y menú a pantalla completa: un panel menta
 * que se abre desde el botón (clip-path circular con origen en el botón) con las secciones en letras enormes.
 * Escape o el botón lo cierran; el foco entra al panel y vuelve al botón.
 */

const SECCIONES = [
  { href: '#mesa', label: 'La mesa' },
  { href: '#vitrina', label: 'La vitrina' },
  { href: '#carta', label: 'La carta' },
  { href: '#visita', label: 'Visitanos' },
]

export function Cabecera() {
  const status = useOpenStatus()
  const [abierto, setAbierto] = useState(false)
  const [senalada, setSenalada] = useState<string | null>(null)
  const botonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const panel = panelRef.current!
    panel.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
      // el foco no sale del panel mientras está abierto
      if (e.key === 'Tab') {
        const f = [...panel.querySelectorAll<HTMLElement>('a, button')]
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    // las secciones suben desde su máscara, en cascada; los accesos de abajo llegan después
    if (!reducido()) {
      gsap.fromTo(panel.querySelectorAll('.menu-enlace-texto'), { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.06, delay: 0.1 })
      gsap.fromTo(panel.querySelectorAll('.menu-pie > *'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, delay: 0.3 })
    }
    document.documentElement.style.overflow = 'hidden'
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      botonRef.current?.focus({ preventScroll: true })
    }
  }, [abierto])

  // el círculo del panel nace en el botón del menú
  const origen = () => {
    const r = botonRef.current?.getBoundingClientRect()
    if (r) panelRef.current?.style.setProperty('--origen', `${r.left + r.width / 2}px ${r.top + r.height / 2}px`)
  }

  return (
    <>
      <header className="cabecera">
        <a href="#mesa" className="cabecera-logo" aria-label="Lilium Coffee Lounge, inicio">
          <LogoLilium className="h-full w-auto" />
        </a>
        <div className="flex items-center gap-2 md:gap-3">
          <Estado status={status} className="max-md:hidden" />
          <a href={SITE.mapsHref} target="_blank" rel="noopener" className="pildora pildora-laguna max-sm:hidden">
            Cómo llegar
          </a>
          <button
            ref={botonRef}
            type="button"
            className="menu-boton"
            aria-expanded={abierto}
            aria-controls="menu-panel"
            onClick={() => {
              origen()
              setAbierto((v) => !v)
            }}
          >
            <span className="menu-rayas" aria-hidden="true" data-abierto={abierto || undefined}>
              <span />
              <span />
            </span>
            <span>{abierto ? 'Cerrar' : 'Menú'}</span>
          </button>
        </div>
      </header>

      <div ref={panelRef} id="menu-panel" className="menu-panel" data-abierto={abierto || undefined} role="dialog" aria-modal="true" aria-label="Menú" inert={!abierto}>
        <nav aria-label="Secciones" className="menu-secciones" onPointerLeave={() => setSenalada(null)}>
          {SECCIONES.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="menu-enlace"
              onClick={() => setAbierto(false)}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setSenalada(s.href)}
            >
              {senalada === s.href && <FondoAnimado grupo="menu-senal" className="rounded-[1.25rem] bg-laguna-deep" />}
              <span className="menu-enlace-texto">{s.label}</span>
            </a>
          ))}
        </nav>
        <div className="menu-pie">
          <a href={SITE.mapsHref} target="_blank" rel="noopener" className="pildora pildora-laguna">
            <MapPinIcon className="h-5 w-5" />
            Cómo llegar
          </a>
          <a href={whatsappLink()} target="_blank" rel="noopener" className="pildora pildora-crema">
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>
          <a href={SITE.instagramHref} target="_blank" rel="noopener" className="pildora pildora-crema">
            <InstagramIcon className="h-5 w-5" />@{SITE.instagram}
          </a>
          <a href={SITE.phoneHref} className="pildora pildora-crema">
            <PhoneIcon className="h-5 w-5" />
            Llamar
          </a>
          <p className="w-full font-elegante text-[0.95rem] text-laguna-deep">
            {SITE.address} · {SITE.city}
          </p>
        </div>
      </div>
    </>
  )
}
