import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

/** Estado de interacción compartido con el wrapper DOM (se muta sin re-renders). */
export type LilyInput = {
  pointerX: number // -1..1
  pointerY: number // -1..1
  dragging: boolean
  lastX: number
  spinVelocity: number
  pulse: number // 0..1, se dispara al tocar
  scroll: number // 0..1, progreso del hero
}

type PetalOptions = {
  length: number
  width: number
  startAngle: number // elevación inicial (rad)
  curl: number // cuánto se curva hacia afuera/abajo
  cup: number // concavidad transversal
  ruffle: number // ondulado del borde
  segU: number
  segV: number
  palette: [string, string, string, string] // garganta, cuerpo, punta, nervadura
}

const tmp = new THREE.Color()
const tmpB = new THREE.Color()

/** Pétalo procedural: banda curvada en el plano (z radial, y arriba), x es el ancho. */
function createPetalGeometry(o: PetalOptions) {
  const { segU, segV } = o
  const positions = new Float32Array((segU + 1) * (segV + 1) * 3)
  const colors = new Float32Array(positions.length)
  const indices: number[] = []

  const [throat, body, tip, rib] = o.palette.map((c) => new THREE.Color(c))
  const edge = new THREE.Color('#FAF7F2')

  // Integración de la línea central
  let cz = 0
  let cy = 0
  const step = o.length / segU
  let k = 0
  for (let i = 0; i <= segU; i++) {
    const u = i / segU
    const theta = o.startAngle - o.curl * Math.pow(u, 1.5)
    const nz = -Math.sin(theta)
    const ny = Math.cos(theta)
    const w = o.width * (0.1 + 0.9 * Math.pow(Math.sin(Math.PI * Math.min(u * 1.08, 1)), 0.75)) * Math.pow(1 - u, 0.18)

    // color a lo largo del pétalo
    if (u < 0.4) tmp.copy(throat).lerp(body, THREE.MathUtils.smoothstep(u, 0.05, 0.4))
    else tmp.copy(body).lerp(tip, THREE.MathUtils.smoothstep(u, 0.55, 1))

    for (let j = 0; j <= segV; j++) {
      const v = (j / segV) * 2 - 1
      const av = Math.abs(v)
      const x = v * w
      let off = o.cup * v * v * w
      off += o.ruffle * Math.sin(u * 19 + v * 2) * Math.pow(av, 3) * u
      off -= 0.035 * w * Math.pow(1 - av, 6) // surco de la nervadura central

      positions[k] = x
      positions[k + 1] = cy + ny * off
      positions[k + 2] = cz + nz * off

      tmpB.copy(tmp)
      if (av < 0.22 && u > 0.08 && u < 0.85) tmpB.lerp(rib, (1 - av / 0.22) * 0.55)
      tmpB.lerp(edge, Math.pow(av, 5) * 0.3)
      colors[k] = tmpB.r
      colors[k + 1] = tmpB.g
      colors[k + 2] = tmpB.b
      k += 3
    }
    cz += Math.cos(theta) * step
    cy += Math.sin(theta) * step
  }

  for (let i = 0; i < segU; i++) {
    for (let j = 0; j < segV; j++) {
      const a = i * (segV + 1) + j
      const b = a + segV + 1
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

function createDotTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.85)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function createPollen(count: number, color: string) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // cáscara esférica achatada alrededor de la flor
    const r = 1.6 + Math.random() * 1.4
    const a = Math.random() * Math.PI * 2
    const y = (Math.random() - 0.4) * 2.6
    positions[i * 3] = Math.cos(a) * r
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = Math.sin(a) * r
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return { geo, color }
}

const OUTER = 3
const INNER = 3
const damp = THREE.MathUtils.damp

type Props = { input: RefObject<LilyInput>; lowPower: boolean; reducedMotion: boolean }

export function Lily({ input, lowPower, reducedMotion }: Props) {
  const root = useRef<THREE.Group>(null!)
  const spinner = useRef<THREE.Group>(null!)
  const pollenGroup = useRef<THREE.Group>(null!)
  const petals = useRef<THREE.Mesh[]>([])
  const anim = useRef({ spin: 0, bloom: 0.35, time: 0 })

  const assets = useMemo(() => {
    const seg = lowPower ? { segU: 22, segV: 8 } : { segU: 32, segV: 12 }
    const outerPetal = createPetalGeometry({
      length: 1.62,
      width: 0.4,
      startAngle: 1.08,
      curl: 1.9,
      cup: 0.32,
      ruffle: 0.035,
      palette: ['#F2CF8E', '#F8E6CF', '#FFF8EF', '#D99A62'],
      ...seg,
    })
    const innerPetal = createPetalGeometry({
      length: 1.5,
      width: 0.5,
      startAngle: 1.18,
      curl: 1.75,
      cup: 0.38,
      ruffle: 0.05,
      palette: ['#F5D79C', '#FBEEDD', '#FFFBF4', '#DFA772'],
      ...seg,
    })
    const leaf = createPetalGeometry({
      length: 2.3,
      width: 0.26,
      startAngle: 0.25,
      curl: 0.9,
      cup: 0.2,
      ruffle: 0.015,
      palette: ['#415521', '#5E7A2A', '#97AD3D', '#34451A'],
      segU: lowPower ? 16 : 24,
      segV: 6,
    })

    const radial = lowPower ? 5 : 7
    const stamens = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6
      const spread = 0.48 + (i % 2) * 0.08
      const end = new THREE.Vector3(Math.sin(a) * spread, 1.02 + (i % 2) * 0.08, Math.cos(a) * spread)
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.05, 0),
        new THREE.Vector3(Math.sin(a) * 0.12, 0.65, Math.cos(a) * 0.12),
        end,
      )
      return { geo: new THREE.TubeGeometry(curve, 14, 0.013, radial, false), end, angle: a }
    })
    const pistilCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(0.05, 0.7, 0.02),
      new THREE.Vector3(-0.04, 1.22, 0.08),
    )
    const pistil = new THREE.TubeGeometry(pistilCurve, 16, 0.022, radial, false)
    const anther = new THREE.CapsuleGeometry(0.035, 0.12, 3, radial)
    const stigma = new THREE.SphereGeometry(0.06, 12, 10)
    const stem = new THREE.CylinderGeometry(0.045, 0.08, 10, radial, 1, true)

    const dot = createDotTexture()
    const pollen = [
      createPollen(lowPower ? 45 : 110, '#D9A441'),
      createPollen(lowPower ? 20 : 50, '#64BCB0'),
      createPollen(lowPower ? 15 : 35, '#B4472B'),
    ]

    return { outerPetal, innerPetal, leaf, stamens, pistil, anther, stigma, stem, dot, pollen }
  }, [lowPower])

  // en teléfonos, Lambert: mismo aspecto mate, mucho menos cálculo por píxel que PBR
  const materials = useMemo(() => {
    const M = lowPower ? THREE.MeshLambertMaterial : THREE.MeshStandardMaterial
    const pbr = (r: number) => (lowPower ? {} : { roughness: r, metalness: 0 })
    return {
      petal: new M({ vertexColors: true, side: THREE.DoubleSide, ...pbr(0.55) }),
      filament: new M({ color: '#F4E6C8', ...pbr(0.6) }),
      anther: new M({ color: '#8A3B1E', ...pbr(0.85) }),
      stigma: new M({ color: '#64BCB0', emissive: '#64BCB0', emissiveIntensity: 0.25, ...pbr(0.35) }),
      stem: new M({ color: '#415521', ...pbr(0.7) }),
    }
  }, [lowPower])

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05)
    const st = input.current
    const a = anim.current
    a.time += dt

    // Inercia del arrastre + giro automático
    st.spinVelocity *= Math.exp(-dt * 2.2)
    a.spin += (reducedMotion ? 0.06 : 0.22) * dt + st.spinVelocity
    st.pulse = Math.max(0, st.pulse - dt * 0.9)

    // Floración: base + scroll + pulso al tocar
    const pulse = Math.sin(Math.min(st.pulse, 1) * Math.PI)
    const targetBloom = THREE.MathUtils.clamp(0.3 + st.scroll * 0.7 + pulse * 0.45, 0, 1.2)
    a.bloom = damp(a.bloom, targetBloom, 4, dt)

    // Inclinación hacia el cursor/toque + respuesta al scroll
    const g = root.current
    g.rotation.x = damp(g.rotation.x, 0.78 + st.pointerY * 0.28 - st.scroll * 0.25, 3.5, dt)
    g.rotation.z = damp(g.rotation.z, -st.pointerX * 0.22, 3.5, dt)
    g.position.y = damp(g.position.y, -0.35 + st.scroll * 0.3 + Math.sin(a.time * 0.8) * 0.04, 4, dt)
    // zoom suave al scrollear: la flor se acerca de a poco (amortiguado, nunca a saltos)
    const s = 1 + st.scroll * 0.42 + pulse * 0.04
    g.scale.setScalar(damp(g.scale.x, s, 5, dt))

    spinner.current.rotation.y = a.spin + st.scroll * Math.PI * 0.9

    const list = petals.current
    for (let i = 0; i < list.length; i++) {
      const p = list[i]
      if (!p) continue
      const inner = i >= OUTER
      const flutter = reducedMotion ? 0 : Math.sin(a.time * 1.6 + i * 1.3) * 0.025
      p.rotation.x = (inner ? -0.42 : -0.3) + a.bloom * (inner ? 0.55 : 0.68) + flutter
    }

    const pg = pollenGroup.current
    pg.rotation.y -= dt * (reducedMotion ? 0.01 : 0.05)
    pg.position.y = Math.sin(a.time * 0.5) * 0.08
  })

  return (
    <>
      <hemisphereLight args={['#FFF4E6', '#C9A68C', 1.25]} />
      <ambientLight intensity={0.35} color="#FFE9DA" />
      <directionalLight position={[2.5, 4, 5]} intensity={1.9} color="#FFE8D0" />
      <directionalLight position={[-3, 1.5, -3]} intensity={1.1} color="#64BCB0" />
      {!lowPower && <pointLight position={[0, 0.8, 1.2]} intensity={1.2} distance={4} color="#FFD7B5" />}

      <group ref={root} rotation={[0.78, 0, 0]} position={[0, -0.35, 0]}>
        <group ref={spinner}>
          {/* Tallo y hojas */}
          <mesh geometry={assets.stem} material={materials.stem} position={[0, -5, 0]} />
          {[0, 2.2, 4.1].map((a, i) => (
            <group key={a} rotation={[0, a, 0]} position={[0, -0.9 - i * 0.45, 0]}>
              <mesh geometry={assets.leaf} material={materials.petal} rotation={[0.1 + i * 0.12, 0, 0]} />
            </group>
          ))}

          {/* Pétalos (tépalos): 3 externos + 3 internos */}
          {Array.from({ length: OUTER + INNER }, (_, i) => {
            const inner = i >= OUTER
            const angle = (i % 3) * ((Math.PI * 2) / 3) + (inner ? Math.PI / 3 : 0)
            return (
              <group key={i} rotation={[0, angle, 0]}>
                <mesh
                  ref={(m) => {
                    if (m) petals.current[i] = m
                  }}
                  geometry={inner ? assets.innerPetal : assets.outerPetal}
                  material={materials.petal}
                  position={[0, inner ? 0.02 : 0, 0.04]}
                />
              </group>
            )
          })}

          {/* Estambres y pistilo */}
          {assets.stamens.map((s, i) => (
            <group key={i}>
              <mesh geometry={s.geo} material={materials.filament} />
              <mesh
                geometry={assets.anther}
                material={materials.anther}
                position={s.end}
                rotation={[Math.PI / 2, 0, s.angle + Math.PI / 2]}
              />
            </group>
          ))}
          <mesh geometry={assets.pistil} material={materials.filament} />
          <mesh geometry={assets.stigma} material={materials.stigma} position={[-0.04, 1.24, 0.08]} />
        </group>
      </group>

      {/* Polen flotante */}
      <group ref={pollenGroup}>
        {assets.pollen.map((p, i) => (
          <points key={i} geometry={p.geo}>
            <pointsMaterial
              map={assets.dot}
              color={p.color}
              size={i === 0 ? 0.07 : 0.055}
              sizeAttenuation
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </points>
        ))}
      </group>
    </>
  )
}
