import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Fonte = CollectionEntry<'fonti'>;
export type Fatto = CollectionEntry<'fatti'> & { fontiRisolte: Fonte[] };

let cacheFonti: Map<string, Fonte> | null = null;
let avvisati = new Set<string>();

export async function tutteLeFonti() {
  if (!cacheFonti) cacheFonti = new Map((await getCollection('fonti')).map(f => [f.id, f]));
  return cacheFonti;
}

// Restituisce le schede richieste, con le fonti già risolte.
// Se una scheda manca la build si ferma; se è da ricontrollare, la build avvisa.
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
    out.set(id, { ...f, fontiRisolte: risolte });
  }
  return out;
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
  const peso = { ufficiale: 0, dati: 1, stampa: 2, altro: 3 } as const;
  return [...m.values()].sort((a, b) => peso[a.data.tipo] - peso[b.data.tipo] || a.data.editore.localeCompare(b.data.editore));
}

// Data di controllo più recente di un gruppo di schede
export function ultimoControllo(fatti: Iterable<Fatto>): Date | null {
  let d: Date | null = null;
  for (const f of fatti) if (!d || f.data.controllato > d) d = f.data.controllato;
  return d;
}

export const ETICHETTA_STATO = {
  confermato: 'Confermato',
  stampa: 'Dalla stampa',
  atteso: 'Non ancora uscito'
} as const;

export const SPIEGA_STATO = {
  confermato: 'Letto su una fonte ufficiale o su dati pubblici',
  stampa: 'Riportato da giornali o siti non ufficiali, senza conferma ufficiale',
  atteso: 'Cercato: gli organizzatori non l\'hanno ancora pubblicato'
} as const;
