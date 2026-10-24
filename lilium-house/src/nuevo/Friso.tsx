import { Butterfly, Monstera, Toucan } from '../components/Botanica'
import { BananaLeaf, Fern, Hummingbird, PalmFrond } from '../components/Flora'
import { Lirio } from './Lirio'
import { Pieza, Vida } from './vida/Vida'

/*
 * El cierre (referencia: el friso botánico de TAB): una franja de selva misionera al pie, sin repetir datos.
 * Hojas de banano, helechos, pindó, monstera y los lirios de la casa se mecen con el viento; el tucán salta
 * sobre la palmera, la mariposa pasea y un picaflor visita el lirio.
 */
export function Friso() {
  return (
    <footer className="relative overflow-hidden bg-crema">
      <Vida>
        <div className="friso">
          <Pieza clase="planta" fase={0.1} className="absolute bottom-0 left-[-3%] h-[86%]" style={{ aspectRatio: '140/340' }}>
            <BananaLeaf color="#6F7F2E" />
          </Pieza>
          <Pieza clase="planta" fase={0.5} className="absolute bottom-0 left-[9%] h-[60%] max-md:hidden" style={{ aspectRatio: '120/215' }}>
            <Fern />
          </Pieza>
          <Pieza clase="planta" fase={0.8} className="absolute bottom-0 left-[17%] h-[96%] max-md:left-[20%]" style={{ aspectRatio: '400/760' }}>
            <Lirio tilt={-6} bud />
          </Pieza>
          <Pieza clase="planta" fase={0.3} className="absolute bottom-0 left-[34%] h-[72%] max-md:hidden" style={{ aspectRatio: '240/290' }}>
            <PalmFrond />
          </Pieza>
          <Pieza clase="planta" fase={0.65} className="absolute bottom-0 left-[50%] h-[44%] max-md:left-[46%]" style={{ aspectRatio: '260/232' }}>
            <Monstera />
          </Pieza>
          <Pieza clase="planta" fase={0.9} className="absolute bottom-0 left-[64%] h-[80%] max-md:hidden" style={{ aspectRatio: '400/760' }}>
            <Lirio tilt={9} />
          </Pieza>
          <Pieza clase="planta" fase={0.15} className="absolute bottom-0 left-[76%] h-[56%] max-md:left-[70%]" style={{ aspectRatio: '120/215' }}>
            <Fern color="#6F7F2E" />
          </Pieza>
          <Pieza clase="planta" fase={0.55} className="absolute bottom-0 left-[88%] h-[78%]" style={{ aspectRatio: '140/340' }}>
            <BananaLeaf color="#415521" />
          </Pieza>
          <Pieza clase="salto" fase={0.4} className="tucan" style={{ aspectRatio: '190/110' }}>
            <Toucan />
          </Pieza>
          <Pieza clase="mariposa" fase={0.75} className="absolute top-[14%] right-[24%] h-10" style={{ aspectRatio: '48/40' }}>
            <Butterfly />
          </Pieza>
          <Pieza clase="picaflor" fase={0.2} className="absolute bottom-[70%] left-[27%] h-16 max-md:left-[34%] max-md:bottom-[78%]" style={{ aspectRatio: '140/100' }}>
            <Hummingbird />
          </Pieza>
        </div>
      </Vida>
      <p className="relative z-10 bg-laguna-deep px-4 py-4 text-center text-[0.9rem] text-menta">© Lilium Coffee Lounge · Puerto Iguazú, Misiones</p>
    </footer>
  )
}
