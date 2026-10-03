// La mappa di base per la pagina degli itinerari (mare, isole, parchi, strade, moli): la stessa di
// src/components/Mappa.astro, in un file a parte che la pagina scarica solo quando apri la mappa.
import type { APIRoute } from 'astro';
import M from '../../../data/mappa.json';

export const GET: APIRoute = () => new Response(
  JSON.stringify({ w: M.w, h: M.h, mare: M.sea, isole: M.islands, parchi: M.parks, strade: M.roads, moli: M.piers.areas }),
  { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
);
