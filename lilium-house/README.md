# Lilium Coffee Lounge — Landing page

Landing de la cafetería **Lilium** (Av. Tres Fronteras 467/489, Puerto Iguazú, Misiones).

**Concepto: “Un día en Lilium”.** El scroll es el paso del día en el café (08:00 → 21:00, el reloj de la barra
superior avanza) y la selva de Puerto Iguazú va trepando por la página: enredaderas que crecen por los bordes,
hojas de monstera que se abren y se cierran, escenas fijadas donde los elementos cambian de lugar.

Storyboard de las animaciones de scroll en Figma: “Lilium Coffee Lounge — Storyboard de scroll”
(https://www.figma.com/design/8a62hs9qgXqNI8zOzefJmC). Cada frame es un momento del scroll con su ficha de animación.

Stack: React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · React Three Fiber (three.js).

```bash
npm install
npm run dev      # desarrollo
npm run build    # typecheck + build de producción en dist/
npm run preview  # servir el build
```

## Escenas

| Sección | Hora | Qué pasa al scrollear |
| --- | --- | --- |
| `sections/Amanecer.tsx` | 08:00 | Escena fijada: lirio 3D; la cortina de hojas se abre, sube el sol, aparece la bajada |
| `sections/Ritual.tsx` | 09:00–11:00 | Escena fijada de 3 actos: la taza entra y cambia de lugar, llega la chipa, se levanta la campana de la torta |
| `sections/Carta.tsx` | 11:45 | Los platos se sirven sobre la mesa de madera (datos en `CARTA`, `src/data/site.ts`) |
| `sections/Mantel.tsx` | 17:00 | El mantel de papel se despliega y se colorea (mandala interactivo, descarga PNG) |
| `sections/Selva.tsx` | 18:00 | Parallax: bruma de cataratas, tucán que cruza, mariposas, hojas de frente |
| `sections/Opiniones.tsx` | 19:30 | Contador 0 → 4,5 (Google), chips, las hojas empiezan a cerrarse |
| `sections/Noche.tsx` | 21:00 | El cartel “Lilium” se enciende, luciérnagas, horarios, dirección y teléfono |

Piezas globales: `day/DayProvider.tsx` (scroll → hora y color de la barra), `components/Vines.tsx` (enredaderas),
`components/CupButton.tsx` (WhatsApp: taza que se llena de café con el scroll y abre una comanda con mensajes listos),
`components/TopBar.tsx` (logo, reloj sol/luna y menú de escenas), `components/Botanica.tsx` (ilustraciones SVG).

## Tipografía y color

| Uso | Fuente | Origen (revisado antes de usar) |
| --- | --- | --- |
| Títulos y textos | Bricolage Grotesque (variable con tamaño óptico) | [ateliertriay/bricolage](https://github.com/ateliertriay/bricolage) · OFL |
| Notas a mano | Caveat (Impallari Type, Rosario) | [googlefonts/caveat](https://github.com/googlefonts/caveat) · OFL |
| Datos, tickets y pie | Courier Prime (máquina de escribir, cifras alineadas) | [quoteunquoteapps/CourierPrime](https://github.com/quoteunquoteapps/CourierPrime) · OFL |
| Logo | Yellowtail (como el cartel del local) | Google Fonts |

Auto-alojadas en `public/fonts/` como woff2 recortado a latín (licencias en `public/fonts/licencias/`).

Paleta **Tierra colorada** (tokens en `src/index.css`): el suelo rojo de Misiones (`#B4472B`), miel `#D9A441`,
canela, madera y crema, más los verdes de la selva (musgo `#415521`, yerba `#6F7F2E`, helecho `#97AD3D`).
Base tomada de la paleta Bakery/Cafe de la skill UI UX Pro Max e IguazuFalls de NatParksPalettes. El turquesa
`#00A896` queda como color de marca, usado con moderación.

## Animación

- **GSAP + ScrollTrigger** (`src/lib/gsap.ts`): cortina de hojas del amanecer (8 especies, cada una con su
  ángulo, distancia y momento), enredaderas asimétricas (`components/Vines.tsx`: filodendro a la izquierda,
  hiedra con flores a la derecha, con ritmos de crecimiento distintos), platos de la carta, potus, picaflor,
  hojas que caen y el menú-hoja que se despliega en el panel.
- **Framer Motion**: escenas fijadas existentes (ritual, mantel, selva, opiniones, noche) y la comanda.
- Todo respeta `prefers-reduced-motion` y anima solo `transform`/`opacity`/`clip-path`.

## Para completar antes de publicar

- **WhatsApp**: `SITE.whatsapp` usa `543757457085` (línea fija según Google Maps). Si el WhatsApp del local es un celular, cambiar a `5493757457085`.
- **Carta**: los platos de `CARTA` salen de las fotos y opiniones del local; confirmar con la carta real.
- **Fotos**: la página usa ilustraciones propias. Si se agregan fotos del local, deben ser propias o con permiso.

## Rendimiento móvil

- three.js va en un chunk lazy: texto y CTAs pintan antes de descargar el 3D.
- El render loop se detiene cuando el hero sale de pantalla (IntersectionObserver).
- Todas las animaciones de scroll usan solo `transform`/`opacity` vía MotionValues (sin re-renders de React).
- En dispositivos de bajo consumo: DPR ≤ 1.5, sin antialias, menos segmentos y partículas.
- Scroll y puntero se leen en refs (sin re-renders de React); el lienzo usa `touch-action: pan-y` para no bloquear el scroll vertical.
- Framer Motion con `LazyMotion` + `domAnimation`; respeta `prefers-reduced-motion`.
