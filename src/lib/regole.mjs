// Regole dei testi e delle schede che non dipendono da Astro: le usano la build (src/lib/testi.ts,
// src/lib/fatti.ts), lo script della firma (scripts/testi-firma.mjs) e i test (test/, npm test).
// Qui c'è l'unica copia di ogni formula: se cambia, cambia per tutti.
import { createHash } from 'node:crypto';

/** @typedef {{ testo: string; stato: string; anno?: number; storico?: boolean; comeFatto?: boolean }} DatiScheda */
/** @typedef {{ id: string; data: DatiScheda }} Scheda */
/** @typedef {'stampa' | 'segnalato' | 'atteso' | 'anno'} Cautela */

// Impronta di una scheda: cambia se cambiano testo, stato o anno. Senza anno vale 2027, come nello schema.
/** @param {{ testo: string; stato: string; anno?: number }} f */
export const firma = f =>
  createHash('sha1').update(JSON.stringify([f.testo, f.stato, f.anno ?? 2027])).digest('hex').slice(0, 10);

// Perché una scheda non è confermata per il 2027 (vuoto se lo è). Una scheda con «comeFatto» (un fatto del passato
// letto solo sui giornali: premi delle guide, classifiche, recensioni) si scrive come fatto (decisione di Enrico,
// 06/10/2026): niente cautela, ma la build la elenca come «da verificare» sulla fonte originale (src/lib/fatti.ts).
/** @param {DatiScheda} d @returns {Cautela[]} */
export const cauteleDi = d => [
  .../** @type {Cautela[]} */ (d.stato !== 'confermato' && !d.comeFatto ? [d.stato] : []),
  .../** @type {Cautela[]} */ ((d.anno ?? 2027) !== 2027 && !d.storico ? ['anno'] : [])
];

// Parole che, nella frase, dicono che l'informazione non è confermata per il 2027. Per la stampa basta anche il
// condizionale («dovrebbe», «è previsto»), senza nominare il giornale (guida di stile, specifiche/stile-testi.md).
/** @type {Record<Cautela, (d: DatiScheda) => RegExp>} */
export const PAROLE = {
  stampa: () => /stampa|giornal|quotidian|second[oa] |riportan|scriv|si legge|indiscrezion|\bvoc[ei]\b|raccont|dovrebb|potrebb|sarebb|avrebb|(?:è|sono) previst|si parla di/i,
  segnalato: () => /siti non ufficiali|blog|segnalat|non ufficial/i,
  atteso: () => /non (?:\S+ ){0,2}ancora|ancora non|manca(?:no)? ancora|non si sa|non sappiamo|nessun|da (annunciare|pubblicare|decidere|confermare)|non confermat|in attesa|quando usci|non (?:è|sono) (?:\S+ )?uscit|appena esc|più avanti|(?:lo|la|li|le) dirann|aspettiamo/i,
  anno: d => (d.anno === 2024 ? /2024|Barcellona/ : new RegExp(String(d.anno)))
};
export const SPIEGA = {
  stampa: 'che viene dalla stampa («secondo la stampa», o con il condizionale: «dovrebbe», «è previsto»…)',
  segnalato: 'che viene da siti non ufficiali («secondo alcuni siti non ufficiali»…)',
  atteso: 'che non è ancora uscita («non è ancora stato annunciato», «lo diranno gli organizzatori più avanti»…)',
  anno: "a quale anno si riferisce («nel 2026», «nel 2024»…)"
};

// Una scheda mostrata così com'è (per esempio orari e prezzi delle tappe degli itinerari): se non è confermata
// per il 2027 il suo testo deve dirlo a parole. Restituisce le cautele (per il segno *) o un errore.
/** @param {Scheda} f @returns {{ segno: boolean; errore?: string }} */
export function cautelaScheda(f) {
  const c = cauteleDi(f.data);
  for (const k of c) {
    if (!PAROLE[k](f.data).test(f.data.testo)) return { segno: true, errore: `La scheda "${f.id}" non è confermata per il 2027: il suo testo deve dire ${SPIEGA[k]}` };
  }
  return { segno: c.length > 0 };
}

export const SEGNO = /\{\?([a-z0-9,\s-]+)\}/g;
// Testo nudo, per cercare le parole di cautela
/** @param {string} s */
export const nudo = s => s.replace(SEGNO, '').replace(/\*\*|\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

// Controlla i segni di cautela di un testo. "intro" è la frase d'apertura che vale per tutta la sottosezione.
/**
 * @param {string} chiave
 * @param {{ testo: string; intro?: string }[]} frasi
 * @param {Map<string, { data: DatiScheda }>} dichiarate
 * @param {string[]} errori
 */
export function controllaSegni(chiave, frasi, dichiarate, errori) {
  const segnate = new Set();
  for (const { testo, intro } of frasi) {
    for (const m of testo.matchAll(SEGNO)) {
      for (const id of m[1].split(',').map(x => x.trim()).filter(Boolean)) {
        const f = dichiarate.get(id);
        if (!f) { errori.push(`${chiave}: il segno {?${id}} indica una scheda che non è nell'elenco «usa» del blocco`); continue; }
        segnate.add(id);
        const c = cauteleDi(f.data);
        if (!c.length) {
          errori.push(f.data.comeFatto
            ? `${chiave}: la scheda "${id}" si scrive come fatto (comeFatto). Togli il segno {?${id}} e il «secondo…» dalla frase`
            : `${chiave}: la scheda "${id}" è confermata per il 2027. Togli il segno {?${id}} e, se c'è, la cautela dalla frase`);
          continue;
        }
        for (const k of c) {
          const re = PAROLE[k](f.data);
          if (!re.test(nudo(testo)) && !(intro && re.test(nudo(intro)))) {
            errori.push(`${chiave}: la frase con {?${id}} deve dire ${SPIEGA[k]}. Frase: «${nudo(testo).slice(0, 90)}…»`);
          }
        }
      }
    }
  }
  for (const [id, f] of dichiarate) {
    if (cauteleDi(f.data).length && !segnate.has(id)) {
      errori.push(`${chiave}: la scheda "${id}" non è confermata per il 2027 (${[f.data.stato, f.data.anno ?? 2027].join(', ')}). Aggiungi {?${id}} nella frase che la usa e dillo a parole`);
    }
  }
}

// Tipi di fonte, dal più affidabile. Enciclopedia, blog e altro sono «deboli»: da soli non bastano
// per dire che un'informazione è confermata (la build avvisa, ma non si ferma).
export const TIPI_FONTE = ['ufficiale', 'dati', 'stampa', 'enciclopedia', 'blog', 'altro'];
export const TIPI_DEBOLI = new Set(['enciclopedia', 'blog', 'altro']);
/** @param {string} stato @param {string[]} tipiFonti */
export const confermataConFontiDeboli = (stato, tipiFonti) =>
  stato === 'confermato' && tipiFonti.length > 0 && tipiFonti.every(t => TIPI_DEBOLI.has(t));

// Un testo diviso in pezzi: titoletti, paragrafi, elenchi (righe che cominciano con «- »). Lo usano la build
// (src/lib/testi.ts, per l'HTML) e i test (test/testi.test.mjs).
/** @typedef {{ tipo: 'h3' | 'h4' | 'p' | 'ul'; righe: string[] }} Pezzo */
/** @param {string} testo @returns {Pezzo[]} */
export function pezzi(testo) {
  return testo.trim().split(/\n\s*\n/).map(b => {
    const righe = b.split('\n').map(r => r.trim()).filter(Boolean);
    if (righe[0].startsWith('#### ')) return { tipo: 'h4', righe: [righe.join(' ').slice(5)] };
    if (righe[0].startsWith('### ')) return { tipo: 'h3', righe: [righe.join(' ').slice(4)] };
    if (righe.every(r => r.startsWith('- '))) return { tipo: 'ul', righe: righe.map(r => r.slice(2)) };
    return { tipo: 'p', righe: [righe.join(' ')] };
  });
}

// Le frasi da controllare di un blocco, ognuna con la frase d'apertura della sua sottosezione. Le voci di un
// elenco valgono con la frase d'apertura del blocco (per esempio «Nel 2026 funzionava così»).
/** @param {Pezzo[]} ps @param {{ testo: string }[]} [voci] */
export function frasiDaControllare(ps, voci = []) {
  /** @type {{ testo: string; intro?: string }[]} */
  const frasi = [];
  /** @type {string | undefined} */
  let intro;
  for (const p of ps) {
    if (p.tipo === 'h3' || p.tipo === 'h4') { intro = undefined; continue; }
    if (intro === undefined && p.tipo === 'p') intro = p.righe[0];
    for (const r of p.righe) frasi.push({ testo: r, intro });
  }
  const introVoci = ps.find(p => p.tipo === 'p')?.righe[0];
  for (const v of voci) frasi.push({ testo: v.testo, intro: introVoci });
  return frasi;
}

// Lista nera della guida di stile (specifiche/stile-testi.md, punto 9): parole da brochure, cliché e fonti citate
// dove non serve. La controlla npm test (test/testi.test.mjs), non la build.
export const LISTA_NERA = /\b(?:perl[ae]|gioiell[oi]|angolo di paradiso|imperdibil[ei]|da non perdere|mozzafiato|suggestiv[oaie]|pittoresc[oaih]\w*|vibrant[ei]|incastonat\w*|tuffo nel passato|dove il tempo si è fermato|deliziosi?[oaie]?|squisit[oaie]|esplosione di sapori|leccarsi i baffi|eccellenz[ae]|tappa obbligata|splendida cornice|ambiente accogliente|tradizione e innovazione|a breve|prossimamente|secondo il locale)\b/i;
