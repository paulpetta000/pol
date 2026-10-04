// Il compositore degli itinerari non sa niente di Napoli: riceve una città fatta di tappe, tempi tra le tappe
// e, se c'è, un evento (le regate) con i suoi giorni. Così si può riusare per un'altra città.
import type { GiornoSettimana } from './date';

// Come si gira quel giorno a quell'ora (vedi scripts/itinerari/costruisci.mjs)
export type Scenario = 'feriale' | 'sabato' | 'sabato-pomeriggio' | 'domenica' | 'festivo' | 'piedi';
export const SCENARI: Scenario[] = ['feriale', 'sabato', 'sabato-pomeriggio', 'domenica', 'festivo', 'piedi'];
// Lo scenario da cui si parte per ricostruire ciascuno (scenari.json): le differenze sono più piccole
export const PRIMA: Partial<Record<Scenario, Scenario>> = { sabato: 'feriale', 'sabato-pomeriggio': 'sabato', domenica: 'feriale', festivo: 'domenica', piedi: 'feriale' };

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
  ll?: [number, number];   // latitudine e longitudine dell'ingresso (tappe in città: per la posizione del telefono)
  xyFine?: [number, number];
  p: number;               // indice del punto nei tempi (−1 per le gite)
  pf?: number;             // indice del punto d'arrivo dei percorsi a piedi
  // Locali di «Dove mangiare» (src/data/locali.yaml): tappe in città con gli orari giorno per giorno
  categoria?: 'mangiare';
  orari?: (number[] | null)[];   // 0 = lunedì: fasce [inizio, fine…] in minuti (fine −1: non scritta); [] chiuso; null non scritto
  cucina?: string[];
  pasto?: string[];
  fascia?: 0 | 1 | 2 | 3;        // € €€ €€€ (0: senza fascia)
  piatti?: string[];
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

// Gli orari veri dei bus (specifiche/bus-orari-veri.md): arrivano dopo l'apertura della pagina
// (/napoli/itinerari/partenze.json) e valgono solo nelle date del feed ANM.
export interface Vivo {
  dal: string;                                   // date del feed, AAAAMMGG
  al: string;
  giorni: Record<string, number>;                // data AAAAMMGG -> tipo di giorno
  salite: Map<string, number[]>[];               // per tipo di giorno: «linea|salita» -> partenze (minuti)
  viaggi: Map<string, { min: number; partenze?: number[] }>[];   // «linea|salita|discesa» -> viaggio (e partenze, se diverse)
  fermate: Record<string, string>;               // nome delle fermate
  preferenza: number;                            // il bus si sceglie solo se fa risparmiare almeno tanti minuti
  candidati: { seg: (number | string)[]; metri: number; mezzi: string }[];   // strade con il bus: minuti fissi e corse
  senza: Partial<Record<Scenario, Map<number, { min: number; metri: number; mezzi: string }>>>;   // strada senza bus, dove cambia
  bus: Partial<Record<Scenario, Map<number, number[]>>>;   // coppia (i*n+j) -> strade con il bus da provare
}

export interface Citta {
  tappe: Tappa[];
  tempi: Tempi;
  evento?: Evento;
  linee: Record<string, string>;
  zone: Record<string, string>;
  vivo?: Vivo;
}

// Il momento in cui guardi la pagina: data e ora del telefono e, se l'hai permesso, la tappa dove sei
export interface Adesso {
  data: string;            // AAAA-MM-GG
  ora: number;             // minuti dalla mezzanotte
  qui?: string;            // tappa a meno di 200 m (dal GPS)
}

export interface Giorno {
  tappe: string[];
  inizio: number;          // minuti dalla mezzanotte
  fine: number;
  gita?: string;
  ok?: string[];           // tappe lontane che hai deciso di lasciare dove sono
  fatte?: string[];        // tappe segnate «Fatto» (solo sul telefono, non nel link)
}

export interface Itinerario {
  id: string;
  nome: string;
  data?: string;           // data del primo giorno (AAAA-MM-GG); gli altri seguono
  piedi?: boolean;         // solo a piedi, senza mezzi
  posizione?: 'si' | 'no'; // la risposta al pannello della posizione (solo sul telefono)
  giorni: Giorno[];
  creato: number;
  modificato: number;
}

export type Voce =
  | { tipo: 'tappa'; id: string; n: number; inizio: number; fine: number; indietro?: boolean; chiusa?: boolean; chiusaOra?: { apre?: number; chiude?: number }; attesa?: number; ritardo?: number; oltre?: number; fatta?: boolean; inCorso?: boolean }
  | {
    tipo: 'tratto'; min: number; metri: number; mezzi: string[]; ascensori: string[]; scenario: Scenario; da: number; a: number;
    variante?: 'senza' | number;   // strada diversa da quella di sempre (orari veri): senza bus o con un bus scelto
    corse?: Corsa[];               // le partenze vere dei bus usati
    scartato?: Corsa;              // il bus di sempre che a quell'ora non conviene aspettare
  };

// Una corsa in bus con l'orario vero: linea, fermata di salita (nome) e ora di partenza
export interface Corsa { linea: string; da: string; ora: number }

export type Avviso =
  | { tipo: 'piena'; fine: number; limite: number; daSpostare: string[] }
  | { tipo: 'lontana'; id: string; extra: number; giorno: number }
  | { tipo: 'chiusa'; id: string; giorno: GiornoSettimana }
  | { tipo: 'chiusa-ora'; id: string; apre?: number; chiude?: number }   // un locale chiuso a quell'ora (apre: la prossima apertura del giorno) o che chiude prima della fine
  | { tipo: 'evento-assente'; data?: string }
  | { tipo: 'evento-tardi'; ritardo: number }
  | { tipo: 'vicino'; id: string; prima: string[] };   // sei a una tappa che non è la prossima: queste, non fatte, vanno dopo

export interface Risultato {
  voci: Voce[];
  inizio: number;
  fine: number;
  visite: number;
  spostamenti: number;
  metri: number;
  n: number;
  avvisi: Avviso[];
  vivo?: boolean;          // calcolata dal vivo (oggi, con l'ora del telefono)
  tutteFatte?: boolean;    // dal vivo: hai fatto tutte le tappe
  orariVeri?: boolean;     // bus con le partenze vere (data dentro l'orario ANM)
}
