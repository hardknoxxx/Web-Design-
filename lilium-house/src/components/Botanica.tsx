import { m, type MotionValue } from 'framer-motion'
import { useId, type CSSProperties } from 'react'

/* Ilustraciones del storyboard de Figma ("Lilium Coffee Lounge — Storyboard de scroll"). */

const MONSTERA =
  'M0 0C-80-6-120-80-86-150C-62-194-22-208 0-212C22-208 62-194 86-150C120-80 80-6 0 0Z'
const LEAF = 'M0 0C-40-10-50-60-10-92C-4-96 4-96 10-92C50-60 40-10 0 0Z'

const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '')

type ArtProps = { className?: string; style?: CSSProperties; color?: string }

/** Hoja de monstera con cortes reales (máscara), apoyada en su base (0,0). */
export function Monstera({ className, style, color = '#415521' }: ArtProps) {
  const id = safeId(useId())
  return (
    <svg viewBox="-130 -222 260 232" className={className} style={style} aria-hidden="true">
      <defs>
        <mask id={id}>
          <path d={MONSTERA} fill="#fff" />
          <g stroke="#000" strokeWidth="9" strokeLinecap="round">
            {[1, 2, 3, 4].map((k) => (
              <g key={k}>
                <path d={`M-14 ${-36 * k} L-140 ${-36 * k + 26}`} />
                <path d={`M14 ${-36 * k - 10} L140 ${-36 * k + 16}`} />
              </g>
            ))}
          </g>
          <ellipse cx="-26" cy="-60" rx="7" ry="12" fill="#000" />
          <ellipse cx="28" cy="-130" rx="6" ry="11" fill="#000" />
        </mask>
      </defs>
      <path d={MONSTERA} fill={color} mask={`url(#${id})`} />
      <path d="M0 2V-206" stroke="#000" strokeOpacity=".2" strokeWidth="5" fill="none" />
    </svg>
  )
}

export function Leaf({ className, style, color = '#6F7F2E' }: ArtProps) {
  return (
    <svg viewBox="-50 -98 100 100" className={className} style={style} aria-hidden="true">
      <path d={LEAF} fill={color} />
      <path d="M0 -4V-86" stroke="#000" strokeOpacity=".16" strokeWidth="3" fill="none" />
    </svg>
  )
}

export function Toucan({ className, style }: ArtProps) {
  return (
    <svg viewBox="-80 -60 190 110" className={className} style={style} aria-hidden="true">
      <path d="M-14 26C-60 40-78 14-70-8L-24 2Z" fill="#1A1A1A" />
      <ellipse cx="0" cy="0" rx="28" ry="34" fill="#1A1A1A" />
      <g className="origin-bottom-right animate-wing [transform-box:fill-box]">
        <path d="M-6 -6C-40 -40 -70 -36 -78 -24C-56 -18 -34 -6 -6 6Z" fill="#2B2B2B" />
      </g>
      <ellipse cx="11" cy="-12" rx="14" ry="16" fill="#F7E2A9" />
      <path d="M14 -28C60 -40 92 -20 98 -8C72 -10 42 -12 16 -14Z" fill="#D9A441" />
      <path d="M84 -16C92 -14 96 -10 98 -8C92 -8 88 -9 84 -10Z" fill="#C2413A" />
      <circle cx="8" cy="-24" r="5" fill="#64BCB0" />
      <circle cx="8" cy="-24" r="2" fill="#1A1A1A" />
    </svg>
  )
}

export function Butterfly({ className, style, color = '#64BCB0' }: ArtProps) {
  return (
    <svg viewBox="-24 -22 48 40" className={className} style={style} aria-hidden="true">
      <g className="origin-center animate-flutter [transform-box:fill-box]">
        <ellipse cx="-9" cy="-4" rx="10" ry="14" transform="rotate(-25 -9 -4)" fill={color} />
        <ellipse cx="9" cy="-4" rx="10" ry="14" transform="rotate(25 9 -4)" fill={color} />
        <ellipse cx="-6" cy="10" rx="6" ry="8" fill={color} opacity=".75" />
        <ellipse cx="6" cy="10" rx="6" ry="8" fill={color} opacity=".75" />
      </g>
      <rect x="-1.5" y="-12" width="3" height="26" rx="1.5" fill="#1A1A1A" />
    </svg>
  )
}

const INK = '#3D2314'

/** Taza: el vapor se dibuja con el scroll (steam 0..1). */
export function Cup({ className, steam }: { className?: string; steam?: MotionValue<number> }) {
  return (
    <svg viewBox="-90 -110 190 172" className={className} aria-hidden="true">
      <ellipse cx="0" cy="46" rx="78" ry="13" fill="#F0EAE1" stroke={INK} strokeWidth="3" />
      <path d="M52 -6C82 -8 82 30 46 26" fill="none" stroke={INK} strokeWidth="6" />
      <path d="M-54 -22H54C54 30 32 46 0 46C-32 46-54 30-54 -22Z" fill="#FAF7F2" stroke={INK} strokeWidth="3" />
      <path d="M-51 0H51" stroke="#64BCB0" strokeWidth="8" />
      <ellipse cx="0" cy="-22" rx="54" ry="10" fill="#6B3A1E" stroke={INK} strokeWidth="3" />
      <g className="animate-steam [transform-box:fill-box]">
        {[-20, 0, 20].map((x, i) => (
          <m.path
            key={x}
            d={`M${x} -44C${x - 12} -62 ${x + 8} -74 ${x - 4} -${96 + i * 6}`}
            fill="none"
            stroke={INK}
            strokeOpacity=".45"
            strokeWidth="3"
            strokeLinecap="round"
            style={steam ? { pathLength: steam } : undefined}
          />
        ))}
      </g>
    </svg>
  )
}

export function ChipaBasket({ className }: { className?: string }) {
  return (
    <svg viewBox="-92 -70 184 130" className={className} aria-hidden="true">
      <path d="M-86 0H86L68 56H-68Z" fill="#C88A4E" stroke={INK} strokeWidth="3" />
      {[-50, -20, 10, 40].map((x) => (
        <path key={x} d={`M${x} 6L${x + 14} 52`} stroke={INK} strokeWidth="2" opacity=".4" />
      ))}
      {[
        [-50, -14],
        [-6, -20],
        [40, -12],
        [-28, -40],
        [18, -42],
      ].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <circle cx={x} cy={y} r="24" fill="#EBC47E" stroke="#B5843F" strokeWidth="3" />
          <circle cx={x - 7} cy={y - 5} r="2.5" fill="#B5843F" />
          <circle cx={x + 6} cy={y + 4} r="2.5" fill="#B5843F" />
        </g>
      ))}
    </svg>
  )
}

/** Torta en su base; la campana de vidrio se levanta con dome (px hacia arriba). */
export function CakeStand({ className, dome }: { className?: string; dome?: MotionValue<number> }) {
  return (
    <svg viewBox="-100 -160 200 250" className={className} aria-hidden="true">
      <rect x="-6" y="40" width="12" height="40" fill={INK} />
      <ellipse cx="0" cy="82" rx="46" ry="8" fill={INK} />
      <ellipse cx="0" cy="40" rx="92" ry="12" fill="#F0EAE1" stroke={INK} strokeWidth="3" />
      <rect x="-62" y="-22" width="124" height="60" rx="6" fill="#F3D9A4" stroke={INK} strokeWidth="3" />
      <rect x="-60" y="2" width="120" height="10" fill="#FAF7F2" />
      <path
        d="M-62 -22H62V-8C52 4 44 -6 34 4C24 -6 14 4 4 -6C-6 4-16 -6-26 4C-36 -6-46 4-62 -8Z"
        fill="#B4472B"
      />
      {[-34, -6, 22].map((x) => (
        <circle key={x} cx={x} cy="-28" r="7" fill="#B5302F" />
      ))}
      <m.g style={dome ? { y: dome } : undefined}>
        <path d="M-80 36C-80 -110 80 -110 80 36" fill="#fff" fillOpacity=".3" stroke="#64BCB0" strokeWidth="3" />
        <path d="M-56 -10C-52 -50 -30 -70 -14 -74" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".8" />
        <circle cx="0" cy="-74" r="9" fill="#64BCB0" />
      </m.g>
    </svg>
  )
}

export function PencilJar({ className }: { className?: string }) {
  const colors = ['#64BCB0', '#B4472B', '#D9A441', '#5B7B5A', '#9C89B8']
  return (
    <svg viewBox="-44 -140 88 156" className={className} aria-hidden="true">
      {colors.map((c, i) => (
        <g key={c} transform={`rotate(${-14 + i * 7})`}>
          <rect x={-14 + i * 6} y="-120" width="8" height="110" fill={c} />
          <path d={`M${-14 + i * 6} -120L${-10 + i * 6} -134L${-6 + i * 6} -120Z`} fill="#F3D9A4" />
        </g>
      ))}
      <rect x="-30" y="-70" width="60" height="80" rx="10" fill="#fff" fillOpacity=".4" stroke={INK} strokeWidth="2" />
      <path d="M-20 -58V0" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    </svg>
  )
}
