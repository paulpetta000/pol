// I testi veri delle pagine (src/testi/*.yaml) con le regole della build, senza costruire il sito: segni di
// cautela e parole che li dicono. In più la lista nera della guida di stile (specifiche/stile-testi.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { controllaSegni, pezzi, frasiDaControllare, nudo, LISTA_NERA } from '../src/lib/regole.mjs';

const radice = fileURLToPath(new URL('..', import.meta.url));
const schede = new Map(yaml.load(readFileSync(radice + 'src/data/fatti.yaml', 'utf8'))
  .map(f => [f.id, { data: { anno: 2027, storico: false, comeFatto: false, ...f } }]));
const pagine = readdirSync(radice + 'src/testi').filter(f => f.endsWith('.yaml'))
  .map(f => [f.replace('.yaml', ''), yaml.load(readFileSync(radice + 'src/testi/' + f, 'utf8'))]);

test('testi: segni di cautela e parole che li dicono (come nella build)', () => {
  const errori = [];
  for (const [pagina, blocchi] of pagine) {
    for (const [nome, d] of Object.entries(blocchi)) {
      const chiave = `${pagina}#${nome}`;
      const usate = new Map();
      for (const id of d.usa ?? []) {
        if (schede.has(id)) usate.set(id, schede.get(id)); else errori.push(`${chiave}: la scheda "${id}" non esiste`);
      }
      controllaSegni(chiave, frasiDaControllare(d.testo ? pezzi(d.testo) : [], d.voci ?? []), usate, errori);
    }
  }
  assert.deepEqual(errori, []);
});

test('testi: nessuna parola della lista nera della guida di stile', () => {
  const trovate = [];
  for (const [pagina, blocchi] of pagine) {
    for (const [nome, d] of Object.entries(blocchi)) {
      for (const t of [d.testo ?? '', ...(d.voci ?? []).map(v => v.testo)]) {
        const m = nudo(t).match(new RegExp(LISTA_NERA.source, 'gi'));
        if (m) trovate.push(`${pagina}#${nome}: ${[...new Set(m)].join(', ')}`);
      }
    }
  }
  assert.deepEqual(trovate, []);
});
