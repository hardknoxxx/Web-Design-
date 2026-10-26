# Contexto del proyecto — Lilium Coffee Lounge

> **Para retomar en otra sesión, leer primero [HANDOFF.md](./HANDOFF.md)** (vigente; este README tiene partes de etapas anteriores).

Resumen compacto de la conversación con Claude Code que construyó esta landing (oct. 2026).
Sirve para retomar el trabajo en otra sesión sin perder decisiones. El historial detallado,
pedido por pedido, está en [historial.md](./historial.md).

## El negocio

- **Lilium Coffee Lounge** (Google Maps: "Lilium House & Coffee"), Av. Tres Fronteras 467/489, N3370AWE,
  Puerto Iguazú, Misiones. Instagram [@lilium.coffee](https://www.instagram.com/lilium.coffee/).
- WhatsApp **+54 3757 31-7284** (`543757317284`). Teléfono fijo +54 3757 45-7085.
- Horario: martes a sábado 08–21 · domingo 08–12 y 17–21 · lunes cerrado.
- Desayunos, almuerzos y meriendas: café de especialidad, chipa, pastelería; manteles para colorear.
- **Solo la cafetería**: nada de alojamiento/B&B.

## Sitio

- Producción: https://lilium-house.vercel.app (proyecto Vercel `hardknoxxx/lilium-house`, rootDirectory `lilium-house`).
- Repo: `hardknoxxx/Web-Design-`, carpeta `lilium-house/`. Rama de trabajo actual `ccr-fda5bd2b-rxfhw3` (antes `ccr-055fb50e-v2vhdy`).
- Stack: React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · GSAP + ScrollTrigger ·
  Lenis (scroll suave solo con rueda/trackpad) · three.js puro (lirio 3D, `components/three/lily.ts`). Comanda en stop-motion hecha con **Remotion** (`animaciones/`).

### Dirección visual vigente: "Vitrina" (propuesta A, ref. LATTE de label.std)

Títulos en Bricolage Grotesque condensada (ancho 75 %, peso 800, mayúsculas: `.titulo-vitrina`), cintas menta y
lima que corren cruzadas (`Cinta`), stickers de borde ondulado a mano (`Sticker`), manchas onduladas detrás de las
fotos (`Mancha`) y botones píldora (`.pildora-*`). Cabecera fija crema con el logo oficial vectorizado
(`LogoLilium.tsx`, calcado del archivo del sitio oficial) y menú a pantalla completa en menta (`Cabecera.tsx`).
Fotos reales (sitio oficial, autorizadas por el cliente) en `public/fotos/oficial/`.

### Concepto vigente: "La mesa giratoria" (portada, `src/nuevo/`)

Referencias: Madie (carta en láminas, color de marca fuerte, mapa con horario), TAB Kitchen & Bakery
(ilustración plana, friso botánico) y Agrumea Farm (carrusel que gira con el scroll).

| Sección | Qué pasa |
| --- | --- |
| Mesa (`MesaGiratoria.tsx`) | Mesa verde infinita como la referencia: el scroll le da una vuelta entera y el arrastre, las flechas y ←/→ siguen sin tope; tocar un plato lo trae al frente por el lado más corto y lo hace girar; los platos se colorean desde el centro. Sin flora en la mesa. Logo de marca (disco menta con lirio blanco, `Logo.tsx`) |
| Carta (`Carta.tsx`) | Láminas por momento (pestañas según la hora en Iguazú); dibujos y fotos se pintan al entrar |
| Visita (`Visita.tsx`) | Mapa con calles reales de OpenStreetMap (`croquisDatos.ts`, generado), horario con "hoy", Cómo llegar / WhatsApp / Llamar; hornero y coatí |
| Friso (`Friso.tsx`) | Solo la franja de selva (sin repetir dirección ni horario) y el © |
| Vida (`vida/`) | Flora y fauna en three.js: cada `<Pieza>` es el SVG de respaldo; el motor lo rasteriza a textura y lo anima (plantas al viento con vertex shader, mariposa que bate las alas, picaflor que se desplaza, tucán y hornero que saltan, coatí que camina). Carga diferida, solo en pantalla, lienzo recortado a la franja de las piezas y 30 fps en teléfono |

"Cómo llegar" flotante cuando la mesa queda atrás.

**Build**: `npm run build` compila el sitio, después un build de servidor de `src/nuevo/entry-server.tsx`, y
`scripts/prerender.mjs` inserta el HTML de la portada y el JSON-LD (generado desde `src/data/site.ts`) en
`dist/index.html`; `main.tsx` lo retoma con `hydrateRoot`. La portada usa su propio CSS (`src/nuevo/base.css`):
`src/index.css` queda solo para `/anterior.html`. El horario vive una sola vez en `HORARIO` (`src/data/site.ts`).

### Concepto anterior "Un día en Lilium" (archivado en `/anterior.html`, `src/main.tsx`)

El scroll es el paso del día (08:00 → 21:00). Un reloj en un cartelito de madera muestra la hora.
Un solo fondo para toda la página que vira de color con la hora (`DayProvider` → `DayBackground`);
cada sección declara `data-phase="fondo|texto|hora"`.

| Escena | Hora | Qué pasa |
| --- | --- | --- |
| Amanecer | 08:00 | Lirio 3D (zoom suave), sotobosque, selva lejana; las plantas brotan y se abren hacia los costados |
| Ritual | 09–11 | Café → chipa → pastelería; aparece debajo del final del amanecer (sin pantalla en blanco) |
| Carta | 11:45 | Pestañas Desayunos/Almuerzos/Meriendas (misma altura); platos que llegan tirados por el mozo |
| Mantel | 17:00 | Mandala para colorear + picaflor en un ceibo |
| Selva | 18:00 | Tucán, coatí que camina con el scroll, mariposas, hojas asimétricas, sotobosque |
| Opiniones | 19:30 | Puntaje Google 4,5, hornero con su nido |
| Noche | 21:00 | Cartel que se enciende, luciérnagas que vagan, datos en Raleway, Instagram |

### Piezas clave

- **Menú-hoja (arriba a la derecha)**: se abre en CSS como una hoja o un abanico (`.hoja-panel`: anclaje
  arriba a la derecha, `clip-path: circle()` desde la esquina, `scale` 0,14→1 y `rotate` −26°→0 con tiempos
  distintos, `cubic-bezier(0.34, 1.56, 0.64, 1)`). La película `HojaMenu` se quitó: el cliente la veía
  estirarse como un palo diagonal. Opciones que se abren como hojas de una planta (origen arriba al
  centro, `scale(0.3) rotateX(-70deg)` → `scale(1) rotateX(0)`, `cubic-bezier(0.175, 0.885, 0.32, 1.275)`
  0,6 s, cascada de 50 ms desde los 300 ms).
- **Botón de WhatsApp (abajo a la derecha)**: taza vista a ~55° sobre su plato, con la cucharita apoyada
  en el plato al lado de la taza, sobre un tronco irregular en diagonal; globo de "escribiendo" dibujado a
  lápiz. Al tocarla: la taza salta y se bambolea, el plato se asienta después y la cucharita tintinea
  (GSAP, cada una con su eje). La bolita de papel sale de la boca de la taza (escala 0), sube en arco
  hasta el centro de la pantalla y se desenvuelve: película `PapelComanda` (bolita centrada en el papel;
  el vuelo lo hace el sitio). Al cerrar se arruga y vuelve a caer en la taza.
- Sprite: `public/anim/papel-comanda.webp`, se precarga cuando el navegador está libre (`src/lib/sprite.ts`).
- Regenerar animaciones: `cd lilium-house/animaciones && npm i && REMOTION_BROWSER=<chrome-headless-shell> npm run render && python3 sprites.py`.

### Diseño

- Paleta: menta del logo `#64BCB0` (`turquesa`), `turquesa-dark #277067`, laguna `#1C4A45`, madera
  `#3D2314`, crema `#FAF7F2`, verdes de selva (musgo `#415521`, yerba `#6F7F2E`, helecho `#97AD3D`).
- Tipografías auto-alojadas (OFL, auditadas): Bricolage Grotesque (títulos/texto), Caveat (notas a mano),
  Courier Prime (tickets/comanda), Raleway (datos del cierre), Yellowtail (logo, Google Fonts).
- Ilustraciones propias en SVG con volumen (Flora, Paisaje, Fauna, TablaMadera). Fotos del Instagram en
  `public/fotos/` (recortes chicos: reemplazar por originales en buena resolución).

## Preferencias del cliente (respetarlas)

- Idioma: español rioplatense. Respuestas **concisas**, directo al grano.
- **Antes de instalar o ejecutar cualquier cosa de GitHub/npm, revisarla** (prompts ocultos, scripts
  de instalación, hooks, binarios descargados). Ej.: Impeccable no se instaló porque trae hooks que
  descargan y ejecutan un binario; se usaron solo sus guías como texto.
- **Cada cambio: commit → push → PR → merge a `main` → `vercel deploy --prod --yes`** (desde la raíz del repo).
- Estética: botánica, orgánica, premium, nada genérico; transiciones suaves y conectadas; asimetría.
- Probar en móvil (390×844) y escritorio (1440×900) antes de publicar; medir rendimiento cuando hay lag.

## Herramientas instaladas

- Skill **ui-ux-pro-max** (nextlevelbuilder) — paletas, tipografías, guías UX.
- **Playwright MCP** (`@playwright/mcp@0.0.83`, Microsoft) en `.mcp.json` (raíz del repo), headless con el
  Chromium del entorno (`/opt/pw-browsers/...`; en otra máquina, quitar `--executable-path`).
- **Impeccable** (skill de diseño, `/impeccable`) en `.claude/` (raíz del repo), **sin hooks**: se instaló con
  `npx impeccable@4.5.2 install -y --providers=claude --scope=project --no-hooks`, aunque el instalador bajó los
  skills y el motor de la 4.7.0 (motor 0.1.16). El motor es un binario nativo no auditable: no se versiona
  (`.gitignore`); el lanzador lo baja de los releases de GitHub y verifica su SHA-256 si falta. No activar
  `/impeccable hooks on` sin decidirlo: correría el binario solo después de cada edición.
- **emil-design-eng** (Emil Kowalski, MIT) en `.claude/skills/emil-design-eng/`: solo Markdown, auditado; fuente y
  commit en `SOURCE.md`. Cubre movimiento e interacción (curvas, duraciones, origen, feedback), no espaciado.
- **Puppeteer MCP no se instaló**: `@modelcontextprotocol/server-puppeteer` está deprecado y sin soporte
  en npm; Playwright MCP cubre lo mismo.
- Playwright MCP: la ruta del Chromium del entorno cambió a `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`
  (oct. 2026); si vuelve a fallar, buscar la carpeta `chromium-*` vigente en `/opt/pw-browsers/`.
- **Figma MCP** (servidor oficial remoto `https://mcp.figma.com/mcp`, HTTP) en `.mcp.json`. Requiere autenticarse una
  vez: en Claude Code, `/mcp` → figma → Authenticate → "Allow Access" en el navegador.
- **Motion** (skill de `motion-ai`, MIT) en `.claude/skills/motion/`, copiada a mano y auditada (ver SOURCE.md); sin los MCP remotos. Componentes adaptados de **Motion Primitives** (MIT) en `src/nuevo/primitivas/`.
- **UI UX Pro Max** (`nextlevelbuilder/ui-ux-pro-max-skill`, MIT) en `.claude/skills/ui-ux-pro-max/`, auditado (commit
  `d14efff`, ver `SOURCE.md`): datos CSV locales y scripts de Python sin red; solo escribe con `--persist`.
  Uso: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<consulta>" --domain <dominio>`.
- **Taste Skill** (`Leonxlnx/taste-skill`, skill `design-taste-frontend`, MIT) en `.claude/skills/taste-skill/`,
  auditado (ver `SOURCE.md`): sus scripts de Node descargan imágenes de dominio público, guardan historial en
  `~/.taste-skill/` y abren un Chrome local para inspeccionar; solo corren al usar el skill. Propone direcciones de
  arte nuevas: en este proyecto manda el mundo visual ya establecido (`PRODUCT.md`).
- Figma: archivo del storyboard de scroll `8a62hs9qgXqNI8zOzefJmC`.

## Pendientes

- Confirmar con el local los nombres de la carta (sobre todo almuerzos) y conseguir fotos originales.
- Probar en un teléfono real el rendimiento del lirio 3D, la selva y los menús (Playwright no tiene GPU:
  el 3D y el dibujado salen peor que en un teléfono).
- **Al medir scroll con Playwright**, usar `scrollTo({ top, behavior: 'instant' })`: en el teléfono el `html`
  tiene `scroll-behavior: smooth` y un `scrollTo(0, y)` por cuadro no mueve la página (las mediciones de scroll
  de los PR #9 y #11 se hicieron así y no son confiables; las del PR #12 ya están corregidas).
- Bloqueo inicial de ~1 s en gama media (render de React de toda la página + GSAP): el próximo paso sería montar
  las escenas de abajo del hero cuando el navegador queda libre.
