// Scarica i dati OpenStreetMap del riquadro della mappa a riquadri piccoli (API 0.6, dati ODbL).
// Se un riquadro ha troppi dati (centro storico), lo divide in quattro e riprova.
// Uso: node scripts/mappa/scarica.mjs <cartella>   (poi: node scripts/mappa/costruisci.mjs <cartella>)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { BOX } from './riquadro.mjs';

const dir = process.argv[2] || 'riquadri';
fs.mkdirSync(dir, { recursive: true });
const PASSO_LAT = 0.008, PASSO_LON = 0.012;
const r3 = v => Math.round(v * 100000) / 100000;
const attesa = ms => execFileSync('sleep', [String(ms / 1000)]);

function scarica(w, s, e, n, livello = 0) {
  const f = path.join(dir, `t_${r3(w)}_${r3(s)}_${r3(e)}_${r3(n)}.xml`);
  if (fs.existsSync(f) && fs.statSync(f).size > 0) return;
  for (let prova = 1; prova <= 3; prova++) {
    let codice = '000';
    try {
      codice = execFileSync('curl', ['-sS', '--compressed', '--max-time', '180', '-A', 'napoli-a-vela-guide/1.0 (map build)', '-o', f, '-w', '%{http_code}',
        `https://api.openstreetmap.org/api/0.6/map?bbox=${r3(w)},${r3(s)},${r3(e)},${r3(n)}`]).toString();
    } catch { codice = 'errore'; }
    if (codice === '200') { console.log(path.basename(f), (fs.statSync(f).size / 1e6).toFixed(1), 'MB'); attesa(1000); return; }
    fs.rmSync(f, { force: true });
    // 400 = troppi nodi nel riquadro: lo divido
    if (codice === '400' && livello < 4) {
      const mx = (w + e) / 2, my = (s + n) / 2;
      console.log('divido', path.basename(f));
      for (const [a, b, c, d] of [[w, s, mx, my], [mx, s, e, my], [w, my, mx, n], [mx, my, e, n]]) scarica(a, b, c, d, livello + 1);
      return;
    }
    console.log('riprovo', path.basename(f), codice); attesa(5000);
  }
  throw new Error('Riquadro non scaricato: ' + f);
}

for (let s = BOX.s; s < BOX.n - 1e-9; s += PASSO_LAT) {
  for (let w = BOX.w; w < BOX.e - 1e-9; w += PASSO_LON) scarica(w, s, Math.min(w + PASSO_LON, BOX.e), Math.min(s + PASSO_LAT, BOX.n));
}
console.log('FATTO');
