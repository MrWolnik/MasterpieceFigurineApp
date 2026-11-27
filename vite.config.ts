import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Build time, not request time: prerendered HTML must match what the browser renders.
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
});
