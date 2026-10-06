// Trova i link interni rotti in un sito già costruito: ogni href, src e srcset che comincia con "/"
// deve portare a un file nella cartella. Lo usano scripts/check-links.mjs e i test.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

export async function controllaLink(dist) {
  const esiste = u => {
    const p = join(dist, decodeURIComponent(u).replace(/^\//, ''));
    const file = f => existsSync(f) && statSync(f).isFile();
    return file(p) || file(join(p, 'index.html')) || file(p.replace(/\/$/, '') + '.html');
  };
  const pagine = (await readdir(dist, { recursive: true })).filter(f => f.endsWith('.html'));
  const rotti = new Map();
  let link = 0;
  for (const f of pagine) {
    const html = readFileSync(join(dist, f), 'utf8');
    const trovati = [...html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].map(m => m[1]);
    for (const m of html.matchAll(/srcset="([^"]+)"/g)) trovati.push(...m[1].split(',').map(s => s.trim().split(' ')[0]).filter(u => u.startsWith('/')));
    for (const u of trovati) {
      link++;
      if (!esiste(u)) rotti.set(u, [...(rotti.get(u) || []), '/' + relative(dist, join(dist, f))]);
    }
  }
  return { pagine: pagine.length, link, rotti };
}
