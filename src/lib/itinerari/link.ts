// Itinerari nel link e nella memoria del telefono. Il link porta tutto dopo il «#»: il browser non lo
// manda a nessun server. Esempio:
//   #n=Due+giorni&d=2027-07-15&g=0930-1900.duomo.sansevero.tribunali&g=0930-1900.@pompei
// n = nome, d = data del primo giorno, w = 1 solo a piedi, g = un giorno: orari, tappe (@ = gita).
import { dataValida } from './date';
import { tappaDi } from './calcolo';
import type { Citta, Giorno, Itinerario } from './tipi';

export const INIZIO = 9 * 60 + 30;
export const FINE = 19 * 60;
export const MAX_GIORNI = 7;
export const MAX_TAPPE = 14;
export const MAX_NOME = 60;

export const nuovoId = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`).replace(/-/g, '').slice(0, 16);
export const giornoVuoto = (inizio = INIZIO, fine = FINE): Giorno => ({ tappe: [], inizio, fine });
export function nuovoItinerario(nome: string, giorni: Giorno[] = [giornoVuoto()]): Itinerario {
  const ora = Date.now();
  return { id: nuovoId(), nome, giorni, creato: ora, modificato: ora };
}

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}${String(m % 60).padStart(2, '0')}`;
const minutiHhmm = (s: string) => (/^\d{4}$/.test(s) ? +s.slice(0, 2) * 60 + +s.slice(2) : NaN);

export function codifica(it: Itinerario): string {
  const p = new URLSearchParams();
  if (it.nome) p.set('n', it.nome);
  if (it.data) p.set('d', it.data);
  if (it.piedi) p.set('w', '1');
  for (const g of it.giorni) p.append('g', [`${hhmm(g.inizio)}-${hhmm(g.fine)}`, ...(g.gita ? [`@${g.gita}`] : g.tappe)].join('.'));
  return p.toString();
}

// Giorno valido: orari plausibili, tappe che esistono, niente doppioni, gita da sola
function sistemaGiorno(C: Citta, g: Partial<Giorno> | undefined, scartate: string[]): Giorno {
  const inizio = Number.isFinite(g?.inizio) && g!.inizio! >= 5 * 60 && g!.inizio! <= 20 * 60 ? Math.round(g!.inizio!) : INIZIO;
  let fine = Number.isFinite(g?.fine) && g!.fine! <= 24 * 60 ? Math.round(g!.fine!) : FINE;
  if (fine < inizio + 60) fine = Math.min(24 * 60, inizio + 60);
  const gita = typeof g?.gita === 'string' && tappaDi(C, g.gita)?.tipo === 'gita' ? g.gita : undefined;
  if (typeof g?.gita === 'string' && !gita) scartate.push(g.gita);
  const viste = new Set<string>();
  const tappe = gita ? [] : (Array.isArray(g?.tappe) ? g!.tappe : []).filter(id => {
    const ok = typeof id === 'string' && !viste.has(id) && (tappaDi(C, id)?.tipo === 'citta' || id === C.evento?.id);
    if (typeof id === 'string' && !ok && !viste.has(id)) scartate.push(id);
    if (ok) viste.add(id);
    return ok;
  }).slice(0, MAX_TAPPE);
  const ok = Array.isArray(g?.ok) ? g!.ok.filter(id => tappe.includes(id)) : undefined;
  const fatte = Array.isArray(g?.fatte) ? g!.fatte.filter(id => tappe.includes(id)) : undefined;
  return { tappe, inizio, fine, ...(gita ? { gita } : {}), ...(ok?.length ? { ok } : {}), ...(fatte?.length ? { fatte } : {}) };
}

// Un itinerario letto dalla memoria o da un link: tiene solo ciò che è valido e dice cosa ha scartato
export function sistema(C: Citta, x: Partial<Itinerario>): { it: Itinerario; scartate: string[] } {
  const scartate: string[] = [];
  const giorni = (Array.isArray(x.giorni) ? x.giorni : []).slice(0, MAX_GIORNI).map(g => sistemaGiorno(C, g, scartate));
  const ora = Date.now();
  return {
    it: {
      id: typeof x.id === 'string' && /^[a-z0-9]{6,32}$/i.test(x.id) ? x.id : nuovoId(),
      nome: (typeof x.nome === 'string' && x.nome.trim() ? x.nome.trim() : 'Itinerario').slice(0, MAX_NOME),
      ...(dataValida(x.data) ? { data: x.data } : {}),
      ...(x.piedi ? { piedi: true } : {}),
      ...(x.posizione === 'si' || x.posizione === 'no' ? { posizione: x.posizione } : {}),
      giorni: giorni.length ? giorni : [giornoVuoto()],
      creato: Number.isFinite(x.creato) ? x.creato! : ora,
      modificato: Number.isFinite(x.modificato) ? x.modificato! : ora
    },
    scartate
  };
}

export function decodifica(C: Citta, hash: string): { it: Itinerario; scartate: string[] } | null {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  const gg = p.getAll('g');
  if (!gg.length) return null;
  const giorni = gg.map(s => {
    const [orari, ...resto] = s.split('.');
    const [a, b] = (orari || '').split('-');
    const gita = resto.length === 1 && resto[0].startsWith('@') ? resto[0].slice(1) : undefined;
    return { inizio: minutiHhmm(a || ''), fine: minutiHhmm(b || ''), tappe: gita ? [] : resto, ...(gita ? { gita } : {}) };
  });
  return sistema(C, { nome: p.get('n') || 'Itinerario ricevuto', data: p.get('d') || undefined, piedi: p.get('w') === '1', giorni });
}

// Due itinerari con le stesse giornate (per non salvare due volte lo stesso link)
export const uguali = (a: Itinerario, b: Itinerario) => {
  const x = (it: Itinerario) => codifica({ ...it, nome: '' });
  return x(a) === x(b);
};
