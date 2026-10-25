import { m, useTransform } from 'motion/react'
import { useDay } from '../day/DayProvider'

/**
 * Borde inferior de una escena fijada que se funde con el fondo del día: un degradé del
 * mismo color que el fondo (mucho más barato que una máscara sobre toda la escena).
 */
export function Fundido({ className = '' }: { className?: string }) {
  const { bg } = useDay()
  const backgroundImage = useTransform(bg, (c) => `linear-gradient(to bottom, transparent, ${c})`)
  return <m.div aria-hidden="true" style={{ backgroundImage }} className={`pointer-events-none absolute inset-x-0 bottom-0 ${className}`} />
}
