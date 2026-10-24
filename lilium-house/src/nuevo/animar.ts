import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

/*
 * GSAP de la portada: un solo registro de plugins y las curvas de la casa.
 * Curvas (taste-skill / emil-design-eng): expo out para lo que entra y se revela, ida y vuelta para lo que viaja;
 * sin rebotes. Con movimiento reducido no se anima nada: el estado final es el de reposo.
 */

gsap.registerPlugin(ScrollTrigger, SplitText)
gsap.defaults({ ease: 'expo.out', duration: 0.9 })

export const reducido = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

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
