/**
 * Borde orgánico entre secciones: una silueta de follaje del color de la sección
 * siguiente que asoma sobre la anterior (en lugar de un corte recto).
 */
export function Edge({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 400 48"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 top-0 h-10 w-full -translate-y-[calc(100%-1px)] sm:h-14 ${flip ? '-scale-x-100' : ''}`}
      aria-hidden="true"
    >
      <path
        fill={color}
        d="M0 48V30C18 30 22 12 40 14C56 16 58 34 76 30C92 26 92 6 112 6C130 6 134 28 150 30C168 32 170 18 186 20C204 22 206 40 226 36C244 32 242 10 262 8C282 6 286 30 304 32C320 34 324 18 340 18C358 18 360 36 378 34C392 32 394 24 400 22V48Z"
      />
    </svg>
  )
}
