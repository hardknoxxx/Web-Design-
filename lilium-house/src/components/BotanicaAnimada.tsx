import { m, type MotionValue } from 'motion/react'

/* Piezas de la escena "Ritual" del sitio anterior que se mueven con Framer Motion. Viven aparte de
   Botanica.tsx para que la portada nueva, que solo usa las ilustraciones quietas, no cargue Framer Motion. */

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
