import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // IMPORTANT: use repo-root `res/` as the public assets source of truth
  // so `res/logo.png` and `res/open.png` are used correctly.
  publicDir: path.resolve(__dirname, '../res'),

  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:3001'
    },
    fs: {
      allow: [path.resolve(__dirname, '..')]
    }
  }
});

