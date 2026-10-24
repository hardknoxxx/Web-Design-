import { m, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { RitualDecor } from '../components/Ambiente'
import { Fundido } from '../components/Fundido'
import { CakeStand, ChipaBasket, Cup } from '../components/Botanica'

/**
 * 03–05 · El ritual. Escena fijada de 3 actos: la taza entra, cambia de lugar cuando
 * llega la chipa, y ambas suben a la esquina cuando se levanta la campana de la torta.
 */

const ACTS = [
  {
    n: '01',
    title: 'Café de especialidad',
    note: '¿espresso o algo frío?',
    text: 'Granos seleccionados y tazas generosas: del espresso intenso a las bebidas frías para el calor misionero.',
  },
  {
    n: '02',
    title: 'Chipa casera',
    note: '¡calentitas!',
    text: 'Almidón de mandioca y queso, como manda la tradición del Litoral. Calentitas, para acompañar el primer sorbo.',
  },
  {
    n: '03',
    title: 'Pastelería',
    note: 'mirá la vitrina',
    text: 'La vitrina se abre: tortas, cheesecakes y tentaciones para la merienda.',
  },
]

// rangos de scroll siempre dentro de [0, 1] y crecientes (requisito de las animaciones aceleradas)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const range = (...v: number[]) => v.map(clamp01)

function Act({ p, i, act }: { p: MotionValue<number>; i: number; act: (typeof ACTS)[number] }) {
  const start = i / 3
  const end = (i + 1) / 3
  const first = i === 0
  const last = i === ACTS.length - 1
  // un acto termina de salir antes de que entre el siguiente (sin superposición)
  const r = range(first ? 0 : start, first ? 0.01 : start + 0.05, end - 0.05, last ? 1 : end)
  const opacity = useTransform(p, r, [first ? 1 : 0, 1, 1, last ? 1 : 0])
  const y = useTransform(p, r, [first ? 0 : 50, 0, 0, last ? 0 : -40])
  const clip = useTransform(p, range(first ? 0 : start, first ? 0.01 : start + 0.06), [
    first ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)',
    'inset(0% 0 0 0)',
  ])
  return (
    <m.div style={{ opacity, y }} className="absolute inset-x-0 top-0">
      <p className="flex items-baseline gap-3">
        <span className="font-display text-2xl font-semibold text-tierra tabular-nums">{act.n}</span>
        <span className="inline-block -rotate-3 font-hand text-2xl text-musgo">{act.note}</span>
      </p>
      <m.h3 style={{ clipPath: clip }} className="mt-1 font-display text-[clamp(2.4rem,9vw,4.5rem)] leading-[0.98] font-semibold text-balance">
        {act.title}
      </m.h3>
      <p className="mt-4 max-w-sm text-base leading-relaxed text-madera/75 sm:text-lg">{act.text}</p>
    </m.div>
  )
}

function Dot({ p, i }: { p: MotionValue<number>; i: number }) {
  const r = range(i / 3 - 0.04 + (i === 0 ? 0.04 : 0), i / 3 + 0.02, (i + 1) / 3 - 0.04, (i + 1) / 3 + 0.02 - (i === 2 ? 0.02 : 0))
  const w = useTransform(p, r, [i === 0 ? 28 : 8, 28, 28, i === 2 ? 28 : 8])
  const bg = useTransform(p, r, [i === 0 ? '#64BCB0' : '#3D231433', '#64BCB0', '#64BCB0', i === 2 ? '#64BCB0' : '#3D231433'])
  return <m.span style={{ width: w, backgroundColor: bg }} className="block h-2 rounded-full" />
}

export function Ritual() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // Taza: entra, se corre a la izquierda, sube a la esquina
  const cupX = useTransform(p, [0, 0.33, 0.43, 0.66, 0.76], ['0%', '0%', '-46%', '-46%', '-40%'])
  const cupY = useTransform(p, [0, 0.12, 0.33, 0.43, 0.66, 0.76], ['45%', '0%', '0%', '18%', '18%', '20%'])
  const cupS = useTransform(p, [0.33, 0.43, 0.66, 0.76], [1, 0.58, 0.58, 0.4])
  const steam = useTransform(p, [0.02, 0.2], [0, 1])

  // Chipa: entra desde la derecha, luego sube a la esquina
  const chipX = useTransform(p, [0.3, 0.43, 0.66, 0.76], ['140%', '22%', '22%', '44%'])
  const chipY = useTransform(p, [0.3, 0.43, 0.66, 0.76], ['8%', '0%', '0%', '26%'])
  const chipS = useTransform(p, [0.66, 0.76], [1, 0.4])
  const chipR = useTransform(p, [0.3, 0.43], [24, 0])

  // Torta: sube desde abajo (detrás) y la campana se levanta; taza y chipa la flanquean
  const cakeY = useTransform(p, [0.62, 0.76], ['120%', '6%'])
  const dome = useTransform(p, [0.8, 0.95], [0, -62])
  const cakeOpacity = useTransform(p, [0.6, 0.66], [0, 1])

  // entra por debajo del final del amanecer: aparece mientras se abre el follaje (sin pantalla vacía)
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  const enterOpacity = useTransform(enter, [0.76, 1], [0, 1])
  const enterY = useTransform(enter, [0.76, 1], [36, 0])

  return (
    <section ref={ref} id="ritual" className="relative z-[1] -mt-[100svh] h-[340svh]" aria-label="El ritual: café, chipa y pastelería">
      <div className="absolute top-0" data-phase="#FAF7F2|#3D2314|09:00" />
      <div className="absolute top-[33%]" data-phase="#F0EAE1|#3D2314|10:00" />
      <div className="absolute top-[66%]" data-phase="#F1DCC4|#3D2314|11:00" />

      <m.div style={{ opacity: enterOpacity, y: enterY }} className="sticky top-0 grid h-[100svh] grid-rows-[auto_1fr] overflow-hidden px-9 pt-24 pb-10 sm:px-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:grid-rows-1 lg:items-center lg:gap-10 lg:px-24 lg:pt-16">
        <RitualDecor />
        {/* textos de los 3 actos */}
        <div className="relative z-10 h-[13.5rem] sm:h-[15rem] lg:h-[22rem]">
          {ACTS.map((a, i) => (
            <Act key={a.n} p={p} i={i} act={a} />
          ))}
          <div className="absolute bottom-0 left-0 flex items-center gap-2" aria-hidden="true">
            {ACTS.map((a, i) => (
              <Dot key={a.n} p={p} i={i} />
            ))}
          </div>
        </div>

        {/* escenario */}
        <div className="relative z-10 min-h-0">
          <div className="absolute inset-x-0 bottom-[6%] mx-auto h-3 w-[70%] rounded-[50%] bg-madera/10 blur-[2px]" />
          <m.div style={{ y: cakeY, opacity: cakeOpacity }} className="absolute inset-x-0 bottom-[2%] mx-auto w-[min(72%,400px)] origin-bottom">
            <CakeStand dome={dome} className="w-full" />
          </m.div>
          <m.div
            style={{ x: cupX, y: cupY, scale: cupS }}
            className="absolute inset-x-0 bottom-[6%] mx-auto w-[min(78%,420px)] origin-bottom"
          >
            <Cup steam={steam} className="w-full" />
          </m.div>
          <m.div
            style={{ x: chipX, y: chipY, scale: chipS, rotate: chipR }}
            className="absolute inset-x-0 bottom-[6%] mx-auto w-[min(68%,380px)] origin-bottom"
          >
            <ChipaBasket className="w-full" />
          </m.div>
        </div>
        <Fundido className="z-20 h-[10%]" />
      </m.div>
    </section>
  )
}
