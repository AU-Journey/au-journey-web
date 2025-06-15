import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/au-journey-web/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    }
  },
  publicDir: 'public',
}) 