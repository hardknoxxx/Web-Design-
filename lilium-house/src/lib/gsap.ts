import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type DependencyList, type RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const MOTION_OK = '(prefers-reduced-motion: no-preference)'
export const MOTION_REDUCED = '(prefers-reduced-motion: reduce)'

/**
 * Corre animaciones GSAP dentro de un contexto ligado al elemento: todo lo que se cree
 * (tweens, ScrollTriggers, matchMedia) se revierte al desmontar.
 */
export function useGsap(scope: RefObject<Element | null>, setup: (ctx: gsap.Context) => void, deps: DependencyList = []) {
  useLayoutEffect(() => {
    if (!scope.current) return
    const ctx = gsap.context(setup, scope.current)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Pausa animaciones en bucle (vaivén, aleteo) mientras su escena no está en pantalla:
 * en el teléfono cada una repinta en cada frame aunque nadie la vea.
 */
export function pauseOffscreen(trigger: Element | null, anims: (gsap.core.Animation | undefined)[]) {
  const list = anims.filter(Boolean) as gsap.core.Animation[]
  const set = (on: boolean) => list.forEach((a) => (on ? a.resume() : a.pause()))
  const st = ScrollTrigger.create({ trigger, start: 'top bottom', end: 'bottom top', onToggle: (self) => set(self.isActive) })
  set(st.isActive)
  return st
}

// Recalcula posiciones cuando cargan fuentes e imágenes (los pins dependen de alturas reales)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => ScrollTrigger.refresh())
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
}
