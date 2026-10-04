// La mappa del giorno: la nostra mappa di OpenStreetMap (src/data/mappa.json) con i percorsi veri tra le tappe
// (src/data/percorsi-tappe.json, fatti da scripts/itinerari/costruisci.mjs) e le piastrelle numerate.
// Si carica solo quando apri la mappa; poi resta nella memoria per l'uso senza rete (service worker).
// Un dito sposta, due dita ingrandiscono; + e − e «mostra tutto»; le piastrelle restano della stessa misura.
import type { Citta, Itinerario, Risultato, Scenario, Voce } from '../../lib/itinerari/tipi';
import { tappaDi } from '../../lib/itinerari/calcolo';
import { ora } from '../../lib/itinerari/date';

type Base = { w: number; h: number; mare: string; isole: string; parchi: string; strade: string[]; moli: string };
type Percorsi = { punti: string[]; scenari: Record<Scenario, (string | 0)[][]> };
type Box = { x: number; y: number; w: number; h: number };
type Segno = { id: string; n: number; x: number; y: number; g: SVGGElement; filo: SVGLineElement; punto: SVGCircleElement };

let dati: Promise<[Base, Percorsi]> | null = null;
const carica = () => (dati ??= Promise.all([
  fetch('/napoli/itinerari/mappa.json').then(r => { if (!r.ok) throw new Error('mappa'); return r.json() as Promise<Base>; }),
  fetch('/napoli/itinerari/percorsi.json').then(r => { if (!r.ok) throw new Error('percorsi'); return r.json() as Promise<Percorsi>; })
]).catch(e => { dati = null; throw e; }));

// le strade alternative degli orari veri (senza bus, o con un altro bus): si caricano solo se servono
type Alternativi = { senza: Record<string, (string | 0)[][]>; candidati: string[] };
let alt: Promise<Alternativi | null> | null = null;
const caricaAlt = () => (alt ??= fetch('/napoli/itinerari/percorsi-alternativi.json').then(r => (r.ok ? r.json() as Promise<Alternativi> : null)).catch(() => { alt = null; return null; }));

const NS = 'http://www.w3.org/2000/svg';
const el = <K extends keyof SVGElementTagNameMap>(tag: K, attr: Record<string, string | number> = {}) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attr)) e.setAttribute(k, String(v));
  return e;
};

// Percorso codificato: «p» o la linea e un punto, poi differenze dal punto prima (6 bit per carattere, zigzag)
const ALFA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function decodifica(s: string): { modo: string; punti: [number, number][] }[] {
  return s.split('~').filter(Boolean).map(pezzo => {
    const k = pezzo.indexOf('.');
    const nums: number[] = [];
    let z = 0, mul = 1;
    for (const c of pezzo.slice(k + 1)) {
      const v = ALFA.indexOf(c);
      z += (v & 31) * mul;
      if (v & 32) { mul *= 32; continue; }
      nums.push(z % 2 ? -(z + 1) / 2 : z / 2);
      z = 0; mul = 1;
    }
    const punti: [number, number][] = [];
    let x = 0, y = 0;
    for (let k = 0; k + 1 < nums.length; k += 2) { x += nums[k]; y += nums[k + 1]; punti.push([x, y]); }
    return { modo: pezzo.slice(0, k), punti };
  });
}

// ---------- stato della mappa ----------
let svg: SVGSVGElement | null = null;
let giro: SVGGElement, segniG: SVGGElement, filiG: SVGGElement;
let piena: Box = { x: 0, y: 0, w: 1, h: 1 };
let box: Box = { x: 0, y: 0, w: 1, h: 1 };
let adatta: Box = { x: 0, y: 0, w: 1, h: 1 };
let segni: Segno[] = [];
let scelto: string | null = null;
let opz: { riassunto: HTMLElement; legenda: HTMLElement; apri: (id: string) => void } | null = null;

function costruisci(area: HTMLElement, B: Base) {
  piena = { x: 0, y: 0, w: B.w, h: B.h };
  svg = el('svg', { viewBox: `0 0 ${B.w} ${B.h}`, role: 'img', preserveAspectRatio: 'xMidYMid meet' });
  svg.append(
    el('rect', { class: 'm-terra', x: -B.w, y: -B.h, width: B.w * 3, height: B.h * 3 }),
    el('path', { class: 'm-mare', d: B.mare }),
    el('path', { class: 'm-isole', d: B.isole }),
    el('path', { class: 'm-parco', d: B.parchi }),
    el('path', { class: 'm-strade0', d: B.strade[0] }),
    el('path', { class: 'm-strade1-c', d: B.strade[1] }), el('path', { class: 'm-strade1', d: B.strade[1] }),
    el('path', { class: 'm-strade2-c', d: B.strade[2] }), el('path', { class: 'm-strade2', d: B.strade[2] }),
    el('path', { class: 'm-moli', d: B.moli, fill: 'var(--it-path)' })
  );
  giro = el('g'); filiG = el('g'); segniG = el('g');
  svg.append(giro, filiG, segniG);
  area.replaceChildren(svg);
  gesti(svg);
  new ResizeObserver(() => { box = limita(box); ridisegna(); }).observe(area);
}

// ---------- disegno del giorno ----------
export async function disegna(area: HTMLElement, C: Citta, it: Itinerario, g: number, r: Risultato, o: NonNullable<typeof opz>) {
  opz = o;
  const [B, P] = await carica();
  if (!svg || !area.contains(svg)) costruisci(area, B);
  const G = it.giorni[g];
  giro.replaceChildren(); segniG.replaceChildren(); filiG.replaceChildren();
  segni = [];
  const modi = new Set<string>();
  const tutti: [number, number][] = [];
  const linea = (punti: [number, number][], modo: string) => {
    if (punti.length < 2) return;
    const d = 'M' + punti.map(p => p.join(' ')).join('L');
    const cls = modo === 'p' ? 'm-piedi' : modo.startsWith('F') ? 'm-funi' : modo.startsWith('B') ? 'm-bus' : 'm-metro';
    modi.add(cls);
    giro.append(el('path', { class: 'm-giro-c', d }), el('path', { class: cls, d }));
    tutti.push(...punti);
  };
  const percorso = (s: Scenario, a: number, b: number) => {
    const x = P.scenari[s]?.[a]?.[b];
    return typeof x === 'string' ? x : (P.scenari.feriale[a]?.[b] as string) || '';
  };
  const tappe = r.voci.filter((v): v is Extract<Voce, { tipo: 'tappa' }> => v.tipo === 'tappa');
  if (G.gita) {
    const t = tappaDi(C, G.gita)!;
    segni.push(segno(t.id, 1, t.xy));
    tutti.push(t.xy);
    svg!.setAttribute('aria-label', `Mappa del giorno ${g + 1}: la gita a ${t.breve} parte da ${t.partenza}`);
  } else {
    const Alt = r.voci.some(v => v.tipo === 'tratto' && v.variante != null) ? await caricaAlt() : null;
    for (const v of r.voci) {
      if (v.tipo !== 'tratto') continue;
      let s: string;
      if (v.variante == null) s = percorso(v.scenario, v.da, v.a);
      else if (v.variante === 'senza') { const x = Alt?.senza[v.scenario]?.[v.da]?.[v.a]; s = x === 0 ? percorso(v.scenario, v.da, v.a) : x ?? ''; }
      else s = Alt?.candidati[v.variante] ?? '';   // senza rete e senza copia salvata: quel tratto non si disegna
      for (const p of decodifica(s)) linea(p.punti, p.modo);
    }
    for (const v of tappe) {
      const ev = C.evento && v.id === C.evento.id;
      const t = ev ? null : tappaDi(C, v.id)!;
      const xy = ev ? C.evento!.xy : v.indietro && t!.xyFine ? t!.xyFine : t!.xy;
      // dentro la tappa: il percorso a piedi da un capo all'altro
      if (t && t.pf != null) {
        const [a, b] = v.indietro ? [t.pf, t.p] : [t.p, t.pf];
        for (const p of decodifica(percorso('piedi', a, b))) linea(p.punti, 'p');
      }
      segni.push(segno(v.id, v.n, xy));
      tutti.push(xy);
    }
    svg!.setAttribute('aria-label', `Mappa del giorno ${g + 1}: ${tappe.length} ${tappe.length === 1 ? 'tappa' : 'tappe'} collegate nell'ordine`);
  }
  // riquadro che contiene tutto il giorno (il margine lo aggiunge inquadra, in pixel)
  if (tutti.length) {
    const xs = tutti.map(p => p[0]), ys = tutti.map(p => p[1]);
    const [x1, x2, y1, y2] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const w = Math.max(x2 - x1, 140), h = Math.max(y2 - y1, 140);
    adatta = { x: (x1 + x2) / 2 - w / 2, y: (y1 + y2) / 2 - h / 2, w, h };
  } else adatta = { ...piena };
  inquadra(adatta);
  // legenda e riassunto
  o.legenda.innerHTML = [modi.has('m-piedi') && '<span><i></i>a piedi</span>', modi.has('m-metro') && '<span><i class="it-l-metro"></i>metro e treni</span>', modi.has('m-funi') && '<span><i class="it-l-funi"></i>funicolari</span>', modi.has('m-bus') && '<span><i class="it-l-bus"></i>autobus</span>'].filter(Boolean).join('');
  o.riassunto.innerHTML = G.gita
    ? `<li><button type="button" data-id="${G.gita}"><span class="it-piastrella" aria-hidden="true">1</span><span class="it-riassunto__ora"></span><span class="it-riassunto__nome">Partenza: ${tappaDi(C, G.gita)!.partenza}</span></button></li>`
    : tappe.map(v => `<li><button type="button" data-id="${v.id}"><span class="it-piastrella" aria-hidden="true">${v.n}</span><span class="it-riassunto__ora">${v.fatta ? 'fatta' : ora(v.inizio)}</span><span class="it-riassunto__nome">${(C.evento && v.id === C.evento.id ? C.evento.nome : tappaDi(C, v.id)!.nome).replace(/</g, '&lt;')}</span></button></li>`).join('');
  o.riassunto.onclick = e => {
    const b = (e.target as Element).closest<HTMLElement>('[data-id]');
    if (!b) return;
    scegli(b.dataset.id!);
    const s = segni.find(x => x.id === b.dataset.id);
    if (s) vai({ x: s.x - box.w / 2, y: s.y - box.h / 2, w: box.w, h: box.h });
  };
  scelto = null;
}

function segno(id: string, n: number, [x, y]: [number, number]): Segno {
  const g = el('g', { class: 'm-segno', 'data-id': id });
  g.append(
    el('rect', { class: 'm-p', x: -12, y: -12, width: 24, height: 24, rx: 5 }),
    el('rect', { class: 'm-p2', x: -9.5, y: -9.5, width: 19, height: 19, rx: 3.5 }),
    Object.assign(el('text', { x: 0, y: 5.5, 'text-anchor': 'middle' }), { textContent: String(n) })
  );
  const filo = el('line', { class: 'm-trattino' }), punto = el('circle', { class: 'm-punto', r: 0 });
  filiG.append(filo, punto);
  segniG.append(g);
  g.addEventListener('click', () => scegli(id));
  return { id, n, x, y, g, filo, punto };
}

function scegli(id: string) {
  scelto = id;
  segni.forEach(s => s.g.classList.toggle('m-segno--scelto', s.id === id));
  opz?.riassunto.querySelectorAll('button').forEach(b => b.setAttribute('aria-current', String(b.dataset.id === id)));
}

// ---------- vista: spostare, ingrandire, piastrelle sempre della stessa misura ----------
const rapporto = () => { const r = svg!.getBoundingClientRect(); return r.width && r.height ? r.width / r.height : 1; };
function limita(b: Box): Box {
  if (!svg) return b;
  const ar = rapporto();
  let w = Math.min(Math.max(b.w, 120), piena.w * 1.1), h = w / ar;
  if (h > piena.h * 1.1) { h = piena.h * 1.1; w = h * ar; }
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  let x = cx - w / 2, y = cy - h / 2;
  x = Math.min(Math.max(x, piena.x - w * 0.4), piena.x + piena.w - w * 0.6);
  y = Math.min(Math.max(y, piena.y - h * 0.4), piena.y + piena.h - h * 0.6);
  return { x, y, w, h };
}
function vai(b: Box) {
  const ar = rapporto();
  let w = b.w, h = b.h;
  if (w / h < ar) w = h * ar; else h = w / ar;
  box = limita({ x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - h / 2, w, h });
  ridisegna();
}
// Mostra tutto il riquadro lasciando libero lo spazio dei pulsanti a destra e un margine per le piastrelle
function inquadra(b: Box) {
  const r = svg!.getBoundingClientRect();
  const W = r.width || 390, H = r.height || 400;
  const pad = { l: 36, r: 76, t: 36, b: 36 };
  const s = Math.max(b.w / Math.max(W - pad.l - pad.r, 80), b.h / Math.max(H - pad.t - pad.b, 80));
  const fx = (pad.l + (W - pad.l - pad.r) / 2) / W, fy = (pad.t + (H - pad.t - pad.b) / 2) / H;
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  box = limita({ x: cx - fx * W * s, y: cy - fy * H * s, w: W * s, h: H * s });
  ridisegna();
}
function ridisegna() {
  if (!svg) return;
  svg.setAttribute('viewBox', `${box.x.toFixed(1)} ${box.y.toFixed(1)} ${box.w.toFixed(1)} ${box.h.toFixed(1)}`);
  const px = svg.getBoundingClientRect().width || 390;
  const k = box.w / px;            // unità della mappa per un pixel
  // piastrelle che non si coprono: si allontanano quanto basta, e un filo le lega al punto vero
  const pos = segni.map(s => ({ x: s.x, y: s.y }));
  const min = 27 * k;
  for (let giro = 0; giro < 80; giro++) {
    let mosso = false;
    for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) {
      let dx = pos[j].x - pos[i].x, dy = pos[j].y - pos[i].y, d = Math.hypot(dx, dy);
      if (d >= min) continue;
      if (d < 0.01) { dx = 1; dy = 0.35; d = Math.hypot(dx, dy); }
      const f = (min - d) / 2 / d;
      pos[i].x -= dx * f; pos[i].y -= dy * f; pos[j].x += dx * f; pos[j].y += dy * f; mosso = true;
    }
    if (!mosso) break;
  }
  segni.forEach((s, i) => {
    const p = pos[i];
    s.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${k.toFixed(4)})`);
    const lontano = Math.hypot(p.x - s.x, p.y - s.y) > 6 * k;
    s.filo.setAttribute('x1', String(s.x)); s.filo.setAttribute('y1', String(s.y));
    s.filo.setAttribute('x2', String(p.x)); s.filo.setAttribute('y2', String(p.y));
    s.filo.style.display = lontano ? '' : 'none';
    s.punto.setAttribute('cx', String(s.x)); s.punto.setAttribute('cy', String(s.y));
    s.punto.setAttribute('r', lontano ? String(3 * k) : '0');
  });
}
export function zoom(z: 'piu' | 'meno' | 'tutto') {
  if (z === 'tutto') { inquadra(adatta); return; }
  const f = z === 'piu' ? 0.66 : 1.5;
  box = limita({ x: box.x + (box.w * (1 - f)) / 2, y: box.y + (box.h * (1 - f)) / 2, w: box.w * f, h: box.h * f });
  ridisegna();
}

function gesti(s: SVGSVGElement) {
  const dita = new Map<number, { x: number; y: number }>();
  let distanza = 0;
  const punto = (cx: number, cy: number) => { const r = s.getBoundingClientRect(); return { x: box.x + ((cx - r.left) / r.width) * box.w, y: box.y + ((cy - r.top) / r.height) * box.h }; };
  const ingrandisci = (f: number, cx: number, cy: number) => {
    const p = punto(cx, cy);
    const nw = box.w * f, nh = box.h * f;
    box = limita({ x: p.x - ((p.x - box.x) / box.w) * nw, y: p.y - ((p.y - box.y) / box.h) * nh, w: nw, h: nh });
    ridisegna();
  };
  s.addEventListener('pointerdown', e => {
    if ((e.target as Element).closest('.m-segno')) return;
    s.setPointerCapture(e.pointerId);
    dita.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (dita.size === 2) { const [a, b] = [...dita.values()]; distanza = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  s.addEventListener('pointermove', e => {
    const prima = dita.get(e.pointerId);
    if (!prima) return;
    const ora = { x: e.clientX, y: e.clientY };
    if (dita.size === 1) {
      const r = s.getBoundingClientRect();
      box = limita({ ...box, x: box.x - ((ora.x - prima.x) / r.width) * box.w, y: box.y - ((ora.y - prima.y) / r.height) * box.h });
      ridisegna();
    }
    dita.set(e.pointerId, ora);
    if (dita.size === 2) {
      const [a, b] = [...dita.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (distanza > 0 && d > 0) ingrandisci(distanza / d, (a.x + b.x) / 2, (a.y + b.y) / 2);
      distanza = d;
    }
  });
  const fine = (e: PointerEvent) => { dita.delete(e.pointerId); if (dita.size < 2) distanza = 0; };
  s.addEventListener('pointerup', fine);
  s.addEventListener('pointercancel', fine);
  // rotella solo con Ctrl (o il pizzico del trackpad): la pagina scorre normalmente
  s.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); ingrandisci(Math.exp(e.deltaY * 0.01), e.clientX, e.clientY); }, { passive: false });
}
