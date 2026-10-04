// Scarica i dati per i tempi tra le tappe degli itinerari, una volta sola, in una cartella fuori dal sito:
// - strade, scale, ascensori, stazioni e linee di metro, treni e funicolari da OpenStreetMap
//   (Overpass API, dati © OpenStreetMap, licenza ODbL), nel riquadro della mappa;
// - le quote del terreno dal modello Copernicus GLO-30 (30 m, dati aperti dell'ESA/Unione europea),
//   letto solo nella parte che serve dal file pubblico su AWS (Registry of Open Data);
// - gli orari programmati degli autobus ANM, feed GTFS ufficiale (licenza IODL 2.0): anm-gtfs.zip.
//   Vale per un periodo (il file lo dice): per aggiornarlo, cancellare anm-gtfs.zip e rilanciare.
// Uso: node scripts/itinerari/scarica.mjs <cartella>   (poi: node scripts/itinerari/costruisci.mjs <cartella>)
import fs from 'node:fs';
import path from 'node:path';
import { fromUrl } from 'geotiff';
import { BOX } from '../mappa/riquadro.mjs';

const dir = process.argv[2];
if (!dir) throw new Error('Indica la cartella dove salvare i dati scaricati');
fs.mkdirSync(dir, { recursive: true });
const UA = 'napoli-a-vela-guide/1.0 (itinerari; napoliavela.guida@gmail.com)';

// ---------- OpenStreetMap ----------
const osmFile = path.join(dir, 'osm.json');
if (!fs.existsSync(osmFile)) {
  const bbox = `${BOX.s},${BOX.w},${BOX.n},${BOX.e}`;
  const query = `[out:json][timeout:300][maxsize:536870912][bbox:${bbox}];
(
  way[highway][highway!~"^(motorway|motorway_link|construction|proposed|abandoned|razed|raceway|bus_guideway|escape)$"];
  way[railway~"^(subway|funicular|light_rail|rail|narrow_gauge)$"];
  node[railway~"^(station|halt|stop|subway_entrance)$"];
  node[public_transport~"^(station|stop_position)$"];
  node[highway=elevator];
  node[entrance];
);
out body;
>;
out skel qt;
relation[route~"^(subway|funicular|light_rail|train)$"];
out body;`;
  console.log('OpenStreetMap: scarico strade, scale e linee (può volerci qualche minuto)…');
  // Se un server è occupato provo il successivo, poi riprovo dopo una pausa
  const SERVER = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
  let testo;
  for (let prova = 0; prova < 9 && !testo; prova++) {
    const server = SERVER[prova % SERVER.length];
    try {
      const res = await fetch(server, {
        method: 'POST',
        headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query)
      });
      if (res.ok) {
        const t = await res.text();
        // alcuni server di riserva hanno dati di mesi fa: se sono più vecchi di 14 giorni provo il successivo
        const base = t.slice(0, 2000).match(/"timestamp_osm_base":\s*"([^"]+)"/)?.[1];
        if (base && Date.now() - Date.parse(base) > 14 * 864e5 && prova < 8) console.log(`${server}: dati vecchi (${base}), provo un altro server`);
        else { testo = t; break; }
      }
      else console.log(`${server}: risposta ${res.status}, riprovo`);
    } catch (e) { console.log(`${server}: ${e.message}, riprovo`); }
    await new Promise(r => setTimeout(r, 15000 * (1 + Math.floor(prova / SERVER.length))));
  }
  if (!testo) throw new Error('Overpass: nessun server ha risposto');
  fs.writeFileSync(osmFile, testo);
  const j = JSON.parse(testo);
  console.log(`osm.json: ${(testo.length / 1e6).toFixed(1)} MB, ${j.elements.length} elementi, dati del ${j.osm3s?.timestamp_osm_base}`);
} else console.log('osm.json già scaricato');

// ---------- Quote del terreno (Copernicus GLO-30) ----------
const demFile = path.join(dir, 'quote.json');
if (!fs.existsSync(demFile)) {
  // Napoli sta tutta nel riquadro N40 E014 (da 40° a 41° nord, da 14° a 15° est)
  const url = 'https://copernicus-dem-30m.s3.amazonaws.com/Copernicus_DSM_COG_10_N40_00_E014_00_DEM/Copernicus_DSM_COG_10_N40_00_E014_00_DEM.tif';
  console.log('Copernicus GLO-30: leggo solo la parte del riquadro…');
  const tiff = await fromUrl(url, { headers: { 'User-Agent': UA } });
  const img = await tiff.getImage();
  const [x0, y1] = img.getOrigin();            // angolo in alto a sinistra (lon, lat)
  const [rx, ry] = img.getResolution();         // gradi per pixel (ry negativo)
  const W = img.getWidth(), H = img.getHeight();
  const M = 0.004;                              // un po' di margine intorno al riquadro
  const px = lon => Math.floor((lon - x0) / rx);
  const py = lat => Math.floor((lat - y1) / ry);
  const win = [Math.max(0, px(BOX.w - M)), Math.max(0, py(BOX.n + M)), Math.min(W, px(BOX.e + M) + 1), Math.min(H, py(BOX.s - M) + 1)];
  const [ras] = await img.readRasters({ window: win, samples: [0] });
  const w = win[2] - win[0], h = win[3] - win[1];
  // quote al decimetro: bastano e il file resta piccolo
  const quote = Array.from(ras, v => Math.round(v * 10) / 10);
  fs.writeFileSync(demFile, JSON.stringify({
    fonte: url, licenza: 'Copernicus DEM GLO-30 (© DLR e.V. 2010-2014 e © Airbus Defence and Space GmbH 2014-2018, fornito da ESA sotto il programma Copernicus); licenza d\'uso gratuita',
    // centro del primo pixel e passo in gradi
    lon0: x0 + (win[0] + 0.5) * rx, lat0: y1 + (win[1] + 0.5) * ry, dlon: rx, dlat: ry, w, h, quote
  }));
  console.log(`quote.json: ${w}×${h} punti, da ${quote.reduce((a, b) => Math.min(a, b))} a ${quote.reduce((a, b) => Math.max(a, b))} m`);
} else console.log('quote.json già scaricato');

// ---------- Autobus ANM (GTFS) ----------
const busFile = path.join(dir, 'anm-gtfs.zip');
if (!fs.existsSync(busFile)) {
  const url = 'https://www.anm.it/google/google-transit.zip';
  console.log('ANM: scarico il feed GTFS degli autobus…');
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`ANM GTFS: risposta ${res.status}`);
  const b = Buffer.from(await res.arrayBuffer());
  if (b.readUInt32LE(0) !== 0x04034b50) throw new Error('ANM GTFS: il file scaricato non è uno zip');
  fs.writeFileSync(busFile, b);
  console.log(`anm-gtfs.zip: ${(b.length / 1e6).toFixed(1)} MB`);
} else console.log('anm-gtfs.zip già scaricato');
console.log('FATTO');
