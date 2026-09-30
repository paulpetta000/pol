import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PAGINE } from '../data/pagine';
import { SITO } from '../config/sito';

export const GET: APIRoute = async () => {
  const squadre = await getCollection('squadre');
  const paths = [...PAGINE.map(p => p.path), ...squadre.map(s => `/squadre/${s.id}/`)];
  const oggi = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${paths.map(p => `  <url><loc>${SITO.url}${p}</loc><lastmod>${oggi}</lastmod><xhtml:link rel="alternate" hreflang="it" href="${SITO.url}${p}"/></url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
