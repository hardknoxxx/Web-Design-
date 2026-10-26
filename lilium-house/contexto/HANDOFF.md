# HANDOFF — Lilium Coffee Lounge (para retomar en una sesión nueva)

Documento de traspaso **vigente** (26 oct. 2026). Si algo de `README.md` contradice esto, vale esto.
Historial pedido por pedido: [historial.md](./historial.md). Reglas del cliente: `CLAUDE.md` en la raíz del repo.

---

## 1. Enlaces

| Qué | Dónde |
| --- | --- |
| Producción | https://lilium-house.vercel.app (Vercel `hardknoxxx/lilium-house`, rootDirectory `lilium-house`, despliega `main` solo) |
| Vista previa de la rama | https://lilium-house-git-ccr-fda5bd2b-rxfhw3-hardknoxxx.vercel.app |
| Repo | https://github.com/hardknoxxx/Web-Design- (carpeta `lilium-house/`) |
| Rama de trabajo | `ccr-fda5bd2b-rxfhw3` |
| PRs | #24, #25, #26 mergeados y desplegados. **#27 abierto** (fotos de estudio, papeles, henrietta, mapa animado, mancha de Visitanos, cuaderno de campo): falta aprobación del cliente para mergear |
| Figma (imágenes IA) | https://www.figma.com/design/trwBOhm7IbrMNMT7s8MyDi — "Lilium · fotos de platos (IA, prototipo)". Plan `team::1695123800168087804` |
| Figma storyboard | archivo `8a62hs9qgXqNI8zOzefJmC` |
| Referencias | Agrumea (agrumeafarm.it/en), Madie y TAB Kitchen (onepagelove.com), LATTE (label.std), henrietta.wearetattoodigital.com, neutomni, nickho |

## 2. Reglas que no se negocian

- Español rioplatense, respuestas concisas.
- **Antes de instalar/ejecutar** skills, MCP, scripts o binarios: inspeccionar contenido, origen y efectos.
- **No publicar ni mergear sin aprobación explícita** del cliente ("mergealo"). Flujo por entrega aprobada:
  commit → push → PR → merge a `main` → deploy (Vercel despliega `main` solo; o `vercel deploy --prod --yes`).
- **No inventar** platos, precios, fotos ni datos. Las imágenes IA las pidió el cliente para el prototipo: están
  marcadas como ilustrativas y se reemplazan por fotos reales antes del lanzamiento.
- Probar en 390×844 y 1440×900 (y 768). Medir con Playwright. Para medir scroll: `scrollTo({top, behavior:'instant'})`.
- No sumar dependencias sin justificar.
- **Movimiento reducido: decisión del cliente, se ignora** (`reducido()` devuelve `false` y `MOTION_REDUCIDO='never'`
  en `src/nuevo/animar.ts`), porque en su PC los efectos no se veían.
- Nunca correr `pkill -f "vite preview"` en la sesión: mata la propia shell (exit 144).

## 3. Negocio (fuente única: `src/data/site.ts`)

Av. Tres Fronteras 467/489, Puerto Iguazú, Misiones · Instagram @lilium.coffee · WhatsApp +54 3757 31-7284
(`https://wa.me/543757317284`) · Tel. +54 3757 45-7085 · martes a sábado 08–21, domingo 08–12 y 17–21, lunes cerrado.
Google: 4,5 ★ con 45 opiniones (dato público de la ficha). Solo cafetería (nada de alojamiento).

**Pendiente de confirmar con los dueños:** horario y teléfono vigentes, nombres y descripciones de la carta,
puntaje de Google actualizado, fotos originales en buena resolución (las de Instagram son chicas).

## 4. Stack y comandos (`lilium-house/`)

React 19 · TypeScript 7 · Vite 8 · Tailwind v4 · GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG, MorphSVG, registrados en
`animar.ts`) · Lenis (`suave.ts`) · motion 14.6 (`motion/react`) · animejs 4.5.0 (import diferido en Visita) ·
three (solo la página archivada y el pipeline de sprites).

```bash
npm run build      # tsc + vite build + build SSR + scripts/prerender.mjs (HTML de la portada + JSON-LD)
npx vite preview --port 4173 --strictPort   # levantar solo si `curl localhost:4173` falla
npm run lint       # tsc --noEmit
```

## 5. Mapa de la portada (`src/nuevo/`, orden de la página)

| Archivo | Qué es |
| --- | --- |
| `NuevoApp.tsx` | Arma la página; botón flotante "Cómo llegar" (se oculta sobre elementos con `data-sin-flotante`) |
| `Cabecera.tsx` | Cabecera fija con logo (`LogoLilium.tsx`) y menú overlay |
| `MesaGiratoria.tsx` | Hero "La mesa giratoria": sprites 2D de 36 cuadros (`public/platos/{id}-giro-{m,d}.webp`, hojas 6×6) con inercia y desenfoque; mandala del mantel que se pinta (localStorage `lilium-mantel`); pista del cursor |
| `Vitrina.tsx` | Cinta + "Elegí tu favorito" + mazo de fotos reales arrastrable (motion), mancha con morph, estampilla "Hecho en casa" |
| `Manifiesto.tsx` | Frase con palabras que se encienden (SplitText) + sello giratorio de Google 4,5 |
| `Carta.tsx` | Pestañas por momento (Magnetic, IconoMomento, FondoAnimado, TextEffect), palabra gigante del momento, láminas con forma ondulada; hoja para pintar junto a las pestañas; cartel de papel arrugado al final |
| `Papeles.tsx` | `Estampilla` (borde dentado), `CartelDePapel` (bollo → abierto), `HojaParaPintar` (lirio que se pinta con el scroll) |
| `Visita.tsx` | "Te esperamos": estado abierto/cerrado, enlaces animados (skiper40), croquis con calles reales de OSM (`croquisDatos.ts`) animado con anime.js, horario con "hoy" |
| `Rincon.tsx` + `Cuaderno.tsx` | Cierre: logo, frase y **cuaderno de campo** (bocetos a lápiz y acuarela) |
| `Coreografia.tsx` | Todas las entradas GSAP: portada que se achica, vitrina, carta, **mancha de café de Visitanos**, cierre |
| `Piezas.tsx` | `Cinta`, `Sticker`, `ondulado()` (forma ondulada usada en máscaras y manchas) |
| `primitivas/` | FondoAnimado, Magnetic, TextEffect, TextLoop, Tilt (adaptadas de motion-primitives) |
| `nuevo.css` | Todo el estilo de la portada, por bloques `/* ---------- Sección ---------- */` |

Página archivada "Un día en Lilium": `/anterior.html` (`src/main.tsx`, `src/sections/`, `src/components/`). No tocar
salvo pedido.

## 6. Últimos cambios (sesión del 26 oct., en PR #27)

- **Carta tono sobre tono:** las 7 fotos IA se regeneraron con el fondo del mismo color que el plato en otro tono
  (torta de chocolate sobre marrón claro `#C9A27F`, cheesecake rosa `#F1C0BE`, café `#DDBE98`, chipa `#EED9A4`,
  té `#E9C996`, tostado `#E8CDA0`, ensalada `#CFE0A6`). Las fotos reales usan `COLOR_FOTO` en `Carta.tsx`
  (Oreo `#D9CFC4`, box `#E8D3B0`, budín `#F1E7A8`, red velvet `#F2B5B0`, frutos rojos `#E7B8C9`, tabla `#D7D9A8`).
- **"Te esperamos" entra como una mancha de café:** `#visita` lleva una máscara con forma `ondulado(9, 0.06)` que nace
  cerca del mapa y crece con el scroll (`--mancha` 0 → 260vmax, `power2.in`, `scrub`); al llegar al 100 % se quita la
  máscara (clase `abierta`). El título cae letra por letra con rebote; datos y horario en cascada. Se quitaron las
  franjas de colores.
- **Cuaderno de campo** (reemplaza al Matorral SVG, que se borró junto con `Lirio.tsx`): tucán agarrado a su rama,
  hornero parado sobre su horno de barro y coatí caminando, bocetos IA (Gemini vía Figma) pasados a transparencia con
  `scripts/quitar_papel.py` (color-to-alpha + borde que se desvanece: no hay cortes rectos). Notas a mano en Caveat con
  nombre científico; se descubren en diagonal al entrar, después se mecen; mariposa 88 en SVG que vuela por un
  `offset-path`. Guía usada: **taste-skill** (`references/imagery.md`: lámina/grabado como motivo, un solo lenguaje
  gráfico, tres niveles de detalle, dibujo grande).
- Hoja para pintar movida al hueco a la derecha de las pestañas (móvil); sello del manifiesto sube en móvil (sin franja lima vacía).
- Medición local 390×844, 4G lento + CPU 4×: FCP 0,94 s, LCP 1,43 s, CLS 0,02, TBT de carga 621 ms, scroll 59 fps sin tirones.
  (Local, no en un teléfono real.)

## 7. Pendientes

1. **Mergear PR #27** cuando el cliente lo apruebe.
2. **Lirio con picaflor** para el cuaderno: se acabaron los créditos de IA de Figma (se renuevan 2026-10-27 00:00 UTC).
   Prompt usado para los otros (mantener el mismo): *"Naturalist field-notebook sketch of …, loose confident graphite
   pencil and fine sepia ink linework with visible construction lines and hatching, light transparent watercolor
   washes only on parts …, isolated subject on pure plain white paper, no background, no border, no frame, no text,
   no shadow on paper"*, modelo `gemini-3.1-flash-image`. Después: `python3 -I scripts/quitar_papel.py lirio.png
   public/cuaderno/lirio`, sumarlo a `BOCETOS` en `Cuaderno.tsx` y ubicarlo en `nuevo.css` (bloque cuaderno).
3. Auditoría impeccable (14/20) — arreglos P1/P2 que faltan: loops que no se pueden pausar (WCAG 2.2.2), `aria-label`
   de SplitText en spans del Manifiesto (axe `aria-prohibited-attr`), cartas del mazo enfocables, ticker del sello
   siempre corriendo, contraste del manifiesto mientras se enciende, `will-change` permanente, `Estado`/`.estado`
   sin uso en `Piezas.tsx`/CSS. El cliente pidió hacerlos después de las mejoras visuales (harden/optimize/clarify/polish).
4. Reemplazar todas las imágenes IA por fotos reales aprobadas (ver §8).
5. Actualizar `README.md` de contexto (quedó con descripciones de etapas anteriores: `vida/`, Friso, three.js).

## 8. Activos

| Carpeta | Qué | Origen |
| --- | --- | --- |
| `public/fotos/oficial/` | Fotos del local (sitio oficial, autorizadas) | Reales |
| `public/fotos/` | Recortes de Instagram (baja resolución) | Reales, reemplazar por originales |
| `public/carta/{id}-{360,720}.webp` | café, chipa, té, tostado, ensalada, cheesecake, torta | **IA, ilustrativas** |
| `public/papel/arrugado.webp` | Textura de papel arrugado | IA (textura, no es producto) |
| `public/cuaderno/{tucan,hornero,coati}-{420,760}.webp` | Bocetos del cuaderno de campo | IA (ilustración) |
| `public/platos/` | Sprites de la mesa giratoria | Render propio (`scripts/sprites/`) |
| `public/fonts/` | Bricolage Grotesque, Caveat, Courier Prime, Raleway (auto-alojadas, OFL) | — |

Paleta: `#64BCB0` `#277067` `#1C4A45` `#3D2314` `#FAF7F2` `#415521` `#6F7F2E` `#97AD3D` (+ tokens en `src/index.css`).

## 9. Scripts

- `scripts/prerender.mjs` — HTML de la portada + JSON-LD en `dist/index.html`.
- `scripts/sprites/` — pipeline de la mesa: `render.html/render.ts` (escena three.js por plato), `render.cjs`
  (Playwright captura 36 cuadros), `build-sheets.py` (arma hojas 6×6 webp), `objetos.ts` (modelos).
- `scripts/quitar_papel.py` — boceto sobre papel → webp con transparencia, sin bordes.
- `scripts/qa/recorrido.cjs` — capturas de carta, entrada de Visitanos y cuaderno (1440 y 390).
- `scripts/qa/accesibilidad.cjs` — axe-core (WCAG 2.1 AA), objetivos táctiles, foco, zoom 200 %.
- `scripts/qa/rendimiento.cjs [url]` — FCP/LCP/CLS/TBT y fps de scroll, sin límite y "gama media"
  (4G lento + CPU 4×). Resultados en `scripts/qa/perf/` (ignorado por git).

## 10. Skills y conectores

Skills del repo (`.claude/skills/`, auditadas, cada una con su `SOURCE.md` o licencia):

| Skill | Para qué se usó |
| --- | --- |
| `taste-skill` | Dirección de arte, evitar look de plantilla; guía de imágenes/dibujo (cuaderno de campo) |
| `impeccable` | Crítica y auditoría (14/20); el motor es un binario nativo que no se versiona, **sin hooks** |
| `emil-design-eng` | Curvas y duraciones (ease-out fuertes, solo transform/opacity/clip-path/mask) |
| `motion` | Motion (Framer Motion) y CSS: mazo, pestañas, primitivas |
| `ui-ux-pro-max` | Patrones y paletas de apoyo |

Conectores: **Figma** (`generate_image` con Gemini para las imágenes; sesión `e3fc8a74-a713-418c-8d91-685e6eeab3ca`;
puede pedir autenticación de nuevo), **Vercel** (proyecto y despliegues), **GitHub** (PRs). Playwright: el Chromium
del entorno se usa con `require('playwright')` sin instalar nada. `.mcp.json` en la raíz configura Playwright MCP
y Figma MCP.

## 11. Para arrancar la sesión nueva

1. Leer `CLAUDE.md` (raíz), este HANDOFF y el final de `historial.md`.
2. `cd lilium-house && npm ci && npm run build && npx vite preview --port 4173 --strictPort`.
3. Preguntar al cliente si aprobó el PR #27; si sí, mergear y verificar el despliegue.
4. Seguir con los pendientes de §7 en ese orden, con capturas 390/1440 después de cada sección.
