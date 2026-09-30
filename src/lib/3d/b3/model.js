import * as THREE from 'three';

/* AC40 ricostruito sulle misure di classe: lunghezza 11,80 m, baglio 3,38 m, albero 17,92 m,
   randa a doppia pelle 63 m², fiocco J1 32 m², foil a T zavorrati su bracci basculanti, timone a T.
   Assi: X verso prua, Y verso l'alto, acqua a y = 0, vento da +Z (lato sopravento). */
const L = 11.8, MAST_H = 17.92, DECK = 2.15, WIND = 1, FLOW = 11;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const { clamp, lerp, degToRad: rad } = THREE.MathUtils;

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

export { L, MAST_H, DECK, WIND, FLOW, V3, clamp, lerp, rad, mono, rng, canvasTex, geom, flip, orient, faceTo, rod, limb, tube, HB, SHEER, KEEL, BUST, DEAD, CROWN, ux, xu, deckY, PITS, PW, PIT_D, DW, HM, sectionPts, sectionRing, hullStations, girth, hullGeometry, capGeometry, inPit, deckGeometry, pitGeometry, coamingGeometry, naca, loft, wingStations, MX, RAKE, MROT, MBASE, MAXIS, MDIR, MLEE, mChord, mThick, mastAt, dRing, MAIN_H0, MAIN_H1, MAIN_CMAX, mainChord, camberAt, mainPoint, STAY_H, TACK, STAY_TOP, JHEAD, JCLEW, JIB_CMAX, LUFF_J, jibChord, jibPoint, sailGrid, ARM, PIV_X, PIV_Y, PIV_Z, CANT, RAISE, RX, RUD_BOT };
