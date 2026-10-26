import { useEffect, useRef, type CSSProperties } from 'react'

/*
 * El cierre: una página del cuaderno de campo de un naturalista, con los vecinos de la selva misionera dibujados
 * a lápiz y acuarela (referencia: láminas botánicas; taste-skill, "un grabado/lámina como motivo de la página").
 * Cada animal trae su propio apoyo dentro del dibujo (el tucán agarrado a su rama, el hornero parado sobre su
 * horno de barro, el coatí con las patas en el suelo), así nada flota ni queda mal apoyado.
 * Tucán, hornero y coatí: bocetos generados con IA (Gemini, vía Figma) y pasados a transparencia con
 * scripts/quitar_papel.py (el papel pasa a transparencia y el borde se desvanece, no queda ningún corte recto).
 * La mariposa 88 está dibujada en SVG. Pendiente: lirio con picaflor, cuando haya créditos de IA. Al entrar en pantalla cada dibujo "se dibuja" (se descubre como un trazo) y su nota
 * se escribe; después se mecen apenas. Fuera de pantalla las animaciones se pausan.
 */

const BOCETOS = [
  { id: 'tucan', ancho: 884, alto: 880, alt: 'Boceto a lápiz y acuarela de un tucán grande agarrado a una rama con musgo', nombre: 'tucán grande', cientifico: 'Ramphastos toco' },
  { id: 'hornero', ancho: 939, alto: 918, alt: 'Boceto de un hornero parado sobre su nido de barro, apoyado en una rama', nombre: 'hornero', cientifico: 'Furnarius rufus' },
  { id: 'coati', ancho: 1021, alto: 733, alt: 'Boceto de un coatí caminando entre helechos, con la cola anillada en alto', nombre: 'coatí', cientifico: 'Nasua nasua' },
] as const

const LAPIZ = '#5A4030'

// la mariposa 88, vista desde arriba: sus alas se pliegan con scaleX y vuela por un recorrido (CSS offset-path)
function Mariposa() {
  return (
    <svg viewBox="-40 -30 80 60" className="cuaderno-mariposa" aria-hidden="true">
      <g stroke={LAPIZ} strokeWidth="1" strokeLinejoin="round">
        <g className="ala ala-i">
          <path d="M-2 -2 C -14 -26 -36 -28 -36 -12 C -36 -2 -20 2 -2 0 Z" fill="#B4472B" fillOpacity="0.75" />
          <path d="M-30 -18 C -34 -12 -30 -6 -22 -6" fill="none" stroke="#1A1A1A" strokeWidth="3.5" opacity="0.8" />
          <path d="M-2 1 C -18 4 -28 14 -22 24 C -14 28 -4 16 -2 4 Z" fill="#F4EEE2" />
          <text x="-19" y="17" fontSize="9" fontFamily="Caveat, cursive" fill="#1A1A1A" stroke="none">88</text>
        </g>
        <g className="ala ala-d">
          <path d="M2 -2 C 14 -26 36 -28 36 -12 C 36 -2 20 2 2 0 Z" fill="#B4472B" fillOpacity="0.75" />
          <path d="M30 -18 C 34 -12 30 -6 22 -6" fill="none" stroke="#1A1A1A" strokeWidth="3.5" opacity="0.8" />
          <path d="M2 1 C 18 4 28 14 22 24 C 14 28 4 16 2 4 Z" fill="#F4EEE2" />
          <text x="9" y="17" fontSize="9" fontFamily="Caveat, cursive" fill="#1A1A1A" stroke="none">88</text>
        </g>
        <path d="M0 -10 C 2 -4 2 10 0 16 C -2 10 -2 -4 0 -10 Z" fill="#3D2314" />
        <path d="M0 -10 C -2 -16 -6 -20 -9 -22 M0 -10 C 2 -16 6 -20 9 -22" fill="none" />
      </g>
    </svg>
  )
}

export function Cuaderno() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    // se dibuja una sola vez al entrar; las animaciones de vaivén corren solo con la página en pantalla
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.vivo = ''
          el.dataset.visto = ''
        } else delete el.dataset.vivo
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="cuaderno" data-sin-flotante="">
      <p className="cuaderno-titulo">
        <span>Cuaderno de campo</span> vecinos de la selva misionera
      </p>
      {BOCETOS.map((b, i) => (
        <figure key={b.id} className={`cuaderno-pieza cuaderno-pieza-${b.id}`} style={{ '--i': i } as CSSProperties}>
          <div className="cuaderno-boceto">
            <img
              src={`/cuaderno/${b.id}-760.webp`}
              srcSet={`/cuaderno/${b.id}-420.webp 420w, /cuaderno/${b.id}-760.webp 760w`}
              sizes="(min-width: 768px) 26vw, 55vw"
              width={b.ancho}
              height={b.alto}
              alt={b.alt}
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>
            {b.nombre} <i>{b.cientifico}</i>
          </figcaption>
        </figure>
      ))}
      <div className="cuaderno-vuelo" aria-hidden="true">
        <Mariposa />
      </div>
    </div>
  )
}
