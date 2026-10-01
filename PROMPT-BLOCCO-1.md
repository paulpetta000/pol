# Prompt · Blocco 1 di 3 · Itinerari: contenuti e proposte di design (scritto il 01/10/2026)

Incollare questo testo all'inizio di una sessione nuova.

---

Lavora sul sito "Napoli a Vela" (repository paulpetta000/pol, Astro, online su https://napoli-a-vela.vercel.app dal ramo `main`). Prima leggi `PROGRESS.md`, `PIANO.md` e `README.md`. Parlami in italiano semplice: uso il telefono.

Questo è il **blocco 1 di 3** del Rilascio 3:
1. itinerari: contenuti e proposte di design;
2. itinerari: la pagina;
3. il sito più ordinato.

## Regole di lavoro

- Parti da un ramo nuovo creato da `main`. Su `main` non pubblicare niente senza il mio OK esplicito: prima mostrami l'anteprima di Vercel (link e immagini su telefono, tema chiaro e scuro).
- Prima di scrivere codice dimmi in poche righe il piano e fammi al massimo 2-3 domande, se servono davvero.
- Prima di ogni anteprima controlla: build, `npm run check:links`, accessibilità (axe) in chiaro e scuro, Lighthouse su telefono (almeno 95 ovunque), nessuno scorrimento orizzontale a 320 e 390 px, «riduci movimento», nessun errore in console. Aggiorna `PROGRESS.md` e fai commit chiari.
- Tutti i testi stanno in `src/testi/` e passano dai controlli della build (vedi `README.md`, «Testi discorsivi delle pagine»): niente schede con etichette, fonti solo in fondo, `*` sulle informazioni non ufficiali per il 2027, dette anche a parole.
- Ogni informazione ha la sua fonte (`src/data/fatti.yaml` e `fonti.yaml`); orari e prezzi hanno la data «da ricontrollare».
- Niente link di affiliazione, niente «ufficiale», niente loghi dell'evento.
- Skill per questo blocco: deep-research (orari e prezzi), frontend-design e VectorLab UI/UX Skills (proposte di design). Se ti serve una skill che non è attiva, dimmelo invece di andare avanti senza.

## Blocco 1 · Itinerari: contenuti e proposte di design

Gli itinerari avranno una pagina tutta loro e saranno **componibili**: la guida propone una serie di tappe, e chi legge si costruisce la giornata aggiungendo e togliendo quello che vuole, tenendo conto delle distanze tra i posti. In questo blocco prepariamo tutto quello che serve **prima** della pagina: le tappe, le distanze e il design. Nessuna pagina nuova va online.

### Domande da farmi all'inizio

- Gli itinerari: voce nuova nel menu («Itinerari») o dentro «Napoli», sempre in una pagina tutta loro?
- Gli itinerari pronti: mezza giornata, 1 e 2 giorni bastano, o anche 3?

### 1. Le tappe

Un elenco di circa 25-30 cose da fare a Napoli: monumenti, musei, chiese, quartieri da girare a piedi, panorami, il lungomare, il cibo di strada. Mettile in un file di dati (per esempio `src/data/tappe.yaml`). Per ogni tappa:

- nome, zona e posizione (da OpenStreetMap);
- quanto tempo serve;
- orari e prezzi dalla fonte ufficiale, come schede in `fatti.yaml` con la data «da ricontrollare»;
- se ci sono gradini o salite, se è al chiuso (utile con il caldo di luglio), se va bene con i bambini, il momento migliore (mattina o sera);
- una foto con licenza libera, dove c'è, e un testo breve scritto con il sistema dei testi.

Niente locali commerciali (ristoranti, hotel) per ora. Le gite fuori città (Pompei, Ercolano, Vesuvio, Capri, Ischia, Procida) stanno a parte: occupano una giornata intera e non si mescolano con le tappe in città. Per orari e prezzi usa deep-research, partendo dai siti ufficiali (musei, Comune, Regione).

### 2. Le distanze

- Calcolale in fase di build, senza servizi esterni (niente Google Maps), sulle strade e sulle scale pedonali di OpenStreetMap, come facciamo per la mappa (`scripts/mappa/`).
- Tieni conto delle salite (per Vomero e Posillipo meglio la funicolare) e usa metro e funicolari dove conviene.
- Il risultato è una tabella con i minuti tra ogni coppia di tappe. Controllane almeno 5 a campione e dimmi come è andata.
- Sul sito i tempi saranno sempre presentati come stime.

### 3. Due proposte di design

Il design per me è la cosa più importante. Prepara **2 proposte diverse** di come appare la pagina sul telefono, in chiaro e in scuro, come immagini:

- l'elenco delle tappe da scegliere;
- l'itinerario che si compone: aggiungere e togliere con un tocco, riordinare trascinando ma anche con i pulsanti, il tempo totale, l'avviso «È lontano dalle altre tappe: circa 40 minuti tra andata e ritorno. Vuoi metterlo in un altro giorno?», la giornata piena, l'itinerario vuoto;
- la mappa con le tappe numerate e collegate nell'ordine.

Stile coerente con «Regata», quello del sito, ma più ordinato: pochi tipi di riquadri, tanto spazio, gerarchia chiara, tocchi di almeno 44 px. Per ogni proposta dimmi in due righe i punti forti e quelli deboli.

### Fine del blocco: fermati per la revisione

Quando hai finito, **fermati** e mandami:

1. l'elenco delle tappe in una tabella semplice: nome, zona, tempo, orari, prezzo, fonte;
2. come hai calcolato le distanze, e i controlli a campione;
3. le 2 proposte di design come immagini da telefono, in chiaro e in scuro.

Io scelgo la proposta e ti dico cosa cambiare. Dopo il mio OK:

- scrivi in `PROGRESS.md` cosa abbiamo deciso (proposta scelta, modifiche, posto nel menu, durate), così il blocco 2 lo trova;
- porta il lavoro su `main`: sono solo dati e script, il sito pubblico non cambia;
- dimmi quali skill accendere o spegnere per il blocco 2, e se ne serve qualcun'altra.

Non iniziare il blocco 2: lo faccio partire io in una sessione nuova, dopo aver sistemato le skill.
