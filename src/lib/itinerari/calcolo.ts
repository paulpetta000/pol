// Calcolo di una giornata: orari, spostamenti, avvisi e ordine più corto. Funzioni pure, senza DOM:
// le usa la pagina (src/scripts/itinerari/) e la build, che controlla gli itinerari pronti.
import { giornoSettimana, tipoGiorno, piuGiorni } from './date';
import type { Adesso, Avviso, Citta, Corsa, Giorno, Itinerario, Risultato, Scenario, Tappa, Vivo, Voce } from './tipi';
import type { GiornoSettimana } from './date';

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

// Un locale (orari giorno per giorno) a quell'ora: va bene, oppure è chiuso (apre: la prossima apertura del giorno)
// o chiude prima della fine (chiude). Senza data valgono tutti i giorni con l'orario scritto: avvisa solo se a
// quell'ora è chiuso in tutti. Orari non scritti: nessun avviso. Le fasce che passano la mezzanotte non contano
// il giorno dopo: le giornate cominciano dalle 5:00 e oltre la mezzanotte non si controlla.
const GIORNI_ORARI: GiornoSettimana[] = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];
function apertoAOra(f: number[], t: number, d: number): { apre?: number; chiude?: number } | null {
  let apre: number | undefined, chiude: number | undefined;
  for (let k = 0; k < f.length; k += 2) {
    const a = f[k], b = f[k + 1];
    if (t >= a && (b === -1 || t < b)) {
      if (b === -1 || t + d <= b) return null;
      chiude = b;
    } else if (a > t && (apre == null || a < apre)) apre = a;
  }
  return chiude != null ? { chiude } : apre != null ? { apre } : {};
}
export function orarioLocale(t: Tappa, data: string | undefined, inizio: number, d: number): { apre?: number; chiude?: number } | null {
  if (!t.orari || inizio >= 24 * 60) return null;
  if (data) {
    const f = t.orari[GIORNI_ORARI.indexOf(giornoSettimana(data))];
    return f && f.length ? apertoAOra(f, inizio, d) : null;
  }
  const giorni = t.orari.filter((f): f is number[] => !!f && f.length > 0);
  if (!giorni.length) return null;
  const r = giorni.map(f => apertoAOra(f, inizio, d));
  if (r.some(x => x === null)) return null;
  const apre = r.map(x => x!.apre).filter((x): x is number => x != null);
  const chiude = r.map(x => x!.chiude).filter((x): x is number => x != null);
  return chiude.length ? { chiude: Math.max(...chiude) } : apre.length ? { apre: Math.min(...apre) } : {};
}

const durataDi = (C: Citta, id: string) => (C.evento && id === C.evento.id ? C.evento.durata : tappaDi(C, id)!.durata);

// ---------- Orari veri dei bus (specifiche/bus-orari-veri.md) ----------
const dataGtfs = (d: string) => d.replace(/-/g, '');
// Le partenze vere valgono solo nelle date dell'orario ANM (fuori, per esempio nel 2027, resta l'attesa media)
export const conOrariVeri = (C: Citta, data?: string) => !!(C.vivo && data && C.vivo.giorni[dataGtfs(data)] != null);

// Una strada con il bus partendo all'ora t0: i minuti fissi (a piedi, metro…) e, per ogni corsa, il primo bus
// che parte dopo l'arrivo alla fermata, più il viaggio. Se non si può: «oggi» (quel giorno la corsa non c'è)
// o «tardi» (a quell'ora non passa più).
function valuta(V: Vivo, tipo: number, seg: (number | string)[], t0: number): { min: number; corse: Corsa[] } | { no: 'oggi' | 'tardi' } {
  let t = t0;
  const corse: Corsa[] = [];
  for (const x of seg) {
    if (typeof x === 'number') { t += x; continue; }
    const [linea, a] = x.split('|');
    const v = V.viaggi[tipo]?.get(x);
    const partenze = v?.partenze ?? V.salite[tipo]?.get(`${linea}|${a}`);
    if (!v || !partenze) return { no: 'oggi' };
    const ora = partenze.find(m => m >= t);
    if (ora == null) return { no: 'tardi' };
    corse.push({ linea, da: V.fermate[a] ?? a, ora });
    t = ora + v.min;
  }
  return { min: t - t0, corse };
}

type Tratto = Extract<Voce, { tipo: 'tratto' }>;
// Lo spostamento da un punto all'altro partendo all'ora t: i tempi di sempre (attesa media) o, se la data è
// nell'orario ANM, la strada migliore tra quella senza bus e quelle con il bus valutate con le partenze vere
function spostamento(C: Citta, s: Scenario, da: number, a: number, t: number, data?: string): Tratto {
  const ij = da * C.tempi.n + a;
  const voce = (min: number, metri: number, mezzi: string): Tratto => {
    const parti = mezzi.split('+').filter(Boolean);
    return { tipo: 'tratto', min, metri, scenario: s, da, a, mezzi: parti.filter(x => !x.startsWith('asc:')), ascensori: parti.filter(x => x.startsWith('asc:')).map(x => x.slice(4)) };
  };
  const sempre = voce(minuti(C, s, da, a), C.tempi.metri[s][ij] ?? 0, C.tempi.mezzi[s]?.[ij] || '');
  const V = C.vivo;
  if (s === 'piedi' || !V || !data || da === a) return sempre;
  const tipo = V.giorni[dataGtfs(data)];
  if (tipo == null) return sempre;
  const sz = V.senza[s]?.get(ij);
  // senza bus: se la strada di sempre non usa il bus è lei
  const senza = sz ? { ...voce(sz.min, sz.metri, sz.mezzi), variante: 'senza' as const } : sempre;
  const sempreBus = sempre.mezzi.some(m => m.startsWith('B'));
  const lista = V.bus[s]?.get(ij) ?? [];
  let meglio: Tratto = senza;
  for (const k of lista) {
    const c = V.candidati[k];
    const r = valuta(V, tipo, c.seg, t);
    if ('no' in r) continue;
    const min = Math.round(r.min);
    if (min > senza.min - V.preferenza || min >= meglio.min) continue;
    // la prima strada della lista è quella di sempre, quando usa il bus: stesso disegno
    meglio = { ...voce(min, c.metri, c.mezzi), corse: r.corse, ...(sempreBus && k === lista[0] ? {} : { variante: k }) };
  }
  // il bus di sempre a quell'ora non conviene: diciamo quando passa (ora −1: non passa più; −2: oggi non passa)
  if (sempreBus && !meglio.corse && lista.length) {
    const r = valuta(V, tipo, V.candidati[lista[0]].seg, t);
    const linea = sempre.mezzi.find(m => m.startsWith('B'))!;
    meglio = { ...meglio, scartato: 'no' in r ? { linea, da: '', ora: r.no === 'oggi' ? -2 : -1 } : r.corse[0] };
  }
  return meglio;
}

// La giornata g dell'itinerario, con orari e avvisi. Con «adesso» (la pagina, il giorno stesso) la giornata è
// dal vivo: le tappe fatte restano senza orari, si riparte dall'ora del telefono e dalla tappa dove sei
// (o dall'ultima fatta), e le tappe che mancano slittano.
export function calcolaGiorno(C: Citta, it: Itinerario, g: number, adesso?: Adesso): Risultato {
  const G = it.giorni[g];
  const data = dataDelGiorno(it, g);
  const ids = G.tappe.filter(id => tappaDi(C, id) || (C.evento && id === C.evento.id));
  const vivo = !!adesso && !!data && adesso.data === data && !G.gita;
  const fatte = new Set(vivo ? (G.fatte ?? []).filter(id => ids.includes(id)) : []);
  let restano = ids.filter(id => !fatte.has(id));
  const base = scenarioDi(data, G.inizio, it.piedi);
  const voci: Voce[] = [];
  const avvisi: Avviso[] = [];
  let t = G.inizio, visite = 0, spostamenti = 0, metri = 0;
  let uscita: number | null = null;
  // le tappe fatte, in cima e senza orari
  for (const id of ids) if (fatte.has(id)) voci.push({ tipo: 'tappa', id, n: ids.indexOf(id) + 1, inizio: -1, fine: -1, fatta: true });
  // dal vivo, dopo l'inizio della giornata: da dove e da quando si riparte
  let inCorso: { id: string; inizio: number; fine: number } | null = null;
  if (vivo && !restano.length) t = adesso!.ora;   // tutte fatte
  if (vivo && adesso!.ora > G.inizio && restano.length) {
    const qui = adesso!.qui && restano.includes(adesso!.qui) ? adesso!.qui : undefined;
    if (qui && qui === restano[0]) {
      // sei alla prossima tappa: la lasci quando finisce la visita prevista dal piano del giorno, o adesso se è
      // già tardi; se sei in anticipo, la visita comincia adesso. Si conta il tempo da adesso.
      const piano = calcolaGiorno(C, it, g);
      const v = piano.voci.find(x => x.tipo === 'tappa' && x.id === qui) as Extract<Voce, { tipo: 'tappa' }>;
      const ora = adesso!.ora;
      inCorso = { id: qui, inizio: ora, fine: ora < v.inizio ? ora + durataDi(C, qui) : Math.max(v.fine, ora) };
      t = ora;
    } else if (qui) {
      // sei a un'altra tappa: è quella in corso (appena arrivato) e le tappe prima, non segnate «Fatto»,
      // vengono dopo; la pagina lo dice, perché non sappiamo se le hai fatte
      avvisi.push({ tipo: 'vicino', id: qui, prima: restano.slice(0, restano.indexOf(qui)) });
      restano = [qui, ...restano.filter(id => id !== qui)];
      inCorso = { id: qui, inizio: adesso!.ora, fine: adesso!.ora + durataDi(C, qui) };
      t = adesso!.ora;
    } else {
      // l'ultima tappa segnata «Fatto» (l'ordine dei tocchi)
      const ultima = [...(G.fatte ?? [])].reverse().find(id => fatte.has(id));
      if (ultima) uscita = capi(C, ultima)[0].esce;
      t = adesso!.ora;
    }
  }
  const orariVeri = !it.piedi && conOrariVeri(C, data);
  const verso = versi(C, restano, base) as Capi;
  restano.forEach((id, k) => {
    const v = verso[k];
    if (uscita != null) {
      const s = scenarioDi(data, t, it.piedi);
      const tr = spostamento(C, s, uscita, v.entra, t, data);
      voci.push(tr);
      t += tr.min; spostamenti += tr.min; metri += tr.metri;
    }
    const voce: Extract<Voce, { tipo: 'tappa' }> = { tipo: 'tappa', id, n: ids.indexOf(id) + 1, inizio: t, fine: t };
    if (C.evento && id === C.evento.id) {
      if (t < C.evento.inizio) { voce.attesa = C.evento.inizio - t; t = C.evento.inizio; voce.inizio = t; }
      else if (t > C.evento.inizio) voce.ritardo = t - C.evento.inizio;
    }
    const d = durataDi(C, id);
    voce.fine = t + d;
    if (inCorso?.id === id) { voce.inCorso = true; voce.inizio = inCorso.inizio; voce.fine = inCorso.fine; }
    if (v.indietro) voce.indietro = true;
    if (data && tappaDi(C, id)?.chiuso.includes(giornoSettimana(data))) {
      voce.chiusa = true;
      avvisi.push({ tipo: 'chiusa', id, giorno: giornoSettimana(data) });
    } else if (tappaDi(C, id)?.orari && !voce.inCorso) {
      // un locale: aperto a quell'ora e per tutto il pasto?
      const o = orarioLocale(tappaDi(C, id)!, data, voce.inizio, d);
      if (o) { voce.chiusaOra = o; avvisi.push({ tipo: 'chiusa-ora', id, ...o }); }
    }
    if (voce.fine > G.fine) voce.oltre = voce.fine - Math.max(voce.inizio, G.fine);
    voci.push(voce);
    t = voce.fine; visite += voce.fine - voce.inizio;
    uscita = v.esce;
  });
  // dal vivo la giornata comincia da dove riparti (la prima tappa che manca), altrimenti all'ora scelta
  const inizio = vivo ? Math.min(...voci.filter((v): v is Extract<Voce, { tipo: 'tappa' }> => v.tipo === 'tappa' && !v.fatta).map(v => v.inizio), t) : G.inizio;

  // l'evento: c'è davvero quel giorno? Si arriva in tempo?
  if (C.evento && ids.includes(C.evento.id) && !fatte.has(C.evento.id)) {
    if (!data || !C.evento.giorni[data]) avvisi.push({ tipo: 'evento-assente', data });
    const e = voci.find(v => v.tipo === 'tappa' && v.id === C.evento!.id) as Extract<Voce, { tipo: 'tappa' }>;
    if (e.ritardo) avvisi.push({ tipo: 'evento-tardi', ritardo: e.ritardo });
  }
  // la giornata non ci sta: si propongono le ultime tappe che finiscono oltre (l'evento resta dov'è)
  if (t > G.fine) {
    const daSpostare = voci.filter((v): v is Extract<Voce, { tipo: 'tappa' }> => v.tipo === 'tappa' && !v.fatta && v.fine > G.fine && v.id !== C.evento?.id && !v.inCorso).map(v => v.id);
    avvisi.push({ tipo: 'piena', fine: t, limite: G.fine, daSpostare });
  }
  // tappe lontane dalle altre (solo tra quelle che mancano)
  for (const l of lontane(C, it, g, fatte)) avvisi.push(l);
  return { voci, inizio, fine: t, visite, spostamenti, metri, n: ids.length, avvisi, ...(vivo ? { vivo } : {}), ...(vivo && ids.length && !restano.length ? { tutteFatte: true } : {}), ...(orariVeri ? { orariVeri } : {}) };
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
export function lontane(C: Citta, it: Itinerario, g: number, fatte: Set<string> = new Set()): Extract<Avviso, { tipo: 'lontana' }>[] {
  const G = it.giorni[g];
  const ids = G.tappe.filter(id => tappaDi(C, id)?.tipo === 'citta' && !fatte.has(id));
  if (ids.length < 3) return [];
  const s = scenarioDi(dataDelGiorno(it, g), G.inizio, it.piedi);
  const out: Extract<Avviso, { tipo: 'lontana' }>[] = [];
  for (const id of ids) {
    if (G.ok?.includes(id) || tappaDi(C, id)!.categoria === 'mangiare') continue;
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
// La prima tappa resta la prima (è da lì che parti) e l'evento e i locali restano dove sono; le altre si mettono nell'ordine
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
  // le regate e i locali (il pranzo resta all'ora del pranzo) restano al loro posto: si riordina tra l'uno e l'altro
  const fissa = (id: string) => id === ev || tappaDi(C, id)?.categoria === 'mangiare';
  const ordine: string[] = [T[0]];
  let prima = T[0], tratto: string[] = [];
  for (const id of T.slice(1)) {
    if (!fissa(id)) { tratto.push(id); continue; }
    ordine.push(...migliorTratto(C, s, prima, tratto, id), id);
    prima = id; tratto = [];
  }
  ordine.push(...migliorTratto(C, s, prima, tratto, null));
  if (ordine.join() === T.join()) return null;
  // controllo con gli orari veri (i mezzi cambiano con l'ora)
  const ora = calcolaGiorno(C, it, g).spostamenti;
  const prova = { ...it, giorni: it.giorni.map((x, i) => (i === g ? { ...x, tappe: ordine } : x)) };
  const dopo = calcolaGiorno(C, prova, g).spostamenti;
  const risparmio = ora - dopo;
  return risparmio >= RISPARMIO_MINIMO ? { ordine, risparmio } : null;
}
