import * as THREE from 'three';
import { L, rng, canvasTex } from './model.js';

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

export { carbonTex, noiseTex, hullTexture, shade, lum, sailTexture, waterNormals };
