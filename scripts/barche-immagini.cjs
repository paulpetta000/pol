// Rifà le immagini fisse del 3D (src/assets/barche/*.jpg) dalle barche 3D vere, a 2x e senza pulsanti.
// Serve Playwright con Chromium: `npm run build && npx astro preview`, poi in un altro terminale
// `node scripts/barche-immagini.cjs [indirizzo] [modi] [squadre]` (predefiniti: http://127.0.0.1:4321,
// ac75,ac40,confronto e nessuna squadra). Con le squadre (es. lr,nz,gb,al,fr,us,au) fa anche l'AC75 con i
// colori di ognuna: src/assets/barche/ac75-<squadra>.jpg, per la pagina Squadre e le pagine delle squadre.
const { chromium } = require('playwright');
const path = require('node:path');

(async () => {
  const [base = 'http://127.0.0.1:4321', modiS = 'ac75,ac40,confronto', squadreS = ''] = process.argv.slice(2);
  const out = path.join(__dirname, '..', 'src', 'assets', 'barche');
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const lavori = [...modiS.split(',').filter(Boolean).map(modo => ({ modo, file: modo })), ...squadreS.split(',').filter(Boolean).map(sq => ({ modo: 'ac75', sq, file: `ac75-${sq}` }))];
  for (const { modo, sq, file } of lavori) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(`${base}/squadre/barche/?b3q=high&b3shot`, { waitUntil: 'networkidle' });
    await (await page.$('[data-x3d]')).scrollIntoViewIfNeeded();
    await page.click(`[data-modo="${modo}"]`);
    if (sq) await page.selectOption('[data-x3d] [data-team]', sq);
    await page.click('[data-avvia]');
    await page.waitForTimeout(9000);
    await page.addStyleTag({ content: '.b3-hint,.b3-ctrl,.b3-label{display:none!important}' });
    // un tocco sulla scena ferma la rotazione automatica; poi la camera va subito all'inquadratura
    const st = await (await page.$('[data-x3d] [data-stage]')).boundingBox();
    await page.mouse.move(st.x + st.width / 2, st.y + st.height / 2); await page.mouse.down(); await page.mouse.up();
    await page.evaluate(() => window.__b3 && window.__b3.snap());
    await page.waitForTimeout(1900);
    // senza il bordo e gli angoli arrotondati del riquadro (3 + 1 px)
    await page.screenshot({ path: path.join(out, `${file}.jpg`), type: 'jpeg', quality: 90, clip: { x: st.x + 4, y: st.y + 4, width: st.width - 8, height: st.height - 8 }, timeout: 120000 });
    console.log(`${file}.jpg`);
    await ctx.close();
  }
  await browser.close();
})();
