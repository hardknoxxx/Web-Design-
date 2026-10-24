import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'

/*
 * Menú de arriba: como la hoja nueva de la referencia. Brota enrollada (un tubo claro con la
 * espiral marcada) desde el pecíolo, arriba a la derecha, y crece por la nervadura hasta la
 * punta; después se desenrolla hacia los dos lados: lo abierto queda plano y oscuro y los dos
 * rollos viajan hacia los bordes, se afinan y desaparecen. El último cuadro es idéntico al
 * panel real del sitio (mismo contorno y colores), para que el cambio no se note.
 */

type Shape = {
  x0: number
  y0: number
  x1: number
  y1: number
  r: [number, number, number, number]
  b: [number, number, number, number]
}
const K = 0.5523

// mismo contorno que el panel del sitio (TopBar.tsx → shapePath/openShape)
function shapePath({ x0, y0, x1, y1, r, b }: Shape) {
  const [tl, tr, br, bl] = r
  const f = (n: number) => n.toFixed(2)
  const edge = (ax: number, ay: number, bx: number, by: number, nx: number, ny: number, bulge: number) => {
    const o = bulge * 1.33
    return `C${f(ax + (bx - ax) / 3 + nx * o)} ${f(ay + (by - ay) / 3 + ny * o)} ${f(ax + ((bx - ax) * 2) / 3 + nx * o)} ${f(ay + ((by - ay) * 2) / 3 + ny * o)} ${f(bx)} ${f(by)}`
  }
  return [
    `M${f(x0 + tl)} ${f(y0)}`,
    edge(x0 + tl, y0, x1 - tr, y0, 0, -1, b[0]),
    `C${f(x1 - tr + tr * K)} ${f(y0)} ${f(x1)} ${f(y0 + tr - tr * K)} ${f(x1)} ${f(y0 + tr)}`,
    edge(x1, y0 + tr, x1, y1 - br, 1, 0, b[1]),
    `C${f(x1)} ${f(y1 - br + br * K)} ${f(x1 - br + br * K)} ${f(y1)} ${f(x1 - br)} ${f(y1)}`,
    edge(x1 - br, y1, x0 + bl, y1, 0, 1, b[2]),
    `C${f(x0 + bl - bl * K)} ${f(y1)} ${f(x0)} ${f(y1 - bl + bl * K)} ${f(x0)} ${f(y1 - bl)}`,
    edge(x0, y1 - bl, x0, y0 + tl, -1, 0, b[3]),
    `C${f(x0)} ${f(y0 + tl - tl * K)} ${f(x0 + tl - tl * K)} ${f(y0)} ${f(x0 + tl)} ${f(y0)}Z`,
  ].join('')
}
const openShape = (w: number, h: number): Shape => ({ x0: 0, y0: 0, x1: w, y1: h, r: [Math.min(104, w * 0.32), 8, Math.min(120, w * 0.36), 6], b: [7, 4, 9, 7] })

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const p = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`

export const HojaMenu = ({ width: w, height: h }: { width: number; height: number }) => {
  const f = useCurrentFrame()
  const leaf = shapePath(openShape(w, h))

  // nervadura central: del pecíolo (arriba a la derecha) a la punta (abajo a la izquierda)
  const A = [w - 12, 12]
  const B = [10, h - 10]
  const len = Math.hypot(B[0] - A[0], B[1] - A[1])
  const m = [(B[0] - A[0]) / len, (B[1] - A[1]) / len]
  const n = [-m[1], m[0]] // un costado; -n es el otro
  const dist = (x: number, y: number) => Math.abs((x - A[0]) * n[0] + (y - A[1]) * n[1])
  const maxD = Math.max(dist(0, 0), dist(w, h), dist(0, h * 0.5), dist(w, h * 0.5)) + 16
  const at = (s: number, o: number) => [A[0] + m[0] * s + n[0] * o, A[1] + m[1] * s + n[1] * o]

  // 1 · brota enrollada y crece por la nervadura
  const grow = interpolate(f, [0, 8], [0.04, 1], { ...clamp, easing: Easing.out(Easing.cubic) })
  // 2 · se desenrolla: un costado arranca antes que el otro (nunca en espejo)
  const openA = interpolate(f, [6, 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) })
  const openB = interpolate(f, [8, 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) })
  const L = len * grow + 30
  const dA = 9 + openA * maxD
  const dB = 9 + openB * maxD
  const young = interpolate(f, [8, 19], [0.55, 0], clamp) // la hoja nueva es más clara
  const veins = interpolate(f, [14, 19], [0, 1], clamp)

  // franja abierta alrededor de la nervadura
  const band = `M${p(...(at(-40, dA) as [number, number]))}L${p(...(at(L, dA) as [number, number]))}L${p(...(at(L, -dB) as [number, number]))}L${p(...(at(-40, -dB) as [number, number]))}Z`

  /** rollo: tubo paralelo a la nervadura con la espiral marcada */
  const roll = (o: number, wd: number, alpha: number, key: string) => {
    if (alpha <= 0.01 || wd <= 0.5) return null
    const s0 = -40
    const s1 = L
    // tubo con la punta afinada, como un cigarro (la hoja recién brotada)
    const side = (sign: number) =>
      Array.from({ length: 24 }, (_, i) => {
        const t = s0 + ((s1 - s0) * i) / 23
        const taper = Math.min(1, (s1 - t) / 46) ** 0.6
        const q = at(t, o + (sign * wd * (0.35 + 0.65 * taper)) / 2)
        return p(q[0], q[1])
      })
    const tube = `M${side(1).join('L')}L${side(-1).reverse().join('L')}Z`
    const g0 = at(0, o + wd / 2)
    const g1 = at(0, o - wd / 2)
    const spirals: string[] = []
    for (let s = s0; s < s1; s += 13) {
      const a = at(s, o + wd / 2)
      const b = at(s + wd * 0.9, o - wd / 2)
      spirals.push(`M${p(a[0], a[1])}L${p(b[0], b[1])}`)
    }
    return (
      <g key={key} opacity={alpha}>
        <defs>
          <linearGradient id={`g-${key}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]}>
            <stop offset="0" stopColor="#173F3B" />
            <stop offset=".35" stopColor="#5FA89C" />
            <stop offset=".55" stopColor="#CDEBE4" />
            <stop offset=".8" stopColor="#3E8C82" />
            <stop offset="1" stopColor="#173F3B" />
          </linearGradient>
        </defs>
        <path d={tube} fill={`url(#g-${key})`} />
        <path d={spirals.join('')} stroke="#FFFFFF" strokeOpacity=".28" strokeWidth="1.2" fill="none" />
        <path d={spirals.join('')} stroke="#173F3B" strokeOpacity=".35" strokeWidth=".8" fill="none" transform="translate(1.5 1.5)" />
      </g>
    )
  }

  const rollW = (o: number) => 30 * (1 - o) ** 0.6 + 3
  const rollAlpha = (o: number) => interpolate(o, [0.82, 1], [1, 0], clamp)

  return (
    <AbsoluteFill>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <clipPath id="hoja">
            <path d={leaf} />
          </clipPath>
          <clipPath id="abierto">
            <path d={band} />
          </clipPath>
          <radialGradient id="luz" gradientUnits="userSpaceOnUse" cx={w} cy={0} r={w * 1.2} gradientTransform={`translate(${w} 0) scale(1 ${(h * 0.7) / (w * 1.2)}) translate(${-w} 0)`}>
            <stop offset="0" stopColor="#64BCB0" stopOpacity=".45" />
            <stop offset=".62" stopColor="#64BCB0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="musgo" gradientUnits="userSpaceOnUse" cx={0} cy={h} r={w * 0.9} gradientTransform={`translate(0 ${h}) scale(1 ${(h * 0.6) / (w * 0.9)}) translate(0 ${-h})`}>
            <stop offset="0" stopColor="#415521" stopOpacity=".35" />
            <stop offset=".7" stopColor="#415521" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g clipPath="url(#hoja)">
          {/* lo que ya se abrió: plano, con los colores del panel */}
          <g clipPath="url(#abierto)">
            <rect width={w} height={h} fill="#1C4A45" />
            <rect width={w} height={h} fill="url(#luz)" />
            <rect width={w} height={h} fill="url(#musgo)" />
            <rect width={w} height={h} fill="#7FBF9A" opacity={young} />
            <g opacity={veins} fill="none" stroke="#FAF7F2" strokeLinecap="round" transform={`scale(${w / 100} ${h / 100})`}>
              <path d="M97 3C74 26 44 58 3 97" strokeOpacity=".16" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
              <g strokeOpacity=".08" strokeWidth="1.2">
                {[18, 36, 54, 72].map((t) => {
                  const x = 97 - t * 0.95
                  const y = 3 + t * 0.95
                  return (
                    <g key={t}>
                      <path d={`M${x} ${y}C${x - 14} ${y - 4} ${x - 26} ${y - 14} ${x - 30} ${y - 26}`} vectorEffect="non-scaling-stroke" />
                      <path d={`M${x} ${y}C${x + 4} ${y + 14} ${x + 14} ${y + 26} ${x + 26} ${y + 30}`} vectorEffect="non-scaling-stroke" />
                    </g>
                  )
                })}
              </g>
            </g>
          </g>
          {/* el tubo central mientras brota, y los dos rollos que viajan a los bordes */}
          {roll(0, 34, interpolate(f, [6, 9], [1, 0], clamp), 'tubo')}
          {roll(dA, rollW(openA), rollAlpha(openA) * interpolate(f, [5, 7], [0, 1], clamp), 'a')}
          {roll(-dB, rollW(openB), rollAlpha(openB) * interpolate(f, [7, 9], [0, 1], clamp), 'b')}
        </g>
      </svg>
    </AbsoluteFill>
  )
}
