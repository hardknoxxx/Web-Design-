/*
 * Logo de Lilium Coffee Lounge con sus colores: el lirio blanco de seis pétalos sobre el disco menta del logo
 * (#64BCB0), y el nombre en script con "Coffee Lounge" debajo. Mismo dibujo que el favicon.
 */

const LARGO = 'M32 34c-6.5-6-8-14-2.5-27 1.4 3.6 5 5 5.8 9.4.9 5-.6 11-3.3 17.6Z'
const CORTO = 'M32 34c-5-5-6.5-11-3-20 1 2.6 3.6 3.6 4.4 6.4 1.2 4.2.4 8.6-1.4 13.6Z'

export function LirioSello({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#64BCB0" />
      <g fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {[8, 68, 128, 188, 248, 308].map((a, i) => (
          <path key={a} d={i % 2 ? CORTO : LARGO} transform={`rotate(${a} 32 34)`} />
        ))}
      </g>
    </svg>
  )
}

export function Logo() {
  return (
    <a href="#mesa" className="logo" aria-label="Lilium Coffee Lounge, inicio">
      <LirioSello className="logo-sello" />
      <span className="flex flex-col">
        <span className="font-script text-[1.95rem] leading-[0.85] text-laguna-deep md:text-[2.5rem]">Lilium</span>
        <span className="logo-bajada">Coffee Lounge</span>
      </span>
    </a>
  )
}
