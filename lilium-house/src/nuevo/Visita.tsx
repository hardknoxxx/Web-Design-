import { useEffect, useRef } from 'react'
import { Coati, HorneroNido } from '../components/Fauna'
import { LilyMark, PhoneIcon } from '../components/Icons'
import { SITE, whatsappLink } from '../data/site'
import { useOpenStatus } from '../hooks/useOpenStatus'

/*
 * Visitanos (referencia: el mapa redibujado de Madie). Un croquis propio de la avenida, el horario con el día de
 * hoy marcado y las tres formas de llegar o avisar. Un hornero cuida el croquis y un coatí cruza al pie.
 */

function filaDeHoy() {
  const d = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short' }).format(new Date())
  return d === 'Sun' ? 'Domingo' : d === 'Mon' ? 'Lunes' : 'Mar a Sáb'
}

function Croquis() {
  return (
    <svg viewBox="0 0 480 340" className="h-auto w-full" role="img" aria-label="Croquis: Lilium sobre la Avenida Tres Fronteras, camino al Hito Tres Fronteras">
      {/* los ríos al fondo, donde termina la avenida */}
      <path d="M0 0H210C186 26 150 40 104 52C64 62 26 84 0 112Z" className="fill-turquesa/35" />
      <text x="22" y="36" className="croquis-rotulo fill-menta">Ríos Iguazú y Paraná</text>
      {/* manzanas */}
      {[
        [250, 40, 90, 54],
        [356, 40, 100, 54],
        [300, 236, 80, 70],
        [396, 236, 70, 70],
        [40, 250, 110, 60],
      ].map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="10" className="fill-laguna-deep/60" />
      ))}
      {/* Av. Tres Fronteras */}
      <path id="croquis-av" d="M96 70C130 104 170 128 230 150C300 176 380 186 480 196" className="stroke-menta" strokeWidth="26" fill="none" strokeLinecap="round" />
      <text className="croquis-calle fill-laguna-deep">
        <textPath href="#croquis-av" startOffset="22%">
          Av. Tres Fronteras
        </textPath>
      </text>
      <path d="M150 210V340" className="stroke-menta/50" strokeWidth="12" fill="none" />
      {/* Lilium */}
      <g transform="translate(330 150)">
        <circle r="30" className="fill-crema" />
        <LilyMark x="-20" y="-20" width="40" height="40" className="text-laguna-deep" />
      </g>
      <text x="330" y="112" textAnchor="middle" className="croquis-nombre fill-crema">Lilium</text>
      <text x="330" y="232" textAnchor="middle" className="croquis-rotulo fill-menta">467/489</text>
      <path d="M118 96L92 66M92 66L94 82M92 66L108 70" className="stroke-crema" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x="40" y="132" className="croquis-rotulo fill-crema">al Hito</text>
    </svg>
  )
}

export function Visita() {
  const status = useOpenStatus()
  const hoy = filaDeHoy()
  const coatiRef = useRef<HTMLDivElement>(null)

  // el coatí camina solo mientras la sección está en pantalla
  useEffect(() => {
    const el = coatiRef.current!
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.dataset.camina = ''
      else delete el.dataset.camina
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section id="visita" aria-labelledby="visita-titulo" className="relative overflow-hidden bg-laguna-deep px-4 pt-24 pb-36 text-crema md:px-7 md:pt-32 md:pb-44">
      <div className="mx-auto grid max-w-5xl gap-14 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <div>
          <h2 id="visita-titulo" className="font-display text-[2.6rem] leading-none font-semibold md:text-[4.5rem]">
            Te esperamos
          </h2>
          <p className="mt-5 flex items-center gap-2 font-elegante text-lg" data-open={status?.open ?? undefined}>
            <span aria-hidden="true" className="estado-punto" />
            {status?.label ?? 'Martes a domingo'}
          </p>
          <p className="mt-3 text-lg text-menta">
            {SITE.address}
            <br />
            {SITE.city}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={SITE.mapsHref} target="_blank" rel="noopener" className="boton boton-menta">
              Cómo llegar
            </a>
            <a href={whatsappLink('Hola Lilium! Quería reservar una mesa para … personas, el día … a las …')} target="_blank" rel="noopener" className="boton boton-linea">
              Reservar por WhatsApp
            </a>
            <a href={SITE.phoneHref} className="boton boton-linea">
              <PhoneIcon className="h-5 w-5" />
              Llamar
            </a>
          </div>

          <dl className="mt-12 grid gap-1 font-elegante text-lg">
            {SITE.hours.rows.map(([dia, hora]) => (
              <div key={dia} className="horario-fila" data-hoy={dia === hoy || undefined}>
                <dt className="font-semibold">
                  {dia}
                  {dia === hoy && <span className="ml-2 font-hand text-[1.3rem] font-normal text-turquesa">hoy</span>}
                </dt>
                <dd className="tabular-nums">{hora}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="relative self-start">
          <HorneroNido className="hornero" />
          <div className="rounded-[1.75rem] bg-laguna p-4 md:p-6">
            <Croquis />
          </div>
          <figcaption className="mt-3 text-[0.95rem] text-menta">Croquis de referencia, no a escala. Para el recorrido exacto, tocá «Cómo llegar».</figcaption>
        </figure>
      </div>

      <div ref={coatiRef} aria-hidden="true" className="coati-paseo">
        <Coati className="h-full w-auto" />
      </div>
    </section>
  )
}
