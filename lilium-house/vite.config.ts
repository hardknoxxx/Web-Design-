import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    // three.js (~240 kB gzip) vive en el chunk lazy del lienzo 3D; no bloquea el primer render
    chunkSizeWarningLimit: 1000,
  },
})
