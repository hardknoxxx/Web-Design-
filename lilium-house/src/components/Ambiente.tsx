import { useRef } from 'react'
import { gsap, MOTION_OK, pauseOffscreen, useGsap } from '../lib/gsap'
import { Leaf } from './Botanica'
import { Fern, HangingPothos, HeartLeaf, Hummingbird, LeafShadow } from './Flora'
import { CeiboRama } from './Paisaje'
import { Coati, HorneroNido } from './Fauna'

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
      pauseOffscreen(section, [
        gsap.to(q('[data-pothos]'), { rotation: 2.4, duration: 4.6, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 0%' }),
      ])
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
    </div>
  )
}

/** Mantel: un picaflor llega volando a una rama de ceibo y se queda libando, suspendido. */
export function Picaflor({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(ref, () => {
    const q = gsap.utils.selector(ref)
    const bird = q('[data-picaflor]')[0]
    gsap.matchMedia().add(MOTION_OK, () => {
      // aleteo: las alas se vuelven un borrón que va y viene
      const wings = gsap.to(q('[data-wing]'), { scaleY: 0.35, skewX: -8, duration: 0.06, ease: 'none', yoyo: true, repeat: -1, transformOrigin: '50% 100%', stagger: 0.03 })
      const hover = gsap.to(bird, { y: -6, x: 3, rotation: -3, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true })
      gsap.fromTo(
        bird,
        { x: '55vw', y: -160, rotation: -18, autoAlpha: 0 },
        {
          x: 0,
          y: 0,
          rotation: 0,
          autoAlpha: 1,
          duration: 1.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: ref.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          onComplete: () => void hover.play(),
          onReverseComplete: () => void hover.pause(),
        },
      )
      const ceibo = gsap.to(q('[data-ceibo]'), { rotation: 2, duration: 4.2, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '0% 80%' })
      pauseOffscreen(ref.current, [wings, ceibo])
    })
  })
  return (
    <div ref={ref} className={`pointer-events-none absolute z-10 h-36 w-72 sm:h-44 sm:w-96 ${className}`} aria-hidden="true">
      <div data-ceibo="" className="absolute bottom-0 left-0 w-[78%]">
        <CeiboRama className="w-full" />
      </div>
      <div data-picaflor="" className="absolute top-[20%] left-[60%] w-24 sm:w-28">
        <Hummingbird className="w-full -scale-x-100" />
      </div>
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

/** Opiniones: el hornero en su rama, junto al horno de barro; cabecea y de vez en cuando salta. */
export function Hornero({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(ref, () => {
    const q = gsap.utils.selector(ref)
    gsap.from(ref.current, { xPercent: 30, autoAlpha: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 90%', toggleActions: 'play none none reverse' } })
    gsap.matchMedia().add(MOTION_OK, () => {
      pauseOffscreen(ref.current, [
        gsap.to(q('[data-head]'), { rotation: -12, duration: 0.18, ease: 'power1.inOut', yoyo: true, repeat: -1, repeatDelay: 1.6, transformOrigin: '30% 90%' }),
        gsap
          .timeline({ repeat: -1, repeatDelay: 3.4, delay: 1 })
          .to(q('[data-bird]'), { y: -7, duration: 0.16, ease: 'power2.out' })
          .to(q('[data-bird]'), { y: 0, duration: 0.2, ease: 'bounce.out' }),
      ])
    })
  })
  return (
    <div ref={ref} className={`pointer-events-none absolute z-[1] ${className}`} aria-hidden="true">
      <HorneroNido className="w-full -scale-x-100" />
    </div>
  )
}

/** Selva: un coatí cruza al ritmo del scroll; las patas se mueven con el paso. */
export function CoatiPaseo({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(ref, () => {
    const q = gsap.utils.selector(ref)
    const a = q('[data-leg="a"]')
    const b = q('[data-leg="b"]')
    gsap.set([...a, ...b], { transformOrigin: '50% 0%' })
    gsap.fromTo(
      ref.current,
      { x: '-45vw' },
      {
        x: '115vw',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionOf(ref.current),
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: (self) => {
            const r = Math.sin(self.progress * 120) * 22
            gsap.set(a, { rotation: r })
            gsap.set(b, { rotation: -r })
          },
        },
      },
    )
  })
  return (
    <div ref={ref} className={`pointer-events-none absolute left-0 ${className}`} aria-hidden="true">
      <Coati className="w-full" />
    </div>
  )
}
