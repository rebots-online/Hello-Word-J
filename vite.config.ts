import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import reactNativeWeb from 'vite-plugin-react-native-web';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: __dirname,
  publicDir: resolve(__dirname, 'public'),
  plugins: [
    react(),
    reactNativeWeb()
  ],
  resolve: {
    alias: [
      {
        find: 'react-native',
        replacement: 'react-native-web'
      },
      {
        find: '@',
        replacement: resolve(__dirname, 'src')
      }
    ],
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js']
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true
  },
  define: {
    'process.env': {},
    global: 'window',
    __DEV__: true
  },
  optimizeDeps: {
    esbuildOptions: {
      // Fix for react-native-web
      resolveExtensions: ['.web.js', '.js', '.ts', '.tsx'],
      // Enable ES modules
      mainFields: ['module', 'main'],
      // Add support for JSX
      loader: { '.js': 'jsx' },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html')
      }
    }
  }
});
