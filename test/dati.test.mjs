// I dati veri del sito: firme dei testi aggiornate, date delle schede e delle fonti sensate, tipi di fonte noti.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { calcolaFirme } from '../scripts/lib/firme.mjs';
import { TIPI_FONTE } from '../src/lib/regole.mjs';

const radice = fileURLToPath(new URL('..', import.meta.url));
const leggi = f => yaml.load(readFileSync(radice + f, 'utf8'));
const fatti = leggi('src/data/fatti.yaml');
const fonti = leggi('src/data/fonti.yaml');
// Una data nel futuro è un errore di battitura (per esempio 2027 al posto di 2026). Un giorno di margine per i fusi orari.
const domani = new Date(Date.now() + 86400000);
const giorno = d => d.toISOString().slice(0, 10);

test('firme: src/testi/firme.json corrisponde alle schede di oggi', () => {
  const { firme, errori } = calcolaFirme(radice);
  assert.deepEqual(errori, []);
  const salvate = JSON.parse(readFileSync(radice + 'src/testi/firme.json', 'utf8'));
  const diverse = Object.keys(firme).filter(k => JSON.stringify(firme[k]) !== JSON.stringify(salvate[k] ?? {}));
  assert.deepEqual(diverse, [], 'Questi testi usano schede cambiate: rileggili, poi npm run testi:firma');
});

test('date: nessuna scheda controllata nel futuro, e «ricontrollare» viene dopo «controllato»', () => {
  const sbagliate = [];
  for (const f of fatti) {
    if (!(f.controllato instanceof Date)) { sbagliate.push(`${f.id}: «controllato» non è una data`); continue; }
    if (f.controllato > domani) sbagliate.push(`${f.id}: controllato il ${giorno(f.controllato)}, nel futuro`);
    if (f.ricontrollare && !(f.ricontrollare instanceof Date)) sbagliate.push(`${f.id}: «ricontrollare» non è una data`);
    else if (f.ricontrollare && f.ricontrollare < f.controllato) sbagliate.push(`${f.id}: da ricontrollare il ${giorno(f.ricontrollare)}, prima del controllo (${giorno(f.controllato)})`);
  }
  assert.deepEqual(sbagliate, []);
});

test('date: nessuna fonte controllata nel futuro o pubblicata dopo il controllo', () => {
  const sbagliate = [];
  for (const f of fonti) {
    if (!(f.controllato instanceof Date)) { sbagliate.push(`${f.id}: «controllato» non è una data`); continue; }
    if (f.controllato > domani) sbagliate.push(`${f.id}: controllata il ${giorno(f.controllato)}, nel futuro`);
    if (f.pubblicato instanceof Date && f.pubblicato > f.controllato) sbagliate.push(`${f.id}: pubblicata il ${giorno(f.pubblicato)}, dopo il controllo (${giorno(f.controllato)})`);
  }
  assert.deepEqual(sbagliate, []);
});

test('fonti: ogni tipo è nell\'elenco e ogni scheda usa fonti che esistono', () => {
  const ids = new Set(fonti.map(f => f.id));
  assert.deepEqual(fonti.filter(f => !TIPI_FONTE.includes(f.tipo)).map(f => `${f.id}: ${f.tipo}`), []);
  assert.deepEqual(fatti.flatMap(f => (f.fonti ?? []).filter(id => !ids.has(id)).map(id => `${f.id} → ${id}`)), []);
});

test('fonti: le pagine di Wikipedia sono di tipo «enciclopedia»', () => {
  assert.deepEqual(fonti.filter(f => /wikipedia\.org/.test(f.url) && f.tipo !== 'enciclopedia').map(f => f.id), []);
});
