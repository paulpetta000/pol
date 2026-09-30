// Marchio di Napoli a Vela: il golfo con il Vesuvio e una vela arancio, in un tondo.
// Usato da intestazione e piè di pagina (Logo.astro), favicon e icone (scripts/icone.mjs), immagini di anteprima.
export const COLORI = { cielo: '#DCEFF2', vesuvio: '#0B2F55', mare: '#0B6E80', onda: '#7FD6E0', vela: '#FF7A3D', bordo: '#FFFFFF' };

// Disegno interno, in un quadrato 64×64. uid serve a non ripetere l'id del ritaglio nella stessa pagina.
export function disegno(uid = 'lg') {
  const c = COLORI;
  return `<clipPath id="${uid}"><circle cx="32" cy="32" r="31"/></clipPath>` +
    `<circle cx="32" cy="32" r="31" fill="${c.cielo}"/>` +
    `<g clip-path="url(#${uid})">` +
    `<path d="M0 41 L13 27 L21 31 L29 21 L45 38 L64 41 V64 H0 Z" fill="${c.vesuvio}"/>` +
    `<rect y="41" width="64" height="23" fill="${c.mare}"/>` +
    `<path d="M-2 49 q8 -4.5 16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="${c.onda}" stroke-width="3"/>` +
    `</g>` +
    `<path d="M41 10 L41 45 L22 45 Z" fill="${c.vela}" stroke="${c.bordo}" stroke-width="2.2" stroke-linejoin="round"/>`;
}

// SVG completo. sfondo: colore di un quadrato dietro al tondo (icone dell'app); margine in unità.
export function svg({ sfondo = null, margine = 0, uid = 'lg' } = {}) {
  const m = margine, s = 64 + m * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-m} ${-m} ${s} ${s}">` +
    (sfondo ? `<rect x="${-m}" y="${-m}" width="${s}" height="${s}" fill="${sfondo}"/>` : '') +
    disegno(uid) + `</svg>`;
}
