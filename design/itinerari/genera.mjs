// Bozzetti delle due proposte di design per la pagina degli itinerari (blocco 1 del Rilascio 3).
// Non fanno parte del sito: sono pagine HTML da fotografare (design/itinerari/foto.cjs), costruite con i dati veri
// (tappe, tempi tra le tappe, mappa di OpenStreetMap).
// Uso: node design/itinerari/genera.mjs <cartella dati di scripts/itinerari/scarica.mjs>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const QUI = path.dirname(fileURLToPath(import.meta.url));
const RADICE = path.join(QUI, '../..');
const leggi = f => fs.readFileSync(path.join(RADICE, f), 'utf8');
const datiOsm = process.argv[2];
if (!datiOsm) throw new Error('Indica la cartella con osm.json (scripts/itinerari/scarica.mjs)');

const TAPPE = yaml.load(leggi('src/data/tappe.yaml'));
const TEMPI = JSON.parse(leggi('src/data/tempi-tappe.json'));
const MAPPA = JSON.parse(leggi('src/data/mappa.json'));
const PERCORSI = JSON.parse(leggi('design/itinerari/percorsi.json'));
const tappa = id => TAPPE.find(t => t.id === id);
const F = TEMPI.scenari.feriale;
const ix = id => TEMPI.punti.indexOf(id);
const uscita = id => (tappa(id).fine ? `${id}>` : id);

// ---------- Formati ----------
const ora = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
const durata = m => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}`);
const GIORNI = { lun: 'lunedì', mar: 'martedì', mer: 'mercoledì', gio: 'giovedì', ven: 'venerdì', sab: 'sabato', dom: 'domenica' };
const MEZZI = { L1: 'Linea 1', L2: 'Linea 2', L6: 'Linea 6', FA: 'Funicolare Centrale', FB: 'Funicolare di Chiaia', FD: 'Funicolare di Mergellina', CU: 'Cumana' };
const nome = id => tappa(id).breve || tappa(id).nome;

// Una giornata: orari di ogni tappa e spostamenti, dai tempi calcolati (giorno feriale)
function giornata(ids, inizio = 9 * 60 + 30) {
  let t = inizio;
  const voci = [];
  ids.forEach((id, k) => {
    if (k) {
      const a = uscita(ids[k - 1]);
      const min = F.min[ix(a)][ix(id)];
      const mezzi = (F.mezzi[ix(a)][ix(id)] || '').split('+').filter(x => x && !x.startsWith('asc:'));
      voci.push({ tipo: 'tratto', da: ids[k - 1], a: id, min, mezzi, metri: F.piedi[ix(a)][ix(id)] });
      t += min;
    }
    voci.push({ tipo: 'tappa', id, inizio: t, fine: t + tappa(id).durata });
    t += tappa(id).durata;
  });
  const visite = ids.reduce((s, id) => s + tappa(id).durata, 0);
  const spostamenti = voci.filter(v => v.tipo === 'tratto').reduce((s, v) => s + v.min, 0);
  return { voci, inizio, fine: t, visite, spostamenti, n: ids.length };
}
const testoTratto = v => v.mezzi.length ? `${v.min} min · a piedi e ${v.mezzi.map(m => MEZZI[m]).join(' e ')}` : `${v.min} min a piedi`;
const meta = id => {
  const t = tappa(id);
  return [durata(t.durata), t.alChiuso === 'si' ? 'al chiuso' : t.alChiuso === 'in-parte' ? 'in parte al chiuso' : 'all\'aperto'].join(' · ');
};
const avvisoGiorni = id => tappa(id).chiuso?.length ? `Chiuso il ${tappa(id).chiuso.map(g => GIORNI[g]).join(' e il ')}` : '';

// ---------- La giornata d'esempio (uguale nelle due proposte) ----------
const G1 = ['palazzo-reale', 'sant-elmo', 'san-martino', 'pedamentina', 'tribunali', 'sansevero', 'santa-chiara', 'spaccanapoli'];
// con la Floridiana in mezzo: senza Santa Chiara, così la giornata resta entro le 19:00 e l'avviso è uno solo
const G1_LONTANO = [...G1.slice(0, 3), 'floridiana', 'pedamentina', 'tribunali', 'sansevero', 'spaccanapoli'];
const G1_PIENO = [...G1, 'lungomare'];
const FINE_SCELTA = 19 * 60;

// ---------- Icone (tratto 2, 24×24) ----------
const I = {
  piu: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  su: '<path d="M6 15l6-6 6 6"/>',
  giu: '<path d="M6 9l6 6 6-6"/>',
  maniglia: '<circle cx="9" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.4" fill="currentColor" stroke="none"/>',
  cerca: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  filtri: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  mappa: '<path d="M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  lista: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
  piedi: '<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2-6 3 3v3M12 15l-1-5 4 1 2 3M11 10l-3 2-1 3"/>',
  funicolare: '<rect x="5" y="4" width="14" height="13" rx="2"/><path d="M5 11h14M9 21l1.5-4M15 21l-1.5-4M2 21h20"/>',
  metro: '<rect x="6" y="3" width="12" height="15" rx="3"/><path d="M6 11h12M9 21l1.5-3M15 21l-1.5-3"/><circle cx="9.5" cy="14.5" r=".8" fill="currentColor"/><circle cx="14.5" cy="14.5" r=".8" fill="currentColor"/>',
  attenzione: '<path d="M12 3.5L2.5 20h19z"/><path d="M12 10v4.5M12 17.5v.5"/>',
  matita: '<path d="M4 20l1-4L16 5l3 3L8 19z"/>',
  freccia: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  indietro: '<path d="M15 6l-6 6 6 6"/>',
  avanti: '<path d="M9 6l6 6-6 6"/>',
  calendario: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'
};
const icona = (n, s = 24) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const iconaMezzo = m => icona(m.startsWith('F') ? 'funicolare' : 'metro', 18);

// Il logo del sito (Golfo e Vesuvio), lo stesso della guida
const logo = fs.readFileSync(path.join(RADICE, 'public/favicon.svg'), 'utf8').replace(/<\?xml[^>]*>/, '').replace('<svg', '<svg class="logo" width="32" height="32"');

// Foto delle tappe (src/assets/foto), per le miniature
const FOTO = { 'monte-echia': 'vista-monte-echia', lungomare: 'via-partenope', floridiana: 'floridiana-viale' };
const foto = id => {
  const f = tappa(id).foto || FOTO[id];
  return f ? `../../src/assets/foto/${f}.jpg` : null;
};

// ---------- Mappa: strade di OpenStreetMap, mare e parchi della mappa del sito ----------
const LAT0 = MAPPA.lat0, KX = 111320 * Math.cos(LAT0 * Math.PI / 180) / MAPPA.mPerUnit, KY = 110950 / MAPPA.mPerUnit;
const P = (lat, lon) => [(lon - MAPPA.box.w) * KX, (MAPPA.box.n - lat) * KY];
// riquadro di una mappa: tutte le tappe e i percorsi della giornata, con margine, nelle proporzioni del riquadro sullo schermo
function riquadro(ids, aspetto, margine = 0.12) {
  const pts = [...ids.map(id => P(tappa(id).lat, tappa(id).lon)), ...pezzi(ids).flatMap(p => p.punti.map(([la, lo]) => P(la, lo)))];
  let [ax, ay, bx, by] = [Math.min(...pts.map(p => p[0])), Math.min(...pts.map(p => p[1])), Math.max(...pts.map(p => p[0])), Math.max(...pts.map(p => p[1]))];
  let w = (bx - ax) * (1 + 2 * margine), h = (by - ay) * (1 + 2 * margine);
  if (w / h > aspetto) h = w / aspetto; else w = h * aspetto;
  const cx = (ax + bx) / 2, cy = (ay + by) / 2;
  return { x: cx - w / 2, y: cy - h / 2, w, h, vb: `${(cx - w / 2).toFixed(1)} ${(cy - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}` };
}
// le strade si caricano per una zona un po' più grande di tutte le mappe dei bozzetti
const RIQ = { w: 14.2236, e: 14.2718, s: 40.8152, n: 40.8702 };
function strade() {
  const osm = JSON.parse(fs.readFileSync(path.join(datiOsm, 'osm.json'), 'utf8'));
  const nodi = new Map();
  for (const e of osm.elements) if (e.type === 'node') nodi.set(e.id, e);
  const classi = { grandi: [], medie: [], piccole: [] };
  const GRANDI = /^(primary|secondary|trunk|tertiary)(_link)?$/, MEDIE = /^(residential|unclassified|living_street|pedestrian)$/, PICCOLE = /^(footway|steps|path|service)$/;
  const m = 0.004;
  for (const w of osm.elements) {
    if (w.type !== 'way' || !w.tags?.highway || w.tags.tunnel === 'yes' || w.tags.area === 'yes') continue;
    const hw = w.tags.highway;
    const k = GRANDI.test(hw) ? 'grandi' : MEDIE.test(hw) ? 'medie' : PICCOLE.test(hw) ? 'piccole' : null;
    if (!k) continue;
    const pts = w.nodes.map(id => nodi.get(id)).filter(Boolean);
    if (!pts.some(p => p.lat > RIQ.s - m && p.lat < RIQ.n + m && p.lon > RIQ.w - m && p.lon < RIQ.e + m)) continue;
    classi[k].push('M' + pts.map(p => P(p.lat, p.lon).map(v => v.toFixed(1)).join(' ')).join('L'));
  }
  return Object.fromEntries(Object.entries(classi).map(([k, v]) => [k, v.join('')]));
}
const STRADE = strade();
const baseMappa = `<path class="m-mare" d="${MAPPA.sea}"/><path class="m-parco" d="${MAPPA.parks}"/>
  <path class="m-piccole" d="${STRADE.piccole}"/><path class="m-medie-c" d="${STRADE.medie}"/><path class="m-medie" d="${STRADE.medie}"/><path class="m-grandi-c" d="${STRADE.grandi}"/><path class="m-grandi" d="${STRADE.grandi}"/>`;
const proietta = punti => 'M' + punti.map(([la, lo]) => P(la, lo).map(v => v.toFixed(1)).join(' ')).join('L');
// marcatori senza sovrapposizioni: si allontanano quanto basta e un trattino li collega al punto vero
function marcatori(ids, R, latoPx, larghezzaPx) {
  const s = latoPx * R.w / larghezzaPx;
  const pos = ids.map(id => { const [x, y] = P(tappa(id).lat, tappa(id).lon); return { x, y, x0: x, y0: y }; });
  for (let giro = 0; giro < 120; giro++) {
    let mosso = false;
    for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) {
      const a = pos[i], b = pos[j];
      let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
      const min = s * 1.12;
      if (d < min) {
        if (d < 0.01) { dx = 1; dy = 0.3; d = Math.hypot(dx, dy); }
        const k = (min - d) / 2 / d;
        a.x -= dx * k; a.y -= dy * k; b.x += dx * k; b.y += dy * k; mosso = true;
      }
    }
    if (!mosso) break;
  }
  const trattini = pos.map(p => Math.hypot(p.x - p.x0, p.y - p.y0) > s * 0.25
    ? `<line x1="${p.x0.toFixed(1)}" y1="${p.y0.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" class="m-trattino"/><circle cx="${p.x0.toFixed(1)}" cy="${p.y0.toFixed(1)}" r="${(s * 0.13).toFixed(1)}" class="m-punto"/>` : '').join('');
  return { pos, s, trattini };
}
// i pezzi del percorso tra due tappe della giornata (a piedi o con un mezzo)
function pezzi(ids) {
  const out = [];
  ids.forEach((id, k) => {
    const t = tappa(id);
    if (t.fine) out.push(...(PERCORSI[`${id}|${id}>`]?.pezzi || []).map(p => ({ ...p, dentro: true })));
    if (k < ids.length - 1) out.push(...(PERCORSI[`${uscita(id)}|${ids[k + 1]}`]?.pezzi || []));
  });
  return out;
}

// ---------- Pagina ----------
const pagina = (titolo, css, corpo) => `<!doctype html>
<html lang="it" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titolo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;600&family=Bricolage+Grotesque:opsz,wght@12..96,600&family=Barlow:wght@400;500;600&family=Barlow+Semi+Condensed:wght@500;600&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; padding: 24px; background: #8a8f96; display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start; }
.tel { width: 390px; height: 844px; overflow: hidden; position: relative; flex: none; }
.tel button { font: inherit; color: inherit; cursor: pointer; }
.tel p { margin: 0; }
.tel svg { display: block; flex: none; }
.vh { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
${css}
</style>
</head>
<body>
${corpo}
</body>
</html>
`;

// =====================================================================================
// PROPOSTA A · «Riggiola»: elenco delle tappe e itinerario in un vassoio che si apre
// =====================================================================================
const cssA = `
.pa {
  --canvas: #F5F7FA; --surface: #FFFFFF; --surface-2: #E9EEF5;
  --ink: #142033; --ink-2: #3B485C; --ink-3: #5A677B;
  --line: #D6DEE9; --line-strong: #A9B6C8;
  --accent: #1C4E9E; --accent-ink: #FFFFFF; --accent-soft: #E1EAF7;
  --tile: #F3C431; --tile-ink: #1A2C4E; --tile-edge: #C99A12;
  --warn: #8A4A00; --warn-bg: #FFF2D9; --warn-line: #E2B05A;
  --land: #ECF0F5; --sea: #CCDDF0; --park: #D6E7D3; --road: #FFFFFF; --road-c: #D3DBE6; --path: #C3CEDC;
  --ombra: 0 1px 2px rgba(20, 32, 51, .05), 0 8px 24px -12px rgba(20, 32, 51, .16);
  --f-ui: 'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible', system-ui, sans-serif;
  --f-titoli: 'Bricolage Grotesque', 'Atkinson Hyperlegible Next', system-ui, sans-serif;
  background: var(--canvas); color: var(--ink); font: 400 16px/1.5 var(--f-ui);
}
[data-theme="dark"] .pa {
  --canvas: #0D1524; --surface: #142034; --surface-2: #1B2A43;
  --ink: #EAF0F8; --ink-2: #B9C4D6; --ink-3: #8F9CB2;
  --line: #24344F; --line-strong: #3B4E6E;
  --accent: #93B5FF; --accent-ink: #0D1524; --accent-soft: #1B2D4F;
  --tile: #F5CC48; --tile-ink: #1A2C4E; --tile-edge: #B88A10;
  --warn: #FFC870; --warn-bg: #2B2210; --warn-line: #75561B;
  --land: #111B2C; --sea: #0B1A30; --park: #13261F; --road: #26354E; --road-c: #0C1422; --path: #22314A;
  --ombra: 0 1px 0 rgba(255, 255, 255, .04) inset;
}
.pa .testa { height: 56px; display: flex; align-items: center; gap: 8px; padding: 0 8px 0 16px; background: var(--surface); border-bottom: 1px solid var(--line); }
.pa .marchio { display: flex; align-items: center; gap: 8px; font: 600 18px/1 var(--f-titoli); flex: 1; }
.pa .logo { border-radius: 6px; }
.pa .ib { width: 44px; height: 44px; display: grid; place-items: center; border: 0; background: transparent; border-radius: 10px; }
.pa h1 { font: 600 30px/1.1 var(--f-titoli); letter-spacing: -0.015em; margin: 0 0 8px; }
.pa .intro { padding: 24px 16px 16px; }
.pa .intro p { color: var(--ink-2); max-width: 34ch; }
.pa .strumenti { display: flex; gap: 8px; padding: 0 16px 12px; }
.pa .cerca { flex: 1; height: 48px; display: flex; align-items: center; gap: 8px; padding: 0 12px; background: var(--surface); border: 1px solid var(--line-strong); border-radius: 10px; color: var(--ink-3); }
.pa .bottone-filtri { width: 48px; height: 48px; display: grid; place-items: center; background: var(--surface); border: 1px solid var(--line-strong); border-radius: 10px; }
.pa .zone { display: flex; gap: 8px; padding: 0 16px 16px; overflow: hidden; }
.pa .zona { height: 44px; padding: 0 16px; border-radius: 22px; border: 1px solid var(--line-strong); background: var(--surface); white-space: nowrap; font-weight: 600; font-size: 15px; }
.pa .zona[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
.pa .lista { margin: 0 16px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.pa .lista__testa { display: flex; justify-content: space-between; padding: 12px 16px; font-size: 14px; color: var(--ink-3); border-bottom: 1px solid var(--line); background: var(--surface-2); }
.pa .riga { display: grid; grid-template-columns: 56px 1fr 44px; gap: 12px; align-items: center; padding: 12px 12px 12px 16px; border-bottom: 1px solid var(--line); }
.pa .riga:last-child { border-bottom: 0; }
.pa .riga img, .pa .riga .senza-foto { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; background: var(--surface-2); }
.pa .riga .senza-foto { background: radial-gradient(circle at 0 0, transparent 13px, var(--line) 14px 15px, transparent 16px), radial-gradient(circle at 100% 100%, transparent 13px, var(--line) 14px 15px, transparent 16px), var(--surface-2); background-size: 28px 28px; }
.pa .riga__nome { font-weight: 600; font-size: 17px; line-height: 1.25; }
.pa .riga__meta { font-size: 14px; color: var(--ink-3); margin-top: 2px; }
.pa .riga__chiuso { font-size: 14px; color: var(--warn); }
.pa .aggiungi { width: 44px; height: 44px; display: grid; place-items: center; border: 1.5px solid var(--accent); color: var(--accent); background: transparent; border-radius: 10px; }
.pa .piastrella { width: 44px; height: 44px; display: grid; place-items: center; border: 0; border-radius: 6px; background: var(--tile); color: var(--tile-ink); font: 600 20px/1 var(--f-titoli); box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--tile) 55%, #fff), inset 0 0 0 4px var(--tile-edge); font-variant-numeric: tabular-nums; }
.pa .piastrella--piccola { width: 32px; height: 32px; font-size: 16px; border-radius: 5px; box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--tile) 55%, #fff), inset 0 0 0 3px var(--tile-edge); }
.pa .vassoio { position: absolute; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 12px; padding: 12px 16px 16px; background: var(--surface); border-top: 1px solid var(--line); box-shadow: 0 -8px 24px -12px rgba(20, 32, 51, .18); }
[data-theme="dark"] .pa .vassoio { box-shadow: inset 0 1px 0 rgba(255, 255, 255, .05); }
.pa .vassoio__testo { flex: 1; min-width: 0; }
.pa .vassoio__testo strong { display: block; font-weight: 600; }
.pa .vassoio__testo span { font-size: 14px; color: var(--ink-3); }
.pa .primario { height: 48px; padding: 0 20px; display: inline-flex; align-items: center; gap: 8px; border: 0; border-radius: 10px; background: var(--accent); color: var(--accent-ink); font-weight: 600; white-space: nowrap; }
.pa .secondario { height: 44px; padding: 0 16px; display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid var(--accent); border-radius: 10px; background: transparent; color: var(--accent); font-weight: 600; }
.pa .testuale { height: 44px; padding: 0 12px; border: 0; background: transparent; color: var(--accent); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }

/* foglio dell'itinerario: a tutta altezza sul telefono */
.pa .foglio { position: absolute; inset: 0; display: flex; flex-direction: column; background: var(--canvas); }
.pa .foglio__barra { height: 56px; flex: none; display: flex; align-items: center; gap: 4px; padding: 0 8px; background: var(--surface); border-bottom: 1px solid var(--line); }
.pa .foglio__titolo { flex: 1; font: 600 18px/1 var(--f-titoli); }
.pa .vista { display: inline-flex; padding: 2px; border-radius: 12px; background: var(--surface-2); }
.pa .vista button { height: 44px; padding: 0 12px; display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 10px; background: transparent; font-weight: 600; font-size: 15px; color: var(--ink-2); }
.pa .vista button[aria-pressed="true"] { background: var(--surface); color: var(--ink); box-shadow: 0 1px 2px rgba(20, 32, 51, .12); }
.pa .giorni { display: flex; gap: 8px; padding: 12px 16px 0; flex: none; }
.pa .giorno { height: 44px; padding: 0 16px; border-radius: 10px; border: 1px solid var(--line-strong); background: var(--surface); font-weight: 600; white-space: nowrap; }
.pa .giorno[aria-selected="true"] { border: 2px solid var(--accent); color: var(--accent); background: var(--accent-soft); }
.pa .scorre { flex: 1; overflow: hidden; position: relative; }
.pa .riepilogo { margin: 12px 16px; padding: 16px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--ombra); }
.pa .riepilogo__ore { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.pa .riepilogo__ore strong { font: 600 28px/1.1 var(--f-titoli); font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
.pa .riepilogo__ore button { height: 44px; display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent; color: var(--accent); font-weight: 600; font-size: 15px; padding: 0 4px; }
.pa .riepilogo p { font-size: 14px; color: var(--ink-3); margin-top: 4px; }
.pa .barra-giorno { position: relative; height: 10px; margin-top: 12px; border-radius: 5px; background: var(--surface-2); overflow: hidden; display: flex; }
.pa .barra-giorno i { display: block; height: 100%; }
.pa .barra-giorno .v { background: var(--accent); }
.pa .barra-giorno .s { background: color-mix(in srgb, var(--accent) 35%, var(--surface-2)); }
.pa .barra-giorno .oltre { background: repeating-linear-gradient(135deg, var(--warn) 0 3px, color-mix(in srgb, var(--warn) 25%, var(--surface-2)) 3px 7px); }
.pa .barra-giorno .segno-fine { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--ink); }
.pa .barra-giorno { overflow: visible; }
.pa .barra-giorno i:first-child { border-radius: 5px 0 0 5px; }
.pa .barra-legenda { display: flex; justify-content: space-between; font-size: 12px; color: var(--ink-3); margin-top: 6px; font-variant-numeric: tabular-nums; }
.pa .tappe { margin: 0 16px 16px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.pa .tappa { display: grid; grid-template-columns: 32px 1fr 44px; gap: 12px; align-items: center; padding: 12px 8px 12px 16px; }
.pa .tappa__nome { font-weight: 600; font-size: 17px; line-height: 1.25; }
.pa .tappa__ore { font-size: 14px; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.pa .tratto { display: flex; align-items: center; gap: 8px; min-height: 40px; margin-left: 31px; padding: 6px 16px 6px 29px; border-left: 2px dashed var(--line-strong); font-size: 14px; color: var(--ink-3); }
.pa .tratto--mezzo { border-left: 3px solid var(--accent); padding-left: 28px; color: var(--ink-2); }
.pa .tratto svg { color: var(--ink-3); }
.pa .avviso { margin: 0 16px 12px 60px; padding: 12px 16px; border-radius: 10px; background: var(--warn-bg); border: 1px solid var(--warn-line); }
.pa .avviso__titolo { display: flex; gap: 8px; align-items: flex-start; font-weight: 600; color: var(--warn); }
.pa .avviso p { font-size: 15px; margin-top: 4px; color: var(--ink); }
.pa .avviso__azioni { display: flex; flex-wrap: wrap; gap: 4px 8px; margin-top: 8px; }
.pa .tappa--evidenza { background: color-mix(in srgb, var(--warn-bg) 70%, var(--surface)); }
.pa .riordina-nota { margin: 0 16px 8px; font-size: 14px; color: var(--ink-3); }
.pa .tappa--riordina { grid-template-columns: 44px 32px 1fr 44px 44px; gap: 4px; padding: 8px 4px 8px 4px; border-bottom: 1px solid var(--line); }
.pa .posto-e-sollevata { position: relative; padding: 6px 8px; border-bottom: 1px solid var(--line); }
.pa .tappa--posto { height: 56px; border: 2px dashed var(--accent); border-radius: 10px; background: var(--accent-soft); }
.pa .tappa--sollevata { position: absolute; left: 4px; right: 4px; top: 22px; z-index: 2; background: var(--surface); box-shadow: 0 14px 30px -10px rgba(20, 32, 51, .4); border-radius: 10px; outline: 2px solid var(--accent); border-bottom: 0; transform: rotate(-1deg); }
[data-theme="dark"] .pa .tappa--sollevata { box-shadow: 0 14px 30px -8px rgba(0, 0, 0, .7); }
.pa .ib--su { color: var(--ink-2); }
.pa .ib[disabled] { opacity: .35; }
.pa .vuoto { margin: 16px; padding: 24px 16px; text-align: left; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; }
.pa .vuoto__piastrelle { display: flex; gap: 8px; margin-bottom: 16px; }
.pa .vuoto__piastrelle span { width: 32px; height: 32px; border-radius: 5px; border: 2px dashed var(--line-strong); }
.pa .vuoto h2 { font: 600 22px/1.2 var(--f-titoli); margin: 0 0 8px; }
.pa .vuoto p { color: var(--ink-2); margin-bottom: 16px; }
.pa .pronti { margin: 0 16px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.pa .pronti h3 { margin: 0; padding: 12px 16px; font-size: 14px; font-weight: 600; color: var(--ink-3); background: var(--surface-2); border-bottom: 1px solid var(--line); }
.pa .pronto { display: grid; grid-template-columns: 1fr 24px; align-items: center; gap: 8px; min-height: 64px; padding: 12px 16px; border-bottom: 1px solid var(--line); }
.pa .pronto:last-child { border-bottom: 0; }
.pa .pronto strong { display: block; font-weight: 600; }
.pa .pronto span { font-size: 14px; color: var(--ink-3); }
.pa .pronto svg { color: var(--accent); }
/* mappa */
.pa .mappa { position: absolute; inset: 0; }
.pa .mappa svg { width: 100%; height: 100%; }
.pa .m-sfondo { fill: var(--land); }
.pa .m-mare { fill: var(--sea); }
.pa .m-parco { fill: var(--park); }
.pa .m-piccole { fill: none; stroke: var(--path); stroke-width: 1.2; }
.pa .m-medie-c { fill: none; stroke: var(--road-c); stroke-width: 4.2; stroke-linecap: round; stroke-linejoin: round; }
.pa .m-medie { fill: none; stroke: var(--road); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.pa .m-grandi-c { fill: none; stroke: var(--road-c); stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; }
.pa .m-grandi { fill: none; stroke: var(--road); stroke-width: 5.5; stroke-linecap: round; stroke-linejoin: round; }
.pa .m-giro { fill: none; stroke: var(--accent); stroke-width: 4.5; stroke-linecap: round; stroke-linejoin: round; }
.pa .m-giro-c { fill: none; stroke: var(--surface); stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; }
.pa .m-mezzo { fill: none; stroke: var(--accent); stroke-width: 4.5; stroke-dasharray: 2 7; stroke-linecap: round; }
.pa .m-trattino { stroke: var(--ink); } .pa .m-punto { fill: var(--ink); }
.pa .mappa__scheda { position: absolute; left: 12px; right: 12px; bottom: 16px; display: grid; grid-template-columns: 44px 1fr 44px 44px; gap: 8px; align-items: center; padding: 12px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--ombra); }
.pa .mappa__legenda { position: absolute; left: 12px; top: 12px; display: grid; gap: 4px; padding: 8px 12px; font-size: 13px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; color: var(--ink-2); }
.pa .mappa__legenda span { display: flex; align-items: center; gap: 8px; }
.pa .mappa__legenda i { width: 24px; height: 4px; border-radius: 2px; background: var(--accent); }
.pa .mappa__legenda i.t { background: repeating-linear-gradient(90deg, var(--accent) 0 3px, transparent 3px 8px); }
`;

function testaA() {
  return `<header class="testa"><span class="marchio">${logo}Napoli a Vela</span><button class="ib" aria-label="Apri il menu">${icona('menu')}</button></header>`;
}
function rigaA(id, numero) {
  const img = foto(id);
  const chiuso = avvisoGiorni(id);
  const prenota = tappa(id).prenotazione === 'obbligatoria' ? ' · si prenota' : '';
  return `<div class="riga">${img ? `<img src="${img}" alt="">` : '<span class="senza-foto"></span>'}<div><div class="riga__nome">${tappa(id).nome}</div><div class="riga__meta">${meta(id)}${prenota}</div>${chiuso ? `<div class="riga__chiuso">${chiuso}</div>` : ''}</div>${numero ? `<button class="piastrella" aria-label="Tappa ${numero} del giorno 1: togli">${numero}</button>` : `<button class="aggiungi" aria-label="Aggiungi ${nome(id)} al giorno 1">${icona('piu')}</button>`}</div>`;
}
function barraGiorno(g, fineScelta = FINE_SCELTA) {
  const tot = Math.max(fineScelta, g.fine) - g.inizio;
  const pct = m => `${(100 * m / tot).toFixed(2)}%`;
  const oltre = Math.max(0, g.fine - fineScelta);
  const pieno = g.fine - g.inizio - oltre;
  const v = g.visite * pieno / (g.fine - g.inizio), s = pieno - v;
  return `<div class="barra-giorno" role="img" aria-label="Visite ${durata(g.visite)}, spostamenti ${durata(g.spostamenti)}${oltre ? ', ' + oltre + ' minuti oltre la fine scelta' : ''}"><i class="v" style="width:${pct(v)}"></i><i class="s" style="width:${pct(s)}"></i>${oltre ? `<i class="oltre" style="width:${pct(oltre)}"></i>` : ''}<b class="segno-fine" style="left:${pct(fineScelta - g.inizio)}"></b></div>
  <div class="barra-legenda"><span>${ora(g.inizio)}</span><span>fine della giornata ${ora(fineScelta)}</span></div>`;
}
function vociA(g, { lontano, pieno, da = 0, a = 99 } = {}) {
  let n = 0, html = '';
  g.voci.forEach((v, k) => {
    if (v.tipo === 'tappa') n++;
    const pos = v.tipo === 'tappa' ? n : n + 0.5;
    if (pos < da || pos > a) return;
    if (v.tipo === 'tratto') {
      html += `<div class="tratto${v.mezzi.length ? ' tratto--mezzo' : ''}">${v.mezzi.length ? iconaMezzo(v.mezzi[0]) : icona('piedi', 18)}<span>${testoTratto(v)}</span></div>`;
      return;
    }
    const evid = (lontano && v.id === lontano) || (pieno && v.id === pieno);
    html += `<div class="tappa${evid ? ' tappa--evidenza' : ''}"><span class="piastrella piastrella--piccola">${n}</span><div><div class="tappa__nome">${tappa(v.id).nome}</div><div class="tappa__ore">${ora(v.inizio)}–${ora(v.fine)} · ${durata(tappa(v.id).durata)}</div></div><button class="ib" aria-label="Trascina ${nome(v.id)} per cambiare l'ordine">${icona('maniglia')}</button></div>`;
    if (lontano && v.id === lontano) {
      html += `<div class="avviso" role="status"><div class="avviso__titolo">${icona('attenzione', 20)}<span>${nome(v.id)} è lontana dalle altre tappe</span></div><p>Circa 40 minuti in più tra andata e ritorno. Vuoi metterla in un altro giorno?</p><div class="avviso__azioni"><button class="secondario">Sposta nel giorno 2</button><button class="testuale">Lascia qui</button></div></div>`;
    }
  });
  return html;
}
function foglioA({ giorno = 1, vista = 'elenco', contenuto }) {
  return `<div class="foglio" role="dialog" aria-label="Il tuo itinerario">
    <div class="foglio__barra"><button class="ib" aria-label="Chiudi l'itinerario">${icona('x')}</button><span class="foglio__titolo">Il tuo itinerario</span>
      <div class="vista" role="group" aria-label="Vista"><button aria-pressed="${vista === 'elenco'}">${icona('lista', 18)}Elenco</button><button aria-pressed="${vista === 'mappa'}">${icona('mappa', 18)}Mappa</button></div></div>
    ${vista === 'elenco' ? `<div class="giorni" role="tablist"><button class="giorno" role="tab" aria-selected="${giorno === 1}">Giorno 1</button><button class="giorno" role="tab" aria-selected="${giorno === 2}">Giorno 2</button><button class="giorno" aria-label="Aggiungi un giorno">${icona('piu', 20)}</button></div>` : ''}
    <div class="scorre">${contenuto}</div>
  </div>`;
}
function mappaA(ids, attiva = 1) {
  const R = riquadro(ids, 390 / 788, 0.16);
  const { pos, s, trattini } = marcatori(ids, R, 30, 390);
  const u = R.w / 390;   // unità della mappa per un pixel
  const linee = pezzi(ids).map(p => p.modo === 'piedi'
    ? `<path class="m-giro-c" style="stroke-width:${(9 * u).toFixed(2)}" d="${proietta(p.punti)}"/><path class="m-giro" style="stroke-width:${(4.5 * u).toFixed(2)}" d="${proietta(p.punti)}"/>`
    : `<path class="m-mezzo" style="stroke-width:${(5 * u).toFixed(2)};stroke-dasharray:${(2 * u).toFixed(2)} ${(8 * u).toFixed(2)}" d="${proietta(p.punti)}"/>`).join('');
  const segni = pos.map((p, k) => {
    const x = p.x - s / 2, y = p.y - s / 2;
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><rect width="${s.toFixed(1)}" height="${s.toFixed(1)}" rx="${(s * 0.14).toFixed(1)}" fill="var(--tile)" stroke="var(--tile-edge)" stroke-width="${(1.5 * u).toFixed(2)}"/><rect x="${(s * 0.1).toFixed(1)}" y="${(s * 0.1).toFixed(1)}" width="${(s * 0.8).toFixed(1)}" height="${(s * 0.8).toFixed(1)}" rx="${(s * 0.08).toFixed(1)}" fill="none" stroke="color-mix(in srgb, var(--tile) 55%, #fff)" stroke-width="${(1.5 * u).toFixed(2)}"/><text x="${(s / 2).toFixed(1)}" y="${(s * 0.71).toFixed(1)}" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="600" font-size="${(s * 0.6).toFixed(1)}" fill="var(--tile-ink)">${k + 1}</text></g>`;
  }).join('');
  const t = giornata(ids).voci.filter(v => v.tipo === 'tappa')[attiva - 1];
  return `<div class="mappa"><svg viewBox="${R.vb}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mappa del giorno 1: ${ids.length} tappe collegate nell'ordine"><rect class="m-sfondo" x="0" y="0" width="${MAPPA.w}" height="${MAPPA.h}"/>${baseMappa}${linee}<g style="stroke-width:${(1.5 * u).toFixed(2)}">${trattini}</g>${segni}</svg>
    <div class="mappa__legenda"><span><i></i>a piedi</span><span><i class="t"></i>funicolare</span></div>
    <div class="mappa__scheda"><span class="piastrella">${attiva}</span><div><div class="tappa__nome">${tappa(t.id).nome}</div><div class="tappa__ore">${ora(t.inizio)}–${ora(t.fine)} · ${durata(tappa(t.id).durata)}</div></div><button class="ib" aria-label="Tappa precedente" disabled>${icona('indietro')}</button><button class="ib" aria-label="Tappa successiva">${icona('avanti')}</button></div></div>`;
}

function schermiA() {
  const g = giornata(G1), gl = giornata(G1_LONTANO), gp = giornata(G1_PIENO);
  const NEL_GIORNO = new Map(G1.map((id, k) => [id, k + 1]));
  const centro = ['duomo', 'sansevero', 'santa-chiara', 'spaccanapoli', 'tribunali', 'mann'];
  // A1 · elenco delle tappe
  const a1 = `<section class="tel pa" id="a1">${testaA()}
    <div class="intro"><h1>Itinerari</h1><p>Scegli le tappe della tua giornata: l'ordine e i tempi tra una e l'altra li calcoliamo noi.</p></div>
    <div class="strumenti"><div class="cerca" role="search" aria-label="Cerca una tappa">${icona('cerca', 20)}<span>Cerca una tappa</span></div><button class="bottone-filtri" aria-label="Filtri">${icona('filtri', 22)}</button></div>
    <div class="zone"><button class="zona" aria-pressed="false">Tutte</button><button class="zona" aria-pressed="true">Centro storico</button><button class="zona" aria-pressed="false">Toledo e Plebiscito</button></div>
    <div class="lista"><div class="lista__testa"><span>Centro storico</span><span>10 tappe</span></div>${centro.map(id => rigaA(id, NEL_GIORNO.get(id))).join('')}</div>
    <div class="vassoio"><div class="vassoio__testo"><strong>Giorno 1 · ${g.n} tappe</strong><span>${ora(g.inizio)} → ${ora(g.fine)}</span></div><button class="primario">Vedi il giorno</button></div>
  </section>`;
  // A2 · itinerario con l'avviso «è lontana»
  const a2 = `<section class="tel pa" id="a2">${foglioA({ contenuto: `
    <div class="riepilogo"><div class="riepilogo__ore"><strong>${ora(gl.inizio)} → ${ora(gl.fine)}</strong><button>${icona('matita', 18)}Cambia orari</button></div><p>${gl.n} tappe · ${durata(gl.visite)} di visite · ${durata(gl.spostamenti)} di spostamenti</p>${barraGiorno(gl)}</div>
    <div class="tappe">${vociA(gl, { lontano: 'floridiana', da: 2, a: 5 })}</div>` })}</section>`;
  // A3 · riordinare: trascinando o con le frecce
  // via dei Tribunali (era la 5) sta passando al terzo posto: il posto libero si vede, la tappa trascinata è sollevata
  const riga = (id, n, cl = '') => `<div class="tappa tappa--riordina${cl}"><button class="ib" aria-label="Trascina ${nome(id)}">${icona('maniglia')}</button><span class="piastrella piastrella--piccola">${n}</span><div class="tappa__nome">${nome(id)}</div><button class="ib ib--su" aria-label="Sposta ${nome(id)} su"${n === 1 ? ' disabled' : ''}>${icona('su')}</button><button class="ib ib--su" aria-label="Sposta ${nome(id)} giù">${icona('giu')}</button></div>`;
  const righeRiordina = [
    riga('palazzo-reale', 1), riga('sant-elmo', 2),
    `<div class="posto-e-sollevata"><div class="tappa--posto" aria-hidden="true"></div>${riga('tribunali', 3, ' tappa--sollevata')}</div>`,
    riga('san-martino', 4), riga('pedamentina', 5), riga('sansevero', 6), riga('santa-chiara', 7), riga('spaccanapoli', 8)
  ].join('');
  const a3 = `<section class="tel pa" id="a3">${foglioA({ contenuto: `
    <div class="riepilogo"><div class="riepilogo__ore"><strong>Cambia l'ordine</strong><button>Fatto</button></div><p>Trascina una tappa con la maniglia, oppure usa le frecce. I tempi si aggiornano da soli.</p></div>
    <div class="tappe">${righeRiordina}</div>` })}</section>`;
  // A4 · giornata piena
  const a4 = `<section class="tel pa" id="a4">${foglioA({ contenuto: `
    <div class="riepilogo"><div class="riepilogo__ore"><strong>${ora(gp.inizio)} → ${ora(gp.fine)}</strong><button>${icona('matita', 18)}Cambia orari</button></div><p>${gp.n} tappe · finisci ${gp.fine - FINE_SCELTA} minuti dopo le ${ora(FINE_SCELTA)} che hai scelto</p>${barraGiorno(gp)}</div>
    <div class="avviso" style="margin-left:16px" role="status"><div class="avviso__titolo">${icona('attenzione', 20)}<span>Il giorno 1 è pieno</span></div><p>Con il lungomare finisci alle ${ora(gp.fine)}. Spostalo in un altro giorno, oppure finisci più tardi.</p><div class="avviso__azioni"><button class="secondario">Sposta nel giorno 2</button><button class="testuale">Finisci alle 20:00</button></div></div>
    <div class="tappe">${vociA(gp, { pieno: 'lungomare', da: 7, a: 9 })}</div>` })}</section>`;
  // A5 · giorno vuoto
  const a5 = `<section class="tel pa" id="a5">${foglioA({ giorno: 2, contenuto: `
    <div class="vuoto"><div class="vuoto__piastrelle" aria-hidden="true"><span></span><span></span><span></span></div><h2>Il giorno 2 è vuoto</h2><p>Aggiungi le tappe dall'elenco: l'ordine e i tempi tra una e l'altra li calcoliamo noi.</p><button class="primario">${icona('piu', 20)}Scegli le tappe</button></div>
    <div class="pronti"><h3>Oppure parti da un itinerario pronto</h3>
      <div class="pronto"><div><strong>Mezza giornata nel centro storico</strong><span>4 tappe a piedi · circa 4 ore</span></div>${icona('avanti')}</div>
      <div class="pronto"><div><strong>Un giorno: dal Plebiscito al Vomero</strong><span>8 tappe · funicolare e Pedamentina</span></div>${icona('avanti')}</div>
      <div class="pronto"><div><strong>Due giorni</strong><span>Centro storico, Vomero e lungomare</span></div>${icona('avanti')}</div>
      <div class="pronto"><div><strong>Tre giorni</strong><span>Anche Capodimonte, Sanità e Posillipo</span></div>${icona('avanti')}</div>
    </div>` })}</section>`;
  // A6 · mappa
  const a6 = `<section class="tel pa" id="a6">${foglioA({ vista: 'mappa', contenuto: mappaA(G1, 1) })}</section>`;
  return [a1, a2, a3, a4, a5, a6].join('\n');
}

// =====================================================================================
// PROPOSTA B · «Orario»: la giornata come una linea con gli orari; le tappe si aggiungono da un pannello
// =====================================================================================
const cssB = `
.pb {
  --canvas: #F4F4F2; --surface: #FFFFFF; --surface-2: #E8E8E5;
  --ink: #000000; --ink-2: #3A3A38; --ink-3: #5E5E5A;
  --line: #D9D9D5; --line-strong: #9E9E99;
  --giallo: #FFCE00; --giallo-ink: #000000;
  --funi: #0067B1; --metro: #D99A00;
  --warn: #9A3F00; --warn-bg: #FFF0E3; --warn-line: #E39A63;
  --land: #EDEDEA; --sea: #D3E1E6; --park: #DCE6D4; --road: #FFFFFF; --road-c: #CFCFCA; --path: #C9C9C4;
  --f-ui: 'Barlow', system-ui, sans-serif; --f-titoli: 'Barlow Semi Condensed', 'Barlow', system-ui, sans-serif;
  background: var(--canvas); color: var(--ink); font: 400 16px/1.5 var(--f-ui);
}
[data-theme="dark"] .pb {
  --canvas: #000000; --surface: #161615; --surface-2: #232321;
  --ink: #FFFFFF; --ink-2: #CFCFCB; --ink-3: #A3A39E;
  --line: #2F2F2C; --line-strong: #5C5C57;
  --giallo: #FFCE00; --giallo-ink: #000000;
  --funi: #5AB0FF; --metro: #FFCE00;
  --warn: #FFAA6B; --warn-bg: #2A1708; --warn-line: #7A4318;
  --land: #121211; --sea: #0C1A1F; --park: #12200F; --road: #2A2A28; --road-c: #050505; --path: #252523;
}
.pb .testa { height: 56px; display: flex; align-items: center; gap: 8px; padding: 0 8px 0 16px; background: var(--surface); border-bottom: 1px solid var(--line); }
.pb .marchio { display: flex; align-items: center; gap: 8px; font: 600 19px/1 var(--f-titoli); flex: 1; }
.pb .logo { border-radius: 6px; }
.pb .ib { width: 44px; height: 44px; display: grid; place-items: center; border: 0; background: transparent; border-radius: 8px; }
.pb .titolo { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; padding: 20px 16px 4px; }
.pb h1 { font: 600 34px/1.05 var(--f-titoli); margin: 0; letter-spacing: -0.005em; }
.pb .giorni { display: flex; gap: 4px; }
.pb .giorno { width: 44px; height: 44px; border-radius: 8px; border: 1px solid var(--line-strong); background: var(--surface); font: 600 18px/1 var(--f-titoli); display: grid; place-items: center; }
.pb .giorno[aria-selected="true"] { background: var(--ink); color: var(--canvas); border-color: var(--ink); }
.pb .sotto { display: flex; align-items: center; justify-content: space-between; padding: 0 8px 8px 16px; color: var(--ink-2); font-size: 15px; }
.pb .sotto button { height: 44px; padding: 0 8px; border: 0; background: transparent; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
.pb .orario { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px; margin: 0 16px 12px; padding: 12px 16px; background: var(--ink); color: var(--canvas); border-radius: 8px; }
[data-theme="dark"] .pb .orario { background: var(--surface-2); color: var(--ink); }
.pb .orario strong { font: 600 28px/1 var(--f-titoli); font-variant-numeric: tabular-nums; letter-spacing: .01em; }
.pb .orario span { font-size: 14px; opacity: .85; }
.pb .orario .vista { display: inline-flex; gap: 2px; padding: 2px; border-radius: 8px; background: color-mix(in srgb, var(--canvas) 16%, transparent); }
[data-theme="dark"] .pb .orario .vista { background: var(--canvas); }
.pb .orario .vista button { height: 44px; width: 44px; display: grid; place-items: center; border: 0; border-radius: 6px; background: transparent; color: inherit; }
.pb .orario .vista button[aria-pressed="true"] { background: var(--giallo); color: var(--giallo-ink); }
.pb .linea { position: relative; padding: 4px 16px 120px 0; }
.pb .riga-l { display: grid; grid-template-columns: 56px 24px 1fr; }
.pb .ora { padding-top: 12px; text-align: right; font: 600 15px/1 var(--f-titoli); font-variant-numeric: tabular-nums; color: var(--ink); padding-right: 4px; }
.pb .binario { position: relative; }
.pb .binario::before { content: ''; position: absolute; left: 10px; top: 0; bottom: 0; width: 4px; background: var(--ink); }
.pb .riga-l:first-child .binario::before { top: 14px; }
.pb .fermata { position: absolute; left: 3px; top: 8px; width: 18px; height: 18px; border-radius: 50%; background: var(--surface); border: 4px solid var(--ink); }
.pb .blocco { margin: 4px 0 4px 4px; padding: 10px 8px 10px 12px; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; display: grid; grid-template-columns: 1fr 44px; gap: 4px; align-items: start; }
.pb .blocco__nome { font: 600 19px/1.2 var(--f-titoli); }
.pb .blocco__meta { font-size: 14px; color: var(--ink-3); margin-top: 2px; }
.pb .blocco__nota { font-size: 14px; color: var(--ink-2); margin-top: 4px; }
.pb .blocco__azioni { grid-column: 1 / -1; display: flex; gap: 4px; margin-top: 4px; border-top: 1px solid var(--line); padding-top: 4px; }
.pb .blocco__azioni button { height: 44px; padding: 0 10px; display: inline-flex; align-items: center; gap: 4px; border: 0; background: transparent; border-radius: 6px; font-weight: 500; font-size: 15px; }
.pb .blocco__azioni .togli { margin-left: auto; color: var(--warn); }
.pb .blocco--scelto { border: 2px solid var(--ink); box-shadow: 0 0 0 3px var(--giallo); }
.pb .blocco--attenzione { border: 2px solid var(--warn-line); }
.pb .tratto-l .binario::before { background: repeating-linear-gradient(180deg, var(--ink) 0 4px, transparent 4px 9px); width: 4px; }
.pb .tratto-l.funi .binario::before { background: var(--funi); width: 6px; left: 9px; }
.pb .tratto-l.metro .binario::before { background: var(--metro); width: 6px; left: 9px; }
.pb .tratto-txt { display: flex; align-items: center; gap: 8px; min-height: 40px; padding: 6px 0 6px 12px; font-size: 14px; color: var(--ink-2); }
.pb .tratto-txt svg { color: var(--ink-3); }
.pb .avviso { margin: 4px 0 8px 4px; padding: 12px; border-radius: 8px; background: var(--warn-bg); border: 1px solid var(--warn-line); }
.pb .avviso__titolo { display: flex; gap: 8px; font: 600 17px/1.25 var(--f-titoli); color: var(--warn); }
.pb .avviso p { font-size: 15px; margin-top: 4px; }
.pb .avviso__azioni { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.pb .giallo { height: 44px; padding: 0 16px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 2px solid var(--ink); border-radius: 8px; background: var(--giallo); color: var(--giallo-ink); font-weight: 600; }
[data-theme="dark"] .pb .giallo { border-color: var(--giallo); }
.pb .contorno { height: 44px; padding: 0 14px; display: inline-flex; align-items: center; gap: 8px; border: 2px solid var(--ink); border-radius: 8px; background: transparent; font-weight: 600; }
.pb .barra-fissa { position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 16px 16px; background: var(--surface); border-top: 1px solid var(--line); }
.pb .barra-fissa .giallo { width: 100%; height: 52px; font-size: 17px; }
.pb .limite { position: relative; display: grid; grid-template-columns: 56px 1fr; align-items: center; margin: 4px 0; }
.pb .limite .ora { padding: 0 4px 0 0; color: var(--warn); }
.pb .limite div { height: 12px; background: repeating-linear-gradient(135deg, var(--giallo) 0 10px, var(--ink) 10px 20px); border-radius: 2px; }
.pb .limite-txt { margin: 2px 0 8px 56px; font: 600 15px/1.2 var(--f-titoli); color: var(--warn); }
.pb .blocco--oltre { border: 2px solid var(--warn-line); padding-bottom: 0; overflow: hidden; }
.pb .blocco__limite { grid-column: 1 / -1; height: 10px; margin: 6px -8px 0 -12px; background: repeating-linear-gradient(135deg, var(--giallo) 0 10px, var(--ink) 10px 20px); }
.pb .blocco__oltre { grid-column: 1 / -1; margin: 0 -8px 0 -12px; padding: 10px 12px 12px; font-size: 15px; color: var(--warn); background: repeating-linear-gradient(135deg, var(--warn-bg) 0 8px, color-mix(in srgb, var(--warn-bg) 60%, var(--surface)) 8px 16px); }
.pb .blocco__oltre b { font: 600 17px/1 var(--f-titoli); font-variant-numeric: tabular-nums; margin-right: 4px; }
.pb .vuoto-l { position: relative; padding: 8px 16px 0 0; }
.pb .vuoto-l .riga-l { min-height: 58px; }
.pb .vuoto-l .ora { color: var(--ink-3); font-weight: 500; }
.pb .vuoto-l .binario::before { background: repeating-linear-gradient(180deg, var(--line-strong) 0 4px, transparent 4px 9px); }
.pb .vuoto-card { position: absolute; left: 72px; right: 16px; top: 24px; padding: 20px 16px; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; }
.pb .vuoto-card h2 { font: 600 24px/1.15 var(--f-titoli); margin: 0 0 8px; }
.pb .vuoto-card p { color: var(--ink-2); margin-bottom: 16px; }
.pb .vuoto-card .giallo { width: 100%; height: 52px; font-size: 17px; }
.pb .pronti { margin-top: 16px; border-top: 1px solid var(--line); }
.pb .pronti h3 { margin: 12px 0 4px; font: 600 16px/1.2 var(--f-titoli); color: var(--ink-2); }
.pb .pronto { display: grid; grid-template-columns: 1fr 24px; align-items: center; min-height: 56px; border-bottom: 1px solid var(--line); }
.pb .pronto strong { display: block; font-weight: 600; font-size: 16px; }
.pb .pronto span { font-size: 14px; color: var(--ink-3); }
/* pannello per aggiungere */
.pb .velo { position: absolute; inset: 0; background: rgba(0, 0, 0, .45); }
.pb .pannello { position: absolute; left: 0; right: 0; bottom: 0; top: 96px; display: flex; flex-direction: column; background: var(--canvas); border-radius: 14px 14px 0 0; border-top: 1px solid var(--line); }
.pb .pannello__testa { display: flex; align-items: center; gap: 8px; padding: 8px 8px 4px 16px; }
.pb .pannello__testa h2 { flex: 1; font: 600 24px/1.1 var(--f-titoli); margin: 0; }
.pb .maniglia-pannello { width: 40px; height: 5px; border-radius: 3px; background: var(--line-strong); margin: 8px auto 0; }
.pb .cerca { margin: 4px 16px 8px; height: 48px; display: flex; align-items: center; gap: 8px; padding: 0 12px; background: var(--surface); border: 1px solid var(--line-strong); border-radius: 8px; color: var(--ink-3); }
.pb .filtri { display: flex; gap: 8px; padding: 0 16px 12px; overflow: hidden; }
.pb .filtro { height: 44px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--line-strong); background: var(--surface); white-space: nowrap; font-weight: 500; font-size: 15px; }
.pb .filtro[aria-pressed="true"] { background: var(--ink); color: var(--canvas); border-color: var(--ink); }
.pb .elenco { margin: 0 16px; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
.pb .elenco__testa { padding: 10px 12px; font-size: 14px; color: var(--ink-3); border-bottom: 1px solid var(--line); background: var(--surface-2); }
.pb .scelta { display: grid; grid-template-columns: 64px 1fr 44px; gap: 8px; align-items: center; padding: 10px 8px 10px 0; border-bottom: 1px solid var(--line); }
.pb .scelta:last-child { border-bottom: 0; }
.pb .scelta__dist { text-align: center; font: 600 20px/1 var(--f-titoli); font-variant-numeric: tabular-nums; }
.pb .scelta__dist small { display: block; font: 500 12px/1.3 var(--f-ui); color: var(--ink-3); margin-top: 2px; }
.pb .scelta__nome { font: 600 18px/1.2 var(--f-titoli); }
.pb .scelta__meta { font-size: 14px; color: var(--ink-3); }
.pb .scelta__chiuso { font-size: 14px; color: var(--warn); }
.pb .scelta .ib { border: 2px solid var(--ink); background: var(--giallo); color: var(--giallo-ink); }
[data-theme="dark"] .pb .scelta .ib { border-color: var(--giallo); }
/* mappa */
.pb .mappa { position: relative; height: 400px; margin: 0 0 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.pb .mappa svg { width: 100%; height: 100%; display: block; }
.pb .m-sfondo { fill: var(--land); }
.pb .m-mare { fill: var(--sea); }
.pb .m-parco { fill: var(--park); }
.pb .m-piccole { fill: none; stroke: var(--path); stroke-width: 1.2; }
.pb .m-medie-c { fill: none; stroke: var(--road-c); stroke-width: 4.2; stroke-linecap: round; stroke-linejoin: round; }
.pb .m-medie { fill: none; stroke: var(--road); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.pb .m-grandi-c { fill: none; stroke: var(--road-c); stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; }
.pb .m-grandi { fill: none; stroke: var(--road); stroke-width: 5.5; stroke-linecap: round; stroke-linejoin: round; }
.pb .m-giro { fill: none; stroke: var(--ink); stroke-width: 4; stroke-dasharray: .1 7; stroke-linecap: round; stroke-linejoin: round; }
.pb .m-giro-c { fill: none; stroke: var(--surface); stroke-width: 9; stroke-linecap: round; stroke-linejoin: round; opacity: .9; }
.pb .m-funi { fill: none; stroke: var(--funi); stroke-width: 6; stroke-linecap: round; }
.pb .m-metro { fill: none; stroke: var(--metro); stroke-width: 6; stroke-linecap: round; }
.pb .m-trattino { stroke: var(--ink); } .pb .m-punto { fill: var(--ink); }
.pb .riassunto { padding: 12px 16px; display: grid; gap: 4px; }
.pb .riassunto-r { display: grid; grid-template-columns: 30px 52px 1fr; gap: 8px; align-items: center; min-height: 32px; font-size: 15px; }
.pb .riassunto-r b { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; border: 3px solid var(--ink); font: 600 14px/1 var(--f-titoli); background: var(--surface); }
.pb .riassunto-r span:nth-child(2) { font: 600 15px/1 var(--f-titoli); font-variant-numeric: tabular-nums; }
.pb .legenda { display: flex; gap: 16px; padding: 10px 16px 0; font-size: 13px; color: var(--ink-2); }
.pb .legenda span { display: inline-flex; align-items: center; gap: 6px; }
.pb .legenda i { width: 22px; height: 0; border-top: 4px dotted var(--ink); }
.pb .legenda i.f { border-top: 5px solid var(--funi); }
/* ---- B con le richieste: niente linea con le fermate, giallo solo sulle piastrelle ---- */
.pb { --tile: #F3C431; --tile-ink: #000; --tile-edge: #C99A12; }
[data-theme="dark"] .pb { --tile: #F5CC48; --tile-ink: #000; --tile-edge: #B88A10; }
.pb .piastrella { display: grid; place-items: center; border-radius: 6px; background: var(--tile); color: var(--tile-ink); font: 600 17px/1 var(--f-titoli); font-variant-numeric: tabular-nums; box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--tile) 55%, #fff), inset 0 0 0 3px var(--tile-edge); }
.pb .piastrella--piccola { width: 26px; height: 26px; border-radius: 5px; font-size: 15px; }
.pb .riga-l { grid-template-columns: 56px 1fr; }
.pb .vuoto-l .riga-l { grid-template-columns: 56px 24px 1fr; }
.pb .binario::before { display: none; }
.pb .vuoto-l .binario::before { display: block; }
.pb .ora { padding-top: 14px; }
.pb .blocco { margin: 4px 0; grid-template-columns: 56px 1fr 44px; gap: 8px; align-items: start; }
.pb .blocco__foto { position: relative; width: 56px; height: 56px; }
.pb .blocco__foto img, .pb .senza-foto { display: block; width: 56px; height: 56px; border-radius: 8px; object-fit: cover; background: var(--surface-2); }
.pb .blocco__foto .piastrella { position: absolute; left: -6px; top: -6px; }
.pb .tratto-txt { margin-left: 4px; padding-left: 10px; border-left: 3px solid var(--line-strong); }
.pb .tratto-l.funi .tratto-txt { border-left: 5px solid var(--funi); }
.pb .tratto-l.metro .tratto-txt { border-left: 5px solid var(--metro); }
.pb .tratto-l .binario { display: none; }
.pb .avviso { margin: 4px 0 8px; }
.pb .blocco__oltre { grid-column: 1 / -1; }
.pb .giallo { background: var(--ink); color: var(--canvas); border-color: var(--ink); }
[data-theme="dark"] .pb .giallo { border-color: var(--ink); }
.pb .orario .vista button[aria-pressed="true"] { background: var(--canvas); color: var(--ink); }
[data-theme="dark"] .pb .orario .vista button[aria-pressed="true"] { background: var(--ink); color: var(--canvas); }
.pb .scelta { grid-template-columns: 56px 1fr 44px; padding: 10px 8px 10px 12px; }
.pb .scelta .senza-foto, .pb .scelta img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; background: var(--surface-2); display: block; }
.pb .scelta__meta b { font-weight: 600; color: var(--ink); }
.pb .scelta .ib { border: 2px solid var(--line-strong); background: var(--surface); color: var(--ink); border-radius: 8px; }
.pb .riassunto-r b.piastrella { border: 0; border-radius: 5px; background: var(--tile); color: var(--tile-ink); }
[data-theme="dark"] .pb .scelta .ib { border-color: var(--line-strong); }
.pb .limite .ora { color: var(--warn); }
`;

function testaB() {
  return `<header class="testa"><span class="marchio">${logo}Napoli a Vela</span><button class="ib" aria-label="Apri il menu">${icona('menu')}</button></header>`;
}
function titoloB(giorno, g, vista = 'giornata') {
  return `<div class="titolo"><h1>Giorno ${giorno}</h1><div class="giorni" role="tablist"><button class="giorno" role="tab" aria-selected="${giorno === 1}">1</button><button class="giorno" role="tab" aria-selected="${giorno === 2}">2</button><button class="giorno" aria-label="Aggiungi un giorno">${icona('piu', 20)}</button></div></div>
    <div class="sotto"><span>${giorno === 1 ? 'Giovedì 15 luglio' : 'Venerdì 16 luglio'} · dalle 9:30 alle ${ora(FINE_SCELTA)}</span><button>Cambia</button></div>
    ${g ? `<div class="orario"><div><strong>${ora(g.inizio)} → ${ora(g.fine)}</strong><br><span>${g.n} tappe · ${durata(g.spostamenti)} di spostamenti</span></div><div class="vista" role="group" aria-label="Vista"><button aria-pressed="${vista === 'giornata'}" aria-label="Giornata">${icona('lista', 22)}</button><button aria-pressed="${vista === 'mappa'}" aria-label="Mappa">${icona('mappa', 22)}</button></div></div>` : ''}`;
}
const fotoB = id => (foto(id) ? `<img src="${foto(id)}" alt="">` : '<span class="senza-foto"></span>');
function lineaB(g, { lontano, scelto, pieno, da = 0, a = 99 } = {}) {
  let n = 0, html = '';
  for (const v of g.voci) {
    if (v.tipo === 'tappa') n++;
    const pos = v.tipo === 'tappa' ? n : n + 0.5;
    if (pos < da || pos > a) continue;
    if (v.tipo === 'tratto') {
      const cl = v.mezzi.includes('FA') || v.mezzi.includes('FB') || v.mezzi.includes('FD') ? ' funi' : v.mezzi.length ? ' metro' : '';
      html += `<div class="riga-l tratto-l${cl}"><span class="ora"></span><div class="tratto-txt">${v.mezzi.length ? iconaMezzo(v.mezzi[0]) : icona('piedi', 18)}<span>${testoTratto(v)}</span></div></div>`;
      continue;
    }
    const taglia = pieno && v.fine > FINE_SCELTA;
    const t = tappa(v.id);
    const cl = v.id === scelto ? ' blocco--scelto' : v.id === lontano ? ' blocco--attenzione' : '';
    const nota = v.id === 'tribunali' ? 'Pranzo: pizza a portafoglio e fritti' : v.id === 'pedamentina' ? 'In discesa, fino a Corso Vittorio Emanuele' : '';
    const azioni = v.id === scelto ? `<div class="blocco__azioni"><button aria-label="Sposta su">${icona('su', 20)}Su</button><button aria-label="Sposta giù">${icona('giu', 20)}Giù</button><button class="togli">${icona('x', 20)}Togli</button></div>` : '';
    const oltre = taglia ? `<div class="blocco__limite" aria-hidden="true"></div><div class="blocco__oltre"><b>${ora(FINE_SCELTA)}</b> fine della giornata: da qui sei ${v.fine - Math.max(v.inizio, FINE_SCELTA)} minuti oltre</div>` : '';
    html += `<div class="riga-l"><span class="ora">${ora(v.inizio)}</span><div class="blocco${cl}${taglia ? ' blocco--oltre' : ''}"><div class="blocco__foto">${fotoB(v.id)}<span class="piastrella piastrella--piccola">${n}</span></div><div><div class="blocco__nome">${t.nome}</div><div class="blocco__meta">${durata(t.durata)} · fino alle ${ora(v.fine)}</div>${nota ? `<div class="blocco__nota">${nota}</div>` : ''}</div><button class="ib" aria-label="Trascina ${nome(v.id)}">${icona('maniglia')}</button>${oltre}${azioni}</div></div>`;
    if (v.id === lontano) {
      html += `<div class="riga-l"><span class="ora"></span><div class="avviso" role="status"><div class="avviso__titolo">${icona('attenzione', 20)}<span>${nome(v.id)} è lontana dalle altre tappe</span></div><p>Circa 40 minuti in più tra andata e ritorno. Vuoi metterla in un altro giorno?</p><div class="avviso__azioni"><button class="giallo">Sposta nel giorno 2</button><button class="contorno">Lascia qui</button></div></div></div>`;
    }
  }
  return `<div class="linea">${html}</div>`;
}
function mappaB(ids) {
  const R = riquadro(ids, 390 / 400, 0.1);
  const { pos, s, trattini } = marcatori(ids, R, 24, 390);
  const u = R.w / 390;
  const linee = pezzi(ids).map(p => p.modo === 'piedi'
    ? `<path class="m-giro-c" style="stroke-width:${(9 * u).toFixed(2)}" d="${proietta(p.punti)}"/><path class="m-giro" style="stroke-width:${(4 * u).toFixed(2)};stroke-dasharray:.1 ${(7 * u).toFixed(2)}" d="${proietta(p.punti)}"/>`
    : `<path class="m-giro-c" style="stroke-width:${(10 * u).toFixed(2)}" d="${proietta(p.punti)}"/><path class="${p.modo.startsWith('F') ? 'm-funi' : 'm-metro'}" style="stroke-width:${(6 * u).toFixed(2)}" d="${proietta(p.punti)}"/>`).join('');
  const segni = pos.map((p, k) => { const x = p.x - s / 2, y = p.y - s / 2; return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><rect width="${s.toFixed(1)}" height="${s.toFixed(1)}" rx="${(s * 0.2).toFixed(1)}" fill="var(--tile)" stroke="var(--tile-edge)" stroke-width="${(1.5 * u).toFixed(2)}"/><rect x="${(s * 0.1).toFixed(1)}" y="${(s * 0.1).toFixed(1)}" width="${(s * 0.8).toFixed(1)}" height="${(s * 0.8).toFixed(1)}" rx="${(s * 0.12).toFixed(1)}" fill="none" stroke="color-mix(in srgb, var(--tile) 55%, #fff)" stroke-width="${(1.5 * u).toFixed(2)}"/><text x="${(s / 2).toFixed(1)}" y="${(s * 0.72).toFixed(1)}" text-anchor="middle" font-family="Barlow Semi Condensed, sans-serif" font-weight="600" font-size="${(s * 0.62).toFixed(1)}" fill="var(--tile-ink)">${k + 1}</text></g>`; }).join('');
  return `<div class="mappa"><svg viewBox="${R.vb}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mappa del giorno 1: ${ids.length} tappe collegate nell'ordine"><rect class="m-sfondo" x="0" y="0" width="${MAPPA.w}" height="${MAPPA.h}"/>${baseMappa}${linee}<g style="stroke-width:${(1.5 * u).toFixed(2)}">${trattini}</g>${segni}</svg></div>`;
}

function schermiB() {
  const g = giornata(G1), gl = giornata(G1_LONTANO), gp = giornata(G1_PIENO);
  const ultimo = 'spaccanapoli';
  const vicine = TEMPI.punti.filter(p => !p.endsWith('>') && !G1.includes(p))
    .map(id => ({ id, min: F.min[ix(uscita(ultimo))][ix(id)] }))
    .sort((a, b) => a.min - b.min).slice(0, 5);
  // B1 · aggiungere una tappa: il pannello con le tappe vicine all'ultima
  const b1 = `<section class="tel pb" id="b1">${testaB()}${titoloB(1, g)}${lineaB(g, { da: 7, a: 8 })}
    <div class="velo"></div>
    <div class="pannello" role="dialog" aria-label="Aggiungi una tappa"><div class="maniglia-pannello" aria-hidden="true"></div>
      <div class="pannello__testa"><h2>Aggiungi una tappa</h2><button class="ib" aria-label="Chiudi">${icona('x')}</button></div>
      <div class="cerca" role="search" aria-label="Cerca una tappa">${icona('cerca', 20)}<span>Cerca una tappa</span></div>
      <div class="filtri"><button class="filtro" aria-pressed="true">Vicine</button><button class="filtro" aria-pressed="false">Al chiuso</button><button class="filtro" aria-pressed="false">Gratis</button><button class="filtro" aria-pressed="false">Con i bambini</button></div>
      <div class="elenco"><div class="elenco__testa">Vicine all'ultima tappa, ${nome(ultimo)}</div>${vicine.map(v => `<div class="scelta">${fotoB(v.id)}<div><div class="scelta__nome">${tappa(v.id).nome}</div><div class="scelta__meta"><b>${v.min < 1 ? 'Accanto' : v.min + ' min'}</b> · ${meta(v.id)}</div>${avvisoGiorni(v.id) ? `<div class="scelta__chiuso">${avvisoGiorni(v.id)}</div>` : ''}</div><button class="ib" aria-label="Aggiungi ${nome(v.id)} dopo ${nome(ultimo)}">${icona('piu')}</button></div>`).join('')}</div>
    </div></section>`;
  // B2 · la giornata con l'avviso «è lontana» e i comandi della tappa scelta
  const b2 = `<section class="tel pb" id="b2">${testaB()}${titoloB(1, gl)}${lineaB(gl, { lontano: 'floridiana', scelto: 'floridiana', da: 3.5, a: 5 })}
    <div class="barra-fissa"><button class="giallo">${icona('piu', 22)}Aggiungi una tappa</button></div></section>`;
  // B3 · giornata piena: la riga della fine giornata
  const b3 = `<section class="tel pb" id="b3">${testaB()}${titoloB(1, gp)}
    <div class="avviso" style="margin:0 16px 4px" role="status"><div class="avviso__titolo">${icona('attenzione', 20)}<span>Il giorno 1 è pieno</span></div><p>Con il lungomare finisci alle ${ora(gp.fine)}, dopo le ${ora(FINE_SCELTA)}.</p><div class="avviso__azioni"><button class="giallo">Sposta nel giorno 2</button><button class="contorno">Finisci alle 20:00</button></div></div>
    ${lineaB(gp, { pieno: true, da: 8, a: 9 })}
    <div class="barra-fissa"><button class="giallo">${icona('piu', 22)}Aggiungi una tappa</button></div></section>`;
  // B4 · giorno vuoto: la linea delle ore resta
  const ore = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(h => `<div class="riga-l"><span class="ora">${h}:00</span><span class="binario"></span><span></span></div>`).join('');
  const b4 = `<section class="tel pb" id="b4">${testaB()}${titoloB(2, null)}
    <div class="vuoto-l">${ore}
      <div class="vuoto-card"><h2>Il giorno 2 è vuoto</h2><p>Aggiungi la prima tappa: dopo ti mostriamo quelle vicine, con i minuti per arrivarci.</p><button class="giallo">${icona('piu', 22)}Aggiungi la prima tappa</button>
        <div class="pronti"><h3>Oppure parti da un itinerario pronto</h3>
          <div class="pronto"><div><strong>Mezza giornata nel centro storico</strong><span>4 tappe a piedi · circa 4 ore</span></div>${icona('avanti')}</div>
          <div class="pronto"><div><strong>Un giorno: dal Plebiscito al Vomero</strong><span>8 tappe · funicolare e Pedamentina</span></div>${icona('avanti')}</div>
          <div class="pronto"><div><strong>Due giorni</strong><span>Centro storico, Vomero e lungomare</span></div>${icona('avanti')}</div>
          <div class="pronto"><div><strong>Tre giorni</strong><span>Anche Capodimonte, Sanità e Posillipo</span></div>${icona('avanti')}</div>
        </div></div></div></section>`;
  // B5 · mappa: la linea del giorno con le fermate numerate
  const tappeG = g.voci.filter(v => v.tipo === 'tappa');
  const b5 = `<section class="tel pb" id="b5">${testaB()}${titoloB(1, g, 'mappa')}
    ${mappaB(G1)}
    <div class="legenda"><span><i></i>a piedi</span><span><i class="f"></i>Funicolare Centrale</span></div>
    <div class="riassunto">${tappeG.slice(0, 4).map((v, k) => `<div class="riassunto-r"><b class="piastrella piastrella--piccola">${k + 1}</b><span>${ora(v.inizio)}</span><span>${tappa(v.id).nome}</span></div>`).join('')}</div></section>`;
  return [b1, b2, b3, b4, b5].join('\n');
}

fs.writeFileSync(path.join(QUI, 'proposta-a.html'), pagina('Itinerari · proposta A «Riggiola»', cssA, schermiA()));
fs.writeFileSync(path.join(QUI, 'proposta-b.html'), pagina('Itinerari · proposta B «Orario»', cssB, schermiB()));
console.log('Scritti design/itinerari/proposta-a.html e proposta-b.html');
