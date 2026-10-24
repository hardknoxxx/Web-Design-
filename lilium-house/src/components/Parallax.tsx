import { m, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

/*
 * Paralaje para lo decorativo: mientras el elemento cruza la pantalla se desplaza `distance` px
 * (positivo: sube más rápido que el scroll, se siente más cerca; negativo: más lejos). Solo
 * transform, con una sola medición de scroll compartida por Framer Motion. En el teléfono el
 * recorrido es más corto para que no se despegue del contenido.
 */

const SCALE = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches ? 0.6 : 1

export function Parallax({ children, className, distance = 40 }: { children: ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const d = distance * SCALE
  const y = useTransform(scrollYProgress, [0, 1], [d, -d])
  return (
    <m.div ref={ref} style={{ y }} className={className}>
      {children}
    </m.div>
  )
}
