import { useEffect, useRef } from 'react'
import { Coati, HorneroNido } from '../components/Fauna'
import { LilyMark, PhoneIcon } from '../components/Icons'
import { SITE, whatsappLink } from '../data/site'
import { useOpenStatus } from '../hooks/useOpenStatus'
import { AVENIDA, CALLE, PARQUE, PIN, RIO, ROTULOS } from './croquisDatos'

/*
 * Visitanos (referencia: el mapa redibujado de Madie). Las calles reales de OpenStreetMap en la paleta, el horario con el día de
 * hoy marcado y las tres formas de llegar o avisar. Un hornero cuida el croquis y un coatí cruza al pie.
 */

function filaDeHoy() {
  const d = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short' }).format(new Date())
  return d === 'Sun' ? 'Domingo' : d === 'Mon' ? 'Lunes' : 'Mar a Sáb'
}

function Croquis() {
  const [px, py] = PIN
  return (
    <svg viewBox="0 0 480 340" className="h-auto w-full overflow-hidden rounded-[1.25rem]" role="img" aria-label="Croquis: Lilium en Av. Tres Fronteras, casi esquina Entre Ríos, a unos 200 m de la Costanera">
      <rect width="480" height="340" className="fill-laguna" />
      {/* el río Iguazú, al norte, detrás de la Costanera */}
      <path d={RIO} className="stroke-turquesa/45" strokeWidth="96" fill="none" strokeLinejoin="round" />
      <path d={PARQUE} className="fill-musgo/70" />
      <path d={CALLE} className="stroke-laguna-deep" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={AVENIDA} className="stroke-menta" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="408" y="24" textAnchor="middle" className="croquis-rotulo fill-crema">
        Río Iguazú
      </text>
      {ROTULOS.map((r) => (
        <text
          key={r.t}
          x={r.x}
          y={r.y}
          transform={`rotate(${r.r} ${r.x} ${r.y})`}
          textAnchor="middle"
          dominantBaseline="middle"
          className={r.t.startsWith('Av.') || r.t === 'Costanera' ? 'croquis-calle fill-laguna-deep' : 'croquis-rotulo fill-menta'}
        >
          {r.t}
        </text>
      ))}
      {/* Lilium */}
      <g transform={`translate(${px} ${py})`}>
        <circle r="22" className="fill-crema" />
        <LilyMark x="-15" y="-15" width="30" height="30" className="text-laguna-deep" />
      </g>
      <text x={px} y={py - 34} textAnchor="middle" className="croquis-nombre fill-crema">
        Lilium
      </text>
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
          <Croquis />
          <figcaption className="mt-3 text-[0.95rem] text-menta">Casi esquina Entre Ríos, a unos 200 m de la Costanera. Mapa: © colaboradores de OpenStreetMap.</figcaption>
        </figure>
      </div>

      <div ref={coatiRef} aria-hidden="true" className="coati-paseo">
        <Coati className="h-full w-auto" />
      </div>
    </section>
  )
}
