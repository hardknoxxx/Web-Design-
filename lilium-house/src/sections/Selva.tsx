import { m, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Butterfly, Leaf, Monstera, Toucan } from '../components/Botanica'
import { Edge } from '../components/Edge'
import { BananaLeaf, Calathea, Fern, HeartLeaf, PalmFrond } from '../components/Flora'
import { Sotobosque } from '../components/Paisaje'
import { CoatiPaseo } from '../components/Ambiente'

/**
 * 07 · La selva entra. Escena fijada con capas parallax a distinta velocidad:
 * bruma de cataratas (lenta), hojas de fondo, tucán que cruza y hojas de frente (rápidas).
 */
export function Selva() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const mistY = useTransform(p, [0, 1], ['-8%', '12%'])
  const backY = useTransform(p, [0, 1], ['18%', '-12%'])
  // hojas de frente asimétricas: a la izquierda una monstera que sube rápido y se abre;
  // a la derecha banano y pindó, más lentos, que se inclinan hacia adentro tarde
  const frontLY = useTransform(p, [0, 1], ['42%', '-28%'])
  const frontL = useTransform(p, [0, 1], [-22, 8])
  const frontRY = useTransform(p, [0, 0.35, 1], ['70%', '40%', '-6%'])
  const bananaR = useTransform(p, [0, 1], [34, 10])
  const palmR = useTransform(p, [0.2, 1], [-6, -30])
  const sotoY = useTransform(p, [0, 1], ['30%', '0%'])

  const toucanX = useTransform(p, [0.12, 0.88], ['-45vw', '115vw'])
  const toucanY = useTransform(p, (v) => `${Math.sin(v * Math.PI * 3) * 5}vh`)
  const b1x = useTransform(p, [0, 1], ['-10vw', '40vw'])
  const b1y = useTransform(p, (v) => `${-v * 30 + Math.sin(v * 14) * 4}vh`)
  const b2x = useTransform(p, [0, 1], ['20vw', '-30vw'])
  const b2y = useTransform(p, (v) => `${-v * 20 + Math.cos(v * 12) * 5}vh`)

  const textOpacity = useTransform(p, [0.05, 0.2, 0.85, 1], [0, 1, 1, 0.6])
  const textY = useTransform(p, [0.05, 0.2], [40, 0])

  return (
    <section ref={ref} id="selva" className="relative z-[5] h-[240svh] bg-musgo" aria-label="La selva de Puerto Iguazú">
      <div className="absolute top-0" data-phase="#415521|#FAF7F2|18:00" />
      <Edge color="#415521" flip />
      <div className="sticky top-0 h-[100svh] overflow-hidden text-crema">
        {/* bruma de las cataratas: velos suaves, sin bordes duros */}
        <m.div style={{ y: mistY }} className="absolute inset-x-0 top-0 flex h-[85%] justify-around px-2 will-change-transform [mask-image:linear-gradient(to_bottom,black,transparent_85%)]">
          {[0.07, 0.11, 0.06, 0.09, 0.05].map((o, i) => (
            <div
              key={i}
              className="h-full w-[22%] rounded-b-full bg-[linear-gradient(to_right,transparent,white_40%,white_60%,transparent)]"
              style={{ opacity: o, height: `${70 + (i % 3) * 10}%` }}
            />
          ))}
        </m.div>

        <m.div style={{ y: backY }} className="absolute inset-0 will-change-transform">
          <Leaf className="absolute top-[18%] -left-6 w-28 -rotate-[30deg]" color="#5E7A2A" />
          <Leaf className="absolute top-[10%] -right-4 w-24 rotate-[40deg]" color="#5E7A2A" />
          <Leaf className="absolute top-[58%] right-[12%] w-16 rotate-[70deg]" color="#97AD3D" />
        </m.div>

        <m.div
          style={{ opacity: textOpacity, y: textY }}
          className="relative z-10 mx-auto flex h-full w-full max-w-3xl flex-col justify-center px-9 pb-[18svh] text-center sm:px-14"
        >
          <p className="inline-block -rotate-2 font-hand text-3xl text-[#D4E09B]">18:00 · Puerto Iguazú</p>
          <h2 className="mt-4 font-display text-[clamp(2rem,7.4vw,4rem)] leading-[1.08] font-semibold text-balance">
            En la ciudad de las Cataratas, la selva siempre está cerca.
          </h2>
          <p className="mx-auto mt-5 w-full max-w-md text-lg leading-relaxed text-pretty text-crema/80">
            Por eso Lilium es verde por dentro: plantas en cada rincón, flores frescas en las mesas y madera por todos lados.
          </p>
        </m.div>

        <m.div style={{ x: toucanX, y: toucanY }} className="absolute top-[16%] left-0 z-20 w-[min(42vw,260px)] will-change-transform">
          <Toucan className="w-full" />
        </m.div>
        <m.div style={{ x: b1x, y: b1y }} className="absolute bottom-[30%] left-[20%] z-[5] w-10">
          <div className="animate-flutter will-change-transform">
            <Butterfly className="w-full" color="#64BCB0" />
          </div>
        </m.div>
        <m.div style={{ x: b2x, y: b2y }} className="absolute right-[18%] bottom-[22%] z-[5] w-8">
          <div className="animate-flutter will-change-transform [animation-delay:-0.13s]">
            <Butterfly className="w-full" color="#B4472B" />
          </div>
        </m.div>

        <CoatiPaseo className="bottom-[17%] z-[25] w-[min(40vw,230px)]" />

        {/* hojas de frente: cada lado con su especie y su ritmo */}
        <m.div style={{ y: frontLY, rotate: frontL }} className="absolute -bottom-[8%] -left-[24%] z-30 w-[70vw] max-w-[540px] origin-bottom-left will-change-transform">
          <Monstera color="#2C3A14" stem={140} className="w-full" />
        </m.div>
        <m.div style={{ y: frontRY }} className="absolute inset-x-0 bottom-0 z-30 h-[55%] will-change-transform">
          <m.div style={{ rotate: palmR }} className="absolute -right-[30%] -bottom-[6%] w-[80vw] max-w-[600px] origin-bottom">
            <PalmFrond color="#2F4A22" stem={140} className="w-full -scale-x-100" />
          </m.div>
          <m.div style={{ rotate: bananaR }} className="absolute right-[2%] -bottom-[4%] w-[34vw] max-w-[260px] origin-bottom">
            <BananaLeaf color="#34451A" stem={140} className="w-full" />
          </m.div>
        </m.div>

        {/* sotobosque donde termina la escena: matas, helechos y hojas al ras del suelo */}
        <m.div style={{ y: sotoY }} className="pointer-events-none absolute inset-x-0 bottom-0 z-[35] h-[24%] will-change-transform" aria-hidden="true">
          <div className="absolute bottom-0 left-[6%] w-[22vw] max-w-[170px] -rotate-12 origin-bottom">
            <Fern color="#4A5E22" stem={60} className="w-full" />
          </div>
          <div className="absolute bottom-0 left-[30%] w-[13vw] max-w-[100px] rotate-6 origin-bottom">
            <HeartLeaf color="#2C3A14" stem={60} className="w-full" />
          </div>
          <div className="absolute right-[30%] bottom-0 w-[11vw] max-w-[90px] -rotate-[18deg] origin-bottom">
            <Calathea color="#22351E" stem={60} className="w-full" />
          </div>
          <div className="absolute right-[12%] bottom-0 w-[18vw] max-w-[140px] rotate-[22deg] origin-bottom">
            <Fern color="#6F7F2E" stem={60} className="w-full -scale-x-100" />
          </div>
          <Sotobosque className="absolute inset-x-0 -bottom-1 h-[46%] w-full" />
        </m.div>
      </div>
    </section>
  )
}
