// Immagini di anteprima 1200×630 per ogni pagina, generate durante la build (satori + sharp)
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { PAGINE, slugOg } from '../../data/pagine';
import { SITO } from '../../config/sito';
import { svg as logoSvg } from '../../lib/logo.mjs';
const LOGO = 'data:image/svg+xml;base64,' + Buffer.from(logoSvg()).toString('base64');

const font = (f: string) => fs.readFileSync(path.join(process.cwd(), 'node_modules', f));
const FONTS = [
  { name: 'Archivo', data: font('@fontsource/archivo/files/archivo-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'Archivo', data: font('@fontsource/archivo/files/archivo-latin-800-normal.woff'), weight: 800 as const, style: 'normal' as const },
  { name: 'Plex', data: font('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const }
];

export async function getStaticPaths() {
  const squadre = await getCollection('squadre');
  const tutte = [
    ...PAGINE.map(p => ({ slug: slugOg(p.path), titolo: p.titolo, kicker: p.kicker })),
    ...squadre.map(s => ({ slug: `squadre--${s.id}`, titolo: s.data.nome, kicker: `Squadre · ${s.data.paese}` }))
  ];
  return tutte.map(p => ({ params: { slug: p.slug }, props: p }));
}

const h = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ props }) => {
  const { titolo, kicker } = props as { titolo: string; kicker: string };
  const tree = h('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#090D10', color: '#EDF3F5', padding: '64px 72px', fontFamily: 'Archivo', position: 'relative' }, [
    h('div', { position: 'absolute', left: 0, right: 0, bottom: 0, height: 170, background: '#0B2A30', display: 'flex' }),
    h('div', { position: 'absolute', left: 0, right: 0, bottom: 170, height: 4, background: '#2CC4D8', display: 'flex' }),
    h('div', { display: 'flex', alignItems: 'center', gap: 18 }, [
      { type: 'img', props: { src: LOGO, width: 64, height: 64 } },
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h('div', { fontSize: 30, fontWeight: 800, letterSpacing: 1 }, SITO.nome.toUpperCase()),
        h('div', { fontSize: 18, fontFamily: 'Plex', color: '#8C9CA6', letterSpacing: 3 }, 'GUIDA NON UFFICIALE 2027')
      ])
    ]),
    h('div', { display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 150 }, [
      h('div', { display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'Plex', fontSize: 24, color: '#FF7A3D', letterSpacing: 3 }, [h('div', { width: 36, height: 5, background: '#FF7A3D', display: 'flex' }), kicker.toUpperCase()]),
      h('div', { fontSize: titolo.length > 30 ? 72 : 88, fontWeight: 800, lineHeight: 1.02, letterSpacing: -1, maxWidth: 1000 }, titolo)
    ]),
    h('div', { position: 'absolute', left: 72, bottom: 58, display: 'flex', gap: 28, fontFamily: 'Plex', fontSize: 26, color: '#EDF3F5' }, [
      h('div', { background: '#FFD84D', color: '#0F1519', padding: '4px 12px', display: 'flex' }, '22.05 – 19.07.2027'),
      h('div', { display: 'flex', color: '#B7C5CD' }, 'Golfo di Napoli')
    ])
  ]);
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts: FONTS });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
