import type { APIRoute } from 'astro';
import business from '../data/business.json';

export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return new Response(
    JSON.stringify({
      name: business.name,
      short_name: business.name,
      start_url: `${base}/`,
      display: 'standalone',
      background_color: '#faf7f0',
      theme_color: business.site.themeColor,
      icons: [
        { src: `${base}/icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${base}/icon-512.png`, sizes: '512x512', type: 'image/png' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
};
