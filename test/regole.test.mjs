// Le regole dei testi (src/lib/regole.mjs): parole di cautela, segni {?id}, firma, fonti deboli.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firma, cauteleDi, cautelaScheda, controllaSegni, confermataConFontiDeboli, nudo } from '../src/lib/regole.mjs';

const scheda = (id, data) => [id, { id, data: { testo: 'Testo di prova della scheda', anno: 2027, storico: false, ...data } }];
// Controlla una frase con le schede date e restituisce gli errori
const errori = (frasi, ...schede) => {
  const e = [];
  controllaSegni('prova#blocco', frasi.map(f => (typeof f === 'string' ? { testo: f } : f)), new Map(schede), e);
  return e;
};

test('cautela: una scheda confermata per il 2027 non ha bisogno di niente', () => {
  assert.deepEqual(cauteleDi({ testo: 'x', stato: 'confermato', anno: 2027 }), []);
  assert.deepEqual(errori(['Le regate si corrono nel golfo.'], scheda('a', { stato: 'confermato' })), []);
});

test('cautela: senza anno la scheda vale per il 2027', () => {
  assert.deepEqual(cauteleDi({ testo: 'x', stato: 'confermato' }), []);
});

test('cautela: ogni stato non confermato vuole le sue parole', () => {
  const casi = [
    ['stampa', 'Secondo la stampa le tribune saranno a via Caracciolo {?a}.', 'Le tribune saranno a via Caracciolo {?a}.'],
    ['segnalato', 'Alcuni siti non ufficiali parlano di maxischermi {?a}.', 'Ci saranno maxischermi {?a}.'],
    ['atteso', "Gli orari non sono ancora usciti {?a}.", 'Le regate partono alle 14 {?a}.']
  ];
  for (const [stato, giusta, sbagliata] of casi) {
    assert.deepEqual(errori([giusta], scheda('a', { stato })), [], `${stato}: «${giusta}» deve passare`);
    const e = errori([sbagliata], scheda('a', { stato }));
    assert.equal(e.length, 1, `${stato}: «${sbagliata}» deve fermare la build`);
    assert.match(e[0], /deve dire/);
  }
});

// I modi di dirlo che il controllo accetta: se una parola sparisce per sbaglio dalla regola, il test lo dice.
// Le parole nuove della guida di stile (specifiche/stile-testi.md, 06/10/2026) sono in fondo a ogni elenco.
test('cautela: tutti i modi di dirlo che accettiamo', () => {
  const frasi = {
    stampa: ['Secondo il Mattino', 'Scrivono i giornali', 'Lo riportano due quotidiani', 'Si legge su Repubblica', 'Ci sono indiscrezioni', 'Girano voci di un rinvio', 'Girano voci, nessuna conferma', 'Per la stampa locale',
      'Il villaggio dovrebbe essere lì', 'Le tribune dovrebbero essere lì', 'Potrebbe cambiare', 'Sarebbe la prima volta', 'Nel 2026 il Comune avrebbe montato le pedane', 'È previsto un villaggio', 'Sono previsti maxischermi', 'Si parla di tribune', 'Lo raccontano i giornali locali'],
    segnalato: ['Secondo alcuni siti non ufficiali', 'Lo dice un blog', 'Ci è stato segnalato', 'Una fonte non ufficiale'],
    atteso: ['Non è ancora uscito', 'Non è stato ancora annunciato', 'Ancora non si conosce', 'Mancano ancora gli orari', 'Non si sa', 'Non sappiamo ancora', 'Nessun annuncio', 'Da annunciare', 'In attesa del bando', 'Quando uscirà lo diremo',
      'Gli orari li diranno gli organizzatori', 'Lo diranno più avanti', 'Ne sapremo di più più avanti', 'Il bando non è uscito', 'I prezzi non sono ancora usciti', 'Appena esce lo scriviamo', 'Data da confermare', 'Non confermato', 'Aspettiamo il bando']
  };
  for (const [stato, elenco] of Object.entries(frasi)) {
    for (const f of elenco) assert.deepEqual(errori([`${f}, le tribune saranno lì {?a}.`], scheda('a', { stato })), [], `${stato}: «${f}» deve bastare`);
  }
});

test("cautela: com'era nel 2024 o nel 2026 va detto l'anno", () => {
  assert.deepEqual(errori(['Nel 2026 il campo era davanti a via Caracciolo {?a}.'], scheda('a', { stato: 'confermato', anno: 2026 })), []);
  assert.equal(errori(['Il campo è davanti a via Caracciolo {?a}.'], scheda('a', { stato: 'confermato', anno: 2026 })).length, 1);
  // per il 2024 basta anche «Barcellona»
  assert.deepEqual(errori(['A Barcellona la partenza era così {?a}.'], scheda('a', { stato: 'confermato', anno: 2024 })), []);
});

test('cautela: un risultato del passato (storico) non vuole il segno', () => {
  assert.deepEqual(cauteleDi({ testo: 'x', stato: 'confermato', anno: 2024, storico: true }), []);
  const e = errori(['Nel 2024 vinse New Zealand {?a}.'], scheda('a', { stato: 'confermato', anno: 2024, storico: true }));
  assert.equal(e.length, 1);
  assert.match(e[0], /è confermata per il 2027\. Togli il segno/);
});

test('cautela: la frase d\'apertura vale per tutta la sottosezione', () => {
  const intro = 'Nel 2026 funzionava così.';
  assert.deepEqual(errori([{ testo: 'Il traghetto partiva ogni ora {?a}.', intro }], scheda('a', { stato: 'confermato', anno: 2026 })), []);
});

test('cautela: errori sui segni', () => {
  // scheda non confermata senza segno
  const senza = errori(['Le tribune saranno a via Caracciolo, secondo la stampa.'], scheda('a', { stato: 'stampa' }));
  assert.equal(senza.length, 1);
  assert.match(senza[0], /Aggiungi \{\?a\}/);
  // segno su una scheda che non è nell'elenco «usa»
  const fuori = errori(['Secondo la stampa sì {?b}.'], scheda('a', { stato: 'confermato' }));
  assert.match(fuori[0], /non è nell'elenco «usa»/);
  // segno su una scheda confermata
  const confermata = errori(['Le regate sono a Napoli {?a}.'], scheda('a', { stato: 'confermato' }));
  assert.match(confermata[0], /Togli il segno/);
  // più schede in un solo segno
  assert.deepEqual(errori(['Secondo la stampa, che non sa ancora le date, sì {?a,b}.'], scheda('a', { stato: 'stampa' }), scheda('b', { stato: 'atteso' })), []);
});

test('cautela: le parole si cercano nel testo senza formattazione', () => {
  assert.equal(nudo('**Secondo** la [stampa](/fonti/) {?a}'), 'Secondo la stampa ');
  assert.deepEqual(errori(['Per la [stampa](/fonti/) sì {?a}.'], scheda('a', { stato: 'stampa' })), []);
});

test('cautela: una scheda mostrata così com\'è deve dirlo nel suo testo', () => {
  assert.deepEqual(cautelaScheda({ id: 'a', data: { testo: 'Aperto dalle 9 alle 19', stato: 'confermato', anno: 2026, storico: false } }).segno, true);
  assert.ok(cautelaScheda({ id: 'a', data: { testo: 'Aperto dalle 9 alle 19', stato: 'confermato', anno: 2026 } }).errore);
  assert.deepEqual(cautelaScheda({ id: 'a', data: { testo: 'Nel 2026 era aperto dalle 9 alle 19', stato: 'confermato', anno: 2026 } }), { segno: true });
  assert.deepEqual(cautelaScheda({ id: 'a', data: { testo: 'Aperto dalle 9 alle 19', stato: 'confermato', anno: 2027 } }), { segno: false });
});

test('firma: cambia solo se cambiano testo, stato o anno', () => {
  const base = { testo: 'Le regate sono a Napoli', stato: 'confermato', anno: 2027 };
  assert.match(firma(base), /^[0-9a-f]{10}$/);
  assert.equal(firma(base), firma({ ...base }));
  assert.equal(firma(base), firma({ ...base, controllato: new Date(), fonti: ['x'] }), 'data di controllo e fonti non contano');
  assert.notEqual(firma(base), firma({ ...base, testo: 'Le regate sono a Napoli.' }));
  assert.notEqual(firma(base), firma({ ...base, stato: 'stampa' }));
  assert.notEqual(firma(base), firma({ ...base, anno: 2026 }));
  assert.equal(firma(base), firma({ testo: base.testo, stato: base.stato }), 'senza anno vale 2027');
});

test('fonti deboli: solo enciclopedia, blog o altro per una scheda confermata', () => {
  assert.equal(confermataConFontiDeboli('confermato', ['enciclopedia']), true);
  assert.equal(confermataConFontiDeboli('confermato', ['blog', 'altro']), true);
  assert.equal(confermataConFontiDeboli('confermato', ['enciclopedia', 'ufficiale']), false);
  assert.equal(confermataConFontiDeboli('confermato', ['stampa']), false);
  assert.equal(confermataConFontiDeboli('segnalato', ['blog']), false, 'se lo stato lo dice già, va bene');
  assert.equal(confermataConFontiDeboli('confermato', []), false);
});

test('cautela: il condizionale basta per la stampa, ma non per ciò che non è ancora uscito', () => {
  assert.deepEqual(errori(['Il villaggio dovrebbe avere lo stesso formato del 2026 {?a}.'], scheda('a', { stato: 'stampa' })), []);
  assert.equal(errori(['Il villaggio dovrebbe avere lo stesso formato del 2026 {?a}.'], scheda('a', { stato: 'atteso' })).length, 1);
  // senza condizionale e senza parole la frase continua a fermare la build
  assert.equal(errori(['Il villaggio avrà lo stesso formato del 2026 {?a}.'], scheda('a', { stato: 'stampa' })).length, 1);
});

test('cautela: un fatto del passato letto sui giornali può essere scritto come fatto (comeFatto), senza segno', () => {
  assert.deepEqual(cauteleDi({ testo: 'x', stato: 'stampa', storico: true, comeFatto: true }), []);
  assert.deepEqual(errori(['È nella Guida Michelin 2025.'], scheda('a', { stato: 'stampa', storico: true, comeFatto: true })), []);
  // il segno su questa scheda va tolto
  assert.match(errori(['È nella Guida Michelin 2025 {?a}.'], scheda('a', { stato: 'stampa', storico: true, comeFatto: true }))[0], /Togli il segno/);
  // senza «comeFatto» la stessa frase ferma la build
  assert.equal(errori(['È nella Guida Michelin 2025.'], scheda('a', { stato: 'stampa', storico: true })).length, 1);
  // una scheda mostrata così com'è (SchedaLocale) non prende l'asterisco
  assert.deepEqual(cautelaScheda({ id: 'a', data: { testo: 'È nella Guida Michelin 2025.', stato: 'stampa', storico: true, comeFatto: true } }), { segno: false });
});
