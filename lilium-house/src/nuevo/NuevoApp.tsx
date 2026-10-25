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
    // controles que el botón taparía en la esquina de abajo (flechas del mazo, pestañas y botones de la carta)
    const tapados = new Set<Element>()
    const sync = () => setVisible(pastMesa && !onVisita && tapados.size === 0)
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === mesa) pastMesa = !e.isIntersecting && e.boundingClientRect.top < 0
        else onVisita = e.isIntersecting
      }
      sync()
    })
    // solo cuenta la franja de abajo de la pantalla, donde vive el botón
    const abajo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) tapados.add(e.target)
          else tapados.delete(e.target)
        }
        sync()
      },
      { rootMargin: '-78% 0px 0px 0px' },
    )
    io.observe(mesa)
    io.observe(visita)
    document.querySelectorAll('[data-sin-flotante]').forEach((el) => abajo.observe(el))
    return () => {
      io.disconnect()
      abajo.disconnect()
    }
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
