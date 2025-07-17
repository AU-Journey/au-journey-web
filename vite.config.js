import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  // Determine base path based on environment
  // For production builds on Vercel, use root path
  // For GitHub Pages or development, use repository path
  let base = '/'
  
  // Check if we're building for GitHub Pages specifically
  if (process.env.DEPLOY_TARGET === 'github' || 
      (!process.env.VERCEL && !process.env.DEPLOY_TARGET && mode === 'development')) {
    base = '/au-journey-web/'
  }
  
  console.log(`Building with base path: ${base}`)
  
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