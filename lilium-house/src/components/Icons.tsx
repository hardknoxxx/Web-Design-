import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export const WhatsAppIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.37l-.36-.22-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9a11.82 11.82 0 0 0-3.48-8.41Z" />
  </svg>
)

/** Lirio en trazo blanco, como el del logo: seis pétalos puntiagudos y estambres curvos */
export const LilyMark = (p: IconProps) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" {...stroke} strokeWidth={2.4} {...p}>
    {[0, 60, 120, 180, 240, 300].map((a, i) => (
      <path
        key={a}
        d={i % 2 ? 'M32 34c-5-5-6.5-11-3-20 1 2.6 3.6 3.6 4.4 6.4 1.2 4.2.4 8.6-1.4 13.6Z' : 'M32 34c-6.5-6-8-14-2.5-27 1.4 3.6 5 5 5.8 9.4.9 5-.6 11-3.3 17.6Z'}
        transform={`rotate(${a + 8} 32 34)`}
      />
    ))}
    <path d="M33 33c4-4 9-7 15-9M33.5 34.5c5-2 10-2.5 15.5-1.5M33 32c2.5-5 6.5-9 11-12" strokeWidth={1.4} />
    <circle cx="49" cy="23.6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="50" cy="33.2" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="44.8" cy="19.4" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)

export const InstagramIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const PhoneIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 7.2 7.2l1.4-2.1 4.2 1.6V19a1.6 1.6 0 0 1-1.7 1.6A16.5 16.5 0 0 1 3.4 5.2 1.6 1.6 0 0 1 5 3.5Z" />
  </svg>
)

export const MapPinIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.6" />
  </svg>
)

export const ClockIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const CupIcon = (p: IconProps) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" {...stroke} {...p}>
    <path d="M9 19h25v9a11 11 0 0 1-11 11h-3A11 11 0 0 1 9 28v-9Z" />
    <path d="M34 22h2.5a4.5 4.5 0 0 1 0 9H33" />
    <path d="M6 43h31" />
    <path d="M16 6c-2 3 2 5 0 8M22 4c-2 3 2 6 0 10M28 6c-2 3 2 5 0 8" />
  </svg>
)

export const ChipaIcon = (p: IconProps) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" {...stroke} {...p}>
    <path d="M24 9c9 0 16 6.5 16 14.5S33 38 24 38 8 31.5 8 23.5 15 9 24 9Z" />
    <path d="M24 16c5 0 9 3.4 9 7.5S29 31 24 31s-9-3.4-9-7.5S19 16 24 16Z" />
    <path d="M14 14.5l1.5 1.2M33 13.5l-1.2 1.4M38 27l-1.6-.5M11 29l1.6-.6M22 35.5l.5-1.4M30 34.5l-.8-1.3" />
    <path d="M5 42h38" />
  </svg>
)

export const MandalaIcon = (p: IconProps) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" {...stroke} {...p}>
    <circle cx="24" cy="24" r="4" />
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} d="M24 19.5c3-3 3-8 0-12-3 4-3 9 0 12Z" transform={`rotate(${i * 45} 24 24)`} />
    ))}
    <circle cx="24" cy="24" r="19" strokeDasharray="2 3.2" />
  </svg>
)

export const UsersIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 19.5c.6-3.4 3-5.3 6-5.3s5.4 1.9 6 5.3" />
    <path d="M16 5a3 3 0 0 1 0 6M18 14.6c1.7.7 2.8 2.3 3.1 4.9" />
  </svg>
)

export const BedIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <path d="M3 18.5V6M3 14h18v4.5M21 14v-2.5A3.5 3.5 0 0 0 17.5 8H11v6" />
    <circle cx="7" cy="10.5" r="1.8" />
  </svg>
)

export const CheckLeafIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14Z" />
    <path d="M5 19l7-7" />
  </svg>
)

export const ArrowIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={2} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const HandIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5V4a1.5 1.5 0 0 1 3 0v6m0-1a1.5 1.5 0 0 1 3 0v5.5a6.5 6.5 0 0 1-6.5 6.5h-.6a6 6 0 0 1-4.6-2.2L4.2 15a1.6 1.6 0 0 1 2.4-2.1L9 15" />
  </svg>
)

export const MenuIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={2} {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
)

export const CloseIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={2} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

/** Rama botánica decorativa (line art) */
export const Sprig = (p: IconProps) => (
  <svg viewBox="0 0 120 200" aria-hidden="true" {...stroke} strokeWidth={1.2} {...p}>
    <path d="M60 198C58 150 62 90 60 4" />
    {[30, 60, 90, 120, 150].map((y, i) => (
      <g key={y}>
        <path d={`M60 ${y + 20}c-18-4-34-16-40-${30 - i * 2} 18 2 32 12 40 ${30 - i * 2}Z`} />
        <path d={`M60 ${y + 10}c18-4 34-16 40-${30 - i * 2} -18 2 -32 12 -40 ${30 - i * 2}Z`} />
      </g>
    ))}
  </svg>
)

/* Íconos con el concepto de la cafetería (pie de página) */

/** Horario: taza humeante con un reloj en el plato. */
export const CupHoursIcon = (p: IconProps) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...stroke} {...p}>
    <path d="M6 13h16v5a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7v-5Z" />
    <path d="M22 15h1.5a3 3 0 0 1 0 6H21" />
    <path d="M11 4c-1.2 1.6 1.2 2.6 0 4.2M15 3c-1.2 1.8 1.2 3 0 5.2M19 4c-1.2 1.6 1.2 2.6 0 4.2" />
    <path d="M4 28.5h20" />
    <circle cx="27" cy="27" r="3.6" />
    <path d="M27 25.4V27l1 .8" />
  </svg>
)

/** Dirección: pin con forma de pétalo de lirio. */
export const LilyPinIcon = (p: IconProps) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...stroke} {...p}>
    <path d="M16 29C10 22 7 17.5 7 13a9 9 0 0 1 18 0c0 4.5-3 9-9 16Z" />
    <path d="M16 8.5c-1.6 1.8-2.2 4.2 0 7 2.2-2.8 1.6-5.2 0-7Z" />
    <path d="M16 15.5c-2.2-.6-4.2.2-5 2 2.2.8 4 .4 5-2ZM16 15.5c2.2-.6 4.2.2 5 2-2.2.8-4 .4-5-2Z" />
  </svg>
)

/** Teléfono: aparato de disco, como el de los bares de antes. */
export const RotaryPhoneIcon = (p: IconProps) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...stroke} {...p}>
    <path d="M4 11c0-3 5-5 12-5s12 2 12 5l-1 2.5h-4.5L21 10H11l-1.5 3.5H5L4 11Z" />
    <path d="M9 14l-3 11h20l-3-11" />
    <circle cx="16" cy="19.5" r="4" />
    <circle cx="16" cy="19.5" r="1" />
  </svg>
)
