import { useRef, type ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, type MotionStyle } from 'motion/react'

/*
 * Inclinación que sigue al cursor. Adaptado de Motion Primitives (Tilt, MIT, ibelick/motion-primitives):
 * solo responde a un mouse (en pantallas táctiles no hace nada) y vuelve al centro con un resorte suave.
 */
export function Tilt({ children, className, style, grados = 10 }: { children: ReactNode; className?: string; style?: MotionStyle; grados?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const resorte = { stiffness: 260, damping: 26 }
  const rx = useTransform(useSpring(y, resorte), [-0.5, 0.5], [grados, -grados])
  const ry = useTransform(useSpring(x, resorte), [-0.5, 0.5], [-grados, grados])
  const transform = useMotionTemplate`perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ transformStyle: 'preserve-3d', ...style, transform }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - r.left) / r.width - 0.5)
        y.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
