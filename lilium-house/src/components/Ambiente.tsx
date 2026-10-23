import { useRef } from 'react'
import { gsap, MOTION_OK, useGsap } from '../lib/gsap'
import { Leaf } from './Botanica'
import { Fern, HangingPothos, HeartLeaf, Hummingbird, LeafShadow, PottedPlant } from './Flora'

/*
 * Capas de ambiente: vida de fondo (sombras de follaje, plantas, fauna) siempre detrás del
 * contenido, con poca opacidad y movimiento solo decorativo (nunca sobre el texto).
 */

const sectionOf = (el: Element | null) => (el?.closest('section') ?? el) as Element

/** Ritual: sombras de hojas, potus colgante que crece y una maceta de mostrador. */
export function RitualDecor() {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(ref, () => {
    const q = gsap.utils.selector(ref)
    const section = sectionOf(ref.current)
    const leaves = q('[data-pothos] [data-leaf]')
    gsap.set(leaves, { scale: 0, transformOrigin: '50% 100%' })
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: section, start: 'top 80%', end: '35% top', scrub: 1.6 } })
    const stem = q('[data-pothos] [data-stem]')[0] as unknown as SVGPathElement
    const len = stem.getTotalLength()
    tl.fromTo(stem, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1 }, 0)
    leaves.forEach((l, i) => tl.to(l, { scale: 1, duration: 0.12, ease: 'back.out(2)' }, 0.08 + i * 0.1))
    gsap.to(q('[data-shade]'), { yPercent: -14, xPercent: 4, ease: 'none', scrollTrigger: { trigger: section, scrub: 2 } })
    gsap.matchMedia().add(MOTION_OK, () => {
      gsap.to(q('[data-pothos]'), { rotation: 2.4, duration: 4.6, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 0%' })
      gsap.to(q('[data-pot] [data-sway]'), { rotation: -2, skewX: 1.5, duration: 5.3, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 100%' })
    })
  })
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div data-shade="" className="absolute -inset-[10%] opacity-[0.07]">
        <LeafShadow className="h-full w-full" />
      </div>
      <div data-pothos="" className="absolute top-0 right-[4%] h-[24svh] w-11 sm:right-[14%] sm:h-[34svh] sm:w-14 lg:h-[44svh] lg:w-20">
        <HangingPothos className="h-full w-full" />
      </div>
      <div data-pot="" className="absolute -bottom-2 -left-6 w-28 opacity-95 sm:w-36 lg:left-4 lg:w-44">
        <PottedPlant className="w-full" />
      </div>
    </div>
  )
}

/** Mantel: un picaflor entra volando, se queda suspendido y aletea. */
export function Picaflor({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(ref, () => {
    const bird = ref.current!
    const wing = bird.querySelector('[data-wing]')
    gsap.matchMedia().add(MOTION_OK, () => {
      gsap.to(wing, { rotation: -38, duration: 0.07, ease: 'none', yoyo: true, repeat: -1, transformOrigin: '100% 100%' })
      const hover = gsap.to(bird, { y: -10, x: 4, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true })
      gsap.fromTo(
        bird,
        { x: '60vw', y: -120, rotation: -14, autoAlpha: 0 },
        {
          x: 0,
          y: 0,
          rotation: 0,
          autoAlpha: 1,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionOf(bird), start: 'top 55%', toggleActions: 'play none none reverse' },
          onComplete: () => void hover.play(),
          onReverseComplete: () => void hover.pause(),
        },
      )
    })
  })
  return (
    <div ref={ref} className={`pointer-events-none absolute z-10 w-16 sm:w-20 ${className}`} aria-hidden="true">
      <Hummingbird className="w-full" />
    </div>
  )
}

/** Opiniones: tres hojas que caen al atardecer, cada una con su trayecto. */
export function HojasCayendo() {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(ref, () => {
    const q = gsap.utils.selector(ref)
    const section = sectionOf(ref.current)
    const paths = [
      { y: '120vh', x: 60, r: 220, scrub: 1.2 },
      { y: '95vh', x: -90, r: -160, scrub: 2.4 },
      { y: '140vh', x: 30, r: 300, scrub: 0.8 },
    ]
    q('[data-fall]').forEach((el, i) => {
      const p = paths[i]
      gsap.fromTo(el, { y: '-20vh', x: 0, rotation: 0 }, { y: p.y, x: p.x, rotation: p.r, ease: 'sine.inOut', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: p.scrub } })
    })
  })
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div data-fall="" className="absolute top-0 left-[12%] w-10 opacity-80">
        <HeartLeaf color="#6F7F2E" className="w-full" />
      </div>
      <div data-fall="" className="absolute top-[10%] right-[18%] w-14 opacity-70">
        <Fern color="#D9A441" className="w-full" />
      </div>
      <div data-fall="" className="absolute top-[30%] left-[55%] w-8 opacity-75">
        <Leaf color="#9A5B2E" className="w-full" />
      </div>
    </div>
  )
}
