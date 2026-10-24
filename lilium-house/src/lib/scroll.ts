import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, ScrollTrigger } from './gsap'

/*
 * Scroll suave con Lenis para rueda y trackpad. En teléfonos y tablets queda el scroll nativo:
 * la inercia del sistema es la más natural al dedo y corre fuera del hilo principal (Lenis lo
 * imitaría con JavaScript). Con movimiento reducido tampoco se activa.
 *
 * Lenis avanza con el reloj de GSAP: Lenis, ScrollTrigger y Framer Motion leen la misma
 * posición en el mismo cuadro, sin un requestAnimationFrame aparte que llegue un cuadro tarde.
 */

let lenis: Lenis | null = null

export function startSmoothScroll() {
  const touchOnly = matchMedia('(hover: none) and (pointer: coarse)').matches
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (lenis || touchOnly || reduced) return

  const instance = new Lenis({
    autoRaf: false,
    lerp: 0.09,
    // los enlaces del menú-hoja (#carta, #selva…) también viajan con la misma curva
    anchors: true,
  })
  lenis = instance
  instance.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  // sin esto GSAP "comprime" los cuadros lentos y el scroll da un salto
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    gsap.ticker.lagSmoothing(500, 33)
    instance.destroy()
    lenis = null
  }
}
