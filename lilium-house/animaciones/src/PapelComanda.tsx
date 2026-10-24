import { AbsoluteFill, random, useCurrentFrame } from 'remotion'

/*
 * Comanda: como la referencia del papel. Stop-motion a 12 cuadros por segundo: una bolita
 * apretada se abre en una bola con facetas, pasa a ser una hoja muy arrugada y se va alisando
 * hasta quedar lisa, igual al papel del sitio (mismo tamaño, color, renglones y giro). Cada
 * cuadro tiene sus propias arrugas, como fotografiado a mano.
 *
 * La bolita nace en `origen` (por defecto, el centro del papel): el vuelo desde la boca de la
 * taza hasta el centro de la pantalla lo hace el sitio, porque depende del tamaño de pantalla.
 */

const PAPER = { x: 6, y: 4, w: 288, h: 330 } // papel final dentro del lienzo de 300×420

type Stage = {
  cx: number // centro (0 = origen, 1 = lugar final)
  size: number // 0 = bolita, 1 = hoja completa
  crumple: number // 1 = muy arrugado, 0 = liso
  rot: number
}

// cuadros clave, como la secuencia de la referencia
const STAGES: Stage[] = [
  { cx: 0, size: 0.06, crumple: 1, rot: -24 },
  { cx: 0.12, size: 0.1, crumple: 1, rot: -14 },
  { cx: 0.3, size: 0.2, crumple: 1, rot: 6 },
  { cx: 0.5, size: 0.34, crumple: 0.95, rot: -10 },
  { cx: 0.7, size: 0.55, crumple: 0.9, rot: 8 },
  { cx: 0.86, size: 0.8, crumple: 0.82, rot: -5 },
  { cx: 0.96, size: 0.97, crumple: 0.7, rot: 2 },
  { cx: 1, size: 1.02, crumple: 0.52, rot: -3.5 },
  { cx: 1, size: 1, crumple: 0.32, rot: -1.5 },
  { cx: 1, size: 1, crumple: 0.16, rot: -2.4 },
  { cx: 1, size: 1, crumple: 0.05, rot: -2 },
  { cx: 1, size: 1, crumple: 0, rot: -2 },
]

const pt = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`

export const PapelComanda = ({ origenX, origenY }: { origenX: number; origenY: number }) => {
  const f = Math.min(useCurrentFrame(), STAGES.length - 1)
  const s = STAGES[f]
  const seed = `papel-${f}`
  const fx = PAPER.x + PAPER.w / 2
  const fy = PAPER.y + PAPER.h / 2
  const cx = origenX + (fx - origenX) * s.cx
  const cy = origenY + (fy - origenY) * s.cx

  // contorno: de una bola irregular (radio con mordidas) a un rectángulo con bordes rotos
  const N = 40
  const ball = Math.min(PAPER.w, PAPER.h) * 0.5 * s.size
  const outline: [number, number][] = []
  for (let i = 0; i < N; i++) {
    const t = i / N
    // punto sobre el rectángulo final (perímetro)
    const per = t * 4
    const side = Math.floor(per)
    const u = per - side
    const hw = (PAPER.w / 2) * s.size
    const hh = (PAPER.h / 2) * s.size
    const rect: [number, number] =
      side === 0 ? [-hw + u * 2 * hw, -hh] : side === 1 ? [hw, -hh + u * 2 * hh] : side === 2 ? [hw - u * 2 * hw, hh] : [-hw, hh - u * 2 * hh]
    // punto sobre la bola
    const a = Math.atan2(rect[1], rect[0])
    const rb = ball * (0.78 + random(`${seed}-r${i}`) * 0.44)
    const round: [number, number] = [Math.cos(a) * rb, Math.sin(a) * rb]
    // cuanto más chica, más bola; cuanto más grande, más rectángulo
    const k = Math.min(1, Math.max(0, (s.size - 0.15) / 0.75)) ** 1.4
    const jit = s.crumple * (4 + 10 * (1 - k)) * s.size + s.crumple * 2
    outline.push([
      cx + round[0] + (rect[0] - round[0]) * k + (random(`${seed}-x${i}`) - 0.5) * jit,
      cy + round[1] + (rect[1] - round[1]) * k + (random(`${seed}-y${i}`) - 0.5) * jit,
    ])
  }
  const d = `M${outline.map(([x, y]) => pt(x, y)).join('L')}Z`

  // facetas: malla de triángulos chicos (como el papel arrugado de la referencia), cada uno
  // con su luz; la malla se deforma de disco (bola) a rectángulo (hoja) igual que el contorno
  const k = Math.min(1, Math.max(0, (s.size - 0.15) / 0.75)) ** 1.4
  const COLS = 7
  const ROWS = 8
  const grid: [number, number][][] = []
  for (let r = 0; r <= ROWS; r++) {
    const row: [number, number][] = []
    for (let c = 0; c <= COLS; c++) {
      const u = (c / COLS) * 2 - 1
      const v = (r / ROWS) * 2 - 1
      const disc: [number, number] = [u * Math.sqrt(1 - (v * v) / 2) * ball, v * Math.sqrt(1 - (u * u) / 2) * ball]
      const rect: [number, number] = [u * (PAPER.w / 2) * s.size, v * (PAPER.h / 2) * s.size]
      const edge = c === 0 || r === 0 || c === COLS || r === ROWS
      const jit = s.crumple * (edge ? 0 : 1) * (6 + 14 * s.size)
      row.push([
        cx + disc[0] + (rect[0] - disc[0]) * k + (random(`${seed}-gx${r}-${c}`) - 0.5) * jit,
        cy + disc[1] + (rect[1] - disc[1]) * k + (random(`${seed}-gy${r}-${c}`) - 0.5) * jit,
      ])
    }
    grid.push(row)
  }
  const facets: { d: string; l: number }[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const [a1, b1, c1, d1] = [grid[r][c], grid[r][c + 1], grid[r + 1][c + 1], grid[r + 1][c]]
      const flip = random(`${seed}-f${r}-${c}`) > 0.5
      const t1 = flip ? [a1, b1, c1] : [a1, b1, d1]
      const t2 = flip ? [a1, c1, d1] : [b1, c1, d1]
      for (const [ti, tri] of [t1, t2].entries()) {
        facets.push({ d: `M${tri.map(([x, y]) => pt(x, y)).join('L')}Z`, l: random(`${seed}-l${r}-${c}-${ti}`) })
      }
    }
  }

  // renglones de la comanda (aparecen cuando el papel ya está casi liso)
  const lines = Array.from({ length: Math.floor(PAPER.h / 28) }, (_, i) => PAPER.y + 28 * (i + 1))

  return (
    <AbsoluteFill>
      <svg width={300} height={420} viewBox="0 0 300 420">
        <defs>
          <clipPath id="papel">
            <path d={d} />
          </clipPath>
        </defs>
        <g transform={`rotate(${s.rot} ${cx} ${cy})`}>
          <path d={d} fill="#FFFDF9" />
          <g clipPath="url(#papel)">
            {/* renglones */}
            {s.crumple < 0.4 &&
              lines.map((y) => <rect key={y} x={PAPER.x} y={y - 1} width={PAPER.w} height={1} fill="#64BCB0" opacity={0.14 * (1 - s.crumple / 0.4)} />)}
            {/* facetas con luz y sombra: lo que hace que se vea arrugado */}
            {facets.map((fc, i) => (
              <path key={i} d={fc.d} fill={fc.l > 0.5 ? '#FFFFFF' : '#3D2314'} opacity={s.crumple * (fc.l > 0.5 ? 0.6 : 0.1 + fc.l * 0.2)} />
            ))}
            {/* pliegues: aristas claras y su sombra */}
            {facets.map((fc, i) =>
              i % 2 ? null : (
                <path key={`e${i}`} d={fc.d} fill="none" stroke={fc.l > 0.6 ? '#FFFFFF' : '#8C7A66'} strokeOpacity={s.crumple * (fc.l > 0.6 ? 0.9 : 0.28)} strokeWidth={0.7} />
              ),
            )}
            {/* sombra suave hacia los bordes mientras está arrugado (volumen de bola) */}
            <ellipse cx={cx} cy={cy} rx={ball * 1.2 + 10} ry={ball * 1.2 + 10} fill="none" stroke="#3D2314" strokeOpacity={0.12 * s.crumple * (1 - s.size)} strokeWidth={ball * 0.5 + 2} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  )
}
