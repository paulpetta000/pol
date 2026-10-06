import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { ITINERARI_ONLINE } from '../config/sito';
import { confermataConFontiDeboli } from './regole.mjs';

// Schede, fonti e foto degli itinerari (id «tp-»): restano fuori dagli elenchi generali (Fonti, Note legali)
// finché la pagina degli itinerari non è online
export const soloItinerari = (id: string) => !ITINERARI_ONLINE && id.startsWith('tp-');

export type Fonte = CollectionEntry<'fonti'>;
export type Fatto = CollectionEntry<'fatti'> & { fontiRisolte: Fonte[] };

let cacheFonti: Map<string, Fonte> | null = null;
const avvisati = new Set<string>();
const avvisatiDeboli = new Set<string>();
const avvisatiComeFatto = new Set<string>();

export async function tutteLeFonti() {
  if (!cacheFonti) cacheFonti = new Map((await getCollection('fonti')).map(f => [f.id, f]));
  return cacheFonti;
}

// Restituisce le schede richieste, con le fonti già risolte.
// Se una scheda manca la build si ferma; se è da ricontrollare, o se è «confermata» ma ha solo fonti
// deboli (enciclopedia, blog, altro), la build avvisa senza fermarsi.
export async function getFatti(ids: string[]): Promise<Map<string, Fatto>> {
  const fonti = await tutteLeFonti();
  const out = new Map<string, Fatto>();
  for (const id of ids) {
    const f = await getEntry('fatti', id);
    if (!f) throw new Error(`Scheda "${id}" non trovata in src/data/fatti.yaml`);
    const risolte = f.data.fonti.map(r => {
      const fonte = fonti.get(r.id);
      if (!fonte) throw new Error(`Fonte "${r.id}" della scheda "${id}" non trovata in src/data/fonti.yaml`);
      return fonte;
    });
    if (f.data.ricontrollare && f.data.ricontrollare < new Date() && !avvisati.has(id)) {
      avvisati.add(id);
      console.warn(`\x1b[33m[da ricontrollare]\x1b[0m la scheda "${id}" andava ricontrollata entro il ${f.data.ricontrollare.toISOString().slice(0, 10)}`);
    }
    if (confermataConFontiDeboli(f.data.stato, risolte.map(r => r.data.tipo)) && !avvisatiDeboli.has(id)) {
      avvisatiDeboli.add(id);
      console.warn(`\x1b[33m[fonti deboli]\x1b[0m la scheda "${id}" è confermata ma ha solo fonti di tipo ${[...new Set(risolte.map(r => r.data.tipo))].join(', ')}: aggiungi una fonte ufficiale, di dati o di stampa, oppure cambia lo stato`);
    }
    if (f.data.comeFatto && f.data.stato !== 'confermato' && !avvisatiComeFatto.has(id)) {
      avvisatiComeFatto.add(id);
      console.warn(`\x1b[33m[da verificare]\x1b[0m la scheda "${id}" si scrive come fatto ma è letta su ${[...new Set(risolte.filter(r => r.data.tipo !== 'ufficiale').map(r => r.data.editore))].join(', ')}: verificala sulla fonte originale (il sito della guida o del locale) e cambia lo stato in «confermato»`);
    }
    out.set(id, { ...f, fontiRisolte: risolte });
  }
  return out;
}

// Fonti richieste per id (glossario, storia, quiz): se una manca la build si ferma
export async function getFonti(ids: Iterable<string>): Promise<Fonte[]> {
  const tutte = await tutteLeFonti();
  return [...new Set(ids)].map(id => {
    const f = tutte.get(id);
    if (!f) throw new Error(`Fonte "${id}" non trovata in src/data/fonti.yaml`);
    return f;
  });
}

export const fatto = (m: Map<string, Fatto>, id: string) => {
  const f = m.get(id);
  if (!f) throw new Error(`Scheda "${id}" non caricata: aggiungila all'elenco della pagina`);
  return f;
};

// Fonti uniche di un gruppo di schede, ufficiali prima
export function fontiDi(fatti: Iterable<Fatto>, extra: Fonte[] = []): Fonte[] {
  const m = new Map<string, Fonte>();
  for (const f of fatti) for (const s of f.fontiRisolte) m.set(s.id, s);
  for (const s of extra) m.set(s.id, s);
  const peso = { ufficiale: 0, dati: 1, stampa: 2, enciclopedia: 3, blog: 4, altro: 5 } as const;
  return [...m.values()].sort((a, b) => peso[a.data.tipo] - peso[b.data.tipo] || a.data.editore.localeCompare(b.data.editore));
}

// Data di controllo più vecchia tra schede e fonti: tutto è stato controllato almeno da quel giorno
export function controlloMenoRecente(fatti: Iterable<Fatto>, fonti: Iterable<Fonte> = []): Date | null {
  let d: Date | null = null;
  for (const x of [...fatti, ...fonti]) if (!d || x.data.controllato < d) d = x.data.controllato;
  return d;
}
