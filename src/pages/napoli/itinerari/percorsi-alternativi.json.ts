// I disegni delle strade alternative (senza bus, o con il bus degli orari veri) per la mappa degli itinerari:
// la pagina li carica solo quando la mappa ne deve disegnare uno (scripts/itinerari/costruisci.mjs)
import type { APIRoute } from 'astro';
import A from '../../../data/percorsi-alternativi.json';
import T from '../../../data/tempi-tappe.json';

if (A.firma !== T.firma) throw new Error('I disegni alternativi (src/data/percorsi-alternativi.json) non corrispondono ai tempi: rifai tutto con node scripts/itinerari/costruisci.mjs <cartella>');

export const GET: APIRoute = () => new Response(
  JSON.stringify({ firma: A.firma, senza: A.senza, candidati: A.candidati }),
  { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
);
