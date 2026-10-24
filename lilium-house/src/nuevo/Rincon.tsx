import { useEffect, useRef } from 'react'
import { LogoLilium } from './LogoLilium'
import type { Rincon as Escena } from './tres/rincon3d'

/*
 * El cierre: el rincón verde del local en 3D (tres/rincon3d.ts), con el logo arriba. Reemplaza al friso de
 * ilustraciones sueltas: acá cada planta está en su maceta, sobre el mostrador, y la fauna vive alrededor.
 * three.js se baja recién cuando el cierre se acerca a la pantalla; sin WebGL queda el logo y el pie.
 */
export function Rincon() {
  const ref = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = ref.current!
    const canvas = canvasRef.current!
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let escena: Escena | null = null
    let raf = 0
    let visible = false
    let cancelado = false

    const progreso = () => {
      const r = el.getBoundingClientRect()
      return Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)))
    }
    const medir = () => escena?.resize(canvas.clientWidth, canvas.clientHeight)
    const frame = () => {
      raf = 0
      escena?.render(progreso())
      if (visible && !reduced && !document.hidden) raf = requestAnimationFrame(frame)
    }
    const arrancar = () => {
      if (!raf && escena) raf = requestAnimationFrame(frame)
    }

    const cerca = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || escena) return
        cerca.disconnect()
        import('./tres/rincon3d')
          .then(({ createRincon }) => {
            if (cancelado) return
            const e = createRincon(canvas)
            return e.preparar().then(() => {
              if (cancelado) return e.dispose()
              escena = e
              medir()
              el.dataset.vivo = ''
              arrancar()
            })
          })
          .catch(() => {})
      },
      { rootMargin: '500px 0px' },
    )
    const enPantalla = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) arrancar()
    })
    cerca.observe(el)
    enPantalla.observe(el)
    const ro = new ResizeObserver(medir)
    ro.observe(canvas)
    return () => {
      cancelado = true
      cancelAnimationFrame(raf)
      cerca.disconnect()
      enPantalla.disconnect()
      ro.disconnect()
      escena?.dispose()
    }
  }, [])

  return (
    <footer ref={ref} className="rincon" aria-labelledby="rincon-titulo">
      <div className="rincon-cabeza">
        <h2 id="rincon-titulo" className="sr-only">
          Lilium Coffee Lounge
        </h2>
        <LogoLilium className="rincon-logo" />
        <p className="rincon-frase">Sabores que te sacan una sonrisa en cada sorbo y bocado.</p>
      </div>
      <canvas ref={canvasRef} className="rincon-lienzo" aria-hidden="true" />
      <p className="rincon-pie">© Lilium Coffee Lounge · Puerto Iguazú, Misiones</p>
    </footer>
  )
}
