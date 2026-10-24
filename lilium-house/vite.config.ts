import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  build: isSsrBuild
    ? // build de servidor, solo para prerenderizar la portada (scripts/prerender.mjs): una entrada, sin páginas HTML
      { target: 'node20', emptyOutDir: true }
    : {
        target: 'es2020',
        // three.js (~240 kB gzip) vive en el chunk lazy del lienzo 3D; no bloquea el primer render
        chunkSizeWarningLimit: 1000,
        // index.html: la mesa giratoria (src/nuevo); anterior.html: "Un día en Lilium" archivado (src/main.tsx);
        // nuevo.html redirige a la portada para los enlaces que circularon del prototipo
        rollupOptions: { input: { main: 'index.html', anterior: 'anterior.html', nuevo: 'nuevo.html' } },
      },
}))
