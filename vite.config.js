import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // .glb is a binary model, not something Vite bundles by default.
  assetsInclude: ['**/*.glb'],
  plugins: [react()],
})
