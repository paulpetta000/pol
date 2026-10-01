# Prompt per la prossima sessione (01/10/2026)

Incollare questo testo all'inizio di una sessione nuova.

---

Lavora sul sito "Napoli a Vela" (repository paulpetta000/pol, Astro, online su https://napoli-a-vela.vercel.app dal ramo `main`). Prima leggi `PROGRESS.md` e `PIANO.md`. Parlami in italiano semplice: uso il telefono.

Regole di lavoro:
- Parti da un ramo nuovo creato da `main`. Su `main` non pubblicare niente senza il mio OK esplicito: prima mostrami l'anteprima di Vercel (link e immagini su telefono, tema chiaro e scuro).
- Prima di scrivere codice dimmi in 10 righe il piano e fammi al massimo 2-3 domande, se servono davvero.
- Prima di ogni anteprima controlla: build, `npm run check:links`, accessibilità (axe), Lighthouse su telefono (almeno 95 ovunque), nessuno scorrimento orizzontale a 320 e 390 px, «riduci movimento». Aggiorna `PROGRESS.md` e fai commit chiari.

## A. Pagine più chiare, meno «telegiornale»

Problema: in 15 pagine le informazioni sono schede una sotto l'altra, e ognuna ha la sua etichetta (Confermato, Dalla stampa…), la scritta «Fonte: …» e «controllato il …». Stanca chi legge. Una guida deve prima di tutto spiegare in modo chiaro.

Le pagine sono: `/archivio-2026/`, `/calendario/`, `/capire-la-coppa/`, `/come-vederla/` (e le sue 4 sottopagine), `/napoli/` (e le sue 3 sottopagine), `/squadre/`, `/squadre/barche/` e le 7 pagine delle squadre.

Cosa voglio:
1. **Testi scritti bene.** Unisci le schede in brevi testi discorsivi, per argomento, con titoletti e paragrafi corti. Italiano naturale, dando del «tu», come lo scriverebbe una persona che conosce Napoli e la vela. Non deve sembrare scritto da un'intelligenza artificiale: niente elenchi di frasi tutte uguali, niente formule da comunicato («è importante sottolineare», «in conclusione», «panorama», «fondamentale»), niente trattini lunghi a ogni riga. Prima la risposta alla domanda di chi legge, poi i dettagli.
2. **Via dai paragrafi** le etichette di stato, «Fonte: …» e «controllato il …».
3. **Le fonti solo in fondo alla pagina**, come lista con i link (la sezione «Fonti di questa pagina» esiste già), con una sola data «informazioni controllate il …».
4. **Regola da non perdere:** ogni informazione deve avere ancora la sua fonte nei dati (`src/data/fatti.yaml` e `fonti.yaml`), e la build deve fermarsi se manca. I testi nuovi devono dichiarare quali schede usano, così l'elenco in fondo è sempre completo. L'avviso «scheda da ricontrollare» deve restare.
5. **Onestà sulle informazioni incerte.** Quelle non confermate (stato «stampa» o «atteso», o riferite al 2024 o al 2026) devono dirlo dentro la frase («secondo la stampa…», «non è ancora stato annunciato», «nel 2024 era così»), con al massimo un piccolo segno discreto e una breve legenda in fondo. Le informazioni confermate non hanno nessuna etichetta.
6. **Metodo:** prima UNA pagina campione (per esempio `/capire-la-coppa/`, sezioni «Il formato 2027» e «Da sapere»). Mostrami il prima e il dopo. Solo dopo il mio OK fai le altre.

## B. Squadre: il 3D in alto

Nella sezione Squadre oggi vengono prima le schede e la barca in 3D è in fondo (un riquadro con il link «Le barche»). Voglio il contrario: in alto la barca in 3D, oppure la sua immagine con il pulsante per avviarlo, e sotto il testo. Controlla anche `/squadre/barche/` (il 3D deve restare per primo) e le pagine delle singole squadre.

## C. Parte legale: lavora da «avvocato» (ricerca e bozze)

Premessa: non ho ancora un avvocato, ne parlerò con uno più avanti. Tu prepari tutto il lavoro. Cerca su internet le fonti ufficiali (Garante per la protezione dei dati personali, GDPR, norme italiane sui siti web, marchi e pubblicità) e cita sempre link e data: non scrivere a memoria e non inventare leggi o numeri di articolo; se una fonte non la trovi, scrivilo. Scrivi in italiano chiaro, per persone normali, non in burocratese. Cose da fare:
1. **Privacy e cookie:** rivedi la pagina esistente. Verifica davvero cosa il sito salva nel browser e quali servizi esterni contatta (YouTube, Supabase per «Avvisami», OpenStreetMap, ecc.).
2. **Termini e condizioni d'uso** (pagina nuova): sito indipendente e non ufficiale; informazioni a scopo informativo che possono cambiare; limiti di responsabilità ragionevoli; link esterni; foto e contenuti di terzi; il 3D come «ricostruzione non ufficiale»; proprietà intellettuale; legge applicabile.
3. **Marchi e nomi:** il nome del sito è «Napoli a Vela», ma le pagine nominano «America's Cup», «Louis Vuitton Cup» e le squadre. Analizza il rischio (uso descrittivo del nome per parlare dell'evento) e proponi le formule e gli avvisi giusti per titoli, descrizioni, indirizzo e testi.
4. **Gioco dei pronostici (Rilascio 3):** analisi su concorsi a premio e giochi, senza premi in denaro, e bozza del regolamento.
5. **Link di affiliazione (Rilascio 4):** diciture per la pubblicità riconoscibile.
6. **File `LEGALE.md`** (non pubblicato sul sito): cosa hai deciso e perché, le fonti con i link, i punti incerti e le domande da fare all'avvocato, in ordine di rischio.

Sul sito non scrivere mai che i testi sono «approvati da un avvocato». Metti la data di ultimo aggiornamento.
