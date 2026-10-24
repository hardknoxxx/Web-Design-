import { useRef, type PointerEvent } from 'react'
import { gsap, MOTION_OK, pauseOffscreen, useGsap } from '../lib/gsap'
import { LeafGradients } from './Flora'

/*
 * Lirio del hero, ilustrado en capas (hojas, pétalos de atrás, estambres, pétalos de adelante).
 * Cada capa es un SVG estático que se mueve solo con transform: florece al cargar, se mece,
 * sigue al dedo/cursor con paralaje (sensación de volumen sin WebGL) y late al tocarlo.
 */

const L = 150 // largo del pétalo
const petal = (w: number, l = L) =>
  `M0 0C${-w * 0.55} ${-l * 0.2} ${-w * 0.62} ${-l * 0.64} ${-w * 0.2} ${-l * 0.9}Q${-w * 0.02} ${-l * 1.03} ${w * 0.14} ${-l * 0.95}C${w * 0.62} ${-l * 0.68} ${w * 0.52} ${-l * 0.2} 0 0Z`

// vista de frente, apenas desde abajo: los pétalos laterales se acortan un poco
const BACK = [
  { a: 0, w: 78, l: 150 },
  { a: 122, w: 72, l: 140 },
  { a: 238, w: 72, l: 140 },
]
const FRONT = [
  { a: 58, w: 84, l: 154 },
  { a: 180, w: 76, l: 124 },
  { a: 302, w: 84, l: 154 },
]
const STAMENS = [-58, -34, -12, 14, 36, 60]

function Petals({ list, id, front }: { list: typeof BACK; id: string; front?: boolean }) {
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-p`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#F2CF8E" />
          <stop offset=".28" stopColor="#FBEEDD" />
          <stop offset=".7" stopColor="#FFFBF4" />
          <stop offset="1" stopColor="#F6E2C6" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#D9A56E" stopOpacity=".35" />
          <stop offset=".45" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset=".55" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#C98F5A" stopOpacity=".3" />
        </linearGradient>
      </defs>
      <g transform="translate(200 176) scale(1 0.9)">
        {list.map((p) => (
          <g key={p.a} transform={`rotate(${p.a})`}>
            <path d={petal(p.w, p.l)} fill={`url(#${id}-p)`} />
            <path d={petal(p.w, p.l)} fill={`url(#${id}-s)`} />
            <path d={`M0-6C${p.w * 0.06} ${-p.l * 0.4} ${-p.w * 0.04} ${-p.l * 0.7} 0 ${-p.l * 0.9}`} stroke="#E3BF8C" strokeOpacity=".75" strokeWidth="2" fill="none" />
            <path d={petal(p.w, p.l)} fill="none" stroke="#D9B48A" strokeOpacity={front ? 0.55 : 0.4} strokeWidth="1.2" />
            {front &&
              [0.22, 0.3, 0.38].map((t, k) => (
                <circle key={k} cx={(k - 1) * p.w * 0.12} cy={-p.l * t} r="1.6" fill="#C9824E" opacity=".55" />
              ))}
          </g>
        ))}
      </g>
    </svg>
  )
}

export function Lirio({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const id = 'lirio'

  useGsap(ref, () => {
    const q = gsap.utils.selector(ref)
    gsap.matchMedia().add(MOTION_OK, () => {
      // florece al cargar: cada capa abre a su ritmo
      gsap
        .timeline({ defaults: { ease: 'expo.out', transformOrigin: '50% 44%' } })
        .from(q('[data-layer="back"]'), { scale: 0.5, rotation: -14, opacity: 0, duration: 1.6 }, 0.1)
        .from(q('[data-layer="front"]'), { scale: 0.4, rotation: 12, opacity: 0, duration: 1.7 }, 0.25)
        .from(q('[data-layer="center"]'), { scale: 0.3, y: 30, opacity: 0, duration: 1.4 }, 0.5)
        .from(q('[data-layer="leaves"]'), { scaleY: 0.2, opacity: 0, duration: 1.2, transformOrigin: '50% 100%' }, 0)
      // se mece con la brisa (pausado fuera de pantalla)
      pauseOffscreen(ref.current, [
        gsap.to(q('[data-sway]'), { rotation: 2.2, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 100%' }),
        gsap.to(q('[data-layer="center"]'), { rotation: -3, duration: 2.7, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 44%' }),
      ])
    })
  })

  // paralaje con el dedo o el cursor: cada capa se corre distinto (profundidad)
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 2 - 1
    const y = ((e.clientY - r.top) / r.height) * 2 - 1
    const q = gsap.utils.selector(ref)
    const depth: [string, number][] = [['leaves', 4], ['back', 8], ['front', 13], ['center', 18]]
    depth.forEach(([k, d]) => gsap.to(q(`[data-layer="${k}"]`), { x: x * d, y: y * d * 0.6, duration: 0.8, ease: 'power3.out', overwrite: 'auto' }))
    gsap.to(q('[data-tilt]'), { rotation: x * 5, duration: 0.9, ease: 'power3.out', overwrite: 'auto' })
  }
  const reset = () => {
    const q = gsap.utils.selector(ref)
    gsap.to(q('[data-layer]'), { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' })
    gsap.to(q('[data-tilt]'), { rotation: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' })
  }
  const pulse = () => {
    const q = gsap.utils.selector(ref)
    gsap.fromTo(q('[data-pulse]'), { scale: 1 }, { scale: 1.07, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out', transformOrigin: '50% 44%' })
  }

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Lirio blanco: tocalo o mové el dedo para verlo moverse"
      className={`relative h-full w-full ${className}`}
      style={{ touchAction: 'pan-y' }}
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerUp={reset}
      onPointerDown={pulse}
    >
      <div data-sway="" className="absolute inset-0 origin-bottom">
        <div data-tilt="" className="absolute inset-0 origin-[50%_44%]">
          <div data-pulse="" className="absolute inset-0">
            {/* tallo y hojas */}
            <div data-layer="leaves" className="absolute inset-0 will-change-transform">
              <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                <defs>
                  <LeafGradients id={`${id}-l1`} color="#6F7F2E" />
                  <LeafGradients id={`${id}-l2`} color="#97AD3D" />
                  <linearGradient id={`${id}-st`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#5E7A2A" />
                    <stop offset=".5" stopColor="#97AD3D" />
                    <stop offset="1" stopColor="#415521" />
                  </linearGradient>
                </defs>
                <path d="M196 196C200 260 192 340 198 470L206 470C200 340 208 260 204 196Z" fill={`url(#${id}-st)`} />
                <path d="M199 300C170 290 130 300 86 330C130 318 168 316 199 312Z" fill={`url(#${id}-l1-x)`} stroke="#34451A" strokeOpacity=".35" />
                <path d="M201 270C232 252 276 256 320 276C278 274 236 280 201 284Z" fill={`url(#${id}-l2-x)`} stroke="#34451A" strokeOpacity=".35" />
              </svg>
            </div>
            <div data-layer="back" className="absolute inset-0 will-change-transform">
              <Petals list={BACK} id={`${id}-b`} />
            </div>
            <div data-layer="front" className="absolute inset-0 will-change-transform">
              <Petals list={FRONT} id={`${id}-f`} front />
            </div>
            {/* estambres y pistilo */}
            <div data-layer="center" className="absolute inset-0 will-change-transform">
              <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                <g transform="translate(200 176)">
                  {STAMENS.map((a, i) => {
                    const r = (a * Math.PI) / 180
                    const len = 92 + (i % 3) * 10
                    const ex = Math.sin(r) * len
                    const ey = -Math.cos(r) * len * 0.92
                    return (
                      <g key={a}>
                        <path d={`M0 0Q${ex * 0.3} ${ey * 0.6} ${ex} ${ey}`} stroke="#EADFC6" strokeWidth="2" fill="none" />
                        <rect x={ex - 9} y={ey - 3.5} width="18" height="7" rx="3.5" fill="#B4472B" transform={`rotate(${a * 0.6 + 90} ${ex} ${ey})`} />
                        <rect x={ex - 6} y={ey - 2.5} width="7" height="2" rx="1" fill="#E07B5A" opacity=".8" transform={`rotate(${a * 0.6 + 90} ${ex} ${ey})`} />
                      </g>
                    )
                  })}
                  <path d="M0 0C4-40-4-80 2-118" stroke="#DCCFA8" strokeWidth="3.4" fill="none" strokeLinecap="round" />
                  <circle cx="2" cy="-121" r="7" fill="#64BCB0" />
                  <circle cx="0" cy="-123" r="2.4" fill="#BFE3DC" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
