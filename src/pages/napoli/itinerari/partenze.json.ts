// Gli orari veri dei bus per la pagina degli itinerari (specifiche/bus-orari-veri.md): le partenze ANM
// (src/data/partenze-bus.json) e, per ogni coppia di punti e scenario, la strada senza bus e le strade con il bus
// da valutare con le partenze (src/data/tempi-tappe.json, fatti da scripts/itinerari/costruisci.mjs).
// La pagina lo carica dopo essersi aperta; il service worker lo salva per l'uso senza rete.
import type { APIRoute } from 'astro';
import T from '../../../data/tempi-tappe.json';
import P from '../../../data/partenze-bus.json';

type Scen = { min: number[][]; piedi: number[][]; mezzi?: string[][]; senza?: { min: number[][]; piedi: number[][]; mezzi: string[][] }; bus?: (number | number[])[][] };

export function partenze() {
  if (P.firma !== T.firma) throw new Error('Le partenze dei bus (src/data/partenze-bus.json) non corrispondono ai tempi: rifai tutto con node scripts/itinerari/costruisci.mjs <cartella>');
  const dizionario: string[] = [];
  const voce = (s: string) => { let i = dizionario.indexOf(s); if (i < 0) { i = dizionario.length; dizionario.push(s); } return i; };
  const n = T.punti.length;
  const senza: Record<string, number[]> = {}, bus: Record<string, number[]> = {};
  for (const [nome, S] of Object.entries(T.scenari as Record<string, Scen>)) {
    if (!S.senza || !S.bus) continue;
    const s: number[] = [], b: number[] = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const ij = i * n + j;
      // la strada senza bus, solo dove è diversa da quella di sempre
      if (S.senza.min[i][j] !== S.min[i][j] || S.senza.mezzi[i][j] !== S.mezzi![i][j]) s.push(ij, S.senza.min[i][j], Math.round(S.senza.piedi[i][j] / 10), voce(S.senza.mezzi[i][j]));
      const c = S.bus[i][j];
      if (Array.isArray(c) && c.length) b.push(ij, c.length, ...c);
    }
    senza[nome] = s; bus[nome] = b;
  }
  const candidati = (T.candidati as { seg: (number | string)[]; m: number; mezzi: string }[]).map(c => [c.seg, Math.round(c.m / 10), voce(c.mezzi)]);
  return { firma: T.firma, preferenza: (T.dati.bus as unknown as { preferenza: number }).preferenza, dal: P.dal, al: P.al, giorni: P.giorni, tipi: P.tipi, fermate: P.fermate, dizionario, candidati, senza, bus };
}

export const GET: APIRoute = () => new Response(JSON.stringify(partenze()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
