import type { ReactNode } from 'react'

/* Platos de la carta vistos desde arriba, sobre la mesa de madera. */

const INK = '#3D2314'

function Plate({ children, rim = '#E4D3B4' }: { children: ReactNode; rim?: string }) {
  return (
    <svg viewBox="-60 -60 120 120" className="h-full w-full" aria-hidden="true">
      <circle r="56" fill="#FFFDF8" />
      <circle r="56" fill="none" stroke={rim} strokeWidth="2" />
      <circle r="43" fill="none" stroke={rim} strokeWidth="1" opacity=".7" />
      {children}
    </svg>
  )
}

export function CafePlato() {
  return (
    <Plate>
      <rect x="18" y="-4" width="20" height="9" rx="4.5" fill="#FFFFFF" stroke={INK} strokeOpacity=".35" />
      <circle r="26" fill="#FFFFFF" stroke={INK} strokeOpacity=".35" />
      <circle r="21" fill="#6B3A1E" />
      <circle r="19" fill="none" stroke="#C08552" strokeWidth="2.4" />
      <path d="M0 13C-8 7-9-3 0-13C9-3 8 7 0 13ZM0 12V-10M0 2L-4-2M0-3L4-6" fill="#F3E3C8" stroke="#E8D3B0" strokeWidth=".8" />
      <path d="M-34 30L-14 22" stroke="#B8A27E" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="-38" cy="32" rx="5" ry="3.5" fill="#B8A27E" />
    </Plate>
  )
}

export function ChipaPlato() {
  const chipas: [number, number, number][] = [[-16, -12, 15], [15, -15, 14], [-12, 17, 14], [17, 13, 15], [1, 1, 13]]
  return (
    <Plate>
      {chipas.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#E9C27D" stroke="#C99A4F" strokeWidth="2" />
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.45} fill="#F3D9A0" opacity=".7" />
          <circle cx={x + r * 0.3} cy={y + r * 0.1} r="1.6" fill="#B07A35" />
          <circle cx={x - r * 0.1} cy={y + r * 0.4} r="1.3" fill="#B07A35" />
        </g>
      ))}
    </Plate>
  )
}

export function TePlato() {
  return (
    <Plate>
      <g transform="translate(-10 -4)">
        <path d="M22-6C34-12 40-4 44-10" stroke="#3E8C82" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M-24 0C-32-2-34 10-26 10" stroke="#3E8C82" strokeWidth="5" fill="none" />
        <circle r="24" fill="#64BCB0" />
        <circle r="24" fill="none" stroke="#3E8C82" strokeWidth="2" />
        <circle r="14" fill="#86CDC3" />
        <circle r="5" fill="#3E8C82" />
      </g>
      <g transform="translate(28 28)">
        <circle r="13" fill="#FFFFFF" stroke={INK} strokeOpacity=".35" />
        <circle r="10" fill="#B9772F" opacity=".85" />
      </g>
      <path d="M-36 36L-28 28M-30 40L-24 32" stroke="#6F7F2E" strokeWidth="3" strokeLinecap="round" />
    </Plate>
  )
}

export function CheesecakePlato() {
  return (
    <Plate>
      <g transform="rotate(-20)">
        <path d="M-6 30L-34-18C-20-30 10-32 30-20Z" fill="#F7EBD3" />
        <path d="M-34-18C-20-30 10-32 30-20" stroke="#C99A4F" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M-6 30L-34-18M-6 30L30-20" stroke="#E8D6B4" strokeWidth="1.5" />
        {[[-14, -12, 5], [2, -16, 4.5], [12, -8, 4], [-4, -2, 4.5], [-10, 8, 3.6], [4, 6, 3.4]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 1 ? '#3D1E3A' : '#A51E2E'} />
        ))}
        <path d="M-2-6C4-14 14-16 18-12" stroke="#7A1424" strokeWidth="2" fill="none" opacity=".6" />
      </g>
      <path d="M26 30C30 34 36 34 38 30" stroke="#6F7F2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="27" rx="5" ry="2.5" fill="#97AD3D" transform="rotate(-30 32 27)" />
    </Plate>
  )
}

export function TortaPlato() {
  return (
    <Plate>
      <g transform="rotate(24)">
        <path d="M-4 32L-32-16C-18-30 12-32 32-18Z" fill="#4A2617" />
        <path d="M-32-16C-18-30 12-32 32-18" stroke="#2E160D" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M-12-10C-4-18 10-20 18-14" stroke="#7A4A33" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".8" />
        <circle cx="4" cy="-6" r="6" fill="#B4472B" />
        <circle cx="2" cy="-8" r="1.6" fill="#E89A7E" />
        <path d="M5-12L9-18" stroke="#6F7F2E" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g fill="#D9C3A0" opacity=".9">
        <circle cx="-30" cy="26" r="1.6" />
        <circle cx="-24" cy="32" r="1.2" />
        <circle cx="-34" cy="18" r="1" />
      </g>
    </Plate>
  )
}

export function TostadoPlato() {
  return (
    <Plate>
      {/* dos triángulos de tostado, con la marca de la plancha */}
      {[
        { t: 'translate(-6 -6) rotate(-12)', k: 0 },
        { t: 'translate(10 10) rotate(160)', k: 1 },
      ].map(({ t, k }) => (
        <g key={k} transform={t}>
          <path d="M-24 14L22 14L-24-28Z" fill="#E7B873" stroke="#B9813F" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M-20 10L14 10L-20-21Z" fill="#F1CE93" />
          <path d="M-16 6L-2 6M-16 0L-8 0M-16-6L-13-6" stroke="#B9813F" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
          <path d="M22 14C20 18 -20 18 -24 14" stroke="#F4E4B0" strokeWidth="3" fill="none" />
        </g>
      ))}
      <g transform="translate(-30 30)">
        <circle r="8" fill="#FFFFFF" stroke={INK} strokeOpacity=".3" />
        <circle r="5.5" fill="#B4472B" opacity=".9" />
      </g>
      <path d="M30-34C34-30 38-30 40-34" stroke="#6F7F2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </Plate>
  )
}

export function EnsaladaPlato() {
  const hojas: [number, number, number, string][] = [
    [-14, -14, -30, '#6F7F2E'], [14, -16, 40, '#97AD3D'], [18, 12, 120, '#6F7F2E'], [-16, 14, 210, '#97AD3D'], [0, -24, 0, '#415521'], [-24, 0, 260, '#415521'],
  ]
  return (
    <Plate>
      <circle r="38" fill="#F5EEDD" />
      {hojas.map(([x, y, r, c], i) => (
        <path key={i} d="M0 14C-10 6-10-8 0-16C10-8 10 6 0 14ZM0 12V-13" fill={c} stroke="#34451A" strokeWidth="1" strokeOpacity=".5" transform={`translate(${x} ${y}) rotate(${r})`} />
      ))}
      {[[8, 2], [-6, 6], [20, -4]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="6.5" fill="#C9473A" />
          <circle r="3.4" fill="#E9806E" />
        </g>
      ))}
      <g transform="translate(-6 -6)">
        <ellipse rx="9" ry="7" fill="#FFFDF5" stroke="#E8DCC0" />
        <circle r="4" fill="#F0B43C" />
      </g>
      {[[2, 22], [-20, -18], [24, 20], [12, -26]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" fill="#E4D3B4" stroke="#C9B48C" strokeWidth=".8" />
      ))}
    </Plate>
  )
}
