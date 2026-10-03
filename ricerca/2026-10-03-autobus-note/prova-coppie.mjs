// Prototipo del 03/10/2026 (blocco B): per ogni coppia di tappe cerca la corsa ANM diretta migliore e la confronta coi tempi attuali.
// Uso: scaricare https://www.anm.it/google/google-transit.zip in ./gtfs-anm, poi: node prova-coppie.mjs 20260922  (da questa cartella)
import fs from 'node:fs';
import yaml from 'js-yaml';
import { leggi } from './gtfs.mjs';
const DATA = process.argv[2] || '20260922'; const R = +(process.env.RAGGIO || 450);
const routes = new Map(leggi('routes').map(r => [r.route_id, r]));
const trips = leggi('trips'); const stops = new Map(leggi('stops').map(s => [s.stop_id, s]));
const servizi = new Set(leggi('calendar_dates').filter(c => c.date === DATA).map(c => c.service_id));
const attivi = new Map(); for (const t of trips) if (servizi.has(t.service_id)) attivi.set(t.trip_id, t);
const escludi = new Set(['ACTON','CHIAIA','SANITA','VENTA','ECHIA']);
const tappe = yaml.load(fs.readFileSync('../../src/data/tappe.yaml', 'utf8')).filter(t => t.tipo === 'citta');
const dist = (a, b) => { const k = Math.cos(((+a.lat + +b.lat) / 2) * Math.PI / 180); return Math.hypot((+a.lat - +b.lat) * 111195, (+a.lon - +b.lon) * 111195 * k); };
const hm = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
// raggruppa stop_times per corsa
const perTrip = new Map();
for (const r of leggi('stop_times')) { if (!attivi.has(r.trip_id)) continue; if (!perTrip.has(r.trip_id)) perTrip.set(r.trip_id, []); perTrip.get(r.trip_id).push({ s: r.stop_id, n: +r.stop_sequence, t: hm(r.departure_time) }); }
// tappa vicina a ogni fermata
const vicineTappe = new Map();
for (const s of stops.values()) { const l = []; for (const t of tappe) { const d = dist(t, { lat: s.stop_lat, lon: s.stop_lon }); if (d <= R) l.push([t.id, d]); } if (l.length) vicineTappe.set(s.stop_id, l); }
const agg = new Map(); // A|B|linea -> {ride:[], n, dA, dB}
for (const [tid, seq] of perTrip) {
  const tr = attivi.get(tid); const r = routes.get(tr.route_id); if (escludi.has(r.route_short_name) || ['1', '7'].includes(r.route_type)) continue;
  seq.sort((a, b) => a.n - b.n);
  const nearest = new Map(); // tappa -> {i, d}
  seq.forEach((x, i) => { for (const [id, d] of vicineTappe.get(x.s) || []) { const p = nearest.get(id); if (!p || d < p.d) nearest.set(id, { i, d }); } });
  for (const [A, a] of nearest) for (const [B, b] of nearest) { if (A === B || a.i >= b.i) continue;
    const tA = seq[a.i].t; if (tA < 540 || tA >= 1140) continue;
    const k = `${A}|${B}|${r.route_short_name}`; if (!agg.has(k)) agg.set(k, { ride: [], dA: a.d, dB: b.d, nome: [stops.get(seq[a.i].s).stop_name, stops.get(seq[b.i].s).stop_name] });
    const e = agg.get(k); e.ride.push(seq[b.i].t - tA); if (a.d < e.dA) { e.dA = a.d; } if (b.d < e.dB) e.dB = b.d; } }
const med = v => { v = [...v].sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
const migliore = new Map();
for (const [k, e] of agg) { const [A, B, linea] = k.split('|'); const ogni = 600 / e.ride.length; const tot = e.dA * 1.3 / 75 + e.dB * 1.3 / 75 + med(e.ride) + ogni / 2;
  const kk = A + '|' + B; const p = migliore.get(kk); if (!p || tot < p.tot) migliore.set(kk, { linea, tot, ride: med(e.ride), ogni, dA: e.dA, dB: e.dB, n: e.ride.length, nome: e.nome }); }
// confronto con i tempi attuali (feriale)
const j = JSON.parse(fs.readFileSync('../../src/data/tempi-tappe.json', 'utf8')); const idx = new Map(j.punti.map((p, i) => [p, i]));
const attuale = (A, B) => Math.min(j.scenari.feriale.min[idx.get(A)][idx.get(B)], j.scenari.feriale.min[idx.get(B)][idx.get(A)]);
const mig = []; for (const [k, v] of migliore) { const [A, B] = k.split('|'); const att = j.scenari.feriale.min[idx.get(A)][idx.get(B)]; if (v.tot + 3 < att) mig.push({ A, B, att, bus: Math.round(v.tot), v }); }
console.log(`coppie con bus diretto: ${migliore.size}; migliorano di almeno 3 minuti: ${mig.length}`);
const perLinea = new Map(); for (const m of mig) perLinea.set(m.v.linea, (perLinea.get(m.v.linea) || 0) + 1);
console.log('linee che migliorano almeno una coppia:', [...perLinea].sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l}:${n}`).join(' '));
fs.writeFileSync('prova-coppie.json', JSON.stringify(mig.map(m => ({ A: m.A, B: m.B, attuale: m.att, bus: m.bus, linea: m.v.linea, ride: m.v.ride, ogni: Math.round(m.v.ogni), da: m.v.nome[0], a: m.v.nome[1] })), null, 1));
for (const m of mig.sort((a, b) => (b.att - b.bus) - (a.att - a.bus)).slice(0, 25)) console.log(`${m.A} → ${m.B}: ora ${m.att} min, con ${m.v.linea} ${Math.round(m.v.tot)} min (viaggio ${m.v.ride}, ogni ${Math.round(m.v.ogni)}; ${m.v.nome[0]} → ${m.v.nome[1]})`);
