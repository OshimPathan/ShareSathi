import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached across all pages
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management
          'vendor-state': ['zustand'],
          // Charting libraries (heaviest dependencies)
          'vendor-recharts': ['recharts'],
          'vendor-trading-chart': ['lightweight-charts'],
          // UI icons (tree-shaken but still significant)
          'vendor-icons': ['lucide-react'],
          // InsForge SDK
          'vendor-insforge': ['@insforge/sdk'],
        },
      },
    },
  },
})
