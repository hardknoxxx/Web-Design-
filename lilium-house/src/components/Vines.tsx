import { useRef } from 'react'
import { gsap, MOTION_OK, ScrollTrigger, useGsap } from '../lib/gsap'

/*
 * Enredaderas que trepan por los bordes a medida que avanza el día (scroll).
 * Asimétricas a propósito: a la izquierda un filodendro (tallo grueso, hojas acorazonadas)
 * que arranca rápido y se toma un respiro a media página; a la derecha una hiedra fina
 * con zarcillos y flores que empieza tarde y se apura al atardecer.
 */

const VW = 80
const VH = 1000

const HEART = 'M0 0C-6-4-26-2-30-18C-34-36-16-54 0-64C16-54 34-36 30-18C26-2 6-4 0 0Z'
const IVY = 'M0 0C-4-6-14-6-16-12C-12-14-8-16-8-20C-4-18-2-24 0-28C2-24 4-18 8-20C8-16 12-14 16-12C14-6 4-6 0 0Z'

type Bud = { x: number; y: number; r: number; s: number; t: number; kind: 'heart' | 'ivy' | 'flower' | 'tendril'; c: string }
type VineShape = { d: string; buds: Bud[]; stem: string; width: number }

/** progreso de la página → fracción dibujada (tramos lineales) */
type Curve = [number, number][]
const LEFT_CURVE: Curve = [[0, 0.05], [0.26, 0.48], [0.5, 0.52], [0.78, 0.86], [1, 1]]
const RIGHT_CURVE: Curve = [[0, 0], [0.2, 0.03], [0.48, 0.36], [0.7, 0.62], [0.9, 0.97], [1, 1]]

/** inversa: ¿en qué progreso de página se alcanza la fracción f? */
function whenDrawn(curve: Curve, f: number) {
  for (let i = 0; i < curve.length - 1; i++) {
    const [p0, f0] = curve[i]
    const [p1, f1] = curve[i + 1]
    if (f <= f1) return f1 === f0 ? p0 : p0 + ((f - f0) / (f1 - f0)) * (p1 - p0)
  }
  return 1
}

function philodendron(): VineShape {
  const x0 = 20
  let d = `M${x0} ${VH + 10}`
  const buds: Bud[] = []
  let i = 0
  for (let y = VH + 10; y > -20; y -= 70, i++) {
    const ny = y - 70
    const nx = x0 + Math.sin(i * 0.9) * 9
    d += ` C${x0 + 26} ${y - 22} ${x0 - 14} ${ny + 26} ${nx.toFixed(1)} ${ny}`
    if (ny > 30 && ny < VH - 20) {
      const side = i % 2 ? 1 : -1
      buds.push({ x: nx, y: ny, r: side * (48 + (i % 3) * 10), s: 0.5 + (i % 3) * 0.08, t: (VH + 10 - ny) / (VH + 30), kind: 'heart', c: i % 2 ? '#415521' : '#2F4A22' })
    }
  }
  return { d, buds, stem: '#4A5E22', width: 4 }
}

function ivy(): VineShape {
  const x0 = 18
  let d = `M${x0} ${VH + 10}`
  const buds: Bud[] = []
  let i = 0
  for (let y = VH + 10; y > -20; y -= 38, i++) {
    const ny = y - 38
    const nx = x0 + Math.sin(i * 1.7 + 1) * 5
    d += ` Q${(x0 + Math.cos(i * 1.7) * 16).toFixed(1)} ${y - 19} ${nx.toFixed(1)} ${ny}`
    if (ny > 20 && ny < VH - 10) {
      const t = (VH + 10 - ny) / (VH + 30)
      buds.push({ x: nx, y: ny, r: 70, s: 0.55, t, kind: 'ivy', c: '#97AD3D' })
      buds.push({ x: nx, y: ny, r: -60, s: 0.45, t: t + 0.004, kind: 'ivy', c: '#6F7F2E' })
      if (i % 4 === 2) buds.push({ x: nx, y: ny - 10, r: 0, s: 1, t: t + 0.006, kind: 'tendril', c: '#6F7F2E' })
      if (i % 5 === 3) buds.push({ x: nx + 8, y: ny - 6, r: 0, s: 1, t: t + 0.01, kind: 'flower', c: '#D9A441' })
    }
  }
  return { d, buds, stem: '#6F7F2E', width: 2.2 }
}

const LEFT = philodendron()
const RIGHT = ivy()

function BudShape({ b }: { b: Bud }) {
  if (b.kind === 'heart')
    return (
      <>
        <path d={HEART} fill={b.c} />
        <path d="M0-4V-58" stroke="rgb(255 255 255 / 0.22)" strokeWidth="2.5" />
      </>
    )
  if (b.kind === 'ivy') return <path d={IVY} fill={b.c} />
  if (b.kind === 'tendril')
    return <path d="M0 0C6-6 14-4 14 4C14 10 6 10 6 5C6 2 9 1 10 3" fill="none" stroke={b.c} strokeWidth="1.4" strokeLinecap="round" />
  return (
    <>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx="0" cy="-4" r="3" fill={b.c} transform={`rotate(${a})`} />
      ))}
      <circle r="2" fill="#B4472B" />
    </>
  )
}

function Vine({ shape, curve, scrub, side }: { shape: VineShape; curve: Curve; scrub: number; side: 'left' | 'right' }) {
  const ref = useRef<SVGSVGElement>(null)

  useGsap(ref, () => {
    const svg = ref.current!
    const stem = svg.querySelector<SVGPathElement>('[data-stem]')!
    // trazo manual: dasharray = largo total, el offset controla cuánto se ve
    const len = stem.getTotalLength()
    const drawn = (f: number) => ({ strokeDashoffset: len * (1 - f) })
    gsap.set(stem, { strokeDasharray: len })
    const buds = gsap.utils.toArray<SVGGElement>('[data-bud]', svg)
    gsap.set(buds, { scale: 0, transformOrigin: '50% 100%' })

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub },
    })
    // tallo: tramos con distinta velocidad (y una pausa) según la curva de cada lado
    tl.set(stem, drawn(curve[0][1]), 0)
    for (let i = 1; i < curve.length; i++) {
      const [p0] = curve[i - 1]
      const [p1, f1] = curve[i]
      tl.to(stem, { ...drawn(f1), duration: p1 - p0 }, p0)
    }
    // cada hoja brota cuando la punta del tallo pasa por ella
    buds.forEach((el, i) => {
      const b = shape.buds[i]
      tl.to(el, { scale: b.s, duration: 0.035, ease: b.kind === 'flower' ? 'back.out(3)' : 'back.out(1.7)' }, Math.min(0.965, whenDrawn(curve, b.t)))
    })

    // vaivén propio de cada lado (distinto período y amplitud)
    gsap.matchMedia().add(MOTION_OK, () => {
      gsap.to(svg, {
        rotation: side === 'left' ? 0.6 : -1.1,
        transformOrigin: side === 'left' ? '0% 100%' : '100% 100%',
        duration: side === 'left' ? 6.5 : 3.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    })
    ScrollTrigger.refresh()
  })

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio={side === 'right' ? 'xMaxYMax meet' : 'xMinYMax meet'}
      className={`pointer-events-none fixed top-0 z-30 h-[100lvh] w-auto ${side === 'right' ? 'right-0' : 'left-0'}`}
      aria-hidden="true"
    >
      {/* el espejo va dentro del SVG: un transform CSS en el <svg> choca con el de GSAP */}
      <g transform={side === 'right' ? `translate(${VW} 0) scale(-1 1)` : undefined}>
        <path data-stem="" d={shape.d} fill="none" stroke={shape.stem} strokeWidth={shape.width} strokeLinecap="round" />
        {shape.buds.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.r})`}>
            <g data-bud="">
              <BudShape b={b} />
            </g>
          </g>
        ))}
      </g>
    </svg>
  )
}

export function Vines() {
  return (
    <>
      <Vine shape={LEFT} curve={LEFT_CURVE} scrub={1.2} side="left" />
      <Vine shape={RIGHT} curve={RIGHT_CURVE} scrub={2.4} side="right" />
    </>
  )
}
