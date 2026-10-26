/*
 * Horario del local: fuente única. Por día de la semana (0 = domingo), los tramos abiertos en minutos.
 * De acá salen el estado "Abierto/Cerrado", la tabla de horarios y los datos estructurados (JSON-LD).
 * Martes a sábado corrido; domingo mañana y tarde; lunes cerrado.
 */
const CORRIDO: [number, number][] = [[8 * 60, 21 * 60]]
const PARTIDO: [number, number][] = [
  [8 * 60, 12 * 60],
  [17 * 60, 21 * 60],
]
export const HORARIO: [number, number][][] = [PARTIDO, [], CORRIDO, CORRIDO, CORRIDO, CORRIDO, CORRIDO]

export const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const hh = (m: number) => String(Math.floor(m / 60)).padStart(2, '0')
const tramos = (slots: [number, number][], corto = false) =>
  slots.length ? slots.map(([a, b]) => (corto ? `${hh(a)}–${hh(b)}` : `${hhmm(a)} – ${hhmm(b)}`)).join(' · ') : 'cerrado'

export const SITE = {
  name: 'Lilium House & Coffee',
  brand: 'Lilium Coffee Lounge',
  address: 'Av. Tres Fronteras 467/489',
  postalCode: 'N3370AWE',
  city: 'Puerto Iguazú, Misiones',
  phoneDisplay: '+54 3757 45-7085',
  phoneHref: 'tel:+543757457085',
  // Número de WhatsApp del perfil de Instagram (wa.link/k3hzi5)
  whatsapp: '543757317284',
  whatsappDisplay: '+54 3757 31-7284',
  instagram: 'lilium.coffee',
  instagramHref: 'https://www.instagram.com/lilium.coffee/',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Lilium House & Coffee, Av. Tres Fronteras 489, Puerto Iguazú, Misiones'),
  // Horario publicado en Instagram
  hours: {
    days: 'Martes a Domingo',
    rows: [
      ['Mar a Sáb', tramos(HORARIO[2])],
      ['Domingo', tramos(HORARIO[0], true)],
      ['Lunes', tramos(HORARIO[1])],
    ] as [string, string][],
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
  { href: '#carta', label: 'La carta', time: '11:45' },
  { href: '#mantel', label: 'El mantel', time: '17:00' },
  { href: '#selva', label: 'La selva', time: '18:00' },
  { href: '#opiniones', label: 'Opiniones', time: '19:30' },
  { href: '#visitanos', label: 'Visitanos', time: '21:00' },
] as const

// La carta por momento del día ("Desayunos, almuerzos y meriendas", como dice el perfil).
// Las fotos son del Instagram del local; los nombres y descripciones hay que confirmarlos
// con la carta real. `plato` = foto de estudio (IA, ilustrativa) y sprite de la mesa giratoria; `recorte` = foto real
// del Instagram recortada sobre su color (`src` sin el ancho: hay -360 y -720); `foto` = foto de la casa tal cual.
export type CartaItem =
  | { kind: 'plato'; id: 'cafe' | 'chipa' | 'te' | 'cheesecake' | 'torta' | 'tostado' | 'ensalada'; name: string; note: string; desc: string }
  | { kind: 'foto'; src: string; name: string; note: string; desc: string }
  | { kind: 'recorte'; src: string; name: string; note: string; desc: string }

export const CARTA: { id: string; label: string; time: string; intro: string; items: CartaItem[] }[] = [
  {
    id: 'desayunos',
    label: 'Desayunos',
    time: '08:00',
    intro: 'Para arrancar el día sin apuro.',
    items: [
      { kind: 'plato', id: 'cafe', name: 'Café de especialidad', note: 'espresso, con leche o frío', desc: 'Tazas generosas y latte art de la casa.' },
      { kind: 'foto', src: '/fotos/box-desayuno.webp', name: 'Box de desayuno', note: 'para regalar', desc: 'Bagel, scones, cookies, medialuna y fruta.' },
      { kind: 'plato', id: 'chipa', name: 'Chipa', note: 'recién horneada', desc: 'Almidón de mandioca y queso, calentita.' },
      { kind: 'recorte', src: '/carta/real/croissant-huevos', name: 'Croissant con huevos', note: 'para empezar con todo', desc: 'Jamón crudo, huevos a la plancha y verdes.' },
      { kind: 'plato', id: 'te', name: 'Té en tetera', note: 'para compartir', desc: 'Hebras servidas en tetera, sin apuro.' },
    ],
  },
  {
    id: 'almuerzos',
    label: 'Almuerzos',
    time: '12:00',
    intro: 'Al mediodía, algo rico y liviano para seguir paseando.',
    items: [
      { kind: 'foto', src: '/fotos/picada.webp', name: 'Tabla para compartir', note: 'para la mesa', desc: 'Quesos, fiambres, aceitunas y tomates.' },
      { kind: 'plato', id: 'tostado', name: 'Tostados y sándwiches', note: 'a la plancha', desc: 'En pan de la casa, con jugo o café.' },
      { kind: 'plato', id: 'ensalada', name: 'Ensaladas', note: 'frescas', desc: 'Verdes de estación, tomate y huevo.' },
      { kind: 'recorte', src: '/carta/real/sandwich-crudo', name: 'Sándwich de crudo', note: 'en pan integral', desc: 'Jamón crudo, queso y verdes.' },
      { kind: 'recorte', src: '/carta/real/sandwich-papas', name: 'Sándwich con papas', note: 'para el mediodía', desc: 'Carne, queso y lechuga en pan largo, con papas fritas.' },
    ],
  },
  {
    id: 'meriendas',
    label: 'Meriendas',
    time: '17:00',
    intro: 'La vitrina se abre: tortas, budines y tentaciones.',
    items: [
      { kind: 'recorte', src: '/carta/real/torta-oreo', name: 'Torta Oreo', note: 'de la vitrina', desc: 'Capas de crema, galletita y dulce de leche.' },
      { kind: 'plato', id: 'cheesecake', name: 'Cheesecake', note: 'con frutos rojos', desc: 'Cremoso, sobre base crocante.' },
      { kind: 'recorte', src: '/carta/real/budin-lima', name: 'Budín con lima', note: 'con corona de crema', desc: 'Esponjoso, con crema y ralladura de lima.' },
      { kind: 'recorte', src: '/carta/real/cheesecake-maracuya', name: 'Cheesecake de maracuyá', note: 'con la pulpa', desc: 'Cremoso, sobre base de chocolate.' },
      { kind: 'recorte', src: '/carta/real/croissant-frutillas', name: 'Croissant con frutillas', note: 'relleno', desc: 'Crema pastelera, frutillas y azúcar impalpable.' },
      { kind: 'recorte', src: '/carta/real/brownies', name: 'Brownies', note: 'con frutos rojos', desc: 'Con nueces, dulce de leche y frutos rojos.' },
      { kind: 'foto', src: '/fotos/red-velvet.webp', name: 'Red velvet', note: 'con frutillas', desc: 'Bizcocho rojo y crema suave.' },
      { kind: 'plato', id: 'torta', name: 'Torta de chocolate', note: 'húmeda', desc: 'Con frambuesa.' },
    ],
  },
]

const DIAS_SCHEMA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Datos estructurados de la cafetería (schema.org), generados desde SITE y HORARIO al prerenderizar. */
export function jsonLd() {
  const porTramo = new Map<string, string[]>()
  HORARIO.forEach((slots, dia) =>
    slots.forEach(([a, b]) => {
      const k = `${hhmm(a)}-${hhmm(b)}`
      porTramo.set(k, [...(porTramo.get(k) ?? []), DIAS_SCHEMA[dia]])
    }),
  )
  return {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: SITE.brand,
    alternateName: SITE.name,
    telephone: SITE.phoneDisplay,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address,
      postalCode: SITE.postalCode,
      addressLocality: 'Puerto Iguazú',
      addressRegion: 'Misiones',
      addressCountry: 'AR',
    },
    servesCuisine: ['Café', 'Desayunos', 'Almuerzos', 'Meriendas', 'Pastelería'],
    sameAs: [SITE.instagramHref],
    openingHoursSpecification: [...porTramo].map(([k, dias]) => {
      const [opens, closes] = k.split('-')
      return { '@type': 'OpeningHoursSpecification', dayOfWeek: dias.length === 1 ? dias[0] : dias, opens, closes }
    }),
  }
}
