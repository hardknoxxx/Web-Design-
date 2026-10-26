import { LogoLilium } from './LogoLilium'
import { Cuaderno } from './Cuaderno'

/*
 * El cierre: el logo y la frase de la casa, y debajo el cuaderno de campo con los vecinos de la selva (Cuaderno.tsx).
 */
export function Rincon() {
  return (
    <footer className="rincon" aria-labelledby="rincon-titulo">
      <div className="rincon-cabeza">
        <h2 id="rincon-titulo" className="sr-only">
          Lilium Coffee Lounge
        </h2>
        <LogoLilium className="rincon-logo" />
        <p className="rincon-frase">Sabores que te sacan una sonrisa en cada sorbo y bocado.</p>
      </div>
      <Cuaderno />
      <p className="rincon-pie">© Lilium Coffee Lounge · Puerto Iguazú, Misiones</p>
    </footer>
  )
}
