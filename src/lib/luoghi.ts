import { getCollection } from 'astro:content';
// Ordine fisso dei punti da cui guardare (i numeri sulla mappa)
export const ORDINE_VISTE = ['rotonda-diaz', 'villa-comunale', 'via-partenope', 'castel-dell-ovo', 'monte-echia', 'san-martino', 'capo-posillipo', 'parco-virgiliano'];
export async function vistaOrdinata() {
  const v = (await getCollection('luoghi')).filter(l => l.data.tipo === 'vista');
  return v.sort((a, b) => ORDINE_VISTE.indexOf(a.id) - ORDINE_VISTE.indexOf(b.id));
}
