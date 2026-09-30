// "La regata in 60 secondi": 6 scene da 10 secondi, due barche viste dall'alto.
// Lo stesso modello disegna l'animazione (nel browser) e le 6 immagini ferme (nella build).
// Coordinate: riquadro 300 × 400, vento da nord (dall'alto verso il basso).
// Angoli: 0° = verso destra, 90° = verso il basso (come le rotazioni SVG).

export type P = [number, number];
export type K = [number, number, number]; // [tempo in s, x, y]

export const W = 300;
export const H = 400;
export const DUR = 10;
export const TOT = 60;
// Le barche sono disegnate più grandi del vero, per vederle bene sul telefono
export const SCALA = 1.3;

export const CAMPO = {
  confini: { x: 22, y: 34, w: 256, h: 350 },
  alto: [[122, 76], [178, 76]] as P[],
  basso: [[122, 300], [178, 300]] as P[],
  boa: [92, 344] as P,
  giuria: [208, 344] as P
};

export type Scena = { titolo: string; testo: string; chiave: number; fatti: string[] };

// I testi riassumono le schede indicate in "fatti" (con fonte e data in src/data/fatti.yaml)
export const SCENE: Scena[] = [
  {
    titolo: 'Il campo e il vento',
    testo: 'Il campo è un rettangolo di mare con confini invisibili, che si vedono solo sugli strumenti e in TV. Si parte in basso, controvento, e si va su e giù tra due «cancelli» di boe.',
    chiave: 8.6,
    fatti: ['reg-percorso', 'reg-confini']
  },
  {
    titolo: 'La partenza',
    testo: 'Poco più di due minuti prima del via le barche entrano da lati opposti e si studiano. Al segnale devono essere dietro la linea: chi la passa in anticipo è «OCS» e viene penalizzato.',
    chiave: 18.9,
    fatti: ['reg-partenza', 'reg-ocs']
  },
  {
    titolo: 'La bolina',
    testo: 'Controvento non si va dritti: si risale a zig-zag, virando. Ogni virata costa velocità ed energia delle batterie. In alto si gira attorno a una delle due boe del cancello, a scelta.',
    chiave: 27.8,
    fatti: ['reg-percorso', 'ac75-batterie']
  },
  {
    titolo: 'La poppa',
    testo: 'Col vento alle spalle si scende a zig-zag con le strambate. Sui foil si va più veloci del vento: il record dell\'AC75 è di 55,6 nodi, oltre 100 km/h.',
    chiave: 33.4,
    fatti: ['ac75-velocita', 'cal-vento']
  },
  {
    titolo: 'Precedenze e penalità',
    testo: 'Quando due barche si incrociano, chi ha le mure a sinistra lascia strada. La blu non lo fa: gli arbitri la penalizzano e deve rallentare finché non è 75 metri dietro (regole del 2024). Uscire dai confini costa lo stesso.',
    chiave: 43.4,
    fatti: ['reg-precedenze', 'reg-penalita', 'reg-confini']
  },
  {
    titolo: 'L\'arrivo e come si vince',
    testo: 'Vince la regata chi taglia per primo il traguardo, con le penalità scontate. Il Match per la Coppa è una serie: vince chi arriva prima a 7 vittorie. Nelle semifinali della Louis Vuitton Cup ne bastano 5.',
    chiave: 58.2,
    fatti: ['reg-arrivo', 'cal-match', 'cal-semifinali']
  }
];

// Percorsi (tempo, x, y). "blu" entra da sinistra e sarà penalizzata; "arancio" entra da destra e vince.
const BLU: K[] = [
  [0, 34, 372], [10, 44, 372],
  // pre-partenza: entra da sinistra, un giro, poi verso la linea con le mure a dritta
  [11.3, 92, 371], [11.9, 108, 370], [12.5, 122, 358], [13.1, 110, 346], [13.7, 98, 358], [14.3, 110, 370],
  [15.1, 136, 374], [15.8, 156, 370], [16.4, 160, 360], [17.3, 148, 354], [18.5, 128, 344],
  // bolina: a sinistra, poi cancello in alto (boa di sinistra)
  [19.2, 112, 328], [19.9, 96, 312], [20.5, 82, 298], [21.0, 96, 284], [22.3, 128, 252], [22.6, 136, 244],
  [23.1, 122, 230], [23.9, 100, 208], [24.5, 116, 192], [25.4, 140, 168], [25.9, 126, 154], [26.2, 118, 146],
  [26.8, 134, 130], [27.3, 142, 110], [27.7, 144, 90], [28.0, 142, 72], [28.35, 130, 62], [28.7, 114, 64],
  [29.0, 106, 78], [29.4, 96, 94],
  // poppa: strambate fino al cancello in basso (boa di sinistra)
  [29.9, 80, 112], [30.3, 64, 130], [30.8, 80, 150], [31.6, 110, 180], [32.0, 124, 194], [32.4, 110, 210],
  [32.9, 90, 230], [33.3, 106, 246], [33.9, 128, 268], [34.3, 138, 284], [34.6, 142, 300], [34.9, 136, 314],
  [35.2, 122, 318], [35.5, 110, 310], [35.8, 106, 296],
  // di nuovo in bolina: mure a sinistra verso il centro, l'incrocio e la penalità
  [37.4, 78, 268], [41.4, 146, 200],
  [42.6, 160, 186], [44.0, 174, 172], [45.2, 186, 160], [46.5, 196, 150],
  [47.0, 204, 142], [48.4, 176, 114], [49.2, 160, 98], [49.7, 150, 88], [50.2, 152, 72], [50.6, 166, 62],
  [51.0, 182, 66], [51.4, 188, 82],
  // ultima poppa e arrivo
  [52.3, 220, 116], [52.8, 236, 136], [54.2, 196, 186], [54.7, 180, 206], [55.6, 206, 240], [56.1, 214, 256],
  [57.0, 182, 294], [57.6, 166, 320], [58.0, 160, 344], [58.6, 156, 362], [59.5, 154, 372], [60, 154, 373]
];

const ARANCIO: K[] = [
  [0, 266, 372], [10, 256, 372],
  // pre-partenza: entra da destra, un giro, poi verso la linea sopravento alla blu
  [11.3, 214, 371], [11.9, 196, 370], [12.5, 180, 358], [13.1, 192, 346], [13.7, 204, 358], [14.3, 192, 370],
  [15.2, 204, 378], [16.0, 214, 376], [16.8, 204, 366], [17.6, 190, 358], [18.55, 172, 346],
  // subito una virata a destra: le barche si dividono
  [19.1, 184, 334], [19.6, 196, 322], [20.6, 226, 292], [21.0, 220, 280], [22.4, 176, 242], [22.8, 172, 234],
  [23.2, 186, 222], [23.6, 214, 204], [24.1, 206, 192], [25.2, 168, 158], [25.6, 172, 148], [26.0, 190, 136],
  [26.4, 182, 124], [26.9, 164, 110], [27.3, 158, 90], [27.7, 160, 70], [28.1, 174, 62], [28.5, 190, 68],
  [28.9, 194, 84], [29.6, 214, 112],
  // poppa: strambate fino al cancello in basso (boa di destra)
  [30.3, 244, 146], [30.8, 236, 166], [31.9, 184, 212], [32.3, 180, 226], [32.9, 216, 248], [33.3, 214, 262],
  [33.7, 188, 276], [34.2, 164, 292], [34.6, 158, 310], [34.9, 170, 318], [35.2, 188, 312], [35.5, 194, 296],
  // bolina: mure a dritta, ha la precedenza; allarga per evitare la blu, poi passa davanti
  [37.5, 222, 268], [41.4, 176, 222],
  [42.0, 160, 228], [42.6, 142, 216], [43.2, 126, 200], [43.8, 108, 182], [44.2, 102, 170], [44.6, 110, 158],
  [45.4, 130, 138], [46.3, 150, 114], [46.7, 146, 104], [47.1, 138, 92], [47.5, 140, 72], [47.9, 128, 62],
  [48.3, 112, 64], [48.7, 106, 80], [49.1, 92, 98], [49.8, 72, 122],
  // ultima poppa e arrivo per prima
  [50.3, 60, 140], [51.9, 110, 196], [52.4, 126, 214], [53.2, 100, 242], [53.7, 104, 256], [54.3, 128, 284],
  [55.0, 140, 320], [55.5, 146, 344], [56.0, 148, 362], [57.0, 150, 372], [60, 150, 373]
];

export const PERCORSI = { blu: BLU, arancio: ARANCIO } as const;
export type Nome = keyof typeof PERCORSI;

// Interpolazione di Hermite con velocità dalle differenze finite: moto fluido, tempi rispettati
function posizione(k: K[], t: number): P {
  if (t <= k[0][0]) return [k[0][1], k[0][2]];
  const n = k.length;
  if (t >= k[n - 1][0]) return [k[n - 1][1], k[n - 1][2]];
  let i = 0;
  while (t > k[i + 1][0]) i++;
  const vel = (j: number): P => {
    const a = k[Math.max(0, j - 1)], b = k[Math.min(n - 1, j + 1)];
    const dt = b[0] - a[0] || 1;
    return [(b[1] - a[1]) / dt, (b[2] - a[2]) / dt];
  };
  const [t0, x0, y0] = k[i], [t1, x1, y1] = k[i + 1];
  const h = t1 - t0, s = (t - t0) / h, s2 = s * s, s3 = s2 * s;
  const m0 = vel(i), m1 = vel(i + 1);
  const a = 2 * s3 - 3 * s2 + 1, b = s3 - 2 * s2 + s, c = -2 * s3 + 3 * s2, d = s3 - s2;
  return [a * x0 + b * h * m0[0] + c * x1 + d * h * m1[0], a * y0 + b * h * m0[1] + c * y1 + d * h * m1[1]];
}

export type Barca = { x: number; y: number; rotta: number; vela: 1 | -1; apertura: number; scia: string };

function barca(k: K[], t: number): Barca {
  const [x, y] = posizione(k, t);
  // rotta dalla direzione del moto (guardando un po' avanti e un po' indietro)
  let dx = 0, dy = 0;
  for (const e of [0.12, 0.3, 0.6]) {
    const a = posizione(k, Math.max(0, t - e)), b = posizione(k, Math.min(TOT, t + e));
    dx = b[0] - a[0]; dy = b[1] - a[1];
    if (Math.hypot(dx, dy) > 0.4) break;
  }
  if (Math.hypot(dx, dy) < 0.4) { dx = k === BLU ? 1 : -1; dy = 0; }
  const rotta = (Math.atan2(dy, dx) * 180) / Math.PI;
  const lx = dx / Math.hypot(dx, dy), ly = dy / Math.hypot(dx, dy);
  // vento da nord: se la barca va verso destra il vento arriva da sinistra (mure a sinistra) e la vela sta a destra
  const vela: 1 | -1 = Math.abs(lx) > 0.08 ? (lx > 0 ? 1 : -1) : (k === BLU ? 1 : -1);
  const apertura = 10 + 22 * Math.max(0, ly);
  const pts: string[] = [];
  for (let j = 0; j <= 18; j++) {
    const q = posizione(k, Math.max(0, t - j * 0.09));
    pts.push(`${q[0].toFixed(1)},${q[1].toFixed(1)}`);
  }
  return { x, y, rotta, vela, apertura, scia: pts.join(' ') };
}

// Scritte e grafiche che compaiono e scompaiono: [inizio, fine] in secondi.
// Gli elementi del campo (confini, boe, linea) compaiono nella scena 1 e poi restano.
export const FISSI = ['confini', 'alto', 'basso', 'via'];
export const FINESTRE: Record<string, [number, number]> = {
  confini: [1.6, TOT],
  alto: [3.2, TOT],
  basso: [4.6, TOT],
  via: [6, TOT],
  'l-vento': [0.3, 10],
  'l-confini': [1.6, 10],
  'l-alto': [3.2, 10],
  'l-basso': [4.6, 10],
  'l-via': [6, 10],
  entra: [10.2, 12.4],
  countdown: [10, 18.5],
  partiti: [18.5, 20.2],
  zigzag: [20.6, 26.2],
  sceglie: [26.8, 29.6],
  strambate: [30.4, 34.2],
  record: [31, 39.6],
  precedenza: [39.4, 41.6],
  contatto: [41.15, 41.9],
  penalita: [41.9, 45.3],
  metri: [45.5, 46.9],
  scontata: [47.0, 48.6],
  traguardo: [50.4, 55.4],
  vince: [55.5, 60],
  tabellone: [56.6, 60]
};

const FADE = 0.3;
export function opacita(key: string, t: number) {
  const [a, b] = FINESTRE[key];
  if (b >= TOT) return t < a ? 0 : Math.min(1, (t - a) / FADE);
  if (t < a || t > b + FADE) return 0;
  const inn = Math.min(1, (t - a) / FADE);
  const out = t > b ? 1 - (t - b) / FADE : 1;
  return Math.max(0, Math.min(inn, out));
}

export function countdown(t: number) {
  const rest = Math.max(0, Math.round((130 * (18.5 - t)) / 8.5));
  return `−${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}`;
}

export type Stato = { t: number; scena: number; blu: Barca; arancio: Barca; op: Record<string, number>; conto: string; };

export function stato(t: number): Stato {
  const tt = Math.max(0, Math.min(TOT, t));
  const op: Record<string, number> = {};
  for (const k of Object.keys(FINESTRE)) op[k] = opacita(k, tt);
  return {
    t: tt,
    scena: Math.min(SCENE.length - 1, Math.floor(tt / DUR)),
    blu: barca(BLU, tt),
    arancio: barca(ARANCIO, tt),
    op,
    conto: countdown(tt)
  };
}
