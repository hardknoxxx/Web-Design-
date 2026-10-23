import { useId, type CSSProperties } from 'react'
import { LeafGradients, safeId, shade } from './Flora'

/*
 * Paisaje de fondo: selva lejana con palmeras pindó, sotobosque que da suelo a las
 * escenas y una rama de ceibo (la flor nacional) donde se alimenta el picaflor.
 */

type Props = { className?: string; style?: CSSProperties }

// pseudo-aleatorio determinista (mismo dibujo en cada render)
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Línea de copas de árboles: arcos irregulares a lo ancho. */
function canopy(y: number, h: number, step: number, seed: number, w = 800) {
  let d = `M0 ${y}`
  let x = 0
  let i = 0
  while (x < w) {
    const s = step * (0.7 + rnd(seed + i) * 0.7)
    const top = y - h * (0.35 + rnd(seed + i * 3) ** 1.6 * 0.95)
    d += `C${(x + s * 0.1).toFixed(1)} ${top.toFixed(1)} ${(x + s * 0.9).toFixed(1)} ${top.toFixed(1)} ${(x + s).toFixed(1)} ${(y - h * 0.2 * rnd(seed + i * 7)).toFixed(1)}`
    x += s
    i++
  }
  return `${d}V300H0Z`
}

/** Palmera pindó en silueta: tronco fino y corona de frondas caídas. */
function pindo(x: number, base: number, h: number, k: number) {
  const top = base - h
  const lean = (rnd(k) - 0.5) * 16
  const fronds = Array.from({ length: 7 }, (_, j) => {
    const a = -160 + j * 23 + (rnd(k + j) - 0.5) * 10
    const r = 26 + rnd(k * 2 + j) * 10
    const ex = x + lean + Math.cos((a * Math.PI) / 180) * r
    const ey = top + Math.sin((a * Math.PI) / 180) * r * 0.55 + r * 0.45
    const cx = x + lean + Math.cos((a * Math.PI) / 180) * r * 0.55
    const cy = top + Math.sin((a * Math.PI) / 180) * r * 0.75 - 4
    return `M${x + lean} ${top}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`
  }).join('')
  return { trunk: `M${x} ${base}Q${x + lean * 0.3} ${base - h * 0.5} ${x + lean} ${top}`, fronds }
}

/** Selva lejana: tres planos de copas en bruma y palmeras pindó que asoman. */
export function SelvaLejana({ className, style }: Props) {
  const id = safeId(useId())
  const palms = [70, 210, 330, 470, 610, 720].map((x, k) => pindo(x, 150, 70 + rnd(k + 9) * 40, k + 3))
  return (
    <svg viewBox="0 0 800 220" preserveAspectRatio="xMidYMax slice" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CBD5B0" />
          <stop offset="1" stopColor="#B7C69A" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9BB86" />
          <stop offset="1" stopColor="#8DA46A" />
        </linearGradient>
        <linearGradient id={`${id}-c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7E9858" />
          <stop offset="1" stopColor="#5E7A3A" />
        </linearGradient>
      </defs>
      <path d={canopy(120, 46, 40, 1)} fill={`url(#${id}-a)`} />
      <g stroke="#A3B583" strokeWidth="3" fill="none" strokeLinecap="round">
        {palms.map((p, k) => (
          <g key={k}>
            <path d={p.trunk} />
            <path d={p.fronds} strokeWidth="2.6" />
          </g>
        ))}
      </g>
      <path d={canopy(162, 40, 32, 40)} fill={`url(#${id}-b)`} />
      <path d={canopy(204, 30, 24, 90)} fill={`url(#${id}-c)`} />
    </svg>
  )
}

/** Sotobosque: matas, pastos y hojitas al ras del suelo, para que nada flote. */
export function Sotobosque({ className, style }: Props) {
  const id = safeId(useId())
  const tufts = Array.from({ length: 46 }, (_, i) => {
    const x = (i / 45) * 820 - 10 + (rnd(i) - 0.5) * 12
    const h = 26 + rnd(i + 50) * 34
    const a = (rnd(i + 99) - 0.5) * 50
    const c = ['#2F4A22', '#415521', '#4A5E22', '#6F7F2E'][i % 4]
    return { x, h, a, c, k: i }
  })
  return (
    <svg viewBox="0 0 800 90" preserveAspectRatio="xMidYMax slice" className={className} style={style} aria-hidden="true">
      <defs>
        {['#2F4A22', '#415521', '#4A5E22', '#6F7F2E'].map((c) => (
          <LeafGradients key={c} id={`${id}-${c.slice(1)}`} color={c} />
        ))}
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34451A" />
          <stop offset="1" stopColor="#22351E" />
        </linearGradient>
      </defs>
      {tufts.map((t) => (
        <g key={t.k} transform={`translate(${t.x.toFixed(1)} 92) rotate(${t.a.toFixed(1)})`}>
          <path
            d={`M0 0C-${t.h * 0.3} -${t.h * 0.3} -${t.h * 0.26} -${t.h * 0.8} 0 -${t.h}C${t.h * 0.26} -${t.h * 0.8} ${t.h * 0.3} -${t.h * 0.3} 0 0Z`}
            fill={`url(#${id}-${t.c.slice(1)}-x)`}
            stroke={shade(t.c, -0.45)}
            strokeOpacity=".4"
          />
        </g>
      ))}
      {/* pastos finos por delante */}
      <g stroke="#4A5E22" strokeWidth="1.6" fill="none" strokeLinecap="round">
        {Array.from({ length: 70 }, (_, i) => {
          const x = (i / 69) * 800
          const h = 14 + rnd(i + 200) * 22
          const b = (rnd(i + 300) - 0.5) * 14
          return <path key={i} d={`M${x.toFixed(1)} 92Q${(x + b * 0.3).toFixed(1)} ${92 - h * 0.6} ${(x + b).toFixed(1)} ${92 - h}`} />
        })}
      </g>
      <path d="M0 80C120 74 260 84 400 78C540 72 680 84 800 78V92H0Z" fill={`url(#${id}-g)`} />
    </svg>
  )
}

/** Rama de ceibo con flores rojas (la flor nacional), entrando desde el borde izquierdo. */
export function CeiboRama({ className, style }: Props) {
  const id = safeId(useId())
  const flowers: [number, number, number][] = [
    [118, -22, -20],
    [150, -6, 10],
    [92, 4, 30],
  ]
  const leaves: [number, number, number][] = [
    [40, 12, 200],
    [64, 2, -30],
    [130, 10, 150],
    [170, -14, -60],
  ]
  return (
    <svg viewBox="-10 -60 200 100" overflow="visible" className={className} style={style} aria-hidden="true">
      <defs>
        <LeafGradients id={`${id}-l`} color="#5E7A2A" />
        <linearGradient id={`${id}-f`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E0384A" />
          <stop offset="1" stopColor="#A3172B" />
        </linearGradient>
      </defs>
      <path d="M-40 26C20 22 70 14 110 0C130-8 150-10 178-18" stroke="#6B4A33" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M110 0C118-8 120-16 118-22M140-8C146-4 150 0 150-6" stroke="#6B4A33" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {leaves.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          {[-30, 0, 30].map((a) => (
            <path
              key={a}
              d="M0 0C-5-4-6-12 0-18C6-12 5-4 0 0Z"
              transform={`rotate(${a}) translate(0 -3)`}
              fill={`url(#${id}-l-x)`}
              stroke="#34451A"
              strokeOpacity=".4"
              strokeWidth=".6"
            />
          ))}
        </g>
      ))}
      {flowers.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M0 0C-2 6-1 10 2 12" stroke="#7A2A22" strokeWidth="1.6" fill="none" />
          {/* estandarte grande y quilla curva, como la flor del ceibo */}
          <path d="M2 12C-10 16-18 28-14 40C-6 34 2 24 2 12Z" fill={`url(#${id}-f)`} />
          <path d="M2 12C10 18 14 28 10 38C4 32 0 22 2 12Z" fill="#C42438" />
          <path d="M2 12C0 16 1 22 3 26" stroke="#7A1424" strokeWidth=".8" fill="none" opacity=".6" />
          <circle cx="2" cy="12" r="2.2" fill="#6E2A20" />
        </g>
      ))}
    </svg>
  )
}
