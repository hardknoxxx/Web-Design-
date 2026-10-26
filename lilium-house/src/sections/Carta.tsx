import { m } from 'motion/react'
import { useRef, useState } from 'react'
import { HojasTransicion } from '../components/HojasTransicion'
import { Reveal, RevealWords } from '../components/Reveal'
import { Fern, HeartLeaf } from '../components/Flora'
import { CafePlato, CheesecakePlato, ChipaPlato, EnsaladaPlato, TePlato, TortaPlato, TostadoPlato } from '../components/Platos'
import { CARTA, whatsappLink, type CartaItem } from '../data/site'
import { gsap, MOTION_OK, useGsap } from '../lib/gsap'

const PLATOS = {
  cafe: CafePlato,
  chipa: ChipaPlato,
  te: TePlato,
  cheesecake: CheesecakePlato,
  torta: TortaPlato,
  tostado: TostadoPlato,
  ensalada: EnsaladaPlato,
}

// cada plato se sirve distinto: lado, giro y tiempo propios (nada en espejo)
const SERVE = [
  { from: { x: -70, y: 60, rotation: -24 }, rest: -6, dur: 1.1, scale: 1 },
  { from: { x: 90, y: 30, rotation: 30 }, rest: 9, dur: 0.85, scale: 0.92 },
  { from: { x: -40, y: 110, rotation: 14 }, rest: 3, dur: 1.3, scale: 0.98 },
  { from: { x: 60, y: 80, rotation: -36 }, rest: -11, dur: 0.95, scale: 0.9 },
  { from: { x: -90, y: 40, rotation: 20 }, rest: 5, dur: 1.15, scale: 0.95 },
]

// la pestaña que se abre primero depende de la hora en Puerto Iguazú
function tabByHour() {
  const h = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', hourCycle: 'h23' }).format(new Date()),
  )
  return h >= 12 && h < 16 ? 'almuerzos' : h >= 16 ? 'meriendas' : 'desayunos'
}

function Item({ item }: { item: CartaItem }) {
  if (item.kind === 'foto' || item.kind === 'recorte') {
    const src = item.kind === 'recorte' ? `${item.src}-360.webp` : item.src
    // foto de la casa: copia impresa apoyada sobre la mesa
    return (
      <div data-plato="" className="w-[86%] max-w-[240px] bg-[#FFFDF7] p-2 pb-7 shadow-[0_18px_22px_-12px_rgb(0_0_0/0.6)]">
        <img src={src} alt={item.name} loading="lazy" decoding="async" width={300} height={300} className="aspect-square w-full object-cover" />
      </div>
    )
  }
  const Plato = PLATOS[item.id]
  return (
    <div data-plato="" className="aspect-square w-[88%] max-w-[260px] [filter:drop-shadow(0_18px_14px_rgb(0_0_0/0.45))]">
      <Plato />
    </div>
  )
}

/** 06 · La carta. Desayunos, almuerzos y meriendas: los platos llegan a la mesa al scrollear. */
export function Carta() {
  const ref = useRef<HTMLElement>(null)
  const [tab, setTab] = useState(tabByHour)
  // la primera vez los platos se sirven con el scroll; al cambiar de pestaña, el mozo los tira
  const switched = useRef(false)

  useGsap(
    ref,
    () => {
      const q = gsap.utils.selector(ref)
      gsap.matchMedia().add(MOTION_OK, () => {
        // hojas que asoman por los bordes de la mesa, cada una a su velocidad
        gsap.to(q('[data-table-leaf="a"]'), { yPercent: -18, rotation: 6, ease: 'none', scrollTrigger: { trigger: ref.current, scrub: 1.5 } })
        gsap.to(q('[data-table-leaf="b"]'), { yPercent: -40, rotation: -12, ease: 'none', scrollTrigger: { trigger: ref.current, scrub: 0.6 } })
        if (switched.current) {
          // llegan desde los costados girando, patinan y se asientan con un golpecito
          q(`[data-panel="${tab}"] [data-plato]`).forEach((el, i) => {
            const s = SERVE[i % SERVE.length]
            const side = i % 2 ? 1 : -1
            gsap
              .timeline({ delay: 0.05 + i * 0.09 })
              .fromTo(
                el,
                { x: side * window.innerWidth * 0.95, y: -30 - (i % 3) * 18, rotation: side * (160 + i * 30), scale: s.scale * 0.92, autoAlpha: 1 },
                { x: 0, y: 0, rotation: s.rest - side * 6, scale: s.scale, duration: 0.62, ease: 'power3.out' },
              )
              .to(el, { rotation: s.rest, duration: 0.22, ease: 'back.out(3)' })
              .fromTo(el, { scale: s.scale * 1.04 }, { scale: s.scale, duration: 0.16, ease: 'power2.out' }, '<')
          })
          gsap.fromTo(
            q(`[data-panel="${tab}"] [data-ticket]`),
            { x: window.innerWidth * 0.8, rotation: 40, autoAlpha: 1 },
            { x: 0, rotation: 3, duration: 0.7, delay: 0.3, ease: 'power3.out' },
          )
          return
        }
        q(`[data-panel="${tab}"] [data-plato]`).forEach((el, i) => {
          const s = SERVE[i % SERVE.length]
          gsap.fromTo(
            el,
            { ...s.from, autoAlpha: 0, scale: s.scale * 0.85 },
            {
              x: 0,
              y: 0,
              rotation: s.rest,
              scale: s.scale,
              autoAlpha: 1,
              duration: s.dur,
              delay: (i % 2) * 0.08,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
            },
          )
        })
        gsap.from(q(`[data-panel="${tab}"] [data-ticket]`), {
          y: 50,
          rotation: 8,
          autoAlpha: 0,
          duration: 1,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: q(`[data-panel="${tab}"] [data-ticket]`)[0], start: 'top 92%', toggleActions: 'play none none reverse' },
        })
      })
    },
    [tab],
  )


  return (
    <section
      ref={ref}
      id="carta"
      data-phase="#3B2416|#FAF7F2|11:45"
      className="relative z-[3] overflow-x-clip px-7 pt-24 pb-28 text-crema sm:px-14"
      aria-label="La carta"
    >
      <HojasTransicion v="carta" />
      {/* vetas de la mesa: aparecen y se van con degradé, sobre el fondo del día */}
      <div aria-hidden="true" className="wood-table pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]" />
      <div data-table-leaf="a" className="pointer-events-none absolute -top-6 -left-16 w-48 rotate-[120deg] opacity-80 sm:w-64">
        <Fern color="#415521" className="w-full" />
      </div>
      <div data-table-leaf="b" className="pointer-events-none absolute -right-10 bottom-10 w-36 -rotate-[70deg] opacity-90 sm:w-48">
        <HeartLeaf color="#2F4A22" className="w-full" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <Reveal>
          <p className="inline-block -rotate-2 font-hand text-3xl text-turquesa">11:45 · la carta</p>
        </Reveal>
        <h2 className="mt-2 font-display text-[clamp(2.4rem,9vw,4.5rem)] leading-[0.98] font-semibold text-balance">
          <RevealWords text="Desayunos, almuerzos y meriendas" delay={0.1} />
        </h2>

        {/* pestañas: tres momentos del día; la píldora menta se desliza hasta el elegido */}
        <Reveal delay={0.25}>
          <div role="tablist" aria-label="Momentos del día" className="mt-8 flex w-full max-w-md rounded-full bg-black/25 p-1 ring-1 ring-crema/10">
            {CARTA.map((c) => {
              const active = c.id === tab
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  id={`tab-${c.id}`}
                  aria-selected={active}
                  aria-controls={`panel-${c.id}`}
                  onClick={() => {
                    if (c.id === tab) return
                    switched.current = true
                    setTab(c.id)
                  }}
                  className={`relative flex flex-1 flex-col items-center rounded-full px-2 py-2 transition-[color,transform] duration-300 active:scale-95 ${active ? 'text-laguna-deep' : 'text-crema/75 hover:text-crema'}`}
                >
                  {active && (
                    <m.span
                      layoutId="carta-tab"
                      className="absolute inset-0 rounded-full bg-turquesa shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_8px_20px_-8px_rgb(100_188_176/0.9)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative font-ticket text-[0.65rem] tabular-nums opacity-80">{c.time}</span>
                  <span className="relative text-sm font-semibold sm:text-base">{c.label}</span>
                </button>
              )
            })}
          </div>
        </Reveal>
        {/* los tres momentos ocupan la misma celda: el alto de la página no cambia y la hora de
            arriba sigue solo al scroll */}
        <div className="grid [grid-template-areas:'stack']">
          {CARTA.map((c) => {
            const active = c.id === tab
            return (
              <div
                key={c.id}
                id={`panel-${c.id}`}
                data-panel={c.id}
                role="tabpanel"
                aria-labelledby={`tab-${c.id}`}
                aria-hidden={!active}
                inert={!active}
                className={`[grid-area:stack] transition-opacity duration-500 ${active ? 'opacity-100' : 'pointer-events-none invisible opacity-0'}`}
              >
                <Reveal delay={0.35}>
                  <p className="mt-4 max-w-md text-lg leading-relaxed text-crema/75">{c.intro}</p>
                </Reveal>
                <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-10 lg:grid-cols-3">
                  {c.items.map((item, i) => (
                    <li key={item.name} className={`flex flex-col items-center text-center ${i % 2 ? 'mt-10 lg:mt-0' : ''} ${i === 1 ? 'lg:mt-14' : ''}`}>
                      <Item item={item} />
                      <p className="mt-4 -rotate-2 font-hand text-xl leading-none text-miel">{item.note}</p>
                      <h3 className="mt-1 font-display text-xl leading-tight font-semibold sm:text-2xl">{item.name}</h3>
                      <p className="mt-1 max-w-[16rem] text-sm leading-snug text-crema/70 sm:text-base">{item.desc}</p>
                    </li>
                  ))}
                  <li className="flex items-center justify-center">
                    <a
                      data-ticket=""
                      href={whatsappLink(`Hola Lilium! ¿Qué hay hoy para ${c.id === 'almuerzos' ? 'almorzar' : c.id === 'meriendas' ? 'merendar' : 'desayunar'}?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block w-full max-w-[220px] rotate-3 bg-[#FFFDF6] px-5 py-6 font-ticket text-madera shadow-[0_18px_28px_-14px_rgb(0_0_0/0.6)] transition-transform duration-300 hover:rotate-0 [mask:radial-gradient(circle_6px_at_50%_0,transparent_98%,#000)_top/16px_51%_repeat-x,radial-gradient(circle_6px_at_50%_100%,transparent_98%,#000)_bottom/16px_51%_repeat-x]"
                    >
                      <span className="block text-center text-xs tracking-[0.25em] uppercase">Comanda</span>
                      <span className="mt-3 block border-t border-dashed border-madera/40 pt-3 text-sm leading-relaxed">
                        {c.id === 'almuerzos' ? '¿Cuál es el plato del día?' : '¿Qué hay hoy en la vitrina?'}
                      </span>
                      <span className="mt-3 block text-sm font-bold text-turquesa-dark underline-offset-4 group-hover:underline">Preguntanos →</span>
                    </a>
                  </li>
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
