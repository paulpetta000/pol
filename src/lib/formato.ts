// Date e testi in italiano

const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const MESI_BREVI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

// Le date sono giorni di calendario: le leggo sempre in UTC per non slittare di un giorno
export const d = (x: string | Date) => (typeof x === 'string' ? new Date(x + (x.length === 10 ? 'T00:00:00Z' : '')) : x);

export const dataLunga = (x: string | Date) => { const t = d(x); return `${t.getUTCDate()} ${MESI[t.getUTCMonth()]} ${t.getUTCFullYear()}`; };
export const dataBreve = (x: string | Date) => { const t = d(x); return `${String(t.getUTCDate()).padStart(2, '0')}/${String(t.getUTCMonth() + 1).padStart(2, '0')}/${t.getUTCFullYear()}`; };
export const giornoMese = (x: string | Date) => { const t = d(x); return `${t.getUTCDate()} ${MESI[t.getUTCMonth()]}`; };
export const giornoSettimana = (x: string | Date) => GIORNI[d(x).getUTCDay()];
export const mono = (x: string | Date) => { const t = d(x); return `${String(t.getUTCDate()).padStart(2, '0')}.${String(t.getUTCMonth() + 1).padStart(2, '0')}`; };
export const meseBreve = (x: string | Date) => MESI_BREVI[d(x).getUTCMonth()];

// "22–23 maggio", "26 giugno – 4 luglio"
export function intervallo(a: string, b?: string) {
  if (!b || a === b) return giornoMese(a);
  const x = d(a), y = d(b);
  if (x.getUTCMonth() === y.getUTCMonth()) return `${x.getUTCDate()}–${y.getUTCDate()} ${MESI[y.getUTCMonth()]}`;
  return `${giornoMese(a)} – ${giornoMese(b)}`;
}

export const giorniTra = (a: string | Date, b: string | Date) => Math.round((d(b).getTime() - d(a).getTime()) / 86400000);

// Mini-formattazione per le risposte: [testo](/link/) e **grassetto**. Il resto viene scappato.
export function testoRicco(s: string) {
  const esc = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
      const esterno = /^https?:/.test(u);
      return `<a href="${u}"${esterno ? ' rel="noopener"' : ''}>${t}</a>`;
    });
}

export const numero = (n: number) => n.toLocaleString('it-IT');
