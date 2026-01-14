import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Birthday Quest',
        short_name: 'Quest',
        description: 'A magical birthday puzzle adventure',
        theme_color: '#8b5cf6',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Mock server-only modules for client build
      'postgres': path.resolve(__dirname, './src/lib/mocks/postgres.ts'),
      '@/db': path.resolve(__dirname, './src/lib/mocks/db.ts'),
    }
  },
  server: {
    port: 3000
  },
  optimizeDeps: {
    exclude: ['postgres', 'drizzle-orm']
  }
});
