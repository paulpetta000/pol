# Prompt per la prossima sessione: itinerari componibili (scritto il 01/10/2026)

Incollare questo testo all'inizio di una sessione nuova.

---

Lavora sul sito "Napoli a Vela" (repository paulpetta000/pol, Astro, online su https://napoli-a-vela.vercel.app dal ramo `main`). Prima leggi `PROGRESS.md`, `PIANO.md` e `README.md`. Parlami in italiano semplice: uso il telefono.

## Regole di lavoro

- Parti da un ramo nuovo creato da `main`. Su `main` non pubblicare niente senza il mio OK esplicito: prima mostrami l'anteprima di Vercel (link e immagini su telefono, tema chiaro e scuro).
- Prima di scrivere codice dimmi in poche righe il piano e fammi al massimo 2-3 domande, se servono davvero.
- Prima di ogni anteprima controlla: build, `npm run check:links`, accessibilità (axe) in chiaro e scuro, Lighthouse su telefono (almeno 95 ovunque), nessuno scorrimento orizzontale a 320 e 390 px, «riduci movimento», nessun errore in console. Aggiorna `PROGRESS.md` e fai commit chiari.
- Tutti i testi stanno in `src/testi/` e passano dai controlli della build (vedi `README.md`, «Testi discorsivi delle pagine»): niente schede con etichette, fonti solo in fondo, `*` sulle informazioni non ufficiali per il 2027, dette anche a parole.
- Aggiorna anche `PIANO.md` (Rilascio 3) con quello che decidiamo qui sotto.

## Rilascio 3 · Itinerari componibili

Gli itinerari hanno **una pagina tutta loro**: non sono un pezzo della pagina Napoli. **Niente link di affiliazione** per ora.

Li voglio **componibili**: la guida propone una serie di cose da fare, e io mi costruisco la giornata aggiungendo e togliendo quello che voglio.

1. **Le tappe.** Un elenco di cose da fare a Napoli: monumenti, musei, chiese, quartieri da girare a piedi, panorami, il lungomare, il cibo di strada. Per ogni tappa:
   - nome, zona e posizione (da OpenStreetMap);
   - quanto tempo serve;
   - orari e prezzi presi dalla fonte ufficiale, con la data «da ricontrollare», perché cambiano spesso;
   - se ci sono gradini o salite, se è al chiuso (utile con il caldo di luglio), se va bene con i bambini, il momento migliore (mattina o sera);
   - una foto con licenza libera e un testo breve scritto con il sistema dei testi.

   Niente locali commerciali (ristoranti, hotel) per ora: arriveranno con i link di affiliazione.
2. **Itinerari pronti come punto di partenza:** mezza giornata, un giorno, due giorni e una «giornata di regata» (in giro la mattina, sul lungomare per le regate nel pomeriggio; gli orari 2027 non sono ancora usciti, quindi va detto a parole). Da lì aggiungo, tolgo e riordino le tappe.
3. **Le distanze contano.** Il sistema deve sapere quanto sono lontane le tappe tra loro e quanto tempo si perde per spostarsi, a piedi o con metro e funicolari.
   - Non deve proporre un posto lontanissimo dagli altri, perché si perde tempo all'andata e al ritorno. Se lo aggiungo io deve dirmelo, per esempio: «È lontano dalle altre tappe: circa 40 minuti tra andata e ritorno. Vuoi metterlo in un altro giorno?».
   - Mette le tappe nell'ordine che fa camminare meno.
   - Mostra il tempo totale (visite più spostamenti) e mi avvisa se la giornata non ci sta.
   - Le gite fuori città (Pompei, Ercolano, Vesuvio, Capri, Ischia, Procida) occupano una giornata intera e non si mescolano con le tappe in città.
4. **Come calcolare le distanze.** Senza servizi esterni, niente Google Maps.
   - Calcolale prima, in fase di build, sulle strade e sulle scale pedonali di OpenStreetMap, come facciamo per la mappa.
   - Tieni conto delle salite: per Vomero e Posillipo meglio la funicolare.
   - Scrivi sempre che i tempi sono stime, e controllane qualcuno a campione.
5. **Sulla mappa.** Le tappe dell'itinerario compaiono sulla nostra mappa fatta con OpenStreetMap, che funziona anche senza rete, numerate e collegate nell'ordine.
6. **Salvare e condividere senza account.**
   - L'itinerario resta sul telefono e si condivide con un link (per esempio su WhatsApp) che apre lo stesso itinerario.
   - Nessun server e nessun dato personale. Deve funzionare anche senza rete.
   - Aggiorna la pagina privacy: oggi dice che nel browser restano solo il tema e la copia per l'uso offline.
7. **Le regole del sito valgono anche qui.**
   - Ogni informazione ha la sua fonte (`src/data/fatti.yaml` e `fonti.yaml`), e orari e prezzi hanno la data da ricontrollare.
   - Le informazioni incerte sono dette a parole, le stime sono presentate come stime.
   - Niente «ufficiale» e niente loghi dell'evento.

## Il design viene prima di tutto

Per me la cosa più importante è il design: la pagina deve essere bella, chiara e facile da usare con una mano sul telefono.

- Prima del codice mostrami 2 proposte di come appare sul telefono, in chiaro e in scuro: l'elenco delle tappe, l'itinerario che si compone, la mappa. Scegliamo insieme, poi costruisci.
- Usa la skill frontend-design, se è attiva.
- Stile coerente con «Regata», quello del sito, ma più ordinato: pochi tipi di riquadri, tanto spazio, gerarchia chiara.
- Aggiungere e togliere una tappa con un tocco; riordinare trascinando, ma anche con i pulsanti (per chi usa la tastiera o un lettore di schermo).
- Stati chiari: itinerario vuoto, giornata piena, tappa lontana.
- Animazioni leggere, che si spengono con «riduci movimento». Accessibilità AA, tocchi di almeno 44 px, Lighthouse almeno 95, nessuno scorrimento orizzontale a 320 px, JavaScript leggero.

## Dopo gli itinerari: il sito più ordinato

Quando gli itinerari sono pronti (o prima, se te lo dico io), rendi il sito più ordinato. Sono le proposte del 01/10/2026:

1. «Dal lungomare» (quasi 22 schermate sul telefono) e «Mappa» (19): schede dei punti più corte (foto piccola, nome e una riga; il resto si apre toccando) e linguette Lungomare / Colline / Posillipo. Nella pagina della mappa solo la mappa e l'elenco dei nomi, senza ripetere le schede.
2. Un riquadro «In breve» in cima alle pagine lunghe, con 3-4 risposte veloci e i link alle parti della pagina.
3. Home più leggera: oggi ha 11 blocchi (quasi 10 schermate). Tenere titolo e conto alla rovescia, «Cosa vuoi fare?», prossimo appuntamento, dove guardare, domande veloci.
4. «Fonti di questa pagina» chiuse a tendina, con il numero delle fonti e la data sempre visibili.
5. Meno tipi di riquadri, più spazio tra un argomento e l'altro.
6. «Avvisami» intero solo nella pagina Biglietti; altrove una riga con un pulsante.
7. Il 3D non in cima alla pagina. In «Squadre» va dopo l'elenco delle 7 squadre e prima di «Da sapere»; nelle pagine delle squadre dopo la storia e prima dei risultati 2026. Nella pagina «Le barche» resta il primo blocco.

## Domande da farmi all'inizio (al massimo 3)

- Gli itinerari: voce nuova nel menu («Itinerari») o dentro «Napoli», sempre in una pagina tutta loro?
- Gli itinerari pronti: mezza giornata, 1 e 2 giorni bastano, o anche 3?
- Il 3D: va bene la posizione del punto 7?
