import { SITE, whatsappLink } from '../data/site'
import { MesaGiratoria } from './MesaGiratoria'

export function NuevoApp() {
  return (
    <main>
      <MesaGiratoria />
      <section id="visita" className="bg-laguna-deep px-4 py-20 text-crema md:px-7 md:py-28">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-[2.2rem] leading-tight font-semibold md:text-[3rem]">Te esperamos</h2>
            <p className="mt-4 text-lg text-menta">
              {SITE.address}
              <br />
              {SITE.city}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={SITE.mapsHref} target="_blank" rel="noopener" className="boton !bg-turquesa !text-laguna-deep">
                Cómo llegar
              </a>
              <a href={whatsappLink()} target="_blank" rel="noopener" className="boton !bg-laguna">
                Escribinos por WhatsApp
              </a>
            </div>
          </div>
          <dl className="grid content-start gap-4 font-elegante text-lg">
            {SITE.hours.rows.map(([dia, hora]) => (
              <div key={dia} className="flex justify-between gap-6 border-b border-laguna pb-3">
                <dt className="font-semibold">{dia}</dt>
                <dd className="tabular-nums text-menta">{hora}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  )
}
