import { m } from 'framer-motion'
import { memo, useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

const PALETTE = [
  { name: 'Turquesa', value: '#00A896' },
  { name: 'Rosa', value: '#E07A5F' },
  { name: 'Mostaza', value: '#E9B44C' },
  { name: 'Salvia', value: '#5B7B5A' },
  { name: 'Terracota', value: '#B5532F' },
  { name: 'Lavanda', value: '#9C89B8' },
  { name: 'Madera', value: '#3D2314' },
  { name: 'Crema', value: '#FFFDF9' },
] as const

const BLANK = '#FFFDF9'

type Region = { id: string; ring: string; d: string }

const r2 = (n: number) => Math.round(n * 100) / 100
const polar = (r: number, a: number) => `${r2(r * Math.sin(a))} ${r2(-r * Math.cos(a))}`

function petal(r0: number, r1: number, a: number, w: number) {
  const rm = r0 + (r1 - r0) * 0.55
  return `M${polar(r0, a)} Q${polar(rm, a + w)} ${polar(r1, a)} Q${polar(rm, a - w)} ${polar(r0, a)}Z`
}

function scallop(r: number, peak: number, a0: number, a1: number) {
  return `M${polar(r, a0)} Q${polar(peak, (a0 + a1) / 2)} ${polar(r, a1)} A${r} ${r} 0 0 0 ${polar(r, a0)}Z`
}

function circle(r: number, a: number, dist: number) {
  const [cx, cy] = polar(dist, a).split(' ').map(Number)
  return `M${r2(cx - r)} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`
}

/** Geometría del mandala: anillos con simetría rotacional. */
function buildMandala(): Region[] {
  const regions: Region[] = []
  const TAU = Math.PI * 2
  const ring = (name: string, n: number, make: (a: number, i: number) => string, offset = 0) => {
    for (let i = 0; i < n; i++) regions.push({ id: `${name}-${i}`, ring: name, d: make((i / n) * TAU + offset, i) })
  }
  regions.push({ id: 'fondo', ring: 'fondo', d: circle(97, 0, 0) })
  ring('puntos', 8, (a) => circle(4.5, a, 88), TAU / 16)
  ring('hojas', 8, (a) => petal(66, 95, a, 0.13))
  ring('gotas', 16, (a) => petal(57, 82, a, 0.1), TAU / 32)
  ring('arcos', 16, (a) => scallop(54, 69, a - TAU / 32, a + TAU / 32))
  regions.push({ id: 'banda', ring: 'banda', d: `${circle(54, 0, 0)}` })
  ring('petalos-ext', 8, (a) => petal(16, 52, a, 0.36), TAU / 16)
  ring('petalos-int', 8, (a) => petal(10, 38, a, 0.3))
  ring('semillas', 8, (a) => circle(2.6, a, 13), TAU / 16)
  regions.push({ id: 'centro', ring: 'centro', d: circle(9, 0, 0) })
  return regions
}

const REGIONS = buildMandala()
const RINGS = [...new Set(REGIONS.map((r) => r.ring))]

const MandalaShape = memo(function MandalaShape({
  fills,
  onPaint,
}: {
  fills: Record<string, string>
  onPaint: (r: Region) => void
}) {
  return (
    <g stroke="#3D2314" strokeWidth="0.7" strokeLinejoin="round">
      {REGIONS.map((r) => (
        <path
          key={r.id}
          d={r.d}
          fill={fills[r.id] ?? BLANK}
          className="cursor-pointer transition-[fill] duration-300 hover:opacity-85"
          onClick={() => onPaint(r)}
        />
      ))}
      {/* nervaduras decorativas, no interactivas */}
      <g fill="none" strokeWidth="0.45" opacity="0.55" pointerEvents="none">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M${polar(14, (i / 8) * Math.PI * 2)} L${polar(32, (i / 8) * Math.PI * 2)}`} />
        ))}
        <circle r="60" strokeDasharray="1.5 2.5" />
      </g>
    </g>
  )
})

export function MandalaColoring({ intro }: { intro?: ReactNode }) {
  const [color, setColor] = useState<string>(PALETTE[0].value)
  const [symmetric, setSymmetric] = useState(true)
  const [fills, setFills] = useState<Record<string, string>>({})
  const svgRef = useRef<SVGSVGElement>(null)

  const paint = useCallback(
    (region: Region) => {
      setFills((prev) => {
        const next = { ...prev }
        const targets = symmetric ? REGIONS.filter((r) => r.ring === region.ring) : [region]
        for (const t of targets) next[t.id] = color
        return next
      })
    },
    [color, symmetric],
  )

  const surprise = () => {
    const pick = (): string => PALETTE[Math.floor(Math.random() * (PALETTE.length - 1))].value
    const byRing = Object.fromEntries(RINGS.map((r) => [r, pick()]))
    byRing.fondo = Math.random() > 0.5 ? BLANK : '#F0EAE1'
    setFills(Object.fromEntries(REGIONS.map((r) => [r.id, byRing[r.ring]])))
  }

  const download = () => {
    const svg = svgRef.current
    if (!svg) return
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute('width', '1080')
    clone.setAttribute('height', '1080')
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }))
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1080
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#FAF7F2'
      ctx.fillRect(0, 0, 1080, 1080)
      ctx.drawImage(img, 0, 0, 1080, 1080)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => {
        if (!blob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'mi-mandala-lilium.png'
        a.click()
        setTimeout(() => URL.revokeObjectURL(a.href), 1000)
      })
    }
    img.src = url
  }

  const painted = useMemo(() => Object.values(fills).some((f) => f !== BLANK), [fills])

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-x-14 lg:gap-y-8">
      {intro && <div className="lg:col-start-1 lg:row-start-1 lg:self-end">{intro}</div>}
      <m.div
        initial={{ opacity: 0, scale: 0.94, rotate: -8 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full max-w-[min(100%,520px)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
      >
        <div className="absolute -inset-3 rounded-full border border-dashed border-madera/20" />
        <svg
          ref={svgRef}
          viewBox="-100 -100 200 200"
          className="relative w-full touch-manipulation drop-shadow-[0_18px_30px_rgb(61_35_20/0.18)]"
          role="group"
          aria-label="Mandala para colorear: tocá una zona para pintarla"
        >
          <MandalaShape fills={fills} onPaint={paint} />
        </svg>
      </m.div>

      <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
        <fieldset>
          <legend className="text-sm font-semibold tracking-wide text-madera/70 uppercase">Elegí un color</legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {PALETTE.map((p) => {
              const active = color === p.value
              return (
                <button
                  key={p.value}
                  type="button"
                  aria-label={p.name}
                  aria-pressed={active}
                  onClick={() => setColor(p.value)}
                  className={`h-11 w-11 rounded-full border-2 transition-transform duration-200 ${
                    active ? 'scale-110 border-madera ring-2 ring-madera/25 ring-offset-2 ring-offset-crema' : 'border-madera/25'
                  }`}
                  style={{ backgroundColor: p.value }}
                />
              )
            })}
          </div>
        </fieldset>

        <label className="mt-6 flex cursor-pointer items-center gap-3 select-none">
          <span className="relative inline-flex">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={symmetric}
              onChange={(e) => setSymmetric(e.target.checked)}
            />
            <span className="h-7 w-12 rounded-full bg-madera/20 transition-colors peer-checked:bg-turquesa peer-focus-visible:ring-2 peer-focus-visible:ring-turquesa peer-focus-visible:ring-offset-2" />
            <span className="absolute top-1 left-1 h-5 w-5 rounded-full bg-crema shadow transition-transform peer-checked:translate-x-5" />
          </span>
          <span className="text-base text-madera/85">
            Modo simetría <span className="text-madera/55">— pinta todo el anillo</span>
          </span>
        </label>

        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={surprise} className="btn btn-outline min-h-11 px-5 py-2 text-sm">
            Inspirame
          </button>
          <button
            type="button"
            onClick={() => setFills({})}
            disabled={!painted}
            className="btn min-h-11 px-5 py-2 text-sm text-madera/70 underline-offset-4 hover:underline disabled:opacity-40"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!painted}
            className="btn btn-primary min-h-11 px-5 py-2 text-sm disabled:opacity-50 disabled:shadow-none"
          >
            Descargar PNG
          </button>
        </div>
      </div>
    </div>
  )
}
