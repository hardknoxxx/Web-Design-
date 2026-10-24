import { useEffect, useRef, useState, type ComponentType } from 'react'
import { Butterfly } from '../components/Botanica'
import { Fern } from '../components/Flora'
import { CafePlato, CheesecakePlato, ChipaPlato, EnsaladaPlato, TePlato, TortaPlato, TostadoPlato } from '../components/Platos'
import { CARTA, SITE, whatsappLink, type CartaItem } from '../data/site'

/*
 * La carta como láminas de especímenes (referencia: Madie): cada plato con su dibujo, nombre y nota.
 * Los dibujos llegan sin pintar y se colorean al entrar en pantalla, igual que en la mesa.
 */

const DIBUJOS: Record<string, ComponentType> = {
  cafe: CafePlato,
  chipa: ChipaPlato,
  te: TePlato,
  tostado: TostadoPlato,
  ensalada: EnsaladaPlato,
  cheesecake: CheesecakePlato,
  torta: TortaPlato,
}

// la pestaña que se abre primero depende de la hora en Puerto Iguazú
function momentoPorHora() {
  const h = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', hourCycle: 'h23' }).format(new Date()),
  )
  return h >= 12 && h < 16 ? 'almuerzos' : h >= 16 ? 'meriendas' : 'desayunos'
}

function Lamina({ item }: { item: CartaItem }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        el.dataset.pintado = ''
        io.disconnect()
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (item.kind === 'foto') {
    return (
      <div ref={ref} className="lamina-foto">
        <img src={item.src} alt="" loading="lazy" decoding="async" width={300} height={300} />
      </div>
    )
  }
  const Dibujo = DIBUJOS[item.id]
  return (
    <div ref={ref} className="lamina-plato">
      <div className="plato-trazo">
        <Dibujo />
      </div>
      <div className="plato-color">
        <Dibujo />
      </div>
    </div>
  )
}

export function Carta() {
  const [tab, setTab] = useState(momentoPorHora)
  const momento = CARTA.find((c) => c.id === tab)!

  return (
    <section id="carta" aria-labelledby="carta-titulo" className="relative overflow-hidden bg-crema px-4 pt-24 pb-24 md:px-7 md:pt-32 md:pb-32">
      <Fern className="pointer-events-none absolute -right-6 bottom-0 h-[26rem] w-auto opacity-90 max-md:hidden" />
      <div className="relative mx-auto max-w-5xl">
        <div className="flex items-start gap-3">
          <h2 id="carta-titulo" className="font-display text-[2.6rem] leading-none font-semibold text-laguna-deep md:text-[4.5rem]">
            La carta
          </h2>
          <Butterfly className="mariposa mt-1 h-10 w-10 md:h-14 md:w-14" />
        </div>
        <p className="mt-4 max-w-[46ch] font-elegante text-lg text-madera-soft">
          Desayunos, almuerzos y meriendas. Lo que sale de la vitrina cambia cada día: lo contamos en Instagram.
        </p>

        <div role="tablist" aria-label="Momento del día" className="mt-10 flex flex-wrap gap-2">
          {CARTA.map((c) => (
            <button
              key={c.id}
              role="tab"
              id={`tab-${c.id}`}
              aria-selected={tab === c.id}
              aria-controls="carta-panel"
              onClick={() => setTab(c.id)}
              className="pestana"
            >
              {c.label} <span className="tabular-nums opacity-70">desde {c.time}</span>
            </button>
          ))}
        </div>

        <div id="carta-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-10">
          <p className="font-hand text-[1.6rem] leading-tight text-turquesa-dark">{momento.intro}</p>
          <ul key={tab} className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {momento.items.map((item) => (
              <li key={item.name} className="especimen">
                <Lamina item={item} />
                <div className="min-w-0">
                  <h3 className="font-display text-[1.35rem] leading-tight font-semibold text-laguna-deep">{item.name}</h3>
                  <p className="font-hand text-[1.3rem] leading-tight text-turquesa-dark">{item.note}</p>
                  <p className="mt-1 text-base leading-snug text-madera-soft">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3">
          <a href={SITE.instagramHref} target="_blank" rel="noopener" className="boton">
            Ver la vitrina de hoy en Instagram
          </a>
          <a href={whatsappLink('Hola Lilium! Quería hacer un pedido para llevar: ')} target="_blank" rel="noopener" className="boton boton-claro">
            Pedir para llevar
          </a>
        </div>
      </div>
    </section>
  )
}
