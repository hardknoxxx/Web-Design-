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

## 18. Marca, mesa infinita y fauna viva en three.js (con emil-design-eng)

- Header con el logo de la marca (disco menta `#64BCB0` con el lirio blanco + "Lilium" en Yellowtail + "Coffee
  Lounge"); en el teléfono solo logo y "Cómo llegar", y el estado (Abierto hasta 21:00) baja bajo la bajada.
- La mesa vuelve a ser infinita (pedido del cliente, como Agrumea): una vuelta por scroll y giro sin tope.
- Sin flora en la mesa; la flora y la fauna viven en la carta, la visita y el friso (`src/nuevo/vida/`).
- El friso del cierre ya no repite dirección y horario.
- CSS propio en `@layer components` (antes pisaba utilidades como `max-md:hidden`; además el punto del estado
  quedaba siempre verde por un selector roto: corregido).
- Curvas de emil-design-eng (`--ease-out`, `--ease-in-out`), `:active` en todo lo presionable, hover solo con mouse.
- Rendimiento (Playwright, 390×844, GL por software): scroll 58 fps; con CPU 4× más lenta, 52 fps.

## 19. Auditoría (Fase 1 de CLAUDE.md) y etapa 1: base técnica

- `CLAUDE.md` movido a la raíz del repo. UI UX Pro Max instalado tras auditarlo. Figma MCP: falta autorizar (`/mcp`).
- Portada prerenderizada en el build (HTML real antes de JS; se ve completa sin JavaScript) e hidratada en el navegador.
- La portada ya no carga Framer Motion (Cup/CakeStand pasaron a `components/BotanicaAnimada.tsx`) ni el CSS del
  sitio archivado (`src/nuevo/base.css` propio, Tailwind limitado a sus archivos): CSS 75 kB → 25 kB sin comprimir.
- Yellowtail auto-alojado (Apache 2.0, licencia en `public/fonts/licencias`); sin Google Fonts en la portada.
- Horario único (`HORARIO` en `site.ts`) para el estado, la tabla y el JSON-LD generado.
- Medición local (Playwright, 390×844, 4G lento + CPU 4×): primer contenido 1,75 s → 0,83 s. Capturas idénticas.

## 20. Dirección "Vitrina" (propuesta A, referencia LATTE)

- Cliente: prototipo para presentar al negocio; usar las 3 fotos del sitio oficial (autorizado); horario y teléfono
  se confirman más adelante (fuentes públicas no coinciden: Visit Iguazú y Tripadvisor).
- Logo oficial vectorizado a SVG (calco propio con Python: umbral, contornos, curvas) + "COFFEE LOUNGE" en Raleway Bold.
- Bricolage Grotesque reemplazada por la variable completa (ancho 75–100, peso 200–800) para los títulos condensados.
- Nuevo: cabecera fija y menú overlay; hero con título condensado, sticker y cinta; sección "Elegí tu favorito" con
  las fotos reales; carta, visita y botones con el mismo sistema. Primer contenido local 0,87 s (4G lento + CPU 4×).

## 21. 3D con three.js y coreografía GSAP

- Pedido: portada más limpia en el teléfono, nada de flora/fauna flotando sin contexto, platos 3D que giren sobre su
  eje como en Agrumea, animaciones GSAP en textos, secciones, menú y transiciones.
- Hero: platos 3D procedurales (`src/nuevo/tres/`) sentados en el borde de la mesa, giran en reposo, al viajar y al
  tocarlos; los de los costados quedan "sin pintar" (mantel para colorear). Los platos DOM quedan como respaldo sin WebGL.
- Teléfono: la portada muestra solo título, mesa y nombre del plato (sin estado, cinta ni bajada).
- Se quitaron lirios, picaflor, helecho, mariposa y animales sueltos de carta, visita y friso. En su lugar, al pie, un
  "rincón verde" 3D con contexto: mostrador de madera con monstera, florero de lirios, helecho, lápices y café; un
  picaflor va de flor en flor y una mariposa rodea la monstera. Carga diferida y shaders precompilados.
- GSAP (ScrollTrigger, SplitText, DrawSVG): mandala que se dibuja, títulos por líneas, fotos que se reparten, mapa
  que se abre, horario renglón por renglón, menú con secciones que suben. Con movimiento reducido no se anima nada.
- Referencias revisadas (React Bits, Motion Primitives, Godly, Refero, GSAP, Spline, etc.): se tomó lo alineado a la
  marca (GSAP, criterios editoriales); se descartó lo de estética SaaS/tech y Spline por peso.
- Medición local 390×844 (4G lento + CPU 4×): primer contenido 0,83 s, CLS 0,03, sin errores. Los cuadros por
  segundo medidos usan WebGL por software (sin GPU) y no representan un teléfono real.

## 22. Platos que se giran a mano, mazo de fotos y matorral

- Pedido: platos quietos que se giran con el cursor/dedo, con inercia al soltar y desenfoque al ir rápido (como el
  video de Agrumea); modelos más fieles; carta siempre a color; fotos reales como cartas que se dan vuelta o se
  cambian (Madie); animaciones de Motion Primitives; cierre ilustrado (no 3D) con animales, sin nada flotando.
- `motion` instalado (reemplaza a `framer-motion`, misma versión 14.6; imports migrados a `motion/react`).
  `npx motion-ai` es interactivo (pide terminal): se auditó y se copió a mano su skill a `.claude/skills/motion`
  (ver SOURCE.md); los servidores MCP remotos de Motion no se configuraron. Tailwind y su plugin ya estaban.
- Platos 3D rehechos (`tres/objetos.ts`): porciones con cortes que muestran capas (bizcocho húmedo, frambuesa,
  ganache; cheesecake con base de galletita y coulis), tostado de miga con jamón, queso y marcas de plancha, chipa
  con costra, ensalada con hojas, tomates cortados y huevo, tetera y taza esmaltadas. Texturas pintadas con ruido,
  relieve, entorno de estudio (RoomEnvironment) y sombras. Se cargan de a uno, del frente hacia los costados.
- Interacción (`MesaGiratoria.tsx`): sin giro constante; arrastrar un plato lo gira, al soltar sigue con la
  inercia del gesto unos segundos; se ladea al girar rápido. Desenfoque de movimiento real en `mesa3d.ts`: varias
  muestras por cuadro entre la pose anterior y la actual, solo mientras algo se mueve rápido.
- Carta: las láminas siempre a color; la pestaña elegida tiene un fondo que viaja (FondoAnimado).
- Vitrina: mazo de fotos impresas: arrastrar pasa la de arriba al fondo, tocar la da vuelta (dorso con la
  descripción); con mouse se inclina (Tilt); "Hoy en la vitrina: tortas / budines / tentaciones" (TextLoop).
  Adaptados de Motion Primitives (MIT): Tilt, TextLoop, AnimatedBackground (`src/nuevo/primitivas/`).
- Menú: con mouse, una banda se desliza detrás de la sección señalada.
- Cierre (`Matorral.tsx`): árbol con tucán en la rama y nido de hornero, picaflor libando del lirio, mariposa
  "88" en la monstera, coatí que camina por el suelo; plantas que nacen del suelo y se mecen. Solo CSS, se pausa
  fuera de pantalla y queda quieto con movimiento reducido. Se quitó el rincón 3D.
- Medición local 390×844 (4G lento + CPU 4×): primer contenido 0,94 s, CLS 0,006, sin errores. El 3D en este
  entorno corre por software (sin GPU): la fluidez debe probarse en un teléfono real.

## 23. Giro directo, velocidad al cambiar de plato y pulido final

- Platos: el giro sobre su eje sigue al dedo/cursor y se queda donde se suelta (sin inercia ni desenfoque).
  La inercia (~1,5 s) y el desenfoque son solo del cambio de plato; además los platos se ladean hacia donde
  viaja la mesa. Cada plato está en su propia profundidad (z) para que nunca se atraviesen.
- Mazo de fotos más rápido (salida 0,18 s, resortes más firmes, umbral de arrastre más corto).
- /impeccable polish: mesa más arriba y platos más grandes en el teléfono (menos vacío bajo el título);
  sticker de la portada oculto por debajo de 1100 px (pisaba el título en tablet); el botón flotante
  "Cómo llegar" se esconde cuando taparía controles (flechas del mazo, pestañas y botones de la carta);
  dorso de la foto sin renglones desalineados y con texto de contraste AA.

## 24. La mesa como Agrumea, decodificada (sin 3D en vivo)

- Análisis del video y de agrumeafarm.it (Playwright): Nuxt + GSAP + Lenis. Cada frasco es una imagen
  (`jar-slider__base`) con un `canvas` 2D que redibuja la etiqueta para simular el giro; cada uno se mueve con
  `transform` (arco, inclinación ±15–20°, escala 0,6–1,3 por profundidad) y `filter: brightness() blur()` por
  profundidad; la rueda tiene inercia de varios segundos.
- Nuestra versión anterior dibujaba 3D en vivo (sombras, materiales físicos, varias pasadas por cuadro): se
  trababa en teléfonos. Ahora, igual que Agrumea, sin WebGL: `scripts/sprites/render.ts` fotografía cada plato
  3D (los modelos pasaron a `scripts/sprites/objetos.ts`) girando en 36 cuadros con cámara y luz fijas, y
  `build-sheets.py` arma hojas WebP de 6 × 6 en dos tamaños (`public/platos/*-giro-{m,d}.webp`) y la foto
  quieta de cada plato (`*-{m,d}.webp`, la que trae el HTML). La página solo mueve transform, filter y el cuadro.
  Para regenerar: `npx vite --port 5199` y `node scripts/sprites/render.cjs http://localhost:5199 <salida>`,
  después `python3 scripts/sprites/build-sheets.py <salida> public/platos`.
- Interacción: al soltar la mesa sigue con la velocidad del dedo y frena en ~2,5 s; el desenfoque crece con la
  velocidad (hasta ~10 px) y los platos se ladean hacia donde viajan; los de los costados quedan apenas
  desenfocados y más oscuros (profundidad). Arrastrar el plato del frente lo gira sobre su eje (sin inercia).
  En el teléfono solo se bajan las hojas de los platos cercanos al frente y se sueltan las lejanas.
- Lenis (ya estaba en el proyecto) para la rueda y el trackpad en computadora; el menú lo pausa.
- Carta: pestañas con imán (Magnetic), toque con resorte, íconos dibujados que se animan (sol que asoma, sol
  que gira, taza con vapor), frase que entra palabra por palabra (TextEffect) y platos en cascada con
  desenfoque (AnimatedGroup). Adaptados de Motion Primitives (MIT).
- Medición local 390×844 (4G lento + CPU 4×): primer contenido 0,89 s, LCP 1,4 s, CLS 0,03; scroll y reposo
  a 60 cuadros por segundo sin tareas largas.

## 25. Mismos efectos en PC que en el teléfono

- Causa: muchas PC con Windows tienen las animaciones del sistema apagadas y el navegador lo informa como
  `prefers-reduced-motion: reduce`. El sitio respetaba esa preferencia y apagaba la inercia y el desenfoque de
  la mesa, el scroll suave (Lenis), las animaciones del matorral, la cinta y las entradas con GSAP.
- Decisión del cliente: el sitio se ve igual en todos los equipos. Quedó centralizado en `animar.ts`
  (`reducido()` y `MOTION_REDUCIDO`), con la indicación de cómo volver a respetar la preferencia.
- No se registraron todos los plugins de GSAP de la lista enviada: la mesa ya resuelve la inercia y el
  desenfoque sin ellos; sumar plugins que no se usan (GSDevTools, MotionPathHelper, Pixi, Easel…) solo agrega
  peso, y `@gsap/react` no es necesario porque las animaciones ya se limpian con `gsap.context`.

## 26. anime.js instalado

- Pedido: instalar el contenido de `juliangarnier/anime`. Se revisó el repositorio antes (MIT, versión 4.5.0, sin
  dependencias ni scripts de instalación; three.js como dependencia opcional, que el proyecto ya tiene) y se
  instaló el paquete publicado de ese repositorio, `animejs@4.5.0` (versión fija), en lugar de copiar el código.
- Todavía no se usa en ninguna sección: no suma peso a la página hasta que se importe. Candidatos naturales:
  su `createDraggable` o `createTimeline` para algún gesto puntual, o `svg.createDrawable`/`morphTo` para el
  matorral; GSAP sigue siendo el motor principal, para no tener dos motores animando lo mismo.

## 27. Más experiencia, misma base (referencias LATTE, neutomni, nickho)

- Análisis: videos de LATTE (títulos que se rellenan, cintas cruzadas, stickers, fondos ondulados, tarjetas de
  colores, sello "5.0"), neutomni (morph del logo con MorphSVG, paneles que suben en escalera, texto en círculo
  que gira, tarjetas repartidas, reloj local en el pie) y nickho (manifiesto con palabras que se iluminan,
  palabras gigantes de fondo, lista con foto que sigue al cursor). Las tres usan GSAP + Lenis + SplitText.
- Criterio (taste-skill + emil-design-eng): cada efecto sale de algo propio de Lilium y tiene propósito; curvas
  ease-out fuertes, transform/opacity/clip-path, sin adornos sueltos.
- Sumado:
  - **Pintá el mantel:** tocar un pétalo del mandala de la mesa lo colorea con un lápiz de la marca (trazo
    rayado con máscara SVG); cada toque pasa al color siguiente y el mantel se recuerda (localStorage).
  - **Pista del cursor** sobre la mesa (solo con mouse): "Girá", "Traer", "Pintá", "Arrastrá".
  - **La portada se achica:** la vitrina sube por encima y la portada se vuelve una tarjeta redondeada sobre
    fondo menta, oscureciéndose.
  - **Morph:** la mancha detrás del mazo cambia de forma y color con cada foto (MorphSVGPlugin de GSAP).
  - **Manifiesto:** frase real del local con figuritas (hoja, lirio, lápiz); las palabras se encienden con el
    scroll. Al lado, sello "4,5 ★ en Google · 45 opiniones" que gira y acelera con el scroll.
  - **Reloj en vivo** en el pie: la hora de Puerto Iguazú y si el local está abierto.
- Medición local 390×844 (4G lento + CPU 4×): primer contenido 1,07 s, LCP 1,44 s, CLS 0,02; scroll a 51
  cuadros por segundo de promedio (antes 59) con 0,9 % de cuadros lentos y 21 ms de bloqueo total.

## 28. Fotos de estudio, papeles, henrietta, mapa animado y follaje

- **Fotos de la carta:** los 7 platos que no tenían foto propia (café, chipa, té, tostado, ensalada, cheesecake, torta
  de chocolate) llevan una foto de estudio generada con IA (Gemini 3.1 Flash Image, vía el conector de Figma, archivo
  "Lilium · fotos de platos (IA, prototipo)"), pedida sobre un fondo liso del color de la mancha. Son ILUSTRATIVAS
  para presentar el prototipo: reemplazarlas por fotos reales del local antes de publicar el sitio definitivo.
  No se generaron imágenes de los 6 platos que ya tienen foto real (Instagram del local): mantienen su foto, ahora
  recortada sobre una mancha de color. Todas las láminas: forma ondulada (máscara), sombra de estudio.
- **Papeles:** cartel de papel real (textura de hoja arrugada generada con IA) que llega hecho un bollo y se abre;
  estampillas con borde dentado ("Hecho en casa" en el mazo, "Puerto Iguazú" sobre el mapa) que caen y se sellan;
  hoja del mantel para colorear con el lirio y dos lápices, que se pinta con el scroll.
- **Henrietta** (henrietta.wearetattoodigital.com: GSAP + Lenis): palabra gigante del momento elegido detrás de la
  lista, con las letras subiendo; "Visitanos" entra desde la derecha como una puerta corrediza con franjas de
  colores que la cruzan.
- **Mapa** con anime.js (se carga recién al verse): las calles se dibujan, un punto recorre Av. Tres Fronteras hasta
  la puerta, el lirio cae con rebote y deja ondas.
- **Enlaces animados** adaptados de Skiper UI (skiper40, uso libre con atribución en el código): dirección,
  WhatsApp e Instagram en Visitanos. No se usó `npx shadcn add` (configuraría shadcn/Next.js, que el proyecto no usa).
- **Matorral:** la copa del árbol y los arbustos pasaron de círculos a follaje dibujado hoja por hoja.
- Medición local 390×844 (4G lento + CPU 4×): primer contenido 0,99 s, LCP 1,46 s, CLS 0,02, scroll 58,8 cuadros/s.

## 29. Carta tono sobre tono, mancha de café, cuaderno de campo y traspaso

- **Carta:** las 7 fotos IA se regeneraron con el fondo del color del plato en otro tono (torta de chocolate sobre
  marrón claro, cheesecake sobre rosa, chipa sobre amarillo manteca…); las 6 fotos reales también llevan su mancha
  tono sobre tono.
- **"Te esperamos":** en vez de la puerta corrediza con franjas, la sección se derrama como una mancha de café que
  nace junto al mapa y crece con el scroll; el título cae letra por letra.
- **Cierre:** el matorral SVG se reemplazó por un cuaderno de campo con bocetos a lápiz y acuarela (tucán agarrado a
  su rama, hornero sobre su horno de barro, coatí caminando), sin bordes visibles, con notas a mano y una mariposa 88.
  Criterio: taste-skill (lámina de naturalista como motivo). El lirio con picaflor quedó pendiente (sin créditos de IA).
- Hoja para pintar junto a las pestañas en el teléfono; sin franja lima vacía bajo el sello.
- Traspaso completo para otra sesión en `contexto/HANDOFF.md`; scripts de QA en `scripts/qa/`.

## 30. Croissant de LATTE, fotos reales del Instagram y fuera la hoja con lápices

- Pedido: sacar (o rehacer) el dibujo de papel y lápices junto a las pestañas de la carta; sumar fotos reales del
  Instagram a las tarjetas; el croissant como en LATTE. El cliente mandó un zip con 8 fotos y dos videos de LATTE.
- LATTE (videos): croissant recortado enorme sobre una mancha ondulada, que gira y crece con el scroll, con una cinta
  "recién horneado" que lo cruza. Versión Lilium: el croissant real del local, mancha durazno, cinta lima detrás.
- Fotos reales recortadas con rembg (BiRefNet) y apoyadas tono sobre tono, igual que las de estudio: la carta suma
  croissant con huevos, sándwiches, cheesecake de maracuyá, croissant con frutillas y brownies; Oreo y budín pasan
  a buena resolución. El mazo de la vitrina pasa de 3 a 9 fotos.
- Medición local 390×844 (4G lento + CPU 4×), dos corridas por versión: scroll 46–53 cuadros/s contra 48–51 de la
  rama anterior (dentro del ruido); FCP 1,07 s, LCP 1,43 s, CLS 0,02.

## 31. Fotos reales mejoradas con IA, skill Apple HIG y pulido

- Pedido: mejorar con IA las fotos reales; generar con IA las imágenes de la carta con los nombres ya aprobados; usar
  taste-skill, emil-design-eng y una skill de diseño Apple buscada en GitHub.
- Mejora: Real-ESRGAN x4plus (ONNX oficial de Qualcomm AI Hub, BSD-3) por mosaicos sobre las 8 fotos del Instagram y
  las 3 del sitio oficial, más un retoque suave de luz y color; salidas rearmadas con `scripts/fotos_reales.py`.
- Imágenes IA de la carta: generadas el 27/10 al renovarse los créditos de Figma (11 platos con los nombres aprobados,
  mismo estilo que las anteriores). La carta queda toda en fotos de estudio IA; las reales, en el mazo y el croissant.
- Medición local 390×844 (4G lento + CPU 4×): FCP 1,00 s, LCP 1,41 s, CLS 0,02, scroll 56 cuadros/s.
- Skill `apple-hig-designer` (axiaoge2/Apple-Hig-Designer, MIT) auditada e instalada; se eligió por ser para web
  (las otras candidatas eran para SwiftUI o traían CLI y binarios).
- Pulido: enlaces de Visitanos con zona táctil de 44 px; `aria-label` prohibidos fuera (TextEffect y manifiesto).
