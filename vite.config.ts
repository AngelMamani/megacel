import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Firebase Auth (signInWithPopup): Chrome puede advertir si COOP bloquea window.closed en popups cross-origin.
      // `restrict-properties` suele ser el modo más compatible para mantener seguridad sin romper popups.
      'Cross-Origin-Opener-Policy': 'restrict-properties',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'restrict-properties',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
})
