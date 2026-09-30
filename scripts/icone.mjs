// Genera favicon e icone dell'app dal marchio (AC75 in volo su quadrato arancio)
import sharp from 'sharp';
import fs from 'node:fs';
const mark = (bg, fg, pad = 0, r = 4) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${32 + pad * 2} ${32 + pad * 2}">
<rect x="${-pad}" y="${-pad}" width="${32 + pad * 2}" height="${32 + pad * 2}" rx="${r}" fill="${bg}"/>
<g fill="none" stroke="${fg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M5 18h17.5l3.5-3.5H8.5z" fill="${fg}"/><path d="M14.5 14.5V5l7.5 9.5"/><path d="M11 18v5h4M20.5 18v7.5M17 25.5h7"/></g></svg>`;
fs.writeFileSync('public/favicon.svg', mark('#C2410C', '#FFFFFF'));
const png = (svg, n, file) => sharp(Buffer.from(svg), { density: 1200 }).resize(n, n).png().toFile(file);
await png(mark('#C2410C', '#FFFFFF'), 192, 'public/icons/icon-192.png');
await png(mark('#C2410C', '#FFFFFF'), 512, 'public/icons/icon-512.png');
await png(mark('#C2410C', '#FFFFFF', 7, 0), 512, 'public/icons/icon-maskable-512.png');
await png(mark('#C2410C', '#FFFFFF', 3, 0), 180, 'public/icons/apple-touch-icon.png');
console.log('icone ok');
