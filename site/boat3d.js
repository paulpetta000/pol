import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

/* AC40 ricostruito sulle misure di classe: lunghezza 11,80 m, baglio 3,38 m, albero 17,92 m,
   randa a doppia pelle 63 m², fiocco J1 32 m², foil a T zavorrati su bracci basculanti, timone a T.
   Assi: X verso prua, Y verso l'alto, acqua a y = 0, vento da +Z (lato sopravento). */
const L = 11.8, MAST_H = 17.92, DECK = 2.15, WIND = 1, FLOW = 11;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const { clamp, lerp, degToRad: rad } = THREE.MathUtils;

// Inquadrature per ogni tappa (metri; t = punto guardato, d = distanza, az/el = angoli in gradi)
const VIEWS = [
  { t: [0, 7, 0], d: 25, az: 35, el: 10 },
  { t: [0.1, 18.9, -0.5], d: 7.5, az: 60, el: 4 },
  { t: [-1.2, 9.5, -0.6], d: 19, az: 115, el: 6 },
  { t: [3.2, 7, -0.4], d: 14, az: 60, el: 8 },
  { t: [-1.3, 2.6, -0.4], d: 7.5, az: 150, el: 30 },
  { t: [-2.1, 2.5, 0.9], d: 4.8, az: 120, el: 24 },
  { t: [0, 1.6, 0], d: 16, az: 90, el: 4 },
  { t: [-0.5, 1.7, 0], d: 5.6, az: -115, el: 30 },
  { t: [0.4, 3.8, 3.3], d: 8.5, az: 40, el: 12 },
  { t: [-1, 0.4, -1.2], d: 12, az: -60, el: 3 },
  { t: [0.3, -0.6, -2.1], d: 6.5, az: -70, el: -4 },
  { t: [0.2, -1.35, -2.3], d: 3.9, az: -40, el: 12 },
  { t: [-6.1, -1.0, 0], d: 3.7, az: -140, el: 2 },
  { t: [0, 7, 0], d: 25, az: 215, el: 10 }
];

const LABELS = {
  top: 'Testa della vela', main: 'Randa a doppia pelle', jib: 'Fiocco', deck: 'Base della vela',
  crew: 'Equipaggio', hull: 'Scafo in carbonio', batt: 'Pacco batterie', wfoil: 'Foil alzato',
  water: 'Pelo dell\'acqua', arm: 'Braccio del foil', wing: 'Ala del foil', rudder: 'Timone a T'
};

// Colori delle squadre (vernice, grafiche, sigla velica, divise)
const LIVERY = {
  lr: { hull: '#c4c8cd', metal: 0.55, rough: 0.3, a1: '#b8121f', a2: '#17191c', code: 'ITA', deck: '#2b2e33', vest: '#b8121f', helm: '#f2f2f2', suit: '#1b1e22', sail: '#1f2226', sa: '#c4141f', st: '#f4f4f4' },
  nz: { hull: '#0f1114', metal: 0.25, rough: 0.28, a1: '#e9ecef', a2: '#c8102e', code: 'NZL', deck: '#1f2226', vest: '#16191d', helm: '#ffffff', suit: '#0f1114', sail: '#1a1d21', sa: '#c8102e', st: '#f4f4f4' },
  gb: { hull: '#15253f', metal: 0.35, rough: 0.3, a1: '#c8a24a', a2: '#f2f2f2', code: 'GBR', deck: '#23272d', vest: '#15253f', helm: '#c8a24a', suit: '#10182a', sail: '#1c2026', sa: '#c8a24a', st: '#f4f4f4' },
  al: { hull: '#c61f2a', metal: 0.3, rough: 0.3, a1: '#f4f4f4', a2: '#14171b', code: 'SUI', deck: '#2a2c30', vest: '#c61f2a', helm: '#ffffff', suit: '#14171b', sail: '#1e2125', sa: '#c61f2a', st: '#f4f4f4' },
  fr: { hull: '#eceff2', metal: 0.1, rough: 0.28, a1: '#3d7be0', a2: '#0d2a66', code: 'FRA', deck: '#2a2e35', vest: '#3d7be0', helm: '#ffffff', suit: '#0d2a66', sail: '#1d2127', sa: '#3d7be0', st: '#f4f4f4' },
  us: { hull: '#eef0f3', metal: 0.1, rough: 0.28, a1: '#1c2f5a', a2: '#c8102e', code: 'USA', deck: '#2a2e35', vest: '#1c2f5a', helm: '#ffffff', suit: '#1c2f5a', sail: '#1d2127', sa: '#8fa8c8', st: '#f4f4f4' }
};

/* ---------- utilità ---------- */
// Interpolazione cubica monotona (niente oscillazioni tra i punti di controllo)
function mono(P) {
  const n = P.length, X = P.map(p => p[0]), Y = P.map(p => p[1]), d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d.push((Y[i + 1] - Y[i]) / (X[i + 1] - X[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (!d[i]) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return x => {
    if (x <= X[0]) return Y[0];
    if (x >= X[n - 1]) return Y[n - 1];
    let i = 0; while (x > X[i + 1]) i++;
    const h = X[i + 1] - X[i], t = (x - X[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * Y[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * Y[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function geom(pos, idx, uv) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function flip(g) {
  const ix = g.index.array;
  for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
  g.index.needsUpdate = true; g.computeVertexNormals();
  return g;
}
// Solidi chiusi: triangoli con normale verso l'esterno (volume con segno positivo)
function orient(g) {
  const p = g.attributes.position, ix = g.index.array, a = V3(), b = V3(), c = V3();
  let v = 0;
  for (let i = 0; i < ix.length; i += 3) { a.fromBufferAttribute(p, ix[i]); b.fromBufferAttribute(p, ix[i + 1]); c.fromBufferAttribute(p, ix[i + 2]); v += a.dot(b.cross(c)); }
  return v < 0 ? flip(g) : g;
}
// Superfici aperte: normale media rivolta verso "dir"
function faceTo(g, dir) {
  const n = g.attributes.normal; let s = 0;
  for (let i = 0; i < n.count; i++) s += n.getX(i) * dir.x + n.getY(i) * dir.y + n.getZ(i) * dir.z;
  return s < 0 ? flip(g) : g;
}
function rod(a, b, r, rs = 8) {
  const d = b.clone().sub(a), len = d.length();
  const g = new THREE.CylinderGeometry(r, r, len, rs, 1);
  g.translate(0, len / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), d.normalize()));
  g.translate(a.x, a.y, a.z);
  return g;
}
function limb(a, b, r) {
  const d = b.clone().sub(a), len = d.length();
  const g = new THREE.CapsuleGeometry(r, Math.max(len - 2 * r, 0.01), 4, 10);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), d.normalize()));
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
}
const tube = (pts, r, closed = false, seg = 64, rs = 6) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed, 'centripetal'), seg, r, rs, closed);

/* ---------- scafo ---------- */
// u = 0 specchio di poppa, u = 1 prua. Tabelle: mezzo baglio in coperta, cavallino, chiglia, bustle, stellatura, bolzone
const HB = mono([[0, 1.36], [0.1, 1.52], [0.25, 1.64], [0.42, 1.69], [0.58, 1.645], [0.72, 1.47], [0.84, 1.12], [0.92, 0.66], [0.97, 0.33], [1, 0.03]]);
const SHEER = mono([[0, 0.03], [0.3, 0], [0.6, 0.04], [0.85, 0.15], [1, 0.3]]);
const KEEL = mono([[0, -0.6], [0.15, -0.8], [0.35, -0.94], [0.55, -0.98], [0.7, -0.94], [0.82, -0.8], [0.91, -0.56], [0.97, -0.24], [1, 0.12]]);
const BUST = mono([[0, 0], [0.1, 0.04], [0.3, 0.13], [0.5, 0.15], [0.65, 0.1], [0.76, 0], [1, 0]]);
const DEAD = mono([[0, 0.05], [0.5, 0.08], [0.8, 0.2], [1, 0.32]]);
const CROWN = mono([[0, 0.06], [0.7, 0.08], [1, 0.02]]);
const ux = u => -L / 2 + u * L, xu = x => (x + L / 2) / L;
const deckY = (u, w) => SHEER(u) + CROWN(u) * (1 - w * w);
const PITS = [[-1.62, -0.72], [-3.32, -2.42]], PW = [0.44, 0.8], PIT_D = 0.62;
const DW = [0, 0.08, 0.16, 0.24, 0.32, 0.38, 0.44, 0.53, 0.62, 0.71, 0.8, 0.86, 0.9];
const HM = 40;

function sectionPts(u) {
  const b = HB(u), ys = SHEER(u), yb = KEEL(u), D = ys - yb, bus = BUST(u), dr = Math.min(DEAD(u), 0.3 * D);
  return [[0.9 * b, deckY(u, 0.9)], [0.965 * b, ys - 0.012 * D], [b, ys - 0.12 * D], [0.995 * b, ys - 0.3 * D], [0.965 * b, ys - 0.55 * D],
    [0.88 * b, yb + dr + 0.1 * D], [0.7 * b, yb + dr * 0.72], [0.42 * b, yb + dr * 0.4], [Math.min(0.2, 0.3 * b), yb + dr * 0.12],
    [Math.min(0.09, 0.15 * b), yb - bus * 0.8], [0, yb - bus]];
}
const sectionRing = u => new THREE.CatmullRomCurve3(sectionPts(u).map(([z, y]) => V3(z, y, 0)), false, 'centripetal').getSpacedPoints(HM - 1);
function hullStations() {
  const S = new Set();
  for (let i = 0; i <= 150; i++) S.add(+(1 - Math.pow(1 - i / 150, 1.25)).toFixed(5));
  PITS.forEach(([a, b]) => { S.add(+xu(a).toFixed(5)); S.add(+xu(b).toFixed(5)); });
  return [...S].sort((a, b) => a - b);
}
function girth(ring) { let s = 0; for (let k = 1; k < ring.length; k++) s += ring[k].distanceTo(ring[k - 1]); return s; }

function hullGeometry(US, rings) {
  const pos = [], uv = [], idx = [];
  for (const s of [1, -1]) {
    const base = pos.length / 3;
    US.forEach((u, i) => rings[i].forEach((p, k) => {
      const g = k / (HM - 1);
      pos.push(ux(u), p.y, s * p.x);
      uv.push(s > 0 ? u : 1 - u, s > 0 ? 1 - 0.5 * g : 0.5 - 0.5 * g);
    }));
    for (let i = 0; i < US.length - 1; i++) for (let k = 0; k < HM - 1; k++) {
      const a = base + i * HM + k, b = a + HM, c = a + 1, d = b + 1;
      if (s > 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
    }
  }
  const g = geom(pos, idx, uv), n = g.attributes.normal, v = V3();
  for (let j = 0; j < n.count; j++) if (j % HM === HM - 1) { v.fromBufferAttribute(n, j); v.z = 0; v.normalize(); n.setXYZ(j, v.x, v.y, v.z); }
  return g;
}
function capGeometry(u, ring, uvAt, dir) {
  const b = HB(u), x = ux(u);
  const P = [...DW.map(w => [w * b, deckY(u, w)]), ...ring.slice(1).map(p => [p.x, p.y])];
  const out = [...P, ...P.slice(1, -1).reverse().map(([z, y]) => [-z, y])];
  const tris = THREE.ShapeUtils.triangulateShape(out.map(([z, y]) => new THREE.Vector2(z, y)), []);
  const pos = [], uv = [], idx = [];
  out.forEach(([z, y]) => { pos.push(x, y, z); uv.push(uvAt[0], uvAt[1]); });
  tris.forEach(t => idx.push(t[0], t[1], t[2]));
  return faceTo(geom(pos, idx, uv), dir);
}
const inPit = (x, w) => w > PW[0] && w < PW[1] && PITS.some(([a, b]) => x > a && x < b);
function deckGeometry(US) {
  const pos = [], uv = [], idx = [], n = DW.length;
  for (const s of [1, -1]) {
    const base = pos.length / 3;
    US.forEach(u => { const b = HB(u), x = ux(u); DW.forEach(w => { pos.push(x, deckY(u, w), s * w * b); uv.push(x / 1.6, s * w * b / 1.6); }); });
    for (let i = 0; i < US.length - 1; i++) {
      const xm = (ux(US[i]) + ux(US[i + 1])) / 2;
      for (let k = 0; k < n - 1; k++) {
        if (inPit(xm, (DW[k] + DW[k + 1]) / 2)) continue;
        const a = base + i * n + k, b = a + n, c = a + 1, d = b + 1;
        if (s > 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
      }
    }
  }
  const g = geom(pos, idx, uv), nr = g.attributes.normal, v = V3();
  for (let j = 0; j < nr.count; j++) if (j % n === 0) { v.fromBufferAttribute(nr, j); v.z = 0; v.normalize(); nr.setXYZ(j, v.x, v.y, v.z); }
  return g;
}
function pitGeometry(US) {
  const pos = [], idx = [], uv = [];
  const quad = (p0, p1, p2, p3) => { const o = pos.length / 3; pos.push(...p0, ...p1, ...p2, ...p3); uv.push(p0[0] * 3, p0[1] * 3, p1[0] * 3, p1[1] * 3, p2[0] * 3, p2[1] * 3, p3[0] * 3, p3[1] * 3); idx.push(o, o + 1, o + 2, o, o + 2, o + 3); };
  for (const s of [1, -1]) for (const [x0, x1] of PITS) {
    const us = US.filter(u => ux(u) >= x0 - 1e-4 && ux(u) <= x1 + 1e-4);
    const P = (u, w, dy = 0) => [ux(u), deckY(u, w) - dy, s * w * HB(u)];
    for (let i = 0; i < us.length - 1; i++) {
      for (const w of PW) quad(P(us[i], w), P(us[i + 1], w), P(us[i + 1], w, PIT_D), P(us[i], w, PIT_D));
      quad(P(us[i], PW[0], PIT_D), P(us[i + 1], PW[0], PIT_D), P(us[i + 1], PW[1], PIT_D), P(us[i], PW[1], PIT_D));
    }
    const ws = DW.filter(w => w >= PW[0] && w <= PW[1]);
    for (const u of [us[0], us[us.length - 1]]) for (let k = 0; k < ws.length - 1; k++) quad(P(u, ws[k]), P(u, ws[k + 1]), P(u, ws[k + 1], PIT_D), P(u, ws[k], PIT_D));
  }
  return geom(pos, idx, uv);
}
function coamingGeometry(s, x0, x1) {
  const pts = [], add = (x, w) => { const u = xu(x); pts.push(V3(x, deckY(u, w) + 0.016, s * w * HB(u))); };
  for (let i = 0; i <= 8; i++) add(lerp(x0, x1, i / 8), PW[0]);
  for (let i = 1; i < 4; i++) add(x1, lerp(PW[0], PW[1], i / 4));
  for (let i = 0; i <= 8; i++) add(lerp(x1, x0, i / 8), PW[1]);
  for (let i = 1; i < 4; i++) add(x0, lerp(PW[1], PW[0], i / 4));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, 'centripetal'), 120, 0.024, 6, true);
}

/* ---------- profili alari (foil, timone, bracci) ---------- */
function naca(n, t) {
  const up = [];
  for (let i = 0; i <= n; i++) { const x = (1 - Math.cos(Math.PI * i / n)) / 2; up.push([x, 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4)]); }
  const ring = up.slice();
  for (let i = n - 1; i > 0; i--) ring.push([up[i][0], -up[i][1]]);
  return ring;
}
// Solido alare: per ogni stazione p (punto sulla spina), c (verso il bordo d'attacco), t (verso lo spessore), corda, spessore, x0 (frazione di corda davanti a p)
function loft(st, n = 20, ringFn) {
  const pos = [], idx = [], uv = []; let M = 0, len = 0;
  st.forEach((s, i) => {
    if (i) len += s.p.distanceTo(st[i - 1].p);
    const ring = ringFn ? ringFn(s) : naca(n, s.thick); M = ring.length;
    ring.forEach(([x, y], k) => {
      const a = (s.x0 - x) * s.chord, b = y * s.chord;
      pos.push(s.p.x + s.c.x * a + s.t.x * b, s.p.y + s.c.y * a + s.t.y * b, s.p.z + s.c.z * a + s.t.z * b);
      uv.push(k / M * 2, len * 2);
    });
  });
  for (let i = 0; i < st.length - 1; i++) for (let k = 0; k < M; k++) { const a = i * M + k, b = i * M + (k + 1) % M; idx.push(a, b, a + M, b, b + M, a + M); }
  for (const [i, end] of [[0, false], [st.length - 1, true]]) {
    const o = pos.length / 3, c = V3();
    for (let k = 0; k < M; k++) c.add(V3(pos[(i * M + k) * 3], pos[(i * M + k) * 3 + 1], pos[(i * M + k) * 3 + 2]));
    c.divideScalar(M); pos.push(c.x, c.y, c.z); uv.push(0, 0);
    for (let k = 0; k < M; k++) end ? idx.push(o, i * M + k, i * M + (k + 1) % M) : idx.push(o, i * M + (k + 1) % M, i * M + k);
  }
  return orient(geom(pos, idx, uv));
}
// Ala con estremità arrotondate: q in [-1, 1] lungo l'apertura
function wingStations(span, root, tip, thick, y0, anh, sweep, x0 = 0.4, scale = 1, n = 28) {
  const st = [];
  for (let i = 0; i <= n; i++) {
    const q = -1 + 2 * i / n, a = Math.abs(q);
    let c = lerp(root, tip, a) * scale;
    if (a > 0.86) c *= Math.sqrt(Math.max(1 - ((a - 0.86) / 0.14) ** 2, 0.0004));
    const t = V3(0, 1, Math.sign(q) * Math.tan(anh) * Math.min(a / 0.1, 1)).normalize();
    st.push({ p: V3(-sweep * a * a, y0 - a * span / 2 * Math.tan(anh), q * span / 2), c: V3(1, 0, 0), t, chord: Math.max(c, 0.004), thick, x0 });
  }
  return st;
}

/* ---------- albero e vele ---------- */
const MX = 0.95, RAKE = rad(1.6), MROT = rad(20);
const MBASE = V3(MX, deckY(xu(MX), 0) - 0.02, 0);
const MAXIS = V3(-Math.sin(RAKE), Math.cos(RAKE), 0);
const MDIR = V3(-Math.cos(MROT), 0, -WIND * Math.sin(MROT));
const MLEE = MDIR.clone().cross(V3(0, 1, 0));
const mChord = h => lerp(0.46, 0.25, h / MAST_H), mThick = h => lerp(0.19, 0.1, h / MAST_H);
const mastAt = h => MBASE.clone().addScaledVector(MAXIS, h).addScaledVector(MDIR, 0.22 * (h / MAST_H) ** 2);
function dRing(s) {
  const pts = [], fr = 0.36, rr = 0.64, ht = s.thick / (2 * s.chord);
  for (let i = 0; i < 32; i++) {
    const a = i / 32 * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    if (ca >= 0) pts.push([0.36 - fr * ca, ht * sa]);
    else { const k = Math.pow(-ca, 2 / 3); pts.push([0.36 + rr * k, ht * Math.sign(sa) * Math.pow(Math.abs(sa), 2 / 3) * lerp(1, 0.72, k)]); }
  }
  return pts;
}

const MAIN_H0 = 0.32, MAIN_H1 = MAST_H - 0.3, MAIN_CMAX = 5.0;
const mainChord = t => lerp(4.9, 1.8, t) + 0.55 * Math.sin(Math.PI * t) * (1 - 0.35 * t);
const camberAt = (s, p = 0.42) => s < p ? (2 * p * s - s * s) / (p * p) : ((1 - 2 * p) + 2 * p * s - s * s) / ((1 - p) * (1 - p));
function mainPoint(s, t, skin, out, nOut) {
  const h = lerp(MAIN_H0, MAIN_H1, t), tw = rad(3 + 13 * Math.pow(t, 1.2));
  const cd = V3(-Math.cos(tw), 0, -WIND * Math.sin(tw)), nl = cd.clone().cross(V3(0, 1, 0)), C = mainChord(t);
  const hs = (0.45 * mThick(h) + 0.012) * Math.pow(1 - s, 1.6);
  out.copy(mastAt(h)).addScaledVector(MDIR, 0.62 * mChord(h)).addScaledVector(cd, s * C)
    .addScaledVector(nl, lerp(0.085, 0.062, t) * C * camberAt(s) + skin * hs);
  out.y -= 0.06 * Math.sin(Math.PI * t) * s;
  if (nOut) nOut.copy(nl);
  return out;
}
const STAY_H = 13.2;
const TACK = V3(5.3, deckY(xu(5.3), 0) + 0.07, 0);
const STAY_TOP = mastAt(STAY_H).addScaledVector(MDIR, -0.36 * mChord(STAY_H));
const JHEAD = TACK.clone().lerp(STAY_TOP, 0.955);
const JCLEW = V3(1.3, deckY(xu(1.3), 0.2) + 0.1, -WIND * 0.3);
const JIB_CMAX = 4.4;
const LUFF_J = JHEAD.clone().sub(TACK).normalize();
const jibChord = t => TACK.clone().lerp(JHEAD, t).distanceTo(JCLEW.clone().lerp(JHEAD, t)) * (1 + 0.1 * Math.sin(Math.PI * t) * (1 - 0.5 * t));
function jibPoint(s, t, out) {
  const luff = TACK.clone().lerp(JHEAD, t), cd = JCLEW.clone().lerp(JHEAD, t).sub(luff).normalize();
  cd.applyAxisAngle(LUFF_J, -WIND * rad(2 + 9 * t));
  const nl = cd.clone().cross(LUFF_J); if (nl.z * WIND > 0) nl.negate();
  const C = jibChord(t);
  return out.copy(luff).addScaledVector(cd, s * C).addScaledVector(nl, 0.1 * C * camberAt(s, 0.4));
}
function sailGrid(rows, cols, pointAt, uvAt) {
  const pos = [], uv = [], idx = [], p = V3();
  for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) {
    const s = Math.pow(c / cols, 1.2), t = r / rows;
    pointAt(s, t, p); pos.push(p.x, p.y, p.z); uv.push(...uvAt(s, t));
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * (cols + 1) + c; idx.push(i, i + 1, i + cols + 1, i + 1, i + cols + 2, i + cols + 1); }
  return geom(pos, idx, uv);
}

/* ---------- foil: misure ---------- */
const ARM = 3.25, PIV_X = 0.2, PIV_Y = -0.32, PIV_Z = 1.66, CANT = rad(10), RAISE = rad(40);
const RX = -6.0, RUD_BOT = -3.15;

/* ---------- texture ---------- */
function carbonTex() {
  const t = canvasTex(128, 128, (g, W) => {
    const n = 8, c = W / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const hor = ((i + j) % 4) < 2, x = i * c, y = j * c;
      const gr = hor ? g.createLinearGradient(x, y, x, y + c) : g.createLinearGradient(x, y, x + c, y);
      gr.addColorStop(0, '#0c0e11'); gr.addColorStop(0.5, hor ? '#3b4149' : '#252a30'); gr.addColorStop(1, '#0c0e11');
      g.fillStyle = gr; g.fillRect(x, y, c, c);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function noiseTex(seed, lo, hi) {
  const t = canvasTex(256, 256, (g, W, H) => {
    const R = rng(seed), img = g.createImageData(W, H);
    for (let i = 0; i < W * H; i++) { const v = lo + R() * (hi - lo); img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
    g.putImageData(img, 0, 0);
  }, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
// Livrea dello scafo: metà alta = lato +Z (prua a destra), metà bassa = lato −Z (prua a sinistra)
function hullTexture(lv, girthAt, metalPass = false, q = 1) {
  const mv = Math.round(lv.metal * 255), metal = `rgb(${mv},${mv},${mv})`, k = metalPass ? q / 2 : q;
  return canvasTex(2048 * k, 1024 * k, g => {
    g.scale(k, k);
    const W = 2048;
    const HH = 512;
    for (const half of [0, 1]) {
      const X = u => (half ? 1 - u : u) * W, Y = gf => half * HH + gf * HH;
      const top = Y(0);
      const grad = g.createLinearGradient(0, top, 0, top + HH);
      grad.addColorStop(0, lv.hull); grad.addColorStop(1, shade(lv.hull, -0.18));
      g.fillStyle = metalPass ? metal : grad; g.fillRect(0, top, W, HH);
      const poly = (pts, col) => { g.fillStyle = metalPass ? '#000' : col; g.beginPath(); pts.forEach(([u, gf], i) => i ? g.lineTo(X(u), Y(gf)) : g.moveTo(X(u), Y(gf))); g.closePath(); g.fill(); };
      // fascia principale: nasce sottile a prua e si allarga verso poppa lungo la coperta
      poly([[0.985, 0.03], [0.7, 0.05], [0.35, 0.06], [0, 0.05], [0, 0.26], [0.3, 0.22], [0.62, 0.14], [0.9, 0.07]], lv.a1);
      poly([[0.9, 0.085], [0.62, 0.165], [0.3, 0.245], [0, 0.285], [0, 0.305], [0.3, 0.265], [0.62, 0.185], [0.9, 0.1]], lv.a2);
      // linea d'ombra sul bordo arrotondato della coperta
      if (!metalPass) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, top, W, 5); }
      // sigla velica vicino alla prua, proporzioni corrette sulla fiancata
      const uT = 0.8, ky = (HH / girthAt(uT)) / (W / L);
      g.save(); g.translate(X(uT), Y(0.2)); g.scale(1, ky);
      g.fillStyle = metalPass ? '#000' : lum(lv.hull) > 0.5 ? lv.a2 : '#f4f4f4';
      g.font = '900 80px "Arial Narrow", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(lv.code, 0, 0); g.restore();
    }
    g.fillStyle = metalPass ? metal : lv.hull; g.fillRect(0, 0, 16, 16);
  }, !metalPass);
}
function shade(hex, k) { const c = new THREE.Color(hex); c.offsetHSL(0, 0, k); return '#' + c.getHexString(); }
function lum(hex) { const c = new THREE.Color(hex); return 0.3 * c.r + 0.59 * c.g + 0.11 * c.b; }
// Membrana delle vele (3Di): canvas in metri, inferitura a sinistra o a destra a seconda della faccia
function sailTexture(W0, H0, cmax, chord, luffLeft, lv, main, q = 1) {
  return canvasTex(W0 * q, H0 * q, g => {
    g.scale(q, q); const W = W0, H = H0;
    const P = (s, t) => { const sm = s * chord(t); return [(luffLeft ? sm : cmax - sm) / cmax * W, (1 - t) * H]; };
    g.fillStyle = lv.sail; g.fillRect(0, 0, W, H);
    const R = rng(main ? 11 : 23);
    for (let i = 0; i < 140; i++) { const [x, y] = P(R(), R()); g.fillStyle = `rgba(255,255,255,${(0.01 + R() * 0.02).toFixed(3)})`; g.beginPath(); g.ellipse(x, y, 20 + R() * 50, 40 + R() * 120, R() * 3, 0, 7); g.fill(); }
    g.lineCap = 'round';
    const fib = (a, b, c, al, w) => { g.strokeStyle = `rgba(205,214,224,${al.toFixed(3)})`; g.lineWidth = w; g.beginPath(); g.moveTo(...P(...a)); g.quadraticCurveTo(...P(...c), ...P(...b)); g.stroke(); };
    for (let i = 0; i < 280; i++) { const t = 0.02 + R() * 0.96; fib([1, 0], [0, t], [0.42 + R() * 0.2, t * 0.4], 0.025 + R() * 0.05, 1 + R() * 2.2); }
    for (let i = 0; i < 240; i++) { const t = R() * 0.92; fib([0.3 + R() * 0.4, 1], [0.8 + R() * 0.2, t], [0.72, (1 + t) / 2], 0.025 + R() * 0.045, 1 + R() * 2); }
    for (let i = 0; i < 130; i++) { const t = R() * 0.7; fib([0, 0], [1, t], [0.5, t * 0.3], 0.02 + R() * 0.04, 1 + R() * 1.6); }
    for (let i = 0; i < 900; i++) { const s = R(), t = R(), [x, y] = P(s, t), a = R() * 3.14; g.strokeStyle = `rgba(215,222,230,${(0.03 + R() * 0.05).toFixed(3)})`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); g.stroke(); }
    if (main) for (let k = 1; k < 8; k++) { const t = k / 8; g.strokeStyle = 'rgba(225,230,236,.13)'; g.lineWidth = 9; g.beginPath(); g.moveTo(...P(0.03, t)); g.lineTo(...P(0.97, t)); g.stroke(); }
    g.strokeStyle = 'rgba(220,226,232,.2)'; g.lineWidth = 10; g.beginPath();
    for (let i = 0; i <= 40; i++) { const [x, y] = P(0.995, i / 40); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    const poly = (pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach(([s, t], i) => i ? g.lineTo(...P(s, t)) : g.moveTo(...P(s, t))); g.closePath(); g.fill(); };
    if (main) {
      poly([[0, 0.08], [1, 0.19], [1, 0.27], [0, 0.155]], lv.sa);
      poly([[0, 0.165], [1, 0.28], [1, 0.29], [0, 0.175]], 'rgba(244,244,244,.9)');
      const [x, y] = P(0.46, 0.6);
      g.fillStyle = lv.st; g.font = `900 ${Math.round(H * 0.075)}px "Arial Narrow", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(lv.code, x, y);
    } else {
      poly([[0, 0], [1, 0], [1, 0.035], [0, 0.05]], lv.sa);
    }
  });
}
// Mappa di pendenze per le increspature del mare (seamless: frequenze intere sul toro)
function waterNormals(size = 256) {
  const R = rng(3), hx = new Float32Array(size * size), hy = new Float32Array(size * size), tw = 2 * Math.PI / size;
  const cx = new Float32Array(size), sx = new Float32Array(size), cy = new Float32Array(size), sy = new Float32Array(size);
  for (let w = 0; w < 60; w++) {
    const ang = -Math.PI / 2 + (R() - 0.5) * 2.4, mag = 2 + Math.floor(Math.pow(R(), 1.5) * 34);
    const kx = Math.round(Math.cos(ang) * mag), ky = Math.round(Math.sin(ang) * mag);
    if (!kx && !ky) continue;
    const a = Math.pow(Math.hypot(kx, ky), -1.3) * (0.6 + R() * 0.8), ph = R() * 6.283;
    for (let i = 0; i < size; i++) { cx[i] = Math.cos(kx * tw * i); sx[i] = Math.sin(kx * tw * i); cy[i] = Math.cos(ky * tw * i + ph); sy[i] = Math.sin(ky * tw * i + ph); }
    const gx = a * kx, gy = a * ky;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const c = cx[x] * cy[y] - sx[x] * sy[y], j = y * size + x; hx[j] += gx * c; hy[j] += gy * c; }
  }
  let m = 0; for (let j = 0; j < hx.length; j++) m = Math.max(m, Math.abs(hx[j]), Math.abs(hy[j]));
  const data = new Uint8Array(size * size * 4);
  for (let j = 0; j < hx.length; j++) { data[j * 4] = (hx[j] / m * 0.5 + 0.5) * 255; data[j * 4 + 1] = (hy[j] / m * 0.5 + 0.5) * 255; data[j * 4 + 2] = 255; data[j * 4 + 3] = 255; }
  const t = new THREE.DataTexture(data, size, size);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.needsUpdate = true;
  return t;
}

/* ---------- shader ---------- */
const NOISE = `
float h1(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y); }
float fbm(vec2 p){ float a=.5,s=0.; for(int i=0;i<5;i++){ s+=a*vn(p); p=p*2.03+vec2(3.1,1.7); a*=.5; } return s; }`;

const waterVS = `
#include <common>
#include <shadowmap_pars_vertex>
uniform float uTime; uniform vec2 uFlow; uniform mat4 uReflMat; uniform vec4 uWaves[5];
varying vec3 vW; varying vec3 vN; varying vec4 vR; varying float vCrest;
void main(){
  vec4 w0 = modelMatrix * vec4(position, 1.0);
  vec2 p = w0.xz + uFlow * uTime;
  float r = length(w0.xz);
  vec3 d3 = vec3(0.0); vec3 n = vec3(0.0, 1.0, 0.0); float cr = 0.0;
  for (int i = 0; i < 5; i++) {
    vec4 wv = uWaves[i];
    float k = 6.2831853 / wv.z, c = sqrt(9.81 / k);
    float fade = 1.0 - smoothstep(wv.z * 3.0, wv.z * 9.0, r);
    float a = wv.w * fade, f = k * (dot(wv.xy, p) - c * uTime);
    float qa = 0.75 * fade / (k * 5.0), cf = cos(f), sf = sin(f);
    d3.x += qa * wv.x * cf; d3.z += qa * wv.y * cf; d3.y += a * sf;
    n.x -= wv.x * k * a * cf; n.z -= wv.y * k * a * cf; n.y -= k * qa * sf;
    cr += a * sf;
  }
  vec4 worldPosition = vec4(w0.xyz + d3, 1.0);
  vW = worldPosition.xyz; vN = normalize(n); vCrest = cr;
  vR = uReflMat * vec4(w0.x, 0.0, w0.z, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
  vec3 transformedNormal = normalize(mat3(viewMatrix) * vN);
  #include <shadowmap_vertex>
}`;

const waterFS = `
#include <common>
#include <packing>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
uniform float uTime; uniform vec2 uFlow; uniform vec3 uSun; uniform vec3 uSunCol;
uniform samplerCube uEnv; uniform sampler2D uRefl; uniform float uUseRefl; uniform sampler2D uNrm;
uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uUwH; uniform vec4 uFoamP; uniform vec2 uFoamK;
varying vec3 vW; varying vec3 vN; varying vec4 vR; varying float vCrest;
${NOISE}
float wake(vec2 o, float len, float w0, vec2 pe){
  float b = o.x - vW.x;
  if (b < -0.3) return 0.0;
  float bb = max(b, 0.0), w = w0 + bb * 0.055, dz = abs(vW.z - o.y);
  if (dz > w * 4.0 + bb * 0.4 + 0.5) return 0.0;
  float core = exp(-dz * dz / (w * w)) * exp(-bb / len);
  float kel = exp(-pow(dz - bb * 0.34 - w0, 2.0) / (0.015 + bb * 0.01)) * exp(-bb / (len * 0.6)) * 0.6;
  float n = fbm(vec2(pe.x * 1.1, pe.y * 3.5));
  float m = fbm(vec2(pe.x * 3.0, pe.y * 7.0));
  return (core * smoothstep(0.2, 0.75, n + 0.3 * core) + kel * smoothstep(0.5, 0.8, m)) * smoothstep(-0.3, 0.25, b);
}
void main(){
  vec3 toC = cameraPosition - vW; float dist = length(toC); vec3 V = toC / dist;
  vec2 pe = vW.xz + uFlow * uTime;
  vec2 s1 = texture2D(uNrm, pe / 13.0 + vec2(0.0, -uTime * 0.03)).rg * 2.0 - 1.0;
  vec2 s2 = texture2D(uNrm, pe / 4.1 + vec2(uTime * 0.02, -uTime * 0.055)).rg * 2.0 - 1.0;
  vec2 s3 = texture2D(uNrm, pe / 1.3 + vec2(-uTime * 0.05, -uTime * 0.09)).rg * 2.0 - 1.0;
  float nearK = 1.0 - smoothstep(5.0, 45.0, dist), midK = 1.0 - smoothstep(25.0, 500.0, dist);
  vec2 sl = s1 * 0.16 + s2 * 0.13 * midK + s3 * 0.09 * nearK;
  vec3 N = normalize(vec3(vN.x - sl.x, vN.y, vN.z - sl.y));
  float sh = getShadowMask();
  if (cameraPosition.y < 0.0) {
    vec3 Nd = normalize(vec3(-vN.x + sl.x * 2.5, -vN.y, -vN.z + sl.y * 2.5));
    vec3 I = -V;
    vec3 T = refract(I, -Nd, 1.33);
    float win = dot(T, T) > 0.0 ? smoothstep(0.0, 0.25, T.y) : 0.0;
    vec3 sky = textureCube(uEnv, normalize(vec3(T.x, abs(T.y) + 0.05, T.z))).rgb;
    vec3 tir = mix(uUwH * 1.5, vec3(0.06, 0.34, 0.4), clamp(0.45 + 1.4 * (sl.x + sl.y), 0.0, 1.0));
    vec3 col = mix(tir, sky * 0.9 + vec3(0.02, 0.08, 0.09), win);
    col += vec3(1.0, 0.96, 0.88) * pow(max(dot(T, uSun), 0.0), 90.0) * win * 3.0;
    col = mix(col, uUwH, 1.0 - exp(-pow(dist * 0.05, 2.0)));
    gl_FragColor = vec4(col, 0.97);
  } else {
    float NdV = max(dot(N, V), 0.0);
    float F = 0.02 + 0.98 * pow(1.0 - NdV, 5.0);
    vec3 R = reflect(-V, N); R.y = abs(R.y);
    vec3 env = textureCube(uEnv, R).rgb;
    vec2 ruv = vR.xy / vR.w + N.xz * 0.12 * (1.0 - smoothstep(30.0, 300.0, dist));
    vec3 pl = texture2D(uRefl, clamp(ruv, 0.002, 0.998)).rgb;
    vec3 refl = mix(env, pl, uUseRefl * 0.9);
    float sunUp = max(uSun.y, 0.0);
    vec3 body = mix(uShallow, uDeep, smoothstep(0.0, 0.7, V.y)) * (0.4 + 0.6 * sh) * (0.55 + 0.9 * sunUp);
    float sss = pow(max(dot(V, -normalize(vec3(uSun.x, 0.0, uSun.z))), 0.0), 2.0) * clamp(vCrest * 3.0 + 0.35, 0.0, 1.0);
    body += uShallow * sss * 0.45 * sh;
    vec3 col = mix(body, refl, F);
    vec3 Hh = normalize(uSun + V);
    float nh = max(dot(N, Hh), 0.0);
    col += uSunCol * (pow(nh, 1400.0) * 70.0 + pow(nh, 180.0) * 1.2) * sh * (0.35 + F);
    float fo = clamp(wake(uFoamP.xy, 24.0, 0.13, pe) * uFoamK.x + wake(uFoamP.zw, 13.0, 0.08, pe) * uFoamK.y, 0.0, 1.0);
    vec3 foamC = vec3(0.9, 0.95, 0.98) * (0.45 + 0.55 * sh) * (0.65 + 0.6 * sunUp);
    col = mix(col, foamC, fo * 0.92);
    vec3 hz = textureCube(uEnv, normalize(vec3(-V.x, 0.015, -V.z))).rgb;
    col = mix(col, hz, smoothstep(300.0, 5200.0, dist) * 0.92);
    float a = max(max(mix(0.6, 1.0, F), fo), smoothstep(40.0, 220.0, dist));
    gl_FragColor = vec4(col, a);
  }
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const cloudVS = 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const cloudFS = `
uniform vec3 uSun; uniform float uTime; uniform float uBright; varying vec3 vD;
${NOISE}
void main(){
  vec3 d = normalize(vD);
  if (d.y < 0.0) discard;
  vec2 uv = d.xz / (d.y + 0.07) * 1.4 + vec2(uTime * 0.004, 0.0);
  float n = fbm(uv * 0.8 + vec2(7.0, 3.0));
  float dens = smoothstep(0.54, 0.8, n) * smoothstep(0.0, 0.06, d.y) * (1.0 - 0.75 * smoothstep(0.18, 0.6, d.y));
  if (dens < 0.003) discard;
  float n2 = fbm(uv * 0.8 + vec2(7.0, 3.0) + uSun.xz * 0.06);
  float lit = clamp(0.55 + (n - n2) * 5.0, 0.0, 1.0);
  float silver = pow(max(dot(d, uSun), 0.0), 6.0);
  vec3 col = mix(vec3(0.5, 0.56, 0.64), vec3(1.0, 0.98, 0.94), lit) + silver * 0.6;
  gl_FragColor = vec4(col * uBright, dens * 0.92);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// Golfo di Napoli sullo sfondo: Vesuvio e Somma, penisola sorrentina, Capri, Posillipo e la città
const landVS = 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const landFS = `
uniform samplerCube uEnv; uniform vec3 uSun; varying vec3 vP;
float hh(float x){ return fract(sin(x * 127.1) * 43758.5453); }
float n1(float x){ float i = floor(x), f = fract(x); f = f * f * (3. - 2. * f); return mix(hh(i), hh(i + 1.), f); }
float f1(float x){ return n1(x) * .5 + n1(x * 2.3) * .25 + n1(x * 5.1) * .125 + n1(x * 11.7) * .0625; }
float ad(float a, float b){ float d = a - b; return atan(sin(d), cos(d)); }
void main(){
  float az = atan(vP.z, vP.x), y = vP.y;
  float dv = ad(az, radians(205.)), ds = ad(az, radians(199.));
  float ves = 208. * pow(max(0., 1. - abs(dv) / .27), 1.9) - 6. * exp(-dv * dv / .00006);
  float som = 172. * pow(max(0., 1. - abs(ds) / .24), 2.3);
  float mas = max(ves, som) + (f1(az * 45.) - .5) * 5.;
  float dp = ad(az, radians(243.));
  float sor = (48. + 26. * f1(az * 16.)) * smoothstep(.37, .2, abs(dp)) * (1. - .45 * smoothstep(-.1, .37, dp));
  float dc = ad(az, radians(273.));
  float cap = 44. * exp(-pow((dc + .02) / .028, 2.)) + 31. * exp(-pow((dc - .032) / .034, 2.));
  float dn = ad(az, radians(135.));
  float city = (11. + 9. * f1(az * 70.)) * smoothstep(.95, .7, abs(dn)) + 30. * exp(-pow(ad(az, radians(95.)) / .12, 2.));
  float H = max(max(mas, sor), max(cap, city));
  if (y > H) discard;
  vec3 hz = textureCube(uEnv, normalize(vec3(cos(az), .02, sin(az)))).rgb;
  vec3 base = vec3(.2, .23, .22); float haze = .42;
  if (H == city) { base = vec3(.48, .45, .4); haze = .22; float b = step(.5, n1(az * 1400.)) * step(.35, fract(y * .5 + n1(az * 380.))); base = mix(base, vec3(.72, .68, .6), b * .6 * step(y, 16.)); }
  else if (H == sor) haze = .62;
  else if (H == cap) haze = .72;
  float side = sign(ad(az, radians(205.))) * sign(ad(atan(uSun.z, uSun.x), radians(205.)));
  base *= H == mas ? .85 + .25 * side : 1.;
  base *= .8 + .4 * f1(az * 90. + y * .05);
  vec3 col = mix(base * (.6 + .6 * max(uSun.y, 0.)), hz, clamp(haze + (1. - y / H) * .12, 0., .95));
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const sprayVS = `
attribute float aLife; attribute float aSize; uniform float uScale; varying float vA;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
  gl_PointSize = min(aSize * uScale / -mv.z, 36.0); vA = smoothstep(0.0, 0.15, aLife) * smoothstep(1.0, 0.45, aLife); }`;
const sprayFS = `
uniform vec3 uCol; varying float vA;
void main(){ vec2 d = gl_PointCoord - .5; float r = dot(d, d) * 4.; if (r > 1.) discard; float a = (1. - r) * (1. - r) * vA * .38;
  gl_FragColor = vec4(uCol, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const CSS = `
.b3-canvas{display:block;width:100%;height:100%;cursor:grab}
.b3-canvas:active{cursor:grabbing}
.b3-ui{position:absolute;inset:0;pointer-events:none}
.b3-vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 75% at 50% 48%,rgba(0,0,0,0) 60%,rgba(0,8,14,.3) 100%)}
.b3-label{position:absolute;left:0;top:0;display:flex;align-items:center;gap:8px;transition:opacity .3s;will-change:transform}
.b3-label i{width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#43D1C6;box-shadow:0 0 0 4px rgba(67,209,198,.28),0 0 18px #43D1C6;animation:b3p 1.6s ease-in-out infinite}
.b3-label span{font:700 13px/1 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#E6F0F5;background:rgba(6,19,29,.78);border:1px solid rgba(67,209,198,.5);padding:5px 8px;border-radius:6px;white-space:nowrap}
@keyframes b3p{50%{box-shadow:0 0 0 9px rgba(67,209,198,0),0 0 22px #43D1C6}}
.b3-hint{position:absolute;left:50%;top:76px;transform:translateX(-50%);font:600 13px/1.2 'Source Sans 3',sans-serif;color:#E6F0F5;background:rgba(6,19,29,.72);border:1px solid rgba(120,190,220,.3);padding:7px 12px;border-radius:99px;transition:opacity .5s;white-space:nowrap}
.b3-ui.used .b3-hint{opacity:0}
.b3-ctrl{position:absolute;left:16px;top:76px;display:flex;gap:6px;pointer-events:auto}
.b3-ctrl button{min-width:40px;height:36px;padding:0 10px;border-radius:99px;background:rgba(6,19,29,.78);border:1px solid rgba(120,190,220,.35);color:#E6F0F5;font:700 14px 'Barlow Condensed',sans-serif;letter-spacing:.06em}
.b3-ctrl button:hover{border-color:#43D1C6}
@media(max-width:899px){.b3-hint{top:118px}}
`;

/* ---------- montaggio ---------- */
export function mount(stage, opts = {}) {
  const forced = new URLSearchParams(location.search).get('b3q');
  const coarse = matchMedia('(pointer: coarse)').matches;
  let tier = ['high', 'mid', 'low'].includes(forced) ? forced : (coarse || Math.min(screen.width, screen.height) < 600 ? 'mid' : 'high');
  const dprFor = t => Math.min(window.devicePixelRatio || 1, t === 'high' ? 2 : t === 'mid' ? 1.5 : 1);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dprFor(tier));
  const qp = new URLSearchParams(location.search);
  renderer.toneMapping = qp.get('b3tm') === 'aces' ? THREE.ACESFilmicToneMapping : qp.get('b3tm') === 'agx' ? THREE.AgXToneMapping : THREE.NeutralToneMapping;
  renderer.toneMappingExposure = +(qp.get('b3exp') || 0.62);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  if (!document.getElementById('b3-css')) { const st = document.createElement('style'); st.id = 'b3-css'; st.textContent = CSS; document.head.appendChild(st); }
  const cv = renderer.domElement;
  cv.className = 'b3-canvas';
  stage.innerHTML = '';
  stage.appendChild(cv);
  const ui = document.createElement('div');
  ui.className = 'b3-ui';
  ui.innerHTML = `<div class="b3-vig"></div><div class="b3-label" hidden><i></i><span></span></div>
    <div class="b3-hint">↔ Trascina per ruotare la barca</div>
    <div class="b3-ctrl"><button type="button" data-b3="l" aria-label="Ruota a sinistra">⟲</button><button type="button" data-b3="spin" aria-label="Giro completo">360°</button><button type="button" data-b3="r" aria-label="Ruota a destra">⟳</button></div>`;
  stage.appendChild(ui);
  const label = ui.querySelector('.b3-label');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 9000);

  /* ----- cielo, nuvole, costa: primo pomeriggio sul golfo ----- */
  const sunDir = new THREE.Vector3().setFromSphericalCoords(1, rad(60), rad(-20));
  const sky = new Sky(); sky.scale.setScalar(7000);
  const su = sky.material.uniforms;
  su.turbidity.value = 2.4; su.rayleigh.value = 1.5; su.mieCoefficient.value = 0.003; su.mieDirectionalG.value = 0.82;
  su.sunPosition.value.copy(sunDir);
  scene.add(sky);
  const cloudMat = new THREE.ShaderMaterial({ vertexShader: cloudVS, fragmentShader: cloudFS, transparent: true, depthWrite: false, side: THREE.BackSide,
    uniforms: { uSun: { value: sunDir }, uTime: { value: 0 }, uBright: { value: 0.9 } } });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(3200, 48, 24), cloudMat);
  clouds.renderOrder = -1; scene.add(clouds);

  // ambiente per i riflessi: stesso cielo, nuvole e un emisfero di mare sotto l'orizzonte
  const envScene = new THREE.Scene();
  const sky2 = new Sky(); sky2.scale.setScalar(7000);
  Object.keys(su).forEach(k => { if (sky2.material.uniforms[k]) sky2.material.uniforms[k].value = su[k].value; });
  envScene.add(sky2, new THREE.Mesh(clouds.geometry, cloudMat));
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16, 0, Math.PI * 2, Math.PI / 2 + 0.01, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x0b3346, side: THREE.BackSide })));
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
  new THREE.CubeCamera(1, 9000, cubeRT).update(renderer, envScene);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;
  scene.environmentIntensity = 0.9;

  const land = new THREE.Mesh(new THREE.CylinderGeometry(2600, 2600, 320, 256, 1, true).translate(0, 155, 0), new THREE.ShaderMaterial({
    vertexShader: landVS, fragmentShader: landFS, side: THREE.BackSide, uniforms: { uEnv: { value: cubeRT.texture }, uSun: { value: sunDir } } }));
  scene.add(land);

  const sunLight = new THREE.DirectionalLight(0xfff0dc, 3.1);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  Object.assign(sunLight.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 160 });
  sunLight.shadow.bias = -0.0002; sunLight.shadow.normalBias = 0.025;
  sunLight.position.copy(sunDir).multiplyScalar(70).add(V3(0, 6, 0));
  sunLight.target.position.set(0, 6, 0);
  scene.add(sunLight, sunLight.target);
  scene.add(new THREE.HemisphereLight(0xcfe3f2, 0x0d3a4a, 0.25));

  /* ----- mare ----- */
  const UW_H = new THREE.Color().setRGB(0.012, 0.1, 0.14, THREE.LinearSRGBColorSpace);
  const wPos = [0, 0, 0], wIdx = [], SEG = 220, RINGS = 135;
  for (let r = 1; r <= RINGS; r++) { const R = 3.2 * (Math.exp(0.0555 * r) - 1); for (let s = 0; s < SEG; s++) { const a = s / SEG * Math.PI * 2; wPos.push(Math.cos(a) * R, 0, Math.sin(a) * R); } }
  for (let s = 0; s < SEG; s++) wIdx.push(0, 1 + (s + 1) % SEG, 1 + s);
  for (let r = 1; r < RINGS; r++) for (let s = 0; s < SEG; s++) { const a = 1 + (r - 1) * SEG + s, b = 1 + (r - 1) * SEG + (s + 1) % SEG; wIdx.push(a, b, a + SEG, b, b + SEG, a + SEG); }
  const wGeo = new THREE.BufferGeometry();
  wGeo.setAttribute('position', new THREE.Float32BufferAttribute(wPos, 3));
  wGeo.setAttribute('normal', new THREE.Float32BufferAttribute(wPos.map((_, i) => i % 3 === 1 ? 1 : 0), 3));
  wGeo.setIndex(wIdx);
  const waves = [[0.2, -0.98, 15, 0.13], [-0.55, -0.83, 9.5, 0.075], [0.7, -0.71, 6.2, 0.05], [-0.2, -0.98, 3.9, 0.028], [0.45, -0.89, 2.6, 0.016]]
    .map(([x, z, l, a]) => { const d = new THREE.Vector2(x, z).normalize(); return new THREE.Vector4(d.x, d.y, l, a); });
  const reflRT = new THREE.WebGLRenderTarget(512, 512, { type: THREE.HalfFloatType });
  const WU = THREE.UniformsUtils.merge([THREE.UniformsLib.lights, {
    uTime: { value: 0 }, uFlow: { value: new THREE.Vector2(FLOW, 0) }, uReflMat: { value: new THREE.Matrix4() }, uWaves: { value: waves },
    uSun: { value: sunDir.clone() }, uSunCol: { value: new THREE.Color(1, 0.93, 0.82) }, uEnv: { value: null }, uRefl: { value: null }, uUseRefl: { value: 0 },
    uNrm: { value: null }, uDeep: { value: new THREE.Color(0x05304c) }, uShallow: { value: new THREE.Color(0x12708c) },
    uFoamP: { value: new THREE.Vector4() }, uFoamK: { value: new THREE.Vector2(1, 1) }, uUwH: { value: new THREE.Color() }
  }]);
  const water = new THREE.Mesh(wGeo, new THREE.ShaderMaterial({ uniforms: WU, vertexShader: waterVS, fragmentShader: waterFS, lights: true, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  WU.uUwH.value = UW_H; WU.uEnv.value = cubeRT.texture; WU.uRefl.value = reflRT.texture; WU.uNrm.value = waterNormals(); WU.uWaves.value = waves;
  water.receiveShadow = true; water.renderOrder = 2; water.frustumCulled = false;
  scene.add(water);
  const abyss = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshBasicMaterial({ color: 0x031a28 }));
  abyss.rotation.x = -Math.PI / 2; abyss.position.y = -30; scene.add(abyss);
  const deep = new THREE.Mesh(new THREE.SphereGeometry(420, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uH: { value: UW_H }, uTime: { value: 0 }, uSun: { value: sunDir } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uH; uniform float uTime; uniform vec3 uSun; varying vec3 vP;
${NOISE}
void main(){ float y = vP.y;
  vec3 c = y > 0.0 ? mix(uH, vec3(0.05, 0.36, 0.44), smoothstep(0.0, 0.9, y)) : mix(uH, vec3(0.001, 0.012, 0.02), smoothstep(0.0, -0.8, y));
  float az = atan(vP.z, vP.x);
  float shafts = smoothstep(0.35, 0.95, fbm(vec2(az * 9.0 + uTime * 0.04, 1.3))) * smoothstep(-0.35, 0.25, y) * (1.0 - smoothstep(0.55, 0.95, y));
  c += vec3(0.06, 0.2, 0.22) * shafts * (0.6 + 0.4 * max(uSun.y, 0.0));
  c += vec3(0.25, 0.4, 0.4) * pow(max(dot(vP, normalize(vec3(uSun.x * 0.6, 1.0, uSun.z * 0.6))), 0.0), 24.0);
  gl_FragColor = vec4(c, 1.);
  #include <colorspace_fragment>
}` }));
  deep.visible = false; deep.renderOrder = -1; scene.add(deep);

  /* ----- materiali ----- */
  const carbon = carbonTex(); carbon.repeat.set(3, 3);
  const grit = noiseTex(5, 90, 170); grit.repeat.set(6, 6);
  const US = hullStations(), rings = US.map(sectionRing);
  const girthAt = u => girth(sectionRing(u));
  const mk = {
    paint: () => new THREE.MeshPhysicalMaterial({ roughness: 0.3, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.05 }),
    deck: () => new THREE.MeshStandardMaterial({ roughness: 0.92, bumpMap: grit, bumpScale: 1.2, roughnessMap: grit }),
    pit: () => new THREE.MeshStandardMaterial({ color: 0x3a4048, map: carbon, roughness: 0.5, metalness: 0.2, side: THREE.DoubleSide }),
    trim: () => new THREE.MeshStandardMaterial({ color: 0x101215, roughness: 0.45 }),
    carbon: () => new THREE.MeshPhysicalMaterial({ color: 0xc8ccd2, map: carbon, roughness: 0.36, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06 }),
    foil: () => new THREE.MeshPhysicalMaterial({ color: 0x14171b, roughness: 0.22, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 }),
    flap: () => new THREE.MeshPhysicalMaterial({ color: 0x2c333b, roughness: 0.28, metalness: 0.25, clearcoat: 0.8 }),
    steel: () => new THREE.MeshStandardMaterial({ color: 0xc3c9d0, roughness: 0.22, metalness: 1 }),
    rig: () => new THREE.MeshStandardMaterial({ color: 0x0b0d0f, roughness: 0.4 }),
    sail: () => new THREE.MeshPhysicalMaterial({ roughness: 0.55, sheen: 0.35, sheenRoughness: 0.55, sheenColor: new THREE.Color(0x9aa3ad), side: THREE.DoubleSide }),
    jib: () => new THREE.MeshPhysicalMaterial({ roughness: 0.55, sheen: 0.35, sheenRoughness: 0.55, sheenColor: new THREE.Color(0x9aa3ad) }),
    batten: () => new THREE.MeshStandardMaterial({ color: 0x4a525c, roughness: 0.45 }),
    vest: () => new THREE.MeshPhysicalMaterial({ roughness: 0.72, sheen: 0.12, sheenColor: new THREE.Color(0xffffff) }),
    suit: () => new THREE.MeshStandardMaterial({ roughness: 0.8 }),
    helm: () => new THREE.MeshPhysicalMaterial({ roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }),
    visor: () => new THREE.MeshPhysicalMaterial({ color: 0x07090c, roughness: 0.04, metalness: 0.9 }),
    skin: () => new THREE.MeshStandardMaterial({ color: 0xb98465, roughness: 0.6 }),
    glove: () => new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.75 }),
    screen: () => new THREE.MeshStandardMaterial({ color: 0x050709, emissive: 0x2a6f8a, emissiveIntensity: 0.9, roughness: 0.2 }),
    batt: () => new THREE.MeshStandardMaterial({ color: 0x1d3a48, roughness: 0.4, metalness: 0.5, emissive: 0x0a2530 }),
    hv: () => new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.45, emissive: 0x3a1500 })
  };

  /* ----- la barca ----- */
  const boat = new THREE.Group(); scene.add(boat);
  const parts = {};
  const add = (id, geo, key, parent = boat) => {
    const m = new THREE.Mesh(geo, mk[key]()); m.userData.mk = key;
    m.castShadow = true; m.receiveShadow = true; parent.add(m);
    if (id) (parts[id] = parts[id] || []).push(m);
    return m;
  };

  // scafo, specchio di poppa, coperta, abitacoli
  const hullMesh = add('hull', hullGeometry(US, rings), 'paint');
  const transom = add('hull', capGeometry(US[0], rings[0], [0.003, 0.997], V3(-1, 0, 0)), 'paint');
  add('hull', capGeometry(US[US.length - 1], rings[rings.length - 1], [0.003, 0.997], V3(1, 0, 0)), 'paint');
  const deckMesh = add('deck', deckGeometry(US), 'deck');
  const pitMesh = add('deck', pitGeometry(US), 'pit');
  const glassy = [hullMesh, transom, deckMesh, pitMesh];
  for (const s of [1, -1]) for (const [x0, x1] of PITS) glassy.push(add('deck', coamingGeometry(s, x0, x1), 'trim'));
  // dorsale centrale che porta i rinvii dei comandi
  {
    const sh = new THREE.Shape(); const w = 0.17, h = 0.11, r = 0.05;
    sh.moveTo(-w, 0); sh.lineTo(-w, h - r); sh.quadraticCurveTo(-w, h, -w + r, h); sh.lineTo(w - r, h); sh.quadraticCurveTo(w, h, w, h - r); sh.lineTo(w, 0); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: 5.1, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.02, bevelSegments: 4, curveSegments: 6 });
    g.rotateY(-Math.PI / 2); g.translate(0.55, deckY(xu(-2), 0) - 0.03, 0);
    glassy.push(add('deck', g, 'trim'));
  }
  // prese di coperta e boccaporti
  for (const [x, z] of [[3.6, 0.32], [3.6, -0.32], [2.6, 0]]) {
    const g = new THREE.CylinderGeometry(0.17, 0.18, 0.03, 28); g.translate(x, deckY(xu(x), 0) + 0.01, z);
    glassy.push(add('deck', g, 'trim'));
  }
  // cupola della telecamera di bordo a prua e telecamera di poppa
  { const g = new THREE.SphereGeometry(0.11, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2); g.translate(4.4, deckY(xu(4.4), 0), 0); glassy.push(add('hull', g, 'visor')); }
  // binario del fiocco autovirante
  {
    const pts = []; for (let i = 0; i <= 12; i++) { const z = lerp(-0.8, 0.8, i / 12), x = 1.3 + 0.06 * (1 - (z / 0.8) ** 2); pts.push(V3(x, deckY(xu(x), Math.abs(z) / HB(xu(x))) + 0.02, z)); }
    add('jib', tube(pts, 0.022, false, 40, 6), 'steel');
    const car = new THREE.BoxGeometry(0.16, 0.06, 0.1); car.translate(JCLEW.x, deckY(xu(JCLEW.x), 0.18) + 0.05, JCLEW.z);
    add('jib', car, 'rig');
  }

  // pacco batterie e linee idrauliche (visibili solo in trasparenza)
  const battGroup = new THREE.Group(); boat.add(battGroup);
  { const g = new THREE.BoxGeometry(1.5, 0.3, 0.72); g.translate(-0.45, -0.52, 0); add('batt', g, 'batt', battGroup); }
  for (let i = 0; i < 6; i++) for (const z of [-0.18, 0.18]) { const g = new THREE.BoxGeometry(0.2, 0.05, 0.3); g.translate(-1.07 + i * 0.25, -0.35, z); add('batt', g, 'screen', battGroup); }
  for (const s of [1, -1]) add('batt', tube([V3(-0.4, -0.42, s * 0.36), V3(-0.1, -0.4, s * 0.8), V3(PIV_X, PIV_Y, s * (PIV_Z - 0.25))], 0.025, false, 24, 6), 'hv', battGroup);
  add('batt', tube([V3(-1.2, -0.42, 0), V3(-3.2, -0.3, 0), V3(-5.6, -0.1, 0)], 0.022, false, 24, 6), 'hv', battGroup);
  battGroup.visible = false;

  // albero alare a sezione D, con leggera flessione in testa
  {
    const st = [];
    for (let i = 0; i <= 44; i++) { const h = MAST_H * i / 44; st.push({ p: mastAt(h), c: MDIR.clone().negate(), t: MLEE, chord: mChord(h), thick: mThick(h), x0: 0.36 }); }
    const g = loft(st, 0, s => dRing(s));
    add('main', g, 'carbon');
    const base = new THREE.CylinderGeometry(0.2, 0.26, 0.12, 28); base.translate(MX, MBASE.y + 0.05, 0);
    add('main', base, 'rig');
    // testa d'albero: cappello, luce e antenna del vento
    const top = mastAt(MAST_H);
    const cap = new THREE.SphereGeometry(0.07, 14, 10); cap.translate(top.x, top.y, top.z); add('top', cap, 'rig');
    add('top', rod(top, top.clone().add(V3(0.95, 0.12, 0)), 0.008), 'rig');
    const vane = new THREE.BoxGeometry(0.16, 0.12, 0.004); vane.translate(top.x + 0.95, top.y + 0.16, 0); add('top', vane, 'rig');
    add('top', rod(top, top.clone().add(V3(0, 0.7, 0)), 0.006), 'rig');
    // telecamera sull'albero, rivolta verso poppa
    const camG = new THREE.BoxGeometry(0.14, 0.1, 0.1); const cp = mastAt(3.1).addScaledVector(MDIR, -0.26); camG.translate(cp.x, cp.y, cp.z); add('main', camG, 'rig');
  }
  // sartie, strallo, drizze
  const stayTopL = STAY_TOP.clone();
  add('jib', rod(V3(5.45, deckY(xu(5.45), 0) + 0.02, 0), stayTopL, 0.011), 'rig');
  for (const s of [1, -1]) {
    const hi = mastAt(12.7).addScaledVector(MLEE, -s * WIND * 0.07);
    const x = MX - 0.8, lo = V3(x, deckY(xu(x), 0.86) + 0.02, s * 0.86 * HB(xu(x)));
    add('main', rod(hi, lo, 0.008), 'rig');
    const cp = new THREE.CylinderGeometry(0.03, 0.04, 0.05, 12); cp.translate(lo.x, lo.y, lo.z); add('main', cp, 'steel');
  }

  // randa a doppia pelle: due teli che avvolgono l'albero e si chiudono sulla balumina
  const mainMeshes = {};
  {
    const rows = 48, cols = 26, p = V3();
    for (const skin of [-1, 1]) {
      const luffLeft = skin > 0; // la faccia sottovento si guarda da −Z: l'inferitura (verso prua) è a sinistra
      const g = sailGrid(rows, cols, (s, t, o) => mainPoint(s, t, skin, o), (s, t) => { const u = s * mainChord(t) / MAIN_CMAX; return [luffLeft ? u : 1 - u, t]; });
      faceTo(g, V3(0, 0, -skin * WIND));
      mainMeshes[skin] = add('main', g, 'sail');
      mainMeshes[skin].userData.luffLeft = luffLeft;
    }
    // chiusure di base e di testa tra i due teli
    for (const t of [0, 1]) {
      const pos = [], idx = [];
      for (let c = 0; c <= cols; c++) { const s = Math.pow(c / cols, 1.2); mainPoint(s, t, -1, p); pos.push(p.x, p.y, p.z); mainPoint(s, t, 1, p); pos.push(p.x, p.y, p.z); }
      for (let c = 0; c < cols; c++) { const a = c * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      const m = add(t ? 'top' : 'deck', geom(pos, idx), 'rig'); m.material.side = THREE.DoubleSide;
    }
    // stecche visibili sotto la membrana
    const nl = V3();
    for (let k = 1; k < 8; k++) for (const skin of [-1, 1]) {
      const t = k / 8, pts = [];
      for (let i = 0; i <= 14; i++) { const s = 0.03 + 0.94 * i / 14; mainPoint(s, t, skin, p, nl); pts.push(p.clone().addScaledVector(nl, skin * 0.007)); }
      add('main', tube(pts, 0.011, false, 40, 5), 'batten');
    }
    // tavoletta di penna in carbonio
    const hp = [];
    for (let i = 0; i <= 10; i++) { mainPoint(0.02 + 0.93 * i / 10, 1, 0, p); hp.push(p.clone().add(V3(0, 0.04, 0))); }
    add('top', tube(hp, 0.045, false, 30, 8), 'carbon');
  }
  // fiocco: due facce (una per lato) perché grafiche e scritte si leggano bene da entrambe le parti
  const jibMeshes = {};
  for (const face of [-1, 1]) {
    const luffLeft = face < 0;
    const g = sailGrid(36, 18, jibPoint, (s, t) => { const u = s * jibChord(t) / JIB_CMAX; return [luffLeft ? u : 1 - u, t]; });
    faceTo(g, V3(0, 0, face * WIND));
    jibMeshes[face] = add('jib', g, 'jib');
    jibMeshes[face].userData.luffLeft = luffLeft;
  }
  { const pts = []; const p = V3(); for (let i = 0; i <= 20; i++) { jibPoint(0, i / 20, p); pts.push(p.clone()); } add('jib', tube(pts, 0.02, false, 30, 6), 'rig'); }

  // equipaggio: due timonieri a poppa, due trimmer davanti
  const crewMats = [];
  function sailor(x, z, s, helm) {
    const g = new THREE.Group(); boat.add(g);
    const u = xu(x), floor = deckY(u, 0.62) - PIT_D;
    g.position.set(x, floor + 0.12, z); g.rotation.y = -s * 0.12;
    const P = (a, b, c) => V3(a, b, c * s);
    add('crew', limb(P(-0.08, 0.05, -0.1), P(0.15, 0.36, -0.1), 0.085), 'suit', g);
    add('crew', limb(P(-0.08, 0.05, 0.1), P(0.15, 0.36, 0.1), 0.085), 'suit', g);
    add('crew', limb(P(0.02, 0.34, 0), P(0.1, 0.72, 0), 0.155), 'vest', g).scale.set(1, 1, 1.12);
    add('crew', limb(P(0.1, 0.8, 0), P(0.12, 0.88, 0), 0.05), 'skin', g);
    const head = new THREE.SphereGeometry(0.1, 20, 14); head.scale(1.05, 1.12, 0.95); head.translate(0.14, 0.95, 0); add('crew', head, 'skin', g);
    const hel = new THREE.SphereGeometry(0.122, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5); hel.scale(1.08, 1, 1); hel.translate(0.125, 0.985, 0); add('crew', hel, 'helm', g);
    const rim = new THREE.TorusGeometry(0.122, 0.012, 6, 30); rim.rotateX(Math.PI / 2); rim.scale(1.08, 1, 1); rim.translate(0.125, 0.985, 0); add('crew', rim, 'helm', g);
    const vis = new THREE.SphereGeometry(0.106, 20, 8, -0.95, 1.9, 1.3, 0.3); vis.rotateY(Math.PI); vis.scale(1.05, 1.12, 0.95); vis.translate(0.14, 0.95, 0); add('crew', vis, 'visor', g);
    const hands = helm ? [P(0.5, 0.66, -0.16), P(0.5, 0.66, 0.16)] : [P(0.42, 0.5, -0.13), P(0.42, 0.5, 0.13)];
    for (const [k, hnd] of hands.entries()) {
      const sh = P(0.1, 0.74, k ? 0.2 : -0.2), el = sh.clone().lerp(hnd, 0.5).add(V3(-0.02, -0.12, 0));
      add('crew', limb(sh, el, 0.052), 'vest', g);
      add('crew', limb(el, hnd, 0.045), 'suit', g);
      const gl = new THREE.SphereGeometry(0.045, 10, 8); gl.translate(hnd.x, hnd.y, hnd.z); add('crew', gl, 'glove', g);
    }
    if (helm) {
      const wh = new THREE.TorusGeometry(0.2, 0.016, 8, 36); wh.rotateY(Math.PI / 2); wh.translate(0.52, 0.64, 0); add('crew', wh, 'rig', g);
      for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3, e = V3(0.52, 0.64 + Math.sin(a) * 0.19, Math.cos(a) * 0.19); add('crew', rod(V3(0.52, 0.64, 0), e, 0.008), 'rig', g); }
      const hub = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16); hub.rotateZ(Math.PI / 2); hub.translate(0.5, 0.64, 0); add('crew', hub, 'screen', g);
      add('crew', rod(V3(0.54, 0.64, 0), V3(0.62, 0.3, 0), 0.03), 'rig', g);
    } else {
      const con = new THREE.BoxGeometry(0.14, 0.34, 0.36); con.translate(0.58, 0.36, 0); add('crew', con, 'rig', g);
      const scr = new THREE.BoxGeometry(0.01, 0.12, 0.2); scr.translate(0.505, 0.44, 0); add('crew', scr, 'screen', g);
      for (const k of [-1, 1]) { const j = new THREE.CylinderGeometry(0.018, 0.022, 0.1, 10); j.translate(0.48, 0.52, 0.13 * k * s); add('crew', j, 'rig', g); }
    }
    crewMats.push(g);
  }
  for (const s of [1, -1]) {
    const zc = (xx) => s * lerp(PW[0], PW[1], 0.52) * HB(xu(xx));
    const xa = (PITS[1][0] + PITS[1][1]) / 2 - 0.12, xf = (PITS[0][0] + PITS[0][1]) / 2 - 0.12;
    sailor(xa, zc(xa), s, true); sailor(xf, zc(xf), s, false);
  }

  // foil: braccio, siluro zavorrato, ala a T con flap
  const foils = {};
  function foilAssembly(side, down) {
    const g = new THREE.Group(); g.position.set(PIV_X, PIV_Y, side * PIV_Z);
    g.rotation.x = side > 0 ? (down ? -CANT : -(Math.PI / 2 + RAISE)) : (down ? CANT : Math.PI / 2 + RAISE);
    boat.add(g);
    const armId = down ? 'arm' : 'wfoil', wingId = down ? 'wing' : 'wfoil';
    const st = [];
    for (let i = 0; i <= 16; i++) { const t = i / 16; st.push({ p: V3(0, -t * (ARM - 0.02), 0), c: V3(1, 0, 0), t: V3(0, 0, side), chord: lerp(0.56, 0.44, t), thick: lerp(0.17, 0.14, t), x0: 0.42 }); }
    add(armId, loft(st, 22), 'foil', g);
    const hub = new THREE.CylinderGeometry(0.2, 0.2, 0.74, 28); hub.rotateZ(Math.PI / 2); add(armId, hub, 'foil', g);
    for (const e of [-1, 1]) { const c = new THREE.SphereGeometry(0.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2); c.rotateZ(-e * Math.PI / 2); c.translate(e * 0.37, 0, 0); add(armId, c, 'foil', g); }
    // siluro
    const prof = [];
    for (let i = 0; i <= 30; i++) { const y = lerp(-0.64, 0.6, i / 30); let r; if (y > 0.34) r = 0.115 * Math.sqrt(Math.max(0, 1 - ((y - 0.34) / 0.26) ** 2)); else if (y > -0.12) r = 0.115; else r = lerp(0.02, 0.115, Math.pow((y + 0.64) / 0.52, 0.7)); prof.push(new THREE.Vector2(Math.max(r, 0.0001), y)); }
    const bulb = new THREE.LatheGeometry(prof, 28); bulb.rotateZ(-Math.PI / 2); bulb.translate(0.04, -ARM, 0);
    add(wingId, bulb, 'foil', g);
    // ala principale (74% della corda) e flap (28%)
    const SPAN = 2.3, ANH = rad(9), Y0 = -ARM - 0.03;
    add(wingId, loft(wingStations(SPAN, 0.37, 0.2, 0.12, Y0, ANH, 0.07, 0.4, 0.74), 18), 'foil', g);
    for (const e of [-1, 1]) for (const [q0, q1, def] of [[0.1, 0.52, 6], [0.56, 0.86, 3]]) {
      const fs = [];
      for (let i = 0; i <= 6; i++) {
        const q = lerp(q0, q1, i / 6), a = q, c = lerp(0.37, 0.2, a);
        const p = V3(-0.07 * a * a - 0.43 * c, Y0 - a * SPAN / 2 * Math.tan(ANH), e * q * SPAN / 2);
        const d = rad(def), cd = V3(Math.cos(d), Math.sin(d), 0), td = V3(-Math.sin(d), Math.cos(d), 0);
        fs.push({ p, c: cd, t: td, chord: 0.28 * c, thick: 0.1, x0: 0 });
      }
      add(wingId, loft(fs, 12), 'flap', g);
    }
    foils[down ? 'down' : 'up'] = g;
    return g;
  }
  foilAssembly(-WIND, true);
  foilAssembly(WIND, false);
  // carenature dei perni dei foil sullo scafo
  for (const s of [1, -1]) { const f = new THREE.SphereGeometry(0.28, 24, 14); f.scale(2.4, 0.9, 0.55); f.translate(PIV_X, PIV_Y + 0.02, s * (PIV_Z - 0.12)); add('hull', f, 'paint'); }

  // timone a T appeso allo specchio di poppa
  {
    const st = [];
    for (let i = 0; i <= 14; i++) { const t = i / 14; st.push({ p: V3(RX - 0.05 * t, lerp(0.05, RUD_BOT, t), 0), c: V3(1, 0, 0), t: V3(0, 0, 1), chord: lerp(0.34, 0.27, t), thick: 0.12, x0: 0.35 }); }
    add('rudder', loft(st, 20), 'foil');
    const el = wingStations(1.25, 0.26, 0.15, 0.11, RUD_BOT - 0.02, 0, 0.03, 0.4, 1, 20); el.forEach(s => s.p.x += RX - 0.02);
    add('rudder', loft(el, 16), 'foil');
    const pod = new THREE.CapsuleGeometry(0.05, 0.36, 6, 12); pod.rotateZ(Math.PI / 2); pod.translate(RX - 0.04, RUD_BOT - 0.02, 0); add('rudder', pod, 'foil');
    const gantry = new THREE.BoxGeometry(0.34, 0.78, 0.26); gantry.translate(RX + 0.02, -0.2, 0); add('rudder', gantry, 'foil');
    const pole = rod(V3(RX + 0.05, 0.18, 0), V3(RX + 0.05, 0.62, 0), 0.02); add('hull', pole, 'rig');
    const cam = new THREE.BoxGeometry(0.16, 0.11, 0.12); cam.translate(RX + 0.05, 0.68, 0); add('hull', cam, 'rig');
  }

  /* ----- patch dei materiali: tinta sott'acqua e luce che attraversa le vele ----- */
  const U_TIME = { value: 0 }, U_ABOVE = { value: 1 }, U_WATER = { value: new THREE.Color(0x0b4a60) }, U_SUNV = { value: V3() }, U_SUNC = { value: new THREE.Color(1, 0.94, 0.85).multiplyScalar(1.4) };
  function patch(mat, trans) {
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uAbove: U_ABOVE, uWaterC: U_WATER, uSunV: U_SUNV, uSunC: U_SUNC, uT: U_TIME });
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp; uniform float uAbove; uniform vec3 uWaterC; uniform vec3 uSunV; uniform vec3 uSunC; uniform float uT;')
        .replace('#include <opaque_fragment>', (trans ? `outgoingLight += diffuseColor.rgb * uSunC * max(dot(-normal, uSunV), 0.0) * ${trans.toFixed(2)};\n` : '') +
          `if (vWp.y < 0.0) { vec2 cp = vWp.xz * 2.2 + vec2(uT * ${(FLOW * 2.2).toFixed(1)}, 0.0); float c1 = sin(cp.x + sin(cp.y * 1.3 + uT * 1.7)) + sin(cp.y * 1.1 + sin(cp.x * 0.9 - uT * 1.3)); float ca = pow(max(0.0, 1.0 - abs(c1) * 0.6), 5.0) * exp(vWp.y * 0.6); outgoingLight += diffuseColor.rgb * uSunC * ca * 0.9 + vec3(0.0, 0.03, 0.04) * ca; }\n` +
          '#include <opaque_fragment>\nif (uAbove > 0.5 && vWp.y < 0.0) { gl_FragColor.rgb = mix(gl_FragColor.rgb * vec3(0.5, 0.78, 0.85), uWaterC, 1.0 - exp(vWp.y * 0.8)); }');
    };
    mat.customProgramCacheKey = () => 'b3' + trans;
  }
  boat.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.baseEm = o.material.emissive ? o.material.emissive.clone() : null; patch(o.material, ['sail', 'jib'].includes(o.userData.mk) ? 0.55 : 0); } });

  /* ----- livree ----- */
  let texCache = [], curTeam = null;
  function livery(team) {
    if (!LIVERY[team]) team = 'lr';
    if (team === curTeam) return;
    curTeam = team;
    const lv = LIVERY[team];
    texCache.forEach(t => t.dispose());
    const q = tier === 'high' ? 1 : 0.5;
    const hullTex = hullTexture(lv, girthAt, false, q), hullMetal = hullTexture(lv, girthAt, true, q);
    const mainT = { true: sailTexture(600, 2048, MAIN_CMAX, mainChord, true, lv, true, q), false: sailTexture(600, 2048, MAIN_CMAX, mainChord, false, lv, true, q) };
    const jibT = { true: sailTexture(512, 1600, JIB_CMAX, jibChord, true, lv, false, q), false: sailTexture(512, 1600, JIB_CMAX, jibChord, false, lv, false, q) };
    texCache = [hullTex, hullMetal, mainT.true, mainT.false, jibT.true, jibT.false];
    boat.traverse(o => {
      if (!o.isMesh) return; const m = o.material;
      switch (o.userData.mk) {
        case 'paint': m.map = hullTex; m.metalnessMap = hullMetal; m.metalness = 1; m.roughness = lv.rough; break;
        case 'deck': m.color.set(lv.deck); break;
        case 'sail': m.map = mainT[o.userData.luffLeft]; break;
        case 'jib': m.map = jibT[o.userData.luffLeft]; break;
        case 'vest': m.color.set(lv.vest); break;
        case 'suit': m.color.set(lv.suit); break;
        case 'helm': m.color.set(lv.helm); break;
        default: return;
      }
      m.needsUpdate = true;
    });
  }
  livery(opts.team);

  // posizione di volo: sbandata sopravento e prua leggermente su
  boat.position.y = DECK;
  const HEEL = WIND * rad(2.5), PITCH = rad(0.5);
  boat.rotation.set(HEEL, 0, PITCH);
  boat.updateMatrixWorld(true);

  /* ----- spruzzi ----- */
  const NP = tier === 'low' ? 450 : 900;
  const pPos = new Float32Array(NP * 3), pVel = new Float32Array(NP * 3), pLife = new Float32Array(NP), pMax = new Float32Array(NP), pSize = new Float32Array(NP), pSrc = new Uint8Array(NP);
  const sprayG = new THREE.BufferGeometry();
  sprayG.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  sprayG.setAttribute('aLife', new THREE.BufferAttribute(new Float32Array(NP), 1));
  sprayG.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1));
  const sprayU = { uScale: { value: 400 }, uCol: { value: new THREE.Color(0.9, 0.95, 1.0).multiplyScalar(1.1) } };
  const spray = new THREE.Points(sprayG, new THREE.ShaderMaterial({ vertexShader: sprayVS, fragmentShader: sprayFS, uniforms: sprayU, transparent: true, depthWrite: false }));
  spray.renderOrder = 3; spray.frustumCulled = false; scene.add(spray);
  const pierce = (grp, a, b) => {
    const A = grp.localToWorld(a.clone()), B = grp.localToWorld(b.clone()); const t = A.y / (A.y - B.y);
    return A.lerp(B, clamp(t, 0, 1));
  };
  const src = [V3(), V3()];
  const updateSources = () => {
    boat.updateMatrixWorld(true);
    src[0].copy(pierce(foils.down, V3(0, 0, 0), V3(0, -ARM, 0)));
    src[1].copy(pierce(boat, V3(RX, 0.05, 0), V3(RX - 0.05, RUD_BOT, 0)));
  };
  updateSources();
  const respawn = i => {
    const s = i % 4 === 0 ? 1 : 0, o = src[s]; pSrc[i] = s;
    pPos[i * 3] = o.x + (Math.random() - 0.5) * 0.25; pPos[i * 3 + 1] = 0.03; pPos[i * 3 + 2] = o.z + (Math.random() - 0.5) * 0.2;
    const up = s ? 0.8 + Math.random() * 1.4 : 1.2 + Math.random() * 3.2;
    pVel[i * 3] = -FLOW * (0.35 + Math.random() * 0.4); pVel[i * 3 + 1] = up; pVel[i * 3 + 2] = (Math.random() - 0.5) * (s ? 1.2 : 2.4);
    pMax[i] = pLife[i] = 0.35 + Math.random() * 0.9;
    pSize[i] = (Math.random() < 0.12 ? 0.32 : 0.07) + Math.random() * 0.12;
  };
  for (let i = 0; i < NP; i++) { respawn(i); pLife[i] *= Math.random(); }

  /* ----- sott'acqua: bolle dalle estremità dell'ala e particelle in sospensione ----- */
  const NB = 480;
  const bPos = new Float32Array(NB * 3), bVel = new Float32Array(NB * 3), bLife = new Float32Array(NB), bMax = new Float32Array(NB).fill(1), bSize = new Float32Array(NB);
  const bubG = new THREE.BufferGeometry();
  bubG.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
  bubG.setAttribute('aLife', new THREE.BufferAttribute(new Float32Array(NB), 1));
  bubG.setAttribute('aSize', new THREE.BufferAttribute(bSize, 1));
  const bubbles = new THREE.Points(bubG, new THREE.ShaderMaterial({ vertexShader: sprayVS, fragmentShader: sprayFS, transparent: true, depthWrite: false,
    uniforms: { uScale: sprayU.uScale, uCol: { value: new THREE.Color(0.8, 0.97, 1.0) } } }));
  bubbles.frustumCulled = false; bubbles.visible = false; scene.add(bubbles);
  const bSrc = [V3(-0.22, -3.45, 1.12), V3(-0.22, -3.45, -1.12), V3(-0.62, -ARM, 0), V3(-0.28, -ARM * 0.75, 0)];
  const bRespawn = (i, near) => {
    const k = i % 6, R = Math.random;
    if (k < 4) {
      const o = foils.down.localToWorld(bSrc[k].clone());
      if (o.y > -0.05) { bLife[i] = 0; return; }
      bPos[i * 3] = o.x + (R() - 0.5) * 0.06; bPos[i * 3 + 1] = o.y + (R() - 0.5) * 0.06; bPos[i * 3 + 2] = o.z + (R() - 0.5) * 0.06;
      bVel[i * 3] = -FLOW * (0.75 + R() * 0.2); bVel[i * 3 + 1] = 0.2 + R() * 0.3; bVel[i * 3 + 2] = (R() - 0.5) * 0.5;
      bMax[i] = bLife[i] = 0.4 + R() * 0.9; bSize[i] = 0.025 + R() * 0.045;
    } else {
      bPos[i * 3] = near.x + 8 + R() * 6; bPos[i * 3 + 1] = Math.min(near.y + (R() - 0.5) * 6, -0.15); bPos[i * 3 + 2] = near.z + (R() - 0.5) * 14;
      bVel[i * 3] = -FLOW; bVel[i * 3 + 1] = (R() - 0.5) * 0.1; bVel[i * 3 + 2] = 0;
      bMax[i] = bLife[i] = 1.2 + R() * 1.4; bSize[i] = 0.012 + R() * 0.02;
    }
  };

  /* ----- evidenziazione ----- */
  let activeIds = [];
  const setActive = (id, rel = []) => {
    activeIds = id ? [id, ...rel] : [];
    const glass = activeIds.includes('batt');
    glassy.forEach(m => { const mt = m.material; mt.transparent = glass; mt.opacity = glass ? (m === hullMesh || m === transom ? 0.28 : 0.2) : 1; mt.depthWrite = !glass; mt.needsUpdate = true; m.castShadow = !glass; });
    battGroup.visible = glass;
  };
  const glowAll = k => {
    Object.entries(parts).forEach(([id, arr]) => {
      const on = activeIds.includes(id) && id !== 'water';
      arr.forEach(m => { const mt = m.material; if (!mt.emissive) return; if (on) mt.emissive.setRGB(0.02 * k, 0.17 * k, 0.16 * k); else if (mt.userData.baseEm) mt.emissive.copy(mt.userData.baseEm); });
    });
  };

  /* ----- riflesso planare del mare ----- */
  const mirrorCam = new THREE.PerspectiveCamera();
  const clipPlane = new THREE.Plane(), clipV = new THREE.Vector4(), qv = new THREE.Vector4(), fwd = V3(), tgt = V3();
  let reflOn = tier !== 'low', reflScale = tier === 'high' ? 0.5 : 0.35;
  function renderMirror() {
    const cp = camera.position;
    mirrorCam.position.set(cp.x, -cp.y, cp.z);
    fwd.set(0, 0, -1).applyQuaternion(camera.quaternion); tgt.copy(cp).add(fwd); tgt.y = -tgt.y;
    mirrorCam.up.set(0, 1, 0).applyQuaternion(camera.quaternion); mirrorCam.up.y = -mirrorCam.up.y;
    mirrorCam.lookAt(tgt); mirrorCam.far = camera.far; mirrorCam.updateMatrixWorld();
    mirrorCam.projectionMatrix.copy(camera.projectionMatrix);
    WU.uReflMat.value.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(mirrorCam.projectionMatrix).multiply(mirrorCam.matrixWorldInverse);
    clipPlane.set(V3(0, 1, 0), 0).applyMatrix4(mirrorCam.matrixWorldInverse);
    clipV.set(clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.constant);
    const e = mirrorCam.projectionMatrix.elements;
    qv.set((Math.sign(clipV.x) + e[8]) / e[0], (Math.sign(clipV.y) + e[9]) / e[5], -1, (1 + e[10]) / e[14]);
    clipV.multiplyScalar(2 / clipV.dot(qv));
    e[2] = clipV.x; e[6] = clipV.y; e[10] = clipV.z + 1 - 0.003; e[14] = clipV.w;
    mirrorCam.projectionMatrixInverse.copy(mirrorCam.projectionMatrix).invert();
    water.visible = false; spray.visible = false; abyss.visible = false;
    renderer.setRenderTarget(reflRT); renderer.clear(); renderer.render(scene, mirrorCam); renderer.setRenderTarget(null);
    water.visible = true; spray.visible = true; abyss.visible = true;
    WU.uUseRefl.value = 1;
  }

  function applyTier() {
    renderer.setPixelRatio(dprFor(tier));
    reflOn = tier !== 'low'; reflScale = tier === 'high' ? 0.5 : 0.35;
    const ms = tier === 'high' ? 2048 : 1024;
    if (sunLight.shadow.mapSize.x !== ms) { sunLight.shadow.mapSize.set(ms, ms); if (sunLight.shadow.map) { sunLight.shadow.map.dispose(); sunLight.shadow.map = null; } }
    resize();
  }

  /* ----- camera ----- */
  let portrait = false, userYaw = 0, spin = 0, dragging = false, lastX = 0, idle = 0;
  const view = { t: V3(0, 8, 0), d: 30, az: 35, el: 12 };
  let goal = { ...VIEWS[0] };
  const lerpA = (a, b, t) => { const d = ((b - a + 540) % 360) - 180; return a + d * t; };
  const setView = (i, t) => {
    const a = VIEWS[Math.min(i, VIEWS.length - 1)], b = VIEWS[Math.min(i + 1, VIEWS.length - 1)];
    goal = { t: a.t.map((v, k) => v + (b.t[k] - v) * t), d: Math.exp(Math.log(a.d) + (Math.log(b.d) - Math.log(a.d)) * t), az: lerpA(a.az, b.az, t), el: a.el + (b.el - a.el) * t };
  };
  const anchorOf = id => {
    if (id === 'water') return src[0].clone();
    const arr = parts[id]; if (!arr || !arr.length) return null;
    const box = new THREE.Box3(); arr.forEach(m => box.expandByObject(m));
    return box.getCenter(V3());
  };
  let labelId = null, labelAt = null;
  const setLabel = id => { labelId = id; labelAt = id ? anchorOf(id) : null; label.hidden = !id || !labelAt; if (id) label.querySelector('span').textContent = LABELS[id] || ''; };

  cv.style.touchAction = 'pan-y';
  cv.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; idle = 0; ui.classList.add('used'); });
  window.addEventListener('pointermove', e => { if (!dragging) return; userYaw += (e.clientX - lastX) * 0.35; lastX = e.clientX; });
  const end = () => { dragging = false; };
  window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
  ui.addEventListener('click', e => {
    const b = e.target.closest('[data-b3]'); if (!b) return; ui.classList.add('used');
    const k = b.dataset.b3; if (k === 'l') userYaw -= 45; else if (k === 'r') userYaw += 45; else spin = 360;
  });

  function resize() {
    const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    portrait = w < h && innerWidth < 900; camera.fov = portrait ? 50 : w < h ? 46 : 40;
    if (portrait) camera.setViewOffset(w, h, 0, h * 0.2, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    const px = renderer.getPixelRatio();
    reflRT.setSize(Math.max(256, Math.round(w * px * reflScale)), Math.max(256, Math.round(h * px * reflScale)));
    sprayU.uScale.value = h * px / (2 * Math.tan(rad(camera.fov) / 2));
  }
  applyTier();
  addEventListener('resize', resize);

  const underFog = new THREE.FogExp2(0xffffff, 0.05); underFog.color.copy(UW_H);
  const clock = new THREE.Clock();
  let running = false, raf = 0, tAcc = 0, fAcc = 0, fN = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tmp = V3(), goalT = V3();
  const frame = () => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const rdt = Math.min(clock.getDelta(), 0.3), dt = Math.min(rdt, 0.05); tAcc += dt; idle += rdt;
    // se il dispositivo arranca, si scende di qualità
    if (!forced && tier !== 'low' && tAcc > 3) { fAcc += rdt; if (++fN >= 90) { if (fAcc / fN > 0.045) { tier = tier === 'high' ? 'mid' : 'low'; applyTier(); } fAcc = 0; fN = 0; } }
    const k = 1 - Math.exp(-rdt * 4);
    if (spin > 0) { const s = Math.min(spin, dt * 120); spin -= s; userYaw += s; }
    if (goal.d > 20 && !dragging && idle > 2 && !reduce) userYaw += dt * 4;
    view.t.lerp(goalT.fromArray(goal.t), k); view.d += (goal.d - view.d) * k; view.el += (goal.el - view.el) * k;
    view.az = lerpA(view.az, goal.az + userYaw, k);
    const az = rad(view.az), el = rad(view.el), dd = view.d * (portrait ? 1.35 : 1);
    camera.position.set(view.t.x + dd * Math.cos(el) * Math.cos(az), view.t.y + dd * Math.sin(el), view.t.z + dd * Math.cos(el) * Math.sin(az));
    camera.lookAt(view.t); camera.updateMatrixWorld();
    const under = camera.position.y < 0;
    scene.fog = under ? underFog : null;
    sky.visible = clouds.visible = land.visible = abyss.visible = !under; deep.visible = under; spray.visible = !under; bubbles.visible = under;
    if (under) deep.position.copy(camera.position);
    deep.material.uniforms.uTime.value = tAcc; U_TIME.value = tAcc;
    U_ABOVE.value = under ? 0 : 1;
    renderer.setClearColor(under ? 0x0c4a5e : 0x000000);

    if (!reduce) {
      boat.position.y = DECK + Math.sin(tAcc * 1.3) * 0.04;
      boat.rotation.x = HEEL + Math.sin(tAcc * 0.9) * 0.004;
      boat.rotation.z = PITCH + Math.sin(tAcc * 0.7 + 1) * 0.003;
      WU.uTime.value = tAcc; cloudMat.uniforms.uTime.value = tAcc;
      updateSources();
      const la = sprayG.attributes.aLife.array;
      for (let i = 0; i < NP; i++) {
        pLife[i] -= dt; if (pLife[i] <= 0 || pPos[i * 3 + 1] < -0.05) { respawn(i); }
        pVel[i * 3 + 1] -= 9.8 * dt;
        pPos[i * 3] += pVel[i * 3] * dt; pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt; pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
        la[i] = 1 - pLife[i] / pMax[i];
      }
      sprayG.attributes.position.needsUpdate = true; sprayG.attributes.aLife.needsUpdate = true; sprayG.attributes.aSize.needsUpdate = true;
      if (under) {
        const bl = bubG.attributes.aLife.array;
        for (let i = 0; i < NB; i++) {
          bLife[i] -= dt; if (bLife[i] <= 0) bRespawn(i, view.t);
          bPos[i * 3] += bVel[i * 3] * dt; bPos[i * 3 + 1] = Math.min(bPos[i * 3 + 1] + bVel[i * 3 + 1] * dt, -0.02); bPos[i * 3 + 2] += bVel[i * 3 + 2] * dt;
          bl[i] = bLife[i] > 0 ? 1 - bLife[i] / bMax[i] : 1;
        }
        bubG.attributes.position.needsUpdate = true; bubG.attributes.aLife.needsUpdate = true; bubG.attributes.aSize.needsUpdate = true;
      }
    }
    WU.uFoamP.value.set(src[0].x, src[0].z, src[1].x, src[1].z);
    U_SUNV.value.copy(sunDir).transformDirection(camera.matrixWorldInverse);
    glowAll(0.55 + 0.45 * Math.sin(tAcc * 4));

    if (labelId && labelAt) {
      tmp.copy(labelAt).project(camera);
      const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
      label.style.opacity = vis ? 1 : 0;
      const lx = Math.min(Math.max((tmp.x * 0.5 + 0.5) * stage.clientWidth, 12), stage.clientWidth - 170), ly = Math.min(Math.max((-tmp.y * 0.5 + 0.5) * stage.clientHeight, 120), stage.clientHeight - 40);
      label.style.transform = `translate(${lx}px,${ly}px)`;
    }
    renderer.shadowMap.needsUpdate = true;
    if (reflOn && !under) renderMirror(); else WU.uUseRefl.value = 0;
    renderer.render(scene, camera);
  };

  const api = {
    view: setView,
    active(id, rel) { setActive(id, rel); setLabel(id && LABELS[id] ? id : null); },
    altitude: () => view.t.y,
    livery,
    start() { if (running) return; running = true; clock.getDelta(); resize(); frame(); },
    stop() { running = false; cancelAnimationFrame(raf); },
    resize
  };
  window.__b3 = { scene, boat, water, spray, camera, renderer, parts, api, get tier() { return tier; }, snap() { view.t.fromArray(goal.t); view.d = goal.d; view.el = goal.el; view.az = goal.az + userYaw; } };
  return api;
}
