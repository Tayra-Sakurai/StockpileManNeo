import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import license from 'rollup-plugin-license';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    plugin(),
    license({
      thirdParty: {
        includePrivate: true,
        includeSelf: true,
        output: {
          file: path.join(__dirname, 'dist', 'dependencies.txt'),
          encoding: 'utf-8',
        },
      },
    }),
  ],
});