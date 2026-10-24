import { useId, type CSSProperties } from 'react'
import { safeId } from './Flora'

/*
 * Soporte del botón de WhatsApp: un tronco de árbol acostado en diagonal, nunca recto ni
 * parejo: grosor que cambia, corteza con grietas a lo largo, un nudo, un muñón de rama
 * cortada, musgo y el corte del extremo con sus anillos. La taza se apoya encima.
 */

type Pt = [number, number]

const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
const f = (n: number) => n.toFixed(1)

// viewBox 0 0 170 150: el tronco entra por abajo y sale por la derecha
const P: Pt = [106, 120]
const ANG = (-34 * Math.PI) / 180
const U: Pt = [Math.cos(ANG), Math.sin(ANG)]
const UP: Pt = [U[1], -U[0]] // normal hacia arriba-izquierda
const S0 = -66 // corte visible abajo a la izquierda
const S1 = 160

const axis = (s: number): Pt => [P[0] + U[0] * s, P[1] + U[1] * s]
const at = (s: number, o: number): Pt => {
  const [x, y] = axis(s)
  return [x + UP[0] * o, y + UP[1] * o]
}
/** radio irregular: el tronco engorda y adelgaza, con un bulto en el nudo */
const R = (s: number, side: number) =>
  50 + Math.sin(s * 0.045 + side) * 3.4 + Math.sin(s * 0.13 + side * 2) * 1.6 + Math.exp(-(((s - 34) / 12) ** 2)) * (side > 0 ? 4 : 0)

function body() {
  const top: string[] = []
  const bot: string[] = []
  for (let s = S0; s <= S1; s += 6) {
    const a = at(s, R(s, 1))
    const b = at(s, -R(s, -1))
    top.push(`${f(a[0])} ${f(a[1])}`)
    bot.push(`${f(b[0])} ${f(b[1])}`)
  }
  return `M${top.join('L')}L${bot.reverse().join('L')}Z`
}

/** grieta de la corteza: sigue el largo del tronco, ondula y se corta a tramos */
function fissure(o: number, k: number) {
  const pts: string[] = []
  for (let s = S0 + 8; s <= S1; s += 4) {
    const p = at(s, o + Math.sin(s * 0.09 + k) * 1.4 + Math.sin(s * 0.31 + k * 2) * 0.6)
    pts.push(`${f(p[0])} ${f(p[1])}`)
  }
  return `M${pts.join('L')}`
}

export function TablaMadera({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = safeId(useId())
  const top = at(0, 52)
  const bottom = at(0, -52)
  const cut = axis(S0)
  const knot = at(34, 28)
  const stub = at(92, 44)
  const deg = (ANG * 180) / Math.PI
  return (
    <svg viewBox="0 0 170 150" overflow="visible" className={className} style={style} aria-hidden="true">
      <defs>
        {/* volumen cilíndrico: arriba recibe luz, abajo cae en sombra */}
        <linearGradient id={`${id}-bark`} gradientUnits="userSpaceOnUse" x1={f(top[0])} y1={f(top[1])} x2={f(bottom[0])} y2={f(bottom[1])}>
          <stop offset="0" stopColor="#9A7454" />
          <stop offset=".3" stopColor="#7A5539" />
          <stop offset=".7" stopColor="#5A3C28" />
          <stop offset="1" stopColor="#2E1E12" />
        </linearGradient>
        <radialGradient id={`${id}-cut`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#E8C99C" />
          <stop offset=".7" stopColor="#D2A776" />
          <stop offset="1" stopColor="#B07F52" />
        </radialGradient>
        <clipPath id={`${id}-c`}>
          <path d={body()} />
        </clipPath>
      </defs>

      {/* helechos que crecen en la esquina, detrás del tronco */}
      <g fill="#415521" opacity=".95">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d="M0 0C-4-10-3-22 0-34C3-22 4-10 0 0Z" transform={`translate(${158 + i * 4} ${150 - i * 3}) rotate(${-40 + i * 16}) scale(${1.4 - i * 0.12})`} />
        ))}
      </g>

      <path d={body()} fill={`url(#${id}-bark)`} />
      <g clipPath={`url(#${id}-c)`} fill="none" strokeLinecap="round">
        {/* grietas de la corteza, más juntas hacia los bordes (curvatura del cilindro) */}
        {Array.from({ length: 13 }, (_, i) => Math.sin(((i + 0.5) / 13 - 0.5) * Math.PI) * 48).map((o, i) => (
          <path
            key={i}
            d={fissure(o, i * 1.7)}
            stroke="#24170D"
            strokeOpacity={0.35 + rnd(i) * 0.25}
            strokeWidth={0.9 + rnd(i + 4) * 1.2}
            strokeDasharray={`${f(12 + rnd(i + 7) * 30)} ${f(3 + rnd(i + 9) * 6)} ${f(8 + rnd(i + 3) * 20)} ${f(2 + rnd(i + 5) * 4)}`}
          />
        ))}
        {Array.from({ length: 8 }, (_, i) => -38 + i * 11 + rnd(i + 20) * 4).map((o, i) => (
          <path key={`r${i}`} d={fissure(o, i * 2.3 + 1)} stroke="#B08A66" strokeOpacity=".22" strokeWidth=".8" strokeDasharray={`${f(6 + rnd(i) * 14)} ${f(8 + rnd(i + 2) * 10)}`} />
        ))}
        {/* nudo */}
        <g transform={`rotate(${deg} ${f(knot[0])} ${f(knot[1])})`}>
          <ellipse cx={f(knot[0])} cy={f(knot[1])} rx="9" ry="6" fill="#3B2416" />
          <ellipse cx={f(knot[0])} cy={f(knot[1])} rx="5.5" ry="3.4" fill="#6B4A33" />
          <ellipse cx={f(knot[0])} cy={f(knot[1])} rx="2.6" ry="1.6" fill="#24170D" />
          <ellipse cx={f(knot[0])} cy={f(knot[1])} rx="13" ry="9" stroke="#24170D" strokeOpacity=".35" strokeWidth="1.2" />
        </g>
        {/* musgo en la parte de abajo y en alguna grieta */}
        {[
          [-30, -40, 9],
          [10, -46, 7],
          [70, -42, 8],
          [-10, 10, 4],
          [120, -30, 6],
        ].map(([s, o, r], i) => {
          const [x, y] = at(s, o)
          return (
            <g key={i}>
              <ellipse cx={f(x)} cy={f(y)} rx={r} ry={r * 0.55} fill="#5E7A2A" opacity=".8" transform={`rotate(${deg} ${f(x)} ${f(y)})`} />
              <ellipse cx={f(x - 1)} cy={f(y - 1)} rx={r * 0.55} ry={r * 0.3} fill="#97AD3D" opacity=".7" transform={`rotate(${deg} ${f(x)} ${f(y)})`} />
            </g>
          )
        })}
      </g>

      {/* muñón de una rama cortada */}
      <g transform={`rotate(${deg + 20} ${f(stub[0])} ${f(stub[1])})`}>
        <path d={`M${f(stub[0] - 9)} ${f(stub[1] + 8)}L${f(stub[0] - 7)} ${f(stub[1] - 10)}L${f(stub[0] + 7)} ${f(stub[1] - 10)}L${f(stub[0] + 9)} ${f(stub[1] + 8)}Z`} fill="#6B4A33" />
        <ellipse cx={f(stub[0])} cy={f(stub[1] - 10)} rx="7" ry="3" fill="#D2A776" stroke="#5A3C28" strokeWidth="1.2" />
        <ellipse cx={f(stub[0])} cy={f(stub[1] - 10)} rx="3.4" ry="1.4" fill="none" stroke="#9A6A42" strokeWidth=".6" />
      </g>

      {/* corte del extremo: anillos, grietas radiales y la corteza alrededor */}
      <g transform={`rotate(${deg} ${f(cut[0])} ${f(cut[1])})`}>
        <ellipse cx={f(cut[0])} cy={f(cut[1])} rx="19" ry="51" fill="#3B2416" />
        <ellipse cx={f(cut[0] - 1)} cy={f(cut[1])} rx="15.5" ry="46" fill={`url(#${id}-cut)`} />
        {[0.82, 0.66, 0.5, 0.36, 0.22, 0.1].map((k, i) => (
          <ellipse
            key={k}
            cx={f(cut[0] - 1 + (i % 2 ? 0.4 : -0.3))}
            cy={f(cut[1] + (i % 2 ? 1 : -0.8))}
            rx={f(15.5 * k)}
            ry={f(46 * k)}
            fill="none"
            stroke="#9A6A42"
            strokeOpacity=".55"
            strokeWidth=".8"
          />
        ))}
        <path d={`M${f(cut[0] - 1)} ${f(cut[1])}L${f(cut[0] - 3)} ${f(cut[1] - 30)}M${f(cut[0] - 1)} ${f(cut[1])}L${f(cut[0] + 4)} ${f(cut[1] + 22)}`} stroke="#5A3C28" strokeWidth=".9" />
      </g>
    </svg>
  )
}
