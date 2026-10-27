import { useEffect, useState, type CSSProperties } from 'react'
import { CARTA, SITE, whatsappLink, type CartaItem } from '../data/site'
import { motion, MotionConfig } from 'motion/react'
import { MOTION_REDUCIDO } from './animar'
import { IconoMomento } from './IconoMomento'
import { Croissant } from './Croissant'
import { CartelDePapel } from './Papeles'
import { ondulado } from './Piezas'
import { FondoAnimado } from './primitivas/FondoAnimado'
import { Magnetic } from './primitivas/Magnetic'
import { TextEffect } from './primitivas/TextEffect'

/*
 * La carta como láminas de especímenes (referencia: Madie): cada plato con su foto, nombre y nota.
 */

/*
 * Cada lámina es una foto de estudio recortada con una forma ondulada del color de su fondo, con sombra
 * (referencia LATTE). Son imágenes generadas con IA (Gemini, vía Figma) en /carta, descriptas a partir de las fotos
 * reales del local: son ILUSTRATIVAS para el prototipo y deben reemplazarse por fotos reales antes del lanzamiento.
 */
// forma ondulada distinta para cada lámina, como recortes hechos a mano
const forma = (k: number) => {
  const d = ondulado(8 + (k % 4) * 2, 0.045 + (k % 3) * 0.015, 96 - (k % 2) * 6, 92 + (k % 2) * 6)
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='-100 -100 200 200'><path d='${d}'/></svg>`)}")`
}

// la pestaña que se abre primero depende de la hora en Puerto Iguazú
function momentoPorHora() {
  const h = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', hourCycle: 'h23' }).format(new Date()),
  )
  return h >= 12 && h < 16 ? 'almuerzos' : h >= 16 ? 'meriendas' : 'desayunos'
}

function Lamina({ item, k }: { item: CartaItem; k: number }) {
  const base = `/carta/${item.kind === 'estudio' ? item.src : item.id}`
  return (
    <div className="lamina lamina-estudio" style={{ '--forma': forma(k) } as CSSProperties}>
      <img
        src={`${base}-360.webp`}
        srcSet={`${base}-360.webp 360w, ${base}-720.webp 720w`}
        sizes="(min-width: 768px) 11rem, 9rem"
        alt=""
        loading="lazy"
        decoding="async"
        width={360}
        height={360}
      />
    </div>
  )
}

export function Carta() {
  // el HTML se genera al compilar: arranca en desayunos y, ya en el navegador, abre la pestaña de la hora
  const [tab, setTab] = useState('desayunos')
  // solo se anima cuando la persona cambia de pestaña (no en el HTML generado ni al abrir la de la hora)
  const [cambio, setCambio] = useState(false)
  useEffect(() => setTab(momentoPorHora()), [])
  const elegir = (id: string) => {
    if (id === tab) return
    setCambio(true)
    setTab(id)
  }
  const momento = CARTA.find((c) => c.id === tab)!

  return (
    <section id="carta" aria-labelledby="carta-titulo" className="relative overflow-hidden bg-crema px-4 pt-20 pb-24 md:px-7 md:pt-28 md:pb-32">
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="flex items-start gap-3">
          <h2 id="carta-titulo" className="titulo-vitrina text-[3.4rem] leading-[0.88] text-laguna-deep md:text-[6.5rem]">
            La carta
          </h2>
        </div>
        <p className="mt-4 max-w-[46ch] font-elegante text-lg text-madera-soft">
          Desayunos, almuerzos y meriendas. Lo que sale de la vitrina cambia cada día: lo contamos en Instagram.
        </p>

        <MotionConfig reducedMotion={MOTION_REDUCIDO}>
          {/* en el teléfono el croissant llena el hueco a la derecha de las pestañas; desde md la caja es estática y
              el croissant se ubica respecto del bloque de la carta, arriba a la derecha */}
          <div className="relative md:static">
            <Croissant />
            <div role="tablist" aria-label="Momento del día" className="relative z-[1] mt-10 flex flex-wrap gap-2" data-sin-flotante="">
              {CARTA.map((c) => (
                <Magnetic key={c.id}>
                  <motion.button
                    role="tab"
                    id={`tab-${c.id}`}
                    aria-selected={tab === c.id}
                    aria-controls="carta-panel"
                    onClick={() => elegir(c.id)}
                    className="pestana"
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    {tab === c.id && <FondoAnimado grupo="carta-pestana" className="rounded-full bg-laguna-deep" />}
                    <IconoMomento id={c.id} activo={tab === c.id} />
                    {c.label} <span className="tabular-nums opacity-70">desde {c.time}</span>
                  </motion.button>
                </Magnetic>
              ))}
            </div>
          </div>

          <div id="carta-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="relative mt-10">
            {/* la palabra gigante del momento elegido, detrás de la lista (referencia: henrietta) */}
            <p key={`palabra-${tab}`} className="carta-palabra" aria-hidden="true">
              {momento.label.split('').map((l, i) => (
                <span key={i} style={{ animationDelay: `${i * 45}ms` }}>
                  {l}
                </span>
              ))}
            </p>
            {/* al cambiar de momento, la frase entra palabra por palabra y los platos llegan en cascada */}
            <TextEffect key={`intro-${tab}`} animar={cambio} className="font-hand text-[1.6rem] leading-tight text-turquesa-dark">
              {momento.intro}
            </TextEffect>
            <motion.ul
              key={tab}
              className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2"
              initial={cambio ? 'oculto' : false}
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } } }}
            >
              {momento.items.map((item, k) => (
                <motion.li
                  key={item.name}
                  className="especimen"
                  variants={{
                    oculto: { opacity: 0, y: 18, filter: 'blur(6px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1] } },
                  }}
                >
                  <Lamina item={item} k={k} />
                  <div className="min-w-0">
                    <h3 className="titulo-vitrina text-[1.6rem] leading-[0.95] text-laguna-deep md:text-[1.9rem]">{item.name}</h3>
                    <p className="font-hand text-[1.3rem] leading-tight text-turquesa-dark">{item.note}</p>
                    <p className="mt-1 text-base leading-snug text-madera-soft">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </MotionConfig>

        {/* el aviso de papel: llega hecho un bollo y se abre */}
        <CartelDePapel className="carta-cartel">
          <p className="cartel-titulo">¿Para llevar o una torta entera?</p>
          <p className="cartel-texto">Pedila por WhatsApp. Lo que sale de la vitrina hoy, en Instagram.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3" data-sin-flotante="">
            <a href={whatsappLink('Hola Lilium! Quería hacer un pedido para llevar: ')} target="_blank" rel="noopener" className="pildora pildora-laguna">
              Pedir por WhatsApp
            </a>
            <a href={SITE.instagramHref} target="_blank" rel="noopener" className="pildora pildora-borde">
              Ver la vitrina de hoy
            </a>
          </div>
        </CartelDePapel>
      </div>
    </section>
  )
}
