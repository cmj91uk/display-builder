import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Project Pages URL is https://<user>.github.io/display-builder/
// Keep this in sync with createBrowserRouter basename in src/router.tsx
export default defineConfig({
  base: '/display-builder/',
  plugins: [react(), tailwindcss()],
})
