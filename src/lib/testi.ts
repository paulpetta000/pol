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
import { getFatti, getFonti, type Fatto, type Fonte } from './fatti';
import { firma, cautelaScheda as cautela, controllaSegni, nudo, SEGNO, pezzi, frasiDaControllare } from './regole.mjs';
import firmeSalvate from '../testi/firme.json';

export type Blocco = { nome: string; html: string; nudo: string; voci: { num: string; html: string }[]; fatti: Fatto[]; fonti: Fonte[]; cautela: boolean };
export type TestiPagina = { pagina: string; blocchi: string[]; fatti: Fatto[]; fonti: Fonte[]; cautela: boolean; b: (nome: string) => Blocco };

// Impronta delle schede e parole di cautela: le regole stanno in src/lib/regole.mjs (una sola copia,
// usata anche da scripts/testi-firma.mjs e dai test).
// Una scheda mostrata così com'è (orari e prezzi delle tappe): se non è confermata il testo deve dirlo.
export const cautelaScheda = (f: Fatto): { segno: boolean; errore?: string } => cautela(f);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inline(s: string) {
  return esc(s)
    .replace(SEGNO, '\u0001')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\s][^*]*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}"${/^https?:/.test(u) ? ' rel="noopener"' : ''}>${t}</a>`)
    // numero e unità restano sulla stessa riga
    .replace(/(\d) (m|km|kg|t|nodi|metri|minuti|secondi|ore|giorni|€|%)(?=[\s.,;:!?)]|$)/g, '$1 $2')
    // anche risultati e intervalli («7–2», «6,5–23», «22–24») non vanno a capo
    .replace(/(\d)–(\d)/g, '$1\u2060–\u2060$2')
    .replace(/\u0001/g, '<sup class="cautela" aria-hidden="true">*</sup>');
}

type Pezzo = ReturnType<typeof pezzi>[number];

const html = (p: Pezzo) =>
  p.tipo === 'ul' ? `<ul>${p.righe.map(r => `<li>${inline(r)}</li>`).join('')}</ul>` : `<${p.tipo}>${inline(p.righe[0])}</${p.tipo}>`;

// Carica i testi di una pagina, li controlla e li trasforma in HTML (una volta sola per build)
const giaCaricati = new Map<string, Promise<TestiPagina>>();
export function getTesti(pagina: string): Promise<TestiPagina> {
  if (import.meta.env.DEV) return carica(pagina);
  if (!giaCaricati.has(pagina)) giaCaricati.set(pagina, carica(pagina));
  return giaCaricati.get(pagina)!;
}

async function carica(pagina: string): Promise<TestiPagina> {
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
    const ps = d.testo ? pezzi(d.testo) : [];
    const frasi = frasiDaControllare(ps, d.voci ?? []);
    controllaSegni(chiave, frasi, f, errori);

    const cautela = frasi.some(x => x.testo.match(SEGNO));
    blocchi.set(nome, {
      nome,
      html: ps.map(html).join('\n'),
      // testo senza segni e senza formattazione (per i dati strutturati, per esempio le domande frequenti)
      nudo: ps.map(p => p.righe.map(nudo).join(' ')).join('\n\n'),
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
    blocchi: [...blocchi.keys()],
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
