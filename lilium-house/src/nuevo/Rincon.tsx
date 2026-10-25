import { useEffect, useState } from 'react'
import { useOpenStatus } from '../hooks/useOpenStatus'
import { LogoLilium } from './LogoLilium'
import { Matorral } from './Matorral'

/*
 * El cierre: el logo y la frase de la casa, y debajo el matorral de la selva misionera con su fauna (Matorral.tsx).
 */
/** La hora de Puerto Iguazú en vivo y si el local está abierto (referencia: el reloj local de neutomni). */
function Reloj() {
  const status = useOpenStatus()
  const [hora, setHora] = useState('')
  useEffect(() => {
    const f = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    const tic = () => setHora(f.format(new Date()))
    tic()
    const id = setInterval(tic, 15000)
    return () => clearInterval(id)
  }, [])
  if (!hora || !status) return null
  return (
    <p className="reloj" data-open={status.open || undefined}>
      <span className="reloj-punto" aria-hidden="true" />
      En Iguazú son las <span className="tabular-nums">{hora}</span> · {status.label.toLowerCase()}
    </p>
  )
}

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
      <Matorral />
      <div className="rincon-pie">
        <p>© Lilium Coffee Lounge · Puerto Iguazú, Misiones</p>
        <Reloj />
      </div>
    </footer>
  )
}
