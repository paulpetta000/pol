# Prompt per la prossima sessione (scritto il 01/10/2026)

Incollare questo testo all'inizio di una sessione nuova.

---

Lavora sul sito "Napoli a Vela" (repository paulpetta000/pol, Astro, online su https://napoli-a-vela.vercel.app dal ramo `main`). Prima leggi `PROGRESS.md`, `PIANO.md` e `README.md`. Parlami in italiano semplice: uso il telefono.

Regole di lavoro:
- Parti da un ramo nuovo creato da `main`. Su `main` non pubblicare niente senza il mio OK esplicito: prima mostrami l'anteprima di Vercel (link e immagini su telefono, tema chiaro e scuro).
- Prima di scrivere codice dimmi in poche righe il piano e fammi al massimo 2-3 domande, se servono davvero.
- Prima di ogni anteprima controlla: build, `npm run check:links`, accessibilità (axe), Lighthouse su telefono (almeno 95 ovunque), nessuno scorrimento orizzontale a 320 e 390 px, «riduci movimento». Aggiorna `PROGRESS.md` e fai commit chiari.

## Riscrivere tutte le pagine come la pagina campione

Il 01/10/2026 la pagina `/capire-la-coppa/` (sezione «I numeri da sapere») è stata riscritta con il nuovo sistema dei testi ed è online: testi discorsivi al posto delle schede, fonti solo in fondo con una sola data, segno `*` per le informazioni non ufficiali. Il sistema è in `src/testi/`, `src/lib/testi.ts` e `src/components/Testo.astro` (vedi `README.md`).

Fai lo stesso su **tutte** le altre pagine del sito, non solo su alcune: home, `/come-vederla/` e le 4 sottopagine, `/calendario/`, `/napoli/` e le 3 sottopagine, `/squadre/`, `/squadre/barche/` (anche la tabella dei numeri), le 7 pagine delle squadre, le sottopagine di `/capire-la-coppa/`, `/archivio-2026/`, `/domande-frequenti/` e le schede dei punti panoramici (`Spot`). Alla fine togli i componenti `Fatti` e `Fatto` se non servono più e aggiorna la pagina `/fonti/`.

Come scrivere:
1. Testi chiari, per argomento, con titoletti e paragrafi corti. Italiano naturale, dando del «tu», come lo scriverebbe una persona che conosce Napoli e la vela. Prima la risposta alla domanda di chi legge, poi i dettagli. Niente elenchi di frasi tutte uguali, niente formule da comunicato («è importante sottolineare», «in conclusione», «panorama», «fondamentale»), niente trattini lunghi a ogni riga.
2. Ogni informazione deve avere la sua scheda in `src/data/fatti.yaml` con la fonte in `src/data/fonti.yaml`. Niente fatti nuovi senza fonte.
3. Le informazioni non confermate per il 2027 lo dicono nella frase («secondo la stampa», «non è ancora uscito», «nel 2024 era così») e hanno il segno `{?id-scheda}`: la build controlla tutto.
4. Mostrami prima 2-3 pagine finite, poi le altre.
