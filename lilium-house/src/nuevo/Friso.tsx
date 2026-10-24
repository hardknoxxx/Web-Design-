import { Butterfly, Monstera, Toucan } from '../components/Botanica'
import { BananaLeaf, Fern, PalmFrond } from '../components/Flora'
import { InstagramIcon, WhatsAppIcon } from '../components/Icons'
import { SITE, whatsappLink } from '../data/site'
import { Lirio } from './Lirio'

/*
 * El cierre (referencia: el friso botánico de TAB). Una franja de selva al pie: hojas de banano, helechos,
 * palmera pindó, monstera y los lirios de la casa, con un tucán que se asoma. Pocas piezas, bien plantadas.
 */
export function Friso() {
  return (
    <footer className="relative overflow-hidden bg-crema pt-20 md:pt-28">
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 text-center md:px-7">
        <p className="font-script text-[3.6rem] leading-none text-laguna-deep md:text-[5rem]">Lilium</p>
        <p className="mt-3 max-w-[34ch] font-elegante text-lg text-madera-soft">
          {SITE.address}, {SITE.city}. Martes a sábado de 8 a 21; domingo de 8 a 12 y de 17 a 21.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={SITE.instagramHref} target="_blank" rel="noopener" className="boton boton-claro">
            <InstagramIcon className="h-5 w-5" />@{SITE.instagram}
          </a>
          <a href={whatsappLink()} target="_blank" rel="noopener" className="boton boton-claro">
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>
        </div>
      </div>

      <div aria-hidden="true" className="friso">
        <BananaLeaf className="friso-pieza left-[-2%] h-[88%] -rotate-[14deg]" color="#6F7F2E" />
        <Fern className="friso-pieza left-[9%] h-[62%] rotate-[8deg] max-md:hidden" />
        <Lirio className="friso-pieza left-[16%] h-[96%] max-md:left-[22%]" tilt={-6} bud />
        <PalmFrond className="friso-pieza left-[33%] h-[70%] -rotate-[10deg] max-md:hidden" />
        <Monstera className="friso-pieza left-[50%] h-[46%] rotate-[6deg] max-md:left-[44%]" />
        <Lirio className="friso-pieza left-[63%] h-[78%] max-md:hidden" tilt={9} />
        <Fern className="friso-pieza left-[74%] h-[56%] -rotate-[12deg] max-md:left-[70%]" color="#6F7F2E" />
        <BananaLeaf className="friso-pieza left-[86%] h-[80%] rotate-[16deg]" color="#415521" />
        <Toucan className="tucan" />
        <Butterfly className="mariposa friso-mariposa" />
      </div>

      <p className="relative z-10 bg-laguna-deep px-4 py-4 text-center text-[0.9rem] text-menta">
        © Lilium Coffee Lounge · Puerto Iguazú, Misiones
      </p>
    </footer>
  )
}
