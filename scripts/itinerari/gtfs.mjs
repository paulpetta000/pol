// Lettura del feed GTFS degli autobus ANM (https://www.anm.it/google/google-transit.zip, licenza IODL 2.0)
// e costruzione delle linee scelte per i tempi tra le tappe (scripts/itinerari/costruisci.mjs).
// GTFS è il formato aperto degli orari: un file zip con tabelle di testo (linee, corse, fermate, orari, percorsi).
// Per ogni linea e per ogni scenario (giorno e fascia oraria) calcola:
// - i passaggi a ogni fermata nella fascia, da cui la frequenza e quindi l'attesa media (metà della frequenza);
// - il tempo tra una fermata e la successiva, dall'orario programmato (mediana delle corse della fascia);
// - il disegno del percorso tra due fermate (shapes del feed), per la mappa.
// Sono orari programmati: traffico, lavori e deviazioni non ci sono (lo dice la pagina «Come calcoliamo i tempi»).
import fs from 'node:fs';
import zlib from 'node:zlib';

// ---------- Zip (senza librerie: directory centrale e blocchi «deflate») ----------
function leggiZip(file) {
  const b = fs.readFileSync(file);
  let e = b.length - 22;
  while (e >= 0 && b.readUInt32LE(e) !== 0x06054b50) e--;
  if (e < 0) throw new Error(`${file}: non è un file zip`);
  const n = b.readUInt16LE(e + 10);
  let p = b.readUInt32LE(e + 16);
  const out = new Map();
  for (let i = 0; i < n; i++) {
    const metodo = b.readUInt16LE(p + 10), compresso = b.readUInt32LE(p + 20);
    const lNome = b.readUInt16LE(p + 28), lExtra = b.readUInt16LE(p + 30), lCommento = b.readUInt16LE(p + 32);
    const locale = b.readUInt32LE(p + 42);
    const nome = b.toString('utf8', p + 46, p + 46 + lNome);
    const inizio = locale + 30 + b.readUInt16LE(locale + 26) + b.readUInt16LE(locale + 28);
    const dati = b.subarray(inizio, inizio + compresso);
    out.set(nome.split('/').pop(), () => (metodo === 0 ? dati : zlib.inflateRawSync(dati)).toString('utf8'));
    p += 46 + lNome + lExtra + lCommento;
  }
  return out;
}

// ---------- CSV (campi tra virgolette, con virgole e "" dentro) ----------
function campi(l) {
  const o = []; let c = '', q = false;
  for (let i = 0; i < l.length; i++) {
    const ch = l[i];
    if (q) { if (ch === '"') { if (l[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { o.push(c); c = ''; }
    else c += ch;
  }
  o.push(c);
  return o;
}
function tabella(zip, nome, { obbligatoria = true } = {}) {
  const f = zip.get(`${nome}.txt`);
  if (!f) { if (obbligatoria) throw new Error(`GTFS: manca ${nome}.txt`); return []; }
  const righe = f().replace(/^﻿/, '').split(/\r?\n/).filter(Boolean);
  const h = campi(righe[0]).map(s => s.trim());
  return righe.slice(1).map(r => { const v = campi(r); const o = {}; h.forEach((k, i) => { o[k] = v[i]; }); return o; });
}

const minuti = s => { const [h, m, x] = s.split(':').map(Number); return h * 60 + m + (x || 0) / 60; };
const giornoDi = d => new Date(Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8))).getUTCDay();
const dist = (a, b) => {
  const k = Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  return Math.hypot((a.lat - b.lat) * 111195, (a.lon - b.lon) * 111195 * k);
};
const mediana = v => { const s = [...v].sort((a, b) => a - b); const k = s.length >> 1; return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2; };

// I servizi attivi in ogni data (calendar.txt e calendar_dates.txt: il feed ANM usa solo il secondo)
function calendario(zip) {
  const date = new Map();
  const add = (d, s) => { if (!date.has(d)) date.set(d, new Set()); date.get(d).add(s); };
  const GIORNI = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (const c of tabella(zip, 'calendar', { obbligatoria: false })) {
    for (let t = Date.UTC(+c.start_date.slice(0, 4), +c.start_date.slice(4, 6) - 1, +c.start_date.slice(6)); ; t += 864e5) {
      const d = new Date(t).toISOString().slice(0, 10).replace(/-/g, '');
      if (d > c.end_date) break;
      if (c[GIORNI[giornoDi(d)]] === '1') add(d, c.service_id);
    }
  }
  for (const c of tabella(zip, 'calendar_dates', { obbligatoria: false })) {
    if (c.exception_type === '1') add(c.date, c.service_id);
    else date.get(c.date)?.delete(c.service_id);
  }
  return date;
}

// La data tipica di un gruppo di giorni: quella con l'insieme di servizi più frequente (salta feste e ponti)
function dataTipica(date, giorni) {
  const conta = new Map();
  for (const [d, s] of date) {
    if (!giorni.includes(giornoDi(d))) continue;
    const k = [...s].sort().join(',');
    if (!conta.has(k)) conta.set(k, []);
    conta.get(k).push(d);
  }
  const [, lista] = [...conta].sort((a, b) => b[1].length - a[1].length || a[1][0].localeCompare(b[1][0]))[0] || [];
  if (!lista) throw new Error('GTFS: nessuna data per i giorni ' + giorni.join(','));
  return lista.sort()[0];
}

// ---------- Le linee scelte ----------
// finestre: { scenario: { giorni: [0..6], da: minuti, a: minuti } }
export function lineeBus(file, { linee, finestre }) {
  const zip = leggiZip(file);
  const routes = tabella(zip, 'routes');
  const scelte = new Map();
  for (const nome of linee) {
    const r = routes.filter(x => x.route_short_name === nome);
    if (r.length !== 1) throw new Error(`GTFS: la linea ${nome} c'è ${r.length} volte nel feed (attesa una)`);
    scelte.set(r[0].route_id, r[0]);
  }
  const date = calendario(zip);
  const tutte = [...date.keys()].sort();
  const tipiche = {};
  for (const [sc, f] of Object.entries(finestre)) tipiche[sc] = dataTipica(date, f.giorni);

  const trips = tabella(zip, 'trips').filter(t => scelte.has(t.route_id));
  const perTrip = new Map(trips.map(t => [t.trip_id, { ...t, fermate: [] }]));
  for (const r of tabella(zip, 'stop_times')) {
    const t = perTrip.get(r.trip_id);
    if (t) t.fermate.push({ s: r.stop_id, n: +r.stop_sequence, t: minuti(r.departure_time || r.arrival_time) });
  }
  for (const t of perTrip.values()) t.fermate.sort((a, b) => a.n - b.n);
  const stops = new Map(tabella(zip, 'stops').map(s => [s.stop_id, { id: s.stop_id, nome: s.stop_name.trim(), lat: +s.stop_lat, lon: +s.stop_lon }]));
  const shapes = new Map();
  for (const p of tabella(zip, 'shapes', { obbligatoria: false })) {
    if (!shapes.has(p.shape_id)) shapes.set(p.shape_id, []);
    shapes.get(p.shape_id).push({ n: +p.shape_pt_sequence, lat: +p.shape_pt_lat, lon: +p.shape_pt_lon });
  }
  for (const s of shapes.values()) s.sort((a, b) => a.n - b.n);

  // il disegno tra le fermate di una sequenza: ogni fermata sul punto più vicino della shape, andando avanti
  function disegno(shapeId, seq) {
    const sh = shapes.get(shapeId);
    if (!sh || sh.length < 2) return null;
    const lung = [0];
    for (let i = 1; i < sh.length; i++) lung.push(lung[i - 1] + dist(sh[i - 1], sh[i]));
    const idx = [];
    let j0 = 0;
    for (let k = 0; k < seq.length; k++) {
      const s = stops.get(seq[k]);
      const limite = k ? lung[j0] + 3 * dist(stops.get(seq[k - 1]), s) + 300 : Infinity;
      let best = j0, bd = Infinity;
      for (let j = j0; j < sh.length && lung[j] <= limite; j++) { const d = dist(sh[j], s); if (d < bd) { bd = d; best = j; } }
      idx.push(best); j0 = best;
    }
    return seq.slice(1).map((_, k) => sh.slice(idx[k] + 1, idx[k + 1]).map(p => [+p.lat.toFixed(6), +p.lon.toFixed(6)]));
  }

  const out = [];
  for (const [rid, r] of scelte) {
    const id = 'B' + r.route_short_name;
    const nome = `${r.route_type === '11' ? 'Filobus' : 'Bus'} ${r.route_short_name}`;
    const corse = [...perTrip.values()].filter(t => t.route_id === rid && t.fermate.length > 1);
    // fermate e tratti si tengono separati per direzione: al capolinea non si «passa» da una direzione all'altra
    // restando sul bus (nel feed nessuna corsa lo fa), si scende e si riprende il bus con la sua attesa
    const passaggi = {};        // scenario -> «direzione|stop» -> numero di corse che ripartono da lì nella fascia
    const archi = new Map();    // "da>a" -> { da, a, tempi: { scenario: min }, peso: { scenario: corse }, punti }
    const usate = new Map();    // stop -> nome (tutte le fermate delle corse della linea)
    for (const [sc, f] of Object.entries(finestre)) {
      const attivi = date.get(tipiche[sc]) || new Set();
      const delGiorno = corse.filter(t => attivi.has(t.service_id));
      const p = passaggi[sc] = {};
      const schemi = new Map();   // sequenza di fermate -> corse
      for (const t of delGiorno) {
        const dir = t.direction_id || '0';
        t.fermate.forEach((x, i) => { if (i < t.fermate.length - 1 && x.t >= f.da && x.t < f.a) p[`${dir}|${x.s}`] = (p[`${dir}|${x.s}`] || 0) + 1; });
        // per i tempi: le corse che attraversano la fascia
        if (t.fermate[t.fermate.length - 1].t < f.da || t.fermate[0].t >= f.a) continue;
        const k = `${t.direction_id || '0'} ` + t.fermate.map(x => x.s).join(' ');
        if (!schemi.has(k)) schemi.set(k, []);
        schemi.get(k).push(t);
      }
      for (const [k, ts] of [...schemi].sort((a, b) => b[1].length - a[1].length)) {
        const [dir, ...seq] = k.split(' ');
        // tempo cumulato dalla prima fermata: mediana sulle corse (resta in ordine crescente)
        const cum = seq.map((_, i) => mediana(ts.map(t => t.fermate[i].t - t.fermate[0].t)));
        const quante = new Map(); for (const t of ts) quante.set(t.shape_id, (quante.get(t.shape_id) || 0) + 1);
        const shapeId = [...quante].sort((a, b) => b[1] - a[1])[0][0];
        let pezzi = null;
        for (let i = 1; i < seq.length; i++) {
          const ka = `${dir}|${seq[i - 1]}>${seq[i]}`;
          if (seq[i - 1] === seq[i]) continue;
          if (!archi.has(ka)) archi.set(ka, { dir, da: seq[i - 1], a: seq[i], tempi: {}, peso: {}, punti: null });
          const a = archi.get(ka);
          if ((a.peso[sc] || 0) < ts.length) { a.tempi[sc] = Math.max(0.25, cum[i] - cum[i - 1]); a.peso[sc] = ts.length; }
          if (!a.punti) { pezzi ??= disegno(shapeId, seq) || []; a.punti = pezzi[i - 1] || []; }
        }
      }
    }
    for (const t of corse) for (const x of t.fermate) usate.set(x.s, stops.get(x.s)?.nome);
    // le fermate di ogni direzione, nell'ordine della corsa più frequente nei feriali
    const direzioni = [];
    for (const dir of [...new Set(corse.map(t => t.direction_id || '0'))].sort()) {
      const conta = new Map();
      for (const t of corse.filter(t => (t.direction_id || '0') === dir)) { const k = t.fermate.map(x => x.s).join(' '); conta.set(k, (conta.get(k) || 0) + 1); }
      const principale = [...conta].sort((a, b) => b[1] - a[1])[0][0].split(' ');
      const altre = [...new Set([...conta.keys()].flatMap(k => k.split(' ')))].filter(s => !principale.includes(s));
      const f = s => ({ id: s, nome: stops.get(s).nome, lat: stops.get(s).lat, lon: stops.get(s).lon });
      direzioni.push({ verso: dir, capolinea: stops.get(principale[principale.length - 1]).nome, fermate: principale.map(f), ...(altre.length ? { altre: altre.map(f) } : {}) });
    }
    out.push({ id, nome, breve: r.route_short_name, tipo: r.route_type === '11' ? 'filobus' : 'bus', passaggi, archi: [...archi.values()], fermate: stops, usate, direzioni });
  }
  // Le partenze vere di alcune corse («linea|fermata di salita|fermata di discesa»), per ogni data del feed.
  // Le date con le stesse partenze diventano un «tipo di giorno». Per ogni tipo:
  // - salite["linea|salita"]: le partenze da quella fermata (prima partenza, poi le differenze dalla prima),
  //   in minuti dalla mezzanotte: tutte le corse che portano ad almeno una delle discese usate;
  // - viaggi["linea|salita|discesa"]: i minuti di viaggio (mediana), oppure [minuti, partenze…] se verso quella
  //   discesa vanno solo alcune corse (le linee con le diramazioni).
  function partenze(chiavi) {
    const idLinea = new Map(out.map(l => [l.id, [...scelte].find(([, r]) => 'B' + r.route_short_name === l.id)[0]]));
    const perServizio = new Map();   // route_id -> service_id -> corse, con l'indice di ogni fermata
    for (const t of perTrip.values()) {
      if (!perServizio.has(t.route_id)) perServizio.set(t.route_id, new Map());
      const m = perServizio.get(t.route_id);
      if (!m.has(t.service_id)) m.set(t.service_id, []);
      m.get(t.service_id).push({ t: t.fermate.map(x => x.t), dove: new Map(t.fermate.map((x, i) => [x.s, i])) });
    }
    const tipi = [], firme = new Map(), giorni = {};
    const lista = v => v.map((x, i) => (i ? x - v[i - 1] : x));
    for (const d of tutte) {
      const attivi = date.get(d);
      const perChiave = {};
      for (const k of [...chiavi].sort()) {
        const [lid, a, b] = k.split('|');
        const coppie = [];
        for (const [sv, corse] of perServizio.get(idLinea.get(lid)) || []) {
          if (!attivi.has(sv)) continue;
          for (const c of corse) {
            const ia = c.dove.get(a), ib = c.dove.get(b);
            if (ia != null && ib != null && ib > ia) coppie.push([Math.round(c.t[ia]), c.t[ib] - c.t[ia]]);
          }
        }
        if (!coppie.length) continue;
        coppie.sort((x, y) => x[0] - y[0]);
        perChiave[k] = { viaggio: Math.round(mediana(coppie.map(x => x[1])) * 2) / 2, partenze: [...new Set(coppie.map(x => x[0]))] };
      }
      const salite = {}, viaggi = {};
      for (const [k, v] of Object.entries(perChiave)) {
        const la = k.split('|').slice(0, 2).join('|');
        salite[la] = [...new Set([...(salite[la] || []), ...v.partenze])].sort((x, y) => x - y);
      }
      for (const [k, v] of Object.entries(perChiave)) {
        const la = k.split('|').slice(0, 2).join('|');
        viaggi[k] = v.partenze.length === salite[la].length ? v.viaggio : [v.viaggio, ...lista(v.partenze)];
      }
      for (const la of Object.keys(salite)) salite[la] = lista(salite[la]);
      const tipo = { salite, viaggi };
      const f = JSON.stringify(tipo);
      if (!firme.has(f)) { firme.set(f, tipi.length); tipi.push(tipo); }
      giorni[d] = firme.get(f);
    }
    // i nomi delle fermate usate, scritti per bene («ACTON - PLEBISCITO» → «Acton - Plebiscito»)
    const PICCOLE = new Set(['di', 'dei', 'del', 'della', 'delle', 'degli', 'a', 'al', 'alla', 'e', 'da', 'in']);
    const bello = s => s.toLowerCase().replace(/\s+/g, ' ').trim().split(' ').map((w, i) => (i && PICCOLE.has(w) ? w : w.replace(/(^|['(.-])(\p{L})/gu, (_, x, y) => x + y.toUpperCase()))).join(' ');
    const fermate = {};
    for (const k of chiavi) for (const sid of k.split('|').slice(1)) fermate[sid] = bello(stops.get(sid).nome);
    return { dal: tutte[0], al: tutte[tutte.length - 1], giorni, tipi, fermate };
  }

  return { linee: out, feed: { dal: tutte[0], al: tutte[tutte.length - 1] }, date: tipiche, partenze };
}
