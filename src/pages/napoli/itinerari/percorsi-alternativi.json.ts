// I disegni delle strade alternative (senza bus, o con il bus degli orari veri) per la mappa degli itinerari:
// la pagina li carica solo quando la mappa ne deve disegnare uno (scripts/itinerari/costruisci.mjs)
import type { APIRoute } from 'astro';
import A from '../../../data/percorsi-alternativi.json';

export const GET: APIRoute = () => new Response(
  JSON.stringify({ firma: A.firma, senza: A.senza, candidati: A.candidati }),
  { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
);
