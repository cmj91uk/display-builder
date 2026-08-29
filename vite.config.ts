import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Project Pages URL is https://<user>.github.io/classroom-apps/
// Keep this in sync with createBrowserRouter basename in src/router.tsx
export default defineConfig({
  base: '/classroom-apps/',
  plugins: [react(), tailwindcss()],
})
