// Calcola i tempi tra le tappe degli itinerari, a piedi e con metro, funicolari, Cumana, autobus e ascensori pubblici.
// Scrive src/data/tempi-tappe.json: per ogni coppia di punti (le tappe in città e la fine dei percorsi a piedi)
// i minuti stimati, i metri a piedi, la salita e i mezzi usati, in due casi: giorno feriale e domenica pomeriggio.
// Uso: node scripts/itinerari/costruisci.mjs <cartella> [tappa1,tappa2 …]
//      (i dati si scaricano con scripts/itinerari/scarica.mjs; con le tappe stampa il percorso di quelle coppie)
//
// Come funziona, in breve:
// - a piedi: strade, piazze, scale e ascensori di OpenStreetMap. 4,5 km/h in piano; ogni 10 metri di salita
//   aggiungono 1 minuto (regola di Naismith); sulle scale si va più piano e anche la discesa costa un po';
// - le quote vengono dal modello Copernicus GLO-30, che però misura anche i tetti: per stare al livello della
//   strada prendo il valore basso dei dintorni (un quarto dei 25 punti vicini, circa 150 m per lato, è più basso) e lo addolcisco lungo
//   la strada; su ponti, gallerie, portici e passaggi coperti la quota va dritta da un capo all'altro;
// - mezzi: le linee di OpenStreetMap con attese e tempi delle fonti ufficiali (tabella LINEE); chi sale paga
//   l'attesa media (metà della frequenza) e il tempo per scendere ai binari o risalire in strada;
// - autobus: le linee della tabella BUS, con fermate, tempi e frequenze dall'orario programmato ANM (feed GTFS,
//   scripts/itinerari/gtfs.mjs); l'attesa è metà della frequenza a quella fermata, in quella fascia oraria.
//   Si va solo nel verso della corsa (le fermate dei due versi sono diverse).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { createHash } from 'node:crypto';
import { lineeBus } from './gtfs.mjs';

const RADICE = fileURLToPath(new URL('../../', import.meta.url));
const dir = process.argv[2];
if (!dir) throw new Error('Indica la cartella con osm.json e quote.json (scripts/itinerari/scarica.mjs)');
const COPPIE = process.argv[3] ? process.argv[3].split(';').map(c => c.split(',')) : [];

// ---------- Parametri del modello (spiegati nella pagina «Come calcoliamo i tempi») ----------
const PIEDI = {
  metriAlMinuto: 75,      // 4,5 km/h in piano
  salitaPerMinuto: 10,    // 1 minuto in più ogni 10 m di salita (Naismith)
  scale: 1.4,             // sulle scale si va più piano che in piano
  discesaScalePerMinuto: 30, // in discesa sulle scale: 1 minuto ogni 30 m
  sentiero: 1.15,         // sentieri e strade bianche
  ascensore: 1,           // minuti per ogni lato di un ascensore (attesa e corsa: 2 minuti)
  mobili: 40              // scale e tappeti mobili: metri al minuto, senza fatica
};

// Linee e tempi. Fonti: ANM (Linea 1: frequenza e velocità commerciale; funicolari: tempi e frequenze;
// ascensori: orari), Comune (Linea 6: 15 minuti da Mostra a Municipio, sabato e domenica solo fino alle 14:50),
// RFI e ViaggiaTreno (Linea 2: tempi tra le stazioni; un treno ogni 8 minuti nei feriali, 15 il sabato,
// 20 la domenica), Trenitalia (Linea 2 interrotta oltre Campi Flegrei),
// EAV (Cumana: tabellone delle partenze di Montesanto e Bagnoli del 2 ottobre 2026).
// accesso/uscita: minuti per scendere ai binari e per tornare in strada (stazioni profonde: di più).
// attesa: minuti per scenario (vedi SCENARI); null = la linea non c'è.
const ogni = (feriale, sabato, domenica, { l6 = false } = {}) => ({
  feriale, sabato, 'sabato-pomeriggio': l6 ? null : sabato, domenica, festivo: l6 ? null : domenica
});
const LINEE = [
  { id: 'L1', nome: 'Linea 1', rel: 2168102, ritorno: 386098, attesa: ogni(5, 5, 5), accesso: 3, uscita: 2, velocita: 533 /* 32 km/h */, raggio: 320 },
  { id: 'L6', nome: 'Linea 6', rel: 2168104, ritorno: 446007, attesa: ogni(7, 7, 7, { l6: true }), accesso: 2.5, uscita: 2, totale: 15, raggio: 260 },
  { id: 'L2', nome: 'Linea 2', rel: 2168103, ritorno: 445980, attesa: ogni(4, 8, 10), accesso: 1.5, uscita: 1.5, raggio: 200,
    // interrotta tra Campi Flegrei e Pozzuoli; Piazza Leopardi non è ancora una fermata confermata
    salta: ['Napoli Piazza Leopardi', 'Cavalleggeri Aosta', 'Napoli Cavalleggeri Aosta', 'Bagnoli-Agnano Terme', 'Pozzuoli'],
    tempi: { 'Napoli Mergellina|Napoli Piazza Amedeo': 4, 'Napoli Piazza Amedeo|Napoli Montesanto': 4, 'Napoli Montesanto|Napoli Piazza Cavour': 4, 'Napoli Piazza Cavour|Napoli Piazza Garibaldi': 5 }, velocita: 583 /* 35 km/h dove non c'è il tempo ufficiale */ },
  { id: 'FA', nome: 'Funicolare Centrale', rel: 2168320, ritorno: 1784870, attesa: ogni(5, 5, 5), accesso: 1, uscita: 1, totale: 5.75, raggio: 120 },
  { id: 'FB', nome: 'Funicolare di Chiaia', rel: 2168321, ritorno: 2168322, attesa: ogni(5, 5, 5), accesso: 1, uscita: 1, totale: 3.2, raggio: 120 },
  { id: 'FC', nome: 'Funicolare di Montesanto', rel: 2168324, ritorno: 2168325, chiusa: 'chiusa dal 15 maggio 2026 per circa 9 mesi', attesa: ogni(5, 5, 5), accesso: 1, uscita: 1, totale: 4.5, raggio: 120 },
  { id: 'FD', nome: 'Funicolare di Mergellina', rel: 1783329, ritorno: 2168323, attesa: ogni(5, 5, 5), accesso: 1, uscita: 1, totale: 7, raggio: 120 },
  { id: 'CU', nome: 'Cumana', rel: 2168312, ritorno: 2168313, attesa: ogni(7.5, 7.5, 7.5), accesso: 1.5, uscita: 1.5, totale: 16 /* Montesanto–Bagnoli */, finoA: 'Bagnoli', raggio: 160 }
];
// Autobus ANM (feed GTFS, licenza IODL 2.0). Solo le linee che accorciano almeno uno spostamento tra le tappe
// (prova del 03/10/2026, ricerca/2026-10-03-autobus-note/): per una tappa nuova lontana dalle altre, aggiungere qui
// la linea che la serve e rifare i tempi. Le fermate di queste linee, tutte, vanno in src/data/linee-bus.json.
// finestre: la fascia oraria di ogni scenario (minuti dalla mezzanotte) e i giorni da cui prendere l'orario tipico
// (0 = domenica); accesso: minuti per salire (pagare, timbrare); uscita: per scendere; raggio: metri dalla strada;
// preferenza: il bus si sceglie solo se fa risparmiare almeno tanti minuti (è meno puntuale di metro e piedi):
// pesa nella scelta del percorso, non nei minuti scritti.
const BUS = {
  linee: ['204', '140', 'C16', '151', 'R2', 'R7', '182', 'C31', '147', '168', 'C21', 'C1', 'C44'],
  finestre: {
    feriale: { giorni: [2, 3, 4], da: 9 * 60, a: 19 * 60 },
    sabato: { giorni: [6], da: 9 * 60, a: 14 * 60 + 50 },
    'sabato-pomeriggio': { giorni: [6], da: 14 * 60 + 50, a: 19 * 60 },
    domenica: { giorni: [0], da: 9 * 60, a: 14 * 60 },
    festivo: { giorni: [0], da: 14 * 60, a: 19 * 60 }
  },
  accesso: 1, uscita: 0.5, raggio: 80, preferenza: 5
};
// Ascensori pubblici gratuiti dell'ANM: la domenica e nei festivi chiudono alle 14:00
const ASCENSORI_FERIALI = /Su[^;]*?0?7:30-14:00|PH,Su 0?7:30-14:00/;

// ---------- Dati ----------
const osm = JSON.parse(fs.readFileSync(path.join(dir, 'osm.json'), 'utf8'));
const dem = JSON.parse(fs.readFileSync(path.join(dir, 'quote.json'), 'utf8'));
// i punti: le tappe in città e i locali di «Dove mangiare» (src/data/locali.yaml), che nel compositore sono tappe
const tappe = [
  ...yaml.load(fs.readFileSync(path.join(RADICE, 'src/data/tappe.yaml'), 'utf8')).filter(t => t.tipo === 'citta'),
  ...yaml.load(fs.readFileSync(path.join(RADICE, 'src/data/locali.yaml'), 'utf8')).map(l => ({ id: l.id, nome: l.nome, lat: l.lat, lon: l.lon }))
];

const nodi = new Map(), vie = [], rel = new Map();
for (const e of osm.elements) {
  if (e.type === 'node') {
    const prima = nodi.get(e.id);
    // lo stesso nodo arriva due volte (con e senza tag): tengo i tag
    nodi.set(e.id, { id: e.id, lat: e.lat, lon: e.lon, tags: e.tags || prima?.tags || {} });
  } else if (e.type === 'way') vie.push(e);
  else rel.set(e.id, e);
}

// ---------- Quote ----------
const Q = dem.quote, W = dem.w, H = dem.h;
// filtro delle quote: raggio in punti della griglia, percentile e media mobile lungo la strada (metri)
const RAGGIO = +(process.env.QUOTE_RAGGIO ?? 2), PERCENTILE = +(process.env.QUOTE_PERCENTILE ?? 0.25), MEDIA = +(process.env.QUOTE_MEDIA ?? 50);
const grezza = (i, j) => Q[Math.min(H - 1, Math.max(0, j)) * W + Math.min(W - 1, Math.max(0, i))];
// valore basso dei 25 punti vicini (25° percentile, circa 150 m per lato): toglie buona parte dei tetti
const filtrata = new Float32Array(W * H);
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const v = [];
  for (let dj = -RAGGIO; dj <= RAGGIO; dj++) for (let di = -RAGGIO; di <= RAGGIO; di++) v.push(grezza(i + di, j + dj));
  v.sort((a, b) => a - b);
  filtrata[j * W + i] = v[Math.floor(PERCENTILE * (v.length - 1))];
}
function quota(lat, lon) {
  const x = (lon - dem.lon0) / dem.dlon, y = (lat - dem.lat0) / dem.dlat;
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  const v = (a, b) => filtrata[Math.min(H - 1, Math.max(0, b)) * W + Math.min(W - 1, Math.max(0, a))];
  return (v(i, j) * (1 - fx) + v(i + 1, j) * fx) * (1 - fy) + (v(i, j + 1) * (1 - fx) + v(i + 1, j + 1) * fx) * fy;
}

// ---------- Grafo pedonale ----------
const PEDONALE = new Set(['footway', 'pedestrian', 'path', 'steps', 'living_street', 'residential', 'service', 'unclassified', 'tertiary', 'tertiary_link', 'secondary', 'secondary_link', 'primary', 'primary_link', 'track', 'corridor', 'cycleway', 'bridleway', 'road', 'platform', 'elevator']);
const SI = new Set(['yes', 'designated', 'permissive', 'destination']);
function percorribile(t) {
  const hw = t.highway;
  if (!hw) return false;
  // le superstrade solo se hanno il marciapiede o il permesso per i pedoni
  const superstrada = hw === 'trunk' || hw === 'trunk_link';
  if (!PEDONALE.has(hw) && !(superstrada && (SI.has(t.foot) || /both|left|right|yes|separate/.test(t.sidewalk || '')))) return false;
  if (t.foot === 'no') return false;
  if (['no', 'private'].includes(t.access) && !SI.has(t.foot)) return false;
  if (t.highway === 'cycleway' && t.foot !== 'yes' && t.foot !== 'designated') return false;
  if (t.area === 'yes' && !['pedestrian', 'footway', 'platform'].includes(t.highway)) return false;
  return true;
}
// Vie dove la quota del modello non vale (sopra o sotto il terreno, o sotto un tetto)
const sospesa = t => (t.bridge && t.bridge !== 'no') || (t.tunnel && t.tunnel !== 'no') || t.covered === 'yes' || t.indoor === 'yes' || +(t.layer || 0) < 0 || /^-/.test(t.level || '') || t.highway === 'elevator';
const dist = (a, b) => {
  const k = Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  return Math.hypot((a.lat - b.lat) * 111195, (a.lon - b.lon) * 111195 * k);
};

const pedonali = vie.filter(v => v.tags && percorribile(v.tags));
const ascensori = new Map(); // id nodo -> { nome, chiudeDomenica }
for (const n of nodi.values()) if (n.tags.highway === 'elevator') ascensori.set(n.id, { nome: n.tags.name || '', chiudeDomenica: ASCENSORI_FERIALI.test(n.tags.opening_hours || ''), fee: n.tags.fee === 'yes' });
// Nodi «a terra»: stanno su almeno una via normale, la loro quota viene dal modello.
// Un ascensore collega due livelli nello stesso punto: la sua quota non si usa
const aTerra = new Set();
for (const v of pedonali) if (!sospesa(v.tags)) for (const n of v.nodes) if (!ascensori.has(n)) aTerra.add(n);
const quotaNodo = new Map();
const quotaDi = id => {
  if (!quotaNodo.has(id)) { const n = nodi.get(id); quotaNodo.set(id, quota(n.lat, n.lon)); }
  return quotaNodo.get(id);
};

const adj = new Map();   // id nodo -> [{ a, t, m, su, tipo, via }]
const archi = (id) => { if (!adj.has(id)) adj.set(id, []); return adj.get(id); };

let nArchi = 0;
for (const v of pedonali) {
  const t = v.tags;
  const pts = v.nodes.map(id => nodi.get(id)).filter(Boolean);
  if (pts.length < 2) continue;
  // profilo delle quote lungo la via
  const lung = [0];
  for (let i = 1; i < pts.length; i++) lung.push(lung[i - 1] + dist(pts[i - 1], pts[i]));
  let h = pts.map(p => quotaDi(p.id));
  if (sospesa(t)) {
    // quota dritta tra i nodi a terra; prima del primo e dopo l'ultimo resta in piano
    // (se nessun nodo è a terra uso i due capi)
    const fissi = pts.map((p, i) => aTerra.has(p.id) ? i : -1).filter(i => i >= 0);
    if (fissi.length === 0) fissi.push(0, pts.length - 1);
    const h2 = h.slice();
    for (let i = 0; i < fissi[0]; i++) h2[i] = h[fissi[0]];
    for (let i = fissi[fissi.length - 1] + 1; i < pts.length; i++) h2[i] = h[fissi[fissi.length - 1]];
    for (let k = 0; k < fissi.length - 1; k++) {
      const a = fissi[k], b = fissi[k + 1];
      for (let i = a + 1; i < b; i++) h2[i] = h[a] + (h[b] - h[a]) * (lung[i] - lung[a]) / (lung[b] - lung[a] || 1);
    }
    h = h2;
  } else if (lung[lung.length - 1] > 40) {
    // media mobile su ±50 m: toglie il rumore del modello lungo la strada (i capi restano uguali)
    const h2 = h.slice();
    for (let i = 1; i < pts.length - 1; i++) {
      let s = 0, n = 0;
      for (let k = 0; k < pts.length; k++) if (Math.abs(lung[k] - lung[i]) <= MEDIA) { s += h[k]; n++; }
      h2[i] = s / n;
    }
    h = h2;
  }
  // all'ascensore la via resta in piano: la salita la fa l'ascensore
  pts.forEach((p, i) => { if (ascensori.has(p.id) && pts.length > 1) h[i] = h[i === 0 ? 1 : i - 1]; });
  const scale = t.highway === 'steps';
  const mobili = scale && t.conveying && t.conveying !== 'no';
  const versoMobili = t.conveying === 'forward' ? 1 : t.conveying === 'backward' ? -1 : 0;
  const fattore = scale ? PIEDI.scale : ['path', 'track', 'bridleway'].includes(t.highway) ? PIEDI.sentiero : 1;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], m = lung[i + 1] - lung[i];
    const dh = h[i + 1] - h[i];
    for (const [da, verso, d] of [[a, 1, dh], [b, -1, -dh]]) {
      const ad = da === a ? b : a;
      let tempo;
      if (t.highway === 'elevator') tempo = PIEDI.ascensore * 2;
      else if (mobili) {
        if (versoMobili && verso !== versoMobili) continue;   // contro il verso delle scale mobili non si passa
        tempo = m / PIEDI.mobili;
      } else {
        tempo = m / PIEDI.metriAlMinuto * fattore + Math.max(0, d) / PIEDI.salitaPerMinuto + (scale ? Math.max(0, -d) / PIEDI.discesaScalePerMinuto : 0);
      }
      archi(da.id).push({ a: ad.id, t: tempo, m, su: mobili || t.highway === 'elevator' ? 0 : Math.max(0, d), tipo: 'piedi', via: v.id });
      nArchi++;
    }
  }
}
console.log(`Grafo a piedi: ${adj.size} nodi, ${nArchi} archi, ${ascensori.size} ascensori`);

// Nodo del grafo più vicino a un punto (solo nodi a terra, per non agganciarsi a gallerie o binari)
const nodiGrafo = [...adj.keys()].map(id => nodi.get(id));
const CELLA = 0.002; const griglia = new Map();
for (const n of nodiGrafo) {
  const k = `${Math.floor(n.lat / CELLA)}:${Math.floor(n.lon / CELLA)}`;
  if (!griglia.has(k)) griglia.set(k, []);
  griglia.get(k).push(n);
}
function vicino(p, maxM = 150, filtro = () => true) {
  const ci = Math.floor(p.lat / CELLA), cj = Math.floor(p.lon / CELLA);
  let best = null, bd = Infinity;
  for (let di = -2; di <= 2; di++) for (let dj = -2; dj <= 2; dj++) for (const n of griglia.get(`${ci + di}:${cj + dj}`) || []) {
    if (!filtro(n)) continue;
    const d = dist(p, n);
    if (d < bd) { bd = d; best = n; }
  }
  return bd <= maxM ? { nodo: best, m: bd } : null;
}

// ---------- Linee ----------
// Componente connessa più grande: le stazioni si agganciano solo lì (niente cortili isolati)
const comp = new Map(); let maxComp = -1, maxSize = 0;
{
  let c = 0;
  for (const id of adj.keys()) {
    if (comp.has(id)) continue;
    const coda = [id]; comp.set(id, c); let size = 0;
    while (coda.length) { const x = coda.pop(); size++; for (const e of adj.get(x) || []) if (!comp.has(e.a)) { comp.set(e.a, c); coda.push(e.a); } }
    if (size > maxSize) { maxSize = size; maxComp = c; }
    c++;
  }
}
const principale = n => comp.get(n.id) === maxComp && aTerra.has(n.id);
const entrate = [...nodi.values()].filter(n => /subway_entrance|train_station_entrance/.test(n.tags.railway || '') || (n.tags.entrance && n.tags.railway));
const fermate = [];  // { id, linea, nome, lat, lon, accessi: [{ nodo, m }] }
const corse = [];    // archi tra fermate
const stazioni = [...nodi.values()].filter(n => (n.tags.railway === 'station' || n.tags.railway === 'halt' || n.tags.public_transport === 'station') && n.tags.name);
for (const L of LINEE) {
  // le fermate di una relazione e, se mancano, quelle della relazione nel verso opposto
  const fermateDi = id => {
    const r = rel.get(id);
    if (!r) throw new Error(`Relazione ${id} (${L.nome}) mancante nei dati OSM`);
    return r.members.filter(m => /^stop/.test(m.role) && m.type === 'node').map(m => nodi.get(m.ref)).filter(Boolean).map(n => {
      // nome della fermata: il nodo della fermata o la stazione più vicina
      let nome = n.tags.name;
      if (!nome) { let bd = Infinity; for (const s of stazioni) { const d = dist(n, s); if (d < bd) { bd = d; nome = s.tags.name; } } }
      return { ...n, nome };
    });
  };
  let st = fermateDi(L.rel);
  for (const altra of L.ritorno ? fermateDi(L.ritorno) : []) {
    if (st.some(s => s.nome === altra.nome || dist(s, altra) < 40)) continue;
    // la metto dove allunga meno il percorso (in testa, in coda o tra due fermate)
    let best = 0, bd = Infinity;
    for (let k = 0; k <= st.length; k++) {
      const a = st[k - 1], b = st[k];
      const extra = (a ? dist(a, altra) : 0) + (b ? dist(altra, b) : 0) - (a && b ? dist(a, b) : 0);
      if (extra < bd) { bd = extra; best = k; }
    }
    st.splice(best, 0, altra);
  }
  st = st.filter(s => !(L.salta || []).includes(s.nome));
  if (L.finoA) { const k = st.findIndex(s => s.nome.includes(L.finoA)); if (k >= 0) st = st.slice(0, k + 1); }
  L.fermate = st.map(s => s.nome);
  if (L.chiusa) { console.log(`${L.nome}: ${L.chiusa}, non la uso`); continue; }
  const lungTot = st.slice(1).reduce((s, x, i) => s + dist(st[i], x), 0);
  st.forEach((s, i) => {
    const f = { id: `${L.id}:${i}`, linea: L.id, nome: s.nome, lat: s.lat, lon: s.lon, accessi: [] };
    // ingressi della stazione vicini, altrimenti il punto della strada più vicino
    for (const e of entrate) {
      if (dist(e, s) > L.raggio) continue;
      const v = adj.has(e.id) && principale(e) ? { nodo: e, m: 0 } : vicino(e, 60, principale);
      if (v) f.accessi.push(v);
    }
    if (!f.accessi.length) { const v = vicino(s, 220, principale); if (v) f.accessi.push(v); }
    if (!f.accessi.length) console.log(`  ! ${L.nome}, ${s.nome}: nessun accesso dalla strada`);
    fermate.push(f);
    if (process.env.DEBUG_FERMATE) console.log(`   ${L.id} ${s.nome}: ${f.accessi.length} accessi, ${f.accessi.map(a => Math.round(a.m) + "m@" + Math.round(dist(a.nodo, s)) + "m").join(" ")}`);
    if (i > 0) {
      const prev = st[i - 1], d = dist(prev, s);
      let tempo;
      if (L.tempi) tempo = L.tempi[`${prev.nome}|${s.nome}`] ?? L.tempi[`${s.nome}|${prev.nome}`] ?? (d * 1.1 / L.velocita + 1);
      else if (L.totale) tempo = L.totale * d / lungTot;
      else tempo = d * 1.15 / L.velocita;
      corse.push({ da: `${L.id}:${i - 1}`, a: `${L.id}:${i}`, t: tempo, linea: L.id });
    }
  });
  console.log(`${L.nome}: ${st.length} fermate (${st.map(s => s.nome).join(', ')})`);
}

// Autobus: una fermata del grafo per ogni linea e fermata ANM, con l'attesa di ogni scenario
const busFile = path.join(dir, 'anm-gtfs.zip');
if (!fs.existsSync(busFile)) throw new Error(`Manca ${busFile}: scaricalo con scripts/itinerari/scarica.mjs`);
const GTFS = lineeBus(busFile, BUS);
console.log(`\nAutobus ANM: orario dal ${GTFS.feed.dal} al ${GTFS.feed.al}; giorni tipici ${Object.entries(GTFS.date).map(([k, v]) => `${k} ${v}`).join(', ')}`);
const fuori = new Map();   // fermate senza strada vicina (fuori dal riquadro): ci si passa sopra, non si scende
const BUSLINEE = GTFS.linee.map(B => {
  const L = { id: B.id, nome: B.nome, tipo: B.tipo, accesso: BUS.accesso, uscita: BUS.uscita, bus: true, fermate: [] };
  // una fermata del grafo per direzione: «linea:direzione:stop»
  const serve = new Set(B.archi.flatMap(a => [`${a.dir}|${a.da}`, `${a.dir}|${a.a}`]));
  let senza = 0;
  for (const ds of serve) {
    const [dir, sid] = ds.split('|');
    const s = B.fermate.get(sid);
    const attesa = {};
    for (const sc of Object.keys(BUS.finestre)) {
      const n = B.passaggi[sc][ds] || 0, f = BUS.finestre[sc];
      attesa[sc] = n ? (f.a - f.da) / n / 2 : null;
    }
    const v = vicino(s, BUS.raggio, principale);
    if (!v) { senza++; fuori.set(`${B.id}:${dir}:${sid}`, { lat: s.lat, lon: s.lon }); continue; }
    fermate.push({ id: `${B.id}:${dir}:${sid}`, linea: B.id, nome: s.nome, lat: s.lat, lon: s.lon, accessi: [v], attesa });
    L.fermate.push(s.nome);
  }
  for (const a of B.archi) corse.push({ da: `${B.id}:${a.dir}:${a.da}`, a: `${B.id}:${a.dir}:${a.a}`, t: a.tempi, linea: B.id, unVerso: true, punti: a.punti });
  const ogni = Object.values(B.passaggi.feriale);
  console.log(`${B.nome}: ${serve.size} fermate${senza ? ` (${senza} lontane dalle strade del riquadro, escluse)` : ''}, al massimo ${Math.max(...ogni)} corse tra le 9 e le 19 a una fermata`);
  return L;
});
const MEZZI = new Map([...LINEE, ...BUSLINEE].map(L => [L.id, L]));
const perId = new Map([...fuori, ...fermate.map(f => [f.id, f])]);

// ---------- Ricerca dei percorsi (Dijkstra) ----------
class Heap {
  constructor() { this.a = []; }
  push(x) { const a = this.a; a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; }
  get size() { return this.a.length; }
}

// Tre modi di usare gli autobus (per gli orari veri della pagina, specifiche/bus-orari-veri.md):
// «media»: attesa media e preferenza (i tempi di sempre); «senza»: niente bus; «subito»: il bus arriva appena
// sei alla fermata e senza preferenza, e il percorso DEVE usare almeno un bus (grafo a due strati: prima e dopo
// essere saliti). La pagina valuta i percorsi «media» e «subito» con le partenze vere e li confronta con «senza».
const strato1 = id => (typeof id === 'number' ? -id : '^' + id);
const base = id => (typeof id === 'number' ? Math.abs(id) : id[0] === '^' ? id.slice(1) : id);
const inStrato1 = id => (typeof id === 'number' ? id < 0 : id[0] === '^');

function rete(scenario, modo = 'media') {
  // archi aggiuntivi dei mezzi per lo scenario; gli ascensori chiusi tolgono i loro archi
  const extra = new Map();
  const add = (da, e) => { if (!extra.has(da)) extra.set(da, []); extra.get(da).push(e); };
  if (scenario.mezzi) {
    for (const f of fermate) {
      const L = MEZZI.get(f.linea);
      if (L.bus && modo === 'senza') continue;
      let attesa = (f.attesa || L.attesa)[scenario.nome];
      if (attesa == null) continue;    // linea ferma in questo scenario
      if (L.bus && modo === 'subito') attesa = 0;
      const pen = L.bus && modo === 'media' ? BUS.preferenza : 0;
      for (const ac of f.accessi) {
        add(ac.nodo.id, { a: f.id, t: ac.m / PIEDI.metriAlMinuto + L.accesso + attesa + pen, m: ac.m, su: 0, tipo: 'sale', linea: L.id, ...(pen ? { pen } : {}) });
        add(f.id, { a: ac.nodo.id, t: ac.m / PIEDI.metriAlMinuto + L.uscita, m: ac.m, su: 0, tipo: 'scende', linea: L.id });
      }
    }
    for (const c of corse) {
      const L = MEZZI.get(c.linea);
      if (L.bus && modo === 'senza') continue;
      const t = typeof c.t === 'object' ? c.t[scenario.nome] : L.attesa[scenario.nome] == null ? null : c.t;
      if (t == null) continue;
      add(c.da, { a: c.a, t, m: 0, su: 0, tipo: 'corsa', linea: c.linea, punti: c.punti });
      if (!c.unVerso) add(c.a, { a: c.da, t, m: 0, su: 0, tipo: 'corsa', linea: c.linea });
    }
  }
  const chiusi = new Set([...ascensori].filter(([, x]) => scenario.nome === 'festivo' && x.chiudeDomenica).map(([id]) => id));
  const accantoChiusi = new Set();
  for (const id of chiusi) for (const e of adj.get(id) || []) accantoChiusi.add(e.a);
  const VUOTO = [];
  // uscendo da un ascensore si pagano attesa e corsa (2 minuti)
  const conAscensore = new Map();
  for (const id of ascensori.keys()) if (adj.has(id)) conAscensore.set(id, adj.get(id).map(e => ({ ...e, t: e.t + PIEDI.ascensore * 2, asc: id })));
  const vicini = id => {
    if (chiusi.has(id)) return VUOTO;
    let lista = conAscensore.get(id) || adj.get(id) || VUOTO;
    if (accantoChiusi.has(id)) lista = lista.filter(e => !chiusi.has(e.a));
    const ex = extra.get(id);
    return ex ? lista.concat(ex) : lista;
  };
  if (modo !== 'subito') return vicini;
  // due strati: salendo su un bus si passa al secondo e non si torna indietro; le tappe d'arrivo si cercano lì
  const memo0 = new Map(), memo1 = new Map();
  return id => {
    const su = inStrato1(id), b = base(id), memo = su ? memo1 : memo0;
    let out = memo.get(b);
    if (!out) {
      out = vicini(b).map(e => (su || (e.tipo === 'sale' && MEZZI.get(e.linea).bus) ? { ...e, a: strato1(e.a) } : e));
      memo.set(b, out);
    }
    return out;
  };
}

function dijkstra(sorgente, vicini) {
  const tempo = new Map([[sorgente, 0]]), prec = new Map(), h = new Heap();
  h.push([0, sorgente]);
  while (h.size) {
    const [t, x] = h.pop();
    if (t > tempo.get(x)) continue;
    for (const e of vicini(x)) {
      const nt = t + e.t;
      if (nt < (tempo.get(e.a) ?? Infinity)) { tempo.set(e.a, nt); prec.set(e.a, { da: x, e }); h.push([nt, e.a]); }
    }
  }
  return { tempo, prec };
}

function percorso(r, destinazione) {
  const tratti = [], dove = [destinazione];
  for (let x = destinazione; r.prec.has(x); x = r.prec.get(x).da) { tratti.push(r.prec.get(x).e); dove.push(r.prec.get(x).da); }
  tratti.reverse(); dove.reverse();
  let m = 0, su = 0, pen = 0; const mezzi = [], passi = [];
  for (const e of tratti) {
    m += e.m; su += e.su; pen += e.pen || 0;
    if (e.tipo === 'corsa' && mezzi[mezzi.length - 1] !== e.linea) mezzi.push(e.linea);
    if (e.asc && ascensori.get(e.asc)?.nome && !passi.includes(ascensori.get(e.asc).nome)) passi.push(ascensori.get(e.asc).nome);
  }
  // il disegno del percorso, a pezzi: a piedi o sulla linea (per le mappe dei bozzetti e del blocco 2)
  const posizione = id => nodi.get(base(id)) || perId.get(base(id));
  const pezzi = [];
  tratti.forEach((e, k) => {
    const modo = e.tipo === 'corsa' ? e.linea : e.tipo === 'piedi' ? 'piedi' : null;
    if (!modo) return;   // salire e scendere: restano nel punto della stazione
    const a = posizione(dove[k]), b = posizione(dove[k + 1]);
    let ultimo = pezzi[pezzi.length - 1];
    if (!ultimo || ultimo.modo !== modo) { ultimo = { modo, punti: [[+a.lat.toFixed(6), +a.lon.toFixed(6)]] }; pezzi.push(ultimo); }
    if (e.punti) ultimo.punti.push(...e.punti);   // autobus: il percorso della linea tra le due fermate
    ultimo.punti.push([+b.lat.toFixed(6), +b.lon.toFixed(6)]);
  });
  // i pezzi per gli orari veri: minuti fissi (a piedi, metro con l'attesa media…) e corse in bus
  // «linea|fermata di salita|fermata di discesa», il cui tempo la pagina prende dalle partenze
  const fermataDi = id => { const x = base(id); return x.slice(x.lastIndexOf(':') + 1); };
  const seg = []; let fisso = 0, bus = false;
  tratti.forEach((e, k) => {
    const L = e.linea && MEZZI.get(e.linea);
    if (L?.bus && e.tipo === 'sale') { seg.push(+(fisso + e.m / PIEDI.metriAlMinuto + BUS.accesso).toFixed(2), `${e.linea}|${fermataDi(dove[k + 1])}`); fisso = 0; bus = true; }
    else if (L?.bus && e.tipo === 'corsa') { /* il tempo viene dalle partenze */ }
    else if (L?.bus && e.tipo === 'scende') { seg[seg.length - 1] += `|${fermataDi(dove[k])}`; fisso = e.t; }
    else fisso += e.t;
  });
  seg.push(+fisso.toFixed(2));
  return { m, su, pen, mezzi, ascensori: passi, tratti, pezzi, seg: bus ? seg : null };
}

// ---------- Punti delle tappe ----------
// Ogni punto si aggancia al tratto di strada più vicino (non solo all'incrocio più vicino): nasce un nodo
// nuovo sul tratto, collegato ai due capi con una parte proporzionale del tempo; in più i metri tra la strada
// e il punto della tappa.
function aggancia(p, maxM) {
  const ci = Math.floor(p.lat / CELLA), cj = Math.floor(p.lon / CELLA);
  const k = Math.cos(p.lat * Math.PI / 180);
  let best = null;
  for (let di = -2; di <= 2; di++) for (let dj = -2; dj <= 2; dj++) for (const a of griglia.get(`${ci + di}:${cj + dj}`) || []) {
    if (!principale(a)) continue;
    for (const e of adj.get(a.id) || []) {
      const b = nodi.get(e.a);
      if (!b || !principale(b) || e.tipo !== 'piedi') continue;
      const ritorno = (adj.get(b.id) || []).find(x => x.a === a.id && x.via === e.via);
      if (!ritorno) continue;   // tratti a senso unico (scale mobili): no
      // proiezione del punto sul segmento, in metri
      const ax = 0, ay = 0, bx = (b.lon - a.lon) * 111195 * k, by = (b.lat - a.lat) * 111195;
      const px = (p.lon - a.lon) * 111195 * k, py = (p.lat - a.lat) * 111195;
      const l2 = bx * bx + by * by;
      const f = l2 ? Math.max(0, Math.min(1, (px * bx + py * by) / l2)) : 0;
      const d = Math.hypot(px - (ax + f * bx), py - (ay + f * by));
      if (!best || d < best.d) best = { a, b, e, ritorno, f, d };
    }
  }
  return best && best.d <= maxM ? best : null;
}
const punti = [];
for (const t of tappe) {
  for (const [id, p, nome] of [[t.id, t, t.nome], ...(t.fine ? [[`${t.id}>`, t.fine, `${t.nome} (fine: ${t.fine.nome})`]] : [])]) {
    const g = aggancia(p, 250);
    if (!g) throw new Error(`Tappa ${id}: nessuna strada a meno di 250 m`);
    const nodo = `T:${id}`, extra = g.d / PIEDI.metriAlMinuto;
    nodi.set(nodo, { id: nodo, lat: g.a.lat + (g.b.lat - g.a.lat) * g.f, lon: g.a.lon + (g.b.lon - g.a.lon) * g.f, tags: {} });
    const parte = (e, q) => ({ t: e.t * q + extra, m: e.m * q + g.d, su: e.su * q, tipo: 'piedi', via: e.via });
    adj.set(nodo, [{ a: g.b.id, ...parte(g.e, 1 - g.f) }, { a: g.a.id, ...parte(g.ritorno, g.f) }]);
    adj.get(g.a.id).push({ a: nodo, ...parte(g.e, g.f) });
    adj.get(g.b.id).push({ a: nodo, ...parte(g.ritorno, 1 - g.f) });
    const via = vie.find(v => v.id === g.e.via)?.tags;
    punti.push({ id, nome, nodo, aggancio: Math.round(g.d), strada: via?.name || via?.highway, quota: Math.round(quotaDi(g.a.id)) });
    if (g.d > 60) console.log(`  ! ${id}: la strada più vicina è a ${Math.round(g.d)} m (${via?.name || via?.highway})`);
  }
}
console.log(`\nPunti: ${punti.length}`);
for (const p of punti) console.log(`  ${p.id.padEnd(22)} ${String(p.aggancio).padStart(3)} m da ${p.strada || '?'} · quota ${p.quota} m`);

// La pagina degli itinerari sceglie lo scenario dal giorno della settimana e dall'ora di ogni spostamento
// (src/lib/itinerari/calcolo.ts); senza data usa il giorno feriale.
const SCENARI = [
  { nome: 'feriale', mezzi: true, descrizione: 'giorno feriale, di giorno: tutte le linee aperte' },
  { nome: 'sabato', mezzi: true, descrizione: 'sabato fino alle 14:50: Linea 2 ogni 15 minuti' },
  { nome: 'sabato-pomeriggio', mezzi: true, descrizione: 'sabato dopo le 14:50: Linea 6 ferma, Linea 2 ogni 15 minuti' },
  { nome: 'domenica', mezzi: true, descrizione: 'domenica e festivi fino alle 14: Linea 2 ogni 20 minuti' },
  { nome: 'festivo', mezzi: true, descrizione: 'domenica e festivi dopo le 14: Linea 6 ferma, ascensori gratuiti chiusi, Linea 2 ogni 20 minuti' },
  { nome: 'piedi', mezzi: false, descrizione: 'solo a piedi' }
];
// impronta delle posizioni: la build (src/lib/tappe.ts) controlla che i tempi siano stati fatti con le tappe di oggi
const firma = createHash('sha1').update(JSON.stringify([...tappe].sort((a, b) => a.id.localeCompare(b.id)).map(t => [t.id, t.lat, t.lon, t.fine ? [t.fine.lat, t.fine.lon] : null]))).digest('hex').slice(0, 12);
const uscita = { generato: new Date().toISOString().slice(0, 10), firma, dati: { osm: osm.osm3s?.timestamp_osm_base, quote: 'Copernicus GLO-30', bus: { fonte: 'ANM, feed GTFS (IODL 2.0)', dal: GTFS.feed.dal, al: GTFS.feed.al, giorni: GTFS.date, preferenza: BUS.preferenza, accesso: BUS.accesso } }, parametri: PIEDI, linee: [...LINEE, ...BUSLINEE].map(({ id, nome, tipo, chiusa, fermate }) => ({ id, nome, ...(tipo ? { tipo } : {}), ...(chiusa ? { chiusa } : {}), fermate })), punti: punti.map(p => p.id), scenari: {} };
const rapporto = [];
const disegni = {};   // scenario -> righe di punti -> pezzi del percorso (per la mappa degli itinerari)
const disegniSenza = {};
// Le strade con il bus da valutare con le partenze vere (la pagina le ritrova per indice): pezzi, metri, mezzi, disegno
const candidati = [], indiceCandidato = new Map();
const mezziDi = p => [...p.mezzi, ...p.ascensori.map(n => 'asc:' + n)].join('+');
function candidato(p) {
  const k = JSON.stringify(p.seg);
  if (!indiceCandidato.has(k)) { indiceCandidato.set(k, candidati.length); candidati.push({ seg: p.seg, m: Math.round(p.m / 10) * 10, mezzi: mezziDi(p), pezzi: p.pezzi }); }
  return indiceCandidato.get(k);
}
for (const sc of SCENARI) {
  const vicini = rete(sc);
  const conBus = sc.mezzi;   // gli scenari con i mezzi hanno anche i bus
  const vSenza = conBus ? rete(sc, 'senza') : null, vSubito = conBus ? rete(sc, 'subito') : null;
  const min = [], piedi = [], salita = [], mezzi = [];
  const sMin = [], sPiedi = [], sMezzi = [], bus = [];
  disegni[sc.nome] = [];
  if (conBus) disegniSenza[sc.nome] = [];
  for (const a of punti) {
    const r = dijkstra(a.nodo, vicini);
    const rS = conBus ? dijkstra(a.nodo, vSenza) : null, rZ = conBus ? dijkstra(a.nodo, vSubito) : null;
    const rm = [], rp = [], rs = [], rz = [], rd = [];
    const sm = [], sp = [], sz = [], sd = [], rb = [];
    disegni[sc.nome].push(rd);
    if (conBus) { disegniSenza[sc.nome].push(sd); sMin.push(sm); sPiedi.push(sp); sMezzi.push(sz); bus.push(rb); }
    for (const b of punti) {
      if (a === b) { rm.push(0); rp.push(0); rs.push(0); rz.push(''); rd.push(null); if (conBus) { sm.push(0); sp.push(0); sz.push(''); sd.push(null); rb.push(0); } continue; }
      const costo = r.tempo.get(b.nodo);
      if (costo == null) throw new Error(`Nessun percorso da ${a.id} a ${b.id} (${sc.nome})`);
      const p = percorso(r, b.nodo);
      const t = costo - p.pen;   // i minuti veri, senza il peso che serve solo a scegliere
      rd.push(p.pezzi);
      rm.push(Math.round(t)); rp.push(Math.round(p.m / 10) * 10); rs.push(Math.round(p.su)); rz.push([...p.mezzi, ...p.ascensori.map(n => 'asc:' + n)].join('+'));
      if (COPPIE.some(([x, y]) => x === a.id && y === b.id)) rapporto.push({ scenario: sc.nome, da: a.id, a: b.id, min: t, ...p, linea: dist(nodi.get(a.nodo), nodi.get(b.nodo)) });
      if (!conBus) continue;
      // senza bus
      const ps = percorso(rS, b.nodo), ts = rS.tempo.get(b.nodo);
      sm.push(Math.round(ts)); sp.push(Math.round(ps.m / 10) * 10); sz.push(mezziDi(ps)); sd.push(ps.pezzi);
      // con il bus: il percorso di sempre, se usa il bus, e quello «bus subito», se può battere la strada senza bus
      const c = [];
      if (p.seg) c.push(candidato(p));
      const tz = rZ.tempo.get(strato1(b.nodo));
      if (tz != null && tz <= ts - BUS.preferenza) {   // anche con il bus subito deve far risparmiare abbastanza
        const pz = percorso(rZ, strato1(b.nodo));
        if (pz.seg) { const k = candidato(pz); if (!c.includes(k)) c.push(k); }
      }
      rb.push(c.length ? c : 0);
    }
    min.push(rm); piedi.push(rp); salita.push(rs); mezzi.push(rz);
  }
  uscita.scenari[sc.nome] = { descrizione: sc.descrizione, min, piedi, salita, ...(sc.mezzi ? { mezzi } : {}), ...(conBus ? { senza: { min: sMin, piedi: sPiedi, mezzi: sMezzi }, bus } : {}) };
  console.log(`Scenario ${sc.nome}: fatto`);
}
// Le partenze vere delle corse in bus usate da quelle strade (src/data/partenze-bus.json, pagina /napoli/itinerari/partenze.json)
const chiaviBus = new Set(candidati.flatMap(c => c.seg.filter(x => typeof x === 'string')));
const PARTENZE = GTFS.partenze(chiaviBus);
// le strade con una corsa che nessun bus fa davvero, in nessun giorno del feed, non si propongono
{
  const servite = new Set(PARTENZE.tipi.flatMap(t => Object.keys(t.viaggi)));
  const buona = candidati.map(c => c.seg.every(x => typeof x !== 'string' || servite.has(x)));
  let tolte = 0;
  for (const S of Object.values(uscita.scenari)) {
    if (!S.bus) continue;
    S.bus = S.bus.map(r => r.map(c => { if (!c) return c; const ok = c.filter(k => buona[k]); tolte += c.length - ok.length; return ok.length ? ok : 0; }));
  }
  if (tolte) console.log(`Strade con il bus tolte perché nessuna corsa le fa: ${tolte}`);
}
uscita.candidati = candidati.map(({ seg, m, mezzi }) => ({ seg, m, mezzi }));
console.log(`Strade con il bus da valutare con le partenze vere: ${candidati.length}`);
fs.writeFileSync(path.join(RADICE, 'src/data/tempi-tappe.json'), JSON.stringify(uscita) + '\n');
console.log(`Scritto src/data/tempi-tappe.json (${punti.length} punti)`);
fs.writeFileSync(path.join(RADICE, 'src/data/partenze-bus.json'), JSON.stringify({ generato: uscita.generato, firma, fonte: 'ANM, feed GTFS (IODL 2.0)', ...PARTENZE }) + '\n');
console.log(`Scritto src/data/partenze-bus.json: ${chiaviBus.size} corse, ${PARTENZE.tipi.length} tipi di giorno, ${Math.round(JSON.stringify(PARTENZE).length / 1024)} kB`);

// Tutte le fermate delle linee bus (anche quelle lontane dalle tappe di oggi), con la frequenza di ogni scenario
// al capolinea di partenza: servono per le tappe e i locali che verranno (la fermata più vicina). La pagina non le usa.
{
  const ogni = (B, d) => Object.fromEntries(Object.entries(BUS.finestre).map(([sc, f]) => {
    const n = B.passaggi[sc][`${d.verso}|${d.fermate[0].id}`] || 0;
    return [sc, n ? Math.round((f.a - f.da) / n) : null];
  }));
  const file = {
    generato: uscita.generato, fonte: 'ANM, feed GTFS https://www.anm.it/google/google-transit.zip (licenza IODL 2.0)',
    dal: GTFS.feed.dal, al: GTFS.feed.al, giorni: GTFS.date, fasce: BUS.finestre,
    nota: 'ogni: minuti tra due corse in partenza dal primo capolinea della direzione, nella fascia dello scenario (orario programmato)',
    linee: GTFS.linee.map(B => ({ id: B.id, nome: B.nome, tipo: B.tipo, direzioni: B.direzioni.map(d => ({ ...d, ogni: ogni(B, d) })) }))
  };
  fs.writeFileSync(path.join(RADICE, 'src/data/linee-bus.json'), JSON.stringify(file, null, 1) + '\n');
  console.log(`Scritto src/data/linee-bus.json (${GTFS.linee.length} linee)`);
}

// ---------- Disegno dei percorsi per la mappa degli itinerari ----------
// src/data/percorsi-tappe.json: per ogni coppia di punti il percorso, a pezzi (a piedi o su una linea),
// nelle unità di src/data/mappa.json (5 m). I punti sono semplificati (Douglas-Peucker, scarto massimo
// SCARTO unità) e scritti come differenze dal punto prima, con 6 bit per carattere: la pagina li carica
// solo quando apri la mappa. Per gli scenari diversi dal giorno feriale si salva solo ciò che cambia.
{
  const M = JSON.parse(fs.readFileSync(path.join(RADICE, 'src/data/mappa.json'), 'utf8'));
  const KX = M.w / (M.box.e - M.box.w), KY = M.h / (M.box.n - M.box.s);
  const SCARTO = 0.8;
  const xy = ([lat, lon]) => [(lon - M.box.w) * KX, (M.box.n - lat) * KY];
  const semplifica = (pts) => {
    if (pts.length < 3) return pts;
    const tieni = new Uint8Array(pts.length); tieni[0] = tieni[pts.length - 1] = 1;
    const pila = [[0, pts.length - 1]];
    while (pila.length) {
      const [i, j] = pila.pop();
      const [ax, ay] = pts[i], [bx, by] = pts[j], dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1;
      let k = -1, dmax = 0;
      for (let q = i + 1; q < j; q++) {
        const d = Math.abs((pts[q][0] - ax) * dy - (pts[q][1] - ay) * dx) / l;
        if (d > dmax) { dmax = d; k = q; }
      }
      if (dmax > SCARTO) { tieni[k] = 1; pila.push([i, k], [k, j]); }
    }
    return pts.filter((_, q) => tieni[q]);
  };
  const ALFA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  // numero intero con segno: zigzag, poi gruppi di 5 bit (il sesto dice «continua»)
  const numero = n => { let z = n < 0 ? -2 * n - 1 : 2 * n, s = ''; do { let c = z & 31; z = Math.floor(z / 32); if (z) c |= 32; s += ALFA[c]; } while (z); return s; };
  const codifica = (pezzi) => {
    let prima = null;
    return pezzi.map(p => {
      // ogni pezzo parte dove finisce quello prima (a piedi fino all'ingresso, poi la linea dalla stazione)
      let pts = semplifica(p.punti.map(xy)).map(([x, y]) => [Math.round(x), Math.round(y)]);
      if (prima) pts = [prima, ...pts];
      pts = pts.filter((q, k) => k === 0 || q[0] !== pts[k - 1][0] || q[1] !== pts[k - 1][1]);
      prima = pts[pts.length - 1];
      // il mezzo («p» a piedi, o l'id della linea) e un punto, poi i numeri
      let s = (p.modo === 'piedi' ? 'p' : p.modo) + '.', px = 0, py = 0;
      for (const [x, y] of pts) { s += numero(x - px) + numero(y - py); px = x; py = y; }
      return s;
    }).join('~');
  };
  const scenari = {};
  for (const sc of SCENARI) {
    scenari[sc.nome] = disegni[sc.nome].map((riga, i) => riga.map((pezzi, j) => {
      if (!pezzi) return '';
      const s = codifica(pezzi);
      return sc.nome !== 'feriale' && s === scenari.feriale[i][j] ? 0 : s;
    }));
  }
  // senza bus: solo dove cambia rispetto al percorso di sempre (0 = uguale); i candidati con il bus per indice
  const senza = {};
  for (const [nome, righe] of Object.entries(disegniSenza)) {
    senza[nome] = righe.map((riga, i) => riga.map((pezzi, j) => {
      if (!pezzi) return '';
      const s = codifica(pezzi), sempre = scenari[nome][i][j] === 0 ? scenari.feriale[i][j] : scenari[nome][i][j];
      return s === sempre ? 0 : s;
    }));
  }
  const conBus = candidati.map(c => codifica(c.pezzi));
  const file = { generato: uscita.generato, firma, punti: uscita.punti, unita: 'src/data/mappa.json', scenari };
  fs.writeFileSync(path.join(RADICE, 'src/data/percorsi-tappe.json'), JSON.stringify(file) + '\n');
  console.log(`Scritto src/data/percorsi-tappe.json (${Math.round(JSON.stringify(file).length / 1024)} kB)`);
  // le strade alternative (orari veri): file a parte, la pagina lo carica solo se la mappa le deve disegnare
  const alt = { generato: uscita.generato, firma, senza, candidati: conBus };
  fs.writeFileSync(path.join(RADICE, 'src/data/percorsi-alternativi.json'), JSON.stringify(alt) + '\n');
  console.log(`Scritto src/data/percorsi-alternativi.json (${Math.round(JSON.stringify(alt).length / 1024)} kB)`);
}

// ---------- Rapporto delle coppie richieste ----------
for (const x of rapporto) {
  console.log(`\n== ${x.da} → ${x.a} (${x.scenario}): ${x.min.toFixed(1)} min · a piedi ${Math.round(x.m)} m · salita ${Math.round(x.su)} m · in linea d'aria ${Math.round(x.linea)} m`);
  // tratti raggruppati
  let cur = null;
  const righe = [];
  for (const e of x.tratti) {
    const k = e.tipo === 'piedi' ? 'a piedi' : e.tipo === 'corsa' ? MEZZI.get(e.linea).nome : e.tipo === 'sale' ? `sale (${e.linea})` : `scende (${e.linea})`;
    if (!cur || cur.k !== k) { cur = { k, t: 0, m: 0, su: 0, nomi: new Set() }; righe.push(cur); }
    cur.t += e.t; cur.m += e.m; cur.su += e.su;
    if (e.tipo === 'piedi') { const w = vie.find(v => v.id === e.via); if (w?.tags.name) cur.nomi.add(w.tags.name); }
  }
  for (const r of righe) console.log(`   ${r.k.padEnd(28)} ${r.t.toFixed(1).padStart(5)} min ${r.m ? Math.round(r.m) + ' m' : ''} ${r.su > 0.5 ? '+' + Math.round(r.su) + ' m' : ''} ${[...r.nomi].slice(0, 6).join(', ')}`);
}

// Con PERCORSI=<file> salva il disegno dei percorsi delle coppie richieste (giorno feriale): serve alle mappe
if (process.env.PERCORSI) {
  const disegni = Object.fromEntries(rapporto.filter(x => x.scenario === 'feriale').map(x => [`${x.da}|${x.a}`, { min: Math.round(x.min), pezzi: x.pezzi }]));
  fs.writeFileSync(process.env.PERCORSI, JSON.stringify(disegni));
  console.log(`\nPercorsi disegnati: ${Object.keys(disegni).length} in ${process.env.PERCORSI}`);
}
