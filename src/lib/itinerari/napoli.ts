// Napoli per il compositore degli itinerari (solo durante la build): tappe, tempi, miniature delle foto,
// giorni delle regate e itinerari pronti. La pagina riceve tutto in un blocco JSON (impacchetta) e lo
// riapre con spacchetta (src/lib/itinerari/pacco.ts).
import { getCollection, getEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { getTappe, ZONE } from '../tappe';
import { getLocali } from '../locali';
import { EVENTI } from '../../data/eventi';
import tempiJson from '../../data/tempi-tappe.json';
import percorsiJson from '../../data/percorsi-tappe.json';
import M from '../../data/mappa.json';
import { SCENARI, PRIMA, type Citta, type Evento, type Giorno, type Itinerario, type Scenario, type Tappa, type Tempi } from './tipi';
import { calcolaGiorno, ordinePiuCorto } from './calcolo';
import { minutiDa, piuGiorni, tipoGiorno } from './date';

export const LINEE: Record<string, string> = Object.fromEntries((tempiJson.linee as { id: string; nome: string }[]).map(l => [l.id, l.nome]));

// Stessa proiezione di src/components/Mappa.astro (unità di src/data/mappa.json)
const KX = M.w / (M.box.e - M.box.w), KY = M.h / (M.box.n - M.box.s);
export const xy = (lat: number, lon: number): [number, number] => [+((lon - M.box.w) * KX).toFixed(1), +((M.box.n - lat) * KY).toFixed(1)];

// Le regate: il blocco parte alle 14:00 come nel 2026 (scheda cal-orari-2026: gli orari 2027 non sono
// ancora usciti, lo dice il testo «regate» di src/testi/itinerari.yaml). Durata: stima nostra per tre regate
// e il tempo per trovare posto. Giorni: quelli del calendario (src/data/eventi.ts).
export const REGATE = { id: 'regate', nome: 'Regate dal lungomare', inizio: 14 * 60, durata: 150, tappa: 'lungomare' } as const;

export function giorniRegate(): Evento['giorni'] {
  const giorni: Evento['giorni'] = {};
  for (const e of EVENTI) {
    if (e.gara === 'pausa') continue;
    const fine = e.riserva && e.riserva > e.fine ? e.riserva : e.fine;
    for (let d = e.inizio; d <= fine; d = piuGiorni(d, 1)) {
      const x = { titolo: e.titolo, ...(e.possibiliDal && d >= e.possibiliDal ? { possibile: true } : {}), ...(d === e.riserva ? { riserva: true } : {}) };
      giorni[d] = giorni[d] ? { ...giorni[d], titolo: `${giorni[d].titolo} e ${e.titolo}` } : x;
    }
  }
  return giorni;
}

let cache: Promise<Citta> | null = null;
export function cittaNapoli(): Promise<Citta> {
  if (!cache || import.meta.env.DEV) cache = carica();
  return cache;
}

async function carica(): Promise<Citta> {
  // i percorsi disegnati devono venire dallo stesso calcolo dei tempi
  if (percorsiJson.firma !== tempiJson.firma || percorsiJson.punti.join() !== (tempiJson.punti as string[]).join()) {
    throw new Error('I percorsi della mappa (src/data/percorsi-tappe.json) non corrispondono ai tempi: rifai tutto con node scripts/itinerari/costruisci.mjs <cartella>');
  }
  const tutte = await getTappe();
  const luoghi = await getCollection('luoghi');
  const punti = tempiJson.punti as string[];
  const tappe: Tappa[] = [];
  for (const t of tutte) {
    const d = t.data;
    let foto: string | undefined;
    if (d.foto) {
      const f = await getEntry('foto', d.foto.id);
      if (f) foto = (await getImage({ src: f.data.src, width: 144, height: 144, fit: 'cover', format: 'webp', quality: 55 })).src;
    }
    const partenza = d.partenza ? luoghi.find(l => l.id === d.partenza!.id) : undefined;
    tappe.push({
      id: t.id, nome: d.nome, breve: d.breve ?? d.nome, tipo: d.tipo, zona: d.zona, generi: d.generi, durata: d.durata,
      chiuso: d.chiuso, alChiuso: d.alChiuso, ...(d.gradini ? { gradini: d.gradini } : {}), bambini: d.bambini, momento: d.momento,
      ingresso: d.ingresso, prenotazione: d.prenotazione, ...(d.avviso ? { avviso: d.avviso } : {}), ...(foto ? { foto } : {}),
      ...(d.fine ? { fine: d.fine.nome } : {}), reversibile: d.reversibile,
      ...(partenza ? { partenza: partenza.data.nome } : {}),
      xy: partenza ? xy(partenza.data.lat, partenza.data.lon) : xy(d.lat, d.lon),
      ...(d.tipo === 'citta' ? { ll: [d.lat, d.lon] as [number, number] } : {}),
      ...(d.fine ? { xyFine: xy(d.fine.lat, d.fine.lon) } : {}),
      p: d.tipo === 'citta' ? punti.indexOf(t.id) : -1,
      ...(d.fine ? { pf: punti.indexOf(`${t.id}>`) } : {})
    });
  }
  // i locali di «Dove mangiare»: tappe in città con gli orari giorno per giorno (src/lib/locali.ts)
  for (const l of await getLocali()) {
    const d = l.data;
    let foto: string | undefined;
    if (d.foto) {
      const f = await getEntry('foto', d.foto.id);
      if (f) foto = (await getImage({ src: f.data.src, width: 144, height: 144, fit: 'cover', format: 'webp', quality: 55 })).src;
    }
    tappe.push({
      id: l.id, nome: d.nome, breve: d.breve ?? d.nome, tipo: 'citta', zona: d.zona, generi: ['cibo'], durata: l.durata,
      chiuso: l.chiuso, alChiuso: 'si', bambini: 'si', momento: 'quando-vuoi', ingresso: 'pagamento',
      prenotazione: d.prenotazione === 'obbligatoria' ? 'obbligatoria' : 'no', ...(foto ? { foto } : {}), reversibile: true,
      xy: xy(d.lat, d.lon), ll: [d.lat, d.lon], p: punti.indexOf(l.id),
      categoria: 'mangiare', orari: l.settimana, cucina: d.cucina, pasto: d.pasto, fascia: l.fascia, piatti: d.piatti
    });
  }
  const n = punti.length;
  const S = tempiJson.scenari as Record<Scenario, { min: number[][]; piedi: number[][]; mezzi?: string[][] }>;
  const tempi: Tempi = { n, min: {} as Tempi['min'], metri: {} as Tempi['metri'], mezzi: {} as Tempi['mezzi'] };
  for (const s of SCENARI) {
    tempi.min[s] = S[s].min.flat();
    tempi.metri[s] = S[s].piedi.flat();
    tempi.mezzi[s] = S[s].mezzi ? S[s].mezzi!.flat() : new Array(n * n).fill('');
  }
  const lungomare = tappe.find(t => t.id === REGATE.tappa)!;
  const giorni = giorniRegate();
  const date = Object.keys(giorni).sort();
  return {
    tappe, tempi, linee: LINEE, zone: ZONE,
    evento: { id: REGATE.id, nome: REGATE.nome, p: lungomare.p, xy: lungomare.xy, durata: REGATE.durata, inizio: REGATE.inizio, giorni, primo: date[0], ultimo: date[date.length - 1] }
  };
}

// ---------- Pacco per la pagina ----------
// Nella pagina: tempi del giorno feriale per intero. Gli altri scenari (sabato, domenica, festivi, solo a piedi)
// arrivano dopo l'apertura da /napoli/itinerari/scenari.json (scenariPacco), per non appesantire la pagina.
// I mezzi sono indici di un dizionario («L1+FA», «asc:Ascensore Acton»…).
export function impacchetta(C: Citta) {
  const dizionario: string[] = [];
  const voce = (s: string) => { let i = dizionario.indexOf(s); if (i < 0) { i = dizionario.length; dizionario.push(s); } return i; };
  const F = C.tempi;
  const feriale = { min: F.min.feriale, metri: F.metri.feriale.map(m => Math.round(m / 10)), mezzi: F.mezzi.feriale.map(voce) };
  return { tappe: C.tappe, n: F.n, dizionario, feriale, evento: C.evento, linee: C.linee, zone: C.zone };
}

// Gli scenari, ognuno come differenza da quello che lo precede (PRIMA): per ogni cella che cambia, la distanza
// dalla cella cambiata prima, i minuti, i metri (in decine) e il mezzo (indice del dizionario). Si decide sui
// valori arrotondati, gli stessi che la pagina ricostruisce (src/lib/itinerari/pacco.ts, aggiungiScenari).
export function scenariPacco(C: Citta) {
  const dizionario: string[] = [];
  const voce = (s: string) => { let i = dizionario.indexOf(s); if (i < 0) { i = dizionario.length; dizionario.push(s); } return i; };
  const F = C.tempi, nn = F.n * F.n;
  const metri = (s: Scenario, i: number) => Math.round(F.metri[s][i] / 10);
  const diff: Record<string, number[]> = {};
  for (const s of SCENARI) {
    if (s === 'feriale') continue;
    const p = PRIMA[s]!;
    const out: number[] = [];
    let ultimo = 0;
    for (let ij = 0; ij < nn; ij++) {
      if (F.min[s][ij] !== F.min[p][ij] || metri(s, ij) !== metri(p, ij) || F.mezzi[s][ij] !== F.mezzi[p][ij]) {
        out.push(ij - ultimo, F.min[s][ij], metri(s, ij), voce(F.mezzi[s][ij]));
        ultimo = ij;
      }
    }
    diff[s] = out;
  }
  return { dizionario, diff };
}

// ---------- Itinerari pronti ----------
export type Pronto = { id: string; nome: string; evento: boolean; it: Itinerario; giorni: ReturnType<typeof calcolaGiorno>[] };

export async function prontiNapoli(): Promise<Pronto[]> {
  const C = await cittaNapoli();
  const dati = yaml.load(fs.readFileSync(path.join(process.cwd(), 'src/data/itinerari-pronti.yaml'), 'utf8')) as { id: string; nome: string; evento?: boolean; giorni: { inizio: string; fine: string; tappe: string[] }[] }[];
  const errori: string[] = [];
  const out: Pronto[] = [];
  for (const p of dati) {
    const giorni: Giorno[] = p.giorni.map(g => ({ inizio: minutiDa(g.inizio), fine: minutiDa(g.fine), tappe: g.tappe }));
    for (const g of giorni) for (const id of g.tappe) {
      if (id === REGATE.id) { if (!p.evento) errori.push(`${p.id}: le regate stanno solo negli itinerari con «evento: true»`); continue; }
      const t = C.tappe.find(x => x.id === id);
      if (!t) errori.push(`${p.id}: la tappa "${id}" non esiste`);
      else if (t.tipo !== 'citta') errori.push(`${p.id}: "${id}" è una gita, non va mescolata con le tappe in città`);
    }
    if (errori.length) continue;
    // un giorno di regata qualsiasi, feriale, per controllare l'arrivo in tempo
    const data = p.evento ? Object.keys(C.evento!.giorni).sort().find(d => tipoGiorno(d) === 'feriale') : undefined;
    const it: Itinerario = { id: p.id, nome: p.nome, giorni, creato: 0, modificato: 0, ...(data ? { data } : {}) };
    const calcoli = giorni.map((_, g) => calcolaGiorno(C, it, g));
    calcoli.forEach((r, g) => {
      for (const a of r.avvisi) {
        if (a.tipo === 'piena') errori.push(`${p.id}, giorno ${g + 1}: finisce alle ${Math.floor(a.fine / 60)}:${String(a.fine % 60).padStart(2, '0')}, dopo la fine scelta`);
        if (a.tipo === 'lontana') errori.push(`${p.id}, giorno ${g + 1}: "${a.id}" è lontana dalle altre tappe (${a.extra} minuti in più)`);
        if (a.tipo === 'evento-tardi') errori.push(`${p.id}, giorno ${g + 1}: si arriva alle regate ${a.ritardo} minuti dopo l'inizio`);
      }
      const o = ordinePiuCorto(C, it, g);
      if (o) errori.push(`${p.id}, giorno ${g + 1}: con l'ordine ${o.ordine.join(', ')} si risparmiano ${o.risparmio} minuti`);
    });
    const { data: _, ...senzaData } = it;
    out.push({ id: p.id, nome: p.nome, evento: !!p.evento, it: senzaData, giorni: calcoli });
  }
  if (errori.length) throw new Error(`Itinerari pronti da sistemare (${errori.length}):\n- ${errori.join('\n- ')}`);
  return out;
}
