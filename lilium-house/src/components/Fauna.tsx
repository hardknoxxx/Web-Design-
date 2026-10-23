import { useId, type CSSProperties } from 'react'
import { LeafGradients, safeId } from './Flora'

/* Fauna autóctona de Misiones: el hornero con su nido de barro y el coatí de las Cataratas. */

type Props = { className?: string; style?: CSSProperties }

/**
 * Hornero sobre una rama, junto a su horno de barro. `data-bird` agrupa al pájaro
 * (para que salte o cabecee) y `data-head` la cabeza.
 */
export function HorneroNido({ className, style }: Props) {
  const id = safeId(useId())
  return (
    <svg viewBox="-120 -80 230 110" overflow="visible" className={className} style={style} aria-hidden="true">
      <defs>
        <LeafGradients id={`${id}-l`} color="#6F7F2E" />
        <radialGradient id={`${id}-n`} cx="40%" cy="30%" r="75%">
          <stop offset="0" stopColor="#D2A06A" />
          <stop offset=".6" stopColor="#B07A48" />
          <stop offset="1" stopColor="#8A5A32" />
        </radialGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C47A3A" />
          <stop offset="1" stopColor="#9A5426" />
        </linearGradient>
      </defs>
      {/* rama desde el borde */}
      <path d="M-200 18C-120 14-60 10 0 8C40 6 70 4 108-4" stroke="#5A3C28" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M60 4C74-6 82-16 84-26M-80 12C-90 0-92-8-90-16" stroke="#5A3C28" strokeWidth="3" fill="none" strokeLinecap="round" />
      {[
        [84, -26, -20],
        [-90, -16, 10],
        [100, -2, 60],
      ].map(([x, y, r], i) => (
        <path
          key={i}
          d="M0 0C-6-5-7-15 0-22C7-15 6-5 0 0Z"
          transform={`translate(${x} ${y}) rotate(${r})`}
          fill={`url(#${id}-l-x)`}
          stroke="#34451A"
          strokeOpacity=".4"
          strokeWidth=".7"
        />
      ))}

      {/* horno de barro, con la entrada de costado */}
      <g transform="translate(-40 8)">
        <ellipse cx="0" cy="2" rx="40" ry="5" fill="#3D2314" opacity=".25" />
        <path d="M-38 0C-40-30-20-52 2-52C26-52 40-30 38 0Z" fill={`url(#${id}-n)`} />
        <g stroke="#7A4E2C" strokeOpacity=".45" strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M-30-12C-22-10-14-12-8-10M-26-28C-18-26-10-28-2-26M-12-42C-4-40 6-42 14-40M2-16C10-14 18-16 26-14M8-30C16-28 24-30 30-26" />
        </g>
        <path d="M12-4C12-18 20-26 28-22C34-18 32-8 30-2Z" fill="#3B2416" />
        <path d="M12-4C12-18 20-26 28-22" stroke="#C99A68" strokeWidth="2" fill="none" />
      </g>

      {/* hornero: pecho claro, lomo rufo, ceja pálida, patas largas */}
      <g data-bird="" transform="translate(40 4)">
        <path d="M-2 4L-2 -2M6 4L7 -2" stroke="#6B5A4A" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M-5 4H1M3 4H10" stroke="#6B5A4A" strokeWidth="1.4" strokeLinecap="round" />
        <g transform="translate(0 -2)">
          <path d="M-14-18L-30-26L-30-20L-14-12Z" fill="#9A4F22" />
          <path d="M-16-14C-16-28-4-36 8-34C18-32 22-22 18-10C14-2-8 2-16-14Z" fill={`url(#${id}-b)`} />
          <path d="M6-26C14-24 18-16 16-8C10-2 2-2-2-4C2-10 4-18 6-26Z" fill="#EDD6B4" />
          <path d="M-12-18C-4-26 6-26 10-20C4-14-4-12-12-18Z" fill="#8A4B22" />
          <path d="M-8-20L4-20M-6-17L4-17" stroke="#6E3A18" strokeWidth=".8" opacity=".6" />
          <g data-head="">
            <circle cx="12" cy="-34" r="8" fill="#B36A30" />
            <path d="M8-37C12-39 17-38 20-35" stroke="#EFD9B6" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <circle cx="14" cy="-34" r="1.6" fill="#1A1A1A" />
            <path d="M19-33.5C23-33 27-32 30-30L19-31Z" fill="#5C4632" />
            <path d="M8-30C10-28 14-28 16-29" stroke="#EDD6B4" strokeWidth="1.4" fill="none" />
          </g>
        </g>
      </g>
    </svg>
  )
}

/** Coatí caminando: hocico largo, antifaz claro y la cola anillada en alto. */
export function Coati({ className, style }: Props) {
  const id = safeId(useId())
  return (
    <svg viewBox="-80 -70 170 96" overflow="visible" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A87447" />
          <stop offset="1" stopColor="#6E4A2E" />
        </linearGradient>
      </defs>
      {/* cola anillada, en alto */}
      <path d="M-40-4C-60-20-64-46-52-62" stroke="#B08660" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M-40-4C-60-20-64-46-52-62" stroke="#3A2618" strokeWidth="9.4" fill="none" strokeDasharray="6 6" />
      {/* patas traseras (lejos) */}
      <g fill="#3A2618">
        <rect data-leg="b" x="-34" y="4" width="7" height="18" rx="3.5" />
        <rect data-leg="a" x="22" y="4" width="7" height="18" rx="3.5" />
      </g>
      {/* cuerpo */}
      <path d="M-44 2C-46-16-24-24 4-24C26-24 40-16 42-4C44 8 28 12 6 12C-20 12-42 14-44 2Z" fill={`url(#${id}-b)`} />
      <path d="M-30 8C-10 12 14 12 34 6" stroke="#5A3A22" strokeOpacity=".5" strokeWidth="2" fill="none" />
      {/* patas delanteras (cerca) */}
      <g fill="#2E1E12">
        <rect data-leg="a" x="-26" y="4" width="8" height="20" rx="4" />
        <rect data-leg="b" x="28" y="4" width="8" height="20" rx="4" />
      </g>
      {/* cabeza y hocico */}
      <path d="M34-18C44-24 56-22 62-14L80-9C83-7 82-4 78-4L60-2C52 4 40 2 34-6Z" fill="#8E6240" />
      <path d="M62-14L80-9C83-7 82-4 78-4L62-4Z" fill="#C9A982" />
      <circle cx="80" cy="-6.5" r="2.6" fill="#1A1A1A" />
      <ellipse cx="52" cy="-13" rx="5" ry="3.4" fill="#EDE3D0" />
      <circle cx="52.6" cy="-13" r="1.7" fill="#1A1A1A" />
      <path d="M40-20C40-26 46-28 48-22Z" fill="#6E4A2E" />
      <path d="M41-21.5C42-24 44-24.5 45-23" stroke="#EDE3D0" strokeWidth="1" fill="none" />
    </svg>
  )
}
