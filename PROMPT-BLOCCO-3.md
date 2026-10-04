# Prompt · Blocco 3 di 3 · Il sito più ordinato (scritto il 01/10/2026)

Incollare questo testo all'inizio di una sessione nuova, dopo aver finito il blocco 2.

---

Lavora sul sito "Napoli a Vela" (repository paulpetta000/pol, Astro, online su https://napoli-a-vela.vercel.app dal ramo `main`). Prima leggi `PROGRESS.md`, `PIANO.md` e `README.md`. Parlami in italiano semplice: uso il telefono.

Questo è il **blocco 3 di 3** del Rilascio 3:
1. itinerari: contenuti e proposte di design;
2. itinerari: la pagina;
3. il sito più ordinato.

## Prima parte: lo stile dei testi (deciso da Enrico il 04/10/2026)

Prima dell'estetica e della SEO: i testi del sito sono corretti ma freddi («secondo il locale è aperta dal 1936», «Gambero Rosso scrive che…»). Enrico li vuole caldi e coinvolgenti, che accompagnino il lettore, **senza perdere le fonti**.
1. Ricerca approfondita (skill deep-research) su come scrivono le migliori guide di viaggio e di cibo, per i vari argomenti del sito (regate, luoghi, locali, trasporti).
2. Una **guida di stile** corta in `specifiche/` (tono, frasi tipo, come citare una fonte con calore: «per Gambero Rosso è…», «dal 1936 frigge in via dei Tribunali»), da far approvare a Enrico.
3. Allargare le parole ammesse dal controllo dei testi (`src/lib/testi.ts`, `PAROLE`), senza togliere la regola: un'informazione non ufficiale va detta a parole.
4. Riscrivere i testi di tutte le pagine (`src/testi/`) e rifirmarli. Va fatto prima del Rilascio 4 (Lingue), così si traducono i testi definitivi.

## Regole di lavoro

- Parti da un ramo nuovo creato da `main`. Su `main` non pubblicare niente senza il mio OK esplicito: prima mostrami l'anteprima di Vercel (link e immagini su telefono, tema chiaro e scuro).
- Prima di scrivere codice dimmi in poche righe il piano e fammi al massimo 2-3 domande, se servono davvero.
- Prima di ogni anteprima controlla: build, `npm run check:links`, accessibilità (axe) in chiaro e scuro, Lighthouse su telefono (almeno 95 ovunque), nessuno scorrimento orizzontale a 320 e 390 px, «riduci movimento», nessun errore in console. Aggiorna `PROGRESS.md` e fai commit chiari.
- Tutti i testi stanno in `src/testi/` e passano dai controlli della build (vedi `README.md`, «Testi discorsivi delle pagine»): niente schede con etichette, fonti solo in fondo, `*` sulle informazioni non ufficiali per il 2027, dette anche a parole.
- Ogni informazione ha la sua fonte (`src/data/fatti.yaml` e `fonti.yaml`); orari e prezzi hanno la data «da ricontrollare».
- Niente link di affiliazione, niente «ufficiale», niente loghi dell'evento.
- **All'inizio del blocco ricorda a Enrico di installare i plugin SEO Audit Kit e Programmatic SEO Gate** (dal catalogo «Anthropic Directory»; si spengono alla fine del blocco).
- Skill per questo blocco: frontend-design, VectorLab UI/UX Skills, consistent-ui, SEO Audit Kit e Programmatic SEO Gate. Se ti serve una skill che non è attiva, dimmelo invece di andare avanti senza.

## Blocco 3 · Il sito più ordinato

Gli itinerari sono online. Ora rendi tutto il sito più ordinato: oggi alcune pagine sono lunghe e mettono troppe cose insieme.

Prima fai un controllo di coerenza con consistent-ui (spazi, caratteri, colori e componenti che cambiano da una pagina all'altra) e mostrami l'elenco dei problemi trovati. Poi applica queste proposte, del 01/10/2026:

1. **«Dal lungomare»** (quasi 22 schermate sul telefono) e **«Mappa»** (19): schede dei punti più corte (foto piccola, nome e una riga; il resto si apre toccando) e linguette Lungomare / Colline / Posillipo. Nella pagina della mappa solo la mappa e l'elenco dei nomi, senza ripetere le schede.
2. Un riquadro **«In breve»** in cima alle pagine lunghe, con 3-4 risposte veloci e i link alle parti della pagina.
3. **Home più leggera:** oggi ha 11 blocchi (quasi 10 schermate). Tenere titolo e conto alla rovescia, «Cosa vuoi fare?», prossimo appuntamento, dove guardare, domande veloci.
4. **«Fonti di questa pagina» chiuse a tendina**, con il numero delle fonti e la data sempre visibili.
5. **Meno tipi di riquadri**, più spazio tra un argomento e l'altro.
6. **«Avvisami»** intero solo nella pagina Biglietti; altrove una riga con un pulsante.
7. **Il 3D non in cima alla pagina.** In «Squadre» va dopo l'elenco delle 7 squadre e prima di «Da sapere»; nelle pagine delle squadre dopo la storia e prima dei risultati 2026. Nella pagina «Le barche» resta il primo blocco.

### Estetica: molto bella, non solo ordinata (aggiunto il 03/10/2026)
Prima di applicare le 7 proposte, fai **due proposte di direzione grafica** (home e una pagina interna, con i dati veri e le foto che abbiamo) e fammi scegliere, come nel blocco 1. Poi applica la scelta a tutto il sito. UX e UI aggiornate, tema chiaro e scuro, telefono per primo. Effort alto o extra.

### Logo e identità del marchio (aggiunto il 04/10/2026)
Il logo di oggi non piace a Enrico (l'ho fatto io come bozza). Fare **3 o 4 direzioni** (SVG, chiaro e scuro, anche piccolo come icona del telefono), farle scegliere, poi applicarle: colori, caratteri e uso del marchio. Anche il look «Orario» si può cambiare: va rimesso in discussione nelle due proposte grafiche. Presentazioni e banner non servono. Ispirazione: awesome-design-md (idee, non marchi altrui). I caratteri di Google Fonts si scaricano e si servono dal sito (cartella `/fonts`): così nessuna richiesta a Google, e la regola sui servizi esterni e la pagina Privacy restano come sono.

### Barche 3D realistiche (aggiunto il 04/10/2026)
Enrico vuole barche **vere come una fotografia**, in 3D: si **ruotano con il dito** e **si muovono nell'acqua** (onde, scia, foil che si alza). Forma da AC75 vera (scafo, foil, vela doppia) da foto e disegni con licenza libera; materiali realistici (carbonio, vernice, vela); luce da ambiente vero con ombre e riflessi sul mare. Si carica solo al tocco e non deve far scendere Lighthouse sotto 95. **Prima una prova su una sola barca** (img2threejs, solo il clone base), da mostrare a Enrico sul telefono; poi, se piace, le altre.

### SEO (dopo che la struttura è finita; aggiunto il 03/10/2026)
- Controllo con SEO Audit Kit: titoli, descrizioni, intestazioni, link interni, dati strutturati; elenco dei problemi in ordine di importanza.
- Pagine che Google può indicizzare: il compositore degli itinerari non lo è (il contenuto sta dopo il «#»). Proponi pagine fisse per gli itinerari pronti, e valuta con Programmatic SEO Gate se ha senso una pagina per ogni tappa e per ogni locale (niente pagine fotocopia).
- Google Search Console: **già collegata dal 01/10/2026** (file di verifica in `public/`). Chiedi a Enrico se ha inviato la mappa del sito `/sitemap.xml` e, se ci sono dati, usali.
- Parole chiave: chiedi a Enrico prima di usare Semrush (consuma unità del suo piano).
- Pagina «Novità» con date; dominio proprio da valutare con l'avvocato (marchi, vedi `PIANO.md`).

### Domanda da farmi all'inizio

- Il 3D: va bene la posizione del punto 7?

### Fine del blocco: fermati

1. Mandami il link dell'anteprima e le immagini da telefono di **prima e dopo**, in chiaro e in scuro, delle pagine che cambiano di più: home, «Dal lungomare», «Mappa», «Squadre» e una pagina squadra. Aggiungi le misure: quante schermate sono lunghe prima e dopo.
2. Scrivimi: «Ho finito il design: adesso spegni VectorLab UI/UX Skills e consistent-ui». **Aspetta il mio OK.**
3. Dopo il mio OK:
   - porta tutto su `main`, sempre solo con il mio OK esplicito;
   - aggiorna `PROGRESS.md` e scrivi il prompt per il passo successivo (Rilascio 4, le lingue);
   - dimmi quali skill servono per quel passo.
