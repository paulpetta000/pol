// Generatore di calendari .ics (RFC 5545): eventi di un giorno intero, senza orari (non ancora pubblicati)
import type { Evento } from '../data/eventi';
import { SITO } from '../config/sito';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const giorno = (s: string) => s.replace(/-/g, '');
const dopo = (s: string) => { const t = new Date(s + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + 1); return t.toISOString().slice(0, 10).replace(/-/g, ''); };
// Righe lunghe spezzate a 75 byte come chiede lo standard
const piega = (line: string) => {
  const out: string[] = []; let cur = '';
  for (const ch of line) {
    if (Buffer.byteLength(cur + ch) > 73) { out.push(cur); cur = ' ' + ch; } else cur += ch;
  }
  out.push(cur);
  return out.join('\r\n');
};

export function calendario(nome: string, eventi: (Evento & { condizionale?: string })[], perChi = '', chiave = 'ac38') {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const righe = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${SITO.nome}//Guida 2027//IT`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(nome)}`, `X-WR-CALDESC:${esc(`${SITO.nome}, guida non ufficiale all'America's Cup di Napoli: ${SITO.url}/calendario/`)}`, 'X-WR-TIMEZONE:Europe/Rome', 'REFRESH-INTERVAL;VALUE=DURATION:P1D', 'X-PUBLISHED-TTL:P1D'
  ];
  for (const e of eventi) {
    const titolo = e.condizionale ? `${e.titolo} (${e.condizionale})` : e.titolo;
    const desc = `${e.testo}${e.riserva ? ` Giorno di riserva: ${e.riserva.split('-').reverse().join('/')}.` : ''}\nOrari non ancora pubblicati.${perChi ? `\n${perChi}` : ''}\nGuida non ufficiale: ${SITO.url}/calendario/`;
    righe.push(
      'BEGIN:VEVENT',
      `UID:${e.id}-${chiave}@${SITO.sigla}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${giorno(e.inizio)}`,
      `DTEND;VALUE=DATE:${dopo(e.riserva || e.fine)}`,
      `SUMMARY:${esc(titolo)}`,
      `DESCRIPTION:${esc(desc)}`,
      'LOCATION:Golfo di Napoli',
      `URL:${SITO.url}/calendario/`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  }
  righe.push('END:VCALENDAR');
  return righe.map(piega).join('\r\n') + '\r\n';
}
