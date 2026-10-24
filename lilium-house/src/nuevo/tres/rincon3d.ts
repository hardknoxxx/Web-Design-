import {
  BoxGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  NeutralToneMapping,
  Path,
  PerspectiveCamera,
  QuadraticBezierCurve3,
  Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  SRGBColorSpace,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
} from 'three'
import { cafeDeEspecialidad, COLOR, liberar } from './objetos'

/*
 * El rincón verde de Lilium, en 3D: el mostrador de madera con lo que hay en cada rincón del local.
 * Una monstera en maceta, un florero con lirios (la flor del nombre), un helecho, el vaso con los lápices para
 * pintar el mantel y un café. Todo tiene un lugar donde apoyarse: nada flota.
 * Lo que vive: las hojas se mecen, los lirios cabecean, un picaflor visita las flores y una mariposa da vueltas.
 * Solo dibuja con la escena en pantalla; `dispose()` libera todo.
 */

const mat = (color: string, roughness = 0.6, extra: Partial<MeshStandardMaterial> = {}) =>
  Object.assign(new MeshStandardMaterial({ color, roughness }), extra)

function lathe(perfil: [number, number][], seg = 40) {
  return new LatheGeometry(
    perfil.map(([x, y]) => new Vector2(x, y)),
    seg,
  )
}

/** Dobla una geometría plana (en XY) hacia Z a lo largo de su largo: hojas y pétalos con curva. */
function curvar(g: BufferGeometry, largo: number, cuanto: number, copa = 0) {
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const t = y / largo
    p.setZ(i, p.getZ(i) + cuanto * t * t + copa * x * x)
  }
  g.computeVertexNormals()
  return g
}

function maceta(radio: number, alto: number, color: string) {
  const g = new Group()
  const cuerpo = new Mesh(
    lathe([
      [0, 0],
      [radio * 0.72, 0],
      [radio, alto * 0.92],
      [radio * 1.08, alto * 0.94],
      [radio * 1.08, alto],
      [radio * 0.94, alto],
      [radio * 0.9, alto * 0.9],
      [0, alto * 0.9],
    ]),
    mat(color, 0.4),
  )
  const tierra = new Mesh(new CylinderGeometry(radio * 0.9, radio * 0.9, 0.02, 32), mat('#3B2A1E', 0.95))
  tierra.position.y = alto * 0.86
  g.add(cuerpo, tierra)
  return g
}

function texturaMadera() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#A26E46'
  g.fillRect(0, 0, 512, 128)
  for (let i = 0; i < 46; i++) {
    g.strokeStyle = `rgba(${90 + (i % 5) * 8}, ${55 + (i % 4) * 6}, 30, ${0.18 + (i % 3) * 0.06})`
    g.lineWidth = 1 + (i % 3)
    g.beginPath()
    const y = (i / 46) * 128
    g.moveTo(0, y)
    g.bezierCurveTo(170, y + Math.sin(i) * 6, 340, y - Math.cos(i) * 6, 512, y + Math.sin(i * 2) * 3)
    g.stroke()
  }
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

// ------------------------------------------------------------------ plantas

/** Hoja de monstera con sus cortes, sobre un tallo que sale de la maceta. */
function monstera() {
  const planta = new Group()
  planta.add(maceta(0.42, 0.6, COLOR.menta))
  const hojaMat = mat('#3F6E32', 0.5, { side: DoubleSide })
  const tallo = mat('#4F6B2A', 0.6)
  const hojas: { pivote: Group; fase: number }[] = []
  const forma = () => {
    const s = new Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(-0.62, 0.05, -0.72, 0.72, -0.08, 1.02)
    s.lineTo(0, 0.96)
    s.lineTo(0.08, 1.02)
    s.bezierCurveTo(0.72, 0.72, 0.62, 0.05, 0, 0)
    // los cortes de la monstera, a los dos lados de la nervadura
    for (const [x, y, w] of [
      [-0.32, 0.36, 0.06],
      [-0.36, 0.6, 0.05],
      [0.32, 0.4, 0.06],
      [0.36, 0.64, 0.05],
    ]) {
      const h = new Path()
      h.absellipse(x, y, w * 2.4, w, 0, Math.PI * 2, false, x < 0 ? 0.5 : -0.5)
      s.holes.push(h)
    }
    return s
  }
  const geo = curvar(new ShapeGeometry(forma(), 14), 1, -0.25, -0.35)
  const conf: [number, number, number, number][] = [
    // ángulo alrededor, inclinación, largo del tallo, escala
    [0.2, 0.5, 0.9, 0.62],
    [2.1, 0.62, 0.75, 0.55],
    [3.9, 0.55, 1.0, 0.66],
    [5.2, 0.7, 0.62, 0.5],
    [1.2, 0.3, 1.15, 0.6],
  ]
  conf.forEach(([giro, incl, largo, esc], i) => {
    const pivote = new Group()
    pivote.position.y = 0.55
    pivote.rotation.y = giro
    const fin = new Vector3(0, largo, Math.sin(incl) * largo * 0.8)
    const curva = new QuadraticBezierCurve3(new Vector3(0, 0, 0), new Vector3(0, largo * 0.7, 0), fin)
    pivote.add(new Mesh(new TubeGeometry(curva, 10, 0.022, 6), tallo))
    const hoja = new Mesh(geo, hojaMat)
    hoja.position.copy(fin)
    hoja.rotation.x = incl + 0.4
    hoja.scale.setScalar(esc)
    pivote.add(hoja)
    planta.add(pivote)
    hojas.push({ pivote, fase: i * 1.3 })
  })
  return { planta, hojas }
}

function helecho() {
  const planta = new Group()
  planta.add(maceta(0.3, 0.42, COLOR.ceramica))
  const hojaMat = mat(COLOR.hojaClara, 0.65, { side: DoubleSide })
  const folio = new ShapeGeometry(
    (() => {
      const s = new Shape()
      s.moveTo(0, 0)
      s.quadraticCurveTo(0.05, 0.03, 0.11, 0)
      s.quadraticCurveTo(0.05, -0.03, 0, 0)
      return s
    })(),
  )
  const frondas: { pivote: Group; fase: number }[] = []
  for (let f = 0; f < 7; f++) {
    const pivote = new Group()
    pivote.position.y = 0.4
    pivote.rotation.y = (f / 7) * Math.PI * 2
    const largo = 0.75 + (f % 3) * 0.12
    const curva = new QuadraticBezierCurve3(new Vector3(0, 0, 0), new Vector3(0, largo * 0.8, largo * 0.2), new Vector3(0, largo * 0.55, largo * 0.85))
    pivote.add(new Mesh(new TubeGeometry(curva, 12, 0.008, 4), hojaMat))
    for (let k = 1; k < 20; k++) {
      const t = k / 20
      const p = curva.getPoint(t)
      const tan = curva.getTangent(t)
      const tam = 1 - t * 0.7
      for (const lado of [-1, 1]) {
        const m = new Mesh(folio, hojaMat)
        m.position.copy(p)
        m.lookAt(p.clone().add(tan))
        m.rotateY((lado * Math.PI) / 2)
        m.scale.setScalar(tam * 2.4)
        pivote.add(m)
      }
    }
    planta.add(pivote)
    frondas.push({ pivote, fase: f * 0.9 })
  }
  return { planta, hojas: frondas }
}

/** Lirio blanco: seis tépalos curvados hacia afuera, estambres con anteras y el pistilo verde. */
function lirio() {
  const flor = new Group()
  const tepalo = (() => {
    const s = new Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(-0.11, 0.1, -0.1, 0.32, 0, 0.46)
    s.bezierCurveTo(0.1, 0.32, 0.11, 0.1, 0, 0)
    const g = curvar(new ShapeGeometry(s, 12), 0.46, 0.22, -0.9)
    // garganta cálida y punta blanca
    const p = g.attributes.position
    const col = new Float32Array(p.count * 3)
    const a = new Color('#F2CF8E')
    const b = new Color('#FFFBF4')
    const c = new Color()
    for (let i = 0; i < p.count; i++) {
      c.copy(a).lerp(b, Math.min(1, p.getY(i) / 0.22))
      col.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('color', new Float32BufferAttribute(col, 3))
    return g
  })()
  const petMat = mat('#FFFFFF', 0.5, { side: DoubleSide, vertexColors: true, emissive: new Color('#5A4A32'), emissiveIntensity: 0.35 })
  for (let i = 0; i < 6; i++) {
    // cada tépalo se abre hacia afuera (los lirios abiertos, no pimpollos)
    const m = new Mesh(tepalo, petMat)
    const piv = new Group()
    piv.rotation.y = (i / 6) * Math.PI * 2 + (i % 2) * 0.15
    m.rotation.x = 1.05 + (i % 2) * 0.12
    piv.add(m)
    flor.add(piv)
  }
  const fil = mat('#EADFC6', 0.6)
  const antera = mat('#B4472B', 0.5)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const e = new Group()
    e.rotation.y = a
    e.rotation.x = -0.35
    const f = new Mesh(new CylinderGeometry(0.006, 0.006, 0.3, 5), fil)
    f.position.y = 0.15
    const an = new Mesh(new SphereGeometry(0.022, 8, 6), antera)
    an.scale.set(1, 0.45, 2)
    an.position.y = 0.3
    e.add(f, an)
    flor.add(e)
  }
  const pistilo = new Mesh(new CylinderGeometry(0.008, 0.008, 0.34, 5), mat('#C9D88E', 0.5))
  pistilo.position.y = 0.17
  flor.add(pistilo)
  return flor
}

function florero() {
  const g = new Group()
  const vidrio = new Mesh(
    lathe([
      [0, 0],
      [0.2, 0],
      [0.26, 0.2],
      [0.22, 0.5],
      [0.14, 0.72],
      [0.16, 0.78],
      [0.13, 0.78],
      [0.11, 0.72],
      [0.19, 0.5],
      [0.22, 0.2],
      [0, 0.02],
    ]),
    mat('#CFE8E2', 0.08, { transparent: true, opacity: 0.38, depthWrite: false }),
  )
  const agua = new Mesh(new CylinderGeometry(0.2, 0.18, 0.3, 24), mat('#9FD3CA', 0.1, { transparent: true, opacity: 0.35, depthWrite: false }))
  agua.position.y = 0.16
  g.add(agua, vidrio)
  const tallo = mat('#4F6B2A', 0.6)
  const hojaG = curvar(
    new ShapeGeometry(
      (() => {
        const s = new Shape()
        s.moveTo(0, 0)
        s.quadraticCurveTo(0.06, 0.25, 0, 0.55)
        s.quadraticCurveTo(-0.06, 0.25, 0, 0)
        return s
      })(),
      8,
    ),
    0.55,
    0.18,
  )
  const hojaM = mat(COLOR.hoja, 0.6, { side: DoubleSide })
  const flores: { cabeza: Group; fase: number }[] = []
  const conf: [number, number, number][] = [
    [-0.24, 1.55, 0.5],
    [0.1, 1.75, -0.2],
    [0.32, 1.42, 0.35],
  ]
  conf.forEach(([x, alto, z], i) => {
    const fin = new Vector3(x, alto, z * 0.4)
    const curva = new QuadraticBezierCurve3(new Vector3(0, 0.1, 0), new Vector3(x * 0.3, alto * 0.6, 0), fin)
    g.add(new Mesh(new TubeGeometry(curva, 16, 0.018, 6), tallo))
    const h = new Mesh(hojaG, hojaM)
    h.position.copy(curva.getPoint(0.55))
    h.rotation.set(0.4, i * 2, x > 0 ? -0.7 : 0.7)
    g.add(h)
    const cabeza = new Group()
    cabeza.position.copy(fin)
    const fl = lirio()
    fl.rotation.x = 0.5 + i * 0.1
    fl.rotation.z = -x * 1.2
    cabeza.add(fl)
    g.add(cabeza)
    flores.push({ cabeza, fase: i * 1.7 })
  })
  return { florero: g, flores }
}

function vasoDeLapices() {
  const g = new Group()
  const vaso = new Mesh(new CylinderGeometry(0.17, 0.15, 0.4, 24, 1, true), mat(COLOR.borde, 0.7, { side: DoubleSide }))
  vaso.position.y = 0.2
  const fondo = new Mesh(new CylinderGeometry(0.15, 0.15, 0.02, 24), mat(COLOR.borde, 0.7))
  g.add(vaso, fondo)
  const colores = [COLOR.menta, '#B4472B', '#D9A441', '#5B7B5A', '#9C89B8', '#277067']
  colores.forEach((c, i) => {
    const l = new Group()
    const cuerpo = new Mesh(new CylinderGeometry(0.022, 0.022, 0.62, 6), mat(c, 0.5))
    const madera = new Mesh(new ConeGeometry(0.022, 0.06, 6), mat('#F3D9A4', 0.8))
    madera.position.y = 0.34
    const mina = new Mesh(new ConeGeometry(0.008, 0.024, 6), mat(c, 0.4))
    mina.position.y = 0.38
    l.add(cuerpo, madera, mina)
    const a = (i / colores.length) * Math.PI * 2
    l.position.set(Math.cos(a) * 0.07, 0.38, Math.sin(a) * 0.07)
    l.rotation.set(Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.18)
    g.add(l)
  })
  return g
}

// ------------------------------------------------------------------ fauna

function picaflor() {
  const g = new Group()
  const plumaje = mat('#2C7A57', 0.35, { metalness: 0.25 })
  const cuerpo = new Mesh(new SphereGeometry(0.07, 16, 12), plumaje)
  cuerpo.scale.set(1, 0.9, 1.6)
  const cabeza = new Mesh(new SphereGeometry(0.045, 14, 10), plumaje)
  cabeza.position.set(0, 0.04, 0.1)
  const garganta = new Mesh(new SphereGeometry(0.03, 10, 8), mat('#64BCB0', 0.3, { metalness: 0.3 }))
  garganta.position.set(0, 0.01, 0.12)
  const pico = new Mesh(new ConeGeometry(0.008, 0.16, 6), mat('#1A1A1A', 0.4))
  pico.rotation.x = Math.PI / 2
  pico.position.set(0, 0.04, 0.21)
  const cola = new Mesh(new ConeGeometry(0.035, 0.12, 4), mat('#1C3F2E', 0.5))
  cola.rotation.x = -Math.PI / 2 - 0.3
  cola.position.set(0, -0.02, -0.14)
  const alaG = new ShapeGeometry(
    (() => {
      const s = new Shape()
      s.moveTo(0, 0)
      s.quadraticCurveTo(0.08, 0.04, 0.2, 0.02)
      s.quadraticCurveTo(0.1, -0.03, 0, -0.02)
      return s
    })(),
  )
  const alaM = mat('#BFE3DC', 0.4, { side: DoubleSide, transparent: true, opacity: 0.75 })
  const alas = [-1, 1].map((lado) => {
    const pivote = new Group()
    pivote.position.set(lado * 0.05, 0.04, 0.02)
    const a = new Mesh(alaG, alaM)
    a.scale.x = lado
    a.rotation.y = lado * 0.3
    pivote.add(a)
    g.add(pivote)
    return pivote
  })
  g.add(cuerpo, cabeza, garganta, pico, cola)
  return { ave: g, alas }
}

function mariposa() {
  const g = new Group()
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const x = c.getContext('2d')!
  const grad = x.createRadialGradient(20, 64, 4, 20, 64, 120)
  grad.addColorStop(0, '#2F7F75')
  grad.addColorStop(0.55, '#64BCB0')
  grad.addColorStop(1, '#1C4A45')
  x.fillStyle = grad
  x.fillRect(0, 0, 128, 128)
  x.fillStyle = '#FAF7F2'
  for (const [px, py] of [
    [96, 40],
    [104, 70],
    [88, 96],
  ]) {
    x.beginPath()
    x.arc(px, py, 6, 0, Math.PI * 2)
    x.fill()
  }
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  const alaM = new MeshStandardMaterial({ map: tex, side: DoubleSide, roughness: 0.6 })
  const alaG = new ShapeGeometry(
    (() => {
      const s = new Shape()
      s.moveTo(0, 0)
      s.bezierCurveTo(0.05, 0.16, 0.2, 0.2, 0.22, 0.06)
      s.bezierCurveTo(0.24, -0.04, 0.16, -0.16, 0.06, -0.14)
      s.lineTo(0, 0)
      return s
    })(),
  )
  // UV de la textura según la posición (0..0.24 de ancho)
  const uv = alaG.attributes.uv
  const p = alaG.attributes.position
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 0.24, (p.getY(i) + 0.16) / 0.36)
  const alas = [-1, 1].map((lado) => {
    const pivote = new Group()
    const a = new Mesh(alaG, alaM)
    a.scale.x = lado
    pivote.add(a)
    g.add(pivote)
    return pivote
  })
  const cuerpo = new Mesh(new CylinderGeometry(0.008, 0.006, 0.16, 6), mat('#1A1A1A', 0.5))
  cuerpo.rotation.x = Math.PI / 2
  g.add(cuerpo)
  return { bicho: g, alas }
}

// ------------------------------------------------------------------ escena

export function createRincon(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power', stencil: false })
  renderer.toneMapping = NeutralToneMapping
  const scene = new Scene()
  const camera = new PerspectiveCamera(30, 1, 0.1, 100)
  scene.add(new HemisphereLight('#FFF8EC', '#3B2A1E', 1.3))
  const sol = new DirectionalLight('#FFEFD6', 2.3)
  sol.position.set(-3, 6, 4)
  scene.add(sol)

  const raiz = new Group()
  scene.add(raiz)

  // el mostrador
  const madera = texturaMadera()
  const mostrador = new Mesh(new BoxGeometry(12, 0.3, 2.4), [
    mat('#8A5A38', 0.7),
    mat('#8A5A38', 0.7),
    new MeshStandardMaterial({ map: madera, roughness: 0.6 }),
    mat('#6E452B', 0.8),
    new MeshStandardMaterial({ map: madera, roughness: 0.7, color: '#C9A383' }),
    mat('#6E452B', 0.8),
  ])
  mostrador.position.y = -0.15
  raiz.add(mostrador)

  const mon = monstera()
  const fl = florero()
  const hel = helecho()
  const lapices = vasoDeLapices()
  const cafe = cafeDeEspecialidad().grupo
  cafe.scale.setScalar(0.42)
  // disposición: en escritorio a lo ancho del mostrador; en el teléfono, todo más junto para que entre
  const disponer = (angosto: boolean) => {
    const k = angosto ? 0.56 : 1
    mon.planta.position.set(-1.9 * k, 0, -0.3)
    fl.florero.position.set(0.2 * k, 0, -0.1)
    hel.planta.position.set(2.2 * k, 0, -0.35)
    lapices.position.set(angosto ? -0.55 : -0.75, 0, 0.55)
    cafe.position.set(angosto ? 0.72 : 1.15, 0, 0.6)
  }
  disponer(false)
  raiz.add(mon.planta, fl.florero, hel.planta, lapices, cafe)

  const ave = picaflor()
  const bicho = mariposa()
  raiz.add(ave.ave, bicho.bicho)

  let W = 1
  let H = 1
  const resize = (w: number, h: number) => {
    W = w
    H = h
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, w < 768 ? 1.5 : 2))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const angosto = w < 768
    disponer(angosto)
    apuntar()
    // en el teléfono la cámara se aleja y baja la mirada para que entre todo el rincón sin aire de más
    camera.position.set(0, angosto ? 2.0 : 2.2, angosto ? 7.4 : 7.2)
    camera.lookAt(0, angosto ? 0.95 : 0.85, 0)
    camera.fov = angosto ? 40 : 28
    camera.updateProjectionMatrix()
  }

  // destino del picaflor: va de una flor a otra y se queda suspendido
  const objetivos = fl.flores.map(() => new Vector3())
  const apuntar = () => fl.flores.forEach((f, i) => objetivos[i].copy(f.cabeza.position).add(fl.florero.position).add(new Vector3(0.32, 0.05, 0.25)))
  apuntar()
  let destino = 0
  let cambio = 2.5
  const pos = objetivos[0].clone()
  let t0 = performance.now()

  const render = (scroll: number) => {
    const t = (performance.now() - t0) / 1000
    for (const h of mon.hojas) h.pivote.rotation.z = Math.sin(t * 0.9 + h.fase) * 0.035
    for (const h of hel.hojas) h.pivote.rotation.x = Math.sin(t * 1.3 + h.fase) * 0.05
    for (const f of fl.flores) f.cabeza.rotation.z = Math.sin(t * 0.8 + f.fase) * 0.06
    // picaflor: aleteo muy rápido, se mueve de flor en flor
    if (t > cambio) {
      destino = (destino + 1) % objetivos.length
      cambio = t + 2.2 + (destino % 2) * 1.1
    }
    pos.lerp(objetivos[destino], 0.04)
    ave.ave.position.set(pos.x, pos.y + Math.sin(t * 9) * 0.015, pos.z)
    ave.ave.lookAt(objetivos[destino].x - 0.4, objetivos[destino].y, objetivos[destino].z - 0.3)
    const aleteo = Math.sin(t * 70) * 0.9
    ave.alas[0].rotation.z = aleteo
    ave.alas[1].rotation.z = -aleteo
    // mariposa: un óvalo alrededor de la monstera, con aleteo y planeos
    const k = t * 0.5
    const mx = mon.planta.position.x
    bicho.bicho.position.set(mx + Math.cos(k) * 0.9, 1.45 + Math.sin(k * 2) * 0.22, -0.1 + Math.sin(k) * 0.6)
    bicho.bicho.rotation.y = -k + Math.PI
    const ab = Math.sin(t * 13) * (Math.sin(t * 0.7) > 0.8 ? 0.2 : 1)
    bicho.alas[0].rotation.y = 0.2 + ab * 0.9
    bicho.alas[1].rotation.y = -0.2 - ab * 0.9
    // el rincón se acerca apenas mientras entra en pantalla (scroll 0..1)
    raiz.rotation.y = (scroll - 0.5) * 0.18
    renderer.render(scene, camera)
  }

  const dispose = () => {
    liberar(raiz)
    madera.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }
  // compila los shaders en paralelo antes del primer cuadro, para que entrar al rincón no trabe el scroll
  const preparar = () => renderer.compileAsync(scene, camera)
  return { resize, render, dispose, preparar, get tamaño() { return { W, H } }, reiniciar: () => (t0 = performance.now()) }
}

export type Rincon = ReturnType<typeof createRincon>
