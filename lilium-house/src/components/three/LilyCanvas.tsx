import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Lily, type LilyInput } from './Lily'

function detectLowPower() {
  if (typeof window === 'undefined') return false
  const cores = navigator.hardwareConcurrency ?? 4
  const smallScreen = window.matchMedia('(max-width: 768px)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  return cores <= 4 || (smallScreen && coarse)
}

/** En teléfonos el lirio se dibuja a 30 fps: mitad de trabajo para la GPU, igual de fluido a la vista. */
function Throttle({ fps }: { fps: number }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let raf = 0
    let last = 0
    const tick = (t: number) => {
      if (t - last >= 1000 / fps - 2) {
        last = t
        invalidate()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [fps, invalidate])
  return null
}

/** Avisa cuando el primer cuadro ya está en pantalla (el boceto del hero se va recién ahí). */
function FirstFrame({ onReady }: { onReady?: () => void }) {
  const sent = useRef(false)
  useFrame(() => {
    if (sent.current) return
    sent.current = true
    requestAnimationFrame(() => onReady?.())
  })
  return null
}

// el hero dura 1,5 pantallas de scroll; el lirio termina de desvanecerse al ~84 %
const HERO_SCROLL = 1.5
const LILY_GONE = 1.32

export default function LilyCanvas({ onReady }: { onReady?: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const input = useRef<LilyInput>({
    pointerX: 0,
    pointerY: 0,
    dragging: false,
    lastX: 0,
    spinVelocity: 0,
    pulse: 0,
    scroll: 0,
  })
  const [visible, setVisible] = useState(true)
  // ya atravesamos el follaje: el lirio es invisible, no tiene sentido seguir dibujándolo
  const [gone, setGone] = useState(false)
  const [lowPower] = useState(detectLowPower)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  // Pausa el render loop cuando el hero sale de pantalla (ahorra batería en móviles)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Progreso de scroll del hero, sin re-renders
  useEffect(() => {
    const onScroll = () => {
      const h = window.innerHeight
      input.current.scroll = Math.min(1, Math.max(0, window.scrollY / (h * HERO_SCROLL)))
      setGone(window.scrollY > h * LILY_GONE)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const updatePointer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const st = input.current
    st.pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    st.pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1
    if (st.dragging) {
      const dx = e.clientX - st.lastX
      st.lastX = e.clientX
      st.spinVelocity = Math.max(-0.25, Math.min(0.25, st.spinVelocity + dx * 0.0025))
    }
  }

  const release = (e: PointerEvent<HTMLDivElement>) => {
    input.current.dragging = false
    if (e.pointerType !== 'mouse' || e.type === 'pointerleave') {
      input.current.pointerX = 0
      input.current.pointerY = 0
    }
  }

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="Flor de lirio 3D interactiva: arrastrá para girarla o tocala para que florezca"
      className="relative h-full w-full cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'pan-y' }}
      onPointerMove={updatePointer}
      onPointerDown={(e) => {
        const st = input.current
        st.dragging = true
        st.lastX = e.clientX
        st.pulse = 1
        updatePointer(e)
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
    >
      {/* el lienzo es 1,5 veces más alto que la caja: el tallo baja hasta perderse detrás del pasto
          (antes se cortaba en el borde). El encuadre se corrige para que la flor quede igual. */}
      <div className="absolute inset-x-0 top-0 h-[150%]">
        <Canvas
          dpr={lowPower ? [1, 1.25] : [1, 2]}
          camera={{ position: [0, -0.71, 5.6], fov: 54.6 }}
          gl={{ antialias: !lowPower, alpha: true, powerPreference: 'high-performance', stencil: false }}
          frameloop={visible && !gone ? (lowPower ? 'demand' : 'always') : 'never'}
          onCreated={({ camera }) => camera.lookAt(0, -0.81, 0)}
        >
          {lowPower && visible && !gone && <Throttle fps={30} />}
          <FirstFrame onReady={onReady} />
          <Lily input={input} lowPower={lowPower} reducedMotion={reducedMotion} />
        </Canvas>
      </div>
    </div>
  )
}
