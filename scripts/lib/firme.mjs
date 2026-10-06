// Calcola le firme dei testi di src/testi/ (per ogni blocco, l'impronta delle schede che usa).
// Lo usano scripts/testi-firma.mjs, che le salva in src/testi/firme.json, e i test.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import yaml from 'js-yaml';
import { firma } from '../../src/lib/regole.mjs';

export function calcolaFirme(radice) {
  const cartella = join(radice, 'src/testi');
  const fatti = new Map(yaml.load(readFileSync(join(radice, 'src/data/fatti.yaml'), 'utf8')).map(f => [f.id, f]));
  const firme = {};
  const errori = [];
  const file = readdirSync(cartella, { recursive: true }).filter(f => f.endsWith('.yaml')).sort();
  for (const f of file) {
    const pagina = relative(cartella, join(cartella, f)).replace(/\.yaml$/, '').split(sep).join('/');
    const dati = yaml.load(readFileSync(join(cartella, f), 'utf8')) ?? {};
    for (const [nome, b] of Object.entries(dati)) {
      const chiave = `${pagina}#${nome}`;
      firme[chiave] = {};
      for (const id of b.usa ?? []) {
        const x = fatti.get(id);
        if (!x) { errori.push(`${chiave}: la scheda "${id}" non esiste in src/data/fatti.yaml`); continue; }
        firme[chiave][id] = firma(x);
      }
    }
  }
  return { firme, errori };
}
