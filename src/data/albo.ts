// Albo d'oro dell'era moderna (dal 1983): club, paesi e risultati dal press kit ufficiale,
// nomi delle barche e delle squadre da Wikipedia. Il risultato è sempre vincitore–sconfitto.
export type Match = {
  anno: number;
  sede: string;
  vincitore: { squadra: string; club: string; paese: 'us' | 'au' | 'nz' | 'ch' | 'it' | 'gb' };
  sconfitto: { squadra: string; club: string; paese: 'us' | 'au' | 'nz' | 'ch' | 'it' | 'gb' };
  risultato: string;
  difesa: boolean; // true se ha vinto chi difendeva la Coppa
};

export const ALBO: Match[] = [
  { anno: 2024, sede: 'Barcellona', vincitore: { squadra: 'Emirates Team New Zealand', club: 'Royal New Zealand Yacht Squadron', paese: 'nz' }, sconfitto: { squadra: 'INEOS Britannia', club: 'Royal Yacht Squadron', paese: 'gb' }, risultato: '7–2', difesa: true },
  { anno: 2021, sede: 'Auckland', vincitore: { squadra: 'Emirates Team New Zealand', club: 'Royal New Zealand Yacht Squadron', paese: 'nz' }, sconfitto: { squadra: 'Luna Rossa Prada Pirelli', club: 'Circolo della Vela Sicilia', paese: 'it' }, risultato: '7–3', difesa: true },
  { anno: 2017, sede: 'Bermuda', vincitore: { squadra: 'Team New Zealand', club: 'Royal New Zealand Yacht Squadron', paese: 'nz' }, sconfitto: { squadra: 'Oracle Team USA', club: 'Golden Gate Yacht Club', paese: 'us' }, risultato: '7–1', difesa: false },
  { anno: 2013, sede: 'San Francisco', vincitore: { squadra: 'Oracle Team USA', club: 'Golden Gate Yacht Club', paese: 'us' }, sconfitto: { squadra: 'Team New Zealand', club: 'Royal New Zealand Yacht Squadron', paese: 'nz' }, risultato: '9–8', difesa: true },
  { anno: 2010, sede: 'Valencia', vincitore: { squadra: 'BMW Oracle Racing', club: 'Golden Gate Yacht Club', paese: 'us' }, sconfitto: { squadra: 'Alinghi', club: 'Société Nautique de Genève', paese: 'ch' }, risultato: '2–0', difesa: false },
  { anno: 2007, sede: 'Valencia', vincitore: { squadra: 'Alinghi', club: 'Société Nautique de Genève', paese: 'ch' }, sconfitto: { squadra: 'Team New Zealand', club: 'Royal New Zealand Yacht Squadron', paese: 'nz' }, risultato: '5–2', difesa: true },
  { anno: 2003, sede: 'Auckland', vincitore: { squadra: 'Alinghi', club: 'Société Nautique de Genève', paese: 'ch' }, sconfitto: { squadra: 'Team New Zealand', club: 'Royal New Zealand Yacht Squadron', paese: 'nz' }, risultato: '5–0', difesa: false },
  { anno: 2000, sede: 'Auckland', vincitore: { squadra: 'Team New Zealand', club: 'Royal New Zealand Yacht Squadron', paese: 'nz' }, sconfitto: { squadra: 'Luna Rossa (Prada Challenge)', club: 'Yacht Club Punta Ala', paese: 'it' }, risultato: '5–0', difesa: true },
  { anno: 1995, sede: 'San Diego', vincitore: { squadra: 'Team New Zealand (Black Magic)', club: 'Royal New Zealand Yacht Squadron', paese: 'nz' }, sconfitto: { squadra: 'Young America', club: 'San Diego Yacht Club', paese: 'us' }, risultato: '5–0', difesa: false },
  { anno: 1992, sede: 'San Diego', vincitore: { squadra: 'America³', club: 'San Diego Yacht Club', paese: 'us' }, sconfitto: { squadra: 'Il Moro di Venezia', club: 'Compagnia della Vela', paese: 'it' }, risultato: '4–1', difesa: true },
  { anno: 1988, sede: 'San Diego', vincitore: { squadra: 'Stars & Stripes', club: 'San Diego Yacht Club', paese: 'us' }, sconfitto: { squadra: 'New Zealand (KZ-1)', club: 'Mercury Bay Boating Club', paese: 'nz' }, risultato: '2–0', difesa: true },
  { anno: 1987, sede: 'Fremantle', vincitore: { squadra: 'Stars & Stripes', club: 'San Diego Yacht Club', paese: 'us' }, sconfitto: { squadra: 'Kookaburra III', club: 'Royal Perth Yacht Club', paese: 'au' }, risultato: '4–0', difesa: false },
  { anno: 1983, sede: 'Newport', vincitore: { squadra: 'Australia II', club: 'Royal Perth Yacht Club', paese: 'au' }, sconfitto: { squadra: 'Liberty', club: 'New York Yacht Club', paese: 'us' }, risultato: '4–3', difesa: false }
];

// Fonti della tabella (id in src/data/fonti.yaml)
export const FONTI_ALBO = ['ac-press-kit', 'wiki-coppa'];
