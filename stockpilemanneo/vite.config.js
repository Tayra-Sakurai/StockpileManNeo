import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import pkg from './package.json' with {
  type: 'json'
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    plugin(),
  ],
  define: {
    "import.meta.env.VITE_APP_VERSION": pkg.version,
  },
});