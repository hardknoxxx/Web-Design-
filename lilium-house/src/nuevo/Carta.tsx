import { useEffect, useState, type ComponentType } from 'react'
import { CafePlato, CheesecakePlato, ChipaPlato, EnsaladaPlato, TePlato, TortaPlato, TostadoPlato } from '../components/Platos'
import { CARTA, SITE, whatsappLink, type CartaItem } from '../data/site'
import { FondoAnimado } from './primitivas/FondoAnimado'

/*
 * La carta como láminas de especímenes (referencia: Madie): cada plato con su dibujo, nombre y nota.
 * Siempre a color: al cambiar de momento las láminas entran sin pasar por gris.
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
  if (item.kind === 'foto') {
    return (
      <div className="lamina-foto">
        <img src={item.src} alt="" loading="lazy" decoding="async" width={300} height={300} />
      </div>
    )
  }
  const Dibujo = DIBUJOS[item.id]
  return (
    <div className="lamina-plato">
      <Dibujo />
    </div>
  )
}

export function Carta() {
  // el HTML se genera al compilar: arranca en desayunos y, ya en el navegador, abre la pestaña de la hora
  const [tab, setTab] = useState('desayunos')
  useEffect(() => setTab(momentoPorHora()), [])
  const momento = CARTA.find((c) => c.id === tab)!

  return (
    <section id="carta" aria-labelledby="carta-titulo" className="relative overflow-hidden bg-crema px-4 pt-20 pb-24 md:px-7 md:pt-28 md:pb-32">
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="flex items-start gap-3">
          <h2 id="carta-titulo" className="titulo-vitrina text-[3.4rem] leading-[0.88] text-laguna-deep md:text-[6.5rem]">
            La carta
          </h2>
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
              {tab === c.id && <FondoAnimado grupo="carta-pestana" className="rounded-full bg-laguna-deep" />}
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
                  <h3 className="titulo-vitrina text-[1.6rem] leading-[0.95] text-laguna-deep md:text-[1.9rem]">{item.name}</h3>
                  <p className="font-hand text-[1.3rem] leading-tight text-turquesa-dark">{item.note}</p>
                  <p className="mt-1 text-base leading-snug text-madera-soft">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3">
          <a href={SITE.instagramHref} target="_blank" rel="noopener" className="pildora pildora-laguna">
            Ver la vitrina de hoy en Instagram
          </a>
          <a href={whatsappLink('Hola Lilium! Quería hacer un pedido para llevar: ')} target="_blank" rel="noopener" className="pildora pildora-kraft">
            Pedir para llevar
          </a>
        </div>
      </div>
    </section>
  )
}
