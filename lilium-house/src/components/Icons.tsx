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

/** Lirio estrella de seis pétalos, como el de la cartelería del local */
export const LilyMark = (p: IconProps) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" {...p}>
    <g fill="currentColor" stroke="var(--color-madera)" strokeWidth="1.6" strokeLinejoin="round">
      {[30, 150, 270].map((a) => (
        <path key={a} d="M32 32c-5-6-6.5-15-2.5-24 1.6 3 5.5 3.5 5.5 9 0 6-1 10-3 15Z" transform={`rotate(${a} 32 32)`} opacity="0.85" />
      ))}
      {[90, 210, 330].map((a) => (
        <path key={a} d="M32 32c-6-7-7-17-1.5-28 2 3.5 7 4.5 6.5 11.5-.4 6-2 11-5 16.5Z" transform={`rotate(${a} 32 32)`} />
      ))}
    </g>
    <g stroke="var(--color-madera)" strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path key={a} d="M32 32v-9" transform={`rotate(${a + 15} 32 32)`} />
      ))}
    </g>
    <circle cx="32" cy="32" r="3.2" fill="var(--color-turquesa)" />
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
