// Riapre nella pagina il pacco della città fatto durante la build (src/lib/itinerari/napoli.ts, impacchetta)
import { SCENARI, type Citta, type Evento, type Scenario, type Tappa } from './tipi';

export interface Pacco {
  tappe: Tappa[];
  n: number;
  dizionario: string[];
  feriale: { min: number[]; metri: number[]; mezzi: number[] };
  diff: Record<string, number[]>;
  evento?: Evento;
  linee: Record<string, string>;
  zone: Record<string, string>;
}

export function spacchetta(P: Pacco): Citta {
  const nn = P.n * P.n;
  const min = {} as Record<Scenario, number[]>, metri = {} as Record<Scenario, number[]>, mezzi = {} as Record<Scenario, string[]>;
  for (const s of SCENARI) {
    const m = P.feriale.min.slice(), w = P.feriale.metri.map(x => x * 10), z = P.feriale.mezzi.map(i => P.dizionario[i]);
    const d = s === 'feriale' ? [] : P.diff[s] ?? [];
    for (let k = 0; k < d.length; k += 4) { m[d[k]] = d[k + 1]; w[d[k]] = d[k + 2] * 10; z[d[k]] = P.dizionario[d[k + 3]]; }
    if (m.length !== nn) throw new Error('Tempi incompleti');
    min[s] = m; metri[s] = w; mezzi[s] = z;
  }
  return { tappe: P.tappe, tempi: { n: P.n, min, metri, mezzi }, evento: P.evento, linee: P.linee, zone: P.zone };
}
