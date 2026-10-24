import { useMotionValue, useMotionValueEvent, useScroll, type MotionValue } from 'framer-motion'
import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'

/**
 * "Un día en Lilium": el scroll de toda la página es el paso del día (08:00 → 21:00).
 * Cada sección declara su fase con data-phase="fondo|texto|hora"; aquí se miden sus
 * posiciones y se derivan la hora (continua) y el color de la barra superior (cambia
 * justo cuando el borde de la sección pasa por debajo de ella) como MotionValues,
 * sin re-renders de React mientras se scrollea. El fondo es uno solo para toda la página:
 * va virando de una fase a la siguiente mientras la sección nueva entra en pantalla, así
 * las escenas se encadenan sin cortes.
 */

type Stop = { at: number; bg: string; fg: string; minutes: number }

type Day = {
  progress: MotionValue<number>
  fg: MotionValue<string>
  bg: MotionValue<string>
  time: MotionValue<string>
}

const DayContext = createContext<Day | null>(null)

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
const fmt = (min: number) => {
  const m = Math.round(min / 5) * 5
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1, 7), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const mix = (a: string, b: string, t: number) => {
  const A = rgb(a)
  const B = rgb(b)
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`
}
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

const DEFAULT_STOPS: Stop[] = [{ at: 0, bg: '#F4E4CC', fg: '#3D2314', minutes: 480 }]
// altura de la barra superior: el color cambia cuando el borde de la sección la cruza
const BAR = 44

/** Ubica el tramo actual entre dos fases. */
function segment(stops: Stop[], p: number) {
  if (stops.length === 1 || p <= stops[0].at) return { a: stops[0], b: stops[0], t: 0 }
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    if (p < b.at) return { a, b, t: (p - a.at) / Math.max(1e-6, b.at - a.at) }
  }
  const last = stops[stops.length - 1]
  return { a: last, b: last, t: 0 }
}

export function DayProvider({ children }: { children: ReactNode }) {
  const { scrollYProgress } = useScroll()
  const stops = useRef<Stop[]>(DEFAULT_STOPS)
  const edge = useRef(0.005)
  // el fondo vira mientras la sección nueva sube de abajo (95 % → 40 % de la pantalla):
  // cuando su contenido ya se lee, el color ya es el suyo
  const blendFrom = useRef(0.07)
  const blendTo = useRef(0.03)

  const fg = useMotionValue(DEFAULT_STOPS[0].fg)
  const time = useMotionValue('08:00')
  const bg = useMotionValue(DEFAULT_STOPS[0].bg)

  const update = (p: number) => {
    const { a, b, t } = segment(stops.current, p)
    fg.set(mix(a.fg, b.fg, smooth(b.at - edge.current, b.at, p)))
    const span = b.at - a.at
    const from = b.at - Math.min(blendFrom.current, span * 0.9)
    const to = b.at - Math.min(blendTo.current, span * 0.4)
    bg.set(mix(a.bg, b.bg, smooth(from, Math.max(to, from + 1e-6), p)))
    time.set(fmt(a.minutes + (b.minutes - a.minutes) * t))
  }
  const updateRef = useRef(update)
  updateRef.current = update
  useMotionValueEvent(scrollYProgress, 'change', update)

  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return
      const list = [...document.querySelectorAll<HTMLElement>('[data-phase]')]
        .map((el) => {
          const [bgc, fgc, t] = (el.dataset.phase ?? '').split('|')
          const top = el.getBoundingClientRect().top + window.scrollY
          return { at: Math.min(1, Math.max(0, (top - BAR) / max)), bg: bgc, fg: fgc, minutes: toMinutes(t) }
        })
        .sort((x, y) => x.at - y.at)
      if (list.length) stops.current = list
      edge.current = 36 / max
      blendFrom.current = (window.innerHeight * 0.95) / max
      blendTo.current = (window.innerHeight * 0.4) / max
      updateRef.current(scrollYProgress.get())
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('load', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('load', measure)
    }
  }, [scrollYProgress])

  return <DayContext.Provider value={{ progress: scrollYProgress, fg, bg, time }}>{children}</DayContext.Provider>
}

export function useDay() {
  const ctx = useContext(DayContext)
  if (!ctx) throw new Error('useDay debe usarse dentro de <DayProvider>')
  return ctx
}
