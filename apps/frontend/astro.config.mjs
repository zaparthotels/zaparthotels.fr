// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [svelte(), sitemap()],
  adapter: node({
    mode: 'standalone',
  }),
  server: {
    port: 3000,
  },
});
