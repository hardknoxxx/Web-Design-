import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NoColorSpace,
  PlaneGeometry,
  QuadraticBezierCurve3,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type Material,
  type Texture,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/*
 * Vajilla y comida de Lilium en 3D (fuente de las fotos de giro de la mesa: ver render.ts), modelada en código (sin modelos externos ni fotos inventadas).
 * El realismo sale de tres cosas: cortes que muestran el interior (capas de bizcocho, relleno, miga, queso),
 * texturas pintadas con ruido (poros, costra, marcas de plancha, nervaduras) que además dan relieve (bumpMap),
 * y cerámica brillante que refleja el entorno de estudio que arma mesa3d.ts. Unidades: el plato mide ~1,7.
 */

export const COLOR = {
  ceramica: '#FBF8F1',
  menta: '#64BCB0',
  mentaOscura: '#3E8C82',
  laguna: '#1C4A45',
}

/** Materiales del objeto: se guardan para poder desaturarlos lejos del frente de la mesa. */
export type Pieza3D = { grupo: Group; materiales: MeshStandardMaterial[] }

// ---------------------------------------------------------------- ruido y texturas pintadas

type RGB = [number, number, number]
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const mezcla = (a: RGB, b: RGB, t: number): RGB => {
  const k = Math.min(1, Math.max(0, t))
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]
}
const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// ruido de valor determinista: cada carga dibuja exactamente lo mismo
function azar(x: number, y: number, s: number) {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295
}
function ruido(x: number, y: number, s = 0) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = azar(xi, yi, s)
  const b = azar(xi + 1, yi, s)
  const c = azar(xi, yi + 1, s)
  const d = azar(xi + 1, yi + 1, s)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
function fbm(x: number, y: number, s = 0, oct = 4) {
  let t = 0
  let a = 0.5
  let f = 1
  let norma = 0
  for (let i = 0; i < oct; i++) {
    t += a * ruido(x * f, y * f, s + i * 17)
    norma += a
    a *= 0.5
    f *= 2
  }
  return t / norma
}

/** Pinta una textura píxel a píxel; `fn(u, v)` con v hacia arriba (como las UV). Devuelve color y relieve. */
function pintar(w: number, h: number, fn: (u: number, v: number) => [RGB, number, number?]) {
  const c = document.createElement('canvas')
  const b = document.createElement('canvas')
  c.width = b.width = w
  c.height = b.height = h
  const gc = c.getContext('2d')!
  const gb = b.getContext('2d')!
  const ic = gc.createImageData(w, h)
  const ib = gb.createImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [rgb, alto, alfa = 1] = fn(x / w, 1 - y / h)
      const k = (y * w + x) * 4
      ic.data[k] = rgb[0]
      ic.data[k + 1] = rgb[1]
      ic.data[k + 2] = rgb[2]
      ic.data[k + 3] = alfa * 255
      const g = Math.min(255, Math.max(0, alto * 255))
      ib.data[k] = ib.data[k + 1] = ib.data[k + 2] = g
      ib.data[k + 3] = 255
    }
  }
  gc.putImageData(ic, 0, 0)
  gb.putImageData(ib, 0, 0)
  const color = new CanvasTexture(c)
  color.colorSpace = SRGBColorSpace
  color.anisotropy = 4
  const relieve = new CanvasTexture(b)
  relieve.colorSpace = NoColorSpace
  return { color, relieve }
}

function mat(opts: ConstructorParameters<typeof MeshStandardMaterial>[0]) {
  return new MeshStandardMaterial(opts)
}
/** Cerámica esmaltada: capa de brillo (clearcoat) que refleja el estudio. */
function esmalte(color: string, roughness = 0.28) {
  return new MeshPhysicalMaterial({ color, roughness, clearcoat: 0.85, clearcoatRoughness: 0.12 })
}
/** Superficies húmedas o glaseadas (ganache, coulis, té): brillo fuerte y nítido. */
function glaseado(color: string, roughness = 0.22) {
  return new MeshPhysicalMaterial({ color, roughness, clearcoat: 1, clearcoatRoughness: 0.06 })
}
function texturado(t: { color: Texture; relieve: Texture }, roughness: number, bump = 0.012, extra: Partial<MeshStandardMaterial> = {}) {
  return mat({ map: t.color, bumpMap: t.relieve, bumpScale: bump, roughness, ...extra })
}

function lathe(perfil: [number, number][], seg = 64) {
  return new LatheGeometry(
    perfil.map(([x, y]) => new Vector2(x, y)),
    seg,
  )
}

function guardar(grupo: Group): Pieza3D {
  const materiales = new Set<MeshStandardMaterial>()
  grupo.traverse((o) => {
    const m = o as Mesh
    if (!m.isMesh) return
    m.castShadow = true
    m.receiveShadow = true
    for (const x of Array.isArray(m.material) ? m.material : [m.material]) if (x instanceof MeshStandardMaterial) materiales.add(x)
  })
  return { grupo, materiales: [...materiales] }
}

// ---------------------------------------------------------------- vajilla

/** Plato playo de cerámica: ala ancha, borde levantado y pie. */
export function plato(r = 0.86, cer?: Material) {
  const k = r / 0.86
  const g = lathe(
    [
      [0, 0.036],
      [0.5, 0.036],
      [0.6, 0.05],
      [0.74, 0.1],
      [0.84, 0.148],
      [0.865, 0.152],
      [0.87, 0.14],
      [0.76, 0.08],
      [0.62, 0.035],
      [0.5, 0.012],
      [0.48, 0.0],
      [0.0, 0.0],
    ].map(([x, y]) => [x * k, y * k] as [number, number]),
  )
  return new Mesh(g, cer ?? esmalte(COLOR.ceramica))
}

/** Taza con asa: afuera de color, adentro blanca; `liquido` es la superficie (latte art o té). */
function taza(r: number, alto: number, afuera: Material, adentro: Material, liquido: Material) {
  const g = new Group()
  const ext = lathe([
    [0, 0.012],
    [r * 0.5, 0.0],
    [r * 0.56, 0.012],
    [r * 0.8, alto * 0.16],
    [r * 0.96, alto * 0.62],
    [r, alto * 0.97],
    [r * 0.985, alto],
  ])
  const int = lathe([
    [r * 0.985, alto],
    [r * 0.93, alto * 0.98],
    [r * 0.9, alto * 0.62],
    [r * 0.72, alto * 0.2],
    [0, alto * 0.13],
  ])
  g.add(new Mesh(ext, afuera), new Mesh(int, adentro))
  // asa: un arco grueso pegado al costado
  const asa = new Mesh(new TorusGeometry(alto * 0.27, r * 0.075, 14, 32, Math.PI * 1.25), afuera)
  asa.position.set(r * 0.96, alto * 0.54, 0)
  asa.rotation.z = -Math.PI * 0.62
  g.add(asa)
  const sup = new Mesh(new CircleGeometry(r * 0.905, 48), liquido)
  sup.rotation.x = -Math.PI / 2
  sup.position.y = alto * 0.84
  g.add(sup)
  return g
}

/** Cuchara de metal: cuenco y mango finito. */
function cuchara(largo = 0.5) {
  const metal = mat({ color: '#D9D6CF', metalness: 1, roughness: 0.22 })
  const cuenco = new Mesh(new SphereGeometry(0.06, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), metal)
  cuenco.scale.set(1, 0.32, 1.45)
  cuenco.rotation.x = Math.PI
  cuenco.position.set(0, 0.02, -largo * 0.42)
  const mango = new Mesh(new CylinderGeometry(0.012, 0.02, largo * 0.72, 10), metal)
  mango.rotation.x = Math.PI / 2 - 0.08
  mango.position.set(0, 0.025, largo * 0.06)
  const g = new Group()
  g.add(cuenco, mango)
  return g
}

// ---------------------------------------------------------------- texturas de la comida

function texLatte() {
  const crema0 = hex('#B97C45')
  const crema1 = hex('#6A3B1C')
  const borde = hex('#4A2812')
  const leche = hex('#F6EAD7')
  const ell = (u: number, v: number, cx: number, cy: number, a: number, b: number) => ((u - cx) / a) ** 2 + ((v - cy) / b) ** 2
  return pintar(256, 256, (u, v) => {
    const r = Math.hypot(u - 0.5, v - 0.5) * 2
    let c = mezcla(crema0, crema1, r * 0.9 + (fbm(u * 18, v * 18, 3) - 0.5) * 0.35)
    c = mezcla(c, borde, suave(0.86, 1, r))
    // rosetta: medialunas apiladas, un corazón arriba y el trazo que las atraviesa
    let m = 0
    for (let i = 0; i < 6; i++) {
      const cy = 0.26 + i * 0.075
      const a = 0.27 - i * 0.032
      const dentro = 1 - suave(0.86, 1.04, ell(u, v, 0.5, cy, a, 0.06))
      const hueco = 1 - suave(0.8, 1.02, ell(u, v, 0.5, cy + 0.028, a * 0.86, 0.05))
      m = Math.max(m, dentro * (1 - hueco))
    }
    m = Math.max(m, 1 - suave(0.8, 1.05, ell(u, v, 0.5, 0.75, 0.085, 0.075)))
    const trazo = suave(0.012, 0.004, Math.abs(u - 0.5)) * suave(0.16, 0.2, v) * suave(0.86, 0.8, v)
    m *= 1 - trazo
    m *= 0.85 + fbm(u * 30, v * 30, 9) * 0.25
    c = mezcla(c, leche, m)
    return [c, 0.5 + m * 0.3]
  })
}

function texTe() {
  return pintar(128, 128, (u, v) => {
    const r = Math.hypot(u - 0.5, v - 0.5) * 2
    return [mezcla(hex('#7A3A0C'), hex('#C98636'), r * r), 0.5]
  })
}

/** Corte de bizcocho húmedo con capas: las alturas van de abajo (0) a arriba (1). */
function texCorteTorta() {
  const bizcocho = hex('#4E2617')
  const poro = hex('#2A120A')
  const miga = hex('#6B3822')
  const dulce = hex('#8E1B2E')
  const semilla = hex('#E6B9A0')
  const ganache = hex('#26120B')
  return pintar(256, 256, (u, v) => {
    const onda = (fbm(u * 6, v * 2, 5) - 0.5) * 0.03
    const y = v + onda
    const capa = y > 0.9 ? 'g' : (y > 0.27 && y < 0.34) || (y > 0.6 && y < 0.67) ? 'd' : 'b'
    if (capa === 'g') return [mezcla(ganache, hex('#3A1D12'), fbm(u * 20, v * 20, 2) * 0.6), 0.55]
    if (capa === 'd') {
      const s = ruido(u * 90, v * 90, 4) > 0.9 ? 0.5 : 0
      return [mezcla(mezcla(dulce, hex('#B0303F'), fbm(u * 25, v * 25, 6)), semilla, s), 0.45]
    }
    const p = ruido(u * 70, v * 70, 1)
    const f = fbm(u * 26, v * 26, 8)
    let c = mezcla(bizcocho, miga, suave(0.5, 0.75, f))
    c = mezcla(c, poro, suave(0.72, 0.86, p))
    return [c, 0.6 - suave(0.72, 0.86, p) * 0.5 + f * 0.2]
  })
}

/** Corte de cheesecake: base de galletita, relleno cremoso con burbujitas y la superficie dorada. */
function texCorteCheesecake(lado = false) {
  const galleta = hex('#B07A45')
  const galleta2 = hex('#8A5A2E')
  const crema = hex(lado ? '#EED2A0' : '#F7EDD8')
  const crema2 = hex(lado ? '#E3B878' : '#F1E0BE')
  const dorado = hex('#D9A15A')
  return pintar(256, 256, (u, v) => {
    const y = v + (fbm(u * 8, v * 3, 2) - 0.5) * 0.025
    if (y < 0.2) {
      const g = fbm(u * 60, v * 60, 3)
      return [mezcla(galleta, galleta2, g + (ruido(u * 120, v * 120, 7) > 0.8 ? 0.4 : 0)), 0.3 + g * 0.5]
    }
    if (y > 0.95) return [dorado, 0.6]
    const burbuja = ruido(u * 110, v * 110, 5) > 0.93 ? 1 : 0
    let c = mezcla(crema, crema2, (y - 0.2) * 0.6 + fbm(u * 14, v * 14, 1) * 0.25)
    if (lado) c = mezcla(c, dorado, suave(0.75, 0.95, y) * 0.6)
    c = mezcla(c, hex('#D8C29C'), burbuja * 0.6)
    return [c, 0.55 - burbuja * 0.3]
  })
}

function texGanache() {
  return pintar(128, 128, (u, v) => [mezcla(hex('#22100A'), hex('#3B1D11'), fbm(u * 10, v * 10, 4)), 0.5 + fbm(u * 10, v * 10, 4) * 0.2])
}

/** Pan de miga tostado a la plancha: dorado parejo, más tostado en los bordes, rayas de la plancha. */
function texPanArriba() {
  const pan = hex('#E8B868')
  const tostado = hex('#B9752F')
  const raya = hex('#5E3214')
  return pintar(256, 256, (u, v) => {
    const f = fbm(u * 10, v * 10, 2)
    let c = mezcla(pan, tostado, f * 0.55 + suave(0.32, 0.5, Math.max(Math.abs(u - 0.5), Math.abs(v - 0.5))) * 0.5)
    const d = ((u + v) * 5.5) % 1
    const k = suave(0.13, 0.04, Math.abs(d - 0.5) - 0.0) * (0.75 + ruido(u * 30, v * 30, 3) * 0.35)
    c = mezcla(c, raya, k)
    const poro = ruido(u * 80, v * 80, 6) > 0.86 ? 0.15 : 0
    return [mezcla(c, tostado, poro), 0.6 - k * 0.45 - poro]
  })
}
function texMiga() {
  return pintar(128, 128, (u, v) => {
    const p = ruido(u * 50, v * 50, 2)
    let c = mezcla(hex('#F2DFB2'), hex('#E2C68E'), fbm(u * 12, v * 12, 1))
    c = mezcla(c, hex('#C7A06A'), suave(0.78, 0.9, p))
    c = mezcla(c, hex('#C98A3E'), suave(0.82, 1, Math.abs(v - 0.5) * 2) * 0.8)
    return [c, 0.6 - suave(0.78, 0.9, p) * 0.4]
  })
}
function texJamon() {
  return pintar(128, 128, (u, v) => {
    const f = fbm(u * 8, v * 8, 4)
    return [mezcla(hex('#D98886'), hex('#F1C2BA'), suave(0.6, 0.75, f)), 0.5]
  })
}

/** Costra de la chipa: dorada, con bultitos tostados, pintas de queso y grietas finas. */
function texChipa() {
  return pintar(256, 128, (u, v) => {
    const f = fbm(u * 16, v * 8, 2)
    let c = mezcla(hex('#F0D08E'), hex('#D79E4E'), suave(0.42, 0.72, f) + suave(0.55, 0.95, v) * 0.35)
    const q = ruido(u * 60, v * 30, 8)
    c = mezcla(c, hex('#B9742C'), suave(0.84, 0.94, q) * 0.8)
    const grieta = suave(0.03, 0.0, Math.abs(ruido(u * 14, v * 7, 3) - 0.5)) * suave(0.35, 0.7, v)
    c = mezcla(c, hex('#F7E6BE'), grieta)
    return [c, 0.3 + f * 0.6 - grieta * 0.3]
  })
}

/** Hoja de lechuga: forma con borde ondulado (alfa), nervio central y nervaduras. */
function texHoja(base: string, claro: string) {
  const b = hex(base)
  const c0 = hex(claro)
  return pintar(128, 128, (u, v) => {
    const x = (u - 0.5) * 2
    const ancho = Math.sin(Math.PI * Math.min(1, v * 1.05)) * (0.82 + Math.sin(v * 40) * 0.06 + (ruido(v * 30, 0, 2) - 0.5) * 0.14)
    const dentro = v > 0.02 && Math.abs(x) < ancho ? 1 : 0
    const nervio = suave(0.06, 0.0, Math.abs(x)) * (1 - v * 0.6)
    const lateral = suave(0.05, 0.0, Math.abs(((Math.abs(x) * 0.8 + v * 2.2) % 0.33) - 0.165) - 0.13) * 0.4
    let c = mezcla(b, c0, Math.abs(x) * 0.2 + fbm(u * 8, v * 8, 4) * 0.4)
    c = mezcla(c, hex('#E4EFC0'), Math.max(nervio, lateral))
    return [c, 0.5 + nervio * 0.3, dentro]
  })
}
/** Tomate cherry cortado al medio: pulpa, cámaras con gel y semillas. */
function texTomate() {
  return pintar(128, 128, (u, v) => {
    const x = (u - 0.5) * 2
    const y = (v - 0.5) * 2
    const r = Math.hypot(x, y)
    const a = Math.atan2(y, x)
    let c = hex('#D8331F')
    const camara = r > 0.25 && r < 0.78 && Math.cos(a * 3) > -0.2 ? 1 : 0
    if (camara) {
      c = mezcla(hex('#F07752'), hex('#F59A6E'), r)
      if (ruido(x * 14, y * 14, 4) > 0.86) c = hex('#F2D58A')
    }
    if (r < 0.25) c = hex('#F2A07F')
    c = mezcla(c, hex('#B5200F'), suave(0.9, 1, r))
    return [c, 0.5]
  })
}
function texHuevo() {
  return pintar(128, 128, (u, v) => {
    const r = Math.hypot((u - 0.5) * 2, (v - 0.5) * 2)
    const c = r < 0.5 ? mezcla(hex('#F7B52C'), hex('#E99A16'), r * 2) : mezcla(hex('#FFFCF4'), hex('#F2EEE2'), r)
    return [c, 0.5]
  })
}

// ---------------------------------------------------------------- piezas reutilizables

/**
 * Porción (cuña) de torta con cortes que muestran el interior. La punta mira a +x; `corte` se pinta en las dos
 * caras rectas (u: de la punta al borde, v: de abajo arriba) y `lado` en la cara curva.
 */
function porcion(r: number, ang: number, h: number, corte: Material, lado: Material, tapa: Material) {
  const g = new Group()
  const cara = (phi: number) => {
    const geo = new BufferGeometry()
    const x = Math.cos(phi) * r
    const z = Math.sin(phi) * r
    geo.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, x, 0, z, x, h, z, 0, h, 0]), 3))
    geo.setAttribute('uv', new BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2))
    geo.setIndex([0, 1, 2, 0, 2, 3])
    geo.computeVertexNormals()
    return new Mesh(geo, corte)
  }
  g.add(cara(ang / 2), cara(-ang / 2))
  const curva = new Mesh(new CylinderGeometry(r, r, h, 32, 1, true, Math.PI / 2 - ang / 2, ang), lado)
  curva.position.y = h / 2
  const arriba = new Mesh(new CircleGeometry(r, 32, -ang / 2, ang), tapa)
  arriba.rotation.x = -Math.PI / 2
  arriba.position.y = h
  g.add(curva, arriba)
  // la porción se apoya centrada en el plato
  g.position.x = -r * 0.42
  return g
}

/** Frambuesa: un domo de drupas (esferitas) fundidas en una sola malla. */
function frambuesa(r = 0.075) {
  const partes: BufferGeometry[] = []
  for (let fila = 0; fila < 5; fila++) {
    const phi = 0.35 + fila * 0.55
    const n = Math.max(4, Math.round(Math.sin(phi) * 11))
    for (let k = 0; k < n; k++) {
      const th = (k / n) * Math.PI * 2 + fila * 0.4
      const s = new SphereGeometry(r * 0.36, 10, 8)
      s.translate(Math.sin(phi) * Math.cos(th) * r, Math.cos(phi) * r * 1.1, Math.sin(phi) * Math.sin(th) * r)
      partes.push(s)
    }
  }
  const geo = mergeGeometries(partes)
  for (const p of partes) p.dispose()
  return geo
}
function arandano(r = 0.06) {
  const geo = new SphereGeometry(r, 24, 16)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i)
    // achatado, con la coronita hundida arriba
    p.setY(i, y * 0.82 - (y > r * 0.85 ? r * 0.12 : 0))
  }
  geo.computeVertexNormals()
  return geo
}

// ---------------------------------------------------------------- la carta, plato por plato

export function cafeDeEspecialidad(): Pieza3D {
  const g = new Group()
  const blanca = esmalte(COLOR.ceramica)
  g.add(plato(0.64, blanca))
  const latte = new MeshPhysicalMaterial({ map: texLatte().color, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3 })
  const t = taza(0.36, 0.42, esmalte(COLOR.menta, 0.26), blanca, latte)
  t.position.y = 0.036
  t.rotation.y = 0.4
  g.add(t)
  const c = cuchara(0.5)
  c.rotation.y = -0.9
  c.position.set(0.3, 0.05, 0.36)
  g.add(c)
  return guardar(g)
}

export function chipa(): Pieza3D {
  const g = new Group()
  g.add(plato())
  const tex = texChipa()
  const masa = texturado(tex, 0.78, 0.03)
  const pos: [number, number, number, number][] = [
    [-0.27, 0.13, -0.2, 0.2],
    [0.25, 0.13, -0.24, 0.19],
    [-0.22, 0.13, 0.25, 0.2],
    [0.28, 0.13, 0.2, 0.18],
    [0.0, 0.14, 0.0, 0.2],
    [0.02, 0.33, -0.08, 0.17],
  ]
  pos.forEach(([x, y, z, r], i) => {
    const geo = new SphereGeometry(r, 40, 28)
    const p = geo.attributes.position
    const v = new Vector3()
    for (let k = 0; k < p.count; k++) {
      v.fromBufferAttribute(p, k)
      const n = v.clone().normalize()
      // bultos irregulares y la base apenas aplastada contra el plato
      const bulto = 1 + (fbm(n.x * 2.4 + i * 3, n.y * 2.4 + n.z * 1.7, 11, 3) - 0.5) * 0.28
      v.multiplyScalar(bulto)
      v.y *= 0.84
      if (v.y < -r * 0.55) v.y = -r * 0.55 + (v.y + r * 0.55) * 0.25
      p.setXYZ(k, v.x, v.y, v.z)
    }
    geo.computeVertexNormals()
    const m = new Mesh(geo, masa)
    m.position.set(x, y, z)
    m.rotation.y = i * 1.3
    g.add(m)
  })
  return guardar(g)
}

export function teEnTetera(): Pieza3D {
  const g = new Group()
  g.add(plato())
  const blanca = esmalte(COLOR.ceramica)
  const menta = esmalte(COLOR.menta, 0.26)
  const tetera = new Group()
  tetera.add(
    new Mesh(
      lathe([
        [0, 0.0],
        [0.2, 0.0],
        [0.23, 0.02],
        [0.33, 0.09],
        [0.38, 0.2],
        [0.37, 0.3],
        [0.31, 0.39],
        [0.22, 0.44],
        [0.17, 0.45],
        [0.0, 0.45],
      ]),
      menta,
    ),
  )
  // tapa con su perilla
  const tapa = new Mesh(
    lathe([
      [0.19, 0.44],
      [0.17, 0.48],
      [0.1, 0.51],
      [0.04, 0.52],
      [0.0, 0.52],
    ]),
    blanca,
  )
  const perilla = new Mesh(new SphereGeometry(0.045, 20, 14), blanca)
  perilla.position.y = 0.55
  tetera.add(tapa, perilla)
  // pico afinado hacia la punta
  const curva = new QuadraticBezierCurve3(new Vector3(0.3, 0.12, 0), new Vector3(0.56, 0.16, 0), new Vector3(0.6, 0.42, 0))
  const pico = new TubeGeometry(curva, 24, 0.06, 14)
  const pp = pico.attributes.position
  const centro = new Vector3()
  const v = new Vector3()
  for (let k = 0; k < pp.count; k++) {
    const t = Math.floor(k / 15) / 24
    curva.getPoint(t, centro)
    v.fromBufferAttribute(pp, k).sub(centro).multiplyScalar(1 - t * 0.55).add(centro)
    pp.setXYZ(k, v.x, v.y, v.z)
  }
  pico.computeVertexNormals()
  tetera.add(new Mesh(pico, menta))
  const asa = new Mesh(new TorusGeometry(0.15, 0.032, 12, 28, Math.PI * 1.15), menta)
  asa.position.set(-0.38, 0.24, 0)
  asa.rotation.z = Math.PI * 0.42
  tetera.add(asa)
  tetera.position.set(-0.14, 0.036, -0.1)
  tetera.scale.setScalar(0.92)
  g.add(tetera)
  const te = glaseado('#9A4E12', 0.1)
  te.map = texTe().color
  const tz = taza(0.15, 0.16, blanca, blanca, te)
  tz.position.set(0.44, 0.036, 0.34)
  tz.rotation.y = -0.6
  g.add(tz)
  return guardar(g)
}

export function tostados(): Pieza3D {
  const g = new Group()
  g.add(plato())
  const arriba = texturado(texPanArriba(), 0.82, 0.02)
  const miga = texturado(texMiga(), 0.9, 0.01)
  const jamon = texturado(texJamon(), 0.55, 0.004)
  const queso = glaseado('#F2C24F', 0.35)
  // medio tostado: triángulo de pan de miga con jamón y queso, con las esquinas redondeadas
  const tri = new Shape()
  const pts: [number, number][] = [
    [-0.36, -0.3],
    [0.38, -0.3],
    [-0.36, 0.38],
  ]
  const r = 0.05
  pts.forEach(([x, y], i) => {
    const [nx, ny] = pts[(i + 1) % 3]
    const [px, py] = pts[(i + 2) % 3]
    const a = new Vector2(px - x, py - y).normalize().multiplyScalar(r)
    const b = new Vector2(nx - x, ny - y).normalize().multiplyScalar(r)
    if (i === 0) tri.moveTo(x + a.x, y + a.y)
    else tri.lineTo(x + a.x, y + a.y)
    tri.quadraticCurveTo(x, y, x + b.x, y + b.y)
  })
  tri.closePath()
  const capa = (alto: number, escala: number, mTapa: Material, mLado: Material, y: number) => {
    const geo = new ExtrudeGeometry(tri, { depth: alto, bevelEnabled: true, bevelThickness: alto * 0.25, bevelSize: 0.02, bevelSegments: 3, curveSegments: 6 })
    geo.rotateX(-Math.PI / 2)
    // UV de las caras en función del tamaño real, para que la textura no se estire
    const uv = geo.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1.3 + 0.5, uv.getY(i) * 1.3 + 0.5)
    const m = new Mesh(geo, [mTapa, mLado])
    m.scale.set(escala, 1, escala)
    m.position.y = y
    return m
  }
  const medio = () => {
    const s = new Group()
    s.add(capa(0.09, 1, arriba, miga, 0.0))
    s.add(capa(0.022, 0.98, jamon, jamon, 0.115))
    s.add(capa(0.026, 1.02, queso, queso, 0.14))
    s.add(capa(0.09, 1, arriba, miga, 0.17))
    return s
  }
  const a = medio()
  a.position.set(-0.08, 0.05, 0.08)
  a.rotation.y = 0.25
  const b = medio()
  b.position.set(0.16, 0.05, -0.08)
  b.rotation.set(0.08, Math.PI + 0.55, 0)
  b.position.y = 0.12
  g.add(a, b)
  // queso derretido que cae por el corte
  const gota = new CylinderGeometry(0.018, 0.026, 0.07, 10)
  for (const [x, z] of [
    [0.02, 0.06],
    [-0.12, 0.2],
  ] as const) {
    const d = new Mesh(gota, queso)
    d.position.set(x, 0.16, z)
    a.add(d)
  }
  return guardar(g)
}

export function ensaladas(): Pieza3D {
  const g = new Group()
  // bowl: blanco por dentro, menta por fuera
  const ext = lathe([
    [0, 0],
    [0.3, 0],
    [0.33, 0.03],
    [0.58, 0.16],
    [0.72, 0.34],
    [0.74, 0.37],
  ])
  const int = lathe([
    [0.74, 0.37],
    [0.7, 0.36],
    [0.56, 0.2],
    [0.3, 0.07],
    [0, 0.06],
  ])
  g.add(new Mesh(ext, esmalte(COLOR.menta, 0.26)), new Mesh(int, esmalte(COLOR.ceramica)))
  const hojas = [texHoja('#6E9B2F', '#B5D162'), texHoja('#4F7A2A', '#93B548'), texHoja('#7FA83A', '#CFE07F')].map(
    (t) => new MeshStandardMaterial({ map: t.color, bumpMap: t.relieve, bumpScale: 0.004, alphaTest: 0.5, side: DoubleSide, roughness: 0.6 }),
  )
  // hoja curvada: un plano que se arquea a lo largo y se ondula en el borde
  const hojaGeo = new PlaneGeometry(0.34, 0.42, 10, 12)
  const hp = hojaGeo.attributes.position
  for (let i = 0; i < hp.count; i++) {
    const x = hp.getX(i)
    const y = hp.getY(i)
    const z = -((y + 0.21) ** 2) * 0.9 + x * x * 1.6 + Math.sin(y * 40 + x * 20) * 0.012 * Math.abs(x * 4)
    hp.setXYZ(i, x, y + 0.21, z)
  }
  hojaGeo.computeVertexNormals()
  for (let i = 0; i < 18; i++) {
    const m = new Mesh(hojaGeo, hojas[i % 3])
    const a = (i / 18) * Math.PI * 2 * 1.6
    const r = 0.06 + (i % 5) * 0.08
    m.position.set(Math.cos(a) * r, 0.16 + (i % 4) * 0.035, Math.sin(a) * r)
    m.rotation.set(-1.1 + (i % 3) * 0.25, -a + Math.PI / 2, (i % 5) * 0.35 - 0.6)
    g.add(m)
  }
  // tomates cherry al medio
  const piel = glaseado('#D2301C', 0.25)
  const corte = new MeshStandardMaterial({ map: texTomate().color, roughness: 0.35 })
  const medioTomate = new SphereGeometry(0.075, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)
  const tapaTomate = new CircleGeometry(0.075, 24)
  for (let i = 0; i < 4; i++) {
    const t = new Group()
    t.add(new Mesh(medioTomate, piel))
    const c = new Mesh(tapaTomate, corte)
    c.rotation.x = Math.PI / 2
    t.add(c)
    const a = i * 1.62 + 0.4
    t.position.set(Math.cos(a) * 0.27, 0.33, Math.sin(a) * 0.27)
    // la cara cortada mira hacia arriba y un poco afuera
    t.rotation.set(Math.PI + 0.5, a, 0)
    g.add(t)
  }
  // huevo duro en mitades
  const clara = mat({ color: '#FFFDF6', roughness: 0.4 })
  const yema = new MeshStandardMaterial({ map: texHuevo().color, roughness: 0.6 })
  for (let i = 0; i < 2; i++) {
    const h = new Group()
    const cuerpo = new Mesh(new SphereGeometry(0.09, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), clara)
    cuerpo.scale.set(1, 1.35, 1)
    const cara = new Mesh(new CircleGeometry(0.09, 24), yema)
    cara.rotation.x = Math.PI / 2
    h.add(cuerpo, cara)
    h.rotation.set(Math.PI / 2 + 0.9, 0, i ? 0.6 : -0.4)
    h.position.set(i ? 0.12 : -0.08, 0.36, i ? -0.06 : 0.1)
    g.add(h)
  }
  return guardar(g)
}

export function cheesecake(): Pieza3D {
  const g = new Group()
  g.add(plato())
  const corte = texCorteCheesecake()
  const lado = texCorteCheesecake(true)
  const p = porcion(0.66, 0.95, 0.36, texturado(corte, 0.62, 0.008, { side: DoubleSide }), texturado(lado, 0.6, 0.008), mat({ color: '#E9C58C', roughness: 0.55 }))
  p.position.y = 0.036
  g.add(p)
  // coulis de frutos rojos: una lámina brillante sobre la porción, con gotas por el borde
  const coulis = glaseado('#9E1426', 0.12)
  const capa = new Mesh(new CircleGeometry(0.6, 32, -0.4, 0.8), coulis)
  capa.rotation.x = -Math.PI / 2
  capa.position.set(-0.66 * 0.42 + 0.02, 0.036 + 0.365, 0)
  g.add(capa)
  for (const [a, l] of [
    [0.2, 0.09],
    [-0.15, 0.14],
    [0.05, 0.06],
  ] as const) {
    const d = new Mesh(new CylinderGeometry(0.02, 0.012, l, 10), coulis)
    const r = 0.66
    d.position.set(-r * 0.42 + Math.cos(a) * r * 1.002, 0.036 + 0.36 - l / 2, Math.sin(a) * r)
    g.add(d)
  }
  const fr = frambuesa(0.07)
  const mFr = mat({ color: '#B4233A', roughness: 0.38 })
  const ar = arandano()
  const mAr = mat({ color: '#2F3A64', roughness: 0.55 })
  const frutos: [number, number, boolean][] = [
    [-0.12, 0.05, true],
    [0.06, -0.06, false],
    [0.1, 0.07, false],
    [-0.02, -0.12, true],
    [0.18, 0.0, false],
  ]
  for (const [x, z, esFr] of frutos) {
    const m = new Mesh(esFr ? fr : ar, esFr ? mFr : mAr)
    m.position.set(x, 0.036 + 0.36 + (esFr ? 0.01 : 0.05), z)
    m.rotation.y = x * 10
    g.add(m)
  }
  return guardar(g)
}

export function tortaDeChocolate(): Pieza3D {
  const g = new Group()
  g.add(plato())
  const corte = texCorteTorta()
  const gan = texGanache()
  const ganache = new MeshPhysicalMaterial({ map: gan.color, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 })
  const p = porcion(0.64, 0.9, 0.44, texturado(corte, 0.7, 0.012, { side: DoubleSide }), ganache, ganache)
  p.position.y = 0.036
  g.add(p)
  // frambuesas arriba y virutas de chocolate
  const fr = frambuesa(0.072)
  const mFr = mat({ color: '#B4233A', roughness: 0.38 })
  for (const [x, z] of [
    [-0.06, 0.0],
    [0.1, 0.06],
    [0.08, -0.08],
  ] as const) {
    const m = new Mesh(fr, mFr)
    m.position.set(x, 0.036 + 0.44 + 0.012, z)
    g.add(m)
  }
  const viruta = new TorusGeometry(0.03, 0.008, 6, 14, Math.PI * 1.5)
  const mV = mat({ color: '#3A1D12', roughness: 0.5 })
  for (let i = 0; i < 6; i++) {
    const m = new Mesh(viruta, mV)
    m.position.set(-0.2 + (i % 3) * 0.12, 0.036 + 0.45, -0.1 + Math.floor(i / 3) * 0.2)
    m.rotation.set(i, i * 2, 0)
    g.add(m)
  }
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
      const s = mm as MeshStandardMaterial
      s.map?.dispose()
      s.bumpMap?.dispose()
      mm.dispose()
    }
  })
}

