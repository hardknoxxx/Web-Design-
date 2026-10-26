import { useEffect, useRef, useState } from 'react'
import { animate, motion, MotionConfig, useMotionValue, useTransform, type PanInfo } from 'motion/react'
import { ArrowIcon } from '../components/Icons'
import { SITE } from '../data/site'
import { MOTION_REDUCIDO } from './animar'
import { gsap } from './animar'
import { Estampilla } from './Papeles'
import { Cinta, ondulado, Sticker } from './Piezas'
import { TextLoop } from './primitivas/TextLoop'
import { Tilt } from './primitivas/Tilt'

/*
 * La vitrina: las fotos reales del local (de su sitio oficial y de su Instagram) como un mazo de fotos impresas sobre la mesa
 * (referencia: las láminas de Madie). La de arriba se arrastra hacia un costado y pasa al fondo del mazo; tocarla
 * la da vuelta y en el dorso está anotado qué es. Con mouse, la foto de arriba se inclina siguiendo el cursor.
 * Botones para lo mismo (teclado y lectores de pantalla).
 */

// `src` sin el ancho: las del sitio oficial y las del Instagram del local (@lilium.coffee), en 480 y 800 px
const FOTOS = [
  { src: '/fotos/oficial/cheesecake-frutos-rojos', alt: 'Porción de cheesecake con frutos rojos', nota: 'cheesecake de frutos rojos' },
  { src: '/fotos/instagram/budin-lima', alt: 'Budín con corona de crema y ralladura de lima', nota: 'budín con lima' },
  { src: '/fotos/oficial/torta-de-la-vitrina', alt: 'Porción de torta de capas con dulce de leche, chocolate y coco', nota: 'la torta de capas' },
  { src: '/fotos/instagram/croissant-frutillas', alt: 'Croissant abierto relleno de crema pastelera y frutillas, con azúcar impalpable', nota: 'croissant con frutillas' },
  { src: '/fotos/oficial/pizzeta', alt: 'Pizzeta con jamón crudo, morrones y aceitunas sobre una tabla de madera', nota: 'pizzeta para la tarde' },
  { src: '/fotos/instagram/brownies-frutos-rojos', alt: 'Brownies con dulce de leche y frutos rojos junto a un bocado con coco', nota: 'brownies con frutos rojos' },
  { src: '/fotos/instagram/cheesecake-maracuya', alt: 'Porción de cheesecake con pulpa de maracuyá sobre base de chocolate', nota: 'cheesecake de maracuyá' },
  { src: '/fotos/instagram/sandwich-crudo', alt: 'Sándwich de jamón crudo y queso en pan integral, junto a una cerveza', nota: 'sándwich de crudo' },
  { src: '/fotos/instagram/tortas-oreo', alt: 'Tres porciones de torta Oreo servidas en una bandeja de madera', nota: 'torta Oreo' },
]

// cómo queda cada foto según su lugar en el mazo: la de arriba derecha, dos asomando torcidas y el resto escondido
// debajo de la tercera (sin opacidad, para que las sombras no se sumen)
const LUGAR = [
  { rotate: -2, x: '0%', y: '0%', scale: 1, opacity: 1 },
  { rotate: 5, x: '6%', y: '2.5%', scale: 0.96, opacity: 1 },
  { rotate: -7, x: '-7%', y: '4.5%', scale: 0.92, opacity: 1 },
]
const ESCONDIDA = { ...LUGAR[2], opacity: 0 }

const muelle = { type: 'spring', stiffness: 440, damping: 34 } as const

function Foto({
  f,
  lugar,
  vuelta,
  onVuelta,
  onPasar,
}: {
  f: (typeof FOTOS)[number]
  lugar: number
  vuelta: boolean
  onVuelta: () => void
  onPasar: (dir: 1 | -1) => void
}) {
  const arriba = lugar === 0
  const x = useMotionValue(0)
  // mientras se arrastra, la foto se tuerce hacia donde va, como al deslizarla con la mano
  const giro = useTransform(x, [-260, 260], [-14, 14])

  const soltar = (_: unknown, info: PanInfo) => {
    const lejos = Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 450
    if (!lejos) {
      animate(x, 0, muelle)
      return
    }
    const dir = Math.sign(info.offset.x || info.velocity.x)
    // sale volando hacia ese lado, pasa al fondo y vuelve a deslizarse por debajo del mazo
    animate(x, dir * 420, { duration: 0.18, ease: [0.23, 1, 0.32, 1] }).then(() => {
      onPasar(1)
      animate(x, 0, { ...muelle, delay: 0.02 })
    })
  }

  const cuerpo = (
    <motion.div
      className="mazo-carta"
      style={{ x, rotate: giro }}
      drag={arriba ? 'x' : false}
      dragMomentum={false}
      onDragEnd={soltar}
      onTap={() => arriba && onVuelta()}
      // el gesto es para el dedo y el mouse; con teclado se usan los botones de abajo (si no, cada foto del mazo
      // sería una parada del Tab). Las de abajo quedan fuera del árbol de accesibilidad.
      tabIndex={-1}
      aria-hidden={!arriba || undefined}
    >
      <motion.div className="mazo-caras" animate={{ rotateY: vuelta ? 180 : 0 }} transition={{ type: 'spring', stiffness: 320, damping: 28 }}>
        <figure className="mazo-frente">
          <img
            src={`${f.src}-800.webp`}
            srcSet={`${f.src}-480.webp 480w, ${f.src}-800.webp 800w`}
            sizes="(min-width: 768px) 26rem, 80vw"
            alt={f.alt}
            width={800}
            height={1000}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <figcaption>{f.nota}</figcaption>
        </figure>
        <div className="mazo-dorso" aria-hidden={!vuelta}>
          <p className="mazo-dorso-titulo">{f.nota}</p>
          <p className="mazo-dorso-texto">{f.alt}.</p>
          <p className="mazo-dorso-pie">De la vitrina de Lilium · cambia cada día</p>
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <motion.div className="mazo-lugar" style={{ zIndex: 10 - lugar }} initial={false} animate={LUGAR[lugar] ?? ESCONDIDA} transition={muelle}>
      {arriba ? (
        <Tilt className="h-full w-full" grados={8}>
          {cuerpo}
        </Tilt>
      ) : (
        cuerpo
      )}
    </motion.div>
  )
}

// la mancha de fondo cambia de forma y de color con cada foto, como los recortes de LATTE sobre fondos ondulados
const MANCHAS = [
  { d: ondulado(10, 0.07), color: '#64BCB0' },
  { d: ondulado(7, 0.1, 98, 90), color: '#E6D7BC' },
  { d: ondulado(13, 0.05, 92, 98), color: '#C7D87E' },
]

function Mazo() {
  const manchaRef = useRef<SVGPathElement>(null)
  const [orden, setOrden] = useState(() => FOTOS.map((_, i) => i))
  const [vuelta, setVuelta] = useState(false)
  const pasar = (dir: 1 | -1) => {
    setVuelta(false)
    setOrden((o) => (dir === 1 ? [...o.slice(1), o[0]] : [o[o.length - 1], ...o.slice(0, -1)]))
  }
  const arriba = FOTOS[orden[0]]
  const primera = useRef(true)
  useEffect(() => {
    const m = MANCHAS[orden[0] % MANCHAS.length]
    if (primera.current) {
      primera.current = false
      return
    }
    gsap.to(manchaRef.current, { morphSVG: m.d, fill: m.color, duration: 0.7, ease: 'expo.out' })
  }, [orden])
  return (
    <MotionConfig reducedMotion={MOTION_REDUCIDO}>
      <div className="mazo">
        <svg viewBox="-100 -100 200 200" className="mazo-mancha" aria-hidden="true">
          <path ref={manchaRef} d={MANCHAS[0].d} fill={MANCHAS[0].color} />
        </svg>
        <div className="mazo-pila">
          {FOTOS.map((f, i) => (
            <Foto key={f.src} f={f} lugar={orden.indexOf(i)} vuelta={orden[0] === i && vuelta} onVuelta={() => setVuelta((v) => !v)} onPasar={pasar} />
          ))}
          <Estampilla className="mazo-estampilla" color="#C7D87E" giro={8}>
            <span className="estampilla-lugar">Hecho en casa</span>
            <span className="estampilla-pie">Delicias caseras</span>
          </Estampilla>
          <Sticker className="mazo-sticker" giro={-10} color="var(--color-kraft)">
            tan rico que
            <br />
            vas a volver
          </Sticker>
        </div>
        <div className="mazo-controles" data-sin-flotante="">
          <button type="button" className="flecha" aria-label="Foto anterior" onClick={() => pasar(-1)}>
            <ArrowIcon className="h-5 w-5 rotate-180" />
          </button>
          <button type="button" className="pildora pildora-borde" aria-pressed={vuelta} onClick={() => setVuelta((v) => !v)}>
            {vuelta ? 'Ver la foto' : 'Dar vuelta'}
          </button>
          <button type="button" className="flecha" aria-label="Foto siguiente" onClick={() => pasar(1)}>
            <ArrowIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mazo-pista" aria-hidden="true">
          deslizá la foto o tocala para darla vuelta
        </p>
        <p className="sr-only" aria-live="polite">
          {vuelta ? `Dorso: ${arriba.alt}` : arriba.alt}
        </p>
      </div>
    </MotionConfig>
  )
}

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
          <p className="mt-5 font-hand text-[1.7rem] leading-tight text-turquesa-dark">
            Hoy en la vitrina:{' '}
            <TextLoop className="text-laguna-deep">
              <span>tortas</span>
              <span>budines</span>
              <span>tentaciones</span>
            </TextLoop>
          </p>
          <p className="mt-3 max-w-[34ch] font-elegante text-lg text-madera-soft">
            Tortas, budines y delicias caseras que cambian cada día. Lo que sale de la vitrina lo contamos en Instagram.
          </p>
          <a href={SITE.instagramHref} target="_blank" rel="noopener" className="pildora pildora-lima mt-7">
            Ver la vitrina de hoy
            <ArrowIcon className="h-4 w-4" />
          </a>
        </div>
        <Mazo />
      </div>
    </section>
  )
}
