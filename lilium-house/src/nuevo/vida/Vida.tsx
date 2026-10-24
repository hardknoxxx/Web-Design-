import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { Clase, PiezaDom } from './motor'

/*
 * Escena con vida: envuelve una sección y le pone por detrás una capa three.js donde la flora y la fauna
 * se mueven. Cada <Pieza> es el dibujo SVG en su lugar (respaldo sin WebGL o con movimiento reducido);
 * cuando el motor está listo, los SVG se apagan y el mismo dibujo sigue, ya vivo, en el lienzo.
 * three.js se baja recién cuando la escena está por entrar en pantalla.
 */

type Registro = { add: (p: PiezaDom) => () => void; vivo: boolean }
const Ctx = createContext<Registro | null>(null)

export function Vida({ children }: { children: ReactNode }) {
  const capaRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const piezas = useRef<PiezaDom[]>([])
  const [vivo, setVivo] = useState(false)
  const registro = useRef<Registro>({
    add: (p) => {
      piezas.current.push(p)
      return () => (piezas.current = piezas.current.filter((x) => x !== p))
    },
    vivo: false,
  })
  registro.current = { ...registro.current, vivo }

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const capa = capaRef.current!
    let dispose: (() => void) | undefined
    let cancelled = false
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        import('./motor')
          .then(({ createVida }) => (cancelled ? undefined : createVida(capa, canvasRef.current!, piezas.current, () => !cancelled && setVivo(true))))
          .then((d) => {
            if (cancelled) d?.()
            else dispose = d
          })
          // sin WebGL quedan los dibujos quietos: la página se ve igual
          .catch(() => {})
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(capa)
    return () => {
      cancelled = true
      io.disconnect()
      dispose?.()
    }
  }, [])

  return (
    <Ctx.Provider value={registro.current}>
      <div ref={capaRef} aria-hidden="true" className="vida-capa" data-vivo={vivo || undefined}>
        <canvas ref={canvasRef} className="vida-lienzo" />
      </div>
      {children}
    </Ctx.Provider>
  )
}

export function Pieza({ clase, fase = 0, className = '', style, children }: { clase: Clase; fase?: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const ctx = useContext(Ctx)
  useEffect(() => ctx?.add({ el: ref.current!, clase, fase }), [])
  return (
    <div ref={ref} aria-hidden="true" className={`pieza ${className}`} style={style} data-oculta={ctx?.vivo || undefined}>
      {children}
    </div>
  )
}
