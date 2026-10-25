import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, reducido, ScrollTrigger } from './animar'

/*
 * Scroll con inercia (Lenis, como Agrumea) para rueda y trackpad: la mesa sigue girando un instante después de
 * soltar la rueda y frena suave. En teléfonos y tablets queda el scroll nativo, que ya tiene su propia inercia y
 * corre fuera del hilo principal. Movimiento reducido: ver animar.ts.
 * Lenis avanza con el reloj de GSAP: Lenis y ScrollTrigger leen la misma posición en el mismo cuadro.
 */

let lenis: Lenis | null = null

export function scrollSuave() {
  const tactil = matchMedia('(hover: none) and (pointer: coarse)').matches
  if (lenis || tactil || reducido()) return
  const instancia = new Lenis({ autoRaf: false, lerp: 0.085, wheelMultiplier: 0.9 })
  lenis = instancia
  instancia.on('scroll', ScrollTrigger.update)
  const tick = (t: number) => instancia.raf(t * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    gsap.ticker.lagSmoothing(500, 33)
    instancia.destroy()
    lenis = null
  }
}

/** El menú abierto frena el scroll de fondo (Lenis no mira el overflow del documento). */
export const pausarScroll = (si: boolean) => (si ? lenis?.stop() : lenis?.start())
