// I tempi di sabato, domenica, festivi e «solo a piedi» per la pagina degli itinerari, come differenze dagli altri
// (scenariPacco). La pagina li carica dopo essersi aperta; il service worker li salva per l'uso senza rete.
import type { APIRoute } from 'astro';
import { cittaNapoli, scenariPacco } from '../../../lib/itinerari/napoli';

export const GET: APIRoute = async () => new Response(JSON.stringify(scenariPacco(await cittaNapoli())), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
