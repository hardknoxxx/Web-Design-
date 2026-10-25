import {
  CanvasTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  OrthographicCamera,
  PCFShadowMap,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { liberar, MODELOS } from './objetos'

/*
 * Pre-render de los platos (solo para desarrollo, no se publica): cada plato 3D de tres/objetos.ts se fotografía
 * girando sobre su eje, como en un plato giratorio de estudio. La cámara y la luz quedan fijas y el plato gira;
 * cada cuadro sale con fondo transparente y con 2× de supermuestreo para bordes limpios.
 * Lo maneja scripts/sprites/render.cjs (Playwright), que guarda los cuadros; build-sheets.py arma las hojas.
 */

const INCLINACION = 0.52
// ancho visible en unidades del modelo (el plato mide ~1,74) y proporción del cuadro 4:3
const ANCHO = 2.1
const ALTO = ANCHO * 0.75

function sombra() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(128, 128, 8, 128, 128, 128)
  grad.addColorStop(0, 'rgba(10,30,28,0.4)')
  grad.addColorStop(0.55, 'rgba(10,30,28,0.14)')
  grad.addColorStop(0.92, 'rgba(10,30,28,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

async function renderPlato(id: string, cuadros: number, w: number, h: number) {
  const k = 2
  const canvas = document.createElement('canvas')
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(1)
  renderer.setSize(w * k, h * k, false)
  renderer.toneMapping = NeutralToneMapping
  renderer.toneMappingExposure = 1.02
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFShadowMap
  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.6
  scene.add(new HemisphereLight('#FFF8EC', '#24504A', 0.55))
  const sol = new DirectionalLight('#FFF1DC', 2.1)
  sol.position.set(-1.6, 4, 2.6)
  sol.castShadow = true
  sol.shadow.mapSize.set(2048, 2048)
  sol.shadow.bias = -0.0004
  sol.shadow.normalBias = 0.01
  sol.shadow.radius = 4
  Object.assign(sol.shadow.camera, { left: -1.4, right: 1.4, top: 1.4, bottom: -1.4, near: 0.1, far: 12 })
  scene.add(sol)

  // cámara de producto: mira el centro del plato desde arriba y adelante, con la inclinación de la mesa
  const camera = new OrthographicCamera(-ANCHO / 2, ANCHO / 2, ALTO * 0.62, -ALTO * 0.38, 0.1, 40)
  camera.position.set(0, Math.sin(INCLINACION) * 10, Math.cos(INCLINACION) * 10)
  camera.lookAt(0, 0, 0)
  camera.updateMatrixWorld()

  const giro = new Group()
  scene.add(giro)
  const { grupo } = MODELOS[id]()
  giro.add(grupo)
  const piso = new Mesh(new PlaneGeometry(2.04, 2.04), new MeshBasicMaterial({ map: sombra(), transparent: true, depthWrite: false }))
  piso.rotation.x = -Math.PI / 2
  piso.position.y = -0.004
  scene.add(piso)

  // la sombra se apaga antes del borde del cuadro: nada queda cortado en rectángulo
  // dónde cae el centro del plato en el cuadro (para apoyarlo en el borde de la mesa)
  const centro = new Vector3(0, 0, 0).project(camera)
  const salida = document.createElement('canvas')
  salida.width = w
  salida.height = h
  const g = salida.getContext('2d')!
  g.imageSmoothingQuality = 'high'
  const urls: string[] = []
  for (let f = 0; f < cuadros; f++) {
    giro.rotation.y = (f / cuadros) * Math.PI * 2
    renderer.render(scene, camera)
    g.clearRect(0, 0, w, h)
    g.drawImage(canvas, 0, 0, w, h)
    urls.push(salida.toDataURL('image/png'))
    await new Promise((r) => setTimeout(r, 0))
  }
  liberar(grupo)
  renderer.dispose()
  return { urls, centro: { x: (centro.x + 1) / 2, y: (1 - centro.y) / 2 } }
}

declare global {
  interface Window {
    renderPlato: typeof renderPlato
    ids: string[]
  }
}
window.renderPlato = renderPlato
window.ids = Object.keys(MODELOS)
