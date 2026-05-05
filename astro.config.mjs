// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://matthaynes.fun',
  output: 'static',
  integrations: [react()],
  build: {
    format: 'directory',
    inlineStylesheets: 'auto'
  },
  vite: {
    ssr: {
      noExternal: ['three']
    }
  }
});
