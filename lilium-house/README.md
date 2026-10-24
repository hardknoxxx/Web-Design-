# Lilium Coffee Lounge — Landing page

Landing de la cafetería **Lilium** (Av. Tres Fronteras 467/489, Puerto Iguazú, Misiones).

**Concepto: “Un día en Lilium”.** El scroll es el paso del día en el café (08:00 → 21:00, el reloj de la barra
superior avanza) y la selva de Puerto Iguazú va trepando por la página: enredaderas que crecen por los bordes,
hojas de monstera que se abren y se cierran, escenas fijadas donde los elementos cambian de lugar.

Storyboard de las animaciones de scroll en Figma: “Lilium Coffee Lounge — Storyboard de scroll”
(https://www.figma.com/design/8a62hs9qgXqNI8zOzefJmC). Cada frame es un momento del scroll con su ficha de animación.

Stack: React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · GSAP · Lenis · three.js (lirio 3D, sin React en el bucle).

```bash
npm install
npm run dev      # desarrollo
npm run build    # typecheck + build de producción en dist/
npm run preview  # servir el build
```

## Escenas

| Sección | Hora | Qué pasa al scrollear |
| --- | --- | --- |
| `sections/Amanecer.tsx` | 08:00 | Escena fijada: abre limpio con el lirio 3D (zoom suave al scrollear) y el sotobosque; sube la selva lejana (palmeras pindó), las plantas brotan del suelo y la cámara atraviesa el follaje hasta la taza |
| `sections/Ritual.tsx` | 09:00–11:00 | Escena fijada de 3 actos: la taza entra y cambia de lugar, llega la chipa, se levanta la campana de la torta |
| `sections/Carta.tsx` | 11:45 | Pestañas Desayunos / Almuerzos / Meriendas (abre la que corresponde a la hora); platos ilustrados y fotos del Instagram se sirven sobre la mesa (datos en `CARTA`, `src/data/site.ts`) |
| `sections/Mantel.tsx` | 17:00 | El mantel de papel se despliega y se colorea (mandala interactivo, descarga PNG); abajo, un picaflor liba en una rama de ceibo |
| `sections/Selva.tsx` | 18:00 | Parallax: bruma de cataratas, tucán que cruza, un coatí que camina con el scroll, mariposas, hojas de frente |
| `sections/Opiniones.tsx` | 19:30 | Contador 0 → 4,5 (Google), chips, el hornero junto a su horno de barro, las hojas empiezan a cerrarse |
| `sections/Noche.tsx` | 21:00 | El cartel “Lilium” se enciende, luciérnagas, horarios, dirección y teléfono |

Piezas globales: `day/DayProvider.tsx` (scroll → hora y color de la barra), `components/Vines.tsx` (enredaderas),
`components/CupButton.tsx` (WhatsApp: taza que se llena de café con el scroll y abre una comanda con mensajes listos),
`components/TopBar.tsx` (logo, reloj sol/luna y menú de escenas), `components/Botanica.tsx` (ilustraciones SVG).

## Tipografía y color

| Uso | Fuente | Origen (revisado antes de usar) |
| --- | --- | --- |
| Títulos y textos | Bricolage Grotesque (variable con tamaño óptico) | [ateliertriay/bricolage](https://github.com/ateliertriay/bricolage) · OFL |
| Notas a mano | Caveat (Impallari Type, Rosario) | [googlefonts/caveat](https://github.com/googlefonts/caveat) · OFL |
| Tickets y comanda | Courier Prime (máquina de escribir) | [quoteunquoteapps/CourierPrime](https://github.com/quoteunquoteapps/CourierPrime) · OFL |
| Datos del cierre | Raleway (cifras alineadas) | [google/fonts](https://github.com/google/fonts/tree/main/ofl/raleway) · OFL |
| Logo | Yellowtail (como el cartel del local) | Google Fonts |

Auto-alojadas en `public/fonts/` como woff2 recortado a latín (licencias en `public/fonts/licencias/`).

Color de marca: la **menta del logo** `#64BCB0` (token `turquesa`), con `turquesa-dark` `#277067` para texto
sobre claro y `laguna` `#1C4A45` para superficies oscuras (menú, noche). Acompañan madera, crema, miel y los
verdes de la selva (musgo `#415521`, yerba `#6F7F2E`, helecho `#97AD3D`); la tierra colorada `#B4472B` queda
como acento chico. El lirio (`LilyMark`, favicon) es el trazo blanco del logo.

## Ilustración

- `components/Flora.tsx`: cada hoja tiene volumen (luz sobre la nervadura central, sombra hacia bordes y base),
  nervaduras recortadas al contorno y un tallo que puede seguir por debajo del borde (`stem`) para nacer del suelo.
- `components/Paisaje.tsx`: selva lejana, sotobosque y rama de ceibo. `components/Fauna.tsx`: hornero con su nido y coatí.

## Animación

- **GSAP + ScrollTrigger** (`src/lib/gsap.ts`): cortina de hojas del amanecer (8 especies, cada una con su
  ángulo, distancia y momento), enredaderas asimétricas (`components/Vines.tsx`: filodendro a la izquierda,
  hiedra con flores a la derecha, con ritmos de crecimiento distintos), platos de la carta, potus, picaflor,
  hojas que caen y la taza del botón de WhatsApp: al tocarla, taza, plato y cucharita reaccionan cada
  uno con su retardo, su curva y su eje (`clink` en `CupButton.tsx`), y la bolita de papel sale de la boca
  de la taza (escala 0), sube en arco hasta el centro de la pantalla y ahí se desenvuelve.
- **Menú-hoja** (`.hoja-panel` en `index.css`): se abre desde el botón como una hoja o un abanico; anclaje
  arriba a la derecha, revelado circular desde la esquina, `scale` + `rotate` con tiempos distintos (la punta
  traza un arco) y `cubic-bezier(0.34, 1.56, 0.64, 1)` para el rebote al asentarse.
- **Framer Motion**: escenas fijadas existentes (ritual, mantel, selva, opiniones, noche) y la comanda.
- **Lenis** (`src/lib/scroll.ts`, 1.3.26 auditada): scroll suave con rueda y trackpad, atado al reloj de GSAP
  (Lenis, ScrollTrigger y Framer leen la misma posición en el mismo cuadro). En pantallas táctiles y con
  movimiento reducido no se activa: queda el scroll nativo. Los enlaces del menú-hoja viajan con la misma curva.
- **Apariciones** (`components/Reveal.tsx`): `Reveal`, `RevealGroup`/`RevealItem` (cascada) y `RevealWords`
  (títulos que suben palabra por palabra desde una ventana oculta), una sola vez, con la curva orgánica.
  Entrada del hero al cargar; encabezados de la carta, opiniones y el cierre.
- **Paralaje** (`components/Parallax.tsx`): solo `transform`, recorrido más corto en el teléfono. Picaflor y
  ceibo, nido del hornero y dos planos de luciérnagas en el cierre.
- Todo respeta `prefers-reduced-motion` y anima solo `transform`/`opacity`/`clip-path`.

## Para completar antes de publicar

- **WhatsApp**: `SITE.whatsapp` = `543757317284` (el del perfil de Instagram, wa.link/k3hzi5).
- **Horario**: Mar a Sáb 08–21, Dom 08–12 y 17–21, lunes cerrado (`SITE.hours`, `useOpenStatus`, JSON-LD).
- **Carta**: nombres y descripciones de `CARTA` salen de las fotos y opiniones; confirmar con la carta real.
- **Fotos** (`public/fotos/`): recortes chicos de la grilla de Instagram del local. Reemplazar por los originales
  en mejor resolución (mín. 800 px) cuando estén.

## Rendimiento móvil

- Lirio 3D en three.js puro (`components/three/lily.ts`; `LilyCanvas.tsx` solo lo monta y lo libera):
  ~1.000 triángulos y 4 llamadas de dibujo (pétalos instanciados, tallo/hojas/estambres fusionados en una
  malla, un solo material Lambert, una nube de polen). Pixel ratio `Math.min(devicePixelRatio, 2)` que baja de
  a escalones (1,5 → 1,25 → 1) si la página no sostiene ~50 fps; tope de 60 fps y, en equipos de bajo consumo,
  30 fps mientras gira sola (60 apenas la tocan o scrollean). El bucle se detiene fuera de pantalla
  (IntersectionObserver), con la pestaña oculta y al atravesar el follaje; `dispose()` libera geometrías,
  materiales, textura, contexto WebGL y canvas. Arrastrar la gira siguiendo el dedo (con inercia); un toque
  rápido, vuelta de bienvenida con rebote. `touch-action: pan-y`: el gesto vertical sigue siendo scroll.
- three.js empieza a bajar apenas se evalúa el JS principal; mientras tanto se ve un boceto ilustrado del lirio
  (`components/LirioBoceto.tsx`) que se funde con el 3D en su primer cuadro.
- Sprite de la comanda al tamaño en que se muestra (el menú ya no usa película: CSS); se baja y decodifica
  recién cuando el lirio ya está, y el fondo CSS se asigna al reproducirlos (un `background-image` oculto se
  descargaba igual al cargar la página).
- Enredaderas montadas cuando el navegador está libre (medir el tallo forzaba el diseño de toda la página).
- Un solo fondo del día (`DayBackground`) en vez de un fondo por sección; los bordes de las escenas fijadas se funden con un degradé del mismo color.
- Bucles decorativos pausados fuera de pantalla (`pauseOffscreen`); capas chicas compuestas en vez de capas de pantalla completa.
- Todas las animaciones de scroll usan solo `transform`/`opacity` vía MotionValues (sin re-renders de React).
- En dispositivos de bajo consumo: sin antialias, menos partículas y 30 fps en reposo para el lirio.
- Framer Motion con `LazyMotion` + `domAnimation`; respeta `prefers-reduced-motion`.
