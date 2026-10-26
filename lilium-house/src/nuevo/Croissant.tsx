import { useEffect, useRef } from 'react'
import { gsap, reducido } from './animar'
import { Cinta, ondulado } from './Piezas'

/*
 * El croissant de la casa (referencia LATTE, "Hecho con cariño"): la foto real del Instagram del local recortada,
 * grande, sobre una mancha ondulada. Al pasar con el scroll el croissant gira y crece hacia la pantalla mientras la
 * mancha gira al revés, y una cinta lima lo cruza por detrás. Solo transform: va atado al scroll (scrub).
 */
export function Croissant() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reducido()) return
    const el = ref.current!
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      gsap.fromTo('.croissant-foto', { rotate: -18, scale: 0.86, yPercent: 12 }, { rotate: 10, scale: 1.04, yPercent: -8, ease: 'none', scrollTrigger: st })
      gsap.fromTo('.croissant-mancha', { rotate: 25, scale: 0.9 }, { rotate: -30, scale: 1.04, ease: 'none', scrollTrigger: st })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <div ref={ref} className="croissant" aria-hidden="true">
      <svg viewBox="-100 -100 200 200" className="croissant-mancha">
        <path d={ondulado(9, 0.07, 96, 90)} fill="#F2B6A0" />
      </svg>
      <Cinta className="croissant-cinta" items={['Recién hecho', 'Café y croissant', 'Para el desayuno']} inversa />
      <img
        className="croissant-foto"
        src="/carta/real/croissant-520.webp"
        srcSet="/carta/real/croissant-520.webp 520w, /carta/real/croissant-900.webp 900w"
        sizes="(min-width: 768px) 28rem, 50vw"
        alt=""
        width={900}
        height={543}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </div>
  )
}
