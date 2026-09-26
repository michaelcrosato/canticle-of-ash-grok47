import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    target: 'es2022',
  },
});
