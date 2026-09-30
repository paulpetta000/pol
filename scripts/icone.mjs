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
console.log('icone ok');
