import {
  AddEquation,
  CanvasTexture,
  CustomBlending,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HalfFloatType,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  NoBlending,
  OneFactor,
  OrthographicCamera,
  PCFShadowMap,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
  type MeshStandardMaterial,
  type Object3D,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { liberar, MODELOS } from './objetos'

/*
 * Los platos de la mesa giratoria en 3D (three.js puro, sin React en el bucle).
 *
 * Cámara ortográfica en píxeles, como una foto de producto: cada plato se ubica en el mismo lugar que calcula
 * la mesa (x, y, escala) y se ve levemente desde arriba. Luz de estudio: un entorno suave (RoomEnvironment) que
 * da reflejos a la cerámica y un sol con sombras para que la comida se apoye en el plato.
 *
 * Los platos no giran solos: giran cuando la mesa viaja y cuando alguien los arrastra (el ángulo llega en la pose).
 * Si la mesa viaja rápido, el cuadro se arma con varias muestras entre la pose anterior y la actual y se promedia:
 * desenfoque de movimiento real (como el obturador de una cámara), solo mientras dura el movimiento.
 */

export type Pose = {
  x: number
  y: number
  s: number
  /** distancia al frente de la mesa, en platos */
  d: number
  /** giro sobre su eje, en radianes */
  giro: number
  /** inclinación lateral (se ladea al girar rápido), en radianes */
  ladeo: number
}

const INCLINACION = 0.52 // radianes: cuánto se ve la parte de arriba del plato
const DIAMETRO = 1.68 // diámetro del plato 3D en unidades del modelo
const OBTURADOR = 0.9 // fracción del cuadro que "queda abierta" para el desenfoque

function sombra() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64)
  grad.addColorStop(0, 'rgba(10,30,28,0.5)')
  grad.addColorStop(1, 'rgba(10,30,28,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

const VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }'

export function createMesa3D(canvas: HTMLCanvasElement, ids: string[]) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false })
  renderer.toneMapping = NeutralToneMapping
  renderer.toneMappingExposure = 1.02
  renderer.autoClear = false
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFShadowMap
  const scene = new Scene()
  const camera = new OrthographicCamera(0, 1, 0, -1, -20000, 20000)

  // estudio: reflejos suaves del entorno + un sol cálido desde arriba a la izquierda
  const pmrem = new PMREMGenerator(renderer)
  const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()
  scene.environment = entorno
  scene.environmentIntensity = 0.6
  scene.add(new HemisphereLight('#FFF8EC', '#24504A', 0.55))
  const sol = new DirectionalLight('#FFF1DC', 2.1)
  sol.castShadow = true
  sol.shadow.bias = -0.0004
  sol.shadow.normalBias = 1.2
  sol.shadow.radius = 3
  scene.add(sol, sol.target)

  const texSombra = sombra()
  const matSombra = new MeshBasicMaterial({ map: texSombra, transparent: true, depthWrite: false })
  const geoSombra = new PlaneGeometry(2.3, 2.3)
  // volumen invisible para tocar el plato aunque el modelo todavía no haya llegado
  const geoToque = new CylinderGeometry(0.9, 0.9, 0.7, 24)
  const matToque = new MeshBasicMaterial({ visible: false })

  type Estado = { x: number; y: number; z: number; e: number; ry: number; rz: number; viaje: number }
  type Item = {
    raiz: Group
    giro: Group
    sat: { value: number }
    entrada: { y: number; s: number; o: number }
    antes: Estado
    ahora: Estado
    listo: boolean
  }
  const items: Item[] = ids.map((_, i) => {
    const raiz = new Group()
    const inclinado = new Group()
    inclinado.rotation.x = INCLINACION
    const giro = new Group()
    const sh = new Mesh(geoSombra, matSombra)
    sh.rotation.x = -Math.PI / 2
    sh.position.y = -0.005
    giro.add(sh)
    const toque = new Mesh(geoToque, matToque)
    toque.position.y = 0.35
    giro.add(toque)
    inclinado.add(giro)
    raiz.add(inclinado)
    raiz.userData.i = i
    scene.add(raiz)
    const cero = { x: 0, y: 0, z: 0, e: 1, ry: 0, rz: 0, viaje: 0 }
    return { raiz, giro, sat: { value: 1 }, entrada: { y: 0, s: 1, o: 1 }, antes: { ...cero }, ahora: { ...cero }, listo: false }
  })

  /**
   * Arma los modelos de a uno (primero los más cercanos al frente), compilando sus shaders en paralelo y cediendo
   * el hilo entre plato y plato: la página no se traba mientras se pintan las texturas.
   */
  let cancelado = false
  const cargar = async (orden: number[], alLlegar: () => void) => {
    for (const i of orden) {
      if (cancelado) return
      const { grupo, materiales } = MODELOS[ids[i]]()
      for (const m of materiales) agregarSaturacion(m, items[i].sat)
      try {
        await renderer.compileAsync(grupo, camera, scene)
      } catch {
        // sin compilación en paralelo: se compila en el primer cuadro
      }
      if (cancelado) return liberar(grupo)
      items[i].giro.add(grupo)
      items[i].listo = true
      alLlegar()
      await new Promise((r) => setTimeout(r, 16))
    }
  }

  // muestras para el desenfoque: se suman en `acum` y se pasan a pantalla con el tono y el color de salida
  let muestra: WebGLRenderTarget | null = null
  let acum: WebGLRenderTarget | null = null
  const quadEscena = new Scene()
  const quadCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const sumar = new ShaderMaterial({
    uniforms: { t: { value: null }, w: { value: 1 } },
    vertexShader: VERT,
    fragmentShader: 'uniform sampler2D t; uniform float w; varying vec2 vUv; void main() { gl_FragColor = texture2D(t, vUv) * w; }',
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: OneFactor,
    blendDst: OneFactor,
    blendSrcAlpha: OneFactor,
    blendDstAlpha: OneFactor,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })
  const salida = new ShaderMaterial({
    uniforms: { t: { value: null } },
    vertexShader: VERT,
    // el acumulado está premultiplicado y en lineal: se despremultiplica, se aplica tono y sRGB, y se vuelve
    fragmentShader: `uniform sampler2D t; varying vec2 vUv;
      void main() {
        vec4 c = texture2D(t, vUv);
        gl_FragColor = vec4(c.a > 0.0 ? c.rgb / c.a : vec3(0.0), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        gl_FragColor = vec4(gl_FragColor.rgb * c.a, c.a);
      }`,
    blending: NoBlending,
    depthTest: false,
    depthWrite: false,
  })
  const quad = new Mesh(new PlaneGeometry(2, 2), sumar)
  quad.frustumCulled = false
  quadEscena.add(quad)

  let px = 1
  const resize = (w: number, h: number, plato: number) => {
    px = plato / DIAMETRO
    const angosto = w < 768
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, angosto ? 1.75 : 2))
    renderer.setSize(w, h, false)
    camera.right = w
    camera.bottom = -h
    camera.updateProjectionMatrix()
    // el sol cubre todo el lienzo con su sombra
    sol.target.position.set(w / 2, -h * 0.62, 0)
    sol.position.set(w / 2 - 1800, -h * 0.62 + 4400, 2800)
    const c = sol.shadow.camera
    const lado = Math.max(w, h) * 0.75
    c.left = -lado
    c.right = lado
    c.top = lado
    c.bottom = -lado
    c.near = 100
    c.far = 16000
    c.updateProjectionMatrix()
    const mapa = angosto ? 1024 : 2048
    if (sol.shadow.mapSize.x !== mapa) {
      sol.shadow.mapSize.set(mapa, mapa)
      sol.shadow.map?.dispose()
      sol.shadow.map = null
    }
    const tam = renderer.getDrawingBufferSize(new Vector2())
    muestra?.dispose()
    acum?.dispose()
    muestra = new WebGLRenderTarget(tam.x, tam.y, { type: HalfFloatType, samples: 4 })
    acum = new WebGLRenderTarget(tam.x, tam.y, { type: HalfFloatType, depthBuffer: false })
  }

  const aplicar = (it: Item, a: Estado, b: Estado, f: number) => {
    const l = (p: number, q: number) => p + (q - p) * f
    it.raiz.position.set(l(a.x, b.x), l(a.y, b.y), b.z)
    it.raiz.scale.setScalar(l(a.e, b.e))
    it.giro.rotation.y = l(a.ry, b.ry)
    it.raiz.rotation.z = l(a.rz, b.rz)
  }

  /** Dibuja un cuadro: `poses` en píxeles (centro del plato). */
  const render = (poses: Pose[]) => {
    let mov = 0
    poses.forEach((p, i) => {
      const it = items[i]
      const e = it.entrada
      const a = Math.abs(p.d)
      const ahora = it.ahora
      it.antes = { ...ahora }
      ahora.x = p.x
      ahora.y = -(p.y - e.y)
      // cada plato en su propia profundidad (mucho más que lo que mide): nunca se atraviesan entre sí;
      // los de la derecha un escalón más atrás, para que dos platos a la misma distancia del frente tampoco
      ahora.z = -a * 1400 - (p.d > 0 ? 500 : 0)
      ahora.e = px * p.s * e.s
      ahora.viaje = -p.d * 0.9
      ahora.ry = i * 0.9 + ahora.viaje + p.giro
      ahora.rz = p.ladeo
      it.raiz.visible = e.o > 0.01 && a < 3
      it.sat.value = 0.72 + 0.28 * Math.max(0, 1 - a * 1.1)
      if (!it.raiz.visible) return
      // cuánto se movió el borde del plato desde el cuadro anterior, en píxeles
      const radio = (DIAMETRO / 2) * ahora.e
      const b = it.antes
      // solo cuenta el viaje de la mesa: girar un plato a mano no lo desenfoca
      mov = Math.max(mov, Math.abs(ahora.viaje - b.viaje) * radio * 0.55 + Math.hypot(ahora.x - b.x, ahora.y - b.y) + Math.abs(ahora.rz - b.rz) * radio)
    })
    const n = mov > 3 && muestra && acum ? Math.min(10, Math.ceil(mov / 5) + 1) : 1
    if (n === 1) {
      for (const it of items) aplicar(it, it.ahora, it.ahora, 1)
      renderer.setRenderTarget(null)
      renderer.clear()
      renderer.render(scene, camera)
      return
    }
    renderer.setRenderTarget(acum)
    renderer.clear()
    sumar.uniforms.w.value = 1 / n
    renderer.shadowMap.autoUpdate = false
    for (let k = 0; k < n; k++) {
      const f = 1 - OBTURADOR + (OBTURADOR * (k + 0.5)) / n
      for (const it of items) aplicar(it, it.antes, it.ahora, f)
      renderer.shadowMap.needsUpdate = k === 0
      renderer.setRenderTarget(muestra)
      renderer.clear()
      renderer.render(scene, camera)
      renderer.setRenderTarget(acum)
      quad.material = sumar
      sumar.uniforms.t.value = muestra!.texture
      renderer.render(quadEscena, quadCam)
    }
    renderer.shadowMap.autoUpdate = true
    for (const it of items) aplicar(it, it.ahora, it.ahora, 1)
    renderer.setRenderTarget(null)
    quad.material = salida
    salida.uniforms.t.value = acum!.texture
    renderer.render(quadEscena, quadCam)
  }

  const ray = new Raycaster()
  const ndc = new Vector2()
  /** Índice del plato bajo el punto (coordenadas de pantalla), o null. */
  const pick = (clientX: number, clientY: number) => {
    const r = canvas.getBoundingClientRect()
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    const hit = ray.intersectObjects(
      items.filter((x) => x.raiz.visible).map((x) => x.raiz),
      true,
    )[0]
    let o: Object3D | null = hit?.object ?? null
    while (o && o.userData.i === undefined) o = o.parent
    return o ? (o.userData.i as number) : null
  }

  const dispose = () => {
    cancelado = true
    for (const it of items) liberar(it.raiz)
    entorno.dispose()
    texSombra.dispose()
    geoSombra.dispose()
    matSombra.dispose()
    geoToque.dispose()
    matToque.dispose()
    sumar.dispose()
    salida.dispose()
    quad.geometry.dispose()
    muestra?.dispose()
    acum?.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }

  return { resize, render, pick, cargar, dispose, entradas: items.map((x) => x.entrada) }
}

/** Mezcla el color final con su gris según `sat` (0 = sin color, 1 = color pleno). */
function agregarSaturacion(m: MeshStandardMaterial, sat: { value: number }) {
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uSat = sat
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'uniform float uSat;\nvoid main() {')
      .replace(
        '#include <dithering_fragment>',
        '#include <dithering_fragment>\n  float lum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));\n  gl_FragColor.rgb = mix(vec3(lum) * 0.92 + 0.06, gl_FragColor.rgb, uSat);',
      )
  }
}

export type Mesa3D = ReturnType<typeof createMesa3D>
