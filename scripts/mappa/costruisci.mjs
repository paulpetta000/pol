// Costruisce la base della mappa (src/data/mappa.json) dai riquadri OpenStreetMap.
// Uso: node scripts/mappa/costruisci.mjs <cartella-riquadri>
// I riquadri si scaricano con scripts/mappa/scarica.mjs (API di OpenStreetMap, dati ODbL).
import fs from 'node:fs';
import { loadTiles } from './osm.mjs';
import { BOX } from './riquadro.mjs';

const dir = process.argv[2];
if (!dir) throw new Error('Indica la cartella con i riquadri XML');

const M_PER_UNIT = 5;
const LAT0 = (BOX.s + BOX.n) / 2;
const KX = 111320 * Math.cos((LAT0 * Math.PI) / 180) / M_PER_UNIT;
const KY = 110950 / M_PER_UNIT;
const W = Math.round((BOX.e - BOX.w) * KX);
const H = Math.round((BOX.n - BOX.s) * KY);
const proj = (lat, lon) => [(lon - BOX.w) * KX, (BOX.n - lat) * KY];

const { nodes, ways, rels } = loadTiles(dir);
const pts = nds => nds.map(id => nodes.get(id)).filter(Boolean).map(n => proj(n.lat, n.lon));

// ---------- geometria ----------
function simplify(points, tol) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = points[a], [bx, by] = points[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-9;
    let best = -1, bi = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * points[i][0] - dx * points[i][1] + bx * ay - by * ax) / len;
      if (d > best) { best = d; bi = i; }
    }
    if (best > tol) { keep[bi] = 1; stack.push([a, bi], [bi, b]); }
  }
  return points.filter((_, i) => keep[i]);
}

// Per gli anelli chiusi: divido al punto più lontano dal primo, poi semplifico le due metà
function simplifyRing(ring, tol) {
  if (ring.length < 4) return ring;
  let k = 1, best = -1;
  ring.forEach(([x, y], i) => { const d = Math.hypot(x - ring[0][0], y - ring[0][1]); if (d > best) { best = d; k = i; } });
  return simplify(ring.slice(0, k + 1), tol).concat(simplify(ring.slice(k), tol).slice(1));
}

const inside = ([x, y]) => x >= 0 && x <= W && y >= 0 && y <= H;

// Liang-Barsky: ritaglia un segmento al riquadro
function clipSeg(p, q) {
  let t0 = 0, t1 = 1;
  const dx = q[0] - p[0], dy = q[1] - p[1];
  for (const [pp, qq] of [[-dx, p[0]], [dx, W - p[0]], [-dy, p[1]], [dy, H - p[1]]]) {
    if (pp === 0) { if (qq < 0) return null; continue; }
    const r = qq / pp;
    if (pp < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
    else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  return [[p[0] + t0 * dx, p[1] + t0 * dy], [p[0] + t1 * dx, p[1] + t1 * dy]];
}

// Ritaglia una linea al riquadro: restituisce i pezzi interni
function clipLine(line) {
  const pieces = [];
  let cur = null;
  for (let i = 0; i < line.length - 1; i++) {
    const c = clipSeg(line[i], line[i + 1]);
    if (!c) { if (cur) { pieces.push(cur); cur = null; } continue; }
    if (!cur) cur = [c[0]];
    cur.push(c[1]);
    if (c[1][0] !== line[i + 1][0] || c[1][1] !== line[i + 1][1]) { pieces.push(cur); cur = null; }
  }
  if (cur) pieces.push(cur);
  return pieces.filter(p => p.length > 1);
}

// Sutherland-Hodgman: ritaglia un poligono al riquadro
function clipPoly(poly) {
  const edges = [
    [p => p[0] >= 0, (a, b) => { const t = (0 - a[0]) / (b[0] - a[0]); return [0, a[1] + t * (b[1] - a[1])]; }],
    [p => p[0] <= W, (a, b) => { const t = (W - a[0]) / (b[0] - a[0]); return [W, a[1] + t * (b[1] - a[1])]; }],
    [p => p[1] >= 0, (a, b) => { const t = (0 - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), 0]; }],
    [p => p[1] <= H, (a, b) => { const t = (H - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), H]; }]
  ];
  let out = poly;
  for (const [ins, cut] of edges) {
    const input = out; out = [];
    for (let i = 0; i < input.length; i++) {
      const a = input[(i + input.length - 1) % input.length], b = input[i];
      if (ins(b)) { if (!ins(a)) out.push(cut(a, b)); out.push(b); }
      else if (ins(a)) out.push(cut(a, b));
    }
    if (!out.length) break;
  }
  return out;
}

const r = v => Math.round(v);
const pathOf = (line, close = false) => {
  let d = '', px, py;
  line.forEach(([x, y], i) => {
    const X = r(x), Y = r(y);
    if (i && X === px && Y === py) return;
    d += (i ? 'L' : 'M') + X + ' ' + Y;
    px = X; py = Y;
  });
  return d + (close ? 'Z' : '');
};

// Unisce vie che si toccano agli estremi (per la costa)
function mergeChains(list) {
  const chains = list.map(w => [...w.nds]);
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < chains.length; i++) {
      for (let j = 0; j < chains.length; j++) {
        if (i === j) continue;
        const a = chains[i], b = chains[j];
        if (a[0] === a.at(-1)) continue;
        if (a.at(-1) === b[0]) { chains[i] = a.concat(b.slice(1)); chains.splice(j, 1); merged = true; break outer; }
      }
    }
  }
  return chains;
}

// ---------- costa e mare ----------
const coast = mergeChains([...ways.values()].filter(w => w.tags.natural === 'coastline'));
const islands = [], pieces = [];
for (const c of coast) {
  const line = pts(c);
  if (c[0] === c.at(-1)) { islands.push(line); continue; }
  for (const p of clipLine(line)) pieces.push(p);
}
// Posizione sul bordo, in senso orario (vista mappa): alto, destra, basso, sinistra
const tOf = ([x, y]) => {
  const e = 0.01;
  if (Math.abs(y) < e) return x / W;
  if (Math.abs(x - W) < e) return 1 + y / H;
  if (Math.abs(y - H) < e) return 2 + (W - x) / W;
  return 3 + (H - y) / H;
};
const corner = t => [[0, 0], [W, 0], [W, H], [0, H]][Math.round(t) % 4];
const seaPolys = [];
const open = pieces.map(p => ({ pts: p, tin: tOf(p[0]), tout: tOf(p.at(-1)) }));
const unused = new Set(open);
while (unused.size) {
  const start = unused.values().next().value;
  unused.delete(start);
  let poly = [...start.pts], cur = start;
  for (let guard = 0; guard < 50; guard++) {
    const t = cur.tout;
    let next = null, best = Infinity;
    for (const q of open) {
      if (q !== start && !unused.has(q)) continue;
      const d = ((q.tin - t) % 4 + 4) % 4;
      if (d < best) { best = d; next = q; }
    }
    for (let c = Math.ceil(t); c < t + best; c++) if (c > t) poly.push(corner(c));
    if (next === start) break;
    poly = poly.concat(next.pts); unused.delete(next); cur = next;
  }
  seaPolys.push(poly);
}

// ---------- strade, parchi, luoghi ----------
const ROAD = { motorway: 3, trunk: 3, primary: 2, secondary: 2, tertiary: 1, pedestrian: 1 };
const roads = [];
for (const w of ways.values()) {
  const k = w.tags.highway;
  if (!ROAD[k] || w.tags.area === 'yes' || w.tags.tunnel === 'yes') continue;
  if (k === 'pedestrian' && !w.tags.name) continue;
  for (const p of clipLine(pts(w.nds))) roads.push({ k: ROAD[k], name: w.tags.name || '', d: simplify(p, 0.8) });
}
// unisco per classe in un solo path per ridurre il peso
const roadPaths = [1, 2, 3].map(k => roads.filter(x => x.k === k).map(x => pathOf(x.d)).join(''));

// Vie da etichettare (si prende il tratto più lungo)
const LABEL_ROADS = ['Via Francesco Caracciolo', 'Via Partenope', 'Via Posillipo', 'Riviera di Chiaia', 'Via Coroglio', 'Via Nuova Bagnoli', 'Via Nazario Sauro', 'Via Orazio'];
const roadLabels = [];
for (const name of LABEL_ROADS) {
  const segs = roads.filter(x => x.name === name).map(x => x.d);
  if (!segs.length) continue;
  // concateno i tratti contigui per ottenere un percorso lungo
  const len = s => s.reduce((a, p, i) => i ? a + Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1]) : 0, 0);
  const best = segs.sort((a, b) => len(b) - len(a))[0];
  let line = best[0][0] > best.at(-1)[0] ? [...best].reverse() : best; // testo da sinistra a destra
  roadLabels.push({ name, d: pathOf(line), len: Math.round(len(line)) });
}

const parks = [];
for (const w of ways.values()) {
  const t = w.tags;
  if (!(t.leisure === 'park' || t.leisure === 'garden' && t.name || t.landuse === 'forest' || t.natural === 'wood' || t.natural === 'scrub' || t.landuse === 'grass' && t.name)) continue;
  if (w.nds[0] !== w.nds.at(-1)) continue;
  const poly = clipPoly(simplifyRing(pts(w.nds), 1.4));
  if (poly.length < 3) continue;
  const area = Math.abs(poly.reduce((a, p, i) => a + p[0] * poly[(i + 1) % poly.length][1] - poly[(i + 1) % poly.length][0] * p[1], 0) / 2);
  if (area < 160) continue;
  parks.push(pathOf(poly, true));
}

const beaches = [];
for (const w of ways.values()) {
  if (w.tags.natural !== 'beach' || w.nds[0] !== w.nds.at(-1)) continue;
  const poly = clipPoly(pts(w.nds));
  if (poly.length > 2) beaches.push(pathOf(simplifyRing(poly, 0.6), true));
}

// Moli e pontili (man_made=pier/breakwater come linee o aree)
const piers = [];
for (const w of ways.values()) {
  const m = w.tags.man_made;
  if (m !== 'pier' && m !== 'breakwater' && m !== 'groyne') continue;
  const line = pts(w.nds);
  if (w.nds[0] === w.nds.at(-1)) { const poly = clipPoly(line); if (poly.length > 2) piers.push({ a: 1, d: pathOf(simplifyRing(poly, 0.5), true) }); }
  else for (const p of clipLine(line)) piers.push({ a: 0, d: pathOf(simplify(p, 0.5)) });
}

// Nomi di quartiere (place=suburb/quarter/neighbourhood)
const WANT = ['Bagnoli', 'Posillipo', 'Mergellina', 'Chiaia', 'Vomero', 'Fuorigrotta', 'Santa Lucia', 'Coroglio', 'Marechiaro', 'Pizzofalcone', 'Arenella', 'San Ferdinando', 'San Lorenzo', 'Porto', 'Capodimonte'];
// Nome da mostrare, se diverso da quello di OpenStreetMap
const MOSTRA = { 'San Lorenzo': 'Centro storico' };
const places = [];
for (const n of nodes.values()) {
  const t = n.tags;
  if (!t.place || !WANT.includes(t.name)) continue;
  const [x, y] = proj(n.lat, n.lon);
  const name = MOSTRA[t.name] || t.name;
  if (inside([x, y]) && !places.some(p => p.name === name)) places.push({ name, x: r(x), y: r(y) });
}

const out = {
  fonte: 'OpenStreetMap (ODbL), dati scaricati il ' + new Date().toISOString().slice(0, 10),
  box: BOX, w: W, h: H, mPerUnit: M_PER_UNIT, lat0: LAT0,
  sea: seaPolys.map(p => pathOf(simplifyRing(p, 0.6), true)).join(''),
  islands: islands.map(p => pathOf(simplifyRing(p, 0.6), true)).join(''),
  roads: roadPaths,
  roadLabels,
  parks: parks.join(''),
  beaches: beaches.join(''),
  piers: { lines: piers.filter(p => !p.a).map(p => p.d).join(''), areas: piers.filter(p => p.a).map(p => p.d).join('') },
  places
};
fs.writeFileSync(new URL('../../src/data/mappa.json', import.meta.url), JSON.stringify(out));
console.log('mappa', W, 'x', H, 'mare', seaPolys.length, 'isole', islands.length, 'strade', roads.length, 'parchi', parks.length, 'luoghi', places.map(p => p.name).join(', '));
console.log('peso', (JSON.stringify(out).length / 1024).toFixed(1), 'KB');
