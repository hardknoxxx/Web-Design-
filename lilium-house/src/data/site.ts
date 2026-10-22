export const SITE = {
  name: 'Lilium House & Coffee',
  address: 'Av. Tres Fronteras 467/489',
  postalCode: 'N3370AWE',
  city: 'Puerto Iguazú, Misiones',
  phoneDisplay: '+54 3757 45-7085',
  phoneHref: 'tel:+543757457085',
  // Formato internacional para WhatsApp. Google Maps lista 03757 45-7085 (línea fija):
  // WhatsApp Business sobre fijo va sin el 9. Si fuera celular, usar '5493757457085'.
  whatsapp: '543757457085',
  bookingHref: 'https://liliumhouse.hotelonia.com',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Lilium House & Coffee, Av. Tres Fronteras 489, Puerto Iguazú, Misiones'),
  hours: {
    days: 'Martes a Domingo',
    slots: ['08:00 – 12:00', '17:00 – 21:00'],
    closed: 'Lunes cerrado',
  },
  // Datos públicos de la ficha de Google Maps
  rating: {
    score: 4.5,
    count: 45,
    breakdown: [
      { label: 'Habitaciones', score: 4.6 },
      { label: 'Servicio', score: 4.4 },
      { label: 'Ubicación', score: 4.6 },
    ],
    highlights: [
      'Comida deliciosa y fresca',
      'Pastelería deliciosa',
      'Porciones de café abundantes',
      'Ambiente hermoso y tranquilo',
      'Limpio y prolijo',
      'Precios accesibles',
      'Personal atento',
      'Decoración de buen gusto',
      'Música suave',
    ],
  },
} as const

export function whatsappLink(message = 'Hola Lilium! Quería hacer una consulta.') {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`
}

export const NAV_LINKS = [
  { href: '#cafeteria', label: 'Cafetería' },
  { href: '#mandalas', label: 'Mandalas' },
  { href: '#alojamiento', label: 'Alojamiento' },
  { href: '#opiniones', label: 'Opiniones' },
  { href: '#visitanos', label: 'Visitanos' },
] as const

export type Apartment = {
  id: string
  name: string
  tagline: string
  description: string
  guests: number
  layout: string
  amenities: string[]
  accent: string
  accentSoft: string
}

// Unidades de ejemplo: reemplazar nombres, capacidades y comodidades con la información real.
export const APARTMENTS: Apartment[] = [
  {
    id: 'lirio',
    name: 'Suite Lirio',
    tagline: 'Para dos, con luz de mañana',
    description:
      'Un refugio sereno de paredes de estuco y madera, pensado para parejas que buscan descanso después de un día en las Cataratas.',
    guests: 2,
    layout: 'Cama queen · Baño privado',
    amenities: ['Desayuno de la casa', 'Wi-Fi', 'Aire acondicionado'],
    accent: '#E07A5F',
    accentSoft: '#F6D3C7',
  },
  {
    id: 'mburucuya',
    name: 'Depto. Mburucuyá',
    tagline: 'Amplio, ideal familias',
    description:
      'Dos ambientes con cocina equipada y rincón de estar, para quedarse varios días y vivir Iguazú a ritmo propio.',
    guests: 4,
    layout: '2 ambientes · Cocina equipada',
    amenities: ['Desayuno de la casa', 'Wi-Fi', 'Cocina completa'],
    accent: '#00A896',
    accentSoft: '#C4EAE4',
  },
  {
    id: 'tres-fronteras',
    name: 'Depto. Tres Fronteras',
    tagline: 'Tu base para explorar la región',
    description:
      'Espacioso y luminoso, sobre la avenida que lleva al Hito Tres Fronteras. Perfecto para grupos de amigos o viajes largos.',
    guests: 5,
    layout: '2 dormitorios · Living comedor',
    amenities: ['Desayuno de la casa', 'Wi-Fi', 'Aire acondicionado'],
    accent: '#5B7B5A',
    accentSoft: '#D5E0CF',
  },
]
