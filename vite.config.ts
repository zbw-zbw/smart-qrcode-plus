import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest,
      mode: 'development',
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    // 修复 CORS 问题
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['*'],
    },
  },
  // 开发模式下的优化
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
