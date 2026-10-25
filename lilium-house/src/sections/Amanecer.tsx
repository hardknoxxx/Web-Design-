import { m } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { Leaf, Monstera } from '../components/Botanica'
import { LirioBoceto } from '../components/LirioBoceto'
import { BananaLeaf, Calathea, Fern, HeartLeaf, PalmFrond } from '../components/Flora'
import { SelvaLejana, Sotobosque } from '../components/Paisaje'
import { gsap, MOTION_OK, pauseOffscreen, useGsap } from '../lib/gsap'

// three.js se carga en un chunk aparte: el texto pinta primero. La descarga arranca apenas se
// evalúa este módulo (no recién cuando React monta el hero, ~1 s después en un teléfono lento)
// Si el chunk no llega (red caída), el hero se queda con el boceto ilustrado: sin esto, el
// error subía hasta la raíz y la página entera quedaba en blanco
const lilyChunk: Promise<{ default: ComponentType<{ onReady?: () => void }> }> = import('../components/three/LilyCanvas').catch(() => ({
  default: () => null,
}))
const LilyCanvas = lazy(() => lilyChunk)

// entrada del hero al cargar: el nombre sube primero, después la bajada y al final la pista
const EASE = [0.22, 1, 0.36, 1] as const
const intro = (delay: number, y = 28) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.1, ease: EASE, delay },
})

// se resuelve cuando el lirio 3D dibujó su primer cuadro: recién ahí se precargan los sprites
let markLilyReady = () => {}
export const lilyReady = new Promise<void>((resolve) => (markLilyReady = resolve))

/**
 * Plantas que nacen del suelo (el tallo sigue por debajo del borde): cada una con especie,
 * ángulo y momento propios. La izquierda brota primero y rápido; la derecha después y
 * más lenta. [inicio, fin] en progreso del hero.
 */
type Plant = {
  key: string
  el: ReactNode
  box: string
  from: gsap.TweenVars
  to: gsap.TweenVars
  at: [number, number]
}

const MID: Plant[] = [
  // izquierda
  { key: 'banana-l', el: <BananaLeaf color="#6F7F2E" stem={180} className="w-full" />, box: 'bottom-0 left-[-12vw] w-[38vw] max-w-[420px]', from: { scale: 0.12, rotation: -40 }, to: { scale: 1, rotation: -14 }, at: [0.16, 0.38] },
  { key: 'calathea-l', el: <Calathea color="#2F4A22" stem={220} className="w-full" />, box: 'bottom-0 left-[4vw] w-[19vw] max-w-[220px]', from: { scale: 0.1, rotation: -26 }, to: { scale: 1, rotation: -4 }, at: [0.2, 0.42] },
  { key: 'heart-l', el: <HeartLeaf color="#415521" stem={240} className="w-full" />, box: 'bottom-[1%] left-[17vw] w-[20vw] max-w-[230px]', from: { scale: 0.1, rotation: -54 }, to: { scale: 1, rotation: -24 }, at: [0.24, 0.44] },
  // derecha
  { key: 'fern-r', el: <Fern color="#6F7F2E" stem={140} className="w-full -scale-x-100" />, box: 'bottom-0 right-[15vw] w-[24vw] max-w-[270px]', from: { scale: 0.1, rotation: 34 }, to: { scale: 1, rotation: 12 }, at: [0.3, 0.58] },
  { key: 'banana-r', el: <BananaLeaf color="#5E7A2A" stem={180} className="w-full" />, box: 'bottom-0 right-[-10vw] w-[34vw] max-w-[380px]', from: { scale: 0.1, rotation: 44 }, to: { scale: 1, rotation: 18 }, at: [0.34, 0.62] },
  { key: 'heart-r', el: <HeartLeaf color="#2F4A22" stem={240} className="w-full" />, box: 'bottom-[2%] right-[4vw] w-[17vw] max-w-[200px]', from: { scale: 0.1, rotation: 56 }, to: { scale: 1, rotation: 28 }, at: [0.38, 0.6] },
]

const FRONT: Plant[] = [
  { key: 'monstera-l', el: <Monstera color="#33441A" stem={220} className="w-full" />, box: 'bottom-0 -left-[36vw] lg:-left-[24vw] w-[84vw] max-w-[900px]', from: { scale: 0.25, rotation: -50 }, to: { scale: 1, rotation: 26 }, at: [0.47, 0.7] },
  { key: 'fern-l', el: <Fern color="#97AD3D" stem={120} className="w-full" />, box: 'bottom-0 left-[14vw] w-[28vw] max-w-[320px]', from: { scale: 0.1, rotation: -14 }, to: { scale: 1, rotation: -32 }, at: [0.52, 0.72] },
  { key: 'palm-r', el: <PalmFrond color="#415521" stem={220} className="w-full -scale-x-100" />, box: 'bottom-0 -right-[32vw] lg:-right-[24vw] w-[84vw] max-w-[900px]', from: { scale: 0.25, rotation: 54 }, to: { scale: 1, rotation: -24 }, at: [0.55, 0.78] },
]

/**
 * 01–02 · Amanecer. Se abre limpio: el lirio, el sol y el pasto. Al scrollear la selva
 * lejana sube, las plantas brotan del suelo y, al final, la cámara atraviesa el follaje
 * (cada plano a su escala) para entrar al café, donde espera la taza.
 */
export function Amanecer() {
  const ref = useRef<HTMLElement>(null)
  // boceto ilustrado mientras baja three.js; se retira después del fundido cruzado
  const [lily, setLily] = useState<'loading' | 'ready' | 'done'>('loading')
  useEffect(() => {
    if (lily !== 'ready') return
    markLilyReady()
    const t = setTimeout(() => setLily('done'), 800)
    return () => clearTimeout(t)
  }, [lily])

  useGsap(ref, () => {
    const q = gsap.utils.selector(ref)
    ;[...MID, ...FRONT].forEach((l) => gsap.set(q(`[data-plant="${l.key}"]`), { transformOrigin: '50% 100%', ...l.from }))

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: 0.9 },
    })
    tl.to(q('[data-hint]'), { autoAlpha: 0, duration: 0.1 }, 0)
      .to(q('[data-sun]'), { yPercent: -60, scale: 1.35, duration: 0.7 }, 0)
      .to(q('[data-title]'), { y: '-4vh', scale: 0.82, duration: 0.4 }, 0)
      .fromTo(q('[data-tagline]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.05)
      // la selva sube y las plantas brotan
      .fromTo(q('[data-layer="far"]'), { yPercent: 70 }, { yPercent: 0, duration: 0.36, ease: 'power2.out' }, 0.12)
      .fromTo(q('[data-layer="soto"]'), { yPercent: 0 }, { yPercent: -12, duration: 0.4 }, 0.2)
    ;[...MID, ...FRONT].forEach((l) => {
      tl.to(q(`[data-plant="${l.key}"]`), { ...l.to, duration: l.at[1] - l.at[0], ease: 'back.out(1.15)' }, l.at[0])
    })
    tl.to(q('[data-tagline]'), { autoAlpha: 0, y: -20, duration: 0.06 }, 0.4)
      // el nombre se va despacio: sube un poco y se desvanece a lo largo de un tramo largo
      .to(q('[data-title]'), { autoAlpha: 0, y: '-9vh', duration: 0.3, ease: 'sine.inOut' }, 0.42)
      // las plantas se abren hacia los costados, como quien corre el follaje con la mano
      .to(q('[data-layer="far"]'), { yPercent: 18, autoAlpha: 0, duration: 0.3, ease: 'sine.in' }, 0.66)
      .to(q('[data-lily]'), { autoAlpha: 0, duration: 0.2, ease: 'sine.inOut' }, 0.66)
    ;[...MID, ...FRONT].forEach((l, i) => {
      const left = l.key.endsWith('-l')
      tl.to(
        q(`[data-plant="${l.key}"]`),
        { x: left ? '-62vw' : '62vw', rotation: `${left ? '-' : '+'}=${14 + (i % 3) * 6}`, duration: 0.3 + (i % 3) * 0.04, ease: 'power2.inOut' },
        0.64 + (left ? 0 : 0.03) + (i % 3) * 0.02,
      )
    })
    tl
      // el suelo baja suave
      .to(q('[data-layer="soto"]'), { yPercent: 80, duration: 0.26, ease: 'sine.in' }, 0.74)
      .to(q('[data-sun]'), { autoAlpha: 0, duration: 0.14 }, 0.8)
      .fromTo(q('[data-shade]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.14 }, 0.68)
      .to(q('[data-shade]'), { autoAlpha: 0, duration: 0.14 }, 0.86)
      .set({}, {}, 1)

    // cada planta respira a su ritmo (nunca dos iguales)
    gsap.matchMedia().add(MOTION_OK, () => {
      const loops = q('[data-sway]').map((el, i) =>
        gsap.to(el, {
          rotation: gsap.utils.random(1.5, 3.5) * (i % 2 ? 1 : -1),
          duration: gsap.utils.random(3, 7),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.37,
          transformOrigin: '50% 100%',
        }),
      )
      loops.push(gsap.to(q('[data-sprout]'), { rotation: 8, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 100%' }))
      pauseOffscreen(ref.current, loops)
    })
  })

  const plants = (list: Plant[]) =>
    list.map((l) => (
      <div key={l.key} data-plant={l.key} className={`absolute ${l.box}`}>
        <div data-sway="" className="origin-bottom">
          {l.el}
        </div>
      </div>
    ))

  return (
    <section
      ref={ref}
      id="amanecer"
      data-phase="#F4E4CC|#3D2314|08:00"
      className="relative z-[2] h-[250svh]"
      aria-label="Amanecer en Lilium"
    >
      <div className="absolute top-[55%]" data-phase="#FAF7F2|#3D2314|08:40" />
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* sol */}
        <div
          data-sun=""
          className="absolute top-[22%] left-1/2 h-[min(70vw,420px)] w-[min(70vw,420px)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(217_164_65/0.5),rgb(217_164_65/0.16)_55%,transparent_70%)]"
        />

        {/* selva lejana, en bruma */}
        <div data-layer="far" className="absolute inset-x-0 bottom-0 h-[46svh] origin-[50%_100%]" aria-hidden="true">
          <SelvaLejana className="h-full w-full" />
        </div>

        <div data-title="" className="relative z-10 pt-[max(5.5rem,12svh)] text-center">
          {/* como en el logo: el nombre arriba y "Coffee Lounge" debajo */}
          <h1 className="font-script text-[clamp(4.6rem,21vw,10rem)] leading-[1.05] text-madera">
            <m.span className="block" {...intro(0.05, 34)}>
              Lilium
            </m.span>
            <m.span
              className="mt-1 block font-sans text-[0.7rem] font-semibold tracking-[0.34em] text-turquesa-dark uppercase sm:text-xs"
              {...intro(0.3, 14)}
            >
              Coffee Lounge · Puerto Iguazú
            </m.span>
          </h1>
        </div>

        {/* lirio 3D (optimizado para teléfonos) */}
        <div
          data-lily=""
          className="absolute top-[52%] left-1/2 z-[5] aspect-square w-[min(96vw,64svh,640px)] -translate-x-1/2 -translate-y-1/2"
        >
          {lily !== 'done' && <LirioBoceto hidden={lily === 'ready'} />}
          <div className={`absolute inset-0 transition-opacity duration-700 ${lily === 'loading' ? 'opacity-0' : ''}`}>
            <Suspense fallback={null}>
              <LilyCanvas onReady={() => setLily((s) => (s === 'loading' ? 'ready' : s))} />
            </Suspense>
          </div>
        </div>

        <div data-layer="mid" className="pointer-events-none absolute inset-0 z-[6] origin-[50%_82%]" aria-hidden="true">
          {plants(MID)}
        </div>

        {/* sotobosque: el suelo de todas las plantas */}
        <div data-layer="soto" className="pointer-events-none absolute inset-x-0 -bottom-2 z-[7] h-[13svh] origin-[50%_100%]" aria-hidden="true">
          <Sotobosque className="h-full w-full" />
        </div>

        <p
          data-tagline=""
          className="invisible absolute inset-x-0 bottom-[16svh] z-20 mx-auto max-w-xl px-9 text-center font-display text-[clamp(1.35rem,5.2vw,2rem)] leading-snug text-balance text-madera [text-shadow:0_1px_12px_rgb(250_247_242/0.9)]"
        >
          Desayunos, almuerzos y meriendas con café de especialidad, en el corazón verde de Puerto Iguazú.
        </p>

        <div data-layer="front" className="pointer-events-none absolute inset-0 z-[25] origin-[50%_74%]" aria-hidden="true">
          {plants(FRONT)}
        </div>

        {/* sombra verde al atravesar el follaje */}
        <div
          data-shade=""
          className="pointer-events-none invisible absolute inset-0 z-[26] bg-[radial-gradient(ellipse_at_50%_55%,transparent_35%,rgb(34_53_30/0.55)_100%)]"
          aria-hidden="true"
        />

        {/* pista de scroll: un brote */}
        <div data-hint="" className="absolute inset-x-0 bottom-[15svh] z-30 text-madera">
          <m.div className="flex flex-col items-center gap-1" {...intro(0.9, 16)}>
            <div data-sprout="">
              <Leaf className="h-7 w-7 -rotate-12" color="#D9A441" />
            </div>
            <span className="font-hand text-2xl leading-none">Deslizá y entrá</span>
          </m.div>
        </div>
      </div>
    </section>
  )
}
