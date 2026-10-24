import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { NuevoApp } from './NuevoApp'
import './base.css'
import './nuevo.css'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <NuevoApp />
  </StrictMode>
)
// en producción el HTML ya viene generado (scripts/prerender.mjs): React lo retoma; en desarrollo, lo arma
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
