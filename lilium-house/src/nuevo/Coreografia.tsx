import { useEffect } from 'react'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { gsap, reducido, SplitText } from './animar'

gsap.registerPlugin(DrawSVGPlugin)

/*
 * Coreografía de la página con GSAP + ScrollTrigger. Cada sección entra a su manera (nada de un mismo fundido
 * para todo), una sola vez, cuando su borde superior llega al 80–88 % de la pantalla:
 * - la mesa: el mandala del mantel se dibuja trazo a trazo, como un mantel para colorear;
 * - la vitrina: el título sube por líneas y las fotos se reparten sobre la mesa como láminas;
 * - la carta: el título sube, las pestañas llegan en fila y cada lámina se asienta;
 * - visitanos: el mapa se abre como una persiana y el horario aparece renglón por renglón;
 * - el cierre: el logo se asienta y la frase sube.
 * Con movimiento reducido no se ejecuta: todo queda en su estado final, que es el del HTML.
 */
export function Coreografia() {
  useEffect(() => {
    if (reducido()) return
    const splits: SplitText[] = []
    const lineas = (sel: string, trigger?: string) => {
      const el = document.querySelector<HTMLElement>(sel)
      if (!el) return
      const s = SplitText.create(el, { type: 'lines', mask: 'lines' })
      splits.push(s)
      gsap.from(s.lines, { yPercent: 108, duration: 0.95, stagger: 0.11, scrollTrigger: { trigger: trigger ?? el, start: 'top 85%', once: true } })
    }

    const ctx = gsap.context(() => {
      // la mesa: el mandala se dibuja al cargar
      gsap.from('.mesa-mandala > *', { drawSVG: 0, duration: 1.6, stagger: 0.02, ease: 'power2.inOut', delay: 0.3 })

      // la vitrina
      lineas('#vitrina-titulo')
      gsap.from('.vitrina-texto p, .vitrina-texto .pildora', { y: 24, opacity: 0, duration: 0.8, stagger: 0.09, delay: 0.25, scrollTrigger: { trigger: '.vitrina-texto', start: 'top 82%', once: true } })
      gsap.utils.toArray<HTMLElement>('.lamina-foto-vitrina').forEach((el, i) => {
        gsap.from(el, {
          y: 90,
          rotate: i % 2 ? 9 : -9,
          scale: 0.92,
          opacity: 0,
          duration: 1.1,
          delay: i * 0.08,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
        // deriva lenta de la foto mientras se scrollea: la lámina "respira" sobre su mancha
        gsap.to(el.querySelector('img'), { yPercent: -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
      })

      // la carta
      lineas('#carta-titulo')
      gsap.from('#carta [role="tab"]', { x: -24, opacity: 0, duration: 0.7, stagger: 0.07, scrollTrigger: { trigger: '#carta [role="tablist"]', start: 'top 88%', once: true } })

      // visitanos
      lineas('#visita-titulo')
      gsap.from('#visita figure svg', { clipPath: 'inset(0% 0% 100% 0% round 1.25rem)', duration: 1.3, ease: 'power3.inOut', scrollTrigger: { trigger: '#visita figure', start: 'top 85%', once: true } })
      gsap.from('#visita .horario-fila', { y: 18, opacity: 0, duration: 0.7, stagger: 0.08, scrollTrigger: { trigger: '#visita dl', start: 'top 90%', once: true } })

      // el cierre
      gsap.from('.rincon-logo', { y: 40, scale: 0.94, opacity: 0, duration: 1.1, scrollTrigger: { trigger: '.rincon', start: 'top 80%', once: true } })
      gsap.from('.rincon-frase', { y: 20, opacity: 0, duration: 0.8, delay: 0.2, scrollTrigger: { trigger: '.rincon', start: 'top 80%', once: true } })
    })

    return () => {
      ctx.revert()
      for (const s of splits) s.revert()
    }
  }, [])
  return null
}
