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

