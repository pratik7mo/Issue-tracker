import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Matches axios default baseURL `/api` when VITE_API_BASE_URL is unset.
      '/api': {
        target: 'http://localhost:9092',
        changeOrigin: true,
      },
    },
  },
})
