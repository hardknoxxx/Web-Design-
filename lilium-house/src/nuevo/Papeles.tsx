import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap, reducido } from './animar'

/*
 * Papeles de la casa (referencia LATTE y el mantel para colorear de Lilium):
 * - Estampilla: cartelito con el borde dentado de un sello postal; al entrar cae y "se sella" con un golpe.
 * - CartelDePapel: un aviso en papel real (foto de una hoja arrugada y vuelta a estirar) que llega hecho un bollo
 *   y se abre al entrar en pantalla: el recorte irregular se despliega, gira y queda plano con los pliegues.
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
