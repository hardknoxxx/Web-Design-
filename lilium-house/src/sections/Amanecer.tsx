import { m, useScroll, useTransform } from 'framer-motion'
import { lazy, Suspense, useRef } from 'react'
import { LilyMark } from '../components/Icons'
import { Leaf, Monstera } from '../components/Botanica'

// three.js se carga en un chunk aparte: el texto pinta primero
const LilyCanvas = lazy(() => import('../components/three/LilyCanvas'))

/**
 * 01–02 · Amanecer. Escena fijada (sticky): una cortina de hojas de monstera cubre
 * los bordes y se abre con el scroll, el sol sube y aparece la bajada.
 */
export function Amanecer() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // cortina: hojas de adelante y de atrás se abren hacia afuera a distinta velocidad
  const frontL = { x: useTransform(p, [0, 0.55], ['0vw', '-70vw']), rotate: useTransform(p, [0, 0.55], [24, -38]) }
  const frontR = { x: useTransform(p, [0, 0.55], ['0vw', '70vw']), rotate: useTransform(p, [0, 0.55], [-24, 38]) }
  const backL = { x: useTransform(p, [0.04, 0.6], ['0vw', '-55vw']), rotate: useTransform(p, [0.04, 0.6], [52, 80]) }
  const backR = { x: useTransform(p, [0.04, 0.6], ['0vw', '55vw']), rotate: useTransform(p, [0.04, 0.6], [-52, -80]) }
  const bg = useTransform(p, [0, 0.55], ['#F6E0CF', '#FAF7F2'])

  const sunY = useTransform(p, [0, 1], ['0vh', '-22vh'])
  const sunScale = useTransform(p, [0, 1], [1, 1.35])
  const titleY = useTransform(p, [0, 0.7], ['0vh', '-4vh'])
  const titleScale = useTransform(p, [0, 0.7], [1, 0.82])
  const lilyScale = useTransform(p, [0, 0.6], [0.9, 1.08])
  const tagOpacity = useTransform(p, [0.35, 0.6], [0, 1])
  const tagY = useTransform(p, [0.35, 0.6], [30, 0])
  const hintOpacity = useTransform(p, [0, 0.12], [1, 0])
  const sprout = useTransform(p, [0, 0.12], [1, 0.4])

  return (
    <m.section
      ref={ref}
      style={{ backgroundColor: bg }}
      id="amanecer"
      data-phase="#F6E0CF|#3D2314|08:00"
      className="relative z-[1] h-[230svh]"
      aria-label="Amanecer en Lilium"
    >
      <div className="absolute top-[55%]" data-phase="#FAF7F2|#3D2314|08:40" />
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* sol */}
        <m.div
          style={{ y: sunY, scale: sunScale }}
          className="absolute top-[22%] left-1/2 h-[min(70vw,420px)] w-[min(70vw,420px)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(233_180_76/0.55),rgb(233_180_76/0.18)_55%,transparent_70%)]"
        />

        <m.div style={{ y: titleY, scale: titleScale }} className="relative z-10 pt-[max(5.5rem,12svh)] text-center">
          <p className="text-[0.7rem] font-semibold tracking-[0.3em] text-rosa uppercase">Coffee Lounge · Puerto Iguazú</p>
          <h1 className="mt-1 font-script text-[clamp(4.6rem,21vw,10rem)] leading-[1.05] text-madera">Lilium</h1>
        </m.div>

        {/* lirio 3D */}
        <m.div
          style={{ scale: lilyScale }}
          className="absolute top-[52%] left-1/2 aspect-square w-[min(96vw,64svh,640px)] -translate-x-1/2 -translate-y-1/2"
        >
          <Suspense
            fallback={
              <div className="grid h-full place-items-center">
                <LilyMark className="h-24 w-24 animate-pulse text-rosa/70" />
              </div>
            }
          >
            <div className="h-full w-full [mask-image:linear-gradient(to_bottom,black_60%,transparent_92%)]">
              <LilyCanvas />
            </div>
          </Suspense>
        </m.div>

        <m.p
          style={{ opacity: tagOpacity, y: tagY }}
          className="absolute inset-x-0 bottom-[11svh] z-20 mx-auto max-w-xl px-9 text-center font-display text-[clamp(1.35rem,5.2vw,2rem)] leading-snug text-balance text-madera"
        >
          Café de especialidad, chipa casera y pastelería en el corazón verde de Puerto Iguazú.
        </m.p>

        {/* cortina de hojas: la base de cada hoja es el pivote (origin-bottom) */}
        <m.div style={backL} className="absolute -bottom-[3%] -left-[52vw] z-20 w-[95vw] max-w-[700px] origin-bottom">
          <Monstera color="#749E89" className="w-full" />
        </m.div>
        <m.div style={backR} className="absolute -right-[52vw] -bottom-[3%] z-20 w-[95vw] max-w-[700px] origin-bottom">
          <Monstera color="#749E89" className="w-full -scale-x-100" />
        </m.div>
        <m.div style={frontL} className="absolute -bottom-[8%] -left-[42vw] z-20 w-[100vw] max-w-[760px] origin-bottom">
          <Monstera color="#415521" className="w-full" />
        </m.div>
        <m.div style={frontR} className="absolute -right-[42vw] -bottom-[8%] z-20 w-[100vw] max-w-[760px] origin-bottom">
          <Monstera color="#3A4C1D" className="w-full -scale-x-100" />
        </m.div>

        {/* pista de scroll: un brote */}
        <m.div
          style={{ opacity: hintOpacity }}
          className="absolute inset-x-0 bottom-[max(1.5rem,4svh)] z-30 flex flex-col items-center gap-1 text-crema"
        >
          <m.div style={{ scale: sprout }} className="origin-bottom animate-sway">
            <Leaf className="h-7 w-7 -rotate-12" color="#E9B44C" />
          </m.div>
          <span className="font-hand text-2xl leading-none">Deslizá para que amanezca</span>
        </m.div>
      </div>
    </m.section>
  )
}
