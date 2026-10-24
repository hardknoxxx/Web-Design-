import { LeafGradients } from './Flora'

/*
 * Lirio ilustrado que ocupa el lugar del 3D mientras three.js baja (en 4G lento son varios
 * segundos). Un solo SVG estático, sin JS: aparece con un fundido demorado (en conexiones
 * rápidas el 3D llega antes y nunca se ve) y se desvanece cuando el 3D dibuja su primer cuadro.
 * Mismo encuadre que el 3D: la flor centrada al 44 % de la caja y el tallo que baja al pasto.
 */

const petal = (w: number, l: number) =>
  `M0 0C${-w * 0.55} ${-l * 0.2} ${-w * 0.62} ${-l * 0.64} ${-w * 0.2} ${-l * 0.9}Q${-w * 0.02} ${-l * 1.03} ${w * 0.14} ${-l * 0.95}C${w * 0.62} ${-l * 0.68} ${w * 0.52} ${-l * 0.2} 0 0Z`

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

function Petals({ list, front }: { list: typeof BACK; front?: boolean }) {
  return list.map((p) => (
    <g key={p.a} transform={`rotate(${p.a})`}>
      <path d={petal(p.w, p.l)} fill="url(#boceto-p)" />
      <path d={petal(p.w, p.l)} fill="url(#boceto-s)" />
      <path d={`M0-6C${p.w * 0.06} ${-p.l * 0.4} ${-p.w * 0.04} ${-p.l * 0.7} 0 ${-p.l * 0.9}`} stroke="#E3BF8C" strokeOpacity=".75" strokeWidth="2" fill="none" />
      <path d={petal(p.w, p.l)} fill="none" stroke="#D9B48A" strokeOpacity={front ? 0.55 : 0.4} strokeWidth="1.2" />
    </g>
  ))
}

export function LirioBoceto({ hidden }: { hidden: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${hidden ? 'opacity-0' : ''}`}
    >
      <div className="boceto-in absolute inset-0">
      <svg viewBox="0 0 400 400" className="boceto-sway absolute inset-0 h-full w-full origin-[50%_100%] overflow-visible">
        <defs>
          <LeafGradients id="boceto-l1" color="#6F7F2E" />
          <LeafGradients id="boceto-l2" color="#97AD3D" />
          <linearGradient id="boceto-st" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2F4A22" />
            <stop offset=".5" stopColor="#415521" />
            <stop offset="1" stopColor="#22351E" />
          </linearGradient>
          <linearGradient id="boceto-p" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#F2CF8E" />
            <stop offset=".28" stopColor="#FBEEDD" />
            <stop offset=".7" stopColor="#FFFBF4" />
            <stop offset="1" stopColor="#F6E2C6" />
          </linearGradient>
          <linearGradient id="boceto-s" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#D9A56E" stopOpacity=".35" />
            <stop offset=".45" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset=".55" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="1" stopColor="#C98F5A" stopOpacity=".3" />
          </linearGradient>
        </defs>
        <g transform="translate(200 176) scale(0.84) translate(-200 -176)">
          <path d="M197 196C200 270 194 380 198 560L204 560C200 380 206 270 203 196Z" fill="url(#boceto-st)" />
          <path d="M199 330C170 318 128 330 84 362C128 348 168 346 199 342Z" fill="url(#boceto-l1-x)" stroke="#34451A" strokeOpacity=".35" />
          <path d="M201 292C232 272 278 276 322 298C280 296 236 302 201 306Z" fill="url(#boceto-l2-x)" stroke="#34451A" strokeOpacity=".35" />
          <g transform="translate(200 176) scale(1 0.9)">
            <Petals list={BACK} />
            <Petals list={FRONT} front />
          </g>
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
                </g>
              )
            })}
            <path d="M0 0C4-40-4-80 2-118" stroke="#DCCFA8" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <circle cx="2" cy="-121" r="7" fill="#64BCB0" />
          </g>
        </g>
      </svg>
      </div>
    </div>
  )
}
