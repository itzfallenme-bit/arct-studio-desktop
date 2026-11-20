/// <reference types="vite-plugin-svgr/client" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  clearScreen: false,
  server: {
    port: 5180,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**', 'ref/**', 'tools/**'],
    },
  },
});
