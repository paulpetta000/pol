# Prompt · Blocco 2 di 3 · Itinerari: la pagina (scritto il 01/10/2026)

Incollare questo testo all'inizio di una sessione nuova, dopo aver finito il blocco 1.

---

Lavora sul sito "Napoli a Vela" (repository paulpetta000/pol, Astro, online su https://napoli-a-vela.vercel.app dal ramo `main`). Prima leggi `PROGRESS.md`, `PIANO.md` e `README.md`. Parlami in italiano semplice: uso il telefono.

Questo è il **blocco 2 di 3** del Rilascio 3:
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
- Skill per questo blocco: frontend-design, Modern Web Guidance e VectorLab UI/UX Skills. Se ti serve una skill che non è attiva, dimmelo invece di andare avanti senza.

## Blocco 2 · Itinerari: la pagina

Nel blocco 1 abbiamo preparato le tappe e le distanze e scelto il design. Leggi in `PROGRESS.md` le decisioni: proposta scelta, modifiche chieste, posto nel menu, durate. In questo blocco costruisci la pagina degli itinerari componibili.

### Cosa costruire

1. **La pagina tutta per gli itinerari**, nel posto deciso, con il design scelto.
2. **Gli itinerari pronti** come punto di partenza: le durate decise e una «giornata di regata» (in giro la mattina, sul lungomare per le regate nel pomeriggio). Gli orari delle regate 2027 non sono ancora usciti: va detto a parole.
3. **Il compositore:**
   - aggiungere e togliere una tappa con un tocco; riordinare trascinando, ma anche con i pulsanti (per chi usa la tastiera o un lettore di schermo);
   - il tempo totale, visite più spostamenti, e l'ordine che fa camminare meno;
   - l'avviso quando una tappa è lontana dalle altre e quando la giornata non ci sta;
   - uno stato vuoto chiaro;
   - le gite fuori città come giornata intera, che non si mescolano con le tappe in città.
4. **La mappa:** le tappe sulla nostra mappa fatta con OpenStreetMap, che funziona anche senza rete, numerate e collegate nell'ordine.
5. **Salvare e condividere senza account:** l'itinerario resta sul telefono e si manda con un link (per esempio su WhatsApp) che apre lo stesso itinerario. Nessun server e nessun dato personale; deve funzionare anche senza rete. Aggiorna la pagina privacy: oggi dice che nel browser restano solo il tema e la copia per l'uso offline.
6. **I collegamenti:** dal menu (o da «Napoli», come deciso), dalla home («Cosa vuoi fare?») e dalle pagine «Napoli» e «Come arrivare».
7. Animazioni leggere che si spengono con «riduci movimento», accessibilità AA, JavaScript leggero, Lighthouse almeno 95.

### Fine del blocco: fermati per la revisione

Quando hai finito, **fermati** e mandami:

1. il link dell'anteprima di Vercel e le immagini da telefono, in chiaro e in scuro: la pagina, un itinerario composto, l'avviso della tappa lontana, la mappa;
2. un breve elenco di prove da fare io sul telefono (per esempio: «componi la giornata di regata e mandala su WhatsApp»);
3. i risultati dei controlli.

Dopo il mio OK:

- porta tutto su `main` e aggiorna `PROGRESS.md`;
- dimmi quali skill accendere o spegnere per il blocco 3, e se ne serve qualcun'altra.

Non iniziare il blocco 3: lo faccio partire io in una sessione nuova, dopo aver sistemato le skill.
