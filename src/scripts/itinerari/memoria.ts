// Gli itinerari nella memoria del browser (localStorage). Nessun server: restano su questo telefono.
// Se il browser non permette di salvare (navigazione privata, memoria piena) la pagina funziona lo stesso,
// ma lo dice: l'itinerario si perde alla chiusura, a meno di mandarlo con il link.
import { sistema } from '../../lib/itinerari/link';
import type { Citta, Itinerario } from '../../lib/itinerari/tipi';

const CHIAVE = 'itinerari-v1';
export type Archivio = { attivo: string; elenco: Itinerario[] };

export function leggi(C: Citta): Archivio | null {
  try {
    const x = JSON.parse(localStorage.getItem(CHIAVE) || 'null');
    if (!x || !Array.isArray(x.elenco)) return null;
    const elenco = x.elenco.slice(0, 50).map((i: Partial<Itinerario>) => sistema(C, i).it);
    if (!elenco.length) return null;
    return { attivo: elenco.some((i: Itinerario) => i.id === x.attivo) ? x.attivo : elenco[0].id, elenco };
  } catch {
    return null;
  }
}

// true se è stato salvato
export function scrivi(a: Archivio): boolean {
  try {
    localStorage.setItem(CHIAVE, JSON.stringify({ v: 1, ...a }));
    return true;
  } catch {
    return false;
  }
}

// Un altro tab ha cambiato gli itinerari
export const quandoCambia = (fn: () => void) => addEventListener('storage', e => { if (e.key === CHIAVE) fn(); });
