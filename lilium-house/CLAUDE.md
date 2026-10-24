# Lilium Coffee Lounge — instrucciones para Claude Code

## Objetivo
Mejorar la landing existente de Lilium Coffee Lounge, cafetería de Puerto Iguazú. El diseño actual se siente genérico: no rehagas todo a ciegas; auditá, proponé una dirección visual y trabajá por etapas con aprobación.

## Proyecto
- Producción: https://lilium-house.vercel.app
- GitHub: https://github.com/hardknoxxx/Web-Design-
- Carpeta/proyecto Vercel: `lilium-house/` / `hardknoxxx/lilium-house`
- Stack existente: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, GSAP/ScrollTrigger, Lenis y Three.js. Reutilizá lo que sirva; no agregues dependencias sin justificarlo.
- Figma storyboard: `8a62hs9qgXqNI8zOzefJmC`

## Dirección creativa
Crear una experiencia original, botánica, artesanal y premium, con personalidad, composición asimétrica, jerarquía tipográfica fuerte, ilustraciones propias y transiciones conectadas. Evitar aspecto de plantilla, tarjetas repetidas, decoración sin propósito y animaciones gratuitas.

Referencias para estudiar principios, no copiar literalmente:
- Agrumea Farm — experiencia inmersiva y animación 3D vinculada al scroll: https://www.agrumeafarm.it/en
- Madie — navegación overlay y carácter editorial: https://onepagelove.com/madie
- TAB Kitchen & Bakery — ilustración plana, elementos botánicos y menú con personalidad: https://onepagelove.com/tab-kitchen-bakery

Concepto vigente: **“La mesa giratoria”**. Mantener la narrativa de scroll y secciones existentes relevantes: mesa/platos interactivos, carta, visita/mapa, friso botánico y fauna/flora (`vida/`). “Un día en Lilium” es una idea archivada; no sustituir el concepto vigente sin proponerlo primero.

Paleta de marca: `#64BCB0`, `#277067`, `#1C4A45`, `#3D2314`, `#FAF7F2`, `#415521`, `#6F7F2E`, `#97AD3D`.
Fuentes existentes: Bricolage Grotesque, Caveat, Courier Prime, Raleway y Yellowtail. Respetar el branding y los SVG/recursos originales.

## Skills y herramientas
Primero inspeccioná las skills disponibles y leé sus instrucciones reales; no inventes comandos ni las invoques mecánicamente.
- Taste Skill: art direction, jerarquía, tipografía y evitar resultados genéricos.
- Impeccable: crítica visual, consistencia, pulido y eliminación de ruido.
- Emil Design Engineering: curvas, duración y comportamiento de animaciones.
- UI UX Pro Max: apoyo para patrones y decisiones de interfaz.
- Playwright MCP: pruebas visuales, responsive e interacciones.
- Figma MCP: consultar el storyboard existente cuando sea útil.

## Datos del negocio
- Dirección: Av. Tres Fronteras 467/489, Puerto Iguazú, Misiones.
- Instagram: @lilium.coffee
- WhatsApp: +54 3757 31-7284 (`https://wa.me/543757317284`)
- Teléfono: +54 3757 45-7085
- Horarios: martes a sábado 08:00–21:00; domingo 08:00–12:00 y 17:00–21:00; lunes cerrado.
No inventar platos, precios, fotografías ni datos. Marcar como pendientes los datos que deban confirmar los dueños. Reemplazar fotos de Instagram de baja resolución por imágenes originales aprobadas cuando estén disponibles.

## Proceso obligatorio
### Fase 1 — Auditoría, sin modificar archivos
Inspeccioná repo, estructura, dependencias, scripts, hooks, binarios y configuración; revisá la landing en navegador y las referencias. No instales ni ejecutes herramientas desconocidas sin inspeccionar qué hacen. Entregá un diagnóstico priorizado de problemas visuales, UX, código, rendimiento y riesgos. **Esperá mi aprobación antes de editar.**

### Fase 2 — Dirección visual
Presentá dos propuestas creativas claramente distintas, con narrativa, hero, composición, tipografía, color, interacciones y trade-offs. Recomendá una y explicá por qué. No copies las referencias.

### Fase 3 — Implementación incremental
Tras aprobación, definí tokens y storyboard; implementá por secciones pequeñas. Después de cada sección, abrí la web con Playwright, capturá screenshots, criticá el resultado y corregí antes de avanzar. No des por terminado el trabajo porque compile: evaluá la calidad visual real.

### Fase 4 — QA
Probar viewport móvil `390×844` y escritorio `1440×900`, navegación, menú, enlaces de WhatsApp/teléfono/mapa, estados de carga, errores de consola y comportamiento responsive. Usá `window.scrollTo({top:y, behavior:'instant'})` para mediciones de scroll fiables cuando Lenis/smooth scroll interfiera.

Revisá:
- Rendimiento, carga inicial y fluidez; medir con Playwright/Lighthouse cuando sea posible.
- Carga diferida de escenas Three.js/animaciones pesadas fuera del hero.
- Limpieza de listeners, timelines y recursos al desmontar componentes.
- Accesibilidad: teclado, foco, contraste, textos alternativos, `prefers-reduced-motion`.
- Imágenes optimizadas y formatos modernos; evitar saltos de layout.
- Metas orientativas de Core Web Vitals: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1. Informar mediciones reales por separado de objetivos.
- Rendimiento en móvil real si es posible; no afirmar que se probó si no se hizo.

## Seguridad, Git y despliegue
- Antes de instalar/ejecutar skills, MCP, scripts o binarios, inspeccioná su contenido, origen y efectos.
- No exponer secretos ni sobrescribir datos del usuario.
- No publicar cambios sin revisión explícita.
- Por cada entrega aprobada: cambios pequeños, tests, commit, push, PR, merge a `main` y despliegue de producción con `vercel deploy --prod --yes` desde la raíz correcta. Si no se puede completar un paso, informar cuál y por qué.
- No hacer despliegues de producción con cambios no revisados.

## Criterio de éxito
El resultado debe sentirse diseñado específicamente para Lilium, con una narrativa clara y detalles visuales memorables; funcionar de verdad en móvil y escritorio; ser rápido, accesible y mantenible. Priorizar calidad observable y coherencia por encima de cantidad de código o animaciones.

**Empezá únicamente por la Fase 1. No modifiques archivos hasta entregar el diagnóstico y recibir mi aprobación.**