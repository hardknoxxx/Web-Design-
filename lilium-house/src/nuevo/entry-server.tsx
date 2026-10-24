import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { jsonLd } from '../data/site'
import { NuevoApp } from './NuevoApp'

/*
 * Entrada de servidor, solo para el build: genera el HTML de la portada para que el teléfono vea la página
 * antes de que baje y corra JavaScript (scripts/prerender.mjs la inserta en dist/index.html).
 * En el navegador, main.tsx la retoma con hydrateRoot.
 */
export function render() {
  return renderToString(
    <StrictMode>
      <NuevoApp />
    </StrictMode>,
  )
}

export { jsonLd }
