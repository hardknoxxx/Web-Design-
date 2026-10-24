import { useId, type CSSProperties } from 'react'
import { safeId } from './Flora'

/*
 * Soporte del botón de WhatsApp: madera que cubre toda la esquina de la pantalla, con un borde
 * natural irregular (corteza), vetas en diagonal que se desvían alrededor de los nudos,
 * agujeritos de carcoma, grietas y la cucharita apoyada al lado de la taza.
 */

type Pt = [number, number]

// viewBox 0 0 170 150; la madera ocupa la esquina inferior derecha y sigue fuera de pantalla
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
const f = (n: number) => n.toFixed(1)

/** Borde natural: curva cóncava de la esquina con ondulaciones y mordidas irregulares. */
const EDGE: Pt[] = Array.from({ length: 29 }, (_, i) => {
  const t = i / 28
  const mt = 1 - t
  const x = mt * mt * 182 + 2 * mt * t * 34 + t * t * -8
  const y = mt * mt * -6 + 2 * mt * t * 26 + t * t * 160
  // normal aproximada hacia afuera (arriba-izquierda)
  const nx = -(2 * mt * (26 + 6) + 2 * t * (160 - 26)) / 200
  const ny = (2 * mt * (34 - 182) + 2 * t * (-8 - 34)) / 200
  const l = Math.hypot(nx, ny) || 1
  const o = Math.sin(t * 19) * 3.2 + Math.sin(t * 7 + 1) * 4 + (rnd(i) - 0.5) * 3
  return [x + (nx / l) * o, y + (ny / l) * o]
})
const edgeD = (dx = 0, dy = 0) => `M${EDGE.map(([x, y]) => `${f(x + dx)} ${f(y + dy)}`).join('L')}L178 168L178 -12Z`

// vetas en diagonal (de abajo-izquierda hacia arriba-derecha) que se abren alrededor de los nudos
const KNOTS: Pt[] = [
  [128, 62],
  [70, 132],
]
const ANG = (-34 * Math.PI) / 180
function grain(o: number, k: number) {
  const pts: string[] = []
  for (let s = -140; s <= 160; s += 5) {
    let x = 110 + Math.cos(ANG) * s - Math.sin(ANG) * o
    let y = 100 + Math.sin(ANG) * s + Math.cos(ANG) * o
    y += Math.sin(s * 0.045 + k) * 2
    for (const [kx, ky] of KNOTS) {
      const d = Math.hypot(x - kx, y - ky)
      if (d < 22) {
        const push = (22 - d) * 0.6
        x += ((x - kx) / (d || 1)) * push
        y += ((y - ky) / (d || 1)) * push
      }
    }
    pts.push(`${f(x)} ${f(y)}`)
  }
  return `M${pts.join('L')}`
}

// agujeritos de carcoma: irregulares, oscuros, con un borde apenas más claro
const HOLES = Array.from({ length: 9 }, (_, i) => ({
  x: 70 + rnd(i * 3 + 1) * 96,
  y: 40 + rnd(i * 5 + 2) * 104,
  r: 0.9 + rnd(i * 7 + 3) * 1.4,
  a: rnd(i * 11) * 180,
})).filter((h) => !(Math.abs(h.x - 98) < 46 && Math.abs(h.y - 92) < 20)) // no debajo del plato

export function TablaMadera({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = safeId(useId())
  return (
    <svg viewBox="0 0 170 150" overflow="visible" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-w`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B88A5E" />
          <stop offset=".45" stopColor="#9C6C45" />
          <stop offset="1" stopColor="#7A5034" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="58%" cy="62%" r="55%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".12" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-c`}>
          <path d={edgeD()} />
        </clipPath>
      </defs>

      {/* canto y espesor (se ve un poco de la madera por debajo del borde) */}
      <path d={edgeD(2.5, 5)} fill="#3B2416" />
      <path d={edgeD()} fill={`url(#${id}-w)`} />
      <g clipPath={`url(#${id}-c)`} fill="none" strokeLinecap="round">
        <path d={edgeD()} fill={`url(#${id}-glow)`} />
        {Array.from({ length: 15 }, (_, i) => -70 + i * 10 + rnd(i) * 3).map((o, i) => (
          <path
            key={i}
            d={grain(o, i * 1.9)}
            stroke={i % 4 === 0 ? '#D2A472' : '#6B4429'}
            strokeOpacity={i % 4 === 0 ? 0.32 : 0.28 + rnd(i + 9) * 0.18}
            strokeWidth={i % 3 === 0 ? 1.3 : 0.7}
          />
        ))}
        {/* nudos con sus anillos */}
        {KNOTS.map(([x, y], i) => (
          <g key={i} transform={`rotate(-34 ${x} ${y})`}>
            <ellipse cx={x} cy={y} rx={5 - i} ry={3 - i * 0.4} fill="#4A2E1C" opacity=".75" />
            <ellipse cx={x} cy={y} rx={9 - i} ry={5.6 - i * 0.6} stroke="#4A2E1C" strokeOpacity=".35" strokeWidth=".9" />
            <ellipse cx={x} cy={y} rx={13 - i} ry={8 - i * 0.7} stroke="#4A2E1C" strokeOpacity=".18" strokeWidth=".8" />
          </g>
        ))}
        {/* grietas finas siguiendo la veta */}
        <path d="M150 30L139 38L133 37L124 44" stroke="#2E1E12" strokeOpacity=".5" strokeWidth=".8" />
        <path d="M60 150L66 141L72 139L78 131" stroke="#2E1E12" strokeOpacity=".45" strokeWidth=".7" />
        {/* agujeritos de carcoma */}
        {HOLES.map((h, i) => (
          <g key={i} transform={`rotate(${f(h.a)} ${f(h.x)} ${f(h.y)})`}>
            <ellipse cx={f(h.x)} cy={f(h.y)} rx={f(h.r * 1.4)} ry={f(h.r)} fill="#C9A37A" opacity=".45" />
            <ellipse cx={f(h.x)} cy={f(h.y + 0.3)} rx={f(h.r * 1.1)} ry={f(h.r * 0.75)} fill="#1A0F08" />
          </g>
        ))}
        {/* corteza: el borde natural, oscuro, rugoso y con partes más claras */}
        <path d={`M${EDGE.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}`} stroke="#4A3020" strokeWidth="7" strokeOpacity=".85" strokeLinejoin="round" />
        <path d={`M${EDGE.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}`} stroke="#8A6448" strokeWidth="1.6" strokeOpacity=".7" strokeDasharray="4 3 9 2 2 4" />
      </g>

      {/* cucharita acostada al lado de la taza, como la deja el mozo */}
      <g transform="rotate(58 150 108)">
        <ellipse cx="152.5" cy="110" rx="7.5" ry="3.6" fill="#2E1E12" opacity=".22" />
        <path d="M150 107.5H174C175.5 107.5 175.5 110.5 174 110.5H150Z" fill="#2E1E12" opacity=".2" transform="translate(1.5 2)" />
        <path d="M151 107.2H175C176.6 107.4 176.6 110 175 110.2H151Z" fill="#D8C7A2" stroke="#A8916A" strokeWidth=".5" />
        <ellipse cx="148" cy="108.7" rx="7" ry="3.8" fill="#E2D3B2" stroke="#A8916A" strokeWidth=".6" />
        <ellipse cx="147.2" cy="108.2" rx="4.6" ry="2.2" fill="#F4EBD8" opacity=".8" />
      </g>
    </svg>
  )
}
