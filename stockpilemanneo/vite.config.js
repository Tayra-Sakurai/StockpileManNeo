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
      banner: {
        commentStyle: 'regular',
        content: {
          file: path.join(__dirname, 'LICENSE.txt'),
          encoding: 'utf-8',
        },
      },
      thirdParty: {
        includePrivate: true,
        includeSelf: true,
        multipleVersions: true,
        output: {
          file: path.join(__dirname, 'dist', 'dependencies.txt'),
          encoding: 'utf-8',
        },
      },
    }),
  ],
});