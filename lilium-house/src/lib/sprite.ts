import { gsap } from './gsap'

/*
 * Animaciones cuadro a cuadro hechas con Remotion (carpeta animaciones/) y exportadas como
 * hojas de sprites. Se reproducen moviendo el fondo de un elemento: sin JS pesado ni video.
 */

export type Sprite = { url: string; frames: number; cols: number; rows: number }

export const HOJA: Sprite = { url: '/anim/hoja-menu.webp', frames: 20, cols: 5, rows: 4 }
export const PAPEL: Sprite = { url: '/anim/papel-comanda.webp', frames: 12, cols: 4, rows: 3 }

export const spriteStyle = (s: Sprite) => ({
  backgroundImage: `url(${s.url})`,
  backgroundSize: `${s.cols * 100}% ${s.rows * 100}%`,
  backgroundRepeat: 'no-repeat',
})

export function setFrame(el: HTMLElement, s: Sprite, i: number) {
  const f = Math.max(0, Math.min(s.frames - 1, i))
  const c = f % s.cols
  const r = Math.floor(f / s.cols)
  el.style.backgroundPosition = `${(c / (s.cols - 1)) * 100}% ${(r / (s.rows - 1)) * 100}%`
}

/** Tween que recorre los cuadros (de `from` a `to`) mostrando siempre un cuadro entero. */
export function playSprite(el: HTMLElement, s: Sprite, from: number, to: number, duration: number) {
  const p = { f: from }
  setFrame(el, s, from)
  return gsap.to(p, { f: to, duration, ease: 'none', onUpdate: () => setFrame(el, s, Math.round(p.f)) })
}

/** Descarga los sprites cuando el navegador está libre, así el primer toque ya es inmediato. */
export function preloadSprites() {
  const go = () => [HOJA, PAPEL].forEach((s) => (new Image().src = s.url))
  if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 4000 })
  else setTimeout(go, 2500)
}
