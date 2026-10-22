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
      { label: 'Servicio', score: 4.4 },
      { label: 'Ubicación', score: 4.6 },
    ],
    highlights: [
      'Comida deliciosa y fresca',
      'Pastelería deliciosa',
      'Porciones de café abundantes',
      'Ambiente hermoso y tranquilo',
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

// Atajos del botón-taza de WhatsApp
export const WHATSAPP_OPTIONS = [
  { label: 'Reservar una mesa', message: 'Hola Lilium! Quería reservar una mesa para … personas, el día … a las …' },
  { label: 'Pedir para llevar', message: 'Hola Lilium! Quería hacer un pedido para llevar: ' },
  { label: 'Consultar por tortas', message: 'Hola Lilium! Quería consultar por tortas y pastelería.' },
  { label: 'Otra consulta', message: 'Hola Lilium! Quería hacer una consulta.' },
] as const

export const SCENES = [
  { href: '#amanecer', label: 'Amanecer', time: '08:00' },
  { href: '#ritual', label: 'El ritual', time: '09:00' },
  { href: '#mantel', label: 'El mantel', time: '17:00' },
  { href: '#selva', label: 'La selva', time: '18:00' },
  { href: '#opiniones', label: 'Opiniones', time: '19:30' },
  { href: '#visitanos', label: 'Visitanos', time: '21:00' },
] as const
