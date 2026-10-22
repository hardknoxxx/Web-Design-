import { m } from 'framer-motion'
import { Edge } from '../components/Edge'
import { MandalaColoring } from '../components/MandalaColoring'

const EASE = [0.22, 1, 0.36, 1] as const

/** 06 · El mantel. Se despliega con el scroll y después se colorea. */
export function Mantel() {
  return (
    <section
      id="mantel"
      data-phase="#F0EAE1|#3D2314|17:00"
      className="relative z-[3] overflow-x-clip bg-estuco px-9 pt-28 pb-32 sm:px-14 lg:px-24"
      aria-label="El mantel para colorear"
    >
      <Edge color="#F0EAE1" />
      <div className="mx-auto max-w-6xl">
        <MandalaColoring
          intro={
            <m.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <p className="text-[0.7rem] font-semibold tracking-[0.3em] text-turquesa-dark uppercase">17:00 · La merienda</p>
              <h2 className="mt-3 font-display text-[clamp(2.4rem,9vw,4.5rem)] leading-[0.98] font-medium text-balance">
                Coloreá tu mantel
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-madera/75">
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
