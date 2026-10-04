// Locali di «Dove mangiare» (src/data/locali.yaml) con le loro schede e i testi (src/testi/locali.yaml).
// Nel compositore degli itinerari sono tappe in città (src/lib/itinerari/napoli.ts), con gli stessi tempi.
//
// Se qualcosa non torna la build si ferma:
// - un locale con lo stesso id di una tappa;
// - gli orari: ogni giorno della settimana una volta sola, fasce scritte bene, e ogni ora deve comparire nel testo
//   della scheda degli orari (così il campo «apertura», che usa il compositore, non si allontana dalla scheda);
// - una scheda (orari, prezzi, perché, rinomato per) che manca o non ha fonte;
// - un locale senza il suo testo, o un testo senza locale; i testi passano dai controlli di src/lib/testi.ts.
// Il menu ha una data di controllo: dopo il 30/04/2027 la build avvisa che va ricontrollato.
import { getCollection, type CollectionEntry } from 'astro:content';
import { getFatti, type Fatto } from './fatti';
import { getTesti, type Blocco } from './testi';

export const GIORNI = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'] as const;
export type Giorno = typeof GIORNI[number];

// Fasce di prezzo: il «pasto base» (src/testi/dove-mangiare.yaml, blocco «fasce») fino a 15 €, fino a 35 €, oltre
export const SOGLIE = [15, 35] as const;
export const fasciaDi = (euro?: number): 0 | 1 | 2 | 3 => (euro == null ? 0 : euro <= SOGLIE[0] ? 1 : euro <= SOGLIE[1] ? 2 : 3);

// Durata tipica nel compositore: spuntino 20 minuti, pizzeria 60, pasto 75 (si cambia con «durata»)
export const durataDi = (d: { durata?: number; cucina: string[] }) =>
  d.durata ?? (d.cucina.every(c => c === 'dolci' || c === 'strada') ? 20 : d.cucina[0] === 'pizza' ? 60 : 75);

export const CUCINE: Record<string, string> = {
  napoletana: 'Cucina napoletana', pasta: 'Pasta', pesce: 'Pesce', pizza: 'Pizza', carne: 'Carne', strada: 'Cibo di strada', dolci: 'Dolci e caffè'
};
export const PASTI: Record<string, string> = { pranzo: 'Pranzo', cena: 'Cena', spuntino: 'Spuntino' };
export const PIATTI: Record<string, string> = {
  margherita: 'Pizza margherita', marinara: 'Pizza marinara', 'pizza-fritta': 'Pizza fritta', cuoppo: 'Cuoppo di fritti', frittatina: 'Frittatina di pasta',
  montanara: 'Montanara', genovese: 'Genovese', ragu: 'Ragù', 'pasta-patate': 'Pasta e patate con la provola', vongole: 'Spaghetti alle vongole',
  frittura: 'Frittura di pesce', polpette: 'Polpette al ragù', parmigiana: 'Parmigiana di melanzane', baccala: 'Baccalà',
  sfogliatella: 'Sfogliatella', baba: 'Babà', pastiera: 'Pastiera', caffe: 'Caffè'
};
const RICONTROLLO_MENU = new Date('2027-04-30');

// Gli orari di una settimana: per ogni giorno (0 = lunedì) le fasce [inizio, fine, inizio, fine…] in minuti dalla
// mezzanotte (la fine può passare le 24:00; −1 = ora di chiusura non scritta); [] = chiuso; null = non scritto
export type Settimana = (number[] | null)[];

const minuti = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const ORA = /^([01]?\d|2[0-4]):[0-5]\d$/;

export function leggiApertura(a: Record<string, string>): { settimana: Settimana; ore: string[]; errori: string[] } {
  const settimana: (number[] | null | undefined)[] = new Array(7).fill(undefined);
  const ore: string[] = [], errori: string[] = [];
  for (const [chiave, valore] of Object.entries(a)) {
    const [da, a2] = chiave.split('-') as Giorno[];
    const i = GIORNI.indexOf(da), j = GIORNI.indexOf(a2 ?? da);
    const giorni: number[] = [];
    for (let k = i; ; k = (k + 1) % 7) { giorni.push(k); if (k === j) break; }
    let v: number[] | null;
    const s = valore.trim();
    if (s === 'chiuso') v = [];
    else if (s === '?') v = null;
    else {
      v = [];
      for (const f of s.split(',').map(x => x.trim())) {
        const [x, y] = f.split('-');
        if (!ORA.test(x) || !(y === '?' || ORA.test(y))) { errori.push(`fascia "${f}" scritta male (va scritta «12:00-15:30»)`); continue; }
        const inizio = minuti(x);
        let fine = y === '?' ? -1 : minuti(y);
        if (fine !== -1 && fine <= inizio) fine += 24 * 60;   // finisce dopo la mezzanotte
        if (v.length && v[v.length - 1] !== -1 && inizio < v[v.length - 1]) errori.push(`le fasce di "${chiave}" si accavallano`);
        v.push(inizio, fine);
        ore.push(x, ...(y === '?' ? [] : [y]));
      }
    }
    for (const g of giorni) {
      if (settimana[g] !== undefined) errori.push(`il ${GIORNI[g]} compare due volte negli orari`);
      settimana[g] = v;
    }
  }
  settimana.forEach((v, g) => { if (v === undefined) errori.push(`manca il ${GIORNI[g]} negli orari (scrivi «chiuso» o «?» se serve)`); });
  return { settimana: settimana.map(v => v ?? null), ore, errori };
}

// «07:00» e «7:00», «24:00» e «00:00» si equivalgono nel testo della scheda
const normale = (s: string) => s.replace(/(^|[^\d:])0(\d):/g, '$1$2:');
const nelTesto = (ora: string, testo: string) => {
  const t = normale(testo), o = normale(ora);
  return t.includes(o) || (o === '24:00' && /\b(0?0:00|mezzanotte)\b/.test(t)) || (o === '0:00' && t.includes('24:00'));
};

export type Locale = CollectionEntry<'locali'> & {
  schede: Map<string, Fatto>;
  testo: Blocco;
  settimana: Settimana;
  fascia: 0 | 1 | 2 | 3;
  durata: number;
  chiuso: Giorno[];
};

let cache: Promise<Locale[]> | null = null;
export function getLocali(): Promise<Locale[]> {
  if (!cache || import.meta.env.DEV) cache = carica();
  return cache;
}

let avvisoMenu = false;
async function carica(): Promise<Locale[]> {
  const tutti = await getCollection('locali');
  const tappe = new Set((await getCollection('tappe')).map(t => t.id));
  const T = await getTesti('locali');
  const errori: string[] = [];
  const out: Locale[] = [];
  for (const l of tutti) {
    const d = l.data;
    if (tappe.has(l.id)) errori.push(`${l.id}: c'è già una tappa con questo id (src/data/tappe.yaml)`);
    const ids = [d.orari.id, d.prezzi?.id, d.perche.id, d.rinomatoPer?.scheda.id].filter(Boolean) as string[];
    const schede = await getFatti(ids);
    const { settimana, ore, errori: e } = leggiApertura(d.apertura);
    for (const x of e) errori.push(`${l.id}: ${x}`);
    const testoOrari = schede.get(d.orari.id)!.data.testo;
    for (const o of new Set(ore)) if (!nelTesto(o, testoOrari)) errori.push(`${l.id}: l'ora ${o} di «apertura» non compare nella scheda ${d.orari.id}`);
    if (!T.blocchi.includes(l.id)) { errori.push(`${l.id}: manca il testo in src/testi/locali.yaml`); continue; }
    if (d.menu && new Date() > RICONTROLLO_MENU && !avvisoMenu) {
      avvisoMenu = true;
      console.warn(`\x1b[33m[da ricontrollare]\x1b[0m i menu dei locali (src/data/locali.yaml) andavano ricontrollati entro il 30/04/2027`);
    }
    out.push({
      ...l, schede, testo: T.b(l.id), settimana, fascia: fasciaDi(d.prezzoBase), durata: durataDi(d),
      chiuso: GIORNI.filter((_, g) => settimana[g]?.length === 0)
    });
  }
  for (const b of T.blocchi) if (!tutti.some(l => l.id === b)) errori.push(`src/testi/locali.yaml: il testo "${b}" non corrisponde a nessun locale`);
  if (errori.length) throw new Error(`Locali da sistemare (${errori.length}):\n- ${errori.join('\n- ')}`);
  return out;
}

// Gli orari di un giorno, in parole brevi («12:00–15:30 e 19:00–23:30», «chiuso», «orario non pubblicato»)
export const ora = (m: number) => `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, '0')}`;
export function orariDelGiorno(v: number[] | null): string {
  if (v === null) return 'orario non pubblicato';
  if (!v.length) return 'chiuso';
  const f: string[] = [];
  for (let k = 0; k < v.length; k += 2) f.push(v[k + 1] === -1 ? `dalle ${ora(v[k])}` : `${ora(v[k])}–${ora(v[k + 1])}`);
  return f.join(' e ');
}
