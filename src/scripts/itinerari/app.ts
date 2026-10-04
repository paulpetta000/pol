// Il compositore degli itinerari (pagina /napoli/itinerari/). Tutto avviene nel browser: gli itinerari restano
// nella memoria del telefono (memoria.ts) e si mandano con un link che porta tutto dopo il «#» (link.ts).
// Il calcolo delle giornate è in src/lib/itinerari/calcolo.ts; la mappa si carica solo quando serve (mappa.ts).
import { spacchetta, spacchettaVivo, aggiungiScenari, type Pacco, type PaccoVivo, type PaccoScenari } from '../../lib/itinerari/pacco';
import { calcolaGiorno, ordinePiuCorto, tappaDi, dataDelGiorno, minuti, scenarioDi, orarioLocale } from '../../lib/itinerari/calcolo';
import type { Adesso } from '../../lib/itinerari/tipi';
import { codifica, decodifica, nuovoItinerario, giornoVuoto, uguali, MAX_GIORNI, MAX_TAPPE, MAX_NOME } from '../../lib/itinerari/link';
import { dataLunga, dataBreve, ora, durata, durataParole, piuGiorni, giornoSettimana, NOMI_GIORNI, ilGiorno, dataValida, minutiDa } from '../../lib/itinerari/date';
import { icona } from '../../lib/itinerari/icone';
import { leggi, scrivi, quandoCambia, type Archivio } from './memoria';
import { trascinabile } from './trascina';
import type { Avviso, Giorno, Itinerario, Risultato, Voce } from '../../lib/itinerari/tipi';

type VoceTappa = Extract<Voce, { tipo: 'tappa' }>;
type VoceTratto = Extract<Voce, { tipo: 'tratto' }>;
type Pronto = { id: string; nome: string; evento: boolean; giorni: Giorno[] };

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const maiuscola = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const km = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`);
const piano = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const oggi = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(new Date());
// l'ora di adesso a Napoli, in minuti dalla mezzanotte
const oraDiAdesso = () => { const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()).split(':').map(Number); return h * 60 + m; };
// distanza in metri tra due punti vicini
const metriTra = (a: [number, number], b: [number, number]) => { const k = Math.cos(((a[0] + b[0]) / 2) * Math.PI / 180); return Math.hypot((a[0] - b[0]) * 111195, (a[1] - b[1]) * 111195 * k); };
const movimentoRidotto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

if (document.getElementById('compositore')) avvia();

function avvia() {
  const C = spacchetta(JSON.parse($('it-dati').textContent || '{}') as Pacco);
  const PRONTI = JSON.parse($('it-pronti').textContent || '[]') as Pronto[];
  const E = C.evento;
  const eventoFinito = !!E && oggi() > E.ultimo;
  const nome = (id: string) => (E && id === E.id ? E.nome : tappaDi(C, id)?.nome ?? id);
  const breve = (id: string) => (E && id === E.id ? 'le regate' : tappaDi(C, id)?.breve ?? id);

  // ---------- stato ----------
  // un itinerario nuovo parte con la data di oggi (la dà l'orologio del telefono, senza permessi): si cambia con «Cambia»
  const nuovo = (nome: string, giorni?: Giorno[]): Itinerario => ({ ...nuovoItinerario(nome, giorni), data: oggi() });
  let A: Archivio = leggi(C) ?? { attivo: '', elenco: [] };
  if (!A.elenco.length) { const x = nuovo('Il mio itinerario'); A = { attivo: x.id, elenco: [x] }; }
  let giorno = 0;
  let vista: 'giornata' | 'mappa' = 'giornata';
  let scelto: string | null = null;
  let avvisatoMemoria = false;
  // la tappa appena aggiunta o spostata: per un attimo si vede che cosa è cambiato
  let evidenzia: { id: string; t: number } | null = null;
  const segna = (id: string) => { evidenzia = { id, t: Date.now() }; };
  const it = () => A.elenco.find(i => i.id === A.attivo) ?? A.elenco[0];
  const largo = matchMedia('(min-width: 900px)');

  // ---------- dal vivo: ora del telefono, posizione, orari veri dei bus (specifiche/bus-orari-veri.md) ----------
  // La posizione resta in questa pagina: non va a nessun server e non si salva. Serve solo a capire vicino a quale tappa sei.
  let posizione: { ll: [number, number]; precisione: number } | null = null;
  let guardia: number | null = null;
  let posizioneNegata = false;
  // il GPS parte da solo solo se il telefono ha già dato il permesso; altrimenti serve il tocco sul pannello
  let permessoPosizione: PermissionState | null = null;
  let toccato = false;
  navigator.permissions?.query({ name: 'geolocation' }).then(p => {
    permessoPosizione = p.state;
    p.onchange = () => { permessoPosizione = p.state; disegna(); };
    if (p.state === 'granted' && it().posizione === 'si') disegna();
  }).catch(() => { /* il browser non lo dice: si chiede con il pannello */ });
  const posizioneAttiva = (x: Itinerario) => x.posizione === 'si' && !posizioneNegata && (toccato || permessoPosizione === 'granted');
  const VICINO = 200;   // metri
  const oggiNelGiorno = (x: Itinerario, g: number) => !!x.data && dataDelGiorno(x, g) === oggi() && !x.giorni[g].gita;
  function tappaQui(x: Itinerario, g: number): string | undefined {
    if (!posizione || posizione.precisione > VICINO) return undefined;
    const G = x.giorni[g];
    let meglio: string | undefined, md = VICINO;
    for (const id of G.tappe) {
      if (G.fatte?.includes(id)) continue;
      const t = tappaDi(C, id);
      if (!t?.ll) continue;
      const d = metriTra(posizione.ll, t.ll);
      if (d <= md) { md = d; meglio = id; }
    }
    return meglio;
  }
  // il momento per il calcolo del giorno g: solo se quel giorno è oggi
  function adessoPer(x: Itinerario, g: number): Adesso | undefined {
    if (!oggiNelGiorno(x, g)) return undefined;
    const qui = posizioneAttiva(x) ? tappaQui(x, g) : undefined;
    return { data: oggi(), ora: oraDiAdesso(), ...(qui ? { qui } : {}) };
  }
  function guardaPosizione() {
    if (guardia != null || posizioneNegata || !('geolocation' in navigator)) return;
    guardia = navigator.geolocation.watchPosition(p => {
      posizione = { ll: [p.coords.latitude, p.coords.longitude], precisione: p.coords.accuracy };
      aggiornaDalVivo();
    }, e => {
      if (e.code === e.PERMISSION_DENIED) {
        posizioneNegata = true; fermaPosizione();
        toast('Il telefono non ha dato la posizione: calcolo dall\'ultima tappa fatta.');
        disegna();
      }
    }, { enableHighAccuracy: true, maximumAge: 60000, timeout: 30000 });
  }
  function fermaPosizione() { if (guardia != null) navigator.geolocation.clearWatch(guardia); guardia = null; posizione = null; }
  // la posizione si guarda solo mentre la pagina è aperta, il giorno stesso e con il permesso
  function curaPosizione() {
    const x = it();
    if (posizioneAttiva(x) && oggiNelGiorno(x, giorno) && document.visibilityState === 'visible') guardaPosizione();
    else fermaPosizione();
  }
  // ogni mezzo minuto (e quando torni sulla pagina) si ricalcola il giorno di oggi, se è cambiato qualcosa
  let firmaVivo = '';
  // quello che, cambiando, chiede di ridisegnare: il momento (ora e tappa dove sei) e lo stato della posizione
  const statoPosizione = () => (posizione ? (posizione.precisione > VICINO ? 'imprecisa' : 'ok') : 'nessuna');
  const firmaDi = (x: Itinerario, g: number) => JSON.stringify([adessoPer(x, g), statoPosizione()]);
  // non si ridisegna mentre trascini, con un dialogo aperto o con il dito (o il fuoco) sugli avvisi in cima
  const occupato = () => linea.classList.contains('it-linea--trascina') || !!document.querySelector('dialog[open]') || !!document.activeElement?.closest('#it-avvisi, #it-riepilogo');
  function aggiornaDalVivo() {
    const x = it();
    curaPosizione();
    if (!oggiNelGiorno(x, giorno) || occupato()) return;
    if (firmaDi(x, giorno) === firmaVivo) return;
    disegnaGiorno(x, true);
  }
  setInterval(aggiornaDalVivo, 30000);
  document.addEventListener('visibilitychange', () => { curaPosizione(); if (document.visibilityState === 'visible') aggiornaDalVivo(); });
  // i tempi di sabato, domenica, festivi e «solo a piedi» arrivano dopo l'apertura (e restano salvati per l'uso senza rete)
  fetch('/napoli/itinerari/scenari.json').then(r => (r.ok ? r.json() : null)).then((p: PaccoScenari | null) => {
    if (!p) return;
    aggiungiScenari(C, p);
    memoOrdine.clear();
    if (occupato()) setTimeout(() => disegna(), 5000); else disegna();
  }).catch(() => { /* senza, per questi giorni valgono i tempi del feriale */ });
  // gli orari veri dei bus arrivano dopo (e restano salvati per l'uso senza rete)
  fetch('/napoli/itinerari/partenze.json').then(r => (r.ok ? r.json() : null)).then((p: PaccoVivo | null) => {
    if (!p) return;
    C.vivo = spacchettaVivo(p);
    memoOrdine.clear();
    if (occupato()) setTimeout(() => disegna(), 5000); else disegna();
  }).catch(() => { /* senza orari veri resta l'attesa media */ });

  function salva() {
    if (scrivi(A) || avvisatoMemoria) return;
    avvisatoMemoria = true;
    toast('Questo browser non salva i dati: l\'itinerario resta finché la pagina è aperta. Per tenerlo, mandalo con «Condividi».');
  }

  // Ogni modifica passa da qui: copia, cambia, salva, ridisegna. Con «annulla» compare il pulsante Annulla.
  function cambia(fn: (x: Itinerario) => void, o: { annulla?: string; annuncia?: string } = {}) {
    const prima = structuredClone(it());
    const x = structuredClone(it());
    fn(x);
    // «Fatto» vale solo per le tappe che sono ancora nel giorno
    for (const g of x.giorni) if (g.fatte) { g.fatte = g.fatte.filter(id => g.tappe.includes(id)); if (!g.fatte.length) delete g.fatte; }
    x.modificato = Date.now();
    A.elenco = A.elenco.map(i => (i.id === x.id ? x : i));
    giorno = Math.min(giorno, x.giorni.length - 1);
    salva();
    disegna();
    if (o.annuncia) annuncia(o.annuncia);
    if (o.annulla) toast(o.annulla, 'Annulla', () => {
      A.elenco = A.elenco.map(i => (i.id === prima.id ? prima : i));
      giorno = Math.min(giorno, prima.giorni.length - 1);
      salva(); disegna(); annuncia('Modifica annullata');
    });
  }

  // ---------- annunci per i lettori di schermo e avvisi in basso ----------
  let timerAnnuncio = 0;
  function annuncia(t: string) {
    const r = $('it-annunci');
    r.textContent = '';
    clearTimeout(timerAnnuncio);
    timerAnnuncio = window.setTimeout(() => { r.textContent = t; }, 120);
  }
  let timerToast = 0;
  function toast(testo: string, azione?: string, fn?: () => void) {
    const t = $('it-toast'), b = $<HTMLButtonElement>('it-toast-azione');
    $('it-toast-testo').textContent = testo;
    b.hidden = !azione;
    b.textContent = azione ?? '';
    b.onclick = () => { nascondi(); fn?.(); };
    t.hidden = false;
    const nascondi = () => { t.hidden = true; clearTimeout(timerToast); };
    const parti = () => { clearTimeout(timerToast); timerToast = window.setTimeout(nascondi, azione ? 7000 : 4500); };
    t.onmouseenter = () => clearTimeout(timerToast);
    t.onmouseleave = parti;
    t.onfocusin = () => clearTimeout(timerToast);
    t.onfocusout = parti;
    parti();
  }

  // ---------- disegno ----------
  const linea = $<HTMLOListElement>('it-linea');
  const vuoto = $('it-vuoto');
  const gitaBox = $('it-gita-giorno');
  let ultimo: Risultato | null = null;
  const memoOrdine = new Map<string, ReturnType<typeof ordinePiuCorto>>();

  function disegna() {
    const x = it();
    if (giorno >= x.giorni.length) giorno = x.giorni.length - 1;
    disegnaCapo(x);
    disegnaSchede(x);
    disegnaGiorno(x);
    if (!$('it-pannello').hasAttribute('open')) return;
    preparaElenco(false);
  }

  function disegnaCapo(x: Itinerario) {
    $('it-nome-testo').textContent = x.nome;
    const conta = $('it-elenco-conta');
    conta.hidden = A.elenco.length < 2;
    conta.textContent = String(A.elenco.length);
    $('it-elenco-apri').setAttribute('aria-label', `I miei itinerari (${A.elenco.length})`);
  }

  function disegnaSchede(x: Itinerario) {
    const box = $('it-schede-giorni');
    box.innerHTML = x.giorni.map((g, k) => `<button type="button" role="tab" id="it-tab-${k}" class="it-tab${g.gita ? ' it-tab--gita' : ''}" aria-selected="${k === giorno}" aria-controls="it-pannello-giorno" tabindex="${k === giorno ? 0 : -1}" aria-label="Giorno ${k + 1}${g.gita ? `, gita: ${esc(nome(g.gita))}` : ''}">${g.gita ? icona(tappaDi(C, g.gita)?.zona === 'isole' ? 'nave' : 'treno', 20) : k + 1}</button>`).join('');
    $<HTMLButtonElement>('it-giorno-piu').hidden = x.giorni.length >= MAX_GIORNI;
  }

  // auto: l'aggiornamento di ogni minuto (dal vivo): la mappa non si ridisegna, così resta dove l'hai lasciata
  let htmlAvvisi = '', htmlLinea = '';
  function disegnaGiorno(x: Itinerario, auto = false) {
    const G = x.giorni[giorno];
    const data = dataDelGiorno(x, giorno);
    $('it-giorno-h').textContent = `Giorno ${giorno + 1}`;
    $('it-quando').textContent = `${data ? maiuscola(dataLunga(data)) : 'Senza data'} · dalle ${ora(G.inizio)} alle ${ora(G.fine)}`;
    linea.setAttribute('aria-label', `Tappe del giorno ${giorno + 1}`);
    const fuoco = ricordaFuoco();
    const adesso = adessoPer(x, giorno);
    firmaVivo = firmaDi(x, giorno);
    const r = calcolaGiorno(C, x, giorno, adesso);
    if (r.vivo) $('it-quando').textContent += ` · oggi: ricalcolato alle ${ora(adesso!.ora)} con l'ora del telefono`;
    ultimo = r;
    curaPosizione();
    const pieno = !G.gita && G.tappe.length > 0;
    linea.hidden = !pieno;
    vuoto.hidden = pieno || !!G.gita;
    gitaBox.hidden = !G.gita;
    $('it-aggiungi').closest<HTMLElement>('.it-barra')!.hidden = !pieno;
    disegnaRiepilogo(x, G, r);
    disegnaAvvisi(x, G, r, data);
    if (G.gita) disegnaGita(G.gita);
    else if (pieno) disegnaLinea(x, G, r, data);
    else disegnaVuoto(x, G);
    if (!auto) disegnaVista();
    rimettiFuoco(fuoco);
  }

  function disegnaRiepilogo(x: Itinerario, G: Giorno, r: Risultato) {
    const box = $('it-riepilogo');
    box.hidden = !G.gita && !G.tappe.length;
    if (box.hidden) return;
    if (G.gita) {
      const t = tappaDi(C, G.gita)!;
      $('it-riepilogo-ore').textContent = 'Gita di un giorno';
      $('it-riepilogo-sotto').textContent = `${t.nome} · si parte da ${t.partenza}`;
      return;
    }
    if (r.tutteFatte) {
      $('it-riepilogo-ore').textContent = 'Hai fatto tutte le tappe';
      $('it-riepilogo-sotto').textContent = `${r.n} ${r.n === 1 ? 'tappa' : 'tappe'} di oggi segnate «Fatto»`;
      return;
    }
    $('it-riepilogo-ore').innerHTML = `${ora(r.inizio)}${icona('freccia', 22)}<span class="visually-hidden"> fino alle </span>${ora(r.fine)}`;
    const parti = [`${r.n} ${r.n === 1 ? 'tappa' : 'tappe'}`, `${durata(r.visite)} di visite`];
    if (r.n > 1) parti.push(`${durata(r.spostamenti)} di spostamenti`);
    if (r.metri > 0) parti.push(`${km(r.metri)} a piedi`);
    if (x.piedi) parti.push('solo a piedi');
    $('it-riepilogo-sotto').textContent = parti.join(' · ');
  }

  // Avvisi in cima alla giornata: giornata piena, regate, ordine più corto
  function disegnaAvvisi(x: Itinerario, G: Giorno, r: Risultato, data?: string) {
    const out: string[] = [];
    const avviso = (titolo: string, testo: string, azioni: string, tipo = 'it-avviso') =>
      `<div class="${tipo}" role="status"><p class="${tipo}__titolo">${icona(tipo === 'it-avviso' ? 'attenzione' : 'ordina', 20)}<span>${titolo}</span></p><p>${testo}</p>${azioni ? `<div class="it-avviso__azioni">${azioni}</div>` : ''}</div>`;
    const prossimo = giorno + 1 < x.giorni.length && !x.giorni[giorno + 1].gita ? `nel giorno ${giorno + 2}` : 'in un giorno nuovo';
    for (const a of r.avvisi) {
      if (a.tipo === 'piena') {
        const ultima = r.voci.filter((v): v is VoceTappa => v.tipo === 'tappa').pop()!;
        out.push(avviso(`Il giorno ${giorno + 1} è pieno`, `Con ${esc(breve(ultima.id))} finisci alle ${ora(a.fine)}, dopo le ${ora(a.limite)}.`,
          (a.daSpostare.length && (x.giorni.length < MAX_GIORNI || prossimo !== 'in un giorno nuovo') ? `<button type="button" class="it-btn it-btn--primario" data-az="sposta-oltre">Sposta ${a.daSpostare.length === 1 ? esc(breve(a.daSpostare[0])) : `le ultime ${a.daSpostare.length} tappe`} ${prossimo}</button>` : '') +
          (a.fine <= 23 * 60 + 30 ? `<button type="button" class="it-btn it-btn--contorno" data-az="allunga">Finisci alle ${ora(Math.ceil(a.fine / 30) * 30)}</button>` : '')));
      }
      if (a.tipo === 'evento-assente' && E) {
        if (!data) out.push(avviso('Le regate dipendono dalla data', `Si corrono solo in alcuni giorni, dal ${dataBreve(E.primo)} al ${dataBreve(E.ultimo)} 2027: scegli la data di questo giorno.`, '<button type="button" class="it-btn it-btn--primario" data-az="cambia">Scegli la data</button><button type="button" class="it-btn it-btn--contorno" data-az="togli-evento">Togli le regate</button>'));
        else out.push(avviso(`Il ${dataBreve(data)} non ci sono regate in calendario`, `Le regate si corrono solo in alcuni giorni, dal ${dataBreve(E.primo)} al ${dataBreve(E.ultimo)} 2027.`, '<button type="button" class="it-btn it-btn--primario" data-az="togli-evento">Togli le regate</button><button type="button" class="it-btn it-btn--contorno" data-az="cambia">Cambia la data</button>'));
      }
      if (a.tipo === 'vicino') {
        const nomi = a.prima.map(id => esc(breve(id)));
        const elenco = nomi.length > 1 ? `${nomi.slice(0, -1).join(', ')} e ${nomi[nomi.length - 1]}` : nomi[0];
        out.push(avviso(`Sei a ${esc(breve(a.id))}`, `Calcolo gli orari da qui. ${maiuscola(elenco)} ${a.prima.length > 1 ? 'non sono segnate' : 'non è segnata'} «Fatto», quindi ${a.prima.length > 1 ? 'le metto' : 'la metto'} dopo: se ${a.prima.length > 1 ? 'le hai già fatte, segnale' : 'l\'hai già fatta, segnala'}.`, ''));
      }
      if (a.tipo === 'evento-tardi' && E) {
        const nuovo = Math.max(5 * 60, Math.floor((G.inizio - a.ritardo) / 15) * 15);
        out.push(avviso('Arrivi tardi alle regate', `Con queste tappe arrivi sul lungomare ${durataParole(a.ritardo)} dopo le ${ora(E.inizio)}.`, nuovo < G.inizio ? `<button type="button" class="it-btn it-btn--primario" data-az="anticipa" data-ora="${nuovo}">Comincia alle ${ora(nuovo)}</button>` : ''));
      }
    }
    // dal vivo: il pannello per la posizione (una volta per itinerario), o un link piccolo per riattivarla
    if (r.vivo && 'geolocation' in navigator) {
      const da = r.voci.some(v => v.tipo === 'tappa' && v.fatta) ? 'dall\'ultima tappa fatta' : 'dall\'ora di adesso';
      // il pannello compare quando nella giornata c'è almeno una tappa (non alla prima apertura del sito)
      if (!G.tappe.length) { /* niente */ }
      else if (!x.posizione || (x.posizione === 'si' && !posizioneAttiva(x) && !posizioneNegata)) out.push(pannelloPosizione());
      else if (x.posizione === 'no' || posizioneNegata) out.push(`<p class="it-posizione-spenta">Posizione non usata: calcolo ${da}. <button type="button" class="it-link" data-az="gps-si">Usa la mia posizione</button></p>`);
      else if (!posizione) out.push('<p class="it-posizione-spenta">Cerco la posizione del telefono…</p>');
      else if (posizione.precisione > VICINO) out.push(`<p class="it-posizione-spenta">La posizione del telefono è poco precisa: calcolo ${da}.</p>`);
      else if (!tappaQui(x, giorno)) out.push(`<p class="it-posizione-spenta">Non sei vicino a nessuna tappa che manca: calcolo ${da}.</p>`);
    }
    const fatte = r.vivo ? G.fatte ?? [] : [];
    if (!G.gita && G.tappe.length - fatte.length >= 3) {
      const chiave = JSON.stringify([G.tappe, fatte, data, G.inizio, x.piedi, !!C.vivo]);
      if (!memoOrdine.has(chiave)) memoOrdine.set(chiave, ordinePiuCorto(C, senzaFatte(x, giorno, fatte), giorno));
      const o = memoOrdine.get(chiave);
      if (o) out.push(avviso('C\'è un ordine più corto', `Cambiando l'ordine risparmi ${durataParole(o.risparmio)} di spostamenti. La prima tappa resta la stessa.`, '<button type="button" class="it-btn it-btn--contorno" data-az="ordina">Usa l\'ordine più corto</button>', 'it-consiglio'));
    }
    // si riscrive solo se cambia: i lettori di schermo non rileggono gli stessi avvisi ogni minuto
    const html = out.join('');
    if (html !== htmlAvvisi) { $('it-avvisi').innerHTML = html; htmlAvvisi = html; }
  }

  // il pannello della posizione: prima del permesso del telefono, con quello che succede ai dati, in parole semplici
  function pannelloPosizione() {
    return `<div class="it-posizione" role="region" aria-labelledby="it-posizione-h">
      <p class="it-posizione__titolo" id="it-posizione-h">${icona('mappa', 22)}<span>Oggi ti seguo passo passo</span></p>
      <p>Se mi lasci usare la posizione del telefono, capisco vicino a quale tappa sei e ricalcolo gli orari da lì.</p>
      <ul class="it-posizione__lista">
        <li>${icona('ok', 18)}<span>La posizione <b>resta sul tuo telefono</b>: questa pagina non la manda a noi né a nessun altro. Per trovarla il telefono usa i suoi servizi di localizzazione, come per le mappe.</span></li>
        <li>${icona('ok', 18)}<span><b>Non la salviamo</b>: sparisce quando chiudi la pagina.</span></li>
        <li>${icona('ok', 18)}<span>Niente cookie e niente pubblicità. Puoi toglierla quando vuoi dalle impostazioni del telefono.</span></li>
      </ul>
      <div class="it-avviso__azioni"><button type="button" class="it-btn it-btn--primario" data-az="gps-si">Usa la mia posizione</button><button type="button" class="it-btn it-btn--contorno" data-az="gps-no">No, grazie</button></div>
      <p class="it-posizione__piccolo">Dopo il tocco il telefono ti chiederà il permesso. Più dettagli nella pagina <a href="/privacy/">privacy</a>.</p>
    </div>`;
  }
  // l'itinerario senza le tappe fatte (per l'ordine più corto dal vivo)
  const senzaFatte = (x: Itinerario, g: number, fatte: string[]) => (fatte.length ? { ...x, giorni: x.giorni.map((G, k) => (k === g ? { ...G, tappe: G.tappe.filter(id => !fatte.includes(id)) } : G)) } : x);

  function testoTratto(v: VoceTratto, orariVeri = false) {
    const linee = v.mezzi.map(m => C.linee[m] ?? m);
    const asc = v.ascensori.length ? ` (${v.ascensori.map(esc).join(', ')})` : '';
    // il bus è meno puntuale: lo diciamo sul tratto; con gli orari veri anche fermata e ora di partenza
    const corse = v.corse?.length ? ` <span class="it-tratto__corse">${v.corse.map(c => `${esc(C.linee[c.linea] ?? c.linea)} da ${esc(c.da)} alle ${ora(c.ora)}`).join(', poi ')}</span>` : '';
    // gli orari sono programmati (non in tempo reale); fuori dall'orario ANM (per esempio nel 2027) è un'attesa media
    const nota = v.mezzi.some(m => m.startsWith('B')) ? ` <span class="it-tratto__nota">· ${orariVeri ? 'orario ANM, può tardare' : 'attesa media, può tardare'}</span>` : '';
    const scartato = v.scartato ? ` <span class="it-tratto__corse">${esc(C.linee[v.scartato.linea] ?? v.scartato.linea)} ${v.scartato.ora >= 0 ? `passa alle ${ora(v.scartato.ora)}: conviene andare così` : v.scartato.ora === -2 ? 'oggi non passa' : 'a quest\'ora non passa più'}</span>` : '';
    return (linee.length ? `${durata(v.min)} · a piedi e ${linee.join(' e ')}${asc}${nota}` : `${durata(v.min)} a piedi${asc}`) + corse + scartato;
  }
  const tipoTratto = (v: VoceTratto) => (v.mezzi.some(m => m.startsWith('B')) ? 'bus' : v.mezzi[0]?.startsWith('F') ? 'funi' : v.mezzi.length ? 'metro' : 'piedi');

  function disegnaLinea(x: Itinerario, G: Giorno, r: Risultato, data?: string) {
    const lontane = new Map(r.avvisi.filter((a): a is Extract<Avviso, { tipo: 'lontana' }> => a.tipo === 'lontana').map(a => [a.id, a]));
    const tappe = r.voci.filter((v): v is VoceTappa => v.tipo === 'tappa');
    const nFatte = tappe.filter(v => v.fatta).length;
    let primoOltre = true;
    const html = tappe.map((v, k) => {
      const prima = r.voci[r.voci.indexOf(v) - 1];
      const tratto = prima?.tipo === 'tratto' ? prima : null;
      const ev = !!E && v.id === E.id;
      const t = ev ? null : tappaDi(C, v.id)!;
      const sel = scelto === v.id;
      const note: string[] = [];
      const nota = (testo: string, warn = false) => note.push(`<span class="it-blocco__nota${warn ? ' it-blocco__nota--warn' : ''}">${warn ? icona('attenzione', 16) : ''}<span>${testo}</span></span>`);
      if (v.chiusa && data) nota(`Chiuso ${ilGiorno(giornoSettimana(data))}: scegli un altro giorno`, true);
      if (v.chiusaOra) nota(v.chiusaOra.chiude != null ? `Chiude alle ${ora(v.chiusaOra.chiude % 1440)}, prima della fine del pasto` : v.chiusaOra.apre != null ? `A quest'ora è chiuso: apre alle ${ora(v.chiusaOra.apre)}` : `A quest'ora è chiuso${data ? '' : ' (o lo è tutti i giorni)'}`, true);
      if (ev && v.ritardo) nota(`Arrivi alle ${ora(v.inizio)}, ${durataParole(v.ritardo)} dopo l'inizio`, true);
      if (ev && E && data && E.giorni[data]) nota(`${esc(E.giorni[data].titolo)}${E.giorni[data].possibile ? ', se la sfida non è già finita' : ''}${E.giorni[data].riserva ? ', giorno di riserva' : ''}`);
      if (t?.fine) nota(v.indietro ? `Al contrario: parti da ${esc(t.fine)}` : `Fino a ${esc(t.fine)}`);
      if (t?.prenotazione === 'obbligatoria') nota(t.categoria ? 'Solo prenotando' : 'Si entra solo prenotando');
      if (t?.avviso === 'chiuso-in-parte') nota('In parte chiuso per lavori');
      let oltre = '';
      if (v.oltre != null && primoOltre) {
        primoOltre = false;
        oltre = `<div class="it-blocco__limite" aria-hidden="true"></div><p class="it-blocco__oltre"><b>${ora(G.fine)}</b>fine della giornata: da qui sei ${durataParole(v.oltre)} oltre</p>`;
      }
      const lon = lontane.get(v.id);
      const dove = lon ? (lon.giorno < x.giorni.length ? `nel giorno ${lon.giorno + 1}` : 'in un giorno nuovo') : '';
      const foto = ev ? `<span class="it-foto__vuota">${icona('vela', 28)}</span>` : t!.foto ? `<img src="${t!.foto}" alt="" width="56" height="56" decoding="async">` : `<span class="it-foto__vuota">${icona(t!.categoria ? 'piatto' : t!.generi[0] === 'passeggiata' ? 'piedi' : 'museo', 26)}</span>`;
      const meta = v.fatta ? 'Fatta' : v.inCorso ? `In corso · fino alle ${ora(v.fine)}` : ev ? `dalle ${ora(v.inizio)} · circa ${durata(v.fine - v.inizio)}` : `${durata(v.fine - v.inizio)} · fino alle ${ora(v.fine)}`;
      // dal vivo: «Fatto» con un tocco, sulle tappe che mancano; sulle fatte si toglie dal menu della tappa
      const fatto = r.vivo && !v.fatta ? `<button type="button" class="it-fatto" data-az="fatto">${icona('ok', 18)}Fatto<span class="visually-hidden">: ${esc(breve(v.id))}</span></button>` : '';
      const nuova = evidenzia?.id === v.id && Date.now() - evidenzia.t < 800;
      return `<li class="it-voce${nuova ? ' it-voce--nuova' : ''}" data-id="${v.id}">
        ${tratto ? `<p class="it-tratto it-tratto--${tipoTratto(tratto)}">${icona({ funi: 'funicolare', metro: 'metro', bus: 'bus', piedi: 'piedi' }[tipoTratto(tratto)], 18)}<span>${testoTratto(tratto, r.orariVeri)}</span></p>` : ''}
        ${v.attesa ? `<p class="it-attesa">${durata(v.attesa)} liberi prima delle regate: pranzo e tempo per trovare posto</p>` : ''}
        <span class="it-ora" aria-hidden="true">${v.fatta ? icona('ok', 18) : ora(v.inizio)}</span>
        <div class="it-blocco${sel ? ' it-blocco--scelto' : ''}${lon ? ' it-blocco--attenzione' : ''}${v.oltre != null ? ' it-blocco--oltre' : ''}${ev ? ' it-blocco--evento' : ''}${v.fatta ? ' it-blocco--fatta' : ''}${v.inCorso ? ' it-blocco--incorso' : ''}">
          <div class="it-blocco__riga">
            <button type="button" class="it-blocco__corpo" data-az="scegli" aria-expanded="${sel}" aria-controls="it-az-${v.id}">
              <span class="it-foto">${foto}<span class="it-piastrella" aria-hidden="true">${v.n}</span></span>
              <span class="it-blocco__testo"><span class="visually-hidden">Tappa ${v.n}, ${v.fatta ? 'fatta' : `alle ${ora(v.inizio)}`}: </span><span class="it-blocco__nome">${esc(nome(v.id))}</span><span class="it-blocco__meta">${meta}</span>${note.join('')}</span>
            </button>
            <button type="button" class="it-maniglia" data-az="maniglia"${v.fatta ? ' hidden' : ''} aria-label="Sposta ${esc(breve(v.id))}" aria-describedby="it-aiuto-maniglia" data-tip="Trascina per spostare">${icona('maniglia')}</button>
          </div>
          ${ev ? '<div class="it-evento-nota"></div>' : ''}
          ${fatto}
          ${oltre}
          <div class="it-blocco__azioni" id="it-az-${v.id}"${sel ? '' : ' hidden'}>
            <span class="it-blocco__gruppo"><button type="button" data-az="su"${k === 0 || v.fatta || k === nFatte ? ' disabled' : ''}>${icona('su', 20)}Su<span class="visually-hidden"> ${esc(breve(v.id))}</span></button>
            <button type="button" data-az="giu"${k === tappe.length - 1 || v.fatta ? ' disabled' : ''}>${icona('giu', 20)}Giù<span class="visually-hidden"> ${esc(breve(v.id))}</span></button></span><span class="it-blocco__gruppo">
            ${ev ? '' : `<button type="button" data-az="scheda" aria-haspopup="dialog">${icona('info', 20)}Scheda<span class="visually-hidden"> di ${esc(breve(v.id))}</span></button>`}
            ${v.fatta ? `<button type="button" data-az="fatto">${icona('ricomincia', 20)}Non fatta<span class="visually-hidden"> ${esc(breve(v.id))}</span></button>` : ''}
            <button type="button" class="it-togli" data-az="togli">${icona('x', 20)}Togli<span class="visually-hidden"> ${esc(breve(v.id))}</span></button></span>
          </div>
        </div>
        ${lon ? `<div class="it-avviso it-voce__avviso" role="status"><p class="it-avviso__titolo">${icona('attenzione', 20)}<span>${esc(maiuscola(breve(v.id)))} è lontana dalle altre tappe</span></p><p>Anche nel punto migliore della giornata aggiunge circa ${lon.extra} minuti di spostamenti. Vuoi metterla in un altro giorno?</p><div class="it-avviso__azioni">${lon.giorno < MAX_GIORNI ? `<button type="button" class="it-btn it-btn--primario" data-az="sposta-lontana" data-giorno="${lon.giorno}">Sposta ${dove}</button>` : ''}<button type="button" class="it-btn it-btn--contorno" data-az="lascia">Lascia qui</button></div></div>` : ''}
      </li>`;
    }).join('');
    if (html === htmlLinea && linea.childElementCount) return;
    linea.innerHTML = html;
    htmlLinea = html;
    // il testo delle regate (orari non ancora usciti) viene dal suo modello, controllato dalla build
    const notaEv = linea.querySelector('.it-evento-nota');
    if (notaEv) notaEv.replaceWith(($<HTMLTemplateElement>('it-t-regate')).content.cloneNode(true));
  }

  function disegnaVuoto(x: Itinerario, G: Giorno) {
    $('it-vuoto-h').textContent = `Il giorno ${giorno + 1} è vuoto`;
    const ore: string[] = [];
    for (let h = Math.floor(G.inizio / 60); h <= Math.ceil(G.fine / 60) && ore.length < 16; h++) ore.push(`<div class="it-vuoto__riga"><span>${h}:00</span></div>`);
    $('it-vuoto-ore').innerHTML = ore.join('');
    // la giornata di regata solo se le date possono essere giorni di regata
    const data = dataDelGiorno(x, giorno);
    const regataPossibile = !!E && !eventoFinito && (!data || (data >= E.primo && data <= E.ultimo));
    vuoto.querySelectorAll<HTMLElement>('[data-pronto="regata"]').forEach(b => { b.closest('li')!.hidden = !regataPossibile; });
  }

  function disegnaGita(id: string) {
    const t = tappaDi(C, id)!;
    gitaBox.innerHTML = `<div class="it-gita"><div class="it-gita__testa"><h3>${esc(t.nome)}</h3><p>${t.durata > 240 ? 'Giornata intera' : 'Mezza giornata'} · si parte da ${esc(t.partenza ?? '')}</p></div><div class="it-gita__scheda"></div><div class="it-gita__azioni"><button type="button" class="it-btn it-btn--pericolo" data-az="togli-gita">${icona('x', 20)}Togli la gita</button></div></div>`;
    gitaBox.querySelector('.it-gita__scheda')!.replaceWith(($<HTMLTemplateElement>(`it-t-${id}`)).content.cloneNode(true));
  }

  // ---------- fuoco: dopo un ridisegno torna sullo stesso comando della stessa tappa ----------
  function ricordaFuoco() {
    const a = document.activeElement as HTMLElement | null;
    if (!a || !linea.contains(a)) return null;
    return { id: a.closest<HTMLElement>('.it-voce')?.dataset.id, az: a.dataset.az };
  }
  function rimettiFuoco(f: { id?: string; az?: string } | null) {
    if (!f?.id) return;
    const voce = linea.querySelector<HTMLElement>(`.it-voce[data-id="${CSS.escape(f.id)}"]`);
    let el = voce?.querySelector<HTMLButtonElement>(`[data-az="${f.az}"]`);
    if (el?.disabled) el = voce?.querySelector<HTMLButtonElement>(f.az === 'su' ? '[data-az="giu"]' : '[data-az="su"]');
    if (el && !el.disabled && !el.closest('[hidden]')) el.focus();
    else voce?.querySelector<HTMLElement>('[data-az="scegli"]')?.focus();
  }

  // ---------- azioni sulla giornata ----------
  // l'ordine delle tappe come lo vedi (dal vivo: le fatte in cima, la tappa dove sei per prima)
  const ordineVisto = () => (ultimo ? ultimo.voci.filter((v): v is VoceTappa => v.tipo === 'tappa').map(v => v.id) : it().giorni[giorno].tappe);
  const quanteFatte = () => (ultimo ? ultimo.voci.filter(v => v.tipo === 'tappa' && v.fatta).length : 0);
  // sposta una tappa nella posizione a dell'ordine che vedi; le tappe che mancano restano sotto le fatte
  function sposta(id: string, a: number) {
    const vista = ordineVisto();
    const da = vista.indexOf(id);
    if (da < 0 || da < quanteFatte()) return;
    a = Math.max(quanteFatte(), a);
    if (a >= vista.length || a === da) return;
    segna(id);
    const nuovo = [...vista]; nuovo.splice(da, 1); nuovo.splice(a, 0, id);
    cambia(x => { x.giorni[giorno].tappe = nuovo; }, { annuncia: `${maiuscola(breve(id))}: ora è la tappa ${a + 1} di ${vista.length}` });
  }
  function togli(id: string) {
    const G = it().giorni[giorno];
    const k = G.tappe.indexOf(id);
    if (k < 0) return;
    if (scelto === id) scelto = null;
    cambia(x => { const g = x.giorni[giorno]; g.tappe.splice(k, 1); g.ok = g.ok?.filter(o => o !== id); }, { annulla: `Hai tolto ${breve(id)}` });
    const dopo = linea.querySelectorAll<HTMLElement>('[data-az="scegli"]')[Math.min(k, it().giorni[giorno].tappe.length - 1)];
    (dopo ?? $('it-aggiungi')).focus();
  }
  // Mette delle tappe in un altro giorno (o in un giorno nuovo, se serve) e passa a quel giorno
  function spostaInGiorno(ids: string[], dest: number) {
    const x = it();
    if (dest >= x.giorni.length && x.giorni.length >= MAX_GIORNI) { toast(`Al massimo ${MAX_GIORNI} giorni`); return; }
    const da = giorno;
    cambia(y => {
      if (dest >= y.giorni.length) { y.giorni.push(giornoVuoto(y.giorni[da].inizio, y.giorni[da].fine)); dest = y.giorni.length - 1; }
      if (y.giorni[dest].gita) { y.giorni.splice(dest, 0, giornoVuoto(y.giorni[da].inizio, y.giorni[da].fine)); }
      y.giorni[da].tappe = y.giorni[da].tappe.filter(t => !ids.includes(t));
      y.giorni[dest].tappe = [...y.giorni[dest].tappe.filter(t => !ids.includes(t)), ...ids].slice(0, MAX_TAPPE);
    }, { annulla: `${ids.length === 1 ? maiuscola(breve(ids[0])) + ' è' : 'Le tappe sono'} nel giorno ${dest + 1}` });
  }
  function aggiungiTappa(id: string) {
    const x = it();
    const G = x.giorni[giorno];
    if (G.tappe.includes(id)) { togliDaPannello(id); return; }
    if (G.gita) {
      // un giorno di gita non si mescola con le tappe in città: va in un giorno nuovo
      if (x.giorni.length >= MAX_GIORNI) { toast(`Al massimo ${MAX_GIORNI} giorni`); return; }
      cambia(y => { y.giorni.splice(giorno + 1, 0, { ...giornoVuoto(G.inizio, G.fine), tappe: [id] }); });
      giorno += 1;
      disegna();
      annuncia(`${maiuscola(breve(id))} è nel giorno ${giorno + 1}: il giorno ${giorno} è una gita`);
      return;
    }
    if (G.tappe.length >= MAX_TAPPE) { toast(`Al massimo ${MAX_TAPPE} tappe in un giorno`); return; }
    segna(id);
    cambia(y => { y.giorni[giorno].tappe.push(id); }, { annuncia: `Aggiunta ${breve(id)}: tappa ${G.tappe.length + 1} del giorno ${giorno + 1}` });
  }
  function togliDaPannello(id: string) {
    cambia(y => { const g = y.giorni[giorno]; g.tappe = g.tappe.filter(t => t !== id); g.ok = g.ok?.filter(o => o !== id); }, { annuncia: `Tolta ${breve(id)}` });
  }
  function aggiungiGita(id: string) {
    const x = it();
    const G = x.giorni[giorno];
    if (G.gita === id) { toast(`${tappaDi(C, id)!.breve} è già nel giorno ${giorno + 1}`); return; }
    if (!G.gita && !G.tappe.length) {
      cambia(y => { y.giorni[giorno].gita = id; y.giorni[giorno].tappe = []; }, { annuncia: `Gita a ${breve(id)} nel giorno ${giorno + 1}` });
      return;
    }
    if (x.giorni.length >= MAX_GIORNI) { toast(`Al massimo ${MAX_GIORNI} giorni`); return; }
    cambia(y => { y.giorni.push({ ...giornoVuoto(G.inizio, G.fine), gita: id }); });
    giorno = it().giorni.length - 1;
    disegna();
    toast(`${tappaDi(C, id)!.breve} è nel giorno ${giorno + 1}: una gita occupa un giorno a parte`);
  }
  function togliGita() {
    cambia(y => { delete y.giorni[giorno].gita; }, { annulla: 'Hai tolto la gita' });
  }

  // clic nella giornata (delega)
  $('it-pannello-giorno').addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button[data-az]');
    if (!b || b.disabled) return;
    const id = b.closest<HTMLElement>('.it-voce')?.dataset.id;
    const az = b.dataset.az;
    const x = it(), G = x.giorni[giorno];
    if (az === 'scegli' && id) {
      scelto = scelto === id ? null : id;
      disegnaGiorno(x);
      linea.querySelector<HTMLElement>(`.it-voce[data-id="${CSS.escape(id)}"] [data-az="scegli"]`)?.focus();
    } else if (az === 'su' && id) sposta(id, ordineVisto().indexOf(id) - 1);
    else if (az === 'giu' && id) sposta(id, ordineVisto().indexOf(id) + 1);
    else if (az === 'togli' && id) togli(id);
    else if (az === 'scheda' && id) apriScheda(id, b);
    else if (az === 'lascia' && id) cambia(y => { const g = y.giorni[giorno]; g.ok = [...(g.ok ?? []), id]; }, { annuncia: `${maiuscola(breve(id))} resta nel giorno ${giorno + 1}` });
    else if (az === 'sposta-lontana' && id) spostaInGiorno([id], Number(b.dataset.giorno));
    else if (az === 'sposta-oltre') {
      const a = ultimo?.avvisi.find((v): v is Extract<Avviso, { tipo: 'piena' }> => v.tipo === 'piena');
      if (a?.daSpostare.length) spostaInGiorno(a.daSpostare, giorno + 1 < x.giorni.length && !x.giorni[giorno + 1].gita ? giorno + 1 : x.giorni.length);
    } else if (az === 'allunga' && ultimo) {
      const fine = Math.min(24 * 60 - 15, Math.ceil(ultimo.fine / 30) * 30);
      cambia(y => { y.giorni[giorno].fine = fine; }, { annuncia: `Il giorno ${giorno + 1} ora finisce alle ${ora(fine)}` });
    } else if (az === 'ordina') {
      const fatte = ultimo?.vivo ? G.fatte ?? [] : [];
      const o = ordinePiuCorto(C, senzaFatte(x, giorno, fatte), giorno);
      if (o) cambia(y => { y.giorni[giorno].tappe = [...G.tappe.filter(id => fatte.includes(id)), ...o.ordine]; }, { annulla: `Ordine cambiato: ${durataParole(o.risparmio)} in meno` });
    } else if (az === 'fatto' && id) {
      const era = !!G.fatte?.includes(id);
      cambia(y => { const g = y.giorni[giorno]; g.fatte = era ? (g.fatte ?? []).filter(t => t !== id) : [...(g.fatte ?? []), id]; if (!g.fatte.length) delete g.fatte; }, { annuncia: era ? `${maiuscola(breve(id))}: tolto «Fatto»` : `${maiuscola(breve(id))} fatta: ricalcolo gli orari da adesso` });
    } else if (az === 'gps-si') {
      posizioneNegata = false; toccato = true;
      cambia(y => { y.posizione = 'si'; }, { annuncia: 'Uso la posizione del telefono, solo su questa pagina' });
    } else if (az === 'gps-no') {
      cambia(y => { y.posizione = 'no'; }, { annuncia: 'Non uso la posizione' });
    } else if (az === 'togli-evento' && E) cambia(y => { y.giorni[giorno].tappe = y.giorni[giorno].tappe.filter(t => t !== E.id); }, { annulla: 'Hai tolto le regate' });
    else if (az === 'anticipa') cambia(y => { y.giorni[giorno].inizio = Number(b.dataset.ora); }, { annuncia: `Il giorno ${giorno + 1} ora comincia alle ${ora(Number(b.dataset.ora))}` });
    else if (az === 'cambia') apriImpostazioni(b);
    else if (az === 'togli-gita') togliGita();
  });
  // «Aggiungi una tappa» (in basso e nel giorno vuoto) e «scegli una gita»
  $('compositore').addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLElement>('[data-azione]');
    if (b?.dataset.azione === 'aggiungi') apriPannello('citta', b);
    else if (b?.dataset.azione === 'gite') apriPannello('gita', b);
  });
  // frecce sulla maniglia: sposta la tappa
  linea.addEventListener('keydown', e => {
    const b = (e.target as Element).closest<HTMLElement>('[data-az="maniglia"]');
    if (!b || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    e.preventDefault();
    const id = b.closest<HTMLElement>('.it-voce')!.dataset.id!;
    const k = it().giorni[giorno].tappe.indexOf(id);
    sposta(id, e.key === 'ArrowUp' ? k - 1 : k + 1);
  });
  trascinabile(linea, (da, a) => {
    const id = ordineVisto()[da];
    if (id) sposta(id, a);
  });

  // ---------- giorni ----------
  $('it-schede-giorni').addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLElement>('[role="tab"]');
    if (!b) return;
    vaiGiorno(Number(b.id.replace('it-tab-', '')));
  });
  $('it-schede-giorni').addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const n = it().giorni.length;
    const k = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (giorno + (e.key === 'ArrowLeft' ? -1 : 1) + n) % n;
    vaiGiorno(k);
    $(`it-tab-${k}`)?.focus();
  });
  function vaiGiorno(k: number) {
    if (k === giorno) return;
    giorno = k;
    scelto = null;
    disegna();
    annuncia(`Giorno ${k + 1}`);
  }
  $('it-giorno-piu').addEventListener('click', () => {
    const x = it();
    if (x.giorni.length >= MAX_GIORNI) return;
    const G = x.giorni[giorno];
    cambia(y => { y.giorni.push(giornoVuoto(G.inizio, G.fine)); });
    giorno = it().giorni.length - 1;
    disegna();
    annuncia(`Aggiunto il giorno ${giorno + 1}`);
    $(`it-tab-${giorno}`)?.focus();
  });

  // ---------- nome dell'itinerario: si cambia sul posto ----------
  const nomeVedi = $<HTMLButtonElement>('it-nome-vedi'), nomeCampo = $<HTMLInputElement>('it-nome-campo');
  let nomePrima = '';
  nomeVedi.addEventListener('click', () => {
    nomePrima = it().nome;
    nomeCampo.value = nomePrima;
    nomeCampo.hidden = false;
    nomeVedi.hidden = true;
    nomeCampo.focus();
    nomeCampo.select();
  });
  const chiudiNome = (salvaNome: boolean, rifuoca: boolean) => {
    if (nomeCampo.hidden) return;
    const v = nomeCampo.value.trim().slice(0, MAX_NOME);
    nomeCampo.hidden = true;
    nomeVedi.hidden = false;
    if (salvaNome && v && v !== nomePrima) cambia(y => { y.nome = v; }, { annuncia: `Nome cambiato: ${v}` });
    if (rifuoca) nomeVedi.focus();
  };
  nomeCampo.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); chiudiNome(true, true); }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); chiudiNome(false, true); }
  });
  nomeCampo.addEventListener('blur', () => chiudiNome(true, false));

  // ---------- finestre ----------
  // chiusura con un tocco fuori (dove «closedby» non c'è ancora) e con i pulsanti «Chiudi»
  document.querySelectorAll<HTMLDialogElement>('.it-foglio').forEach(d => {
    d.addEventListener('click', e => {
      if ((e.target as Element).closest('[data-chiudi]')) { d.close(); return; }
      if (!('closedBy' in HTMLDialogElement.prototype) && e.target === d) {
        const r = d.getBoundingClientRect();
        if (e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) d.close();
      }
    });
    // se il comando che l'ha aperta non c'è più (la giornata è stata ridisegnata), il fuoco va in un posto sensato
    d.addEventListener('close', () => {
      requestAnimationFrame(() => {
        if (document.activeElement && document.activeElement !== document.body) return;
        const corpo = scelto ? linea.querySelector<HTMLElement>(`.it-voce[data-id="${CSS.escape(scelto)}"] [data-az="scegli"]`) : null;
        (corpo ?? (linea.hidden ? $('it-giorno-h') : $('it-aggiungi'))).focus();
      });
    });
  });
  $('it-giorno-h').tabIndex = -1;

  // ---------- pannello «Aggiungi una tappa» ----------
  const pannello = $<HTMLDialogElement>('it-pannello');
  const righe = [...pannello.querySelectorAll<HTMLLIElement>('.it-solo-citta .it-scelta')];
  const righeLocali = [...pannello.querySelectorAll<HTMLLIElement>('.it-solo-mangiare .it-scelta')];
  const filtri = new Set<string>();
  const filtriLocali = { pasto: new Set<string>(), cucina: new Set<string>() };
  type TipoPannello = 'citta' | 'gita' | 'mangiare';
  let tipoPannello: TipoPannello = 'citta';
  function apriPannello(tipo: TipoPannello = 'citta', _da?: HTMLElement) {
    impostaTipo(tipo);
    preparaElenco(true);
    pannello.showModal();
    pannello.querySelector<HTMLElement>('.it-foglio__corpo')!.scrollTop = 0;
  }
  function impostaTipo(tipo: TipoPannello) {
    tipoPannello = tipo;
    pannello.querySelectorAll<HTMLButtonElement>('.it-segmento').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tipo === tipo)));
    pannello.querySelector<HTMLElement>('.it-solo-citta')!.hidden = tipo !== 'citta';
    pannello.querySelector<HTMLElement>('.it-solo-mangiare')!.hidden = tipo !== 'mangiare';
    pannello.querySelector<HTMLElement>('.it-solo-gite')!.hidden = tipo !== 'gita';
    $('it-pannello-h').textContent = tipo === 'citta' ? 'Aggiungi una tappa' : tipo === 'mangiare' ? 'Dove mangiare' : 'Aggiungi una gita';
  }
  pannello.querySelectorAll<HTMLButtonElement>('.it-segmento').forEach(b => b.addEventListener('click', () => { impostaTipo(b.dataset.tipo as TipoPannello); preparaElenco(true); }));

  // minuti dall'ultima tappa del giorno, stato dei pulsanti, chiusure; con «ordina» rifà anche l'ordine
  function preparaElenco(ordina: boolean) {
    const x = it(), G = x.giorni[giorno];
    const data = dataDelGiorno(x, giorno);
    const voci = ultimo?.voci.filter((v): v is VoceTappa => v.tipo === 'tappa') ?? [];
    const coda = !G.gita && voci.length ? voci[voci.length - 1] : null;
    const uscita = coda ? (E && coda.id === E.id ? E.p : (() => { const t = tappaDi(C, coda.id)!; return t.pf != null ? (coda.indietro ? t.p : t.pf) : t.p; })()) : null;
    const s = scenarioDi(data, coda ? coda.fine : G.inizio, x.piedi);
    const dist = new Map<string, number>();
    for (const li of righe) {
      const id = li.dataset.id!, t = tappaDi(C, id)!;
      const dentro = !G.gita && G.tappe.includes(id);
      const b = li.querySelector<HTMLButtonElement>('.it-piu')!;
      b.setAttribute('aria-pressed', String(dentro));
      b.setAttribute('aria-label', `${dentro ? 'Togli' : 'Aggiungi'} ${t.breve}`);
      b.dataset.tip = dentro ? 'Togli' : 'Aggiungi';
      b.innerHTML = icona(dentro ? 'ok' : 'piu', 24);
      const m = uscita != null && !dentro ? minuti(C, s, uscita, t.p) : null;
      if (m != null) dist.set(id, m);
      li.querySelector('.it-scelta__min')!.textContent = m == null ? '' : `${m < 2 ? 'Accanto' : `${m} min`} · `;
      const nota = li.querySelector<HTMLElement>('.it-scelta__nota')!;
      const chiusa = data && t.chiuso.includes(giornoSettimana(data));
      nota.hidden = !chiusa;
      nota.textContent = chiusa ? `Chiuso ${ilGiorno(giornoSettimana(data!))}` : '';
    }
    // i locali: minuti dall'ultima tappa e, se a quell'ora (o quel giorno) è chiuso, lo diciamo
    const distL = new Map<string, number>();
    for (const li of righeLocali) {
      const id = li.dataset.id!, t = tappaDi(C, id)!;
      const dentro = !G.gita && G.tappe.includes(id);
      const b = li.querySelector<HTMLButtonElement>('.it-piu')!;
      b.setAttribute('aria-pressed', String(dentro));
      b.setAttribute('aria-label', `${dentro ? 'Togli' : 'Aggiungi'} ${t.breve}`);
      b.dataset.tip = dentro ? 'Togli' : 'Aggiungi';
      b.innerHTML = icona(dentro ? 'ok' : 'piu', 24);
      const m = uscita != null && !dentro ? minuti(C, s, uscita, t.p) : null;
      if (m != null) distL.set(id, m);
      li.querySelector('.it-scelta__min')!.textContent = m == null ? '' : `${m < 2 ? 'Accanto' : `${m} min`} · `;
      const arrivo = (coda ? coda.fine : G.inizio) + (m ?? 0);
      const chiusa = data && t.chiuso.includes(giornoSettimana(data));
      const o = !chiusa && !dentro ? orarioLocale(t, data, arrivo, t.durata) : null;
      const nota = li.querySelector<HTMLElement>('.it-scelta__nota')!;
      nota.hidden = !chiusa && !o;
      nota.textContent = chiusa ? `Chiuso ${ilGiorno(giornoSettimana(data!))}` : o ? (o.chiude != null ? `Arrivi alle ${ora(arrivo)}: chiude alle ${ora(o.chiude % 1440)}` : o.apre != null ? `Arrivi alle ${ora(arrivo)}: apre alle ${ora(o.apre)}` : `Alle ${ora(arrivo)} è chiuso`) : '';
    }
    if (ordina) {
      const ulL = $('it-scelte-mangiare');
      ulL.querySelectorAll('.it-scelta--zona').forEach(z => z.remove());
      $('it-mangiare-testa').textContent = coda && !G.gita ? `Minuti dall'ultima tappa: ${breve(coda.id)}` : 'Tutti i locali, per zona';
      if (coda && !G.gita) ulL.append(...[...righeLocali].sort((a, b) => (distL.get(a.dataset.id!) ?? 1e6) - (distL.get(b.dataset.id!) ?? 1e6)));
      else {
        let zona = '';
        for (const li of [...righeLocali].sort((a, b) => Object.keys(C.zone).indexOf(a.dataset.zona!) - Object.keys(C.zone).indexOf(b.dataset.zona!))) {
          if (li.dataset.zona !== zona) {
            zona = li.dataset.zona!;
            const z = document.createElement('li');
            z.className = 'it-scelta--zona';
            z.dataset.zona = zona;
            z.textContent = C.zone[zona] ?? zona;
            ulL.append(z);
          }
          ulL.append(li);
        }
      }
    }
    const ul = $('it-scelte');
    const testa = $('it-elenco-testa');
    if (G.gita) testa.textContent = `Il giorno ${giorno + 1} è una gita: le tappe in città vanno in un giorno nuovo`;
    else if (coda) testa.textContent = `Minuti dall'ultima tappa: ${breve(coda.id)}`;
    else testa.textContent = 'Tutte le tappe, per zona';
    if (ordina) {
      ul.querySelectorAll('.it-scelta--zona').forEach(z => z.remove());
      if (coda) {
        const ordinate = [...righe].sort((a, b) => (dist.get(a.dataset.id!) ?? 1e6) - (dist.get(b.dataset.id!) ?? 1e6));
        ul.append(...ordinate);
      } else {
        let zona = '';
        for (const li of righe) {
          if (li.dataset.zona !== zona) {
            zona = li.dataset.zona!;
            const z = document.createElement('li');
            z.className = 'it-scelta--zona';
            z.dataset.zona = zona;
            z.textContent = C.zone[zona] ?? zona;
            ul.append(z);
          }
          ul.append(li);
        }
      }
    }
    // la riga delle regate: solo se quel giorno ci sono regate in calendario
    const ev = $('it-evento');
    const giornoEv = E && data && !eventoFinito ? E.giorni[data] : undefined;
    ev.hidden = !giornoEv || !!G.gita;
    if (giornoEv && E) {
      const dentro = G.tappe.includes(E.id);
      $('it-evento-meta').textContent = `${giornoEv.titolo} · dalle ${ora(E.inizio)}${giornoEv.possibile ? ' · se la sfida non è già finita' : ''}`;
      const b = ev.querySelector<HTMLButtonElement>('.it-piu')!;
      b.setAttribute('aria-pressed', String(dentro));
      b.setAttribute('aria-label', `${dentro ? 'Togli' : 'Aggiungi'} ${E.nome}`);
      b.dataset.tip = dentro ? 'Togli' : 'Aggiungi';
      b.innerHTML = icona(dentro ? 'ok' : 'piu', 24);
    }
    // gite
    pannello.querySelectorAll<HTMLLIElement>('.it-solo-gite .it-scelta').forEach(li => {
      const id = li.dataset.id!, dentro = G.gita === id;
      const b = li.querySelector<HTMLButtonElement>('.it-piu')!;
      b.setAttribute('aria-pressed', String(dentro));
      b.innerHTML = icona(dentro ? 'ok' : 'piu', 24);
    });
    applicaFiltri();
  }

  const cerca = $<HTMLInputElement>('it-cerca');
  function applicaFiltri() {
    const q = piano(cerca.value.trim());
    let visibili = 0;
    for (const li of righe) {
      const t = tappaDi(C, li.dataset.id!)!;
      const ok = (!q || piano(li.dataset.cerca!).includes(q)) &&
        (!filtri.has('chiuso') || t.alChiuso !== 'no') &&
        (!filtri.has('gratis') || t.ingresso === 'gratis') &&
        (!filtri.has('bambini') || t.bambini === 'si') &&
        (!filtri.has('scale') || t.gradini === 'no') &&
        (!filtri.has('libero') || t.prenotazione !== 'obbligatoria');
      li.hidden = !ok;
      if (ok) visibili++;
    }
    $('it-scelte').querySelectorAll<HTMLElement>('.it-scelta--zona').forEach(z => { z.hidden = !righe.some(li => !li.hidden && li.dataset.zona === z.dataset.zona); });
    $('it-nessuna').hidden = visibili > 0;
    $('it-elenco-testa').hidden = visibili === 0;
    // i locali: pasto e cucina (dentro ogni gruppo basta uno dei filtri scelti)
    let locali = 0;
    for (const li of righeLocali) {
      const ok = (!filtriLocali.pasto.size || li.dataset.pasto!.split(' ').some(p => filtriLocali.pasto.has(p))) &&
        (!filtriLocali.cucina.size || li.dataset.cucina!.split(' ').some(c => filtriLocali.cucina.has(c)));
      li.hidden = !ok;
      if (ok) locali++;
    }
    $('it-scelte-mangiare').querySelectorAll<HTMLElement>('.it-scelta--zona').forEach(z => { z.hidden = !righeLocali.some(li => !li.hidden && li.dataset.zona === z.dataset.zona); });
    $('it-nessun-locale').hidden = locali > 0;
  }
  pannello.querySelectorAll<HTMLButtonElement>('[data-pasto], [data-cucina]').forEach(b => b.addEventListener('click', () => {
    const [gruppo, v] = b.dataset.pasto ? ['pasto', b.dataset.pasto] as const : ['cucina', b.dataset.cucina!] as const;
    const set = filtriLocali[gruppo];
    if (set.has(v)) set.delete(v); else set.add(v);
    b.setAttribute('aria-pressed', String(set.has(v)));
    applicaFiltri();
  }));
  cerca.addEventListener('input', applicaFiltri);
  pannello.querySelectorAll<HTMLButtonElement>('.it-filtro[data-filtro]').forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filtro!;
    if (filtri.has(f)) filtri.delete(f); else filtri.add(f);
    b.setAttribute('aria-pressed', String(filtri.has(f)));
    applicaFiltri();
  }));
  $('it-togli-filtri').addEventListener('click', () => {
    filtri.clear();
    cerca.value = '';
    pannello.querySelectorAll('.it-filtro[data-filtro]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    applicaFiltri();
    cerca.focus();
  });
  // dettagli di una tappa nel pannello: copiati dal suo modello la prima volta che si aprono (senza la foto grande)
  pannello.addEventListener('toggle', e => {
    const d = e.target as HTMLDetailsElement;
    if (!(d instanceof HTMLDetailsElement) || !d.open) return;
    const box = d.querySelector<HTMLElement>('.it-scelta__dettagli');
    if (!box || box.childElementCount) return;
    const frag = ($<HTMLTemplateElement>(box.dataset.da!)).content.cloneNode(true) as DocumentFragment;
    frag.querySelector('.foto')?.remove();
    box.append(frag);
  }, true);
  pannello.addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLButtonElement>('[data-aggiungi]');
    if (!b) return;
    const id = b.dataset.aggiungi!;
    if (E && id === E.id) {
      const G = it().giorni[giorno];
      if (G.tappe.includes(E.id)) cambia(y => { y.giorni[giorno].tappe = y.giorni[giorno].tappe.filter(t => t !== E.id); }, { annuncia: 'Tolte le regate' });
      else cambia(y => { y.giorni[giorno].tappe.push(E.id); }, { annuncia: `Aggiunte le regate, dalle ${ora(E.inizio)}` });
      return;
    }
    const t = tappaDi(C, id);
    if (!t) return;
    if (t.tipo === 'gita') { pannello.close(); aggiungiGita(id); return; }
    aggiungiTappa(id);
  });

  // ---------- scheda di una tappa ----------
  const scheda = $<HTMLDialogElement>('it-scheda');
  function apriScheda(id: string, _da?: HTMLElement) {
    const t = tappaDi(C, id);
    if (!t) return;
    $('it-scheda-h').textContent = t.nome;
    const corpo = $('it-scheda-corpo');
    corpo.replaceChildren(($<HTMLTemplateElement>(`it-t-${id}`)).content.cloneNode(true));
    const b = $<HTMLButtonElement>('it-scheda-azione');
    const G = it().giorni[giorno];
    const dentro = t.tipo === 'gita' ? G.gita === id : G.tappe.includes(id);
    b.className = `it-btn it-btn--largo ${dentro ? 'it-btn--pericolo' : 'it-btn--primario'}`;
    b.innerHTML = `${icona(dentro ? 'x' : 'piu', 22)}${dentro ? (t.tipo === 'gita' ? 'Togli la gita' : `Togli dal giorno ${giorno + 1}`) : (t.tipo === 'gita' ? 'Aggiungi la gita' : `Aggiungi al giorno ${giorno + 1}`)}`;
    b.onclick = () => {
      scheda.close();
      if (t.tipo === 'gita') { if (dentro) togliGita(); else aggiungiGita(id); }
      else if (dentro) togli(id);
      else aggiungiTappa(id);
    };
    scheda.showModal();
    corpo.scrollTop = 0;
  }

  // ---------- data e orari del giorno ----------
  const imp = $<HTMLDialogElement>('it-impostazioni');
  const campoData = $<HTMLInputElement>('it-data'), campoInizio = $<HTMLInputElement>('it-inizio'), campoFine = $<HTMLInputElement>('it-fine'), campoPiedi = $<HTMLInputElement>('it-piedi');
  function apriImpostazioni(_da?: HTMLElement) {
    const x = it(), G = x.giorni[giorno];
    $('it-impostazioni-h').textContent = `Giorno ${giorno + 1}`;
    campoData.value = dataDelGiorno(x, giorno) ?? '';
    campoInizio.value = hhmm(G.inizio);
    campoFine.value = hhmm(G.fine);
    campoPiedi.checked = !!x.piedi;
    const togliG = $<HTMLButtonElement>('it-giorno-togli');
    togliG.hidden = x.giorni.length < 2;
    togliG.textContent = `Elimina il giorno ${giorno + 1}`;
    $('it-giorno-conferma').hidden = true;
    $<HTMLButtonElement>('it-data-togli').hidden = !x.data;
    imp.showModal();
  }
  $('it-cambia').addEventListener('click', e => apriImpostazioni(e.currentTarget as HTMLElement));
  $('it-quando').addEventListener('click', e => apriImpostazioni(e.currentTarget as HTMLElement));
  campoData.addEventListener('change', () => {
    const v = campoData.value;
    if (v && !dataValida(v)) return;
    cambia(y => { if (v) y.data = piuGiorni(v, -giorno); else delete y.data; }, { annuncia: v ? `Data: ${dataLunga(v)}` : 'Data tolta' });
    $<HTMLButtonElement>('it-data-togli').hidden = !v;
  });
  $('it-data-togli').addEventListener('click', () => {
    campoData.value = '';
    cambia(y => { delete y.data; }, { annuncia: 'Data tolta' });
    $<HTMLButtonElement>('it-data-togli').hidden = true;
    campoData.focus();
  });
  campoInizio.addEventListener('change', () => {
    const v = minutiDa(campoInizio.value), G = it().giorni[giorno];
    if (!Number.isFinite(v) || v < 5 * 60 || v > G.fine - 60) { campoInizio.value = hhmm(G.inizio); toast('L\'inizio deve essere almeno un\'ora prima della fine'); return; }
    cambia(y => { y.giorni[giorno].inizio = v; });
  });
  campoFine.addEventListener('change', () => {
    const v = minutiDa(campoFine.value), G = it().giorni[giorno];
    if (!Number.isFinite(v) || v < G.inizio + 60) { campoFine.value = hhmm(G.fine); toast('La fine deve essere almeno un\'ora dopo l\'inizio'); return; }
    cambia(y => { y.giorni[giorno].fine = v; });
  });
  campoPiedi.addEventListener('change', () => cambia(y => { if (campoPiedi.checked) y.piedi = true; else delete y.piedi; }, { annuncia: campoPiedi.checked ? 'Solo a piedi' : 'A piedi e con i mezzi' }));
  // Eliminare un giorno: se ha tappe o una gita, prima una conferma che dice quale giorno e che cosa sparisce
  function eliminaGiorno() {
    imp.close();
    const k = giorno;
    cambia(y => { y.giorni.splice(k, 1); }, { annulla: `Hai eliminato il giorno ${k + 1}` });
    giorno = Math.max(0, Math.min(k, it().giorni.length - 1) - (k > 0 ? 1 : 0));
    disegna();
    $(`it-tab-${giorno}`)?.focus();
  }
  $('it-giorno-togli').addEventListener('click', () => {
    const G = it().giorni[giorno];
    const n = G.tappe.length;
    if (!G.gita && !n) { eliminaGiorno(); return; }
    $('it-giorno-conferma-testo').textContent = `Eliminare il giorno ${giorno + 1}? ${G.gita ? `Sparisce la gita a ${breve(G.gita)}.` : `Spariscono ${n === 1 ? 'la sua tappa' : `le sue ${n} tappe`}.`}`;
    $('it-giorno-si').textContent = `Elimina il giorno ${giorno + 1}`;
    $('it-giorno-togli').hidden = true;
    $('it-giorno-conferma').hidden = false;
    $('it-giorno-no').focus();
  });
  $('it-giorno-no').addEventListener('click', () => { $('it-giorno-conferma').hidden = true; $('it-giorno-togli').hidden = false; $('it-giorno-togli').focus(); });
  $('it-giorno-si').addEventListener('click', eliminaGiorno);
  imp.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('it-giorno-conferma').hidden) { e.preventDefault(); $('it-giorno-no').click(); } });

  // ---------- i miei itinerari ----------
  const elenco = $<HTMLDialogElement>('it-elenco');
  let daEliminare: string | null = null;
  const contaTappe = (x: Itinerario) => x.giorni.reduce((s, g) => s + (g.gita ? 1 : g.tappe.filter(t => !E || t !== E.id).length), 0);
  const descrivi = (x: Itinerario) => {
    const n = contaTappe(x), g = x.giorni.length;
    return `${g} ${g === 1 ? 'giorno' : 'giorni'} · ${n} ${n === 1 ? 'tappa' : 'tappe'}${x.data ? ` · dal ${dataBreve(x.data)}` : ''}`;
  };
  function disegnaMiei() {
    $('it-miei').innerHTML = [...A.elenco].sort((a, b) => b.modificato - a.modificato).map(x =>
      `<li><button type="button" class="it-mio" data-apri="${x.id}" aria-current="${x.id === A.attivo}"><strong>${esc(x.nome)}</strong><span>${x.id === A.attivo ? '<b class="it-mio__aperto">Aperto ora</b> · ' : ''}${descrivi(x)}</span></button><button type="button" class="it-ib" data-elimina="${x.id}" aria-label="Elimina ${esc(x.nome)}" data-tip="Elimina">${icona('cestino', 22)}</button></li>`).join('');
  }
  function vistaElenco(lista: boolean) {
    $('it-elenco-vista').hidden = !lista;
    $('it-conferma').hidden = lista;
  }
  $('it-elenco-apri').addEventListener('click', () => { disegnaMiei(); vistaElenco(true); elenco.showModal(); });
  elenco.addEventListener('click', e => {
    const apri = (e.target as Element).closest<HTMLElement>('[data-apri]');
    const elimina = (e.target as Element).closest<HTMLElement>('[data-elimina]');
    if (apri) {
      A.attivo = apri.dataset.apri!;
      giorno = 0; scelto = null;
      salva(); disegna(); elenco.close();
      annuncia(`Aperto: ${it().nome}`);
    } else if (elimina) {
      const x = A.elenco.find(i => i.id === elimina.dataset.elimina)!;
      daEliminare = x.id;
      $('it-conferma-h').textContent = `Eliminare «${x.nome}»?`;
      $('it-conferma-testo').textContent = `Spariscono da questo browser ${descrivi(x).replace(/ · dal .*/, '')}. Se l'hai già mandato a qualcuno, il suo link funziona ancora.`;
      vistaElenco(false);
      $('it-conferma-no').focus();
    }
  });
  $('it-conferma-no').addEventListener('click', () => { daEliminare = null; vistaElenco(true); $('it-nuovo').focus(); });
  $('it-conferma-si').addEventListener('click', () => {
    if (!daEliminare) return;
    const x = A.elenco.find(i => i.id === daEliminare)!;
    const prima = structuredClone(A);
    A.elenco = A.elenco.filter(i => i.id !== daEliminare);
    if (!A.elenco.length) A.elenco = [nuovo('Il mio itinerario')];
    if (!A.elenco.some(i => i.id === A.attivo)) { A.attivo = [...A.elenco].sort((a, b) => b.modificato - a.modificato)[0].id; giorno = 0; }
    daEliminare = null;
    salva(); disegna(); disegnaMiei(); vistaElenco(true);
    $('it-nuovo').focus();
    toast(`Hai eliminato «${x.nome}»`, 'Annulla', () => { A = prima; salva(); disegna(); disegnaMiei(); });
  });
  elenco.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('it-conferma').hidden) { e.preventDefault(); $('it-conferma-no').click(); } });
  // un nome che nessun altro itinerario ha già («Due giorni a Napoli (2)»)
  const nomeLibero = (base: string, tranne?: string) => {
    const nomi = new Set(A.elenco.filter(i => i.id !== tranne).map(i => i.nome));
    if (!nomi.has(base)) return base;
    for (let k = 2; ; k++) if (!nomi.has(`${base} (${k})`)) return `${base} (${k})`;
  };
  $('it-nuovo').addEventListener('click', () => {
    const x = nuovo(nomeLibero('Nuovo itinerario'));
    A.elenco.push(x);
    A.attivo = x.id;
    giorno = 0; scelto = null;
    salva(); disegna(); elenco.close();
    annuncia(`Nuovo itinerario: ${x.nome}`);
    nomeVedi.focus();
  });

  // ---------- itinerari pronti e gite dalla pagina ----------
  const vuotoTutto = (x: Itinerario) => x.giorni.every(g => !g.gita && !g.tappe.length);
  function usaPronto(p: Pronto, data?: string) {
    const giorni = structuredClone(p.giorni);
    const x = it();
    if (vuotoTutto(x)) {
      // la giornata di regata vuole un giorno di regata: senza una data scelta, niente data
      cambia(y => { y.nome = nomeLibero(p.nome, y.id); y.giorni = giorni; if (data) y.data = data; else if (p.evento) delete y.data; });
    } else {
      const y = nuovo(nomeLibero(p.nome), giorni);
      if (data) y.data = data; else if (p.evento) delete y.data;
      A.elenco.push(y);
      A.attivo = y.id;
      salva();
      toast(`Nuovo itinerario «${y.nome}»: quello di prima resta in «I miei itinerari»`);
    }
    giorno = 0; scelto = null;
    disegna();
    vaiAlCompositore();
    annuncia(`Itinerario ${it().nome}: ${it().giorni.length} ${it().giorni.length === 1 ? 'giorno' : 'giorni'}`);
  }
  function vaiAlCompositore() {
    $('compositore').scrollIntoView({ behavior: movimentoRidotto() ? 'auto' : 'smooth', block: 'start' });
    $('it-giorno-h').focus({ preventScroll: true });
  }
  // La giornata di regata vuole una data dei giorni di regata
  const quale = $<HTMLDialogElement>('it-quale-regata');
  const sceltaRegata = $<HTMLSelectElement>('it-giorno-regata');
  function chiediGiornoRegata() {
    if (!E) return;
    const giorni = Object.keys(E.giorni).sort();
    const primo = giorni.find(d => d >= oggi()) ?? giorni[0];
    sceltaRegata.innerHTML = giorni.map(d => `<option value="${d}"${d === primo ? ' selected' : ''}>${maiuscola(dataLunga(d))} · ${esc(E.giorni[d].titolo)}${E.giorni[d].possibile ? ' (se la sfida non è già finita)' : ''}${E.giorni[d].riserva ? ' (riserva)' : ''}</option>`).join('');
    $('it-giorno-regata-aiuto').textContent = `Dal ${dataBreve(E.primo)} al ${dataBreve(E.ultimo)} 2027 le regate non si corrono tutti i giorni: qui ci sono solo quelli in calendario.`;
    quale.showModal();
  }
  $('it-crea-regata').addEventListener('click', () => {
    const p = PRONTI.find(x => x.evento);
    quale.close();
    if (p) usaPronto(p, sceltaRegata.value);
  });
  document.addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLElement>('[data-pronto], [data-gita]');
    if (!b || !b.closest('.it-pagina')) return;
    if (b.dataset.gita) { aggiungiGita(b.dataset.gita); vaiAlCompositore(); return; }
    const p = PRONTI.find(x => x.id === b.dataset.pronto);
    if (!p) return;
    if (p.evento) {
      const d = it().data && vuotoTutto(it()) ? it().data : undefined;
      if (d && E?.giorni[d]) usaPronto(p, d); else chiediGiornoRegata();
    } else usaPronto(p);
  });
  if (eventoFinito) document.querySelectorAll<HTMLElement>('[data-pronto="regata"]').forEach(b => { (b.closest('li') ?? b.closest('article') ?? b).hidden = true; });

  // ---------- condividere ----------
  const linkDi = (x: Itinerario) => `${location.origin}${location.pathname}#${codifica(x)}`;
  const manda = $<HTMLDialogElement>('it-manda');
  $('it-condividi').addEventListener('click', async () => {
    const x = it();
    const url = linkDi(x);
    if (navigator.share) {
      try { await navigator.share({ title: x.nome, text: `${x.nome}: il mio itinerario a Napoli`, url }); return; }
      catch (err) { if ((err as DOMException)?.name === 'AbortError') return; }
    }
    $<HTMLInputElement>('it-link').value = url;
    $<HTMLAnchorElement>('it-whatsapp').href = `https://wa.me/?text=${encodeURIComponent(`${x.nome}: ${url}`)}`;
    manda.showModal();
  });
  $('it-copia').addEventListener('click', async () => {
    const campo = $<HTMLInputElement>('it-link');
    try { await navigator.clipboard.writeText(campo.value); toast('Link copiato'); }
    catch { campo.select(); toast('Seleziona il link e copialo'); }
  });

  // ---------- un itinerario ricevuto con un link ----------
  const ricevuto = (window as Window & { itinerarioRicevuto?: string }).itinerarioRicevuto;
  if (ricevuto) {
    const d = decodifica(C, ricevuto);
    if (d) {
      const uguale = A.elenco.find(i => uguali(i, d.it));
      if (uguale) {
        A.attivo = uguale.id;
        toast(`Hai già questo itinerario: «${uguale.nome}»`);
      } else {
        d.it.nome = nomeLibero(d.it.nome);
        if (A.elenco.length === 1 && vuotoTutto(A.elenco[0])) A.elenco = [d.it]; else A.elenco.push(d.it);
        A.attivo = d.it.id;
        toast(`Itinerario «${d.it.nome}» salvato tra i tuoi${d.scartate.length ? `. ${d.scartate.length === 1 ? 'Una tappa non esiste più ed è stata tolta' : `${d.scartate.length} tappe non esistono più e sono state tolte`}` : ''}`);
      }
      salva();
    }
  }
  // ---------- un locale da aggiungere, dalla pagina «Dove mangiare» (?aggiungi=<id>&g=<giorno>) ----------
  const richiesta = new URLSearchParams((window as Window & { daAggiungere?: string }).daAggiungere ?? '');
  const daAggiungere = richiesta.get('aggiungi');
  if (daAggiungere) {
    const t = tappaDi(C, daAggiungere);
    if (t?.tipo === 'citta') {
      const x = it();
      giorno = Math.min(Math.max(0, Number(richiesta.get('g')) || 0), x.giorni.length - 1);
      if (x.giorni[giorno].tappe.includes(t.id)) toast(`${maiuscola(t.breve)} è già nel giorno ${giorno + 1}`);
      else {
        // aggiungiTappa dice da sé se non si può (giorno pieno) o se finisce in un giorno nuovo (dopo una gita)
        aggiungiTappa(t.id);
        const dove = it().giorni.findIndex(G => G.tappe.includes(t.id));
        if (dove >= 0) toast(`Aggiunto al giorno ${dove + 1}: ${t.breve}`);
      }
    }
  }
  quandoCambia(() => { const n = leggi(C); if (n) { A = n; disegna(); } });

  // ---------- giornata o mappa ----------
  document.querySelectorAll<HTMLButtonElement>('.it-vista__btn').forEach(b => b.addEventListener('click', () => {
    vista = b.dataset.vista as 'giornata' | 'mappa';
    disegnaVista();
    annuncia(vista === 'mappa' ? 'Mappa del giorno' : 'Giornata');
  }));
  let mappa: typeof import('./mappa') | null = null;
  let mappaVicina = false;
  function disegnaVista() {
    const conMappa = largo.matches || vista === 'mappa';
    document.querySelectorAll<HTMLButtonElement>('.it-vista__btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.vista === vista)));
    $('it-giornata').hidden = !largo.matches && vista === 'mappa';
    $('it-mappa').hidden = !conMappa;
    if (conMappa && (!largo.matches || mappaVicina)) disegnaMappa();
  }
  async function disegnaMappa() {
    const x = it();
    try {
      mappa ??= await import('./mappa');
      const r = calcolaGiorno(C, x, giorno, adessoPer(x, giorno));
      await mappa.disegna($('it-mappa-area'), C, x, giorno, r, {
        legenda: $('it-legenda'), riassunto: $('it-riassunto'),
        apri: (id: string) => { scelto = id; vista = 'giornata'; disegna(); linea.querySelector<HTMLElement>(`.it-voce[data-id="${CSS.escape(id)}"] [data-az="scegli"]`)?.focus(); }
      });
    } catch {
      $('it-mappa-area').innerHTML = '<p class="it-mappa__attesa">La mappa non si è caricata. Riprova quando hai la rete.</p>';
    }
  }
  $('it-mappa').addEventListener('click', e => {
    const z = (e.target as Element).closest<HTMLElement>('[data-zoom]');
    if (z && mappa) mappa.zoom(z.dataset.zoom as 'piu' | 'meno' | 'tutto');
  });
  // sugli schermi larghi la mappa sta accanto alla giornata: si carica quando il compositore è sullo schermo
  new IntersectionObserver((v, o) => { if (v.some(x => x.isIntersecting)) { mappaVicina = true; o.disconnect(); if (largo.matches) disegnaMappa(); } }, { rootMargin: '200px' }).observe($('compositore'));
  largo.addEventListener('change', () => disegnaVista());

  disegna();
}
