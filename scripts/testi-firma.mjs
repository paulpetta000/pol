// Firma i testi di src/testi/: per ogni blocco salva l'impronta delle schede che usa (src/testi/firme.json).
// Va eseguito DOPO aver riletto i testi: la build si ferma se una scheda cambia e il testo che la usa
// non è stato firmato di nuovo. Uso: npm run testi:firma
// La formula della firma è in src/lib/regole.mjs (la stessa che usa la build).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { calcolaFirme } from './lib/firme.mjs';

// fileURLToPath: funziona anche su Windows (con .pathname il percorso diventa «/C:/…»)
const radice = fileURLToPath(new URL('..', import.meta.url));
const uscita = join(radice, 'src/testi/firme.json');

const prima = JSON.parse(readFileSync(uscita, 'utf8'));
const { firme: dopo, errori } = calcolaFirme(radice);
if (errori.length) { console.error(errori.join('\n')); process.exit(1); }

const cambiati = Object.keys(dopo).filter(k => JSON.stringify(dopo[k]) !== JSON.stringify(prima[k]));
writeFileSync(uscita, JSON.stringify(dopo, null, 2) + '\n');
console.log(`${Object.keys(dopo).length} blocchi firmati${cambiati.length ? `; nuovi o cambiati: ${cambiati.join(', ')}` : ', nessun cambiamento'}`);
