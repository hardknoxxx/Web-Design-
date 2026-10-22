# Lilium House & Coffee — Landing page

Landing page de **Lilium House & Coffee** (Coffee Lounge + Bed & Breakfast), Av. Tres Fronteras 467/489, Puerto Iguazú, Misiones.

Stack: React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · React Three Fiber (three.js).

```bash
npm install
npm run dev      # desarrollo
npm run build    # typecheck + build de producción en dist/
npm run preview  # servir el build
```

## Estructura

| Archivo | Qué contiene |
| --- | --- |
| `src/data/site.ts` | Datos del negocio: dirección, teléfono, WhatsApp, horarios, reservas online, calificación de Google y los departamentos |
| `src/components/three/Lily.tsx` | Lirio 3D procedural (pétalos, estambres, polen); responde a cursor/toque, arrastre y scroll |
| `src/components/three/LilyCanvas.tsx` | Canvas R3F, carga diferida, pausa fuera de pantalla, modo bajo consumo en móviles |
| `src/components/MandalaColoring.tsx` | Mandala SVG para colorear (simetría, "Inspirame", descarga PNG) |
| `src/hooks/useOpenStatus.ts` | Indicador "Abierto ahora / Cerrado" en hora de Argentina |

## Para completar antes de publicar

- **WhatsApp**: `SITE.whatsapp` usa `543757457085` (línea fija según Google Maps). Si el WhatsApp del local es un celular, cambiar a `5493757457085`.
- **Departamentos**: nombres, capacidades y comodidades de `APARTMENTS` son de ejemplo; reemplazar por las unidades reales.
- **Fotos**: la página usa ilustraciones propias. Si se agregan fotos del local, deben ser propias o con permiso.

## Rendimiento móvil

- three.js va en un chunk lazy: texto y CTAs pintan antes de descargar el 3D.
- El render loop se detiene cuando el hero sale de pantalla (IntersectionObserver).
- En dispositivos de bajo consumo: DPR ≤ 1.5, sin antialias, menos segmentos y partículas.
- Scroll y puntero se leen en refs (sin re-renders de React); el lienzo usa `touch-action: pan-y` para no bloquear el scroll vertical.
- Framer Motion con `LazyMotion` + `domAnimation`; respeta `prefers-reduced-motion`.
