import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://swagger-motor-backend.zj8v6e.easypanel.host',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  preview: {
    port: 3000
  }
})
