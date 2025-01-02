import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist'
  },
  server: {
    open: true
  },
  // خاص بـ SPA: يعيد توجيه الطلبات إلى index.html
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
