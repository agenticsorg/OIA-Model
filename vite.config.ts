import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiPlugin } from './server/vite-api-plugin';

export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: { host: true, port: 5173 },
});
