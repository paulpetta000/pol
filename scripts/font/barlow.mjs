// Font della pagina degli itinerari (stile «Orario»): Barlow e Barlow Semi Condensed, dai pacchetti Fontsource
// (licenza SIL OFL 1.1), solo i caratteri latini e i pesi usati. Scrive anche le misure per il carattere di
// riserva (src/styles/itinerari.css, @font-face «Barlow Riserva»): così la pagina non salta quando arriva il font.
// Uso: node scripts/font/barlow.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const RADICE = fileURLToPath(new URL('../../', import.meta.url));
const FILE = [
  ['@fontsource/barlow/files/barlow-latin-400-normal.woff2', 'barlow-400.woff2'],
  ['@fontsource/barlow/files/barlow-latin-600-normal.woff2', 'barlow-600.woff2'],
  ['@fontsource/barlow-semi-condensed/files/barlow-semi-condensed-latin-600-normal.woff2', 'barlow-semi-condensed-600.woff2']
];
for (const [da, a] of FILE) fs.copyFileSync(path.join(RADICE, 'node_modules', da), path.join(RADICE, 'public/fonts', a));
fs.copyFileSync(path.join(RADICE, 'node_modules/@fontsource/barlow/LICENSE'), path.join(RADICE, 'public/fonts/LICENSE-Barlow.txt'));

// Misure verticali e larghezza media dal file woff2: head, hhea e OS/2 non sono trasformate, basta
// decomprimere il blocco unico (brotli) e leggere le tabelle nell'ordine della directory.
function misure(file) {
  const b = fs.readFileSync(file);
  const nTab = b.readUInt16BE(12);
  let p = 48;
  const base128 = () => { let v = 0; for (let i = 0; i < 5; i++) { const c = b[p++]; v = v * 128 + (c & 127); if (!(c & 128)) return v; } throw new Error('UIntBase128'); };
  const NOMI = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill'];
  const tab = [];
  for (let i = 0; i < nTab; i++) {
    const f = b[p++];
    const tag = (f & 63) === 63 ? b.toString('latin1', p, (p += 4)) : NOMI[f & 63];
    const lung = base128();
    const trasf = (f >> 6) & 3;
    const conTrasformazione = (tag === 'glyf' || tag === 'loca') ? trasf !== 3 : trasf !== 0;
    tab.push({ tag, lung: conTrasformazione ? base128() : lung });
  }
  const dati = zlib.brotliDecompressSync(b.subarray(p));
  const t = {}; let q = 0;
  for (const x of tab) { t[x.tag] = dati.subarray(q, q + x.lung); q += x.lung; }
  const upm = t.head.readUInt16BE(18);
  const os2 = t['OS/2'];
  return {
    upm,
    ascent: t.hhea.readInt16BE(4), descent: t.hhea.readInt16BE(6), lineGap: t.hhea.readInt16BE(8),
    larghezza: os2.readInt16BE(2), xHeight: os2.readUInt16BE(0) >= 2 ? os2.readInt16BE(86) : null
  };
}
// Arial (il carattere di riserva su Windows e Android con Liberation Sans o Roboto simili)
const ARIAL = { upm: 2048, larghezza: 904 };
for (const [, a] of FILE) {
  const m = misure(path.join(RADICE, 'public/fonts', a));
  const size = (m.larghezza / m.upm) / (ARIAL.larghezza / ARIAL.upm);
  const pc = v => (v * 100).toFixed(1) + '%';
  console.log(`${a}: size-adjust ${pc(size)}; ascent-override ${pc(m.ascent / m.upm / size)}; descent-override ${pc(Math.abs(m.descent) / m.upm / size)}; line-gap-override ${pc(m.lineGap / m.upm / size)}`);
}
