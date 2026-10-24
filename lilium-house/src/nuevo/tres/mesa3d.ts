import {
  CanvasTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  OrthographicCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
  type MeshStandardMaterial,
} from 'three'
import { liberar, MODELOS } from './objetos'

/*
 * Los platos de la mesa giratoria en 3D (three.js puro, sin React en el bucle).
 *
 * Cámara ortográfica en píxeles, como una foto de producto: cada plato se ubica en el mismo lugar que calcula
 * la mesa (x, y, escala) y se ve levemente desde arriba, sin deformación de perspectiva. Cada uno gira sobre su
 * eje (en reposo, al viajar y al tocarlo) y se "pinta": lejos del frente queda casi sin color, como el mantel
 * para colorear, y se satura al llegar adelante. Un shader corto agrega esa saturación a los materiales.
 */

export type Pose = { x: number; y: number; s: number; d: number; spin: number }

const INCLINACION = 0.52 // radianes: cuánto se ve la parte de arriba del plato
const DIAMETRO = 1.68 // diámetro del plato 3D en unidades del modelo (≈ el del dibujo plano que reemplaza)

function sombra() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64)
  grad.addColorStop(0, 'rgba(10,30,28,0.55)')
  grad.addColorStop(1, 'rgba(10,30,28,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

export function createMesa3D(canvas: HTMLCanvasElement, ids: string[]) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false })
  renderer.toneMapping = NeutralToneMapping
  renderer.toneMappingExposure = 1.05
  const scene = new Scene()
  const camera = new OrthographicCamera(0, 1, 0, -1, -4000, 4000)
  scene.add(new HemisphereLight('#FFF8EC', '#24504A', 1.25))
  const sol = new DirectionalLight('#FFF1DC', 2.4)
  sol.position.set(-0.6, 1.2, 1)
  scene.add(sol)

  const texSombra = sombra()
  const matSombra = new MeshBasicMaterial({ map: texSombra, transparent: true, depthWrite: false })
  const geoSombra = new PlaneGeometry(2.3, 2.3)

  type Item = { raiz: Group; giro: Group; sat: { value: number }; entrada: { y: number; s: number; o: number } }
  const items: Item[] = ids.map((id, i) => {
    const { grupo, materiales } = MODELOS[id]()
    const sat = { value: 1 }
    for (const m of materiales) agregarSaturacion(m, sat)
    const raiz = new Group()
    const inclinado = new Group()
    inclinado.rotation.x = INCLINACION
    const giro = new Group()
    giro.add(grupo)
    const sh = new Mesh(geoSombra, matSombra)
    sh.rotation.x = -Math.PI / 2
    sh.position.y = -0.005
    giro.add(sh)
    inclinado.add(giro)
    raiz.add(inclinado)
    raiz.userData.i = i
    scene.add(raiz)
    return { raiz, giro, sat, entrada: { y: 0, s: 1, o: 1 } }
  })

  let W = 1
  let H = 1
  let px = 1
  const resize = (w: number, h: number, plato: number) => {
    W = w
    H = h
    px = plato / DIAMETRO
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, w < 768 ? 1.75 : 2))
    renderer.setSize(w, h, false)
    camera.right = w
    camera.bottom = -h
    camera.updateProjectionMatrix()
  }

  /** Dibuja un cuadro: `poses` en píxeles (centro del plato), `t` en segundos para el giro en reposo. */
  const render = (poses: Pose[], t: number) => {
    poses.forEach((p, i) => {
      const it = items[i]
      const e = it.entrada
      const a = Math.abs(p.d)
      it.raiz.position.set(p.x, -(p.y - e.y), -a * 100)
      it.raiz.scale.setScalar(px * p.s * e.s)
      it.raiz.visible = e.o > 0.01 && a < 3
      // gira sobre su eje: un poco en reposo, al viajar con la mesa y cuando lo tocan
      it.giro.rotation.y = t * 0.32 + i * 0.9 - p.d * 0.9 + (p.spin * Math.PI) / 180
      it.sat.value = 0.5 + 0.5 * Math.max(0, 1 - a * 1.1)
    })
    renderer.render(scene, camera)
  }

  const ray = new Raycaster()
  const ndc = new Vector2()
  /** Índice del plato bajo el punto (coordenadas de pantalla), o null. */
  const pick = (clientX: number, clientY: number) => {
    const r = canvas.getBoundingClientRect()
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    const hit = ray.intersectObjects(
      items.map((x) => x.raiz),
      true,
    )[0]
    let o: import('three').Object3D | null = hit?.object ?? null
    while (o && o.userData.i === undefined) o = o.parent
    return o ? (o.userData.i as number) : null
  }

  const dispose = () => {
    for (const it of items) liberar(it.raiz)
    texSombra.dispose()
    geoSombra.dispose()
    matSombra.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }

  return { resize, render, pick, dispose, entradas: items.map((x) => x.entrada), get size() { return { W, H } } }
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
