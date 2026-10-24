import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NuevoApp } from './NuevoApp'
import '../index.css'
import './nuevo.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NuevoApp />
  </StrictMode>,
)
