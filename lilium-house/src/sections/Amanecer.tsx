import { lazy, Suspense, useRef, type ReactNode } from 'react'
import { Leaf, Monstera } from '../components/Botanica'
import { BananaLeaf, Calathea, Fern, HeartLeaf, PalmFrond } from '../components/Flora'
import { LilyMark } from '../components/Icons'
import { gsap, MOTION_OK, useGsap } from '../lib/gsap'

// three.js se carga en un chunk aparte: el texto pinta primero
const LilyCanvas = lazy(() => import('../components/three/LilyCanvas'))

/**
 * Cortina de hojas, asimétrica: cada hoja tiene especie, ángulo, distancia y momento
 * propios. La izquierda se abre primero y rápido (cae hacia afuera); la derecha arranca
 * después, más lenta, y se despliega hacia arriba. [inicio, fin] en progreso del hero.
 */
type CurtainLeaf = {
  key: string
  el: ReactNode
  box: string
  from: gsap.TweenVars
  to: gsap.TweenVars
  at: [number, number]
}

const CURTAIN: CurtainLeaf[] = [
  // izquierda
  { key: 'banana-l', el: <BananaLeaf color="#6F7F2E" className="w-full" />, box: '-bottom-[6%] left-[-10vw] w-[46vw] max-w-[340px]', from: { rotation: 16 }, to: { rotation: -40, x: '-42vw' }, at: [0, 0.42] },
  { key: 'heart-l', el: <HeartLeaf color="#2F4A22" className="w-full" />, box: 'bottom-[10%] left-[16vw] w-[24vw] max-w-[180px]', from: { rotation: 38 }, to: { rotation: -20, x: '-48vw', scale: 0.7 }, at: [0.06, 0.46] },
  { key: 'monstera-l', el: <Monstera color="#415521" className="w-full" />, box: '-bottom-[10%] left-[-40vw] w-[92vw] max-w-[700px]', from: { rotation: 26 }, to: { rotation: -44, x: '-60vw' }, at: [0.02, 0.38] },
  { key: 'fern-l', el: <Fern color="#97AD3D" className="w-full" />, box: '-bottom-[4%] left-[4vw] w-[30vw] max-w-[220px]', from: { rotation: 32 }, to: { rotation: -12, x: '-34vw', yPercent: 20 }, at: [0.04, 0.34] },
  // derecha
  { key: 'palm-r', el: <PalmFrond color="#415521" className="w-full -scale-x-100" />, box: '-bottom-[8%] right-[-30vw] w-[90vw] max-w-[680px]', from: { rotation: -22 }, to: { rotation: 16, x: '44vw', yPercent: -6 }, at: [0.12, 0.72] },
  { key: 'fern-r', el: <Fern color="#6F7F2E" className="w-full -scale-x-100" />, box: 'bottom-[3%] right-[22vw] w-[26vw] max-w-[190px]', from: { rotation: -40 }, to: { rotation: -74, x: '52vw' }, at: [0.24, 0.62] },
  { key: 'monstera-r', el: <Monstera color="#33441A" className="w-full -scale-x-100" />, box: '-bottom-[14%] right-[-36vw] w-[82vw] max-w-[620px]', from: { rotation: -30 }, to: { rotation: 32, x: '68vw' }, at: [0.18, 0.64] },
  { key: 'calathea-r', el: <Calathea color="#2F4A22" className="w-full" />, box: '-bottom-[6%] right-[2vw] w-[28vw] max-w-[210px]', from: { rotation: -16 }, to: { rotation: 22, x: '40vw', yPercent: 8 }, at: [0.1, 0.56] },
]

/**
 * 01–02 · Amanecer. Escena fijada: la cortina se abre con el scroll, el sol sube,
 * el fondo pasa de durazno a crema y aparece la bajada.
 */
export function Amanecer() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, () => {
    const q = gsap.utils.selector(ref)
    CURTAIN.forEach((l) => gsap.set(q(`[data-leaf="${l.key}"]`), { transformOrigin: '50% 100%', ...l.from }))

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: 0.9 },
    })
    CURTAIN.forEach((l) => {
      tl.to(q(`[data-leaf="${l.key}"]`), { ...l.to, duration: l.at[1] - l.at[0], ease: 'power2.inOut' }, l.at[0])
    })
    tl.to(ref.current, { backgroundColor: '#FAF7F2', duration: 0.55 }, 0)
      .to(q('[data-sun]'), { yPercent: -60, scale: 1.35, duration: 1 }, 0)
      .to(q('[data-title]'), { y: '-4vh', scale: 0.82, duration: 0.7 }, 0)
      .fromTo(q('[data-lily]'), { scale: 0.9 }, { scale: 1.08, duration: 0.6 }, 0)
      .fromTo(q('[data-tagline]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 0.4)
      .to(q('[data-hint]'), { autoAlpha: 0, duration: 0.12 }, 0)
      .set({}, {}, 1)

    // cada hoja respira a su ritmo (nunca dos iguales)
    gsap.matchMedia().add(MOTION_OK, () => {
      q('[data-sway]').forEach((el, i) => {
        gsap.to(el, {
          rotation: gsap.utils.random(1.5, 4) * (i % 2 ? 1 : -1),
          duration: gsap.utils.random(3, 7),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.37,
          transformOrigin: '50% 100%',
        })
      })
      gsap.to(q('[data-sprout]'), { rotation: 8, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 100%' })
    })
  })

  return (
    <section
      ref={ref}
      id="amanecer"
      data-phase="#F4E4CC|#3D2314|08:00"
      className="relative z-[1] h-[230svh] bg-[#F4E4CC]"
      aria-label="Amanecer en Lilium"
    >
      <div className="absolute top-[55%]" data-phase="#FAF7F2|#3D2314|08:40" />
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* sol */}
        <div
          data-sun=""
          className="absolute top-[22%] left-1/2 h-[min(70vw,420px)] w-[min(70vw,420px)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(217_164_65/0.5),rgb(217_164_65/0.16)_55%,transparent_70%)]"
        />

        <div data-title="" className="relative z-10 pt-[max(5.5rem,12svh)] text-center">
          <p className="text-[0.7rem] font-semibold tracking-[0.3em] text-turquesa-dark uppercase">Coffee Lounge · Puerto Iguazú</p>
          <h1 className="mt-1 font-script text-[clamp(4.6rem,21vw,10rem)] leading-[1.05] text-madera">Lilium</h1>
        </div>

        {/* lirio 3D */}
        <div
          data-lily=""
          className="absolute top-[52%] left-1/2 aspect-square w-[min(96vw,64svh,640px)] -translate-x-1/2 -translate-y-1/2"
        >
          <Suspense
            fallback={
              <div className="grid h-full place-items-center">
                <LilyMark className="h-24 w-24 animate-pulse text-turquesa" />
              </div>
            }
          >
            <div className="h-full w-full [mask-image:linear-gradient(to_bottom,black_60%,transparent_92%)]">
              <LilyCanvas />
            </div>
          </Suspense>
        </div>

        <p
          data-tagline=""
          className="invisible absolute inset-x-0 bottom-[11svh] z-20 mx-auto max-w-xl px-9 text-center font-display text-[clamp(1.35rem,5.2vw,2rem)] leading-snug text-balance text-madera"
        >
          Desayunos, almuerzos y meriendas con café de especialidad, en el corazón verde de Puerto Iguazú.
        </p>

        {/* cortina de hojas */}
        {CURTAIN.map((l) => (
          <div key={l.key} data-leaf={l.key} className={`absolute z-20 ${l.box}`}>
            <div data-sway="">{l.el}</div>
          </div>
        ))}

        {/* pista de scroll: un brote */}
        <div data-hint="" className="absolute inset-x-0 bottom-[max(1.5rem,4svh)] z-30 flex flex-col items-center gap-1 text-crema">
          <div data-sprout="">
            <Leaf className="h-7 w-7 -rotate-12" color="#D9A441" />
          </div>
          <span className="font-hand text-2xl leading-none [text-shadow:0_1px_8px_rgb(0_0_0/0.35)]">Deslizá para que amanezca</span>
        </div>
      </div>
    </section>
  )
}
