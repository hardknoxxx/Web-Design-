import { useId, type CSSProperties } from 'react'
import { LeafGradients, safeId } from '../components/Flora'
import { BACK, FRONT, petal, STAMENS } from '../components/LirioBoceto'

/*
 * El lirio blanco del logo, de cuerpo entero (flor, hojas y tallo largo), para plantar en la página.
 * Misma flor que el boceto del sitio anterior; ids propios para poder repetirlo.
 * `tilt` inclina la flor sobre el tallo; `bud` agrega un pimpollo cerrado.
 */
export function Lirio({ className, style, tilt = 0, bud = false }: { className?: string; style?: CSSProperties; tilt?: number; bud?: boolean }) {
  const id = safeId(useId())
  const petals = (list: typeof BACK, front?: boolean) =>
    list.map((p) => (
      <g key={p.a} transform={`rotate(${p.a})`}>
        <path d={petal(p.w, p.l)} fill={`url(#${id}-p)`} />
        <path d={petal(p.w, p.l)} fill={`url(#${id}-s)`} />
        <path d={`M0-6C${p.w * 0.06} ${-p.l * 0.4} ${-p.w * 0.04} ${-p.l * 0.7} 0 ${-p.l * 0.9}`} stroke="#E3BF8C" strokeOpacity=".75" strokeWidth="2" fill="none" />
        <path d={petal(p.w, p.l)} fill="none" stroke="#D9B48A" strokeOpacity={front ? 0.55 : 0.4} strokeWidth="1.2" />
      </g>
    ))
  return (
    <svg viewBox="0 0 400 760" className={className} style={style} aria-hidden="true" overflow="visible">
      <defs>
        <LeafGradients id={`${id}-l1`} color="#6F7F2E" />
        <LeafGradients id={`${id}-l2`} color="#97AD3D" />
        <linearGradient id={`${id}-st`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2F4A22" />
          <stop offset=".5" stopColor="#415521" />
          <stop offset="1" stopColor="#22351E" />
        </linearGradient>
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
      <path d="M197 196C200 300 194 520 198 760L204 760C200 520 206 300 203 196Z" fill={`url(#${id}-st)`} />
      <path d="M199 430C170 418 128 430 84 462C128 448 168 446 199 442Z" fill={`url(#${id}-l1-x)`} stroke="#34451A" strokeOpacity=".35" />
      <path d="M201 352C232 332 278 336 322 358C280 356 236 362 201 366Z" fill={`url(#${id}-l2-x)`} stroke="#34451A" strokeOpacity=".35" />
      <path d="M199 560C176 538 140 534 104 548C140 552 172 560 199 574Z" fill={`url(#${id}-l2-x)`} stroke="#34451A" strokeOpacity=".3" />
      {bud && (
        <g transform="translate(200 300) rotate(28)">
          <path d="M0 0C-3-30-2-60 0-92" stroke={`url(#${id}-st)`} strokeWidth="5" fill="none" />
          <path d="M0-80C-16-104-14-140 2-170C16-140 16-104 0-80Z" fill={`url(#${id}-p)`} stroke="#D9B48A" strokeOpacity=".6" strokeWidth="1.2" />
          <path d="M1-84C-4-110-2-140 2-164" stroke="#B7C97A" strokeOpacity=".7" strokeWidth="2" fill="none" />
        </g>
      )}
      <g transform={`rotate(${tilt} 200 220)`}>
        <g transform="translate(200 176) scale(1 0.9)">
          {petals(BACK)}
          {petals(FRONT, true)}
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
  )
}
