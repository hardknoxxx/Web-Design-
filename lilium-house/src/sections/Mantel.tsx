import { m } from 'framer-motion'
import { HojasTransicion } from '../components/HojasTransicion'
import { Picaflor } from '../components/Ambiente'
import { MandalaColoring } from '../components/MandalaColoring'

const EASE = [0.22, 1, 0.36, 1] as const

/** 06 · El mantel. Se despliega con el scroll y después se colorea. */
export function Mantel() {
  return (
    <section
      id="mantel"
      data-phase="#E6D7BC|#3D2314|17:00"
      className="relative z-[4] overflow-x-clip px-9 pt-28 pb-44 sm:px-14 sm:pb-52 lg:px-24"
      aria-label="El mantel para colorear"
    >
      <HojasTransicion v="mantel" />
      <Picaflor className="bottom-2 left-0 sm:bottom-6 lg:bottom-10" />
      <div className="mx-auto max-w-6xl">
        <MandalaColoring
          intro={
            <m.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <p className="inline-block -rotate-2 font-hand text-3xl text-musgo">17:00 · la merienda</p>
              <h2 className="mt-3 font-display text-[clamp(2.4rem,9vw,4.5rem)] leading-[0.98] font-semibold text-balance">
                Coloreá tu mantel
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-madera/80">
                En cada mesa espera un mantel ilustrado y un frasco de lápices. Probá acá: elegí un color, tocá el mandala
                y llevate tu diseño.
              </p>
            </m.div>
          }
        />
      </div>
    </section>
  )
}
