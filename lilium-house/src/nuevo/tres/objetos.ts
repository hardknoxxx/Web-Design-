import {
  BufferAttribute,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  QuadraticBezierCurve3,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type Material,
} from 'three'

/*
 * Vajilla y comida de Lilium en 3D, modelada con primitivas (sin modelos externos): tornos (LatheGeometry) para
 * platos, tazas, bowls y la tetera; extrusiones para porciones y tostados; esferas con ruido para la chipa.
 * Estilo "cerámica y arcilla": formas simples, materiales mates, colores de la marca. Unidades: el plato mide ~1,7.
 */

export const COLOR = {
  ceramica: '#FAF7F2',
  borde: '#E4D3B4',
  menta: '#64BCB0',
  mentaOscura: '#3E8C82',
  laguna: '#1C4A45',
  cafe: '#6B3A1E',
  crema: '#F3E3C8',
  dorado: '#EFCB83',
  doradoOscuro: '#C9913F',
  pan: '#E2B46E',
  queso: '#F7E7B8',
  chocolate: '#4A2516',
  frutoRojo: '#B5302F',
  arandano: '#3B3F6E',
  hoja: '#6F7F2E',
  hojaClara: '#97AD3D',
  tomate: '#D9472B',
}

/** Materiales del objeto: se guardan para poder "pintarlos" (de gris a color) como en el mantel. */
export type Pieza3D = { grupo: Group; materiales: MeshStandardMaterial[] }

function material(color: string, roughness = 0.55, metalness = 0) {
  return new MeshStandardMaterial({ color, roughness, metalness })
}

function lathe(perfil: [number, number][], seg = 48) {
  return new LatheGeometry(
    perfil.map(([x, y]) => new Vector2(x, y)),
    seg,
  )
}

// ruido determinista para que cada chipa salga igual en cada carga
function ruido(x: number, y: number, z: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
  return s - Math.floor(s)
}

function textura(dibujar: (g: CanvasRenderingContext2D, s: number) => void, s = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = s
  dibujar(c.getContext('2d')!, s)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

/** Plato playo de cerámica con borde levantado. */
export function plato(r = 0.86, mat?: MeshStandardMaterial) {
  const k = r / 0.86
  const g = lathe(
    [
      [0, 0.035],
      [0.56, 0.035],
      [0.7, 0.07],
      [0.84, 0.15],
      [0.87, 0.16],
      [0.86, 0.13],
      [0.7, 0.04],
      [0.55, 0.0],
      [0.0, 0.0],
    ].map(([x, y]) => [x * k, y * k] as [number, number]),
  )
  return new Mesh(g, mat ?? material(COLOR.ceramica, 0.32))
}

/** Taza con asa; `liquido` es la superficie (latte art o té). */
function taza(radio: number, alto: number, cer: MeshStandardMaterial, liquido: Material) {
  const g = new Group()
  const r = radio
  const cuerpo = lathe([
    [0, 0.01],
    [r * 0.62, 0.0],
    [r * 0.82, alto * 0.18],
    [r * 0.98, alto * 0.7],
    [r, alto],
    [r * 0.92, alto],
    [r * 0.9, alto * 0.72],
    [r * 0.74, alto * 0.22],
    [0, alto * 0.14],
  ])
  g.add(new Mesh(cuerpo, cer))
  const asa = new Mesh(new TorusGeometry(alto * 0.3, r * 0.09, 10, 24, Math.PI * 1.3), cer)
  asa.position.set(r * 0.98, alto * 0.52, 0)
  asa.rotation.z = -Math.PI * 0.65
  g.add(asa)
  const sup = new Mesh(new CircleGeometry(r * 0.9, 40), liquido)
  sup.rotation.x = -Math.PI / 2
  sup.position.y = alto * 0.84
  g.add(sup)
  return g
}

function latteArt(s = 256) {
  return textura((g, n) => {
    g.fillStyle = '#7A4424'
    g.fillRect(0, 0, n, n)
    const grad = g.createRadialGradient(n / 2, n / 2, n * 0.1, n / 2, n / 2, n / 2)
    grad.addColorStop(0, '#9A5A30')
    grad.addColorStop(1, '#5E3018')
    g.fillStyle = grad
    g.fillRect(0, 0, n, n)
    // rosetta: hojas apiladas y un trazo que las atraviesa
    g.fillStyle = '#F6E9D6'
    for (let i = 0; i < 6; i++) {
      const y = n * (0.26 + i * 0.085)
      const w = n * (0.3 - i * 0.035)
      g.beginPath()
      g.ellipse(n / 2, y, w / 2, n * 0.05, 0, 0, Math.PI * 2)
      g.fill()
    }
    g.beginPath()
    g.ellipse(n / 2, n * 0.78, n * 0.07, n * 0.07, 0, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = '#7A4424'
    g.lineWidth = n * 0.02
    g.beginPath()
    g.moveTo(n / 2, n * 0.18)
    g.lineTo(n / 2, n * 0.84)
    g.stroke()
  }, s)
}

/** Porción (cuña) de torta: sector extruido. Devuelve la malla con grupos [tapas, lados]. */
function cuna(radio: number, angulo: number, alto: number, mTapa: Material, mLado: Material) {
  const s = new Shape()
  s.moveTo(0, 0)
  s.absarc(0, 0, radio, -angulo / 2, angulo / 2, false)
  s.lineTo(0, 0)
  const g = new ExtrudeGeometry(s, { depth: alto, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 18 })
  g.rotateX(-Math.PI / 2)
  g.translate(-radio * 0.45, 0, 0)
  return new Mesh(g, [mTapa, mLado])
}

function guardar(grupo: Group): Pieza3D {
  const materiales = new Set<MeshStandardMaterial>()
  grupo.traverse((o) => {
    const m = (o as Mesh).material
    if (!m) return
    for (const x of Array.isArray(m) ? m : [m]) if (x instanceof MeshStandardMaterial) materiales.add(x)
  })
  return { grupo, materiales: [...materiales] }
}

// ---------------------------------------------------------------- la carta, plato por plato

export function cafeDeEspecialidad(): Pieza3D {
  const g = new Group()
  const cer = material(COLOR.ceramica, 0.3)
  g.add(plato(0.62, cer))
  const latte = new MeshStandardMaterial({ map: latteArt(), roughness: 0.25 })
  const t = taza(0.36, 0.42, material(COLOR.menta, 0.35), latte)
  t.position.y = 0.04
  g.add(t)
  // cucharita sobre el plato
  const cuchara = new Mesh(new CylinderGeometry(0.018, 0.022, 0.5, 8), material(COLOR.borde, 0.3, 0.6))
  // acostada sobre el plato, a la derecha de la taza
  cuchara.rotation.set(0, -0.5, Math.PI / 2)
  cuchara.position.set(0.18, 0.07, 0.48)
  g.add(cuchara)
  return guardar(g)
}

export function chipa(): Pieza3D {
  const g = new Group()
  g.add(plato())
  const masa = material(COLOR.dorado, 0.75)
  masa.vertexColors = true
  const pos: [number, number, number][] = [
    [-0.26, 0.15, -0.18],
    [0.24, 0.15, -0.22],
    [-0.2, 0.15, 0.26],
    [0.27, 0.15, 0.2],
    [0.02, 0.31, 0.0],
  ]
  pos.forEach(([x, y, z], i) => {
    const geo = new SphereGeometry(0.2, 24, 16)
    const p = geo.attributes.position
    const col = new Float32Array(p.count * 3)
    const base = new Color(COLOR.dorado)
    const tost = new Color(COLOR.doradoOscuro)
    const tmp = new Color()
    for (let v = 0; v < p.count; v++) {
      const vx = p.getX(v)
      const vy = p.getY(v)
      const vz = p.getZ(v)
      const n = ruido(vx + i, vy, vz)
      const k = 1 + (n - 0.5) * 0.12
      p.setXYZ(v, vx * k, vy * 0.78 * k, vz * k)
      // más tostada arriba, con pintitas de queso
      tmp.copy(base).lerp(tost, Math.max(0, vy / 0.2) * 0.3 + (n > 0.94 ? 0.45 : 0))
      col.set([tmp.r, tmp.g, tmp.b], v * 3)
    }
    geo.setAttribute('color', new BufferAttribute(col, 3))
    geo.computeVertexNormals()
    const m = new Mesh(geo, masa)
    m.position.set(x, y, z)
    m.rotation.y = i
    g.add(m)
  })
  return guardar(g)
}

export function teEnTetera(): Pieza3D {
  const g = new Group()
  g.add(plato())
  const cer = material(COLOR.menta, 0.35)
  const tetera = new Group()
  const cuerpo = lathe([
    [0, 0],
    [0.24, 0.0],
    [0.36, 0.1],
    [0.4, 0.24],
    [0.34, 0.4],
    [0.2, 0.47],
    [0, 0.47],
  ])
  tetera.add(new Mesh(cuerpo, cer))
  const tapa = new Mesh(new SphereGeometry(0.06, 16, 12), material(COLOR.mentaOscura, 0.35))
  tapa.position.y = 0.5
  tetera.add(tapa)
  const pico = new Mesh(
    new TubeGeometry(new QuadraticBezierCurve3(new Vector3(0.3, 0.16, 0), new Vector3(0.52, 0.2, 0), new Vector3(0.58, 0.4, 0)), 16, 0.045, 10),
    cer,
  )
  tetera.add(pico)
  const asa = new Mesh(new TorusGeometry(0.14, 0.03, 10, 24, Math.PI * 1.2), cer)
  asa.position.set(-0.4, 0.26, 0)
  asa.rotation.z = Math.PI * 0.4
  tetera.add(asa)
  tetera.position.set(-0.1, 0.03, -0.08)
  tetera.scale.setScalar(0.95)
  g.add(tetera)
  const te = new MeshStandardMaterial({ color: '#B8742E', roughness: 0.2 })
  const tz = taza(0.15, 0.17, material(COLOR.ceramica, 0.3), te)
  tz.position.set(0.42, 0.04, 0.36)
  g.add(tz)
  return guardar(g)
}

function rayasPlancha() {
  return textura((g, n) => {
    g.fillStyle = COLOR.pan
    g.fillRect(0, 0, n, n)
    g.strokeStyle = '#8A5524'
    g.lineWidth = n * 0.045
    g.lineCap = 'round'
    for (let i = -2; i < 7; i++) {
      g.beginPath()
      g.moveTo(i * n * 0.2, 0)
      g.lineTo(i * n * 0.2 + n * 0.5, n)
      g.stroke()
    }
  })
}

export function tostados(): Pieza3D {
  const g = new Group()
  g.add(plato())
  const tapa = new MeshStandardMaterial({ map: rayasPlancha(), roughness: 0.8 })
  const lado = material('#D9A55B', 0.8)
  const tri = new Shape()
  tri.moveTo(-0.36, -0.3)
  tri.lineTo(0.38, -0.3)
  tri.lineTo(-0.36, 0.38)
  tri.lineTo(-0.36, -0.3)
  const geo = new ExtrudeGeometry(tri, { depth: 0.13, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 })
  geo.rotateX(-Math.PI / 2)
  const a = new Mesh(geo, [tapa, lado])
  a.position.set(-0.06, 0.06, 0.05)
  a.rotation.y = 0.2
  const b = new Mesh(geo, [tapa, lado])
  b.position.set(0.12, 0.22, -0.02)
  b.rotation.y = Math.PI + 0.5
  // el queso que asoma entre las rodajas
  const queso = new Mesh(new CylinderGeometry(0.035, 0.035, 0.5, 8), material(COLOR.queso, 0.5))
  queso.rotation.z = Math.PI / 2
  queso.position.set(0.0, 0.2, 0.12)
  g.add(a, b, queso)
  return guardar(g)
}

export function ensaladas(): Pieza3D {
  const g = new Group()
  const bowl = new Mesh(
    lathe([
      [0, 0],
      [0.32, 0],
      [0.6, 0.18],
      [0.72, 0.36],
      [0.68, 0.37],
      [0.56, 0.21],
      [0.3, 0.06],
      [0, 0.06],
    ]),
    material(COLOR.ceramica, 0.32),
  )
  g.add(bowl)
  const hojaS = new Shape()
  hojaS.moveTo(0, 0)
  hojaS.quadraticCurveTo(0.16, 0.12, 0, 0.36)
  hojaS.quadraticCurveTo(-0.16, 0.12, 0, 0)
  const hojaG = new ExtrudeGeometry(hojaS, { depth: 0.01, bevelEnabled: false, curveSegments: 8 })
  const verdes = [material(COLOR.hoja, 0.7), material(COLOR.hojaClara, 0.7), material('#5B7B5A', 0.7)]
  for (let i = 0; i < 16; i++) {
    const m = new Mesh(hojaG, verdes[i % 3])
    const a = (i / 16) * Math.PI * 2
    const r = 0.18 + (i % 4) * 0.08
    m.position.set(Math.cos(a) * r, 0.2 + (i % 3) * 0.04, Math.sin(a) * r)
    m.rotation.set(-0.9 - (i % 3) * 0.2, -a + Math.PI / 2, (i % 5) * 0.3)
    g.add(m)
  }
  const tom = material(COLOR.tomate, 0.35)
  for (let i = 0; i < 4; i++) {
    const t = new Mesh(new SphereGeometry(0.07, 16, 12), tom)
    const a = i * 1.7
    t.position.set(Math.cos(a) * 0.26, 0.33, Math.sin(a) * 0.26)
    g.add(t)
  }
  const huevo = new Mesh(new SphereGeometry(0.09, 16, 12), material('#FFFDF5', 0.5))
  huevo.scale.set(1, 0.6, 1.3)
  huevo.position.set(0.05, 0.34, 0.05)
  g.add(huevo)
  return guardar(g)
}

export function cheesecake(): Pieza3D {
  const g = new Group()
  g.add(plato())
  const base = cuna(0.62, 0.95, 0.07, material('#B98A55', 0.9), material('#A97A48', 0.9))
  base.position.y = 0.035
  const cuerpo = cuna(0.62, 0.95, 0.3, material('#C2413A', 0.4), material('#FBF3E4', 0.6))
  cuerpo.position.y = 0.105
  g.add(base, cuerpo)
  const ar = material(COLOR.arandano, 0.3)
  const fr = material(COLOR.frutoRojo, 0.45)
  const puntos: [number, number, number, number][] = [
    [-0.05, 0.47, 0.02, 0],
    [0.12, 0.46, -0.06, 1],
    [0.06, 0.47, 0.1, 0],
    [-0.2, 0.46, -0.05, 1],
    [0.22, 0.45, 0.04, 0],
    [-0.12, 0.47, 0.12, 0],
    [0.0, 0.46, -0.14, 0],
  ]
  for (const [x, y, z, t] of puntos) {
    const b = new Mesh(new SphereGeometry(t ? 0.075 : 0.06, 16, 12), t ? fr : ar)
    b.position.set(x, y, z)
    g.add(b)
  }
  return guardar(g)
}

export function tortaDeChocolate(): Pieza3D {
  const g = new Group()
  g.add(plato())
  const choco = material(COLOR.chocolate, 0.5)
  const crema = material('#F1DCC4', 0.6)
  const capas = [
    [0.035, 0.11, choco],
    [0.145, 0.04, crema],
    [0.185, 0.11, choco],
    [0.295, 0.04, crema],
    [0.335, 0.08, choco],
  ] as const
  for (const [y, h, m] of capas) {
    const c = cuna(0.6, 0.9, h, choco, m)
    c.position.y = y
    g.add(c)
  }
  const cereza = new Mesh(new SphereGeometry(0.08, 16, 12), material(COLOR.frutoRojo, 0.25))
  cereza.position.set(0.0, 0.5, 0.0)
  const cabo = new Mesh(new CylinderGeometry(0.01, 0.01, 0.16, 6), material('#4F6B2A', 0.6))
  cabo.position.set(0.03, 0.62, 0)
  cabo.rotation.z = -0.4
  g.add(cereza, cabo)
  return guardar(g)
}

export const MODELOS: Record<string, () => Pieza3D> = {
  cafe: cafeDeEspecialidad,
  chipa,
  te: teEnTetera,
  tostado: tostados,
  ensalada: ensaladas,
  cheesecake,
  torta: tortaDeChocolate,
}

/** Libera geometrías, materiales y texturas de un grupo. */
export function liberar(o: Group) {
  o.traverse((x) => {
    const m = x as Mesh
    m.geometry?.dispose()
    const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : []
    for (const mm of mats) {
      ;(mm as MeshStandardMaterial).map?.dispose()
      mm.dispose()
    }
  })
}

