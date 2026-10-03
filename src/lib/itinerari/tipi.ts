// Il compositore degli itinerari non sa niente di Napoli: riceve una città fatta di tappe, tempi tra le tappe
// e, se c'è, un evento (le regate) con i suoi giorni. Così si può riusare per un'altra città.
import type { GiornoSettimana } from './date';

// Come si gira quel giorno a quell'ora (vedi scripts/itinerari/costruisci.mjs)
export type Scenario = 'feriale' | 'sabato' | 'sabato-pomeriggio' | 'domenica' | 'festivo' | 'piedi';
export const SCENARI: Scenario[] = ['feriale', 'sabato', 'sabato-pomeriggio', 'domenica', 'festivo', 'piedi'];

export interface Tappa {
  id: string;
  nome: string;
  breve: string;
  tipo: 'citta' | 'gita';
  zona: string;
  generi: string[];
  durata: number;
  chiuso: GiornoSettimana[];
  alChiuso: 'si' | 'no' | 'in-parte';
  gradini?: 'no' | 'pochi' | 'molti';
  bambini: 'si' | 'attenzione';
  momento: 'mattina' | 'pomeriggio' | 'sera' | 'quando-vuoi';
  ingresso: 'gratis' | 'pagamento' | 'in-parte';
  prenotazione: 'no' | 'consigliata' | 'obbligatoria';
  avviso?: 'chiuso-in-parte';
  foto?: string;           // miniatura quadrata
  inizio?: string;         // percorsi a piedi: da dove si parte e dove si arriva
  fine?: string;
  reversibile: boolean;
  partenza?: string;       // gite: da dove si parte
  xy: [number, number];    // posizione sulla mappa (unità della mappa)
  xyFine?: [number, number];
  p: number;               // indice del punto nei tempi (−1 per le gite)
  pf?: number;             // indice del punto d'arrivo dei percorsi a piedi
}

// Tempi tra i punti: matrici n×n in righe (i*n+j), per scenario
export interface Tempi {
  n: number;
  min: Record<Scenario, number[]>;
  metri: Record<Scenario, number[]>;
  mezzi: Record<Scenario, string[]>;
}

// Un evento con i suoi giorni (per Napoli: le regate). Il blocco si mette in una giornata come una tappa,
// ma ha un'ora d'inizio fissa e si propone solo nei giorni dell'evento.
export interface Evento {
  id: string;
  nome: string;
  p: number;
  xy: [number, number];
  durata: number;
  inizio: number;
  giorni: Record<string, { titolo: string; possibile?: boolean; riserva?: boolean }>;
  primo: string;
  ultimo: string;
}

export interface Citta {
  tappe: Tappa[];
  tempi: Tempi;
  evento?: Evento;
  linee: Record<string, string>;
  zone: Record<string, string>;
}

export interface Giorno {
  tappe: string[];
  inizio: number;          // minuti dalla mezzanotte
  fine: number;
  gita?: string;
  ok?: string[];           // tappe lontane che hai deciso di lasciare dove sono
}

export interface Itinerario {
  id: string;
  nome: string;
  data?: string;           // data del primo giorno (AAAA-MM-GG); gli altri seguono
  piedi?: boolean;         // solo a piedi, senza mezzi
  giorni: Giorno[];
  creato: number;
  modificato: number;
}

export type Voce =
  | { tipo: 'tappa'; id: string; n: number; inizio: number; fine: number; indietro?: boolean; chiusa?: boolean; attesa?: number; ritardo?: number; oltre?: number }
  | { tipo: 'tratto'; min: number; metri: number; mezzi: string[]; ascensori: string[]; scenario: Scenario; da: number; a: number };

export type Avviso =
  | { tipo: 'piena'; fine: number; limite: number; daSpostare: string[] }
  | { tipo: 'lontana'; id: string; extra: number; giorno: number }
  | { tipo: 'chiusa'; id: string; giorno: GiornoSettimana }
  | { tipo: 'evento-assente'; data?: string }
  | { tipo: 'evento-tardi'; ritardo: number };

export interface Risultato {
  voci: Voce[];
  inizio: number;
  fine: number;
  visite: number;
  spostamenti: number;
  metri: number;
  n: number;
  avvisi: Avviso[];
}
