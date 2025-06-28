import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './',
  build: {
    outDir: 'dist',
  },
  server: {
    open: '/index.html',
  },
  optimizeDeps: {
    exclude: ['react-native-sqlite-storage'],
  },
});
