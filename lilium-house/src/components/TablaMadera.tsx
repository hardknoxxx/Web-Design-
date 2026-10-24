import { useId, type CSSProperties } from 'react'
import { safeId } from './Flora'

/*
 * Soporte del botón de WhatsApp: una tabla de madera con borde natural (corteza), en diagonal,
 * que entra desde la esquina de la pantalla. Se ve su espesor, las vetas siguen el largo de
 * la tabla y termina en un extremo redondeado e irregular. La taza se apoya en el centro.
 */

type Pt = [number, number]

// viewBox 0 0 170 150; la tabla sale por el borde derecho
const C: Pt = [100, 94]
const ANG = (-32 * Math.PI) / 180
const U: Pt = [Math.cos(ANG), Math.sin(ANG)]
const N: Pt = [-U[1], U[0]] // normal hacia abajo-derecha
const S0 = -104 // extremo visible (izquierda abajo)
const S1 = 150 // se pierde fuera de la pantalla

const at = (s: number, o: number): Pt => [C[0] + U[0] * s + N[0] * o, C[1] + U[1] * s + N[1] * o]
// medio ancho con el borde natural: ondulado y distinto en cada lado
const half = (s: number, side: 1 | -1) => 34 + Math.sin(s * 0.06 + (side > 0 ? 1.3 : 0)) * 3.2 + Math.sin(s * 0.17 + side) * 1.4
const f = (n: number) => n.toFixed(1)

function outline(dy = 0) {
  const top: string[] = []
  const bot: string[] = []
  for (let s = S0 + 14; s <= S1; s += 8) {
    const a = at(s, -half(s, -1))
    const b = at(s, half(s, 1))
    top.push(`${f(a[0])} ${f(a[1] + dy)}`)
    bot.push(`${f(b[0])} ${f(b[1] + dy)}`)
  }
  // extremo redondeado e irregular
  const e1 = at(S0 + 2, -26)
  const e2 = at(S0 - 4, 0)
  const e3 = at(S0 + 4, 28)
  return `M${bot[0]}Q${f(e3[0])} ${f(e3[1] + dy)} ${f(e2[0])} ${f(e2[1] + dy)}Q${f(e1[0])} ${f(e1[1] + dy)} ${top[0]}L${top.join('L')}L${bot.reverse().join('L')}Z`
}

/** Veta paralela al largo de la tabla, con ondas suaves y un desvío alrededor del nudo. */
function grain(o: number, k: number) {
  const pts: string[] = []
  for (let s = S0 + 6; s <= S1; s += 6) {
    const knot = Math.exp(-(((s - 44) / 18) ** 2)) * (o > 10 ? 6 : o < -2 ? -5 : 0)
    const p = at(s, o + Math.sin(s * 0.05 + k) * 1.6 + knot)
    pts.push(`${f(p[0])} ${f(p[1])}`)
  }
  return `M${pts.join('L')}`
}

export function TablaMadera({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = safeId(useId())
  const knot = at(44, 16)
  const spoon = at(-50, 22)
  const spoonEnd = at(-24, 25)
  return (
    <svg viewBox="0 0 170 150" overflow="visible" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-top`} gradientUnits="userSpaceOnUse" x1={f(at(0, -36)[0])} y1={f(at(0, -36)[1])} x2={f(at(0, 36)[0])} y2={f(at(0, 36)[1])}>
          <stop offset="0" stopColor="#B98A60" />
          <stop offset=".5" stopColor="#A07148" />
          <stop offset="1" stopColor="#875C3A" />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <path d={outline()} />
        </clipPath>
      </defs>
      {/* espesor de la tabla */}
      <path d={outline(7)} fill="#4A3020" />
      <path d={outline(3.5)} fill="#6B4A33" />
      {/* cara de arriba */}
      <path d={outline()} fill={`url(#${id}-top)`} />
      <g clipPath={`url(#${id}-c)`} fill="none" strokeLinecap="round">
        {[-24, -15, -7, 2, 10, 19, 27].map((o, i) => (
          <path key={o} d={grain(o, i * 1.7)} stroke={i % 3 ? '#7A5236' : '#C99A6A'} strokeOpacity={i % 3 ? 0.4 : 0.35} strokeWidth={i % 2 ? 0.8 : 1.2} />
        ))}
        {/* nudo con sus anillos */}
        <ellipse cx={f(knot[0])} cy={f(knot[1])} rx="5" ry="3" fill="#5A3C28" opacity=".7" transform={`rotate(-32 ${f(knot[0])} ${f(knot[1])})`} />
        <ellipse cx={f(knot[0])} cy={f(knot[1])} rx="8.5" ry="5.2" stroke="#5A3C28" strokeOpacity=".35" transform={`rotate(-32 ${f(knot[0])} ${f(knot[1])})`} />
        {/* corteza: el borde natural, oscuro y rugoso */}
        <path d={outline()} stroke="#4A3020" strokeWidth="5" strokeOpacity=".75" />
        <path d={outline()} stroke="#2E1E12" strokeWidth="1.4" strokeOpacity=".5" strokeDasharray="3 2 6 2" />
      </g>
      {/* cucharita apoyada en la tabla, al costado del plato */}
      <g>
        <path d={`M${f(spoon[0])} ${f(spoon[1])}L${f(spoonEnd[0])} ${f(spoonEnd[1])}`} stroke="#3D2314" strokeOpacity=".25" strokeWidth="3.4" strokeLinecap="round" transform="translate(1 2)" />
        <path d={`M${f(spoon[0])} ${f(spoon[1])}L${f(spoonEnd[0])} ${f(spoonEnd[1])}`} stroke="#C9B48C" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx={f(spoon[0])} cy={f(spoon[1])} rx="5.2" ry="3.2" fill="#C9B48C" stroke="#A08A62" strokeWidth=".6" transform={`rotate(-32 ${f(spoon[0])} ${f(spoon[1])})`} />
      </g>
    </svg>
  )
}
