import { useRef } from 'react'
import { Edge } from '../components/Edge'
import { Fern, HeartLeaf } from '../components/Flora'
import { CafePlato, CheesecakePlato, ChipaPlato, TePlato, TortaPlato } from '../components/Platos'
import { CARTA, whatsappLink } from '../data/site'
import { gsap, MOTION_OK, useGsap } from '../lib/gsap'

const PLATOS = { cafe: CafePlato, chipa: ChipaPlato, te: TePlato, cheesecake: CheesecakePlato, torta: TortaPlato }

// cada plato se sirve distinto: lado, giro y tiempo propios (nada en espejo)
const SERVE = [
  { from: { x: -70, y: 60, rotation: -24 }, rest: -6, dur: 1.1, scale: 1 },
  { from: { x: 90, y: 30, rotation: 30 }, rest: 9, dur: 0.85, scale: 0.92 },
  { from: { x: -40, y: 110, rotation: 14 }, rest: 3, dur: 1.3, scale: 0.98 },
  { from: { x: 60, y: 80, rotation: -36 }, rest: -11, dur: 0.95, scale: 0.9 },
  { from: { x: -90, y: 40, rotation: 20 }, rest: 5, dur: 1.15, scale: 0.95 },
]

/** 06 · La carta. Los platos llegan a la mesa a medida que se scrollea. */
export function Carta() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, () => {
    const q = gsap.utils.selector(ref)
    gsap.matchMedia().add(MOTION_OK, () => {
      q('[data-plato]').forEach((el, i) => {
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
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
          },
        )
      })
      gsap.from(q('[data-ticket]'), {
        y: 50,
        rotation: 8,
        autoAlpha: 0,
        duration: 1,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: q('[data-ticket]')[0], start: 'top 92%', toggleActions: 'play none none reverse' },
      })
      // hojas que asoman por los bordes de la mesa, cada una a su velocidad
      gsap.to(q('[data-table-leaf="a"]'), { yPercent: -18, rotation: 6, ease: 'none', scrollTrigger: { trigger: ref.current, scrub: 1.5 } })
      gsap.to(q('[data-table-leaf="b"]'), { yPercent: -40, rotation: -12, ease: 'none', scrollTrigger: { trigger: ref.current, scrub: 0.6 } })
    })
  })

  return (
    <section
      ref={ref}
      id="carta"
      data-phase="#3B2416|#FAF7F2|11:45"
      className="wood-table relative z-[3] overflow-x-clip px-7 pt-24 pb-28 text-crema sm:px-14"
      aria-label="La carta"
    >
      <Edge color="#3B2416" flip />
      <div data-table-leaf="a" className="pointer-events-none absolute -top-6 -left-16 w-48 rotate-[120deg] opacity-80 sm:w-64">
        <Fern color="#415521" className="w-full" />
      </div>
      <div data-table-leaf="b" className="pointer-events-none absolute -right-10 bottom-10 w-36 -rotate-[70deg] opacity-90 sm:w-48">
        <HeartLeaf color="#2F4A22" className="w-full" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <p className="inline-block -rotate-2 font-hand text-3xl text-miel">11:45 · la carta</p>
        <h2 className="mt-2 font-display text-[clamp(2.4rem,9vw,4.5rem)] leading-[0.98] font-semibold text-balance">
          Para la mesa
        </h2>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-crema/75">
          Lo que más se pide en Lilium, recién servido.
        </p>

        <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-10 lg:grid-cols-3">
          {CARTA.map((item, i) => {
            const Plato = PLATOS[item.id]
            return (
              <li key={item.id} className={`flex flex-col items-center text-center ${i % 2 ? 'mt-10 lg:mt-0' : ''} ${i === 1 ? 'lg:mt-14' : ''}`}>
                <div data-plato="" className="aspect-square w-[88%] max-w-[260px] [filter:drop-shadow(0_18px_14px_rgb(0_0_0/0.45))]">
                  <Plato />
                </div>
                <p className="mt-4 -rotate-2 font-hand text-xl leading-none text-miel">{item.note}</p>
                <h3 className="mt-1 font-display text-xl leading-tight font-semibold sm:text-2xl">{item.name}</h3>
                <p className="mt-1 max-w-[16rem] text-sm leading-snug text-crema/70 sm:text-base">{item.desc}</p>
              </li>
            )
          })}
          <li className="flex items-center justify-center">
            <a
              data-ticket=""
              href={whatsappLink('Hola Lilium! ¿Qué hay hoy en la vitrina?')}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full max-w-[220px] rotate-3 bg-[#FFFDF6] px-5 py-6 font-ticket text-madera shadow-[0_18px_28px_-14px_rgb(0_0_0/0.6)] transition-transform duration-300 hover:rotate-0 [mask:radial-gradient(circle_6px_at_50%_0,transparent_98%,#000)_top/16px_51%_repeat-x,radial-gradient(circle_6px_at_50%_100%,transparent_98%,#000)_bottom/16px_51%_repeat-x]"
            >
              <span className="block text-center text-xs tracking-[0.25em] uppercase">Comanda</span>
              <span className="mt-3 block border-t border-dashed border-madera/40 pt-3 text-sm leading-relaxed">
                ¿Qué hay hoy en la vitrina?
              </span>
              <span className="mt-3 block text-sm font-bold text-tierra underline-offset-4 group-hover:underline">Preguntanos →</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  )
}
