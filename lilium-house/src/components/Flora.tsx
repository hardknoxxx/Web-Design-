import { useId, type CSSProperties, type ReactNode } from 'react'

/*
 * Flora de la selva misionera para la cortina, el fondo y las escenas.
 * Todas las hojas se dibujan apoyadas en su base (0,0) y crecen hacia -Y, para que
 * girar/escalar desde `origin-bottom` se sienta como una planta real.
 *
 * Para que no parezcan papeles pegados: cada lámina tiene volumen (luz sobre la nervadura
 * central, sombra hacia los bordes y hacia la base), las nervaduras se recortan al contorno
 * y el tallo puede prolongarse por debajo de la base (`stem`) para que la planta nazca del
 * suelo en vez de flotar.
 */

type Props = { className?: string; style?: CSSProperties; color?: string; stem?: number }

export const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '')

/** Aclara (amt > 0) u oscurece (amt < 0) un color hex. */
export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1, 7), 16)
  return (
    '#' +
    [n >> 16, (n >> 8) & 255, n & 255]
      .map((c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt))
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')
  )
}

/** Gradientes de volumen para una lámina: transversal (nervadura iluminada) y longitudinal. */
export function LeafGradients({ id, color }: { id: string; color: string }) {
  return (
    <>
      <linearGradient id={`${id}-x`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={shade(color, -0.32)} />
        <stop offset=".4" stopColor={color} />
        <stop offset=".5" stopColor={shade(color, 0.16)} />
        <stop offset=".58" stopColor={shade(color, -0.04)} />
        <stop offset="1" stopColor={shade(color, -0.38)} />
      </linearGradient>
      <linearGradient id={`${id}-y`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity=".28" />
        <stop offset=".45" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity=".1" />
      </linearGradient>
    </>
  )
}

type BodyProps = {
  d: string
  color: string
  veins?: string
  midrib?: string
  /** pecíolo visible + prolongación hacia abajo (px del viewBox) */
  petiole?: number
  stem?: number
  stemWidth?: number
  children?: ReactNode
}

/** Lámina con volumen: relleno, sombra, nervaduras recortadas al contorno y borde. */
export function LeafBody({ d, color, veins, midrib, petiole = 0, stem = 0, stemWidth = 4, children }: BodyProps) {
  const id = safeId(useId())
  const dark = shade(color, -0.42)
  return (
    <>
      <defs>
        <LeafGradients id={id} color={color} />
        <clipPath id={`${id}-c`}>
          <path d={d} />
        </clipPath>
      </defs>
      {petiole + stem > 0 && (
        <path d={`M0 ${stem}V${-petiole}`} stroke={shade(color, -0.28)} strokeWidth={stemWidth} fill="none" strokeLinecap="round" />
      )}
      <path d={d} fill={`url(#${id}-x)`} />
      <g clipPath={`url(#${id}-c)`}>
        <path d={d} fill={`url(#${id}-y)`} />
        {veins && <path d={veins} stroke={dark} strokeOpacity=".45" strokeWidth="1.2" fill="none" strokeLinecap="round" />}
        {midrib && <path d={midrib} stroke={shade(color, 0.32)} strokeOpacity=".65" strokeWidth="2" fill="none" strokeLinecap="round" />}
        {children}
      </g>
      <path d={d} fill="none" stroke={dark} strokeOpacity=".45" strokeWidth="1.1" strokeLinejoin="round" />
    </>
  )
}

const BANANA = 'M0-6C-10-60-60-140-56-230C-54-280-24-318 0-326C24-318 54-280 56-230C60-140 10-60 0-6Z'

/** Hoja de banano: larga, nervaduras paralelas y rasgaduras que siguen las nervaduras. */
export function BananaLeaf({ className, style, color = '#6F7F2E', stem = 0 }: Props) {
  const id = safeId(useId())
  const veins = Array.from({ length: 17 }, (_, i) => {
    const y = -26 - i * 18
    return `M0 ${y}C-18 ${y - 10} -36 ${y - 14} -64 ${y - 8}M0 ${y}C18 ${y - 10} 36 ${y - 14} 64 ${y - 8}`
  }).join('')
  const tears = [
    [-1, -98],
    [1, -152],
    [-1, -206],
    [1, -242],
  ]
  return (
    <svg viewBox="-70 -330 140 340" overflow="visible" className={className} style={style} aria-hidden="true">
      <defs>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="-80" y="-340" width="160" height={360 + stem}>
          <rect x="-80" y="-340" width="160" height={360 + stem} fill="#fff" />
          {tears.map(([s, y]) => (
            <path key={y} d={`M${s * 70} ${y - 8}C${s * 40} ${y - 12} ${s * 22} ${y - 8} ${s * 12} ${y}`} stroke="#000" strokeWidth="2.6" fill="none" />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${id}-m)`}>
        <LeafBody d={BANANA} color={color} veins={veins} midrib="M0-4V-318" petiole={6} stem={stem} stemWidth={7} />
      </g>
    </svg>
  )
}

/** Un punto y su tangente sobre una bezier cúbica. */
function bezier(p: number[], t: number) {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = p
  const mt = 1 - t
  const x = mt ** 3 * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t ** 3 * x3
  const y = mt ** 3 * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t ** 3 * y3
  const dx = 3 * mt * mt * (x1 - x0) + 6 * mt * t * (x2 - x1) + 3 * t * t * (x3 - x2)
  const dy = 3 * mt * mt * (y1 - y0) + 6 * mt * t * (y2 - y1) + 3 * t * t * (y3 - y2)
  const l = Math.hypot(dx, dy) || 1
  return { x, y, ux: dx / l, uy: dy / l }
}

/** Folíolo afinado que nace del raquis en (x, y), en dirección (ux, uy) y cae con `droop`. */
function blade(x: number, y: number, ux: number, uy: number, len: number, w: number, droop: number) {
  const nx = -uy
  const ny = ux
  const N = 7
  const side = (sign: number) =>
    Array.from({ length: N + 1 }, (_, k) => {
      const s = k / N
      const cx = x + ux * len * s
      const cy = y + uy * len * s + droop * len * s * s
      const half = w * Math.sin(Math.PI * Math.min(1, s * 0.95 + 0.05)) ** 0.8 * (1 - s * 0.35)
      return [cx + nx * half * sign, cy + ny * half * sign]
    })
  const a = side(1)
  const b = side(-1).reverse()
  return 'M' + [...a, ...b].map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join('L') + 'Z'
}

const PALM_RACHIS = [0, 0, 6, -90, 18, -180, 26, -262]

/** Fronda de palmera (pindó): raquis curvo con folíolos afinados que caen. */
export function PalmFrond({ className, style, color = '#415521', stem = 0 }: Props) {
  const id = safeId(useId())
  const leaflets = Array.from({ length: 24 }, (_, i) => {
    const t = 0.04 + (i / 23) * 0.94
    const p = bezier(PALM_RACHIS, t)
    const len = 118 * Math.sin(Math.PI * Math.min(1, t * 0.95 + 0.12)) ** 0.7
    const a = (58 - t * 30) * (Math.PI / 180)
    const make = (sign: number) => {
      // gira la tangente hacia cada lado
      const ux = p.ux * Math.cos(a) - p.uy * Math.sin(a) * sign
      const uy = p.ux * Math.sin(a) * sign + p.uy * Math.cos(a)
      return blade(p.x, p.y, ux, uy, len, 4.6 - t * 1.8, 0.0062)
    }
    return { r: make(1), l: make(-1), k: i }
  })
  return (
    <svg viewBox="-110 -280 240 290" overflow="visible" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="20" y2="-270">
          <stop offset="0" stopColor={shade(color, -0.3)} />
          <stop offset=".55" stopColor={color} />
          <stop offset="1" stopColor={shade(color, 0.16)} />
        </linearGradient>
      </defs>
      {stem > 0 && <path d={`M0 ${stem}V0`} stroke={shade(color, -0.3)} strokeWidth="6" strokeLinecap="round" />}
      <g fill={`url(#${id}-g)`} stroke={shade(color, -0.45)} strokeOpacity=".4" strokeWidth=".8" strokeLinejoin="round">
        {leaflets.map((l) => (
          <g key={l.k}>
            <path d={l.l} opacity={l.k % 2 ? 0.92 : 1} />
            <path d={l.r} />
          </g>
        ))}
      </g>
      <path d="M0 0C6-90 18-180 26-262" stroke={shade(color, -0.3)} strokeWidth="3.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/** Helecho: pinnas unidas al raquis que se achican hacia la punta enrulada. */
export function Fern({ className, style, color = '#97AD3D', stem = 0 }: Props) {
  const id = safeId(useId())
  const dark = shade(color, -0.42)
  const pinnae = Array.from({ length: 15 }, (_, i) => {
    const t = i / 14
    const y = -10 - i * 12.6
    const x = -Math.sin(t * 2.4) * 4
    const len = (i < 2 ? 0.78 : 1) * (8 + 26 * (1 - t) ** 0.85)
    const w = 3 + 3.4 * (1 - t)
    const lift = (26 + t * 18) * (Math.PI / 180)
    const ux = Math.cos(lift)
    const uy = -Math.sin(lift)
    return {
      r: blade(x, y, ux, uy, len, w, 0.006),
      l: blade(x, y, -ux, uy, len, w, 0.006),
      vr: `M${x} ${y}L${(x + ux * len * 0.85).toFixed(1)} ${(y + uy * len * 0.85).toFixed(1)}`,
      vl: `M${x} ${y}L${(x - ux * len * 0.85).toFixed(1)} ${(y + uy * len * 0.85).toFixed(1)}`,
      k: i,
    }
  })
  return (
    <svg viewBox="-60 -210 120 215" overflow="visible" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-205">
          <stop offset="0" stopColor={shade(color, -0.3)} />
          <stop offset=".5" stopColor={color} />
          <stop offset="1" stopColor={shade(color, 0.18)} />
        </linearGradient>
      </defs>
      <path d={`M0 ${stem}C-2-60 4-130-4-196`} stroke={shade(color, -0.3)} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <g fill={`url(#${id}-g)`} stroke={dark} strokeOpacity=".4" strokeWidth=".7" strokeLinejoin="round">
        {pinnae.map((p) => (
          <g key={p.k}>
            <path d={p.l} />
            <path d={p.r} />
          </g>
        ))}
      </g>
      <g stroke={dark} strokeOpacity=".35" strokeWidth=".7" fill="none">
        {pinnae.map((p) => (
          <path key={p.k} d={p.vl + p.vr} />
        ))}
      </g>
      {/* báculo: la punta todavía enrulada */}
      <path d="M-4-196C-6-206 2-210 4-204C6-199 0-197-1-200" stroke={shade(color, -0.2)} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

const HEART = 'M0-40C-10-36-46-40-52-70C-58-104-26-132 0-146C26-132 58-104 52-70C46-40 10-36 0-40Z'

/** Filodendro: hoja acorazonada con pecíolo. */
export function HeartLeaf({ className, style, color = '#415521', stem = 0 }: Props) {
  return (
    <svg viewBox="-60 -150 120 152" overflow="visible" className={className} style={style} aria-hidden="true">
      <LeafBody
        d={HEART}
        color={color}
        midrib="M0-42V-142"
        veins="M0-60C-14-62-30-66-46-80M0-60C14-62 30-66 46-80M0-84C-12-88-24-96-34-112M0-84C12-88 24-96 34-112M0-108C-8-112-14-118-20-128M0-108C8-112 14-118 20-128"
        petiole={40}
        stem={stem}
        stemWidth={5}
      />
    </svg>
  )
}

const CALATHEA = 'M0-30C-30-40-44-90-36-130C-30-160-12-180 0-186C12-180 30-160 36-130C44-90 30-40 0-30Z'

/** Calathea: hoja ovalada con bandas pintadas (como las de las macetas del local). */
export function Calathea({ className, style, color = '#2F4A22', stem = 0 }: Props) {
  return (
    <svg viewBox="-46 -190 92 192" overflow="visible" className={className} style={style} aria-hidden="true">
      <LeafBody d={CALATHEA} color={color} midrib="M0-32V-182" petiole={30} stem={stem}>
        <g fill="#97AD3D" opacity=".6">
          {[-52, -78, -104, -130, -156].map((y, i) => (
            <g key={y}>
              <path d={`M-1 ${y}C-12 ${y - 6} -28 ${y - 6} -50 ${y + 4}C-28 ${y + 2} -12 ${y + 3} -1 ${y + 5}Z`} opacity={1 - i * 0.08} />
              <path d={`M1 ${y}C12 ${y - 6} 28 ${y - 6} 50 ${y + 4}C28 ${y + 2} 12 ${y + 3} 1 ${y + 5}Z`} opacity={1 - i * 0.08} />
            </g>
          ))}
        </g>
      </LeafBody>
    </svg>
  )
}

/** Planta en maceta negra, como las del mostrador de Lilium. */
export function PottedPlant({ className, style }: Props) {
  const id = safeId(useId())
  const leaves: [string, string][] = [
    ['M0-60C-20-110-60-130-70-170C-40-160-10-130 0-60Z', '#415521'],
    ['M0-60C10-120 0-170 14-220C30-170 22-110 0-60Z', '#6F7F2E'],
    ['M0-60C24-100 64-110 76-150C44-148 14-120 0-60Z', '#415521'],
    ['M0-60C-6-100-30-120-36-150C-14-140-4-110 0-60Z', '#97AD3D'],
  ]
  return (
    <svg viewBox="-80 -230 160 236" className={className} style={style} aria-hidden="true">
      <defs>
        {leaves.map(([, c], i) => (
          <LeafGradients key={i} id={`${id}-${i}`} color={c} />
        ))}
      </defs>
      <g data-sway="">
        {leaves.map(([d, c], i) => (
          <path key={i} d={d} fill={`url(#${id}-${i}-x)`} stroke={shade(c, -0.42)} strokeOpacity=".45" strokeWidth="1" />
        ))}
      </g>
      <path d="M-44-64H44L34 0H-34Z" fill="#1A1A1A" />
      <path d="M-44-64H44V-54H-44Z" fill="#2B2B2B" />
      <ellipse cx="0" cy="-62" rx="40" ry="4" fill="#3D2314" />
      <path d="M-30-50L-26-10" stroke="rgb(255 255 255 / 0.12)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

/** Potus colgante: tallo que cae desde arriba con hojitas alternadas. */
export function HangingPothos({ className, style }: Props) {
  const id = safeId(useId())
  const leaves = Array.from({ length: 9 }, (_, i) => ({ y: 30 + i * 34, side: i % 2 ? 1 : -1, s: 0.8 + (i % 3) * 0.12 }))
  return (
    <svg viewBox="-50 0 100 340" className={className} style={style} aria-hidden="true">
      <defs>
        <LeafGradients id={`${id}-a`} color="#6F7F2E" />
        <LeafGradients id={`${id}-b`} color="#97AD3D" />
      </defs>
      <path data-stem="" d="M0 0C8 60-10 120 4 180C14 230-6 280 2 336" stroke="#5E7A2A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <g key={i} data-leaf="" transform={`translate(${l.side * 4} ${l.y}) rotate(${l.side * 120 + 180}) scale(${l.s * 0.32})`}>
          <path
            d="M0 0C-6-4-26-2-30-18C-34-36-16-54 0-64C16-54 34-36 30-18C26-2 6-4 0 0Z"
            fill={`url(#${id}-${i % 3 === 1 ? 'b' : 'a'}-x)`}
            stroke="#34451A"
            strokeOpacity=".5"
            strokeWidth="2"
          />
          <path d="M0-4V-58" stroke="rgb(255 255 255 / 0.3)" strokeWidth="3" />
        </g>
      ))}
    </svg>
  )
}

/**
 * Picaflor (colibrí), habitual en los jardines de Iguazú: de perfil, suspendido en el aire,
 * con el pico largo y fino, garganta tornasolada, panza clara y las alas como un borrón.
 */
export function Hummingbird({ className, style }: Props) {
  const id = safeId(useId())
  return (
    <svg viewBox="-70 -56 140 100" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3E9A72" />
          <stop offset=".5" stopColor="#2C6E4E" />
          <stop offset="1" stopColor="#1C3F2E" />
        </linearGradient>
        <linearGradient id={`${id}-t`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5AC2B2" />
          <stop offset="1" stopColor="#3A7FB8" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      {/* ala trasera (borrón del aleteo) */}
      <g data-wing="back" filter={`url(#${id}-blur)`}>
        <path d="M-4-6C-18-30-30-46-44-52C-36-38-24-20-12-2Z" fill="#9FB8A8" opacity=".45" />
      </g>
      <g transform="rotate(-24)">
        {/* cola en tijera */}
        <path d="M-24 4C-34 2-46 0-60-2C-52 3-38 7-24 9Z" fill="#1C3F2E" />
        <path d="M-24 8C-34 10-46 14-58 19C-50 12-36 8-24 5Z" fill="#24503A" />
        {/* cuerpo */}
        <path d="M-28 6C-24-6-6-12 8-10C18-8 22 2 16 10C6 18-14 16-28 6Z" fill={`url(#${id}-b)`} />
        {/* panza clara */}
        <path d="M-20 10C-10 14 4 16 14 10C8 18-8 20-20 10Z" fill="#E9E6DA" />
        {/* cabeza */}
        <circle cx="16" cy="-4" r="9" fill="#2C6E4E" />
        {/* garganta tornasolada */}
        <path d="M12 2C16 8 22 8 25 2C22 0 16 0 12 2Z" fill={`url(#${id}-t)`} />
        <circle cx="19" cy="-6" r="2" fill="#0E1A14" />
        <circle cx="19.6" cy="-6.6" r=".6" fill="#FFFFFF" />
        <path d="M15-2.5L21.5-1.5" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="1" strokeLinecap="round" />
        {/* pico largo y fino, apenas curvo */}
        <path d="M24-3.5C36-4 48-2 60 1L24-1Z" fill="#1A1A1A" />
        {/* patitas recogidas */}
        <path d="M-2 14L0 18M3 14L5 18" stroke="#1A1A1A" strokeWidth="1" strokeLinecap="round" />
      </g>
      {/* ala delantera */}
      <g data-wing="front" filter={`url(#${id}-blur)`}>
        <path d="M0-4C-6-30-12-48-24-58C-22-40-14-20-6 0Z" fill="#B9CFC1" opacity=".55" />
      </g>
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
