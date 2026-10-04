// Riapre nella pagina il pacco della città fatto durante la build (src/lib/itinerari/napoli.ts, impacchetta)
import { SCENARI, PRIMA, type Citta, type Evento, type Scenario, type Tappa, type Vivo } from './tipi';

export interface Pacco {
  tappe: Tappa[];
  n: number;
  dizionario: string[];
  feriale: { min: number[]; metri: number[]; mezzi: number[] };
  evento?: Evento;
  linee: Record<string, string>;
  zone: Record<string, string>;
}

// Gli altri scenari (sabato, domenica, festivi, solo a piedi) arrivano dopo, da /napoli/itinerari/scenari.json:
// finché non ci sono, valgono i tempi del feriale (aggiungiScenari li sostituisce).
export interface PaccoScenari { dizionario: string[]; diff: Record<string, number[]> }
export function aggiungiScenari(C: Citta, P: PaccoScenari) {
  for (const s of SCENARI) {
    const p = PRIMA[s];
    if (!p) continue;
    const m = C.tempi.min[p].slice(), w = C.tempi.metri[p].slice(), z = C.tempi.mezzi[p].slice();
    const d = P.diff[s] ?? [];
    let ij = 0;
    for (let k = 0; k < d.length; k += 4) { ij += d[k]; m[ij] = d[k + 1]; w[ij] = d[k + 2] * 10; z[ij] = P.dizionario[d[k + 3]]; }
    C.tempi.min[s] = m; C.tempi.metri[s] = w; C.tempi.mezzi[s] = z;
  }
}

export function spacchetta(P: Pacco): Citta {
  const nn = P.n * P.n;
  const min = {} as Record<Scenario, number[]>, metri = {} as Record<Scenario, number[]>, mezzi = {} as Record<Scenario, string[]>;
  for (const s of SCENARI) {
    const m = P.feriale.min.slice(), w = P.feriale.metri.map(x => x * 10), z = P.feriale.mezzi.map(i => P.dizionario[i]);
    if (m.length !== nn) throw new Error('Tempi incompleti');
    min[s] = m; metri[s] = w; mezzi[s] = z;
  }
  return { tappe: P.tappe, tempi: { n: P.n, min, metri, mezzi }, evento: P.evento, linee: P.linee, zone: P.zone };
}

// Gli orari veri dei bus, come arrivano da /napoli/itinerari/partenze.json (src/pages/napoli/itinerari/partenze.json.ts)
export interface PaccoVivo {
  preferenza: number; dal: string; al: string; giorni: Record<string, number>;
  tipi: { salite: Record<string, number[]>; viaggi: Record<string, number | number[]> }[];
  fermate: Record<string, string>; dizionario: string[];
  candidati: [(number | string)[], number, number][];
  senza: Record<string, number[]>; bus: Record<string, number[]>;
}

// le partenze arrivano come differenze dalla partenza prima: qui tornano minuti dalla mezzanotte
const somme = (v: number[]) => { let c = 0; return v.map((x, i) => (c = i ? c + x : x)); };

export function spacchettaVivo(P: PaccoVivo): Vivo {
  const senza: Vivo['senza'] = {}, bus: Vivo['bus'] = {};
  for (const [s, v] of Object.entries(P.senza)) {
    const m = new Map<number, { min: number; metri: number; mezzi: string }>();
    for (let k = 0; k < v.length; k += 4) m.set(v[k], { min: v[k + 1], metri: v[k + 2] * 10, mezzi: P.dizionario[v[k + 3]] });
    senza[s as Scenario] = m;
  }
  for (const [s, v] of Object.entries(P.bus)) {
    const m = new Map<number, number[]>();
    for (let k = 0; k < v.length;) { const n = v[k + 1]; m.set(v[k], v.slice(k + 2, k + 2 + n)); k += 2 + n; }
    bus[s as Scenario] = m;
  }
  return {
    dal: P.dal, al: P.al, giorni: P.giorni, fermate: P.fermate, preferenza: P.preferenza,
    salite: P.tipi.map(t => new Map(Object.entries(t.salite).map(([k, v]) => [k, somme(v)]))),
    viaggi: P.tipi.map(t => new Map(Object.entries(t.viaggi).map(([k, v]) => [k, Array.isArray(v) ? { min: v[0], partenze: somme(v.slice(1)) } : { min: v }]))),
    candidati: P.candidati.map(([seg, m, z]) => ({ seg, metri: m * 10, mezzi: P.dizionario[z] })),
    senza, bus
  };
}
