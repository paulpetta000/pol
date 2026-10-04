// Tappe degli itinerari (src/data/tappe.yaml) con le loro schede, i testi (src/testi/tappe.yaml) e i tempi
// tra una tappa e l'altra (src/data/tempi-tappe.json, fatti da scripts/itinerari/costruisci.mjs).
//
// Se qualcosa non torna la build si ferma:
// - una tappa in città fuori dal riquadro della mappa;
// - una scheda (orari, prezzi, viaggio) che manca o non ha fonte; le schede scadute fanno scrivere l'avviso
//   «[da ricontrollare]» come nelle altre pagine;
// - una tappa senza il suo testo, o un testo senza tappa; i testi passano dai controlli di src/lib/testi.ts;
// - i tempi calcolati per tappe diverse da quelle di oggi (una tappa nuova o spostata): vanno rifatti con
//   node scripts/itinerari/costruisci.mjs <cartella>.
import { getCollection, type CollectionEntry } from 'astro:content';
import { createHash } from 'node:crypto';
import { getFatti, type Fatto } from './fatti';
import { getTesti, type Blocco } from './testi';
import tempi from '../data/tempi-tappe.json';
import { BOX } from '../../scripts/mappa/riquadro.mjs';

export type Tappa = CollectionEntry<'tappe'> & { schede: Map<string, Fatto>; testo: Blocco };

export const ZONE = {
  'centro-storico': 'Centro storico',
  'toledo-plebiscito': 'Toledo e Plebiscito',
  lungomare: 'Lungomare e Santa Lucia',
  vomero: 'Vomero',
  'sanita-capodimonte': 'Sanità e Capodimonte',
  'posillipo-bagnoli': 'Posillipo e Bagnoli',
  vesuvio: 'Pompei, Ercolano e Vesuvio',
  isole: 'Le isole',
  dintorni: 'Caserta, Sorrento e dintorni'
} as const;

// Impronta delle posizioni delle tappe in città, in ordine di id: la stessa formula è in scripts/itinerari/costruisci.mjs
let avvisoBus = false;
export const firmaPosizioni = (tappe: { id: string; lat: number; lon: number; fine?: { lat: number; lon: number } }[]) =>
  createHash('sha1').update(JSON.stringify([...tappe].sort((a, b) => a.id.localeCompare(b.id)).map(t => [t.id, t.lat, t.lon, t.fine ? [t.fine.lat, t.fine.lon] : null]))).digest('hex').slice(0, 12);

let cache: Promise<Tappa[]> | null = null;
export function getTappe(): Promise<Tappa[]> {
  if (!cache || import.meta.env.DEV) cache = carica();
  return cache;
}

async function carica(): Promise<Tappa[]> {
  const tutte = await getCollection('tappe');
  const T = await getTesti('tappe');
  const errori: string[] = [];

  const tappe: Tappa[] = [];
  for (const t of tutte) {
    const d = t.data;
    if (d.tipo === 'citta') {
      for (const p of [d, d.fine].filter(Boolean) as { lat: number; lon: number }[]) {
        if (p.lat < BOX.s || p.lat > BOX.n || p.lon < BOX.w || p.lon > BOX.e) errori.push(`${t.id}: il punto ${p.lat}, ${p.lon} è fuori dal riquadro della mappa`);
      }
    }
    const ids = [d.orari, d.prezzi, d.viaggio].filter(Boolean).map(r => r!.id);
    const schede = await getFatti(ids);
    if (!T.blocchi.includes(t.id)) { errori.push(`${t.id}: manca il testo in src/testi/tappe.yaml`); continue; }
    tappe.push({ ...t, schede, testo: T.b(t.id) });
  }
  for (const b of T.blocchi) if (!tutte.some(t => t.id === b)) errori.push(`src/testi/tappe.yaml: il testo "${b}" non corrisponde a nessuna tappa`);

  // i tempi devono essere stati calcolati con le tappe di oggi
  // i punti dei tempi: le tappe in città e i locali di «Dove mangiare» (src/data/locali.yaml)
  const citta = [
    ...tutte.filter(t => t.data.tipo === 'citta').map(t => ({ id: t.id, lat: t.data.lat, lon: t.data.lon, fine: t.data.fine })),
    ...(await getCollection('locali')).map(l => ({ id: l.id, lat: l.data.lat, lon: l.data.lon, fine: undefined }))
  ];
  const punti = citta.flatMap(t => t.fine ? [t.id, `${t.id}>`] : [t.id]).sort();
  if (tempi.firma !== firmaPosizioni(citta) || [...tempi.punti].sort().join() !== punti.join()) {
    errori.push('I tempi tra le tappe (src/data/tempi-tappe.json) sono stati calcolati con tappe diverse da quelle di oggi: rifalli con node scripts/itinerari/costruisci.mjs <cartella>');
  }
  // l'orario degli autobus ANM vale fino a una data: dopo, la build avvisa (aggiornamenti/fonti-dati.yaml, anm-gtfs)
  const bus = (tempi.dati as { bus?: { al?: string } }).bus;
  const oggi = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  if (bus?.al && bus.al < oggi && !avvisoBus) {
    avvisoBus = true;
    console.warn(`\x1b[33m[da ricontrollare]\x1b[0m l'orario degli autobus ANM nei tempi tra le tappe valeva fino al ${bus.al}: riscarica il feed e rifai i tempi (aggiornamenti/fonti-dati.yaml, riga anm-gtfs)`);
  }
  if (errori.length) throw new Error(`Itinerari da sistemare (${errori.length}):\n- ${errori.join('\n- ')}`);
  return tappe;
}

// Per la build: carica tutto e fa tutti i controlli, senza creare pagine
export async function controllaTappe() {
  await getTappe();
}
