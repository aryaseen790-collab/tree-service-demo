// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import business from './src/data/business.json' with { type: 'json' };
import { remarkBusinessTokens } from './src/lib/remark-business-tokens.mjs';

// SITE_URL / BASE_PATH are set by the GitHub Pages workflow. Netlify and
// Cloudflare Pages serve from the domain root, so the defaults just work there.
// Netlify sets URL to the site's main address; otherwise business.json site.url is used.
const site = process.env.SITE_URL || process.env.URL || business.site.url;
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you') && !page.endsWith('/404/'),
    }),
  ],
  markdown: {
    remarkPlugins: [[remarkBusinessTokens, { base }]],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
