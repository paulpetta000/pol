// Controlla i link interni del sito già costruito: ogni href, src e srcset che comincia con "/"
// deve portare a un file in dist/. Uso: npm run build && npm run check:links
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

// fileURLToPath: funziona anche su Windows (con .pathname il percorso diventa «/C:/…»)
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(DIST)) { console.error('Manca dist/: esegui prima npm run build'); process.exit(1); }

const esiste = u => {
  const p = join(DIST, decodeURIComponent(u).replace(/^\//, ''));
  const file = f => existsSync(f) && statSync(f).isFile();
  return file(p) || file(join(p, 'index.html')) || file(p.replace(/\/$/, '') + '.html');
};

const pagine = (await readdir(DIST, { recursive: true })).filter(f => f.endsWith('.html'));
const rotti = new Map();
let n = 0;
for (const f of pagine) {
  const html = readFileSync(join(DIST, f), 'utf8');
  const link = [...html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].map(m => m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) link.push(...m[1].split(',').map(s => s.trim().split(' ')[0]).filter(u => u.startsWith('/')));
  for (const u of link) {
    n++;
    if (!esiste(u)) rotti.set(u, [...(rotti.get(u) || []), '/' + relative(DIST, join(DIST, f))]);
  }
}
console.log(`${pagine.length} pagine, ${n} link interni controllati`);
for (const [u, da] of rotti) console.log(`MANCA ${u}  ←  ${da.slice(0, 3).join(', ')}`);
if (rotti.size) { console.error(`${rotti.size} link rotti`); process.exit(1); }
console.log('Nessun link rotto');
