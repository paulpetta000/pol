// Firma i testi di src/testi/: per ogni blocco salva l'impronta delle schede che usa (src/testi/firme.json).
// Va eseguito DOPO aver riletto i testi: la build si ferma se una scheda cambia e il testo che la usa
// non è stato firmato di nuovo. Uso: npm run testi:firma
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import yaml from 'js-yaml';

const radice = new URL('..', import.meta.url).pathname;
const cartella = join(radice, 'src/testi');
const uscita = join(cartella, 'firme.json');

// Stessa formula di src/lib/testi.ts
const firma = f => createHash('sha1').update(JSON.stringify([f.testo, f.stato, f.anno ?? 2027])).digest('hex').slice(0, 10);

const fatti = new Map(yaml.load(readFileSync(join(radice, 'src/data/fatti.yaml'), 'utf8')).map(f => [f.id, f]));
const prima = JSON.parse(readFileSync(uscita, 'utf8'));
const dopo = {};
const errori = [];

const file = readdirSync(cartella, { recursive: true }).filter(f => f.endsWith('.yaml')).sort();
for (const f of file) {
  const pagina = relative(cartella, join(cartella, f)).replace(/\.yaml$/, '').split(sep).join('/');
  const dati = yaml.load(readFileSync(join(cartella, f), 'utf8')) ?? {};
  for (const [nome, b] of Object.entries(dati)) {
    const chiave = `${pagina}#${nome}`;
    dopo[chiave] = {};
    for (const id of b.usa ?? []) {
      const x = fatti.get(id);
      if (!x) { errori.push(`${chiave}: la scheda "${id}" non esiste in src/data/fatti.yaml`); continue; }
      dopo[chiave][id] = firma(x);
    }
  }
}
if (errori.length) { console.error(errori.join('\n')); process.exit(1); }

const cambiati = Object.keys(dopo).filter(k => JSON.stringify(dopo[k]) !== JSON.stringify(prima[k]));
writeFileSync(uscita, JSON.stringify(dopo, null, 2) + '\n');
console.log(`${Object.keys(dopo).length} blocchi firmati${cambiati.length ? `; nuovi o cambiati: ${cambiati.join(', ')}` : ', nessun cambiamento'}`);
