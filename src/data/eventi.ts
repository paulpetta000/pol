// Calendario 2027. Ogni evento rimanda alla scheda che ne è la fonte.
// chi: 'tutte' = le 7 squadre; 'sfidanti' = solo sfidanti; 'match' = Defender e vincitore della Louis Vuitton Cup
export type Evento = {
  id: string;
  gara: 'lvc' | 'youth' | 'womens' | 'match' | 'pausa';
  titolo: string;
  breve: string;
  inizio: string;
  fine: string;
  riserva?: string;
  // Dal giorno indicato fino a "fine" le regate sono possibili ma non sicure (la sfida può finire prima)
  possibiliDal?: string;
  // Data chiave da mettere in evidenza nel calendario (etichetta breve)
  chiave?: string;
  chi: 'tutte' | 'sfidanti' | 'match' | 'nessuno';
  condizionale?: string;
  testo: string;
  fatto: string;
};

export const EVENTI: Evento[] = [
  { id: 'lvc-flotta', gara: 'lvc', titolo: 'Louis Vuitton Cup · Regate di flotta', breve: 'Regate di flotta', inizio: '2027-05-22', fine: '2027-05-23', chiave: 'Prima regata', chi: 'tutte', testo: 'Tre regate al giorno con tutti e 7 gli AC75 sulla stessa linea di partenza.', fatto: 'cal-flotta' },
  { id: 'lvc-rr1', gara: 'lvc', titolo: 'Louis Vuitton Cup · Round Robin 1', breve: 'Round Robin 1', inizio: '2027-05-26', fine: '2027-05-28', chi: 'tutte', testo: 'Duelli a due barche: 21 regate in tre giorni.', fatto: 'cal-rr' },
  { id: 'lvc-rr2', gara: 'lvc', titolo: 'Louis Vuitton Cup · Round Robin 2', breve: 'Round Robin 2', inizio: '2027-05-29', fine: '2027-05-31', chi: 'tutte', testo: 'Altre 21 regate a due barche.', fatto: 'cal-rr' },
  { id: 'pausa', gara: 'pausa', titolo: 'Pausa della Louis Vuitton Cup', breve: 'Pausa', inizio: '2027-06-01', fine: '2027-06-08', chi: 'nessuno', testo: 'Una settimana senza regate della Louis Vuitton Cup.', fatto: 'cal-pausa' },
  { id: 'youth', gara: 'youth', titolo: "Youth America's Cup", breve: "Youth America's Cup", inizio: '2027-06-02', fine: '2027-06-06', chiave: 'Youth', chi: 'tutte', testo: 'Velisti giovani su AC40, finale secca a due barche.', fatto: 'cal-youth' },
  { id: 'lvc-rr3', gara: 'lvc', titolo: 'Louis Vuitton Cup · Round Robin 3', breve: 'Round Robin 3', inizio: '2027-06-09', fine: '2027-06-11', chi: 'tutte', testo: 'Ultime 21 regate dei gironi: i primi 3 sfidanti vanno in semifinale.', fatto: 'cal-rr' },
  { id: 'lvc-ripescaggio', gara: 'lvc', titolo: 'Louis Vuitton Cup · Ripescaggio', breve: 'Ripescaggio', inizio: '2027-06-12', fine: '2027-06-13', chi: 'sfidanti', condizionale: 'se è tra gli sfidanti dal 4° al 6° posto', testo: 'Gli sfidanti dal 4° al 6° posto si giocano l\'ultimo posto in semifinale.', fatto: 'cal-ripescaggio' },
  { id: 'lvc-semifinali', gara: 'lvc', titolo: 'Louis Vuitton Cup · Semifinali', breve: 'Semifinali', inizio: '2027-06-16', fine: '2027-06-20', riserva: '2027-06-21', chi: 'sfidanti', condizionale: 'se si qualifica', testo: 'Passa chi arriva prima a 5 vittorie. Il 21 giugno è giorno di riserva.', fatto: 'cal-semifinali' },
  { id: 'lvc-finale', gara: 'lvc', titolo: 'Louis Vuitton Cup · Finale', breve: 'Finale LV Cup', inizio: '2027-06-26', fine: '2027-07-04', possibiliDal: '2027-06-28', chi: 'sfidanti', condizionale: 'se arriva in finale', testo: 'Dal weekend del 26–27 giugno, al più tardi fino al 4 luglio. Vince chi arriva prima a 7.', fatto: 'cal-finale-lvc' },
  { id: 'womens', gara: 'womens', titolo: "Women's America's Cup", breve: "Women's America's Cup", inizio: '2027-07-05', fine: '2027-07-09', chiave: "Women's", chi: 'tutte', testo: 'Equipaggi femminili su AC40.', fatto: 'cal-womens' },
  { id: 'match', gara: 'match', titolo: "America's Cup Match", breve: "America's Cup Match", inizio: '2027-07-10', fine: '2027-07-19', possibiliDal: '2027-07-12', chiave: 'Match', chi: 'match', condizionale: 'se vince la Louis Vuitton Cup', testo: 'Emirates Team New Zealand contro il vincitore della Louis Vuitton Cup. Vince chi arriva prima a 7.', fatto: 'cal-match' }
];

export const GARE = {
  lvc: { nome: 'Louis Vuitton Cup', breve: 'LV Cup' },
  youth: { nome: "Youth America's Cup", breve: 'Youth' },
  womens: { nome: "Women's America's Cup", breve: "Women's" },
  match: { nome: "America's Cup Match", breve: 'Match' },
  pausa: { nome: 'Pausa', breve: 'Pausa' }
} as const;

// Eventi a cui prende parte una squadra (per il calendario "segui la tua squadra")
export function eventiDi(ruolo: 'defender' | 'challenger-of-record' | 'sfidante') {
  return EVENTI.filter(e => {
    if (e.chi === 'nessuno') return false;
    if (ruolo === 'defender') return e.chi === 'tutte' ? true : e.chi === 'match';
    return true;
  }).map(e => ({ ...e, condizionale: ruolo === 'defender' && e.id === 'match' ? undefined : e.condizionale }));
}
