import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { worksPlugin } from './scripts/vite-plugin-works.ts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), worksPlugin(import.meta.dirname)],
  build: {
    // Read by scripts/prerender.mjs to link each page's own chunks and stylesheets.
    manifest: true,
  },
  define: {
    // Build time, not request time: prerendered HTML must match what the browser renders.
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
});
