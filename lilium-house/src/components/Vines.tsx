import { m, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useDay } from '../day/DayProvider'

/* Enredaderas que trepan por los bordes a medida que avanza el día (scroll). */

const VW = 70
const VH = 1000
const LEAF = 'M0 0C-40-10-50-60-10-92C-4-96 4-96 10-92C50-60 40-10 0 0Z'
// IguazuFalls (musgo, helecho) + Monet (hoja)
const LEAF_COLORS = ['#415521', '#97AD3D', '#749E89']

type VineLeafData = { x: number; y: number; r: number; t: number; s: number; c: string }

function buildVine(phase: number) {
  const x0 = 16
  let d = `M${x0} ${VH + 10}`
  const leaves: VineLeafData[] = []
  let i = 0
  for (let y = VH + 10; y > -20; y -= 48, i++) {
    const ny = y - 48
    const nx = x0 + Math.sin(i * 1.25 + phase) * 7
    const cx = x0 + Math.sin(i * 1.25 + phase + 0.7) * 18
    d += ` Q${cx.toFixed(1)} ${(y - 24).toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`
    if (ny > 10 && ny < VH - 10) {
      leaves.push({
        x: nx,
        y: ny,
        r: i % 2 ? 62 : 18,
        t: (VH + 10 - ny) / (VH + 30),
        s: i % 3 === 0 ? 0.3 : 0.24,
        c: LEAF_COLORS[i % 3],
      })
      // zarcillo pequeño entre hojas
      if (i % 4 === 2) leaves.push({ x: nx, y: ny + 20, r: -40, t: (VH - 10 - ny) / (VH + 30), s: 0.15, c: LEAF_COLORS[1] })
    }
  }
  return { d, leaves }
}

const LEFT = buildVine(0)
const RIGHT = buildVine(1.9)

function VineLeaf({ grow, leaf }: { grow: MotionValue<number>; leaf: VineLeafData }) {
  const scale = useTransform(grow, [leaf.t - 0.015, leaf.t + 0.025], [0, leaf.s])
  return (
    <g transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r})`}>
      <m.path d={LEAF} fill={leaf.c} style={{ scale, originX: 0.5, originY: 1 }} />
    </g>
  )
}

function Vine({ data, grow, flip }: { data: ReturnType<typeof buildVine>; grow: MotionValue<number>; flip?: boolean }) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="xMinYMax meet"
      className={`pointer-events-none fixed top-0 z-30 h-[100lvh] w-auto ${flip ? 'right-0 -scale-x-100' : 'left-0'}`}
      aria-hidden="true"
    >
      <m.path
        d={data.d}
        fill="none"
        stroke="#5E7A2A"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ pathLength: grow }}
      />
      {data.leaves.map((l, i) => (
        <VineLeaf key={i} grow={grow} leaf={l} />
      ))}
    </svg>
  )
}

export function Vines() {
  const { progress } = useDay()
  const smooth = useSpring(progress, { stiffness: 90, damping: 26, restDelta: 0.0005 })
  // siempre asoma un brote; llega arriba al final del día
  const left = useTransform(smooth, [0, 0.95], [0.05, 1])
  const right = useTransform(smooth, [0, 1], [0.03, 0.96])
  return (
    <>
      <Vine data={LEFT} grow={left} />
      <Vine data={RIGHT} grow={right} flip />
    </>
  )
}
