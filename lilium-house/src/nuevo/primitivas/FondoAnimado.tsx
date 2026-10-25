import { motion } from 'motion/react'

/*
 * Fondo que se desliza entre opciones (el "pill" activo de las pestañas o el resaltado del menú).
 * Adaptado de Motion Primitives (AnimatedBackground, MIT): un único elemento con `layoutId` que viaja de una
 * opción a otra en lugar de aparecer y desaparecer.
 */
export function FondoAnimado({ grupo, className }: { grupo: string; className?: string }) {
  return (
    <motion.span
      layoutId={grupo}
      aria-hidden="true"
      className={`absolute inset-0 -z-10 ${className ?? ''}`}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
    />
  )
}
