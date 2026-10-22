import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Lily, type LilyInput } from './Lily'

function detectLowPower() {
  if (typeof window === 'undefined') return false
  const cores = navigator.hardwareConcurrency ?? 4
  const smallScreen = window.matchMedia('(max-width: 768px)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  return cores <= 4 || (smallScreen && coarse)
}

export default function LilyCanvas() {
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
      // el hero dura ~1.3 pantallas de scroll (escena fijada)
      input.current.scroll = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 1.3)))
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
      className="h-full w-full cursor-grab active:cursor-grabbing"
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
      <Canvas
        dpr={lowPower ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 0.25, 5.6], fov: 38 }}
        gl={{ antialias: !lowPower, alpha: true, powerPreference: 'high-performance', stencil: false }}
        frameloop={visible ? 'always' : 'never'}
        onCreated={({ camera }) => camera.lookAt(0, 0.15, 0)}
      >
        <Lily input={input} lowPower={lowPower} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}
