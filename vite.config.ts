import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Weather & Wear Studio',
        short_name: 'W/W Studio',
        description: 'Weather Station & Clothes Guide Field App',
        theme_color: '#f7f8f5',
        icons: [
          {
            src: 'mark.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  test: { environment: 'node' }
});
