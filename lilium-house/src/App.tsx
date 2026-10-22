import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { BedAndBreakfast } from './components/BedAndBreakfast'
import { Cafeteria } from './components/Cafeteria'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Navbar } from './components/Navbar'
import { Reviews } from './components/Reviews'
import { Visit } from './components/Visit'
import { WhatsAppButton } from './components/WhatsAppButton'

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <Cafeteria />
          <BedAndBreakfast />
          <Reviews />
          <Visit />
        </main>
        <Footer />
        <WhatsAppButton />
      </MotionConfig>
    </LazyMotion>
  )
}
