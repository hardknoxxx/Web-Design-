import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion'
import { useEffect } from 'react'
import { startSmoothScroll } from './lib/scroll'
import { preloadSprites } from './lib/sprite'
import { CupButton } from './components/CupButton'
import { TopBar } from './components/TopBar'
import { Vines } from './components/Vines'
import { DayProvider, useDay } from './day/DayProvider'
import { Amanecer, lilyReady } from './sections/Amanecer'
import { Carta } from './sections/Carta'
import { Mantel } from './sections/Mantel'
import { Noche } from './sections/Noche'
import { Opiniones } from './sections/Opiniones'
import { Ritual } from './sections/Ritual'
import { Selva } from './sections/Selva'

/** Textura de estuco fija sobre los fondos de sección (capa compuesta, sin repintado al scrollear). */
function Stucco() {
  return <div aria-hidden="true" className="stucco pointer-events-none fixed inset-0 z-[35] opacity-50 [will-change:transform]" />
}

/** Fondo único del día: vira de color con el scroll, de una escena a la siguiente. */
function DayBackground() {
  const { bg } = useDay()
  return <m.div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" style={{ backgroundColor: bg }} />
}

export default function App() {
  useEffect(() => preloadSprites(lilyReady), [])
  useEffect(startSmoothScroll, [])
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <DayProvider>
          <DayBackground />
          <Stucco />
          <TopBar />
          <Vines />
          <main className="overflow-x-clip">
            <Amanecer />
            <Ritual />
            <Carta />
            <Mantel />
            <Selva />
            <Opiniones />
            <Noche />
          </main>
          <CupButton />
        </DayProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
