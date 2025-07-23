import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  // For GitHub Pages deployment, use repository name as base path
  // For local development, use root path
  const base = process.env.NODE_ENV === 'production' ? '/au-journey-web/' : '/'
  
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
    server: {
      // Disable caching for model files during development
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    },
    // Prevent aggressive caching of model files
    define: {
      // Add timestamp for cache busting in development
      __MODEL_CACHE_BUST__: JSON.stringify(Date.now())
    }
  }
}) 