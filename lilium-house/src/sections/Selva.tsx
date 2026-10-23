import { m, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Butterfly, Leaf, Monstera, Toucan } from '../components/Botanica'
import { Edge } from '../components/Edge'

/**
 * 07 · La selva entra. Escena fijada con capas parallax a distinta velocidad:
 * bruma de cataratas (lenta), hojas de fondo, tucán que cruza y hojas de frente (rápidas).
 */
export function Selva() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const mistY = useTransform(p, [0, 1], ['-8%', '12%'])
  const backY = useTransform(p, [0, 1], ['18%', '-12%'])
  const frontY = useTransform(p, [0, 1], ['40%', '-30%'])
  const frontL = useTransform(p, [0, 1], [-18, 6])
  const frontR = useTransform(p, [0, 1], [18, -6])

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
        <m.div style={{ y: mistY }} className="absolute inset-x-0 top-0 flex h-[85%] justify-around px-2 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]">
          {[0.07, 0.11, 0.06, 0.09, 0.05].map((o, i) => (
            <div
              key={i}
              className="h-full w-[18%] rounded-b-full bg-[linear-gradient(to_right,transparent,white_45%,white_55%,transparent)] blur-[6px]"
              style={{ opacity: o, height: `${70 + (i % 3) * 10}%` }}
            />
          ))}
        </m.div>

        <m.div style={{ y: backY }} className="absolute inset-0">
          <Leaf className="absolute top-[18%] -left-6 w-28 -rotate-[30deg]" color="#5E7A2A" />
          <Leaf className="absolute top-[10%] -right-4 w-24 rotate-[40deg]" color="#5E7A2A" />
          <Leaf className="absolute top-[58%] right-[12%] w-16 rotate-[70deg]" color="#97AD3D" />
        </m.div>

        <m.div
          style={{ opacity: textOpacity, y: textY }}
          className="relative z-10 mx-auto flex h-full w-full max-w-3xl flex-col justify-center px-9 pb-[18svh] text-center sm:px-14"
        >
          <p className="inline-block -rotate-2 font-hand text-3xl text-helecho">18:00 · Puerto Iguazú</p>
          <h2 className="mt-4 font-display text-[clamp(2rem,7.4vw,4rem)] leading-[1.08] font-semibold text-balance">
            En la ciudad de las Cataratas, la selva siempre está cerca.
          </h2>
          <p className="mx-auto mt-5 w-full max-w-md text-lg leading-relaxed text-pretty text-crema/80">
            Por eso Lilium es verde por dentro: plantas en cada rincón, flores frescas en las mesas y madera por todos lados.
          </p>
        </m.div>

        <m.div style={{ x: toucanX, y: toucanY }} className="absolute top-[16%] left-0 z-20 w-[min(42vw,260px)]">
          <Toucan className="w-full" />
        </m.div>
        <m.div style={{ x: b1x, y: b1y }} className="absolute bottom-[30%] left-[20%] z-[5] w-10">
          <Butterfly className="w-full" color="#00A896" />
        </m.div>
        <m.div style={{ x: b2x, y: b2y }} className="absolute right-[18%] bottom-[22%] z-[5] w-8">
          <Butterfly className="w-full" color="#B4472B" />
        </m.div>

        {/* hojas de frente: la capa más rápida */}
        <m.div style={{ y: frontY }} className="absolute inset-x-0 bottom-0 z-30 h-[45%]">
          <m.div style={{ rotate: frontL }} className="absolute -bottom-[10%] -left-[22%] w-[72vw] max-w-[560px] origin-bottom-left">
            <Monstera color="#2C3A14" className="w-full" />
          </m.div>
          <m.div style={{ rotate: frontR }} className="absolute -right-[22%] -bottom-[14%] w-[76vw] max-w-[600px] origin-bottom-right">
            <Monstera color="#33441A" className="w-full -scale-x-100" />
          </m.div>
        </m.div>
      </div>
    </section>
  )
}
