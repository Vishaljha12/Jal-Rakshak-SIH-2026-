import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 4000,
    host: '127.0.0.1',
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/simulate': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/status': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/result': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/scenarios': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/workspace': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})
