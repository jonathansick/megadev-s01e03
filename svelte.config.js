import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.svx'],
      // Frontmatter `layout: runbook` picks the frame every kb page shares.
      layout: { runbook: here('./src/lib/layouts/runbook.svelte') },
    }),
  ],
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', fallback: undefined, strict: true }),
    alias: { '#lib': 'src/lib' },
    prerender: { entries: ['*'] },
  },
};

export default config;
