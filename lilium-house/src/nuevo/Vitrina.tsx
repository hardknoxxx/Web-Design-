import { ArrowIcon } from '../components/Icons'
import { SITE } from '../data/site'
import { Cinta, Mancha, Sticker } from './Piezas'

/*
 * La vitrina: las fotos reales del local (de su sitio oficial) como láminas pegadas sobre manchas onduladas,
 * con su nombre a mano. Composición asimétrica: una foto grande y dos más chicas que se escalonan.
 */

const FOTOS = [
  { src: 'cheesecake-frutos-rojos', alt: 'Porción de cheesecake con frutos rojos', nota: 'cheesecake de frutos rojos', mancha: 'var(--color-menta)', giro: -3 },
  { src: 'torta-de-la-vitrina', alt: 'Porción de torta de capas con dulce de leche, chocolate y coco', nota: 'la torta de capas', mancha: 'var(--color-kraft)', giro: 4 },
  { src: 'pizzeta', alt: 'Pizzeta con jamón crudo, morrones y aceitunas sobre una tabla de madera', nota: 'pizzeta para la tarde', mancha: 'var(--lima-suave)', giro: -5 },
]

export function Vitrina() {
  return (
    <section id="vitrina" aria-labelledby="vitrina-titulo" className="vitrina">
      {/* la cinta cose la mesa con la vitrina: cruza el borde entre las dos secciones */}
      <Cinta className="vitrina-cinta" items={['Café de especialidad', 'Delicias caseras', 'Recién hecho', 'Puerto Iguazú']} />
      <div className="vitrina-grilla">
        <div className="vitrina-texto">
          <h2 id="vitrina-titulo" className="titulo-vitrina text-[3.4rem] leading-[0.88] text-laguna-deep md:text-[6.5rem]">
            Elegí tu <span className="block">favorito</span>
          </h2>
          <p className="mt-5 max-w-[34ch] font-elegante text-lg text-madera-soft">
            Tortas, budines y delicias caseras que cambian cada día. Lo que sale de la vitrina lo contamos en Instagram.
          </p>
          <a href={SITE.instagramHref} target="_blank" rel="noopener" className="pildora pildora-lima mt-7">
            Ver la vitrina de hoy
            <ArrowIcon className="h-4 w-4" />
          </a>
        </div>

        {FOTOS.map((f, i) => (
          <figure key={f.src} className={`lamina-foto-vitrina lamina-${i}`}>
            <Mancha className="lamina-mancha" color={f.mancha} ondas={i === 0 ? 10 : 8} />
            <img
              src={`/fotos/oficial/${f.src}-800.webp`}
              srcSet={`/fotos/oficial/${f.src}-480.webp 480w, /fotos/oficial/${f.src}-800.webp 800w`}
              sizes={i === 0 ? '(min-width: 768px) 32vw, 78vw' : '(min-width: 768px) 22vw, 56vw'}
              alt={f.alt}
              width={800}
              height={1000}
              loading="lazy"
              decoding="async"
              style={{ rotate: `${f.giro}deg` }}
            />
            <figcaption className="lamina-nota">{f.nota}</figcaption>
            {i === 0 && (
              <Sticker className="lamina-sticker" giro={-10} color="var(--color-kraft)">
                tan rico que
                <br />
                vas a volver
              </Sticker>
            )}
          </figure>
        ))}
      </div>
    </section>
  )
}
