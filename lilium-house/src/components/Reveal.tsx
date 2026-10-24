import { m, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/*
 * Apariciones al entrar en pantalla: suben desde abajo mientras se funden, con la curva
 * orgánica de la casa. Solo transform y opacity (las anima la GPU) y una sola vez: al volver
 * hacia arriba el contenido ya está. Con movimiento reducido, Framer Motion (MotionConfig
 * reducedMotion="user") deja solo el fundido.
 */

const EASE = [0.22, 1, 0.36, 1] as const
// en el teléfono el recorrido es más corto y algo más rápido: el mismo gesto, a escala
const small = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
const DIST = small ? 22 : 36
const DUR = small ? 0.75 : 0.95
// aparece cuando asoma un poco por encima del borde inferior, no apenas lo toca
const VIEWPORT = { once: true, amount: 0.3, margin: '0px 0px -8% 0px' } as const

const item: Variants = {
  hidden: { opacity: 0, y: DIST },
  show: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } },
}

type Props = { children: ReactNode; className?: string; delay?: number }

/** Un bloque que aparece solo. */
export function Reveal({ children, className, delay = 0 }: Props) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: DIST }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DUR, ease: EASE, delay }}
    >
      {children}
    </m.div>
  )
}

/** Varios bloques en cascada: cada `RevealItem` hijo entra un poco después del anterior. */
export function RevealGroup({ children, className, delay = 0, stagger = 0.1 }: Props & { stagger?: number }) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </m.div>
  )
}

export function RevealItem({ children, className }: Omit<Props, 'delay'>) {
  return (
    <m.div className={className} variants={item}>
      {children}
    </m.div>
  )
}

const word: Variants = {
  hidden: { y: '108%' },
  show: { y: '0%', transition: { duration: DUR + 0.1, ease: EASE } },
}

/**
 * Título que sube palabra por palabra desde detrás de una línea invisible (cada palabra en su
 * propia ventana con overflow oculto). Va dentro del h2: los lectores de pantalla leen el texto
 * entero una sola vez.
 */
export function RevealWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(' ')
  return (
    <>
      <span className="sr-only">{text}</span>
      <m.span
        aria-hidden="true"
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
      >
        {words.map((w, i) => (
          <span key={i}>
            {/* el margen negativo compensa el aire que se deja para descendentes y acentos */}
            <span className="-my-[0.14em] inline-block overflow-hidden py-[0.14em] align-top">
              <m.span className="inline-block" variants={word}>
                {w}
              </m.span>
            </span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </m.span>
    </>
  )
}
