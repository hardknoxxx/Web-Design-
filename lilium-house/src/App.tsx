import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { CupButton } from './components/CupButton'
import { TopBar } from './components/TopBar'
import { Vines } from './components/Vines'
import { DayProvider } from './day/DayProvider'
import { Amanecer } from './sections/Amanecer'
import { Mantel } from './sections/Mantel'
import { Noche } from './sections/Noche'
import { Opiniones } from './sections/Opiniones'
import { Ritual } from './sections/Ritual'
import { Selva } from './sections/Selva'

/** Textura de estuco fija sobre los fondos de sección (capa compuesta, sin repintado al scrollear). */
function Stucco() {
  return <div aria-hidden="true" className="stucco pointer-events-none fixed inset-0 z-[35] opacity-50 [will-change:transform]" />
}

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <DayProvider>
          <Stucco />
          <TopBar />
          <Vines />
          <main className="overflow-x-clip">
            <Amanecer />
            <Ritual />
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
