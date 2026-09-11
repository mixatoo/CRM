import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      includeAssets: ['favicon.svg', 'logo.svg'],
      manifest: {
        name: 'Egyliere OPs',
        short_name: 'Egyliere',
        theme_color: '#2563eb',
        background_color: '#f4f5f7',
        display: 'standalone',
        icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'] },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('react-router')
          ) {
            return 'vendor'
          }
          if (id.includes('@tanstack/react-query')) return 'query'
          if (id.includes('dexie')) return 'dexie'
          if (id.includes('@dnd-kit')) return 'dnd'
          if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html2pdf')) return 'pdf'
          if (id.includes('pdfjs-dist')) return 'pdfjs'
          if (id.includes('@radix-ui')) return 'radix'
          if (id.includes('lucide-react')) return 'icons'
        },
      },
    },
  },
})
