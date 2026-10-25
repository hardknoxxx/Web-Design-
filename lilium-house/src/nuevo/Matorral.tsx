import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { Monstera } from '../components/Botanica'
import { BananaLeaf, Fern, Hummingbird, PalmFrond } from '../components/Flora'
import { Lirio } from './Lirio'

/*
 * El cierre: un matorral de la selva misionera, dibujado (estilo ilustración, como el sitio anterior) y vivo.
 * Nada flota: cada planta nace del suelo y cada animal está donde estaría de verdad:
 * - un árbol con un tucán posado en su rama y el nido de hornero (de barro) en la rama de abajo;
 * - un picaflor libando de los lirios de la casa;
 * - una mariposa "88" (la de Iguazú) que revolotea alrededor de la monstera y se posa en una hoja;
 * - un coatí que pasea por el suelo, entre las plantas, y da la vuelta.
 * Todo se anima con CSS (sin JavaScript por cuadro); fuera de pantalla las animaciones se pausan.
 */

const TINTA = '#2A1A10'

function Tucan() {
  return (
    <g className="tucan">
      {/* cola que cuelga por detrás de la rama */}
      <path d="M-16 22C-24 50-30 78-34 104L-18 106C-12 80-6 52 0 28Z" fill="#1E1A17" className="tucan-cola" />
      <ellipse cx="-4" cy="2" rx="30" ry="40" transform="rotate(-14 -4 2)" fill="#1E1A17" />
      <path d="M-26-6C-30 14-24 30-12 38C-20 24-22 8-18-8Z" fill="#3A3330" />
      <ellipse cx="-2" cy="36" rx="12" ry="6" fill="#C2413A" />
      <g className="tucan-cabeza">
        <circle cx="12" cy="-40" r="22" fill="#1E1A17" />
        <path d="M2-30C4-6 14 6 28-2C34-14 30-28 22-34Z" fill="#F7E2A9" />
        <path d="M6-26C12-24 22-24 28-28" stroke="#E9C46A" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* pico enorme: naranja, con el lomo más claro y la punta negra */}
        <path d="M26-56C58-68 92-54 104-38C84-30 52-30 28-32Z" fill="#F29A2E" />
        <path d="M28-55C58-64 86-54 100-42C80-48 54-50 30-48Z" fill="#F7C04A" />
        <path d="M96-42C101-40 104-38 104-38C100-34 96-34 93-35Z" fill="#1E1A17" />
        <path d="M27-32C40-36 56-38 70-37" stroke="#C26A1E" strokeWidth="2" fill="none" />
        <circle cx="20" cy="-46" r="8" fill="#64BCB0" />
        <circle cx="21" cy="-46" r="3.6" fill="#120E0C" />
        <circle cx="22.3" cy="-47.4" r="1.2" fill="#FFFFFF" />
        <ellipse className="tucan-parpado" cx="20" cy="-46" rx="8.5" ry="8.5" fill="#1E1A17" />
      </g>
      {/* patas agarradas a la rama */}
      <path d="M-8 40V52M6 40V52" stroke="#8A8478" strokeWidth="5" strokeLinecap="round" />
    </g>
  )
}

function HorneroEnSuNido() {
  return (
    <g>
      {/* el horno de barro, apoyado en la rama, con la entrada de costado */}
      <path d="M-72 16C-76-38-34-70 0-70C34-70 76-38 72 16Z" fill="#B5794A" />
      <path d="M-72 16C-76-38-34-70 0-70C-20-60-50-36-48 16Z" fill="#C98F5E" />
      <g stroke="#8A5530" strokeOpacity=".55" strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path d="M-50-20C-30-26-12-24 4-30" />
        <path d="M-40 0C-20-6 0-4 20-10" />
        <path d="M-14-46C0-50 14-48 26-52" />
      </g>
      <ellipse cx="34" cy="-14" rx="13" ry="17" fill="#3D2314" />
      <g className="hornero" transform="translate(-6 -70)">
        <path d="M-18-6C-30-8-38-4-42 2C-34 2-26 0-18-2Z" fill="#7E4A22" />
        <ellipse cx="-4" cy="-8" rx="17" ry="12" fill="#A8642E" />
        <path d="M2-2C6 4-2 6-12 4" stroke="#7E4A22" strokeWidth="2" fill="none" />
        <g className="hornero-cabeza">
          <circle cx="12" cy="-18" r="9" fill="#A8642E" />
          <path d="M10-12C14-8 20-9 22-14" fill="#F3E3C8" />
          <path d="M20-20L30-17L20-15Z" fill="#6B5544" />
          <circle cx="15" cy="-20" r="1.8" fill={TINTA} />
        </g>
        <path d="M-6 4V10M2 4V10" stroke="#6B5544" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </g>
  )
}

// hoja lanceolada con punta: largo 42, apoyada en (0,0) y creciendo hacia arriba
const HOJA = 'M0 0C9-9 10-28 0-42C-10-28-9-9 0 0Z'
const VERDES = ['#2F4A22', '#3B5426', '#415521', '#4A5E22', '#6F7F2E']
const azar = (n: number) => {
  const x = Math.sin(n * 91.7 + 13.3) * 43758.5453
  return x - Math.floor(x)
}

/** Racimo de follaje: hojas en abanico alrededor de un centro, las de atrás más oscuras, con nervio claro. */
function Racimo({ x, y, r, semilla }: { x: number; y: number; r: number; semilla: number }) {
  const hojas = Array.from({ length: 22 }, (_, k) => {
    const a = (k / 22) * 360 + azar(semilla * 31 + k) * 16
    const d = r * (0.18 + azar(semilla * 7 + k) * 0.5)
    const e = (r / 42) * (0.75 + azar(semilla * 3 + k) * 0.45)
    return { a, d, e, c: VERDES[Math.floor(azar(semilla * 11 + k) * VERDES.length)], atras: k % 3 === 0 }
  })
  return (
    <g>
      {[...hojas.filter((h) => h.atras), ...hojas.filter((h) => !h.atras)].map((h, k) => {
        const rad = (h.a * Math.PI) / 180
        return (
          <g key={k} transform={`translate(${(x + Math.sin(rad) * h.d).toFixed(1)} ${(y - Math.cos(rad) * h.d).toFixed(1)}) rotate(${h.a.toFixed(1)}) scale(${h.e.toFixed(2)})`}>
            <path d={HOJA} fill={h.atras ? '#22351E' : h.c} />
            {!h.atras && <path d="M0-2C1-14 1-26 0-38" stroke="#97AD3D" strokeOpacity=".55" strokeWidth="1.6" fill="none" strokeLinecap="round" />}
          </g>
        )
      })}
    </g>
  )
}
const RACIMOS: [number, number, number][] = [
  [120, 130, 80],
  [235, 95, 92],
  [335, 150, 74],
  [175, 195, 78],
  [285, 215, 70],
  [85, 220, 60],
  [215, 160, 70],
]

/** Árbol del monte: tronco con raíces, dos ramas habitadas y la copa que se mece. */
function Arbol() {
  return (
    <svg viewBox="0 0 460 700" className="h-full w-full" aria-hidden="true" overflow="visible">
      <g className="mecer-copa" style={{ '--dur': '7s' } as CSSProperties}>
        {RACIMOS.map(([x, y, r], i) => (
          <Racimo key={i} x={x} y={y} r={r} semilla={i} />
        ))}
      </g>
      {/* tronco */}
      <path d="M150 700C162 640 170 560 172 470C174 360 182 260 196 150L222 150C214 260 214 360 218 470C222 560 236 640 262 700Z" fill="#5A3A22" />
      <path d="M184 690C188 600 190 500 192 420C194 330 200 250 208 170" stroke="#7A5232" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M150 700C134 694 118 696 104 700ZM262 700C280 692 300 694 318 700Z" fill="#4A2F1B" />
      {/* rama del tucán */}
      <path d="M200 312C260 300 330 286 440 278L440 286C330 298 262 312 200 326Z" fill="#5A3A22" />
      <g className="mecer" style={{ '--dur': '5s', '--ang': '4deg' } as CSSProperties}>
        <path d="M430 280C446 262 466 258 478 262C466 272 448 280 430 284Z" fill="#6F7F2E" />
        <path d="M434 284C454 290 468 302 470 314C454 308 440 298 432 288Z" fill="#97AD3D" />
      </g>
      <g transform="translate(330 232) scale(0.92)">
        <Tucan />
      </g>
      {/* rama del hornero */}
      <path d="M210 486C270 478 330 470 420 466L420 476C330 482 270 492 212 500Z" fill="#5A3A22" />
      <g transform="translate(340 466) scale(0.78)">
        <HorneroEnSuNido />
      </g>
    </svg>
  )
}

/** Mariposa "88" (Diaethria clymena): negra con banda turquesa y el rojo en la base del ala. */
function Mariposa() {
  return (
    <svg viewBox="-34 -28 68 56" className="h-full w-full" aria-hidden="true" overflow="visible">
      <g className="ala ala-izq">
        <path d="M-2-4C-14-26-32-24-30-8C-28 2-14 4-2 0Z" fill="#141414" />
        <path d="M-6-8C-14-16-24-18-27-12C-22-10-14-8-6-4Z" fill="#3FB8C4" />
        <path d="M-2 2C-16 4-26 14-20 22C-12 24-4 14-1 6Z" fill="#141414" />
        <path d="M-4 4C-10 6-14 10-14 14C-10 12-6 8-3 6Z" fill="#C8332B" />
      </g>
      <g className="ala ala-der">
        <path d="M2-4C14-26 32-24 30-8C28 2 14 4 2 0Z" fill="#141414" />
        <path d="M6-8C14-16 24-18 27-12C22-10 14-8 6-4Z" fill="#3FB8C4" />
        <path d="M2 2C16 4 26 14 20 22C12 24 4 14 1 6Z" fill="#141414" />
        <path d="M4 4C10 6 14 10 14 14C10 12 6 8 3 6Z" fill="#C8332B" />
      </g>
      <rect x="-1.6" y="-12" width="3.2" height="26" rx="1.6" fill={TINTA} />
      <path d="M-1-12C-4-18-6-22-8-24M1-12C4-18 6-22 8-24" stroke={TINTA} strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/** Coatí de perfil, caminando hacia la derecha: patas, cabeza y cola anillada se mueven por separado. */
function Coati() {
  const pata = (x: number, c: string, k: number) => (
    <g className="coati-pata" style={{ '--k': k } as CSSProperties}>
      <path d={`M${x - 6}-8L${x - 8} 16H${x + 6}L${x + 5}-8Z`} fill={c} />
      <ellipse cx={x} cy="17" rx="8" ry="4" fill={c} />
    </g>
  )
  return (
    <svg viewBox="-120 -110 240 140" className="h-full w-full" aria-hidden="true" overflow="visible">
      <g className="coati-cola">
        <path d="M-56-20C-80-40-88-70-74-100" stroke="#6B4A2B" strokeWidth="15" fill="none" strokeLinecap="round" />
        <path d="M-56-20C-80-40-88-70-74-100" stroke="#2E1E12" strokeWidth="15" fill="none" strokeLinecap="round" strokeDasharray="9 11" />
      </g>
      {pata(-40, '#2E1E12', 1)}
      {pata(22, '#2E1E12', 0)}
      <ellipse cx="-8" cy="-20" rx="56" ry="26" fill="#8A5A33" />
      <path d="M-56-12C-40 6 20 8 40-8C20 0-30 0-56-12Z" fill="#B98552" />
      <path d="M-50-34C-20-46 20-46 40-34" stroke="#6B4A2B" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".5" />
      {pata(-26, '#3A2618', 0)}
      {pata(34, '#3A2618', 1)}
      <g className="coati-cabeza">
        <ellipse cx="54" cy="-26" rx="22" ry="17" fill="#8A5A33" />
        {/* hocico largo y móvil, con la nariz oscura */}
        <path d="M66-34C84-30 98-24 108-14C98-10 82-12 66-14Z" fill="#7A4E2B" />
        <path d="M66-22C82-18 96-14 106-14C94-8 80-8 66-12Z" fill="#E9D3B0" />
        <circle cx="108" cy="-15" r="5" fill="#1E140C" />
        <circle cx="44" cy="-40" r="7" fill="#6B4A2B" />
        <circle cx="44" cy="-40" r="3.4" fill="#E9D3B0" />
        <ellipse cx="62" cy="-30" rx="6" ry="5" fill="#F3E3C8" />
        <circle cx="63" cy="-30" r="3" fill="#120C08" />
        <circle cx="64" cy="-31" r="1" fill="#FFFFFF" />
      </g>
    </svg>
  )
}

/** Fondo del matorral: matas de hojas largas en abanico, para que nada quede contra el vacío. */
function Arbustos() {
  const matas = Array.from({ length: 24 }, (_, i) => ({ x: (i / 23) * 1640 - 20, alto: 90 + azar(i) * 80, i }))
  return (
    <svg viewBox="0 0 1600 260" preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden="true">
      {matas.map((m) => (
        <g key={m.i} transform={`translate(${m.x.toFixed(1)} 262)`}>
          {Array.from({ length: 11 }, (_, k) => {
            const a = -75 + k * 15 + (azar(m.i * 5 + k) - 0.5) * 10
            const e = (m.alto / 42) * (0.55 + azar(m.i * 9 + k) * 0.5) * (1 - Math.abs(a) / 160)
            return (
              <g key={k} transform={`rotate(${a.toFixed(1)}) scale(${(e * 0.55).toFixed(2)} ${e.toFixed(2)})`}>
                <path d={HOJA} fill={VERDES[(m.i + k) % 3]} />
                <path d="M0-2C1-14 1-26 0-38" stroke="#22351E" strokeOpacity=".35" strokeWidth="1.2" fill="none" />
              </g>
            )
          })}
        </g>
      ))}
    </svg>
  )
}

/** Suelo con pasto: el borde de arriba es el piso donde se apoya todo. */
function Suelo() {
  return (
    <svg viewBox="0 0 1600 60" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
      <path d="M0 14C200 6 400 18 600 10C800 4 1000 16 1200 9C1400 4 1500 12 1600 8V60H0Z" fill="#2B3F1E" />
      <g stroke="#4A5E22" strokeWidth="3" strokeLinecap="round">
        {Array.from({ length: 120 }, (_, i) => {
          const x = (i / 119) * 1600
          const h = 10 + ((i * 53) % 14)
          const b = ((i * 29) % 10) - 5
          return <path key={i} d={`M${x} 16Q${x + b * 0.4} ${16 - h * 0.6} ${x + b} ${16 - h}`} fill="none" />
        })}
      </g>
    </svg>
  )
}

/** Planta que nace del suelo y se mece desde la base. */
function Planta({ className, style, dur = 6, ang = 2, children }: { className: string; style?: CSSProperties; dur?: number; ang?: number; children: ReactNode }) {
  return (
    <div className={`matorral-planta mecer ${className}`} style={{ '--dur': `${dur}s`, '--ang': `${ang}deg`, ...style } as CSSProperties}>
      {children}
    </div>
  )
}

export function Matorral() {
  const ref = useRef<HTMLDivElement>(null)
  // las animaciones corren solo con el matorral en pantalla
  useEffect(() => {
    const el = ref.current!
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.dataset.vivo = ''
      else delete el.dataset.vivo
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="matorral" aria-hidden="true">
      <div className="matorral-fondo">
        <Arbustos />
      </div>

      <div className="matorral-arbol">
        <Arbol />
      </div>
      <Planta className="matorral-palma" dur={8} ang={1.5}>
        <PalmFrond />
      </Planta>

      {/* el coatí camina por detrás de las plantas del frente */}
      <div className="coati-pista">
        <div className="coati-paseo">
          <div className="coati-cuerpo">
            <Coati />
          </div>
        </div>
      </div>

      {/* los lirios de la casa, con el picaflor que los visita */}
      <div className="matorral-lirios">
        <Planta className="lirio-a" dur={6.5} ang={1.6}>
          <Lirio tilt={-8} bud />
        </Planta>
        <Planta className="lirio-b" dur={7.5} ang={2}>
          <Lirio tilt={10} />
        </Planta>
        <div className="picaflor">
          <Hummingbird className="h-full w-full" />
        </div>
      </div>

      <div className="matorral-monstera">
        <Planta className="monstera-a" dur={7} ang={2.4}>
          <Monstera color="#415521" />
        </Planta>
        <Planta className="monstera-b" dur={6} ang={3}>
          <Monstera color="#6F7F2E" />
        </Planta>
        <div className="mariposa">
          <div className="mariposa-cuerpo">
            <Mariposa />
          </div>
        </div>
      </div>

      <Planta className="matorral-helecho" dur={5} ang={3}>
        <Fern />
      </Planta>
      <Planta className="matorral-banano-a" dur={9} ang={1.8}>
        <BananaLeaf color="#6F7F2E" />
      </Planta>
      <Planta className="matorral-banano-b" dur={8} ang={2.2}>
        <BananaLeaf color="#415521" />
      </Planta>

      <div className="matorral-suelo">
        <Suelo />
      </div>
    </div>
  )
}
