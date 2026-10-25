import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

/*
 * GSAP de la portada: un solo registro de plugins y las curvas de la casa.
 * Curvas (taste-skill / emil-design-eng): expo out para lo que entra y se revela, ida y vuelta para lo que viaja;
 * sin rebotes.
 *
 * Movimiento reducido: decisión del cliente (2026-10-25), el sitio se ve igual en todos los equipos. Muchas PC
 * con Windows tienen las animaciones del sistema apagadas y el navegador lo informa como "reduce"; con eso la
 * mesa perdía la inercia y el desenfoque y el matorral quedaba quieto. Todas las decisiones pasan por
 * `reducido()`, `MOTION_REDUCIDO` y el CSS marcado con "movimiento reducido": para volver a respetar la
 * preferencia, que `reducido()` lea la media query y `MOTION_REDUCIDO` sea 'user'.
 */

gsap.registerPlugin(ScrollTrigger, SplitText, MorphSVGPlugin)
gsap.defaults({ ease: 'expo.out', duration: 0.9 })

export const reducido = () => false
/** Para MotionConfig de motion/react ('user' respetaría la preferencia del sistema). */
export const MOTION_REDUCIDO = 'never' as const

/**
 * Título que sube línea por línea desde su propia máscara. `alEntrar`: espera a que entre en pantalla (una vez).
 * Devuelve la limpieza (revierte el SplitText).
 */
export function lineasQueSuben(el: HTMLElement, { alEntrar = false, retraso = 0.1 } = {}) {
  if (reducido()) return () => {}
  const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'linea' })
  const anim = gsap.from(split.lines, {
    yPercent: 108,
    duration: 0.95,
    stagger: 0.11,
    delay: retraso,
    scrollTrigger: alEntrar ? { trigger: el, start: 'top 88%', once: true } : undefined,
  })
  return () => {
    anim.scrollTrigger?.kill()
    anim.kill()
    split.revert()
  }
}

export { gsap, ScrollTrigger, SplitText }
