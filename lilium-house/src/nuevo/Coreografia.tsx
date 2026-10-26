import { useEffect } from 'react'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { gsap, reducido, SplitText } from './animar'
import { ondulado } from './Piezas'

gsap.registerPlugin(DrawSVGPlugin)

/*
 * Coreografía de la página con GSAP + ScrollTrigger. Cada sección entra a su manera (nada de un mismo fundido
 * para todo), una sola vez, cuando su borde superior llega al 80–88 % de la pantalla:
 * - la mesa: el mandala del mantel se dibuja trazo a trazo, como un mantel para colorear;
 * - la vitrina: el título sube por líneas y el mazo de fotos cae sobre la mesa y se acomoda;
 * - la carta: el título sube, las pestañas llegan en fila y cada lámina se asienta;
 * - visitanos: la sección se derrama como una mancha de café desde el mapa, el título cae letra por letra y
 *   el horario aparece renglón por renglón;
 * - el cierre: el logo se asienta y la frase sube.
 * Movimiento reducido: ver animar.ts.
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

      // la portada se achica y se oscurece mientras la vitrina sube y la tapa (las dos secciones se apilan)
      const tapa = { trigger: '.vitrina', start: 'top bottom', end: 'top 25%', scrub: true }
      gsap.to('.mesa-sticky', { scale: 0.9, borderRadius: 32, ease: 'none', scrollTrigger: tapa })
      gsap.to('.mesa-velo', { opacity: 0.35, ease: 'none', scrollTrigger: tapa })

      // la vitrina
      lineas('#vitrina-titulo')
      gsap.from('.vitrina-texto p, .vitrina-texto .pildora', { y: 24, opacity: 0, duration: 0.8, stagger: 0.09, delay: 0.25, scrollTrigger: { trigger: '.vitrina-texto', start: 'top 82%', once: true } })
      // el mazo llega como si lo dejaran sobre la mesa: cae torcido y se acomoda; la mancha se abre detrás
      gsap.from('.mazo-pila', { y: 120, rotate: -12, opacity: 0, duration: 1.2, scrollTrigger: { trigger: '.mazo', start: 'top 88%', once: true } })
      gsap.from('.mazo-mancha', { scale: 0.6, opacity: 0, duration: 1.4, delay: 0.1, scrollTrigger: { trigger: '.mazo', start: 'top 88%', once: true } })
      gsap.from('.mazo-controles > *, .mazo-pista', { y: 16, opacity: 0, duration: 0.7, stagger: 0.06, delay: 0.5, scrollTrigger: { trigger: '.mazo', start: 'top 80%', once: true } })

      // la carta
      lineas('#carta-titulo')
      // las pestañas llegan en fila (opacidad y desenfoque: su transform es del imán y del toque)
      gsap.from('#carta [role="tab"]', { opacity: 0, filter: 'blur(6px)', duration: 0.7, stagger: 0.08, scrollTrigger: { trigger: '#carta [role="tablist"]', start: 'top 88%', once: true } })

      // visitanos se derrama sobre la carta como una mancha de café: una forma ondulada que nace junto al mapa y
      // crece con el scroll hasta cubrir la sección; al terminar se saca la máscara (no queda costo de pintado)
      const visita = document.querySelector<HTMLElement>('#visita')
      if (visita) {
        const forma = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='-100 -100 200 200'><path d='${ondulado(9, 0.06)}'/></svg>`
        visita.style.setProperty('--mancha-forma', `url("data:image/svg+xml,${encodeURIComponent(forma)}")`)
        visita.classList.add('visita-mancha')
        gsap.fromTo(visita, { '--mancha': '0vmax' }, {
          '--mancha': '260vmax',
          ease: 'power2.in',
          scrollTrigger: {
            trigger: visita,
            start: 'top bottom',
            end: 'top top',
            scrub: 0.6,
            onUpdate: (st) => visita.classList.toggle('abierta', st.progress > 0.999),
          },
        })
      }
      const titulo = document.querySelector<HTMLElement>('#visita-titulo')
      if (titulo) {
        const s = SplitText.create(titulo, { type: 'chars' })
        splits.push(s)
        gsap.from(s.chars, { yPercent: -120, rotate: () => gsap.utils.random(-25, 25), opacity: 0, duration: 0.9, ease: 'back.out(2.2)', stagger: 0.045, scrollTrigger: { trigger: titulo, start: 'top 85%', once: true } })
      }
      gsap.from('#visita-titulo ~ p, #visita-titulo ~ ul li', { x: -24, opacity: 0, duration: 0.7, stagger: 0.08, delay: 0.35, scrollTrigger: { trigger: '#visita-titulo', start: 'top 85%', once: true } })
      gsap.from('#visita figure svg', { clipPath: 'inset(0% 0% 100% 0% round 1.25rem)', duration: 1.3, ease: 'power3.inOut', scrollTrigger: { trigger: '#visita figure', start: 'top 85%', once: true } })
      gsap.from('#visita .horario-fila', { y: 18, opacity: 0, duration: 0.7, stagger: 0.08, scrollTrigger: { trigger: '#visita dl', start: 'top 90%', once: true } })

      // el cierre
      gsap.from('.rincon-logo', { y: 40, scale: 0.94, opacity: 0, duration: 1.1, scrollTrigger: { trigger: '.rincon', start: 'top 80%', once: true } })
      gsap.from('.rincon-frase', { y: 20, opacity: 0, duration: 0.8, delay: 0.2, scrollTrigger: { trigger: '.rincon', start: 'top 80%', once: true } })
    })

    return () => {
      ctx.revert()
      document.querySelector('#visita')?.classList.remove('visita-mancha', 'abierta')
      for (const s of splits) s.revert()
    }
  }, [])
  return null
}
