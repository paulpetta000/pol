// Fotografa i bozzetti (design/itinerari/proposta-*.html) come schermate da telefono, in chiaro e in scuro,
// e mette accanto le due versioni di ogni schermata.
// Serve playwright-core (con Chrome già installato) e sharp (già nel progetto).
// Uso: node design/itinerari/foto.cjs <cartella di uscita> [percorso di playwright-core]
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const sharp = require(path.join(__dirname, '../../node_modules/sharp'));
const { chromium } = require(process.argv[3] || 'playwright-core');

const OUT = process.argv[2];
if (!OUT) throw new Error('Indica la cartella di uscita');
fs.mkdirSync(OUT, { recursive: true });

const TITOLI = {
  a1: 'A1 · Elenco delle tappe', a2: 'A2 · Itinerario: tappa lontana', a3: 'A3 · Cambiare l\'ordine', a4: 'A4 · Giornata piena', a5: 'A5 · Giorno vuoto', a6: 'A6 · Mappa',
  b1: 'B1 · Aggiungere una tappa', b2: 'B2 · Giornata: tappa lontana', b3: 'B3 · Giornata piena', b4: 'B4 · Giorno vuoto', b5: 'B5 · Mappa'
};
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(f => fs.existsSync(f));

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const file of ['proposta-a.html', 'proposta-b.html']) {
    await page.goto(pathToFileURL(path.join(__dirname, file)).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const ids = await page.$$eval('.tel', els => els.map(e => e.id));
    for (const tema of ['light', 'dark']) {
      await page.evaluate(t => { document.documentElement.dataset.theme = t; }, tema);
      await page.waitForTimeout(150);
      for (const id of ids) await page.locator(`#${id}`).screenshot({ path: path.join(OUT, `${id}-${tema}.png`) });
    }
    // overflow orizzontale: nessuna schermata deve uscire dai 390 px
    const larghe = await page.$$eval('.tel', els => els.filter(e => e.scrollWidth > e.clientWidth).map(e => e.id));
    if (larghe.length) console.log('Attenzione, contenuto più largo del telefono in:', larghe.join(', '));
    console.log(file, ids.join(', '));
    for (const id of ids) {
      const [c, s] = await Promise.all(['light', 'dark'].map(t => sharp(path.join(OUT, `${id}-${t}.png`)).toBuffer()));
      const m = await sharp(c).metadata();
      const W = m.width, H = m.height, G = 48, T = 96;
      const testo = (x, y, s, t, peso = 600) => `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${s}" font-weight="${peso}" fill="#fff">${t}</text>`;
      const svg = Buffer.from(`<svg width="${W * 2 + G * 3}" height="${H + T + G}" xmlns="http://www.w3.org/2000/svg">${testo(G, 60, 44, TITOLI[id] || id)}${testo(W * 2 + G * 2 - 260, 60, 30, 'chiaro · scuro', 400)}</svg>`);
      await sharp({ create: { width: W * 2 + G * 3, height: H + T + G, channels: 3, background: '#30353c' } })
        .composite([{ input: svg, left: 0, top: 0 }, { input: c, left: G, top: T }, { input: s, left: W + G * 2, top: T }])
        .jpeg({ quality: 86 }).toFile(path.join(OUT, `${id}.jpg`));
    }
  }
  await browser.close();
})();
