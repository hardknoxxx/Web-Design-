import { gsap } from './gsap'

/*
 * Animaciones cuadro a cuadro hechas con Remotion (carpeta animaciones/) y exportadas como
 * hojas de sprites. Se reproducen moviendo el fondo de un elemento: sin JS pesado ni video.
 */

export type Sprite = { url: string; frames: number; cols: number; rows: number }

export const PAPEL: Sprite = { url: '/anim/papel-comanda.webp', frames: 12, cols: 4, rows: 3 }

export const spriteStyle = (s: Sprite) => ({
  backgroundImage: `url(${s.url})`,
  backgroundSize: `${s.cols * 100}% ${s.rows * 100}%`,
  backgroundRepeat: 'no-repeat',
})

export function setFrame(el: HTMLElement, s: Sprite, i: number) {
  const f = Math.max(0, Math.min(s.frames - 1, i))
  // el cuadro actual queda anotado: si se cierra a mitad de camino, vuelve desde ahí
  el.dataset.frame = String(f)
  const c = f % s.cols
  const r = Math.floor(f / s.cols)
  el.style.backgroundPosition = `${(c / (s.cols - 1)) * 100}% ${(r / (s.rows - 1)) * 100}%`
}

/**
 * Tween que recorre los cuadros (de `from` a `to`) mostrando siempre un cuadro entero.
 * El fondo se asigna recién acá: un `background-image` en el HTML se descarga apenas carga la
 * página aunque el elemento esté oculto, y le quitaba conexión al lirio del hero.
 */
export function playSprite(el: HTMLElement, s: Sprite, from: number, to: number, duration: number) {
  if (!el.style.backgroundImage) Object.assign(el.style, spriteStyle(s))
  const p = { f: from }
  setFrame(el, s, from)
  return gsap.to(p, { f: to, duration, ease: 'none', onUpdate: () => setFrame(el, s, Math.round(p.f)) })
}

// se guarda la imagen ya decodificada: si el GC la suelta, el teléfono vuelve a decodificar
// la hoja de cuadros entera justo en el toque
const warm: HTMLImageElement[] = []

/**
 * Descarga y decodifica el sprite de la comanda cuando el navegador está libre, así el primer
 * toque ya es inmediato. Espera a `after` (el lirio del hero): en 4G lento competían por la
 * conexión y el lirio tardaba el doble en aparecer.
 */
export function preloadSprites(after: Promise<unknown>) {
  let done = false
  const go = () => {
    if (done) return
    done = true
    const img = new Image()
    img.src = PAPEL.url
    img.decode().catch(() => {})
    warm.push(img)
  }
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 3000 }) : setTimeout(go, 1500))
  after.then(idle)
  // sin WebGL o con la página abierta más abajo el lirio no llega a dibujarse: igual se precargan
  setTimeout(idle, 9000)
}
