import type { CSSProperties } from 'react'

/*
 * Flora de la selva misionera para la cortina, el fondo y las escenas.
 * Todas las hojas se dibujan apoyadas en su base (0,0) y crecen hacia -Y, para que
 * girar/escalar desde `origin-bottom` se sienta como una planta real.
 */

type Props = { className?: string; style?: CSSProperties; color?: string; vein?: string }

/** Hoja de banano: larga, con nervaduras paralelas y un borde rasgado. */
export function BananaLeaf({ className, style, color = '#6F7F2E', vein = 'rgb(0 0 0 / 0.16)' }: Props) {
  return (
    <svg viewBox="-70 -330 140 340" className={className} style={style} aria-hidden="true">
      <path d="M0 0C-8-60-60-140-56-230C-54-280-24-318 0-326C24-318 54-280 56-230C60-140 8-60 0 0Z" fill={color} />
      <path d="M0 4V-322" stroke={vein} strokeWidth="4" fill="none" />
      <g stroke={vein} strokeWidth="1.4" fill="none">
        {Array.from({ length: 16 }, (_, i) => {
          const y = -30 - i * 18
          return <path key={i} d={`M0 ${y}C-18 ${y - 10} -34 ${y - 14} -50 ${y - 8}M0 ${y}C18 ${y - 10} 34 ${y - 14} 50 ${y - 8}`} />
        })}
      </g>
    </svg>
  )
}

/** Fronda de palmera: raquis curvo con folíolos finos. */
export function PalmFrond({ className, style, color = '#415521' }: Props) {
  const leaflets = Array.from({ length: 22 }, (_, i) => {
    const t = i / 21
    const x = -4 + t * 30
    const y = -10 - t * 250
    const len = 70 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.08))
    return { x, y, len, a: 38 + t * 20 }
  })
  return (
    <svg viewBox="-110 -280 240 290" className={className} style={style} aria-hidden="true">
      <path d="M0 0C6-90 18-180 26-262" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
      {leaflets.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y})`}>
          <path d={`M0 0Q${-l.len * 0.6} ${-l.len * 0.25} ${-l.len} ${l.len * 0.18}`} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" transform={`rotate(${-l.a + 40})`} />
          <path d={`M0 0Q${l.len * 0.6} ${-l.len * 0.25} ${l.len} ${l.len * 0.18}`} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" transform={`rotate(${l.a - 40})`} />
        </g>
      ))}
    </svg>
  )
}

/** Helecho: fronda con pinnas que se achican hacia la punta. */
export function Fern({ className, style, color = '#97AD3D' }: Props) {
  return (
    <svg viewBox="-60 -210 120 215" className={className} style={style} aria-hidden="true">
      <path d="M0 0C-4-70 4-140 -6-204" stroke={color} strokeWidth="2.5" fill="none" />
      {Array.from({ length: 14 }, (_, i) => {
        const y = -14 - i * 13.5
        const s = 1 - i / 16
        return (
          <g key={i} transform={`translate(${-i * 0.4} ${y})`}>
            <ellipse cx={-22 * s} cy="-3" rx={22 * s} ry={5.5 * s} fill={color} transform={`rotate(${-18} 0 0)`} />
            <ellipse cx={22 * s} cy="-3" rx={22 * s} ry={5.5 * s} fill={color} transform={`rotate(${18} 0 0)`} />
          </g>
        )
      })}
    </svg>
  )
}

/** Filodendro: hoja acorazonada con pecíolo. */
export function HeartLeaf({ className, style, color = '#415521', vein = 'rgb(0 0 0 / 0.18)' }: Props) {
  return (
    <svg viewBox="-60 -150 120 152" className={className} style={style} aria-hidden="true">
      <path d="M0 0V-40" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <path d="M0-40C-10-36-46-40-52-70C-58-104-26-132 0-146C26-132 58-104 52-70C46-40 10-36 0-40Z" fill={color} />
      <path d="M0-42V-140M0-70L-30-92M0-70L30-92M0-100L-20-118M0-100L20-118" stroke={vein} strokeWidth="2" fill="none" />
    </svg>
  )
}

/** Calathea: hoja ovalada con bandas pintadas (como las de las macetas del local). */
export function Calathea({ className, style, color = '#2F4A22' }: Props) {
  return (
    <svg viewBox="-46 -190 92 192" className={className} style={style} aria-hidden="true">
      <path d="M0 0V-30" stroke={color} strokeWidth="4" />
      <path d="M0-30C-30-40-44-90-36-130C-30-160-12-180 0-186C12-180 30-160 36-130C44-90 30-40 0-30Z" fill={color} />
      <g fill="#97AD3D" opacity=".75">
        {[-60, -90, -120, -150].map((y, i) => (
          <g key={y}>
            <path d={`M-2 ${y}C-12 ${y - 4} -24 ${y - 2} ${-30 + i * 2} ${y + 6}C-22 ${y + 2} -12 ${y + 2} -2 ${y + 4}Z`} />
            <path d={`M2 ${y}C12 ${y - 4} 24 ${y - 2} ${30 - i * 2} ${y + 6}C22 ${y + 2} 12 ${y + 2} 2 ${y + 4}Z`} />
          </g>
        ))}
      </g>
      <path d="M0-32V-182" stroke="rgb(255 255 255 / 0.25)" strokeWidth="2" />
    </svg>
  )
}

/** Planta en maceta negra, como las del mostrador de Lilium. */
export function PottedPlant({ className, style }: Props) {
  return (
    <svg viewBox="-80 -230 160 236" className={className} style={style} aria-hidden="true">
      <g data-sway="">
        <path d="M0-60C-20-110-60-130-70-170C-40-160-10-130 0-60Z" fill="#415521" />
        <path d="M0-60C10-120 0-170 14-220C30-170 22-110 0-60Z" fill="#6F7F2E" />
        <path d="M0-60C24-100 64-110 76-150C44-148 14-120 0-60Z" fill="#415521" />
        <path d="M0-60C-6-100-30-120-36-150C-14-140-4-110 0-60Z" fill="#97AD3D" />
      </g>
      <path d="M-44-64H44L34 0H-34Z" fill="#1A1A1A" />
      <path d="M-44-64H44V-54H-44Z" fill="#2B2B2B" />
      <path d="M-30-50L-26-10" stroke="rgb(255 255 255 / 0.12)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

/** Potus colgante: tallo que cae desde arriba con hojitas alternadas. */
export function HangingPothos({ className, style }: Props) {
  const leaves = Array.from({ length: 9 }, (_, i) => ({ y: 30 + i * 34, side: i % 2 ? 1 : -1, s: 0.8 + (i % 3) * 0.12 }))
  return (
    <svg viewBox="-50 0 100 340" className={className} style={style} aria-hidden="true">
      <path data-stem="" d="M0 0C8 60-10 120 4 180C14 230-6 280 2 336" stroke="#5E7A2A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <g key={i} data-leaf="" transform={`translate(${l.side * 4} ${l.y}) rotate(${l.side * 120 + 180}) scale(${l.s * 0.32})`}>
          <path d="M0 0C-6-4-26-2-30-18C-34-36-16-54 0-64C16-54 34-36 30-18C26-2 6-4 0 0Z" fill={i % 3 === 1 ? '#97AD3D' : '#6F7F2E'} />
          <path d="M0-4V-58" stroke="rgb(255 255 255 / 0.3)" strokeWidth="3" />
        </g>
      ))}
    </svg>
  )
}

/** Picaflor (colibrí), habitual en los jardines de Iguazú. */
export function Hummingbird({ className, style }: Props) {
  return (
    <svg viewBox="-60 -40 120 70" className={className} style={style} aria-hidden="true">
      <g data-wing="" className="origin-bottom [transform-box:fill-box]">
        <path d="M-6-6C-20-36-44-40-56-34C-40-24-24-10-6 0Z" fill="#6F7F2E" opacity=".9" />
      </g>
      <path d="M-16 6C-36 10-48 20-54 26C-40 24-28 18-14 14Z" fill="#22351E" />
      <ellipse cx="0" cy="2" rx="20" ry="10" fill="#415521" />
      <ellipse cx="4" cy="6" rx="12" ry="5" fill="#64BCB0" opacity=".9" />
      <circle cx="16" cy="-2" r="7" fill="#22351E" />
      <circle cx="18" cy="-3" r="1.6" fill="#FAF7F2" />
      <path d="M22-2L56-8L22 1Z" fill="#3D2314" />
    </svg>
  )
}

/** Sombra de follaje (luz que entra entre hojas) para dar textura al fondo. */
export function LeafShadow({ className, style }: Props) {
  return (
    <svg viewBox="0 0 400 400" className={className} style={style} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="leafshadow-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g filter="url(#leafshadow-blur)" fill="#22351E">
        <path d="M40 380C80 300 60 220 120 160C140 230 120 320 40 380Z" />
        <path d="M120 160C180 120 250 130 300 80C280 150 210 180 120 160Z" />
        <path d="M300 80C330 40 380 30 400 0V60C370 70 340 70 300 80Z" />
        <path d="M200 400C230 340 290 320 330 260C340 320 300 370 200 400Z" />
        <path d="M0 120C40 110 70 80 90 40C40 50 10 80 0 120Z" />
      </g>
    </svg>
  )
}
