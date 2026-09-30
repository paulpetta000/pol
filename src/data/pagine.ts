// Elenco delle pagine per la mappa del sito (sitemap.xml) e le immagini di anteprima
export type Pagina = { path: string; titolo: string; kicker: string };

export const PAGINE: Pagina[] = [
  { path: '/', titolo: "L'America's Cup è a Napoli", kicker: 'Guida non ufficiale 2027' },
  { path: '/come-vederla/', titolo: 'Come vedere la Coppa', kicker: 'Vederla' },
  { path: '/come-vederla/dal-lungomare/', titolo: 'Gratis dal lungomare', kicker: 'Vederla' },
  { path: '/come-vederla/dal-mare/', titolo: 'Dal mare, con la tua barca', kicker: 'Vederla' },
  { path: '/come-vederla/biglietti-e-ospitalita/', titolo: 'Biglietti e ospitalità', kicker: 'Vederla' },
  { path: '/come-vederla/in-tv-e-streaming/', titolo: 'In TV e in streaming', kicker: 'Vederla' },
  { path: '/calendario/', titolo: 'Le date del 2027', kicker: 'Calendario' },
  { path: '/napoli/', titolo: "Napoli, istruzioni per l'uso", kicker: 'Napoli' },
  { path: '/napoli/mappa/', titolo: 'Mappa: dove guardare le regate', kicker: 'Napoli' },
  { path: '/napoli/come-arrivare/', titolo: 'Come arrivare e muoversi', kicker: 'Napoli' },
  { path: '/napoli/accessibilita/', titolo: 'Accessibilità', kicker: 'Napoli' },
  { path: '/squadre/', titolo: 'Chi gareggia: 7 squadre', kicker: 'Squadre' },
  { path: '/squadre/barche/', titolo: 'AC75 e AC40: le barche', kicker: 'Squadre' },
  { path: '/archivio-2026/', titolo: 'Le regate del 2026', kicker: 'Archivio' },
  { path: '/domande-frequenti/', titolo: 'Domande frequenti', kicker: 'Risposte veloci' },
  { path: '/fonti/', titolo: 'Fonti e controlli', kicker: 'Trasparenza' },
  { path: '/privacy/', titolo: 'Privacy', kicker: 'Trasparenza' },
  { path: '/note-legali/', titolo: 'Note legali', kicker: 'Trasparenza' },
  { path: '/accessibilita/', titolo: 'Accessibilità del sito', kicker: 'Trasparenza' }
];

export const slugOg = (path: string) => (path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '--'));
