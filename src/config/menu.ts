// Le 4 voci del menu (Pronostici arriverà con il Rilascio 5).
// anche: altre sezioni che accendono la stessa voce (Capire la Coppa sta sotto Squadre)
export const MENU: { href: string; label: string; sotto: string; anche?: string[] }[] = [
  { href: '/come-vederla/', label: 'Vederla', sotto: 'Lungomare, mare, biglietti, TV' },
  { href: '/calendario/', label: 'Calendario', sotto: 'Tutte le date 2027' },
  { href: '/napoli/', label: 'Napoli', sotto: 'Mappa, itinerari, trasporti, accessibilità' },
  { href: '/squadre/', label: 'Squadre', sotto: 'Chi gareggia, le barche, come si regata', anche: ['/capire-la-coppa/'] }
];
