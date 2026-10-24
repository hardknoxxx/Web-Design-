import { useEffect, useState } from 'react'
import { SITE } from '../data/site'
import { Cabecera } from './Cabecera'
import { Carta } from './Carta'
import { Coreografia } from './Coreografia'
import { LogoDefs } from './LogoLilium'
import { MesaGiratoria } from './MesaGiratoria'
import { Rincon } from './Rincon'
import { Vitrina } from './Vitrina'
import { Visita } from './Visita'

/** "Cómo llegar" siempre a mano: cuando la mesa queda atrás, el botón baja a la esquina. */
function LlegarFlotante() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const mesa = document.getElementById('mesa')!
    const visita = document.getElementById('visita')!
    let pastMesa = false
    let onVisita = false
    const sync = () => setVisible(pastMesa && !onVisita)
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === mesa) pastMesa = !e.isIntersecting && e.boundingClientRect.top < 0
        else onVisita = e.isIntersecting
      }
      sync()
    })
    io.observe(mesa)
    io.observe(visita)
    return () => io.disconnect()
  }, [])
  return (
    <a href={SITE.mapsHref} target="_blank" rel="noopener" className="pildora pildora-laguna llegar-flotante" data-visible={visible || undefined} tabIndex={visible ? 0 : -1} aria-hidden={!visible}>
      Cómo llegar
    </a>
  )
}

export function NuevoApp() {
  return (
    <>
      <LogoDefs />
      <Coreografia />
      <Cabecera />
      <main>
        <MesaGiratoria />
        <Vitrina />
        <Carta />
        <Visita />
      </main>
      <Rincon />
      <LlegarFlotante />
    </>
  )
}
