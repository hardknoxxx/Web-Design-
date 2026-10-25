import { motion } from 'motion/react'

/*
 * Íconos dibujados para las pestañas de la carta, con un gesto propio al elegirlos:
 * desayunos, el sol que asoma; almuerzos, el sol del mediodía que da un giro; meriendas, la taza con vapor.
 */
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const muelle = { type: 'spring', stiffness: 260, damping: 18 } as const

export function IconoMomento({ id, activo }: { id: string; activo: boolean }) {
  if (id === 'desayunos')
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none" aria-hidden="true" {...trazo}>
        <path d="M3 18h18" />
        <motion.g initial={false} animate={{ y: activo ? 0 : 3 }} transition={muelle}>
          <path d="M7.5 18a4.5 4.5 0 0 1 9 0" />
          {[-60, -30, 0, 30, 60].map((a) => (
            <motion.path
              key={a}
              d="M12 10.5V8.5"
              style={{ rotate: a, originX: '12px', originY: '18px' }}
              initial={false}
              animate={{ opacity: activo ? 1 : 0.35, pathLength: activo ? 1 : 0.4 }}
              transition={{ ...muelle, delay: activo ? 0.05 + Math.abs(a) / 600 : 0 }}
            />
          ))}
        </motion.g>
      </svg>
    )
  if (id === 'almuerzos')
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none" aria-hidden="true" {...trazo}>
        <circle cx="12" cy="12" r="4" />
        <motion.g initial={false} animate={{ rotate: activo ? 90 : 0, scale: activo ? 1 : 0.8 }} transition={muelle} style={{ originX: '12px', originY: '12px' }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <path key={a} d="M12 3.5V5.5" transform={`rotate(${a} 12 12)`} />
          ))}
        </motion.g>
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none" aria-hidden="true" {...trazo}>
      <path d="M5 11h11v3.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z" />
      <path d="M16 12.5h1.5a2 2 0 0 1 0 4H16" />
      {[8.5, 12.5].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 8.5c-1-1.2 1-2 0-3.5`}
          initial={false}
          animate={activo ? { pathLength: [0, 1], opacity: [0, 1, 0.6] } : { pathLength: 1, opacity: 0.4 }}
          transition={activo ? { duration: 1.1, delay: i * 0.15, ease: 'easeOut' } : { duration: 0.2 }}
        />
      ))}
    </svg>
  )
}
