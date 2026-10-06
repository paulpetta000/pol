// Controlla i link interni del sito già costruito: ogni href, src e srcset che comincia con "/"
// deve portare a un file in dist/. Uso: npm run build && npm run check:links
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { controllaLink } from './lib/link-interni.mjs';

// fileURLToPath: funziona anche su Windows (con .pathname il percorso diventa «/C:/…»)
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(DIST)) { console.error('Manca dist/: esegui prima npm run build'); process.exit(1); }

const { pagine, link, rotti } = await controllaLink(DIST);
console.log(`${pagine} pagine, ${link} link interni controllati`);
for (const [u, da] of rotti) console.log(`MANCA ${u}  ←  ${da.slice(0, 3).join(', ')}`);
if (rotti.size) { console.error(`${rotti.size} link rotti`); process.exit(1); }
console.log('Nessun link rotto');
