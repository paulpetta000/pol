// Genera dist/sw.js dopo la build: salva le pagine utili sul lungomare (anche senza rete)
// e aggiorna la copia ogni volta che il sito cambia.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Pagine salvate subito alla prima visita: le informazioni pratiche
const CORE = [
  '/',
  '/come-vederla/',
  '/come-vederla/dal-lungomare/',
  '/come-vederla/dal-mare/',
  '/calendario/',
  '/napoli/mappa/',
  '/napoli/come-arrivare/',
  '/domande-frequenti/',
  '/offline/'
];

export default function serviceWorker() {
  return {
    name: 'service-worker',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const files = [];
        for (const url of CORE) {
          const f = path.join(out, url, 'index.html');
          if (!fs.existsSync(f)) { logger.warn(`Pagina offline mancante: ${url}`); continue; }
          files.push([url, f]);
        }
        const fonts = fs.readdirSync(path.join(out, 'fonts')).filter(f => f.endsWith('.woff2')).map(f => [`/fonts/${f}`, path.join(out, 'fonts', f)]);
        const extra = ['/manifest.webmanifest', '/icons/icon-192.png'].map(u => [u, path.join(out, u)]).filter(([, f]) => fs.existsSync(f));
        const all = [...files, ...fonts, ...extra];
        const hash = crypto.createHash('sha256');
        for (const [, f] of all) hash.update(fs.readFileSync(f));
        const version = hash.digest('hex').slice(0, 12);
        const tpl = fs.readFileSync(new URL('./sw-template.js', import.meta.url), 'utf8');
        const sw = tpl.replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(all.map(([u]) => u)));
        fs.writeFileSync(path.join(out, 'sw.js'), sw);
        logger.info(`sw.js: ${all.length} file salvati per l'uso offline (versione ${version})`);
      }
    }
  };
}
