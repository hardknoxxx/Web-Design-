import { useId, type CSSProperties } from 'react'
import { LeafGradients, safeId } from './Flora'

/*
 * Soporte rústico del botón de WhatsApp: ramas que nacen de los bordes de la pantalla
 * (derecho e inferior) y se cruzan como un nido; una enredadera las ata en el cruce,
 * donde se apoya la taza. Cada rama es un tubo afinado y curvo (nunca un rectángulo):
 * cara iluminada arriba, sombra abajo, corteza, un nudo y ramitas.
 */

type Pt = [number, number]
type Branch = { p: Pt[]; w: [number, number]; seed: number }

// viewBox 0 0 170 150: las ramas arrancan fuera del cuadro para que "nazcan" del borde
const BACK: Branch = { p: [[188, 122], [146, 116], [98, 98], [52, 70]], w: [10, 3], seed: 3 }
const MAIN: Branch = { p: [[188, 42], [150, 58], [70, 100], [16, 164]], w: [19, 11], seed: 1 }
const FRONT: Branch = { p: [[152, 168], [128, 120], [84, 72], [28, 50]], w: [16, 3.4], seed: 2 }
const TWIGS: Branch[] = [
  { p: [[58, 62], [52, 46], [46, 36], [38, 26]], w: [3.2, 1], seed: 4 },
  { p: [[150, 58], [148, 44], [152, 32], [160, 22]], w: [4, 1.2], seed: 5 },
  { p: [[120, 112], [126, 124], [124, 134], [116, 142]], w: [3.4, 1.2], seed: 6 },
]
// anillo de ramitas que acuna el plato (perspectiva de nido): mitad de atrás y de adelante
const NIDO_ATRAS: Branch = { p: [[46, 92], [58, 68], [138, 68], [150, 90]], w: [4, 3], seed: 7 }
const NIDO_FRENTE: Branch = { p: [[44, 96], [56, 122], [140, 122], [152, 94]], w: [4.4, 3.2], seed: 8 }
/** punto de cruce (donde se apoya la taza) */
export const CRUCE: Pt = [98, 92]

function at(p: Pt[], t: number) {
  const mt = 1 - t
  const [a, b, c, d] = p
  const x = mt ** 3 * a[0] + 3 * mt * mt * t * b[0] + 3 * mt * t * t * c[0] + t ** 3 * d[0]
  const y = mt ** 3 * a[1] + 3 * mt * mt * t * b[1] + 3 * mt * t * t * c[1] + t ** 3 * d[1]
  const dx = 3 * mt * mt * (b[0] - a[0]) + 6 * mt * t * (c[0] - b[0]) + 3 * t * t * (d[0] - c[0])
  const dy = 3 * mt * mt * (b[1] - a[1]) + 6 * mt * t * (c[1] - b[1]) + 3 * t * t * (d[1] - c[1])
  const l = Math.hypot(dx, dy) || 1
  // normal hacia arriba (lado de la luz)
  let nx = -dy / l
  let ny = dx / l
  if (ny > 0) {
    nx = -nx
    ny = -ny
  }
  return { x, y, nx, ny }
}

const f = (n: number) => n.toFixed(1)

/** Tubo afinado a lo largo de la curva; `off` corre el eje (en anchos) y `k` escala el grosor. */
function tube({ p, w, seed }: Branch, off = 0, k = 1, N = 26) {
  const L: string[] = []
  const R: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const { x, y, nx, ny } = at(p, t)
    const width = (w[0] + (w[1] - w[0]) * t) * (1 + Math.sin(t * 17 + seed * 2.3) * 0.07)
    const cx = x + nx * off * width
    const cy = y + ny * off * width
    const h = (width * k) / 2
    L.push(`${f(cx + nx * h)} ${f(cy + ny * h)}`)
    R.push(`${f(cx - nx * h)} ${f(cy - ny * h)}`)
  }
  const tip = at(p, 1)
  const end = `Q${f(tip.x + (tip.x - at(p, 0.97).x) * 1.2)} ${f(tip.y + (tip.y - at(p, 0.97).y) * 1.2)} `
  return `M${L.join('L')}${end}${R.reverse().join('L')}Z`
}

/** Línea de corteza paralela al eje, con cortes irregulares. */
function bark({ p, w }: Branch, off: number, from = 0.04, to = 0.9) {
  const pts: string[] = []
  for (let i = 0; i <= 20; i++) {
    const t = from + ((to - from) * i) / 20
    const { x, y, nx, ny } = at(p, t)
    const width = w[0] + (w[1] - w[0]) * t
    pts.push(`${f(x + nx * off * width)} ${f(y + ny * off * width)}`)
  }
  return `M${pts.join('L')}`
}

function Rama({ b, base = '#6B4A33' }: { b: Branch; base?: string }) {
  return (
    <g>
      <path d={tube(b)} fill={base} />
      <path d={tube(b, -0.24, 0.34)} fill="#A27A55" opacity=".7" />
      <path d={tube(b, 0.3, 0.32)} fill="#2E1E12" opacity=".45" />
      <g fill="none" stroke="#2E1E12" strokeOpacity=".35" strokeWidth=".7" strokeLinecap="round">
        <path d={bark(b, 0.1)} strokeDasharray="7 3 12 4 5 3" />
        <path d={bark(b, -0.08, 0.1, 0.8)} strokeDasharray="4 5 9 3" />
      </g>
      <path d={tube(b)} fill="none" stroke="#2E1E12" strokeOpacity=".35" strokeWidth=".8" />
    </g>
  )
}

// hojitas de la enredadera: [x, y, giro, escala, tono]
const HOJAS: [number, number, number, number, 'a' | 'b'][] = [
  [124, 70, -40, 1, 'a'],
  [74, 112, 150, 0.9, 'b'],
  [112, 104, 70, 0.75, 'a'],
  [36, 46, -70, 0.8, 'b'],
  [160, 22, 20, 0.85, 'a'],
  [62, 58, -120, 0.7, 'a'],
]

export function RamasNido({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = safeId(useId())
  return (
    <svg viewBox="0 0 170 150" overflow="visible" className={className} style={style} aria-hidden="true">
      <defs>
        <LeafGradients id={`${id}-a`} color="#6F7F2E" />
        <LeafGradients id={`${id}-b`} color="#415521" />
      </defs>
      <Rama b={BACK} base="#5A3C28" />
      <Rama b={NIDO_ATRAS} base="#5A3C28" />
      {TWIGS.map((t) => (
        <Rama key={t.seed} b={t} />
      ))}
      <Rama b={MAIN} />
      {/* nudo en la rama principal */}
      <ellipse cx="146" cy="60" rx="3.6" ry="2.4" fill="#2E1E12" opacity=".55" transform="rotate(-24 146 60)" />
      <ellipse cx="146" cy="60" rx="5.6" ry="3.8" fill="none" stroke="#2E1E12" strokeOpacity=".3" transform="rotate(-24 146 60)" />
      <Rama b={FRONT} base="#755136" />
      <Rama b={NIDO_FRENTE} base="#7A5638" />
      {/* enredadera que ata el cruce */}
      <path
        d="M168 30C150 40 140 64 126 70C112 76 118 92 104 96C90 100 84 84 74 92C64 100 70 114 58 122C46 130 40 140 30 152"
        fill="none"
        stroke="#5E7A2A"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M104 96C108 104 100 110 94 106M74 92C70 86 76 80 80 84" fill="none" stroke="#6F7F2E" strokeWidth="1" strokeLinecap="round" />
      {HOJAS.map(([x, y, r, s, c], i) => (
        <path
          key={i}
          d="M0 0C-4-3-12-2-14-9C-15-17-7-24 0-28C7-24 15-17 14-9C12-2 4-3 0 0Z"
          transform={`translate(${x} ${y}) rotate(${r}) scale(${s * 0.62})`}
          fill={`url(#${id}-${c}-x)`}
          stroke="#34451A"
          strokeOpacity=".5"
          strokeWidth="1.2"
        />
      ))}
      <g transform="translate(130 74)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-3" rx="1.8" ry="3" fill="#D9A441" transform={`rotate(${a})`} />
        ))}
        <circle r="1.5" fill="#B4472B" />
      </g>
    </svg>
  )
}
