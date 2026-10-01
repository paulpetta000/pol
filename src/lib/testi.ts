// Testi discorsivi delle pagine (src/testi/<pagina>.yaml): controlli e trasformazione in HTML.
//
// Se una regola non è rispettata la build si ferma:
// 1. ogni blocco dichiara le schede (usa) o le fonti che usa, e le schede devono esistere con la loro fonte;
// 2. un'informazione non confermata per il 2027 (dalla stampa, da siti non ufficiali, non ancora uscita,
//    oppure com'era nel 2024 o nel 2026) va segnata nella frase con {?id-scheda}, e la frase deve dirlo
//    a parole («secondo la stampa», «non è ancora uscito», «nel 2024»…). Le confermate non hanno segni;
// 3. ogni blocco è «firmato» con le schede che c'erano quando è stato scritto (src/testi/firme.json):
//    se una scheda cambia, la build si ferma finché qualcuno non rilegge il testo e lo firma di nuovo
//    con `npm run testi:firma`.
//
// Scrittura dei testi: paragrafi separati da una riga vuota; «### Titoletto»; righe che cominciano
// con «- » per un elenco; **grassetto**, *corsivo*, [parole](/indirizzo/).
import { getEntry } from 'astro:content';
import { createHash } from 'node:crypto';
import { getFatti, getFonti, type Fatto, type Fonte } from './fatti';
import firmeSalvate from '../testi/firme.json';

type Cautela = 'stampa' | 'segnalato' | 'atteso' | 'anno';
export type Blocco = { nome: string; html: string; voci: { num: string; html: string }[]; fatti: Fatto[]; fonti: Fonte[]; cautela: boolean };
export type TestiPagina = { pagina: string; fatti: Fatto[]; fonti: Fonte[]; cautela: boolean; b: (nome: string) => Blocco };

// Impronta di una scheda: cambia se cambiano testo, stato o anno (stessa formula di scripts/testi-firma.mjs)
export const firma = (f: { testo: string; stato: string; anno: number }) =>
  createHash('sha1').update(JSON.stringify([f.testo, f.stato, f.anno])).digest('hex').slice(0, 10);

const cauteleDi = (f: Fatto): Cautela[] => [
  ...(f.data.stato !== 'confermato' ? [f.data.stato] : []),
  ...(f.data.anno !== 2027 ? ['anno' as const] : [])
];

// Parole che, nella frase, dicono che l'informazione non è confermata per il 2027
const PAROLE: Record<Cautela, (f: Fatto) => RegExp> = {
  stampa: () => /stampa|giornal|quotidian|second[oa] |riportan|scriv|si legge|indiscrezion|voc[ei] /i,
  segnalato: () => /siti non ufficiali|blog|segnalat|non ufficial/i,
  atteso: () => /non (è|sono) ancora|ancora non|non ancora|non si sa|non sappiamo|nessun|da (annunciare|pubblicare|decidere)|in attesa|quando usci/i,
  anno: f => (f.data.anno === 2024 ? /2024|Barcellona/ : new RegExp(String(f.data.anno)))
};
const SPIEGA: Record<Cautela, string> = {
  stampa: 'che viene dalla stampa («secondo la stampa», «scrivono i giornali»…)',
  segnalato: 'che viene da siti non ufficiali («secondo alcuni siti non ufficiali»…)',
  atteso: 'che non è ancora uscita («non è ancora stato annunciato»…)',
  anno: "a quale anno si riferisce («nel 2026», «nel 2024»…)"
};

const SEGNO = /\{\?([a-z0-9,\s-]+)\}/g;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Testo nudo, per cercare le parole di cautela
const nudo = (s: string) => s.replace(SEGNO, '').replace(/\*\*|\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

function inline(s: string) {
  return esc(s)
    .replace(SEGNO, '\u0001')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\s][^*]*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}"${/^https?:/.test(u) ? ' rel="noopener"' : ''}>${t}</a>`)
    // numero e unità restano sulla stessa riga
    .replace(/(\d) (m|km|kg|t|nodi|metri|minuti|secondi|ore|giorni|€|%)(?=[\s.,;:!?)]|$)/g, '$1 $2')
    .replace(/\u0001/g, '<sup class="cautela" aria-hidden="true">*</sup>');
}

type Pezzo = { tipo: 'h3' | 'h4' | 'p' | 'ul'; righe: string[] };
function pezzi(testo: string): Pezzo[] {
  return testo.trim().split(/\n\s*\n/).map(b => {
    const righe = b.split('\n').map(r => r.trim()).filter(Boolean);
    if (righe[0].startsWith('#### ')) return { tipo: 'h4', righe: [righe.join(' ').slice(5)] };
    if (righe[0].startsWith('### ')) return { tipo: 'h3', righe: [righe.join(' ').slice(4)] };
    if (righe.every(r => r.startsWith('- '))) return { tipo: 'ul', righe: righe.map(r => r.slice(2)) };
    return { tipo: 'p', righe: [righe.join(' ')] };
  });
}

const html = (p: Pezzo) =>
  p.tipo === 'ul' ? `<ul>${p.righe.map(r => `<li>${inline(r)}</li>`).join('')}</ul>` : `<${p.tipo}>${inline(p.righe[0])}</${p.tipo}>`;

// Controlla i segni di cautela di un testo. "intro" è la frase d'apertura che vale per tutta la sottosezione.
function controllaSegni(chiave: string, frasi: { testo: string; intro?: string }[], dichiarate: Map<string, Fatto>, errori: string[]) {
  const segnate = new Set<string>();
  for (const { testo, intro } of frasi) {
    for (const m of testo.matchAll(SEGNO)) {
      for (const id of m[1].split(',').map(x => x.trim()).filter(Boolean)) {
        const f = dichiarate.get(id);
        if (!f) { errori.push(`${chiave}: il segno {?${id}} indica una scheda che non è nell'elenco «usa» del blocco`); continue; }
        segnate.add(id);
        const c = cauteleDi(f);
        if (!c.length) { errori.push(`${chiave}: la scheda "${id}" è confermata per il 2027. Togli il segno {?${id}} e, se c'è, la cautela dalla frase`); continue; }
        for (const k of c) {
          const re = PAROLE[k](f);
          if (!re.test(nudo(testo)) && !(intro && re.test(nudo(intro)))) {
            errori.push(`${chiave}: la frase con {?${id}} deve dire ${SPIEGA[k]}. Frase: «${nudo(testo).slice(0, 90)}…»`);
          }
        }
      }
    }
  }
  for (const [id, f] of dichiarate) {
    if (cauteleDi(f).length && !segnate.has(id)) {
      errori.push(`${chiave}: la scheda "${id}" non è confermata per il 2027 (${[f.data.stato, f.data.anno].join(', ')}). Aggiungi {?${id}} nella frase che la usa e dillo a parole`);
    }
  }
}

// Carica i testi di una pagina, li controlla e li trasforma in HTML
export async function getTesti(pagina: string): Promise<TestiPagina> {
  const entry = await getEntry('testi', pagina);
  if (!entry) throw new Error(`Testi della pagina "${pagina}" non trovati: manca src/testi/${pagina}.yaml`);
  const firme = firmeSalvate as Record<string, Record<string, string>>;
  const errori: string[] = [];
  const blocchi = new Map<string, Blocco>();
  const tuttiFatti = new Map<string, Fatto>();
  const tutteFonti = new Map<string, Fonte>();

  for (const [nome, d] of Object.entries(entry.data)) {
    const chiave = `${pagina}#${nome}`;
    const f = await getFatti(d.usa.map(r => r.id));
    const fonti = await getFonti(d.fonti.map(r => r.id));
    // firme: il testo è stato riletto con queste versioni delle schede?
    for (const [id, x] of f) {
      if (firme[chiave]?.[id] !== firma(x.data)) {
        errori.push(`${chiave}: la scheda "${id}" è nuova o è cambiata dopo che il testo è stato scritto. Rileggi il testo, correggilo se serve, poi esegui npm run testi:firma`);
      }
    }
    // segni di cautela
    const frasi: { testo: string; intro?: string }[] = [];
    let intro: string | undefined;
    const ps = d.testo ? pezzi(d.testo) : [];
    for (const p of ps) {
      if (p.tipo === 'h3' || p.tipo === 'h4') { intro = undefined; continue; }
      const righe = p.righe;
      if (intro === undefined && p.tipo === 'p') intro = righe[0];
      for (const r of righe) frasi.push({ testo: r, intro });
    }
    for (const v of d.voci ?? []) frasi.push({ testo: v.testo });
    controllaSegni(chiave, frasi, f, errori);

    const cautela = frasi.some(x => x.testo.match(SEGNO));
    blocchi.set(nome, {
      nome,
      html: ps.map(html).join('\n'),
      voci: (d.voci ?? []).map(v => ({ num: v.num, html: inline(v.testo) })),
      fatti: [...f.values()],
      fonti,
      cautela
    });
    for (const [id, x] of f) tuttiFatti.set(id, x);
    for (const s of fonti) tutteFonti.set(s.id, s);
  }
  if (errori.length) throw new Error(`Testi da sistemare (${errori.length}):\n- ${errori.join('\n- ')}`);

  return {
    pagina,
    fatti: [...tuttiFatti.values()],
    fonti: [...tutteFonti.values()],
    cautela: [...blocchi.values()].some(b => b.cautela),
    b: nome => {
      const x = blocchi.get(nome);
      if (!x) throw new Error(`Blocco "${nome}" non trovato in src/testi/${pagina}.yaml`);
      return x;
    }
  };
}
