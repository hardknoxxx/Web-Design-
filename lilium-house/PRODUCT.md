# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Turistas de paso por Puerto Iguazú (Cataratas) y vecinos de la ciudad, por igual: ninguno de los dos es
secundario. El turista busca dónde desayunar, almorzar o merendar cerca y necesita saber rápido si está
abierto y cómo llegar; el vecino vuelve por el café, la pastelería o a pasar la tarde. Mayormente desde el
teléfono.

## Product Purpose

Landing de **Lilium Coffee Lounge**, una cafetería de Puerto Iguazú. Existe para que el visitante vaya al
local: la acción que más vale es ver el horario, la ubicación y tocar "Cómo llegar" (Google Maps). WhatsApp
(reservas, pedidos para llevar, tortas) e Instagram (el menú del día) acompañan, no compiten con ese objetivo.

## Positioning

Un café de especialidad verde por dentro, en la ciudad de las Cataratas: plantas en cada rincón, flores
frescas, madera, y manteles ilustrados para colorear con lápices en cada mesa. Solo cafetería: **no** hay
alojamiento ni B&B (aunque Google Maps lo liste como "Lilium House & Coffee").

## Operating Context

- Av. Tres Fronteras 467/489, N3370AWE, Puerto Iguazú, Misiones, Argentina.
- Horario: martes a sábado 08–21; domingo 08–12 y 17–21; lunes cerrado.
- Desayunos, almuerzos y meriendas: café de especialidad, chipa, pastelería.
- Canales: WhatsApp +54 3757 31-7284, teléfono fijo +54 3757 45-7085, Instagram @lilium.coffee.

## Capabilities and Constraints

- Sitio estático (React 19 + Vite + Tailwind v4), publicado en Vercel (`lilium-house.vercel.app`). Sin backend:
  reservas y pedidos se derivan a WhatsApp con mensajes prearmados.
- Concepto vigente "Un día en Lilium": el scroll recorre el día de 08:00 a 21:00.
- Rendimiento en teléfonos de gama media es requisito: el cliente nota tirones y borrosidad.
- **Abierto:** idiomas del sitio (hoy solo español rioplatense; no está decidido si sumar inglés y portugués
  para turistas de la triple frontera).
- **Abierto:** nombres de la carta (sobre todo almuerzos) sin confirmar con el local.

## Brand Commitments

- Nombre "Lilium Coffee Lounge"; logo con el lirio blanco y la tipografía script, menta del logo `#64BCB0`.
- Voz en español rioplatense, cálida y directa ("Deslizá y entrá", "Te esperamos").
- Estética botánica, orgánica, premium y asimétrica; nada genérico. Transiciones suaves y conectadas.

## Evidence on Hand

- Google: 4,5 sobre 45 opiniones (servicio 4,4; ubicación 4,6), con los comentarios destacados en
  `src/data/site.ts`.
- Fotos de Instagram en `public/fotos/` (box de desayuno, budín, picada, red velvet, tarta de frutos rojos,
  torta Oreo): recortes chicos, faltan los originales en buena resolución.
- No hay precios, testimonios con nombre, prensa ni fotos del salón: no inventarlos.

## Product Principles

1. Llegar es lo primero: horario, estado (abierto/cerrado) y "Cómo llegar" siempre a mano.
2. Sirve igual al turista apurado y al vecino que vuelve: la información esencial no depende de recorrer toda la experiencia.
3. Lo verde y lo hecho a mano (plantas, manteles para colorear) son la diferencia real; mostrarlos, no describirlos.
4. Fluidez en el teléfono antes que efecto: ninguna animación justifica un tirón.
5. Solo hechos del local: nada de alojamiento, ofertas ni reseñas inventadas.

## Accessibility & Inclusion

Respetar `prefers-reduced-motion` (ya implementado en todo el sitio) y mantener el contenido legible y
navegable sin depender de las animaciones ni del 3D.
