// Genera favicon e icone dell'app dal marchio (src/lib/logo.mjs): node scripts/icone.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import { svg } from '../src/lib/logo.mjs';
fs.writeFileSync('public/favicon.svg', svg());
const png = (s, n, file) => sharp(Buffer.from(s), { density: 1200 }).resize(n, n).png().toFile(file);
await png(svg(), 192, 'public/icons/icon-192.png');
await png(svg(), 512, 'public/icons/icon-512.png');
await png(svg({ sfondo: '#0B2F55', margine: 14 }), 512, 'public/icons/icon-maskable-512.png');
await png(svg({ sfondo: '#0B2F55', margine: 5 }), 180, 'public/icons/apple-touch-icon.png');

// Google Search non usa le icone SVG: per i risultati di ricerca servono anche un PNG (multiplo di 48 px)
// e il classico favicon.ico, qui con dentro tre PNG da 16, 32 e 48 px
await png(svg(), 96, 'public/icons/favicon-96.png');
const lati = [16, 32, 48];
const pngs = await Promise.all(lati.map(n => sharp(Buffer.from(svg()), { density: 1200 }).resize(n, n).png().toBuffer()));
const testa = Buffer.alloc(6);
testa.writeUInt16LE(0, 0); testa.writeUInt16LE(1, 2); testa.writeUInt16LE(lati.length, 4);
let posizione = 6 + 16 * lati.length;
const elenco = lati.map((n, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(n, 0); e.writeUInt8(n, 1); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(posizione, 12);
  posizione += pngs[i].length;
  return e;
});
fs.writeFileSync('public/favicon.ico', Buffer.concat([testa, ...elenco, ...pngs]));
console.log('icone ok');
