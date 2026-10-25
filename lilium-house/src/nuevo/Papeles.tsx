import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap, reducido } from './animar'

/*
 * Papeles de la casa (referencia LATTE y el mantel para colorear de Lilium):
 * - Estampilla: cartelito con el borde dentado de un sello postal; al entrar cae y "se sella" con un golpe.
 * - CartelDePapel: un aviso en papel real (foto de una hoja arrugada y vuelta a estirar) que llega hecho un bollo
 *   y se abre al entrar en pantalla: el recorte irregular se despliega, gira y queda plano con los pliegues.
 * - HojaParaPintar: la hoja del mantel con el lirio para colorear y dos lápices; el color se va rellenando con
 *   trazos de lápiz mientras pasa el scroll.
 */

export function Estampilla({ children, className = '', color, giro = -6 }: { children: ReactNode; className?: string; color: string; giro?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reducido()) return
    const el = ref.current!
    const t = gsap.fromTo(
      el,
      { scale: 1.6, opacity: 0, rotate: giro - 18 },
      {
        keyframes: [
          { scale: 0.94, opacity: 1, rotate: giro, duration: 0.35, ease: 'power3.in' },
          { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.5)' },
        ],
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    )
    return () => {
      t.scrollTrigger?.kill()
      t.kill()
    }
  }, [giro])
  return (
    <div ref={ref} className={`estampilla ${className}`} style={{ '--estampilla': color, rotate: `${giro}deg` } as CSSProperties}>
      <div className="estampilla-interior">{children}</div>
    </div>
  )
}

// recortes del bollo de papel: los mismos 12 vértices van de un bollo chico e irregular a la hoja abierta
const BOLLO = 'polygon(42% 38%, 50% 33%, 58% 37%, 63% 44%, 66% 52%, 61% 60%, 55% 66%, 47% 64%, 39% 62%, 35% 55%, 34% 47%, 37% 41%)'
const MEDIO = 'polygon(18% 14%, 52% 6%, 84% 12%, 94% 34%, 90% 58%, 95% 82%, 70% 94%, 40% 90%, 10% 94%, 4% 70%, 8% 44%, 3% 22%)'
const ABIERTO = 'polygon(0% 0%, 50% 0%, 100% 0%, 100% 25%, 100% 50%, 100% 75%, 100% 100%, 50% 100%, 0% 100%, 0% 75%, 0% 50%, 0% 25%)'

export function CartelDePapel({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reducido()) return
    const el = ref.current!
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 82%', once: true } })
      tl.fromTo(el, { clipPath: BOLLO, scale: 0.55, rotate: -24, rotateY: 50 }, { clipPath: MEDIO, scale: 0.85, rotate: 6, rotateY: -18, duration: 0.45, ease: 'power2.out' })
        .to(el, { clipPath: ABIERTO, scale: 1, rotate: -1.5, rotateY: 0, duration: 0.65, ease: 'back.out(1.4)' })
        // los pliegues se aflojan pero no desaparecen: es papel que estuvo arrugado
        .fromTo(el.querySelector('.cartel-pliegues'), { opacity: 1 }, { opacity: 0.55, duration: 0.8 }, 0.2)
        .fromTo(el.querySelector('.cartel-contenido'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, 0.75)
    })
    return () => ctx.revert()
  }, [])
  return (
    <div ref={ref} className={`cartel ${className}`}>
      <span className="cartel-pliegues" aria-hidden="true" />
      <div className="cartel-contenido">{children}</div>
    </div>
  )
}

/** La hoja del mantel para colorear: el lirio de la casa en línea, con dos lápices de colores al lado. */
export function HojaParaPintar({ className = '' }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    if (reducido()) return
    const el = ref.current!
    // el color se pinta de abajo hacia arriba mientras la hoja cruza la pantalla
    const t = gsap.fromTo(el.querySelector('.hoja-color-recorte rect'), { attr: { y: 300 } }, { attr: { y: 20 }, ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'bottom 35%', scrub: true } })
    const lapiz = gsap.to(el.querySelectorAll('.hoja-lapiz'), { rotate: '+=4', y: -3, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.4 })
    return () => {
      t.scrollTrigger?.kill()
      t.kill()
      lapiz.kill()
    }
  }, [])
  const petalo = 'M0 0C-16-26-14-62 0-86C14-62 16-26 0 0Z'
  return (
    <svg ref={ref} viewBox="0 0 260 300" className={className} aria-hidden="true" overflow="visible">
      <defs>
        <pattern id="hoja-rayado" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <rect width="7" height="7" fill="#64BCB0" fillOpacity="0.35" />
          <rect width="4" height="7" fill="#64BCB0" />
        </pattern>
        <pattern id="hoja-rayado-2" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
          <rect width="7" height="7" fill="#F2B6A0" fillOpacity="0.35" />
          <rect width="4" height="7" fill="#F2B6A0" />
        </pattern>
        <clipPath id="hoja-color-recorte" className="hoja-color-recorte">
          <rect x="0" y="20" width="260" height="300" />
        </clipPath>
      </defs>
      {/* la hoja, apenas torcida, con su sombra */}
      <g transform="rotate(5 130 150)">
        <rect x="24" y="14" width="200" height="260" rx="6" fill="#1C4A45" opacity="0.12" transform="translate(6 8)" />
        <rect x="24" y="14" width="200" height="260" rx="6" fill="#FFFDF8" />
        <g transform="translate(124 150)">
          <g clipPath="url(#hoja-color-recorte)" transform="translate(-124 -150)">
            <g transform="translate(124 150)">
              {[0, 72, 144, 216, 288].map((a, i) => (
                <path key={a} d={petalo} transform={`rotate(${a})`} fill={i % 2 ? 'url(#hoja-rayado-2)' : 'url(#hoja-rayado)'} />
              ))}
            </g>
          </g>
          {[0, 72, 144, 216, 288].map((a) => (
            <path key={a} d={petalo} transform={`rotate(${a})`} fill="none" stroke="#3D2314" strokeWidth="2" strokeLinejoin="round" />
          ))}
          <circle r="10" fill="#FFFDF8" stroke="#3D2314" strokeWidth="2" />
          <path d="M-60 100C-30 80 30 80 60 100" fill="none" stroke="#3D2314" strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="round" />
        </g>
      </g>
      {/* dos lápices de color apoyados sobre la hoja */}
      {[
        { x: 170, y: 210, r: -38, c: '#64BCB0' },
        { x: 190, y: 236, r: -24, c: '#F2B6A0' },
      ].map((l) => (
        <g key={l.c} className="hoja-lapiz" transform={`translate(${l.x} ${l.y}) rotate(${l.r})`} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <rect x="-60" y="-7" width="96" height="14" rx="2" fill={l.c} stroke="#3D2314" strokeWidth="1.6" />
          <rect x="-66" y="-7" width="8" height="14" rx="2" fill="#E6D7BC" stroke="#3D2314" strokeWidth="1.6" />
          <path d="M36-7L58 0L36 7Z" fill="#E6D7BC" stroke="#3D2314" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M50-2.5L58 0L50 2.5Z" fill={l.c} />
        </g>
      ))}
    </svg>
  )
}
