// Impostazioni generali della guida
export const SITO = {
  nome: 'Napoli a Vela',
  // Identificatore breve (calendari .ics, nomi tecnici)
  sigla: 'napoli-a-vela',
  sottotitolo: 'Guida per il 2027',
  url: 'https://napoli-a-vela.vercel.app',
  lingua: 'it',
  // Data dell'ultimo controllo generale delle informazioni
  aggiornato: '2026-09-30',
  // Titolare del sito (pagine privacy, note legali, accessibilità)
  titolare: {
    nome: 'Enrico Licenziati',
    email: 'napoliavela.guida@gmail.com'
  },
  // Supabase: chiave pubblica ("publishable"), pensata per stare nel browser.
  // La tabella accetta solo nuove iscrizioni: non si può leggere nulla.
  supabase: {
    url: 'https://hcicqbcmtfksraabphie.supabase.co',
    chiave: 'sb_publishable_0vL-4Jmm2LItXJM9B0x6cA_dkClq8zt'
  },
  // Data dell'ultima modifica di privacy e termini (va anche nelle iscrizioni ad Avvisami)
  versionePrivacy: '2026-10-03',
  versioneTermini: '2026-10-01'
} as const;

// Itinerari (Rilascio 3): con false, schede, fonti e foto degli itinerari (id «tp-») restano fuori
// dalle pagine Fonti e Note legali. La pagina /napoli/itinerari/ è online dal blocco 2.
// (Fuori da SITO perché SITO finisce anche nello script di ogni pagina.)
export const ITINERARI_ONLINE = true;

// Le date chiave del 2027 (fonte: americascup.com, comunicati 4148 e 4372)
export const DATE = {
  primaRegata: '2027-05-22',
  finaleLvcEntro: '2027-07-04',
  youth: ['2027-06-02', '2027-06-06'],
  womens: ['2027-07-05', '2027-07-09'],
  matchInizio: '2027-07-10',
  matchEntro: '2027-07-19'
} as const;
