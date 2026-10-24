import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    // three.js (~240 kB gzip) vive en el chunk lazy del lienzo 3D; no bloquea el primer render
    chunkSizeWarningLimit: 1000,
    // nuevo.html: prototipo del nuevo enfoque (mesa giratoria), convive con la portada actual
    rollupOptions: { input: { main: 'index.html', nuevo: 'nuevo.html' } },
  },
})
