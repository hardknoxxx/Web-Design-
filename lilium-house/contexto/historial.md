# Historial de pedidos y cambios

Orden cronológico de lo que pidió el cliente y qué se hizo. PRs en `hardknoxxx/Web-Design-`.

## 1. Primera versión (rama original → `main` inicial)

- Landing con React, Tailwind, Framer Motion y R3F; lirio 3D en el hero que reacciona a cursor/toque/scroll.
- Datos del local desde Google Maps; botón de WhatsApp; optimización móvil.

## 2. Rediseño "Un día en Lilium" (PR #2)

- Fuera alojamientos: solo cafetería. Sin CTAs genéricos en el hero; WhatsApp no genérico.
- Animaciones de scroll que abren/cierran/mueven cosas; enredaderas que trepan (asimétricas).
- Storyboard de scroll en Figma. Tipografías y paletas buscadas en GitHub y auditadas antes de usarlas.
- GSAP, cortina de hojas asimétrica, más vida de fondo, platos de la carta, menú-hoja de un solo elemento.
- Datos de Instagram (WhatsApp, horario real), paleta menta del logo, carta con desayunos/almuerzos/
  meriendas y fotos del perfil.
- Plantas con volumen (nervaduras recortadas, tallos que nacen del suelo), entrada a la selva en el
  hero, picaflor redibujado en un ceibo, hornero con nido, coatí.

## 3. PR #3

- Selva asimétrica con sotobosque; menú con forma de hoja; taza sobre la mesa.
- Comanda que se desenvuelve como bola de papel (clip-path en CSS, stop-motion).
- Base de ramas cruzadas → después tabla de madera diagonal; globo de mensaje animado.
- Rendimiento: pausa de bucles fuera de pantalla, capas compuestas, lirio a 30 fps en teléfonos.
- Terminaciones premium (logo como el real, contraste, barra de scroll y cursor con la paleta).
- Fondo único del día (transiciones encadenadas, sin cortes), hoja que se abre por la nervadura.
- Arreglos: lianas sin destello al cargar, carta de altura fija (la hora no salta), selva sin franjas,
  fuente del cierre Playfair, luciérnagas que vagan, lirio ilustrado (probado) en lugar del 3D.

## 4. PR #4

- Lirio 3D de vuelta, optimizado (Lambert, sin luz puntual, tallo completo, zoom suave).
- Papel en stop-motion real (10 cuadros); platos que entran girando al cambiar de pestaña.
- Madera que cubre toda la esquina; hojas en cada transición; bruma que aparece con la escena fija.
- Datos del cierre en Raleway.

## 5. PR #5

- Menú que brota enrollado y se desenrolla (solo transform: sin trabas).
- Papel que nace en la boca de la taza; tronco de árbol irregular; globo dibujado a lápiz.
- "Lilium" se desvanece en un tramo largo; las plantas se abren hacia los costados.

## 6. PR #6 — Remotion

- Proyecto `animaciones/` con `HojaMenu` (20 cuadros) y `PapelComanda` (12 cuadros), replicando los
  videos de referencia del cliente (planta que se desenrolla, papel que se desenvuelve).
- Exportados como sprites WebP y reproducidos en los dos menús.

## 7. PR #7

- Opciones del menú-hoja que se abren como hojas de una planta en cámara rápida (CSS, rebote elástico,
  cascada de 50 ms), según especificación técnica del cliente.

## 8. Herramientas

- Playwright MCP instalado a nivel proyecto (auditado). Puppeteer MCP descartado (paquete deprecado).
- Contexto de la conversación exportado a esta carpeta.

## 9. PR #9 — Rendimiento móvil y animaciones de scroll premium

- Medición con Playwright (390×844, CPU 4x + 4G lento): scroll a 60 fps, pero el lirio tardaba 6,6 s en verse,
  el primer toque al menú trababa 383 ms (sprite de 34 MB decodificado) y la carga bloqueaba ~1 s.
- Arreglos: three.js baja antes y un boceto ilustrado ocupa su lugar; sprites al tamaño real, decodificados de
  antemano y después del lirio; enredaderas montadas en tiempo libre. Lirio ~3 s antes, menú sin trabas.
- Lenis 1.3.26 (auditada) para rueda/trackpad, atado al reloj de GSAP; nativo en táctiles.
- Apariciones fade-up (`Reveal*`, títulos palabra por palabra) y paralaje sutil en lo decorativo.

## 10. PR #10 — Taza, comanda y menú-hoja más orgánicos

- Cucharita sobre el plato, al lado de la taza (antes sobre el tronco).
- Al tocar la taza cada pieza reacciona por separado: taza (salto + bamboleo), plato (asentamiento con otro
  retardo y curva) y cucharita (tintineo).
- La comanda sale de la boca de la taza (escala 0), sube en arco y se desenvuelve en el centro de la
  pantalla; al cerrar vuelve a caer en la taza. Película `PapelComanda` re-renderizada con la bolita centrada.
- Menú-hoja en CSS: revelado circular desde la esquina del botón, escala + giro con rebote
  `cubic-bezier(0.34, 1.56, 0.64, 1)`. Se quitó la película `HojaMenu` (186 KB menos).

## 11. PR #11 — Lirio 3D liviano en three.js puro

- Pedido: flor 3D sencilla y fluida en celulares y computadoras; arrastrar para girar, toque rápido con
  animación elástica, `Math.min(devicePixelRatio, 2)`, IntersectionObserver y limpieza de memoria.
- Se reescribió sin React Three Fiber (−11 paquetes, chunk del lirio 245 → 142 KB gzip): 4 llamadas de dibujo
  y ~1.000 triángulos (antes 27 y ~4.300), misma flor y encuadre.
- Gobernador de resolución (2 → 1,5 → 1,25 → 1 si la página baja de ~50 fps) y 30 fps en reposo en equipos de
  bajo consumo. Verificado: 25 montajes/desmontajes sin buffers, programas, listeners ni canvas sueltos.

## 12. PR #12 — Lirio 3D a demanda y nítido

- Pedido: la flor se veía borrosa (el gobernador bajaba la resolución) y el scroll seguía con tirones.
- Render a demanda (0 cuadros en reposo), antialias + `high-performance` + `Math.min(dpr, 2)` en reposo, luz
  ambiente + una direccional sin sombras, nada corre fuera de pantalla (ni listeners).
- Resolución dinámica: 1x solo mientras el dedo o la rueda se mueven, 2x al soltar. Scroll del hero medido bien
  (CPU 4x): sin flor 48 fps · producción anterior 27 · pedido estricto 17 · con resolución dinámica 29.
- Arreglo: si el chunk del lirio fallaba o no había WebGL, la página entera quedaba en blanco.


## 13. PR #13–14 — Impeccable

- Instalado sin hooks a nivel proyecto (ver README de contexto).
- `/impeccable init`: `lilium-house/PRODUCT.md` con público (turistas y vecinos por igual), objetivo (que vaya
  al local) e idiomas como decisión abierta.

## 14. PR #16 — Correcciones de la crítica (con emil-design-eng)

- Skill `emil-design-eng` (Emil Kowalski) instalado en `.claude/skills/`, auditado (solo Markdown, MIT, commit fijado).
- Cartel de madera con dos caras: hora del recorrido mientras se scrollea; con la página quieta, estado real
  ("Abierto · hasta 21:00"). Al tocarlo, panel con estado, horario, dirección, "Cómo llegar" y "Llamar".
- Puntaje de Google: cuenta una vez por tiempo al entrar en pantalla (antes, frenando a mitad, quedaba en 0,2–2,3).


## 15. Nuevo enfoque — prototipo "La mesa giratoria" (`/nuevo.html`)

- Referencias elegidas por el cliente: Madie (madie.es: productos recortados como carta, color de marca fuerte,
  mapa con horario), TAB Kitchen & Bakery (ilustración plana, friso botánico) y Agrumea Farm (agrumeafarm.it:
  carrusel de frascos que giran con el scroll sobre un disco con texto circular).
- Prototipo aparte en `nuevo.html` (no indexado), sin tocar la portada: la mesa verde gira con el scroll, el
  arrastre o las flechas; los platos esperan sin pintar (solo trazo, como el mantel para colorear) y se colorean
  al pasar al frente. El texto circular de la mesa lleva el estado real del local.
- Motor: rAF a demanda que escribe transform/opacity (sin re-render por cuadro); arrastre con `touch-action: pan-y`.

## 16. Crítica del prototipo + carta, visita y friso (`/nuevo.html`)

- `/impeccable critique` (dos evaluadores aislados): 21/32. Problemas: el arrastre desincronizaba la hora del
  scroll, horario lejos en el teléfono, texto de la mesa ilegible con datos, sin pista de uso, WhatsApp sin contraste.
- Mesa: sin vuelta infinita (el scroll siempre es la hora), lo arrastrado vuelve solo al seguir scrolleando,
  tocar un plato lo trae al frente y lo hace girar con rebote, flechas y ←/→ con aviso para lector de pantalla,
  pista "Tocá un plato o deslizá la mesa", color que se abre desde el centro (como con lápiz), 300/340svh.
- Reutilizado del sitio anterior: lirios (`src/nuevo/Lirio.tsx`, misma flor del boceto), monstera, picaflor,
  hornero, coatí, tucán, mariposa, helechos, banano y pindó.
- Nuevas secciones: carta en láminas con pestañas por momento (dibujos y fotos se pintan al entrar), visita con
  croquis propio de Av. Tres Fronteras (no a escala), horario con "hoy", y friso botánico al pie.
- "Cómo llegar" flotante cuando la mesa queda atrás. Scroll a 60 fps con CPU 4× más lenta (390×844).

## 17. La mesa giratoria pasa a ser la portada; mapa con calles reales

- `index.html` carga `src/nuevo/main.tsx`. La versión "Un día en Lilium" queda archivada en `/anterior.html`
  (noindex, `src/main.tsx`). `/nuevo.html` redirige a `/`.
- Mapa de la visita redibujado con calles reales de OpenStreetMap (Overpass, geocodificado el 489 con Nominatim):
  `src/nuevo/croquisDatos.ts` con río Iguazú, Costanera, Av. Tres Fronteras, Entre Ríos, Urquiza y Corrientes.
  El local queda casi esquina Entre Ríos, a unos 200 m de la Costanera. Crédito OSM (ODbL) en el pie del mapa.
