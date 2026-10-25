import { Children, useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

/*
 * Palabras que se turnan en el mismo lugar. Adaptado de Motion Primitives (TextLoop, MIT): la que sale sube y se
 * desvanece, la que entra llega desde abajo. Se detiene fuera de pantalla y con movimiento reducido.
 */
export function TextLoop({ children, className, intervalo = 2.4 }: { children: ReactNode[]; className?: string; intervalo?: number }) {
  const items = Children.toArray(children)
  const [i, setI] = useState(0)
  const quieto = useReducedMotion()
  const [el, setEl] = useState<HTMLSpanElement | null>(null)
  useEffect(() => {
    if (quieto || !el) return
    let id = 0
    const io = new IntersectionObserver(([e]) => {
      clearInterval(id)
      if (e.isIntersecting) id = window.setInterval(() => setI((v) => (v + 1) % items.length), intervalo * 1000)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      clearInterval(id)
    }
  }, [quieto, el, items.length, intervalo])
  return (
    <span ref={setEl} className={`relative inline-block whitespace-nowrap ${className ?? ''}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: '60%', opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-60%', opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        >
          {items[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
