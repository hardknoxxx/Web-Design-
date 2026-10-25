import { useEffect } from 'react'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { gsap, reducido, SplitText } from './animar'

gsap.registerPlugin(DrawSVGPlugin)

/*
 * Coreografía de la página con GSAP + ScrollTrigger. Cada sección entra a su manera (nada de un mismo fundido
 * para todo), una sola vez, cuando su borde superior llega al 80–88 % de la pantalla:
 * - la mesa: el mandala del mantel se dibuja trazo a trazo, como un mantel para colorear;
 * - la vitrina: el título sube por líneas y el mazo de fotos cae sobre la mesa y se acomoda;
 * - la carta: el título sube, las pestañas llegan en fila y cada lámina se asienta;
 * - visitanos: el mapa se abre como una persiana y el horario aparece renglón por renglón;
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

      // visitanos entra desde la derecha: la sección se abre como una puerta corrediza y las franjas de color
      // pasan por delante y se van hacia la izquierda (referencia henrietta)
      const entra = { trigger: '#visita', start: 'top bottom', end: 'top 20%', scrub: true }
      gsap.fromTo('#visita', { clipPath: 'inset(0% 0% 0% 100% round 2rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 0rem)', ease: 'none', scrollTrigger: entra })
      gsap.fromTo('.visita-franjas span', { scaleX: 1 }, { scaleX: 0, transformOrigin: '0% 50%', stagger: 0.12, ease: 'none', scrollTrigger: entra })

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
