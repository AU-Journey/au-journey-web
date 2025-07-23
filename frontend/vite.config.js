import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  // For Docker deployment, always use root path
  const base = process.env.NODE_ENV === 'production' ? '/' : '/'
  
  console.log(`Building with base path: ${base} (mode: ${mode})`)
  
  return {
    base,
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
  }
}) 