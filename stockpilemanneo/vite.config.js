import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import license from 'rollup-plugin-license';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    plugin(),
    license({
      sourcemap: true,
      thirdParty: {
        includePrivate: true,
        includeSelf: true,
        multipleVersions: true,
        output: {
          file: path.join(import.meta.dirname, 'dist', 'dependencies.txt'),
          encoding: 'utf-8',
        },
      },
    }),
  ],
});