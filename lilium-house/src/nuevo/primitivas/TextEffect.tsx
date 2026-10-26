import { motion } from 'motion/react'

/*
 * Texto que entra palabra por palabra, desenfocado y subiendo. Adaptado de Motion Primitives (TextEffect,
 * preset "blur", MIT). `animar` en false lo muestra quieto (el HTML generado y la primera carga).
 */
export function TextEffect({ children, className, animar = true }: { children: string; className?: string; animar?: boolean }) {
  const palabras = children.split(/(\s+)/)
  return (
    <motion.p
      className={className}
      initial={animar ? 'oculto' : false}
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.035 } } }}
    >
      {/* el texto entero para lectores de pantalla (un <p> no admite aria-label); las palabras animadas van ocultas */}
      <span className="sr-only">{children}</span>
      {palabras.map((p, i) =>
        /^\s+$/.test(p) ? (
          p
        ) : (
          <motion.span
            key={i}
            aria-hidden="true"
            className="inline-block"
            variants={{
              oculto: { opacity: 0, y: 8, filter: 'blur(6px)' },
              visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] } },
            }}
          >
            {p}
          </motion.span>
        ),
      )}
    </motion.p>
  )
}
