import { useRef, type ReactNode } from 'react'
import { gsap, MOTION_OK, useGsap } from '../lib/gsap'
import { Monstera } from './Botanica'
import { BananaLeaf, Calathea, Fern, HeartLeaf } from './Flora'

/*
 * Hojas que asoman en el paso de una escena a la siguiente: entran desde el borde de la
 * pantalla (el tallo nace afuera), cada combinación distinta y nunca en espejo. Se mueven
 * con un paralaje suave mientras la sección nueva sube.
 */

type Hoja = { el: ReactNode; box: string; drift: number }

const VARIANTES: Record<'carta' | 'mantel' | 'selva' | 'opiniones' | 'noche', Hoja[]> = {
  carta: [
    { el: <Monstera color="#415521" stem={60} className="w-full" />, box: '-left-10 -top-10 w-36 rotate-[62deg] sm:w-48', drift: 26 },
    { el: <HeartLeaf color="#2F4A22" stem={60} className="w-full" />, box: '-right-6 top-2 w-20 -rotate-[74deg] sm:w-28', drift: -18 },
  ],
  mantel: [
    { el: <Fern color="#6F7F2E" stem={50} className="w-full" />, box: '-left-6 -top-6 w-24 rotate-[78deg] sm:w-32', drift: 20 },
    { el: <Calathea color="#2F4A22" stem={50} className="w-full" />, box: '-right-5 -top-12 w-16 -rotate-[58deg] sm:w-24', drift: -26 },
  ],
  selva: [
    { el: <BananaLeaf color="#5E7A2A" stem={60} className="w-full" />, box: '-left-8 -top-16 w-24 rotate-[66deg] sm:w-32', drift: 30 },
    { el: <HeartLeaf color="#415521" stem={60} className="w-full" />, box: '-right-6 -top-4 w-24 -rotate-[80deg] sm:w-32', drift: -16 },
    { el: <Fern color="#97AD3D" stem={50} className="w-full" />, box: 'right-[18%] -top-10 w-14 -rotate-[14deg] sm:w-20', drift: -10 },
  ],
  opiniones: [{ el: <HeartLeaf color="#2F4A22" stem={60} className="w-full" />, box: '-right-6 -top-8 w-24 -rotate-[70deg] sm:w-32', drift: -22 }],
  noche: [{ el: <Fern color="#415521" stem={50} className="w-full" />, box: '-left-6 -top-10 w-24 rotate-[72deg] sm:w-32', drift: 24 }],
}

export function HojasTransicion({ v }: { v: keyof typeof VARIANTES }) {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(ref, () => {
    const q = gsap.utils.selector(ref)
    gsap.matchMedia().add(MOTION_OK, () => {
      q('[data-hoja]').forEach((el, i) => {
        const d = VARIANTES[v][i].drift
        gsap.fromTo(
          el,
          { y: Math.abs(d), rotation: d * 0.25 },
          { y: -Math.abs(d) * 0.5, rotation: -d * 0.15, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'top top', scrub: 1.2 } },
        )
      })
    })
  })
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[8] h-0">
      {VARIANTES[v].map((h, i) => (
        <div key={i} data-hoja="" className={`absolute origin-bottom ${h.box}`}>
          {h.el}
        </div>
      ))}
    </div>
  )
}
