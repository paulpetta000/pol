// Icone della pagina degli itinerari (tratto 2 su 24×24), usate sia nella pagina sia nello script
const P: Record<string, string> = {
  piu: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  su: '<path d="M6 15l6-6 6 6"/>',
  giu: '<path d="M6 9l6 6 6-6"/>',
  maniglia: '<circle cx="9" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.4" fill="currentColor" stroke="none"/>',
  cerca: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  mappa: '<path d="M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  lista: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
  piedi: '<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2-6 3 3v3M12 15l-1-5 4 1 2 3M11 10l-3 2-1 3"/>',
  funicolare: '<rect x="5" y="4" width="14" height="13" rx="2"/><path d="M5 11h14M9 21l1.5-4M15 21l-1.5-4M2 21h20"/>',
  metro: '<rect x="6" y="3" width="12" height="15" rx="3"/><path d="M6 11h12M9 21l1.5-3M15 21l-1.5-3"/><circle cx="9.5" cy="14.5" r=".8" fill="currentColor"/><circle cx="14.5" cy="14.5" r=".8" fill="currentColor"/>',
  bus: '<rect x="4.5" y="3.5" width="15" height="14" rx="2.5"/><path d="M4.5 11h15M4.5 7h15M7.5 17.5V20M16.5 17.5V20"/><circle cx="8" cy="14.3" r=".8" fill="currentColor"/><circle cx="16" cy="14.3" r=".8" fill="currentColor"/>',
  attenzione: '<path d="M12 3.5L2.5 20h19z"/><path d="M12 10v4.5M12 17.5v.5"/>',
  matita: '<path d="M4 20l1-4L16 5l3 3L8 19z"/>',
  freccia: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  avanti: '<path d="M9 6l6 6-6 6"/>',
  calendario: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  condividi: '<path d="M12 4v11M7.5 8.5L12 4l4.5 4.5"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/>',
  cartella: '<path d="M3.5 7a1.5 1.5 0 0 1 1.5-1.5h4.5l2 2.5H19a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.5v.5"/>',
  ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  treno: '<rect x="6" y="3.5" width="12" height="13" rx="2.5"/><path d="M6 10h12M8.5 20.5l2-3.5M15.5 20.5l-2-3.5"/><circle cx="9.5" cy="13.3" r=".8" fill="currentColor"/><circle cx="14.5" cy="13.3" r=".8" fill="currentColor"/>',
  nave: '<path d="M3 15.5l2 4.5h14l2-4.5z"/><path d="M6 15.5V10h12v5.5M9.5 10V6.5h5V10"/>',
  vela: '<path d="M12 3.5v14M12 4.5L5 16h7M12 7l6 9h-6"/><path d="M4 19.5c2.7 1.3 5.3 1.3 8 0s5.3-1.3 8 0"/>',
  copia: '<rect x="8" y="8" width="11.5" height="11.5" rx="1.5"/><path d="M5.5 15.5H5A1.5 1.5 0 0 1 3.5 14V5A1.5 1.5 0 0 1 5 3.5h9A1.5 1.5 0 0 1 15.5 5v.5"/>',
  cestino: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5"/>',
  ricomincia: '<path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4"/>',
  ordina: '<path d="M7 4v16M3.5 16.5L7 20l3.5-3.5M17 20V4M13.5 7.5L17 4l3.5 3.5"/>',
  piatto: '<path d="M7 3v7.5M4.5 3v4.5a2.5 2.5 0 0 0 5 0V3M7 10.5V21M17 21V3c-2.2 1.2-3.5 3.8-3.5 7.5V13H17"/>',
  museo: '<path d="M3.5 9.5L12 4.5l8.5 5M5 9.5h14M6.5 9.5v8M10 9.5v8M14 9.5v8M17.5 9.5v8M4 20h16"/>'
};

export const icona = (nome: keyof typeof P | string, size = 24, cls = '') =>
  `<svg${cls ? ` class="${cls}"` : ''} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[nome] ?? ''}</svg>`;
