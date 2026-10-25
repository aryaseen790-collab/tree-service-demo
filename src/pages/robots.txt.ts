import type { APIRoute } from 'astro';
import business from '../data/business.json';

// Demo mode blocks all crawlers. Flip DEMO_MODE to false in business.json at launch.
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const sitemap = new URL(`${base}/sitemap-index.xml`, site).href;
  const body = business.DEMO_MODE
    ? `# Demo mode: concept preview, not for indexing.\nUser-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\nDisallow: ${base}/thank-you/\n\nSitemap: ${sitemap}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
