import { useEffect, useRef } from 'react'
import { SITE } from '../data/site'
import { gsap, reducido, ScrollTrigger, SplitText } from './animar'

/*
 * El manifiesto (referencias: nickho-motorsports y LATTE): una sola frase de cómo es el local, con figuritas
 * metidas entre las palabras. Con el scroll las palabras se van encendiendo una por una y las figuritas
 * se pegan en su lugar. Al costado, el sello de Google gira y acelera con la velocidad del scroll.
 */

function Figurita({ tipo, color }: { tipo: 'hoja' | 'lirio' | 'lapiz'; color: string }) {
  return (
    <span className="figurita" style={{ background: color }} aria-hidden="true">
      <svg viewBox="0 0 40 40" className="h-full w-full">
        {tipo === 'hoja' && (
          <g fill="none" stroke="#1C4A45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 29C11 17 19 10 30 10C30 22 23 29 11 29Z" fill="#97AD3D" />
            <path d="M11 29L24 16" />
          </g>
        )}
        {tipo === 'lirio' && (
          <g stroke="#1C4A45" strokeWidth="2" strokeLinejoin="round">
            {[0, 72, 144, 216, 288].map((a) => (
              <path key={a} d="M20 20C17 15 17 9 20 5C23 9 23 15 20 20Z" fill="#FFFDF8" transform={`rotate(${a} 20 20)`} />
            ))}
            <circle cx="20" cy="20" r="2.6" fill="#64BCB0" />
          </g>
        )}
        {tipo === 'lapiz' && (
          <g stroke="#1C4A45" strokeWidth="2.2" strokeLinejoin="round" transform="rotate(-35 20 20)">
            <rect x="16" y="6" width="8" height="22" fill="#F2B6A0" />
            <path d="M16 28L20 35L24 28Z" fill="#E6D7BC" />
            <path d="M19 32.2L20 35L21 32.2Z" fill="#1C4A45" />
          </g>
        )}
      </svg>
    </span>
  )
}

function Sello() {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    if (reducido()) return
    const el = ref.current!
    let giro = 0
    let extra = 0
    const st = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: (s) => (extra = Math.min(Math.abs(s.getVelocity()) / 300, 8)) })
    // gira despacio siempre; el scroll le da envión y el envión se apaga solo
    const tick = (_: number, dt: number) => {
      extra *= 0.94
      giro = (giro + (0.25 + extra) * (dt / 16.7)) % 360
      el.style.rotate = `${giro.toFixed(2)}deg`
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      st.kill()
    }
  }, [])
  const texto = `${String(SITE.rating.score).replace('.', ',')} ★ en Google · ${SITE.rating.count} opiniones · `
  return (
    <div className="sello" role="img" aria-label={`${String(SITE.rating.score).replace('.', ',')} estrellas en Google, ${SITE.rating.count} opiniones`}>
      <svg ref={ref} viewBox="0 0 200 200" className="sello-texto" aria-hidden="true">
        <defs>
          <path id="sello-circulo" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0" />
        </defs>
        <text>
          <textPath href="#sello-circulo" textLength="462">
            {texto + texto}
          </textPath>
        </text>
      </svg>
      <span className="sello-centro" aria-hidden="true">
        {String(SITE.rating.score).replace('.', ',')}
      </span>
    </div>
  )
}

export function Manifiesto() {
  const fraseRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (reducido()) return
    const el = fraseRef.current!
    const split = SplitText.create(el.querySelectorAll('.mf-texto'), { type: 'words' })
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true }
      gsap.fromTo(split.words, { opacity: 0.16 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: st })
      gsap.fromTo(el.querySelectorAll('.figurita'), { scale: 0.6, rotate: -25 }, { scale: 1, rotate: (i) => [-8, 10, -12][i] ?? 0, stagger: 0.3, ease: 'none', scrollTrigger: st })
    })
    return () => {
      ctx.revert()
      split.revert()
    }
  }, [])

  return (
    <section className="manifiesto" aria-labelledby="manifiesto-titulo">
      <h2 id="manifiesto-titulo" className="sr-only">
        Cómo es Lilium
      </h2>
      <div className="manifiesto-grilla">
        <p ref={fraseRef} className="manifiesto-frase">
          <span className="mf-texto">Un café de especialidad verde por dentro: plantas</span> <Figurita tipo="hoja" color="#C7D87E" />{' '}
          <span className="mf-texto">en cada rincón, flores frescas</span> <Figurita tipo="lirio" color="#64BCB0" />
          <span className="mf-texto">, madera y manteles para colorear con lápices</span> <Figurita tipo="lapiz" color="#E6D7BC" />{' '}
          <span className="mf-texto">en cada mesa.</span>
        </p>
        <Sello />
      </div>
    </section>
  )
}
