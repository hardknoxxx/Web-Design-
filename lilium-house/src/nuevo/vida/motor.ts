import { Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Texture, WebGLRenderer, type Material } from 'three'

/*
 * Motor de "vida" para la flora y fauna ilustradas, en three.js puro (sin React en el bucle).
 *
 * Cada pieza ya está dibujada en SVG dentro de la página (es también el respaldo sin WebGL). El motor la
 * rasteriza a una textura y la monta en un plano de una cámara ortográfica en píxeles, en el mismo lugar
 * exacto. Desde ahí se mueve:
 * - planta: se mece con un viento de ráfagas (vertex shader: la base queda firme, la punta se dobla),
 *   se agita cuando la página se scrollea rápido y se aparta del cursor que pasa cerca;
 * - mariposa: dos alas (mitades de la textura) que baten sobre el cuerpo mientras pasea en curvas;
 * - picaflor: suspendido con un temblor rápido, y cada tanto se mueve de golpe a otra flor;
 * - salto (tucán, hornero): respira, inclina el cuerpo y pega saltitos con estiramiento y aplaste;
 * - caminata (coatí): cruza la escena al paso, con trote, y se frena a olfatear.
 *
 * Solo dibuja mientras la escena está en pantalla y la pestaña visible; `dispose()` libera todo.
 */

export type Clase = 'planta' | 'mariposa' | 'picaflor' | 'salto' | 'caminata'
export type PiezaDom = { el: HTMLElement; clase: Clase; fase: number }

const VERT = /* glsl */ `
uniform float uTime;
uniform float uSway;
uniform float uPhase;
uniform float uPush;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  float h = uv.y;
  // ráfagas: tres senos de periodos primos, para que el viento no se repita a la vista
  float w = sin(uTime * 1.1 + uPhase) * 0.55 + sin(uTime * 2.3 + uPhase * 1.7) * 0.25 + sin(uTime * 0.53 + uPhase * 0.4) * 0.45;
  float bend = (w * uSway + uPush) * h * h;
  p.x += bend;
  p.y -= abs(bend) * 0.12 * h;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`

const FRAG = /* glsl */ `
uniform sampler2D map;
uniform float uAlpha;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(map, vUv);
  gl_FragColor = vec4(c.rgb, c.a * uAlpha);
}`

type Actor = {
  el: HTMLElement
  clase: Clase
  fase: number
  x: number
  y: number
  w: number
  h: number
  meshes: Mesh[]
  mats: ShaderMaterial[]
  // estado propio de cada comportamiento
  hopAt: number
  dartFrom: [number, number]
  dartTo: [number, number]
  dartStart: number
  dartNext: number
  walkX: number
}

const smooth = (t: number) => t * t * (3 - 2 * t)

function rasterize(svg: SVGSVGElement, w: number, h: number, dpr: number): Promise<HTMLImageElement> {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('width', String(Math.round(w * dpr)))
  clone.setAttribute('height', String(Math.round(h * dpr)))
  clone.removeAttribute('class')
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone))
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function createVida(container: HTMLElement, canvas: HTMLCanvasElement, piezas: PiezaDom[], onReady: () => void) {
  const narrow = innerWidth < 768
  const dpr = Math.min(devicePixelRatio || 1, narrow ? 1.5 : 2)
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power', premultipliedAlpha: true })
  renderer.setPixelRatio(dpr)
  const scene = new Scene()
  const camera = new OrthographicCamera(0, 1, 0, -1, -10, 10)
  const textures: Texture[] = []
  const geometries: PlaneGeometry[] = []
  const materials: Material[] = []

  let W = 0
  let H = 0
  const box = container.getBoundingClientRect()
  const actors: Actor[] = []

  for (const p of piezas) {
    const svg = p.el.querySelector('svg')
    const r = p.el.getBoundingClientRect()
    if (!svg || !r.width) continue
    const img = await rasterize(svg, r.width, r.height, dpr)
    const tex = new Texture(img)
    tex.needsUpdate = true
    textures.push(tex)
    const a: Actor = {
      el: p.el,
      clase: p.clase,
      fase: p.fase,
      x: r.left - box.left + r.width / 2,
      y: r.top - box.top + r.height,
      w: r.width,
      h: r.height,
      meshes: [],
      mats: [],
      hopAt: 1.2 + p.fase * 2,
      dartFrom: [0, 0],
      dartTo: [0, 0],
      dartStart: -1,
      dartNext: 1.5 + p.fase,
      walkX: r.left - box.left + r.width / 2,
    }
    const mat = () => {
      const m = new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthTest: false,
        uniforms: { map: { value: tex }, uTime: { value: 0 }, uSway: { value: 0 }, uPhase: { value: p.fase * 6.28 }, uPush: { value: 0 }, uAlpha: { value: 1 } },
      })
      materials.push(m)
      a.mats.push(m)
      return m
    }
    if (p.clase === 'mariposa') {
      // dos alas: cada una es media textura, con el eje en el cuerpo
      for (const side of [-1, 1]) {
        const g = new PlaneGeometry(r.width / 2, r.height, 1, 1)
        g.translate((side * r.width) / 4, r.height / 2, 0)
        const uv = g.attributes.uv
        for (let i = 0; i < uv.count; i++) uv.setX(i, side < 0 ? uv.getX(i) * 0.5 : 0.5 + uv.getX(i) * 0.5)
        geometries.push(g)
        const m = new Mesh(g, mat())
        a.meshes.push(m)
        scene.add(m)
      }
    } else {
      const seg = p.clase === 'planta' ? 12 : 1
      const g = new PlaneGeometry(r.width, r.height, 1, seg)
      g.translate(0, r.height / 2, 0)
      geometries.push(g)
      const m = new Mesh(g, mat())
      a.meshes.push(m)
      scene.add(m)
    }
    actors.push(a)
  }

  // el lienzo cubre solo la franja donde hay piezas (más su margen de movimiento), no toda la sección:
  // menos píxeles que limpiar y pintar por cuadro
  const resize = () => {
    W = container.clientWidth
    H = container.clientHeight
    let top = H
    let bottom = 0
    for (const a of actors) {
      top = Math.min(top, a.y - a.h - 90)
      bottom = Math.max(bottom, a.y + 30)
    }
    top = Math.max(0, Math.floor(top))
    bottom = Math.min(H, Math.ceil(bottom))
    const band = Math.max(1, bottom - top)
    canvas.style.top = `${top}px`
    canvas.style.height = `${band}px`
    renderer.setSize(W, band, false)
    camera.left = 0
    camera.right = W
    camera.top = -top
    camera.bottom = -bottom
    camera.updateProjectionMatrix()
  }
  resize()

  // viento extra cuando la página se mueve rápido; el cursor cercano empuja las hojas
  let gust = 0
  let lastY = scrollY
  let px = -1e4
  let py = -1e4
  const onPointer = (e: PointerEvent) => {
    const b = container.getBoundingClientRect()
    px = e.clientX - b.left
    py = e.clientY - b.top
  }

  let t0 = performance.now()
  let last = 0
  let lastDraw = -1
  let raf = 0
  // en el teléfono la fauna se dibuja a 30 cuadros: el movimiento es lento y el scroll queda con todo el resto
  const minStep = narrow ? 1 / 30 - 0.004 : 0
  let running = false
  let ramp = 0

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const t = (now - t0) / 1000
    if (t - lastDraw < minStep) return
    lastDraw = t
    const dt = Math.min(0.05, Math.max(0, t - last))
    last = t
    ramp = Math.min(1, ramp + 0.02)
    const v = Math.abs(scrollY - lastY)
    lastY = scrollY
    gust += (Math.min(v / 30, 1) - gust) * 0.08

    for (const a of actors) {
      const m0 = a.meshes[0]
      for (const m of a.mats) m.uniforms.uTime.value = t
      if (a.clase === 'planta') {
        const near = Math.max(0, 1 - Math.hypot(px - a.x, py - (a.y - a.h * 0.6)) / (a.w * 1.2 + 80))
        const push = Math.sign(a.x - px) * near * a.w * 0.18
        const u = a.mats[0].uniforms
        u.uSway.value = a.w * 0.05 * (1 + gust * 1.6) * ramp
        u.uPush.value += (push - u.uPush.value) * 0.08
        m0.position.set(a.x, -a.y, 0)
      } else if (a.clase === 'mariposa') {
        const k = t * 0.45 + a.fase * 9
        // pasea cerca de donde está dibujada (radio proporcional a su tamaño)
        const rx = a.w * 0.9
        const x = a.x + Math.sin(k) * rx + Math.sin(k * 2.3) * rx * 0.3
        const y = a.y + Math.sin(k * 1.4) * rx * 0.5 + Math.sin(t * 2.2 + a.fase) * 3
        // batido con pausas: planea un instante cada tanto
        const beat = Math.sin(t * 15 + a.fase * 4)
        const glide = Math.sin(t * 0.9 + a.fase * 3) > 0.75 ? 0.35 : 1
        const open = 0.18 + 0.82 * Math.abs(beat * glide + (1 - glide) * 0.8)
        const tilt = Math.cos(k) * 0.25
        for (const m of a.meshes) {
          m.position.set(x, -y, 0)
          m.rotation.z = tilt
          m.scale.x = open
        }
      } else if (a.clase === 'picaflor') {
        // suspendido, y cada tanto un desplazamiento seco a otro punto cercano (0,35 s)
        if (t > a.dartNext) {
          const e0 = smooth(Math.min(1, Math.max(0, (t - a.dartStart) / 0.35)))
          a.dartFrom = [a.dartFrom[0] + (a.dartTo[0] - a.dartFrom[0]) * e0, a.dartFrom[1] + (a.dartTo[1] - a.dartFrom[1]) * e0]
          a.dartTo = [Math.sin(t * 7.3 + a.fase * 11) * a.w * 0.4, Math.cos(t * 5.1 + a.fase * 3) * a.h * 0.3]
          a.dartStart = t
          a.dartNext = t + 1.8 + ((a.fase * 13 + t * 3.7) % 1.6)
        }
        const e = smooth(Math.min(1, Math.max(0, (t - a.dartStart) / 0.35)))
        const dx = a.dartFrom[0] + (a.dartTo[0] - a.dartFrom[0]) * e
        const dy = a.dartFrom[1] + (a.dartTo[1] - a.dartFrom[1]) * e
        m0.position.set(a.x + dx, -(a.y + dy + Math.sin(t * 22) * 1.4), 0)
        m0.rotation.z = (a.dartTo[0] - a.dartFrom[0]) * 0.0008 * (1 - e) + Math.sin(t * 1.3) * 0.05
      } else if (a.clase === 'salto') {
        // un saltito de 0,5 s cada 2–4 s: se agacha, se estira en el aire y se aplasta al caer
        if (t > a.hopAt + 0.7) a.hopAt = t + 2 + ((a.fase * 7 + t * 1.3) % 2.2)
        const hp = (t - a.hopAt) / 0.5
        const inHop = hp > 0 && hp < 1
        const air = inHop ? Math.sin(hp * Math.PI) : 0
        const crouch = (x: number) => Math.max(0, 1 - Math.abs(x) / 0.12)
        const stretch = 1 + air * 0.07 - 0.08 * (crouch(hp) + crouch(hp - 1))
        const breathe = 1 + Math.sin(t * 2.4 + a.fase * 5) * 0.012
        m0.position.set(a.x, -(a.y - air * a.h * 0.12), 0)
        m0.scale.set(1 / Math.sqrt(stretch), stretch * breathe, 1)
        m0.rotation.z = Math.sin(t * 0.8 + a.fase * 2) * 0.05 + air * 0.06
      } else {
        // caminata: avanza con paso, frena a olfatear y sale por el otro lado
        const cycle = 9
        const local = (t + a.fase * cycle) % cycle
        const walking = local < 6.8
        const speed = walking ? Math.max(40, W / 11) : 0
        a.walkX += speed * dt
        if (a.walkX > W + a.w) a.walkX = -a.w
        const step = walking ? Math.abs(Math.sin(t * 9)) : 0
        m0.position.set(a.walkX, -(a.y - step * 3), 0)
        m0.rotation.z = walking ? Math.sin(t * 9) * 0.02 : -0.06 + Math.sin(t * 6) * 0.015
      }
    }
    renderer.render(scene, camera)
  }

  const start = () => {
    if (running) return
    running = true
    lastY = scrollY
    addEventListener('pointermove', onPointer, { passive: true })
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    if (!running) return
    running = false
    cancelAnimationFrame(raf)
    removeEventListener('pointermove', onPointer)
  }

  let visible = false
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible && !document.hidden) start()
    else stop()
  })
  io.observe(container)
  const onVis = () => (document.hidden ? stop() : visible && start())
  document.addEventListener('visibilitychange', onVis)
  const ro = new ResizeObserver(() => {
    const b = container.getBoundingClientRect()
    for (const a of actors) {
      const r = a.el.getBoundingClientRect()
      a.x = r.left - b.left + r.width / 2
      a.y = r.top - b.top + r.height
    }
    resize()
  })
  ro.observe(container)

  // primer cuadro antes de mostrarse: el cambio de SVG a WebGL no se nota
  t0 = performance.now()
  frame(t0)
  cancelAnimationFrame(raf)
  onReady()

  return () => {
    stop()
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', onVis)
    textures.forEach((x) => x.dispose())
    geometries.forEach((x) => x.dispose())
    materials.forEach((x) => x.dispose())
    renderer.dispose()
    renderer.forceContextLoss()
  }
}
