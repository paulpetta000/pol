// I filtri della pagina /napoli/dove-mangiare/. Tutto nel browser: l'itinerario salvato sul telefono (stessa memoria
// del compositore, src/scripts/itinerari/memoria.ts) serve solo a proporre il giorno, le tappe vicine e il giorno
// a cui aggiungere un locale; non si manda a nessuno.
import { giornoSettimana, piuGiorni, dataLunga, ilGiorno, type GiornoSettimana } from '../lib/itinerari/date';
const maiuscola = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Locale = { id: string; zona: string; cucina: string[]; fascia: number; piatti: string[]; orari: (number[] | null)[]; durata: number; piedi: number[] };
type Dati = { locali: Locale[]; tappe: string[]; nomi: Record<string, string> };
type ItinerarioSalvato = { id: string; nome: string; data?: string; giorni: { tappe: string[]; gita?: string }[] };

const GIORNI = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];
const VICINO = 20;   // minuti a piedi: «vicino alle tappe»
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const ora = (m: number) => `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, '0')}`;
const oggi = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(new Date());
const oraDiAdesso = () => { const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()).split(':').map(Number); return h * 60 + m; };

if (document.getElementById('dm-dati')) avvia();

function avvia() {
  const D = JSON.parse($('dm-dati').textContent || '{}') as Dati;
  const form = $<HTMLFormElement>('dm-filtri');
  form.addEventListener('submit', e => e.preventDefault());
  const righe = [...document.querySelectorAll<HTMLLIElement>('.dm-locale')];
  const locale = new Map(D.locali.map(l => [l.id, l]));
  const cucine = new Set<string>(), fasce = new Set<number>();

  // l'itinerario attivo sul telefono, se c'è
  let it: ItinerarioSalvato | null = null;
  try {
    const a = JSON.parse(localStorage.getItem('itinerari-v1') || 'null');
    it = a?.elenco?.find((i: ItinerarioSalvato) => i.id === a.attivo) ?? a?.elenco?.[0] ?? null;
  } catch { /* niente memoria: si usa la pagina senza itinerario */ }
  // le tappe vere (non i locali già scelti): «vicino alle tappe» parte da quelle
  const giorniCitta = it ? it.giorni.map((g, k) => ({ k, tappe: (g.tappe || []).filter(id => D.tappe.includes(id) && !locale.has(id)), gita: !!g.gita })) : [];

  // «Dove»: le tappe di un giorno dell'itinerario
  const dove = $<HTMLSelectElement>('dm-dove');
  const conTappe = giorniCitta.filter(g => g.tappe.length && !g.gita);
  for (const g of conTappe) {
    const o = document.createElement('option');
    o.value = `giorno:${g.k}`;
    o.textContent = `Vicino alle tappe del giorno ${g.k + 1}${it!.data ? ` (${dataLunga(piuGiorni(it!.data, g.k))})` : ''}`;
    dove.append(o);
  }
  if (conTappe.length) $('dm-dove-aiuto').textContent = `Le tappe vengono dal tuo itinerario «${it!.nome}», salvato su questo telefono: «vicino» vuol dire a non più di ${VICINO} minuti a piedi.`;

  // a quale giorno aggiungere un locale (se l'itinerario ha più giorni)
  const aggGiorno = $<HTMLSelectElement>('dm-aggiungi-giorno');
  if (it && it.giorni.length > 1) {
    it.giorni.forEach((g, k) => {
      const o = document.createElement('option');
      o.value = String(k);
      o.textContent = `Giorno ${k + 1}${it!.data ? ` · ${dataLunga(piuGiorni(it!.data, k))}` : ''}${g.gita ? ' (gita)' : ''}`;
      aggGiorno.append(o);
    });
    $('dm-giorno-it').hidden = false;
  }

  // «Quando»: il giorno della settimana del primo giorno dell'itinerario, se ha la data
  const selGiorno = $<HTMLSelectElement>('dm-giorno'), campoOra = $<HTMLInputElement>('dm-ora');
  if (it?.data) selGiorno.value = giornoSettimana(it.data);
  $('dm-adesso').addEventListener('click', () => { selGiorno.value = giornoSettimana(oggi()); const m = oraDiAdesso(); campoOra.value = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; aggiorna(); });

  // le fasce di un giorno, con la coda di quelle del giorno prima che passano la mezzanotte (Chalet Ciro fino alle 3)
  const fasceDi = (l: Locale, k: number): number[] | null => {
    const f = l.orari[k], prima = l.orari[(k + 6) % 7] ?? [];
    const coda: number[] = [];
    for (let i = 0; i < prima.length; i += 2) if (prima[i + 1] > 24 * 60) coda.push(0, prima[i + 1] - 24 * 60);
    return f === null ? (coda.length ? coda : null) : [...coda, ...f];
  };
  // aperto quel giorno (e a quell'ora)? null = non si sa (orario non scritto)
  function aperto(l: Locale, g: number, t: number | null): { ok: boolean | null; testo: string } {
    const giorni = g >= 0 ? [g] : [0, 1, 2, 3, 4, 5, 6];
    let ignoto = false;
    for (const k of giorni) {
      const f = t == null ? l.orari[k] : fasceDi(l, k);
      if (f === null) { ignoto = true; continue; }
      if (!f.length) continue;
      if (t == null) return { ok: true, testo: '' };
      for (let i = 0; i < f.length; i += 2) if (t >= f[i] && (f[i + 1] === -1 || t < f[i + 1])) return { ok: true, testo: f[i + 1] === -1 ? '' : `Aperto fino alle ${ora(f[i + 1])}` };
    }
    if (ignoto) return { ok: null, testo: g >= 0 ? `${maiuscola(ilGiorno(GIORNI[g] as GiornoSettimana))} il locale non scrive l'orario` : '' };
    return { ok: false, testo: '' };
  }

  function aggiorna() {
    const piatto = $<HTMLSelectElement>('dm-piatto').value;
    const g = GIORNI.indexOf(selGiorno.value);
    const t = campoOra.value ? +campoOra.value.slice(0, 2) * 60 + +campoOra.value.slice(3, 5) : null;
    const [tipoDove, valDove] = dove.value.split(':');
    const tappe = tipoDove === 'giorno' ? giorniCitta[+valDove]?.tappe ?? [] : [];
    const distanze = new Map<string, { min: number; da: string }>();
    let visibili = 0;
    for (const li of righe) {
      const l = locale.get(li.dataset.id!)!;
      const note: string[] = [];
      let ok = (!piatto || l.piatti.includes(piatto)) &&
        (!cucine.size || l.cucina.some(c => cucine.has(c))) &&
        (!fasce.size || fasce.has(l.fascia)) &&
        (tipoDove !== 'zona' || l.zona === valDove);
      if (ok && tappe.length) {
        let best = { min: Infinity, da: '' };
        for (const id of tappe) {
          if (id === l.id) continue;
          const m = l.piedi[D.tappe.indexOf(id)];
          if (m < best.min) best = { min: m, da: id };
        }
        if (best.min <= VICINO) { distanze.set(l.id, best); note.push(`${best.min < 2 ? 'Accanto a' : `${best.min} minuti a piedi da`} ${D.nomi[best.da]}`); }
        else ok = false;
      }
      let avviso = false;
      if (ok && (g >= 0 || t != null)) {
        const a = aperto(l, g, t);
        if (a.ok === false) ok = false;
        else if (a.ok === null) { if (a.testo) note.push(a.testo); avviso = true; }
        else if (a.testo) note.push(a.testo);
      }
      li.hidden = !ok;
      const nota = li.querySelector<HTMLElement>('.dm-locale__nota')!;
      nota.hidden = !note.length;
      nota.textContent = note.join(' · ');
      nota.classList.toggle('dm-locale__nota--warn', avviso);
      if (ok) visibili++;
    }
    // vicino alle tappe: i più vicini prima
    if (tappe.length) {
      const el = $('dm-elenco');
      el.append(...[...righe].sort((a, b) => (distanze.get(a.dataset.id!)?.min ?? 1e6) - (distanze.get(b.dataset.id!)?.min ?? 1e6)));
    } else {
      const el = $('dm-elenco');
      el.append(...righe.slice().sort((a, b) => +a.dataset.n! - +b.dataset.n!));
    }
    document.querySelectorAll<HTMLElement>('[data-piatto-nota]').forEach(p => { p.hidden = p.dataset.piattoNota !== piatto; });
    $('dm-conta').textContent = visibili === 1 ? '1 locale' : `${visibili} locali`;
    $('dm-vuoto').hidden = visibili > 0;
    // «Aggiungi all'itinerario»: al giorno scelto (o a quello delle tappe vicine)
    const giornoAgg = +(aggGiorno.value || 0);
    document.querySelectorAll<HTMLAnchorElement>('[data-aggiungi]').forEach(a => { a.href = `/napoli/itinerari/?aggiungi=${a.dataset.aggiungi}${giornoAgg ? `&g=${giornoAgg}` : ''}`; });
  }
  righe.forEach((li, k) => { li.dataset.n = String(k); });

  form.querySelectorAll<HTMLButtonElement>('[data-cucina], [data-fascia]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.cucina) { const c = b.dataset.cucina; if (cucine.has(c)) cucine.delete(c); else cucine.add(c); b.setAttribute('aria-pressed', String(cucine.has(c))); }
    else { const f = +b.dataset.fascia!; if (fasce.has(f)) fasce.delete(f); else fasce.add(f); b.setAttribute('aria-pressed', String(fasce.has(f))); }
    aggiorna();
  }));
  // scegliendo le tappe di un giorno: i locali si aggiungono a quel giorno e «Quando» prende il suo giorno della settimana
  dove.addEventListener('change', () => {
    const [tipo, k] = dove.value.split(':');
    if (tipo !== 'giorno') return;
    if (!$('dm-giorno-it').hidden) aggGiorno.value = k;
    if (it?.data) selGiorno.value = giornoSettimana(piuGiorni(it.data, +k));
  });
  form.addEventListener('change', aggiorna);
  form.addEventListener('input', e => { if (e.target === campoOra) aggiorna(); });
  $('dm-togli').addEventListener('click', () => {
    cucine.clear(); fasce.clear();
    form.querySelectorAll('[aria-pressed]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $<HTMLSelectElement>('dm-piatto').value = ''; selGiorno.value = ''; campoOra.value = ''; dove.value = '';
    aggiorna();
  });
  aggiorna();
}
