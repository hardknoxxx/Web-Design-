import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

/*
 * El elemento se deja atraer un poco por el cursor y vuelve con un resorte. Adaptado de Motion Primitives
 * (Magnetic, MIT): solo con mouse y dentro del propio elemento, sin escuchar el mouse de toda la página.
 */
export function Magnetic({ children, fuerza = 0.25, className }: { children: ReactNode; fuerza?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const resorte = { stiffness: 220, damping: 16, mass: 0.4 }
  const sx = useSpring(x, resorte)
  const sy = useSpring(y, resorte)
  return (
    <motion.span
      ref={ref}
      className={`inline-flex ${className ?? ''}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * fuerza)
        y.set((e.clientY - r.top - r.height / 2) * fuerza)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}
