import { getCollection, type CollectionEntry } from 'astro:content';

// Gruppi dei punti da cui guardare: stesso colore sulla mappa e nelle schede
export const GRUPPI = {
  lungomare: { nome: 'Lungomare', sotto: 'In prima fila, sul mare' },
  colline: { nome: 'Colline', sotto: 'Pizzofalcone e Vomero, dall\'alto' },
  posillipo: { nome: 'Posillipo', sotto: 'Dall\'alto, sopra Mergellina' }
} as const;
export type Gruppo = keyof typeof GRUPPI;

// Ordine fisso dei punti (i numeri sulla mappa): per gruppo, da ovest a est
export const ORDINE_VISTE = [
  'villa-comunale', 'rotonda-diaz', 'via-partenope', 'castel-dell-ovo',
  'via-aniello-falcone', 'villa-floridiana', 'san-martino', 'monte-echia',
  'via-petrarca', 'via-orazio', 'sant-antonio-posillipo'
];

export async function vistaOrdinata() {
  const v = (await getCollection('luoghi')).filter(l => l.data.tipo === 'vista');
  const fuori = v.filter(l => !ORDINE_VISTE.includes(l.id)).map(l => l.id);
  if (fuori.length) throw new Error(`Punti senza posto in ORDINE_VISTE (src/lib/luoghi.ts): ${fuori.join(', ')}`);
  return v.sort((a, b) => ORDINE_VISTE.indexOf(a.id) - ORDINE_VISTE.indexOf(b.id));
}

// Punti divisi per gruppo, con il numero progressivo
export async function vistePerGruppo() {
  const viste = await vistaOrdinata();
  return (Object.keys(GRUPPI) as Gruppo[]).map(g => ({
    id: g,
    ...GRUPPI[g],
    punti: viste.map((l, i) => ({ l, n: i + 1 })).filter(x => x.l.data.gruppo === g)
  })) as { id: Gruppo; nome: string; sotto: string; punti: { l: CollectionEntry<'luoghi'>; n: number }[] }[];
}
