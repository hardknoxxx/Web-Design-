import {
  ACESFilmicToneMapping,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  QuadraticBezierCurve3,
  Scene,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'

/*
 * Lirio 3D del hero, en three.js puro (sin React en el bucle de render).
 *
 * Liviano a propósito: ~1.000 triángulos y 4 llamadas de dibujo.
 * - Pétalos procedurales de pocos segmentos, dos formas instanciadas (3 + 3 tépalos).
 * - Tallo, hojas, estambres, pistilo y estigma fusionados en una sola malla con colores por vértice.
 * - Un solo material Lambert para todo y una sola nube de polen.
 *
 * Rendimiento: pixel ratio ≤ 2 (y baja de a escalones si el equipo no llega), ≤ 60 fps aunque la
 * pantalla sea de 120 Hz; en equipos de bajo consumo, 30 fps mientras la flor solo gira sola y 60
 * apenas alguien la toca o scrollea. El bucle se detiene fuera de pantalla (IntersectionObserver),
 * con la pestaña oculta y cuando el hero ya atravesó el follaje. `dispose()` libera geometrías,
 * materiales, textura, contexto WebGL y canvas.
 *
 * Interacción: arrastrar gira la flor siguiendo el dedo (y queda con inercia al soltar); un toque
 * rápido la hace dar una vuelta de bienvenida con rebote elástico, latir y abrirse un poco.
 * El contenedor usa `touch-action: pan-y`: el gesto vertical sigue siendo scroll de la página.
 */

// el hero dura 1,5 pantallas de scroll; el lirio termina de desvanecerse al ~84 %
const HERO_SCROLL = 1.5
const LILY_GONE = 1.32
const MAX_DPR = 2
// escalones de resolución si el equipo no sostiene los cuadros (nunca por encima de MAX_DPR)
const DPR_STEPS = [2, 1.5, 1.25, 1]
const FRAME_MS = 1000 / 60
const IDLE_FRAME_MS = 1000 / 30
const TAP_MS = 280
const TAP_PX = 10

type Palette = [string, string, string, string] // garganta, cuerpo, punta, nervadura

type PetalOptions = {
  length: number
  width: number
  startAngle: number // elevación inicial (rad)
  curl: number // cuánto se curva hacia afuera/abajo
  cup: number // concavidad transversal
  segU: number
  segV: number
  palette: Palette
}

const tmp = new Color()
const tmpB = new Color()

/** Pétalo (u hoja): banda curvada en el plano (z radial, y arriba), x es el ancho. */
function petalGeometry(o: PetalOptions) {
  const { segU, segV } = o
  const positions = new Float32Array((segU + 1) * (segV + 1) * 3)
  const colors = new Float32Array(positions.length)
  const indices: number[] = []
  const [throat, body, tip, rib] = o.palette.map((c) => new Color(c))

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
    if (u < 0.4) tmp.copy(throat).lerp(body, MathUtils.smoothstep(u, 0.05, 0.4))
    else tmp.copy(body).lerp(tip, MathUtils.smoothstep(u, 0.55, 1))
    for (let j = 0; j <= segV; j++) {
      const v = (j / segV) * 2 - 1
      const off = o.cup * v * v * w
      positions[k] = v * w
      positions[k + 1] = cy + ny * off
      positions[k + 2] = cz + nz * off
      tmpB.copy(tmp)
      // nervadura central apenas más oscura
      if (v === 0 && u > 0.08 && u < 0.85) tmpB.lerp(rib, 0.4)
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
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(positions, 3))
  geo.setAttribute('color', new BufferAttribute(colors, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/** Pinta una geometría de un solo color (para fusionarla con las demás). */
function tint(geo: BufferGeometry, hex: string) {
  const c = new Color(hex)
  const n = geo.getAttribute('position').count
  const colors = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) c.toArray(colors, i * 3)
  geo.setAttribute('color', new BufferAttribute(colors, 3))
  return geo
}

/** Fusiona geometrías (posición, normal y color) en una sola: una única llamada de dibujo. */
function merge(parts: BufferGeometry[]) {
  const flat = parts.map((g) => (g.index ? g.toNonIndexed() : g))
  const total = flat.reduce((n, g) => n + g.getAttribute('position').count, 0)
  const out = new BufferGeometry()
  for (const name of ['position', 'normal', 'color']) {
    const data = new Float32Array(total * 3)
    let offset = 0
    for (const g of flat) {
      const attr = g.getAttribute(name)
      data.set(attr.array as Float32Array, offset)
      offset += attr.count * 3
    }
    out.setAttribute(name, new BufferAttribute(data, 3))
  }
  for (const g of new Set([...parts, ...flat])) g.dispose()
  return out
}

function dotTexture() {
  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.85)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

function pollenGeometry(count: number) {
  const palette = ['#D9A441', '#D9A441', '#D9A441', '#64BCB0', '#64BCB0', '#B4472B'].map((c) => new Color(c))
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // cáscara esférica achatada alrededor de la flor
    const r = 1.6 + Math.random() * 1.4
    const a = Math.random() * Math.PI * 2
    positions[i * 3] = Math.cos(a) * r
    positions[i * 3 + 1] = (Math.random() - 0.4) * 2.6
    positions[i * 3 + 2] = Math.sin(a) * r
    palette[i % palette.length].toArray(colors, i * 3)
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(positions, 3))
  geo.setAttribute('color', new BufferAttribute(colors, 3))
  return geo
}

/** Tallo, hojas, estambres, pistilo y estigma: todo lo que no se mueve respecto de la flor. */
function staticGeometry() {
  const parts: BufferGeometry[] = []
  const m = new Matrix4()
  const r = new Matrix4()

  parts.push(tint(new CylinderGeometry(0.045, 0.08, 10, 6, 1, true).translate(0, -5, 0), '#415521'))

  const leaf = { length: 2.3, width: 0.26, startAngle: 0.25, curl: 0.9, cup: 0.2, segU: 8, segV: 2, palette: ['#415521', '#5E7A2A', '#97AD3D', '#34451A'] as Palette }
  ;[0, 2.2, 4.1].forEach((a, i) => {
    m.makeRotationY(a).multiply(r.makeTranslation(0, -0.9 - i * 0.45, 0)).multiply(new Matrix4().makeRotationX(0.1 + i * 0.12))
    parts.push(petalGeometry(leaf).applyMatrix4(m))
  })

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6
    const spread = 0.48 + (i % 2) * 0.08
    const end = new Vector3(Math.sin(a) * spread, 1.02 + (i % 2) * 0.08, Math.cos(a) * spread)
    const curve = new QuadraticBezierCurve3(new Vector3(0, 0.05, 0), new Vector3(Math.sin(a) * 0.12, 0.65, Math.cos(a) * 0.12), end)
    parts.push(tint(new TubeGeometry(curve, 5, 0.014, 3, false), '#F4E6C8'))
    // mismo giro que antes (Euler XYZ: x = π/2, z = a + π/2 → Rx · Rz)
    m.makeTranslation(end.x, end.y, end.z).multiply(r.makeRotationX(Math.PI / 2)).multiply(new Matrix4().makeRotationZ(a + Math.PI / 2))
    parts.push(tint(new CapsuleGeometry(0.035, 0.12, 1, 4).applyMatrix4(m), '#8A3B1E'))
  }
  const pistil = new QuadraticBezierCurve3(new Vector3(0, 0.05, 0), new Vector3(0.05, 0.7, 0.02), new Vector3(-0.04, 1.22, 0.08))
  parts.push(tint(new TubeGeometry(pistil, 6, 0.022, 4, false), '#F4E6C8'))
  // el estigma era emisivo: el color ya viene "encendido"
  parts.push(tint(new IcosahedronGeometry(0.06, 1).translate(-0.04, 1.24, 0.08), '#86D6CB'))

  for (const g of parts) g.deleteAttribute('uv')
  return merge(parts)
}

/** Resorte amortiguado (semi-implícito): con poca fricción rebota, con la justa no se pasa. */
type Spring = { x: number; v: number }
function stepSpring(s: Spring, target: number, k: number, c: number, dt: number) {
  s.v += (-k * (s.x - target) - c * s.v) * dt
  s.x += s.v * dt
}

export type LilyOptions = {
  /** elemento que recibe los gestos (la caja de la flor) */
  hitArea: HTMLElement
  /** contenedor donde se monta el canvas */
  container: HTMLElement
  onReady?: () => void
}

export function createLily({ hitArea, container, onReady }: LilyOptions) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = matchMedia('(pointer: coarse)').matches
  const lowPower = (navigator.hardwareConcurrency ?? 4) <= 4 || (coarse && matchMedia('(max-width: 768px)').matches)
  const deviceDpr = () => Math.min(window.devicePixelRatio || 1, MAX_DPR)

  // ── renderer, escena y cámara ────────────────────────────────────────────
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none'
  container.appendChild(canvas)
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    // con pixel ratio 2 el serrucho no se ve: el antialias solo se paga en pantallas de menos
    // densidad, y no en equipos de bajo consumo (el MSAA es lo más caro de este dibujo)
    antialias: !lowPower && deviceDpr() < 2,
    stencil: false,
    powerPreference: 'default',
  })
  let pixelRatio = deviceDpr()
  renderer.setPixelRatio(pixelRatio)
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = ACESFilmicToneMapping

  const scene = new Scene()
  const camera = new PerspectiveCamera(54.6, 1, 0.1, 50)
  camera.position.set(0, -0.71, 5.6)
  camera.lookAt(0, -0.81, 0)

  scene.add(new HemisphereLight('#FFF4E6', '#C9A68C', 1.25))
  scene.add(new AmbientLight('#FFE9DA', 0.35))
  const key = new DirectionalLight('#FFE8D0', 1.9)
  key.position.set(2.5, 4, 5)
  const rim = new DirectionalLight('#64BCB0', 1.1)
  rim.position.set(-3, 1.5, -3)
  scene.add(key, rim)

  // ── la flor ──────────────────────────────────────────────────────────────
  const material = new MeshLambertMaterial({ vertexColors: true, side: DoubleSide })
  const seg = { segU: 10, segV: 4 }
  const outerGeo = petalGeometry({ length: 1.62, width: 0.4, startAngle: 1.08, curl: 1.9, cup: 0.32, palette: ['#F2CF8E', '#F8E6CF', '#FFF8EF', '#D99A62'], ...seg })
  const innerGeo = petalGeometry({ length: 1.5, width: 0.5, startAngle: 1.18, curl: 1.75, cup: 0.38, palette: ['#F5D79C', '#FBEEDD', '#FFFBF4', '#DFA772'], ...seg })
  const outer = new InstancedMesh(outerGeo, material, 3)
  const inner = new InstancedMesh(innerGeo, material, 3)
  // la flor siempre está en cuadro: sin cálculo de recorte por instancia
  outer.frustumCulled = inner.frustumCulled = false
  const staticGeo = staticGeometry()
  const body = new Mesh(staticGeo, material)

  const root = new Group()
  root.rotation.x = 0.78
  root.position.y = -0.35
  const spinner = new Group()
  spinner.add(body, outer, inner)
  root.add(spinner)
  scene.add(root)

  const dot = dotTexture()
  const pollenGeo = pollenGeometry(coarse ? 40 : 70)
  const pollenMat = new PointsMaterial({ map: dot, vertexColors: true, size: 0.065, sizeAttenuation: true, transparent: true, opacity: 0.85, depthWrite: false })
  const pollen = new Points(pollenGeo, pollenMat)
  scene.add(pollen)

  // ── estado ───────────────────────────────────────────────────────────────
  const spin: Spring = { x: 0, v: 0 } // sigue al dedo, sin pasarse
  let spinTarget = 0
  let inertia = 0 // rad/s al soltar
  const welcome: Spring = { x: 0, v: 0 } // vuelta de bienvenida, con rebote
  let welcomeTarget = 0
  const beat: Spring = { x: 1, v: 0 } // latido de escala
  const kick: Spring = { x: 0, v: 0 } // apertura extra de los pétalos al tocar
  let bloom = 0.35
  let time = 0
  let scroll = 0
  let gone = false
  let pointerX = 0
  let pointerY = 0
  let lastInput = -Infinity // último scroll o movimiento del puntero (ms)
  // gesto en curso (null si no hay dedo/mouse apretado sobre la flor)
  let drag: { id: number; x0: number; y0: number; t0: number; lastX: number; lastT: number; v: number; moved: boolean } | null = null

  const matY = new Matrix4()
  const matT = new Matrix4()
  const matX = new Matrix4()
  const placePetals = (flutter: number) => {
    for (let i = 0; i < 6; i++) {
      const isInner = i >= 3
      const angle = (i % 3) * ((Math.PI * 2) / 3) + (isInner ? Math.PI / 3 : 0)
      const open = (isInner ? -0.42 : -0.3) + bloom * (isInner ? 0.55 : 0.68) + (reducedMotion ? 0 : Math.sin(time * 1.6 + i * 1.3) * flutter)
      matY.makeRotationY(angle).multiply(matT.makeTranslation(0, isInner ? 0.02 : 0, 0.04)).multiply(matX.makeRotationX(open))
      ;(isInner ? inner : outer).setMatrixAt(i % 3, matY)
    }
    outer.instanceMatrix.needsUpdate = true
    inner.instanceMatrix.needsUpdate = true
  }

  const update = (dt: number) => {
    time += dt

    // giro: el objetivo avanza solo (despacio), con el arrastre o con la inercia al soltar
    if (!drag) {
      spinTarget += (reducedMotion ? 0.06 : 0.22) * dt + inertia * dt
      inertia *= Math.exp(-dt * 3.2)
    }
    stepSpring(spin, spinTarget, 150, 24.5, dt)
    // vuelta de bienvenida: resorte con poca fricción (se pasa y vuelve); al asentarse se
    // descuenta la vuelta entera, que a la vista es idéntica
    stepSpring(welcome, welcomeTarget, reducedMotion ? 30 : 38, reducedMotion ? 11 : 6.5, dt)
    if (welcomeTarget !== 0 && Math.abs(welcome.x - welcomeTarget) < 1e-3 && Math.abs(welcome.v) < 1e-3) {
      spin.x += welcomeTarget
      spinTarget += welcomeTarget
      welcome.x = welcomeTarget = 0
    }
    stepSpring(beat, 1, 190, 9, dt)
    stepSpring(kick, 0, 60, 8, dt)

    // floración: base + scroll + el toque
    bloom = MathUtils.damp(bloom, MathUtils.clamp(0.3 + scroll * 0.7, 0, 1) + kick.x * 0.45, 4, dt)
    placePetals(0.025)

    // inclinación hacia el cursor (o hacia donde arrastra el dedo) y respuesta al scroll
    root.rotation.x = MathUtils.damp(root.rotation.x, 0.78 + pointerY * 0.28 - scroll * 0.25, 3.5, dt)
    root.rotation.z = MathUtils.damp(root.rotation.z, -pointerX * 0.22, 3.5, dt)
    root.position.y = MathUtils.damp(root.position.y, -0.35 + scroll * 0.3 + Math.sin(time * 0.8) * 0.04, 4, dt)
    // zoom suave al scrollear (amortiguado, nunca a saltos) por el latido del toque
    root.scale.setScalar(MathUtils.damp(root.scale.x, 1 + scroll * 0.42, 5, dt) * (reducedMotion ? 1 : beat.x))
    spinner.rotation.y = spin.x + welcome.x + scroll * Math.PI * 0.9

    pollen.rotation.y -= dt * (reducedMotion ? 0.01 : 0.05)
    pollen.position.y = Math.sin(time * 0.5) * 0.08
  }

  // ── tamaño ───────────────────────────────────────────────────────────────
  const resize = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    pixelRatio = Math.min(pixelRatio, deviceDpr())
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()

  // ── bucle: solo corre si se ve ─────────────────────────────────────────────
  let raf = 0
  let last = 0
  let visible = true
  let ready = false
  let slow = 0 // cuánto viene costando sostener la página (sube con cada cuadro lento, baja con los buenos)
  let prevRaf = 0
  /** ¿Hay algo que pida fluidez completa? (gesto, inercia, bienvenida, scroll o cursor reciente) */
  const active = (now: number) =>
    drag !== null ||
    Math.abs(inertia) > 0.05 ||
    welcomeTarget !== 0 ||
    Math.abs(beat.x - 1) > 0.002 ||
    Math.abs(kick.x) > 0.005 ||
    now - lastInput < 500
  const loop = (t: number) => {
    raf = requestAnimationFrame(loop)
    // la señal es el ritmo de toda la página (no el de la flor): si no sostiene ~50 fps de forma
    // sostenida, la flor baja un escalón de resolución (2 → 1,5 → 1,25 → 1). Se pierde un poco de
    // nitidez, nunca la fluidez
    if (prevRaf && time > 1) {
      const gap = t - prevRaf
      // un cuadro muy lento (< 30 fps) pesa el doble
      slow = gap > 33 ? slow + 2 : gap > 20 ? slow + 1 : Math.max(0, slow - 1)
      const next = DPR_STEPS.find((d) => d < pixelRatio - 0.01)
      if (slow > 24 && next) {
        pixelRatio = next
        slow = 0
        resize()
      }
    }
    prevRaf = t
    // tope de 60 fps (en pantallas de 120 Hz se dibuja un cuadro sí y otro no); en equipos de
    // bajo consumo, 30 fps mientras la flor solo gira sola: es lenta y no se nota
    const target = lowPower && !active(t) ? IDLE_FRAME_MS : FRAME_MS
    if (last && t - last < target - 2) return
    const elapsed = last ? t - last : FRAME_MS
    last = t
    update(Math.min(elapsed / 1000, 0.05))
    renderer.render(scene, camera)
    if (!ready) {
      ready = true
      requestAnimationFrame(() => onReady?.())
    }
  }
  const sync = () => {
    const run = visible && !gone && !document.hidden
    if (run && !raf) {
      last = 0
      raf = requestAnimationFrame(loop)
    } else if (!run && raf) {
      cancelAnimationFrame(raf)
      raf = 0
      prevRaf = 0
    }
  }
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    sync()
  }, { rootMargin: '80px' })
  io.observe(hitArea)

  const onScroll = () => {
    lastInput = performance.now()
    const h = window.innerHeight
    scroll = MathUtils.clamp(window.scrollY / (h * HERO_SCROLL), 0, 1)
    // ya atravesamos el follaje: el lirio es invisible, no se dibuja más
    const wasGone = gone
    gone = window.scrollY > h * LILY_GONE
    if (gone !== wasGone) sync()
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('visibilitychange', sync)

  // si el sistema le quita el contexto WebGL al navegador, se espera a que lo devuelva
  const onLost = (e: Event) => {
    e.preventDefault()
    cancelAnimationFrame(raf)
    raf = 0
    prevRaf = 0
  }
  const onRestored = () => sync()
  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onRestored)

  // ── gestos ───────────────────────────────────────────────────────────────
  const turnPerPx = () => (Math.PI * 1.8) / Math.max(hitArea.clientWidth, 1) // cruzar la flor ≈ 0,9 vueltas

  const onDown = (e: PointerEvent) => {
    if (e.button > 0) return
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: e.timeStamp, lastX: e.clientX, lastT: e.timeStamp, v: 0, moved: false }
    inertia = 0
    spinTarget = spin.x // agarra la flor donde está: no sigue girando sola bajo el dedo
  }
  const onMove = (e: PointerEvent) => {
    lastInput = performance.now()
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.lastX
      const dtm = Math.max(e.timeStamp - drag.lastT, 1)
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > TAP_PX) {
        drag.moved = true
        hitArea.setPointerCapture(e.pointerId)
      }
      spinTarget += dx * turnPerPx()
      // velocidad suavizada (rad/s) para la inercia al soltar
      drag.v = drag.v * 0.6 + ((dx * turnPerPx()) / dtm) * 1000 * 0.4
      drag.lastX = e.clientX
      drag.lastT = e.timeStamp
      // la flor se inclina apenas hacia donde va el dedo
      pointerX = MathUtils.clamp(drag.v * 0.05, -0.6, 0.6)
      return
    }
    if (e.pointerType === 'mouse') {
      // con el mouse, sin arrastrar: se inclina hacia el cursor
      const rect = hitArea.getBoundingClientRect()
      pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1
    }
  }
  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return
    const tap = !drag.moved && e.timeStamp - drag.t0 < TAP_MS
    // si el último movimiento fue hace rato, el dedo ya estaba quieto: sin inercia
    inertia = e.timeStamp - drag.lastT < 80 ? MathUtils.clamp(drag.v, -9, 9) : 0
    drag = null
    if (e.pointerType !== 'mouse') pointerX = pointerY = 0
    if (tap) {
      // bienvenida: una vuelta entera con rebote, un latido y los pétalos que se abren
      welcomeTarget += Math.PI * 2
      beat.v += reducedMotion ? 0 : 0.9 // ~6 % de escala en el pico
      kick.v += reducedMotion ? 1.2 : 2.2
    }
  }
  const onCancel = (e: PointerEvent) => {
    // el navegador tomó el gesto (scroll vertical): se suelta sin inercia ni bienvenida
    if (drag && e.pointerId === drag.id) drag = null
    pointerX = pointerY = 0
  }
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && !drag) pointerX = pointerY = 0
  }
  hitArea.style.touchAction = 'pan-y'
  hitArea.addEventListener('pointerdown', onDown)
  hitArea.addEventListener('pointermove', onMove)
  hitArea.addEventListener('pointerup', onUp)
  hitArea.addEventListener('pointercancel', onCancel)
  hitArea.addEventListener('pointerleave', onLeave)

  sync()

  return {
    /** Libera todo: bucle, observadores, eventos, geometrías, materiales, textura, contexto y canvas. */
    dispose() {
      cancelAnimationFrame(raf)
      raf = 0
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', sync)
      hitArea.removeEventListener('pointerdown', onDown)
      hitArea.removeEventListener('pointermove', onMove)
      hitArea.removeEventListener('pointerup', onUp)
      hitArea.removeEventListener('pointercancel', onCancel)
      hitArea.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      outer.dispose()
      inner.dispose()
      for (const g of [outerGeo, innerGeo, staticGeo, pollenGeo]) g.dispose()
      material.dispose()
      pollenMat.dispose()
      dot.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
