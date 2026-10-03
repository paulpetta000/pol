import fs from 'node:fs';
const DIR = process.env.GTFS || './gtfs-anm';
function riga(l) { const o = []; let c = '', q = false; for (let i = 0; i < l.length; i++) { const ch = l[i]; if (q) { if (ch === '"') { if (l[i+1] === '"') { c += '"'; i++; } else q = false; } else c += ch; } else if (ch === '"') q = true; else if (ch === ',') { o.push(c); c = ''; } else c += ch; } o.push(c); return o; }
export function leggi(nome) {
  const righe = fs.readFileSync(`${DIR}/${nome}.txt`, 'utf8').split(/\r?\n/).filter(Boolean);
  const h = riga(righe[0]);
  return righe.slice(1).map(r => { const v = riga(r); const o = {}; h.forEach((k, i) => o[k] = v[i]); return o; });
}
