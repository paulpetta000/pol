// Calcolo di una giornata: orari, spostamenti, avvisi e ordine più corto. Funzioni pure, senza DOM:
// le usa la pagina (src/scripts/itinerari/) e la build, che controlla gli itinerari pronti.
import { giornoSettimana, tipoGiorno, piuGiorni } from './date';
import type { Avviso, Citta, Giorno, Itinerario, Risultato, Scenario, Tappa, Voce } from './tipi';

// Una tappa che allunga gli spostamenti di almeno tanti minuti (andata e ritorno) è «lontana dalle altre»
export const LONTANA = 30;
// L'ordine più corto si propone solo se fa risparmiare almeno tanti minuti
export const RISPARMIO_MINIMO = 5;

export const tappaDi = (C: Citta, id: string): Tappa | undefined => C.tappe.find(t => t.id === id);
export const dataDelGiorno = (it: Itinerario, g: number) => (it.data ? piuGiorni(it.data, g) : undefined);

// Lo scenario dei mezzi per uno spostamento che parte a quell'ora (minuti dalla mezzanotte)
export function scenarioDi(data: string | undefined, t: number, piedi = false): Scenario {
  if (piedi) return 'piedi';
  const tipo = tipoGiorno(data);
  if (tipo === 'sabato') return t >= 14 * 60 + 50 ? 'sabato-pomeriggio' : 'sabato';
  if (tipo === 'domenica') return t >= 14 * 60 ? 'festivo' : 'domenica';
  return 'feriale';
}

export const minuti = (C: Citta, s: Scenario, a: number, b: number) => (a === b ? 0 : C.tempi.min[s][a * C.tempi.n + b]);

// I punti d'ingresso e d'uscita di una tappa (o dell'evento), nei due versi se è un percorso a piedi
type Capi = { entra: number; esce: number; indietro: boolean }[];
function capi(C: Citta, id: string): Capi {
  if (C.evento && id === C.evento.id) return [{ entra: C.evento.p, esce: C.evento.p, indietro: false }];
  const t = tappaDi(C, id)!;
  if (t.pf == null) return [{ entra: t.p, esce: t.p, indietro: false }];
  const avanti = { entra: t.p, esce: t.pf, indietro: false };
  return t.reversibile ? [avanti, { entra: t.pf, esce: t.p, indietro: true }] : [avanti];
}

// Il verso migliore dei percorsi a piedi lungo la giornata (programmazione dinamica sui due versi)
function versi(C: Citta, ids: string[], s: Scenario) {
  const c = ids.map(id => capi(C, id));
  let costo = c[0]?.map(() => 0) ?? [];
  const da: number[][] = [];
  for (let k = 1; k < ids.length; k++) {
    const prima = c[k - 1], ora = c[k];
    const nuovo: number[] = [], scelta: number[] = [];
    for (const [j, o] of ora.entries()) {
      let best = Infinity, bi = 0;
      for (const [i, q] of prima.entries()) {
        const v = costo[i] + minuti(C, s, q.esce, o.entra);
        if (v < best) { best = v; bi = i; }
      }
      nuovo.push(best); scelta.push(bi);
    }
    costo = nuovo; da.push(scelta);
  }
  const out: number[] = new Array(ids.length).fill(0);
  if (!ids.length) return out;
  let j = costo.indexOf(Math.min(...costo));
  for (let k = ids.length - 1; k >= 0; k--) { out[k] = j; if (k > 0) j = da[k - 1][j]; }
  return out.map((j, k) => c[k][j]);
}

const durataDi = (C: Citta, id: string) => (C.evento && id === C.evento.id ? C.evento.durata : tappaDi(C, id)!.durata);

// La giornata g dell'itinerario, con orari e avvisi
export function calcolaGiorno(C: Citta, it: Itinerario, g: number): Risultato {
  const G = it.giorni[g];
  const data = dataDelGiorno(it, g);
  const ids = G.tappe.filter(id => tappaDi(C, id) || (C.evento && id === C.evento.id));
  const base = scenarioDi(data, G.inizio, it.piedi);
  const verso = versi(C, ids, base);
  const voci: Voce[] = [];
  const avvisi: Avviso[] = [];
  let t = G.inizio, n = 0, visite = 0, spostamenti = 0, metri = 0;
  let uscita: number | null = null;
  ids.forEach((id, k) => {
    const v = verso[k];
    if (uscita != null) {
      const s = scenarioDi(data, t, it.piedi);
      const ij = uscita * C.tempi.n + v.entra;
      const min = minuti(C, s, uscita, v.entra);
      const parti = (C.tempi.mezzi[s]?.[ij] || '').split('+').filter(Boolean);
      voci.push({
        tipo: 'tratto', min, metri: C.tempi.metri[s][ij] ?? 0, scenario: s, da: uscita, a: v.entra,
        mezzi: parti.filter(x => !x.startsWith('asc:')), ascensori: parti.filter(x => x.startsWith('asc:')).map(x => x.slice(4))
      });
      t += min; spostamenti += min; metri += C.tempi.metri[s][ij] ?? 0;
    }
    const voce: Extract<Voce, { tipo: 'tappa' }> = { tipo: 'tappa', id, n: ++n, inizio: t, fine: t };
    if (C.evento && id === C.evento.id) {
      if (t < C.evento.inizio) { voce.attesa = C.evento.inizio - t; t = C.evento.inizio; voce.inizio = t; }
      else if (t > C.evento.inizio) voce.ritardo = t - C.evento.inizio;
    }
    const d = durataDi(C, id);
    voce.fine = t + d;
    if (v.indietro) voce.indietro = true;
    if (data && tappaDi(C, id)?.chiuso.includes(giornoSettimana(data))) {
      voce.chiusa = true;
      avvisi.push({ tipo: 'chiusa', id, giorno: giornoSettimana(data) });
    }
    if (voce.fine > G.fine) voce.oltre = voce.fine - Math.max(voce.inizio, G.fine);
    voci.push(voce);
    t = voce.fine; visite += d;
    uscita = v.esce;
  });

  // l'evento: c'è davvero quel giorno? Si arriva in tempo?
  if (C.evento && ids.includes(C.evento.id)) {
    if (!data || !C.evento.giorni[data]) avvisi.push({ tipo: 'evento-assente', data });
    const e = voci.find(v => v.tipo === 'tappa' && v.id === C.evento!.id) as Extract<Voce, { tipo: 'tappa' }>;
    if (e.ritardo) avvisi.push({ tipo: 'evento-tardi', ritardo: e.ritardo });
  }
  // la giornata non ci sta: si propongono le ultime tappe che finiscono oltre (l'evento resta dov'è)
  if (t > G.fine) {
    const daSpostare = voci.filter((v): v is Extract<Voce, { tipo: 'tappa' }> => v.tipo === 'tappa' && v.fine > G.fine && v.id !== C.evento?.id).map(v => v.id);
    avvisi.push({ tipo: 'piena', fine: t, limite: G.fine, daSpostare });
  }
  // tappe lontane dalle altre
  for (const l of lontane(C, it, g)) avvisi.push(l);
  return { voci, inizio: G.inizio, fine: t, visite, spostamenti, metri, n, avvisi };
}

// Quanti minuti aggiunge una tappa inserita nel punto migliore di una lista (andata e ritorno)
function inserimento(C: Citta, s: Scenario, lista: string[], id: string) {
  const x = capi(C, id)[0];
  if (!lista.length) return 0;
  const c = lista.map(i => capi(C, i)[0]);
  let best = minuti(C, s, x.esce, c[0].entra);
  best = Math.min(best, minuti(C, s, c[c.length - 1].esce, x.entra));
  for (let k = 0; k < c.length - 1; k++) {
    best = Math.min(best, minuti(C, s, c[k].esce, x.entra) + minuti(C, s, x.esce, c[k + 1].entra) - minuti(C, s, c[k].esce, c[k + 1].entra));
  }
  return best;
}

// Le tappe che allungano molto la giornata, con il giorno (o un giorno nuovo) dove starebbero meglio
export function lontane(C: Citta, it: Itinerario, g: number): Extract<Avviso, { tipo: 'lontana' }>[] {
  const G = it.giorni[g];
  const ids = G.tappe.filter(id => tappaDi(C, id)?.tipo === 'citta');
  if (ids.length < 3) return [];
  const s = scenarioDi(dataDelGiorno(it, g), G.inizio, it.piedi);
  const out: Extract<Avviso, { tipo: 'lontana' }>[] = [];
  for (const id of ids) {
    if (G.ok?.includes(id)) continue;
    const extra = inserimento(C, s, ids.filter(x => x !== id), id);
    if (extra < LONTANA) continue;
    // un altro giorno in città dove costa meno; altrimenti un giorno vuoto; altrimenti un giorno nuovo
    // (indice = numero dei giorni)
    let giorno = it.giorni.length, meglio = extra - 10;
    it.giorni.forEach((A, k) => {
      if (k === g || A.gita) return;
      const altre = A.tappe.filter(x => tappaDi(C, x)?.tipo === 'citta');
      if (!altre.length) return;
      const e = inserimento(C, s, altre, id);
      if (e < meglio) { meglio = e; giorno = k; }
    });
    if (giorno === it.giorni.length) {
      const vuoto = it.giorni.findIndex((A, k) => k !== g && !A.gita && !A.tappe.length);
      if (vuoto >= 0) giorno = vuoto;
    }
    out.push({ tipo: 'lontana', id, extra: Math.max(5, Math.round(extra / 5) * 5), giorno });
  }
  return out.sort((a, b) => b.extra - a.extra);
}

// ---------- L'ordine più corto ----------
// La prima tappa resta la prima (è da lì che parti) e l'evento resta dov'è; le altre si mettono nell'ordine
// che fa spendere meno minuti negli spostamenti. Fino a 11 tappe per tratto si provano tutti gli ordini
// (programmazione dinamica di Held-Karp, con i due versi dei percorsi a piedi); oltre, si migliora a scambi.
function migliorTratto(C: Citta, s: Scenario, primo: string | null, liberi: string[], ultimo: string | null): string[] {
  if (liberi.length < 2) return liberi;
  const c = liberi.map(id => capi(C, id));
  const p0 = primo ? capi(C, primo) : null;
  const pz = ultimo ? capi(C, ultimo)[0].entra : null;
  const m = liberi.length;
  if (m > 11) return scambi(C, s, primo, liberi, ultimo);
  const N = 1 << m;
  // costo[mask][ultimo][verso]
  const costo = new Float64Array(N * m * 2).fill(Infinity);
  const prec = new Int32Array(N * m * 2).fill(-1);
  const idx = (mask: number, j: number, o: number) => (mask * m + j) * 2 + o;
  for (let j = 0; j < m; j++) for (let o = 0; o < c[j].length; o++) {
    const inizio = p0 ? Math.min(...p0.map(q => minuti(C, s, q.esce, c[j][o].entra))) : 0;
    costo[idx(1 << j, j, o)] = inizio;
  }
  for (let mask = 1; mask < N; mask++) for (let j = 0; j < m; j++) {
    if (!(mask & (1 << j))) continue;
    for (let o = 0; o < c[j].length; o++) {
      const v = costo[idx(mask, j, o)];
      if (v === Infinity) continue;
      for (let k = 0; k < m; k++) {
        if (mask & (1 << k)) continue;
        for (let q = 0; q < c[k].length; q++) {
          const nm = mask | (1 << k), w = v + minuti(C, s, c[j][o].esce, c[k][q].entra);
          if (w < costo[idx(nm, k, q)]) { costo[idx(nm, k, q)] = w; prec[idx(nm, k, q)] = idx(mask, j, o); }
        }
      }
    }
  }
  let best = Infinity, fine = -1;
  for (let j = 0; j < m; j++) for (let o = 0; o < c[j].length; o++) {
    const v = costo[idx(N - 1, j, o)] + (pz != null ? minuti(C, s, c[j][o].esce, pz) : 0);
    if (v < best) { best = v; fine = idx(N - 1, j, o); }
  }
  const ordine: string[] = [];
  for (let x = fine; x >= 0; x = prec[x]) ordine.push(liberi[Math.floor(x / 2) % m]);
  return ordine.reverse();
}

// Per i tratti lunghi: inserimento più vicino, poi scambi a due (2-opt) finché migliora
function scambi(C: Citta, s: Scenario, primo: string | null, liberi: string[], ultimo: string | null) {
  const tot = (o: string[]) => {
    const seq = [...(primo ? [primo] : []), ...o, ...(ultimo ? [ultimo] : [])];
    let v = 0;
    for (let k = 1; k < seq.length; k++) v += minuti(C, s, capi(C, seq[k - 1])[0].esce, capi(C, seq[k])[0].entra);
    return v;
  };
  let o = [...liberi], v = tot(o), meglio = true;
  while (meglio) {
    meglio = false;
    for (let i = 0; i < o.length - 1; i++) for (let j = i + 1; j < o.length; j++) {
      const p = [...o.slice(0, i), ...o.slice(i, j + 1).reverse(), ...o.slice(j + 1)];
      const w = tot(p);
      if (w < v - 0.5) { o = p; v = w; meglio = true; }
    }
  }
  return o;
}

export function ordinePiuCorto(C: Citta, it: Itinerario, g: number): { ordine: string[]; risparmio: number } | null {
  const G = it.giorni[g];
  const ev = C.evento?.id;
  const T = G.tappe.filter(id => tappaDi(C, id)?.tipo === 'citta' || id === ev);
  if (G.gita || T.length < 3) return null;
  const s = scenarioDi(dataDelGiorno(it, g), G.inizio, it.piedi);
  const k = ev ? T.indexOf(ev) : -1;
  let ordine: string[];
  if (k < 0) ordine = [T[0], ...migliorTratto(C, s, T[0], T.slice(1), null)];
  else if (k === 0) ordine = [ev!, ...migliorTratto(C, s, ev!, T.slice(1), null)];
  else {
    const prima = [T[0], ...migliorTratto(C, s, T[0], T.slice(1, k), ev!)];
    ordine = [...prima, ev!, ...migliorTratto(C, s, ev!, T.slice(k + 1), null)];
  }
  if (ordine.join() === T.join()) return null;
  // controllo con gli orari veri (i mezzi cambiano con l'ora)
  const ora = calcolaGiorno(C, it, g).spostamenti;
  const prova = { ...it, giorni: it.giorni.map((x, i) => (i === g ? { ...x, tappe: ordine } : x)) };
  const dopo = calcolaGiorno(C, prova, g).spostamenti;
  const risparmio = ora - dopo;
  return risparmio >= RISPARMIO_MINIMO ? { ordine, risparmio } : null;
}
