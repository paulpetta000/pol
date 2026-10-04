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
  '/napoli/itinerari/',
  '/domande-frequenti/',
  '/offline/'
];
// Pagine che devono funzionare senza rete anche nelle parti interattive: con loro si salvano gli script
// (anche quelli caricati dopo, come la mappa), i dati e le miniature delle tappe (il campo "foto" dei dati
// della pagina). Le foto grandi no: si salvano quando le guardi.
const INTERATTIVE = {
  '/napoli/itinerari/': ['/napoli/itinerari/mappa.json', '/napoli/itinerari/percorsi.json', '/napoli/itinerari/partenze.json']
};

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
        // script, dati e immagini piccole delle pagine interattive (anche gli script importati da altri script)
        const visti = new Set();
        const aggiungi = (u) => {
          if (visti.has(u)) return;
          const f = path.join(out, u);
          if (!fs.existsSync(f)) { logger.warn(`File offline mancante: ${u}`); return; }
          visti.add(u);
          files.push([u, f]);
          if (u.endsWith('.js')) {
            const js = fs.readFileSync(f, 'utf8');
            for (const m of js.matchAll(/["'`]\.\/([\w.-]+\.js)["'`]/g)) aggiungi(`/_astro/${m[1]}`);
            for (const m of js.matchAll(/["'`](\/_astro\/[\w.-]+\.js)["'`]/g)) aggiungi(m[1]);
          }
        };
        for (const [pagina, extra] of Object.entries(INTERATTIVE)) {
          const html = fs.readFileSync(path.join(out, pagina, 'index.html'), 'utf8');
          for (const m of html.matchAll(/<script[^>]+src="(\/_astro\/[\w.-]+\.js)"/g)) aggiungi(m[1]);
          for (const m of html.matchAll(/"foto":"(\/_astro\/[\w.-]+\.(?:webp|avif|jpe?g|png))"/g)) aggiungi(m[1]);
          for (const u of extra) aggiungi(u);
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
        const kb = Math.round(all.reduce((s, [, f]) => s + fs.statSync(f).size, 0) / 1024);
        logger.info(`sw.js: ${all.length} file salvati per l'uso offline, ${kb} kB (versione ${version})`);
      }
    }
  };
}
