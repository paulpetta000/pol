// Date e orari per gli itinerari: giorni della settimana, festivi italiani, formati. Senza dipendenze:
// lo usano sia la build sia lo script della pagina.
export type GiornoSettimana = 'lun' | 'mar' | 'mer' | 'gio' | 'ven' | 'sab' | 'dom';
const SETTIMANA: GiornoSettimana[] = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
export const NOMI_GIORNI: Record<GiornoSettimana, string> = { lun: 'lunedì', mar: 'martedì', mer: 'mercoledì', gio: 'giovedì', ven: 'venerdì', sab: 'sabato', dom: 'domenica' };
// con l'articolo: «il lunedì», «la domenica»
export const ilGiorno = (g: GiornoSettimana) => `${g === 'dom' ? 'la' : 'il'} ${NOMI_GIORNI[g]}`;
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

// Le date sono stringhe «AAAA-MM-GG», sempre in UTC: niente sorprese con l'ora legale
const utc = (iso: string) => { const [a, m, g] = iso.split('-').map(Number); return new Date(Date.UTC(a, m - 1, g)); };
const iso = (d: Date) => d.toISOString().slice(0, 10);
export const dataValida = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && iso(utc(s)) === s;
export const piuGiorni = (data: string, n: number) => { const d = utc(data); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
export const giornoSettimana = (data: string) => SETTIMANA[utc(data).getUTCDay()];

// Pasqua (calendario gregoriano, algoritmo di Meeus/Jones/Butcher)
function pasqua(anno: number) {
  const a = anno % 19, b = Math.floor(anno / 100), c = anno % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mese = Math.floor((h + l - 7 * m + 114) / 31), giorno = ((h + l - 7 * m + 114) % 31) + 1;
  return iso(new Date(Date.UTC(anno, mese - 1, giorno)));
}
// Festivi nazionali, più San Gennaro (19 settembre), patrono di Napoli
export function festivo(data: string) {
  const anno = +data.slice(0, 4), md = data.slice(5);
  if (['01-01', '01-06', '04-25', '05-01', '06-02', '08-15', '09-19', '11-01', '12-08', '12-25', '12-26'].includes(md)) return true;
  return data === piuGiorni(pasqua(anno), 1) || data === pasqua(anno);
}
// Come girano i mezzi quel giorno: feriale, sabato o domenica (anche i festivi)
export const tipoGiorno = (data?: string): 'feriale' | 'sabato' | 'domenica' => {
  if (!data) return 'feriale';
  const g = giornoSettimana(data);
  return g === 'dom' || festivo(data) ? 'domenica' : g === 'sab' ? 'sabato' : 'feriale';
};

export const dataLunga = (data: string, conAnno = false) => {
  const d = utc(data);
  return `${NOMI_GIORNI[giornoSettimana(data)]} ${d.getUTCDate()} ${MESI[d.getUTCMonth()]}${conAnno ? ' ' + d.getUTCFullYear() : ''}`;
};
export const dataBreve = (data: string) => { const d = utc(data); return `${d.getUTCDate()} ${MESI[d.getUTCMonth()]}`; };
// minuti dalla mezzanotte → «9:30»
export const ora = (min: number) => { const m = Math.round(min); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; };
// minuti → «45 min», «1 h», «2 h 15»
export const durata = (min: number) => {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}`;
};
// minuti → «45 minuti», «un'ora e 15 minuti» (per le frasi e i lettori di schermo)
export const durataParole = (min: number) => {
  const m = Math.round(min), h = Math.floor(m / 60), r = m % 60;
  const ore = h === 0 ? '' : h === 1 ? "un'ora" : `${h} ore`;
  const minuti = r === 0 ? '' : r === 1 ? 'un minuto' : `${r} minuti`;
  return [ore, minuti].filter(Boolean).join(' e ') || '0 minuti';
};
// «HH:MM» → minuti
export const minutiDa = (s: string) => { const m = /^(\d{1,2}):(\d{2})$/.exec(s); return m ? +m[1] * 60 + +m[2] : NaN; };
