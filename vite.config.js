import { defineConfig } from 'vite'

export default defineConfig({
  base: '/au-journey-web/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    }
  },
  publicDir: 'models',
}) 