# PROGRESS

_Ultimo aggiornamento: 30/09/2026 (Rilascio 2 pubblicato)_

## Fatto
- **Fase 1 (piano) completata**: vedi `PIANO.md`.
- Ricerca 2027 salvata in `ricerca/`.
- Ramo `main` su GitHub; progetto Supabase gratuito `coppa-america-napoli` (Francoforte, id `hcicqbcmtfksraabphie`); collegamento GitHub → Vercel funzionante.
- **Rilascio 1 · Base costruito** (30/09/2026) sul ramo `claude/sharp-archimedes-nusxet`, in anteprima su Vercel. Contiene:
  - Sito nuovo in **Astro 7**, stile B **"Regata"**, tema chiaro e scuro (automatico + tasto), font salvati sul sito (Archivo, IBM Plex Mono), icone disegnate, bandiere vere in SVG.
  - Pagine: home "Cosa vuoi fare?", Vederla (lungomare, mare, biglietti e ospitalità, TV), Calendario, Napoli (mappa, come arrivare, accessibilità), Squadre (7 schede + barche con il 3D dell'AC40), Archivio 2026, Domande frequenti (23), Fonti, Privacy, Note legali, Accessibilità, pagina offline, 404.
  - **Schede con fonte**: circa 100 informazioni in `src/data/fatti.yaml`, ognuna con stato (Confermato / Dalla stampa / Non ancora uscito), fonte e data di controllo. Senza fonte la build si ferma; se la data "da ricontrollare" è passata la build avvisa.
  - **Fonti ufficiali verificate** ora che la rete le apre: date 2027, formato Louis Vuitton Cup, Protocollo definitivo, Rai, Race Village e Bagnoli, taxi a tariffa fissa (PDF del Comune), orari ANM 2026, risultati ufficiali 2026 regata per regata.
  - **Mappa su misura** dai dati OpenStreetMap (costa, strade, parchi, stazioni), con 8 punti "Dove mi metto?" (sole, gradini, folla: valutazioni nostre). Campo di regata e villaggi segnati come **zone indicative**.
  - **Calendario da seguire**: file .ics per tutto il 2027 e uno per ogni squadra (si aggiornano da soli).
  - **Avvisami**: salva le email su Supabase (tabella `avvisami`, solo inserimento, limite di 20 iscrizioni al minuto). Nessuna email viene inviata per ora. Provato: iscrizione, doppione, consenso mancante, lettura bloccata.
  - **App installabile e offline**: le pagine pratiche restano disponibili senza rete.
  - **SEO**: titoli e descrizioni per pagina, sitemap, dati strutturati (eventi, domande frequenti, squadre), immagine di anteprima per ogni pagina.
  - **Lighthouse mobile** (in locale): 99–100 in prestazioni, accessibilità, best practice e SEO su home, calendario, barche, archivio, mappa.

- **Rilascio 1.1 · "Napoli a Vela"** (30/09/2026, ramo `claude/sharp-archimedes-nusxet`, solo anteprima):
  - Nuovo nome **Napoli a Vela** (intestazione, piè di pagina, titoli, app, anteprime, calendari .ics, pagine legali). Nuovo indirizzo gratuito **napoli-a-vela.vercel.app**; il vecchio `coppa-america-napoli.vercel.app` doveva reindirizzare al nuovo con una regola in `vercel.json`, ma al controllo del 30/09/2026 (dopo il Rilascio 2) **il reindirizzamento non scatta**: il vecchio indirizzo mostra il sito. Vedi «Cose che devi fare tu», punto 6.
  - Nuovo logo "Golfo e Vesuvio" (scelto tra 4 proposte): intestazione, favicon, icone dell'app, immagini di anteprima. Si rigenera con `node scripts/icone.mjs`.
  - Home: al posto del disegno, **foto vera di due AC75 in regata** (Auckland 2021, Geoff McKay, CC BY 2.0).
  - **Foto dei luoghi** con licenza libera (Wikimedia Commons) in 8 schede su 11, con didascalia, autore, licenza e link; elenco in `src/data/foto.yaml` e nelle note legali. Mancano foto adatte per via Aniello Falcone, via Petrarca e la terrazza di Sant'Antonio a Posillipo.
  - **Calendario mese per mese** (maggio, giugno, luglio 2027) al posto del grafico a barre; versione compatta in home.
  - **Mappa interattiva**: si sposta con un dito, si ingrandisce con due dita o con + e −, pulsante per tornare alla vista iniziale, tocco su un punto = scheda. Simboli sempre della stessa misura. Resta disegnata da noi, offline.
  - **Punti da cui guardare**: tolti Parco Virgiliano e Capo Posillipo; aggiunti via Aniello Falcone e via Tasso, belvedere della Villa Floridiana, via Orazio, via Petrarca, terrazza di Sant'Antonio a Posillipo. 11 punti in 3 gruppi (Lungomare 1–4, Colline 5–8, Posillipo 9–11), ognuno con stato e fonte. Nuovo stato **"Segnalato da siti non ufficiali"**.
  - Più colore: fasce turchesi, piè di pagina blu notte, riga arancio-turchese-blu sotto i titoli, illustrazioni per argomento (taxi, metro, barca, calendario, mappa, binocolo, squadre).

- **Rilascio 2 · "Spiegazioni e 3D" pubblicato** (30/09/2026, dopo il tuo OK): costruito sul ramo `ccr-64b507b1-t4ste6` e portato su `main`. Contiene:
  - Nuova sezione **Capire la Coppa** (`/capire-la-coppa/`), sotto Squadre nel menu, collegata da home, pagina Squadre, piè di pagina e domande frequenti.
  - **La regata in 60 secondi**: disegno animato in 6 scene (campo e vento, partenza, bolina, poppa, precedenze e penalità, arrivo e come si vince) con play, pausa e scene. Con «riduci movimento» o senza JavaScript diventa 6 immagini ferme con didascalia. Modello in `src/lib/regata60.ts`; per i controlli `?r60t=43` apre il lettore fermo a quell'istante.
  - **Video**: 8 video del canale ufficiale, verificati con l'oEmbed di YouTube; copertina disegnata da noi e YouTube (youtube-nocookie) caricato solo al tocco. Privacy e note legali aggiornate. Elenco in `src/data/video.yaml`.
  - **Glossario** (35 parole), **Storia** (14 tappe e tutti i Match dal 1983), **Quiz** (12 domande con spiegazione e fonte): `src/data/glossario.yaml`, `storia.yaml`, `albo.ts`, `quiz.yaml`. Ogni voce ha la sua fonte, altrimenti la build si ferma.
  - **Schede dell'AC75 riscritte dalla regola di classe ufficiale** (AC75 Class Rule V3.05): 20,70 m, 5 m, albero 26,5 m, 6.435 kg in regata, 6 pozzetti, foil. Regole di regata del 2024 segnate «Com'era nel 2024». Note di ricerca in `ricerca/2026-09-30-rilascio-2.json`.
  - **Motore 3D parametrico**: stesso codice per AC40 e AC75 (`src/lib/3d/b3/model.js`, tabella `CLASSI`), zoom con due dita e tasti + e −.
  - **Pagina barche rifatta** (`/squadre/barche/`): selettore **AC75 / AC40 / Affiancate**. L'AC75 ha il suo giro in 13 tappe (`src/data/tappe-ac75.json`): testa d'albero, randa, fiocco, 5 velisti e un ospite, batterie viste in trasparenza, scafo, foil alzato, pelo dell'acqua, braccio, ala e timone sott'acqua. «Affiancate» mette le due barche in fila alla stessa scala (di lato, di tre quarti, dall'alto). Ogni tappa riparte dalla sua inquadratura anche se prima hai ruotato o ingrandito.
  - **Disegno in scala** (`src/components/ConfrontoScala.astro`): AC75 e AC40 in volo di fianco, con una persona di 1,8 m, disegnati dallo stesso modello del 3D. **Tabella dei numeri** con la fonte sotto ogni riga.
  - **Immagine fissa** per ogni modo (`src/assets/barche/`, rigenerabile dal 3D): la vedi prima di avviare il 3D e resta se il dispositivo non lo supporta, con un messaggio.
  - **Controlli** (in locale, telefono simulato): Lighthouse 99–100 in prestazioni, accessibilità, best practice e SEO su home, Capire la Coppa, video, glossario, storia, quiz e barche; axe senza violazioni; nessun errore in console; «riduci movimento» provato; 1559 link interni tutti validi (`npm run check:links`, script aggiunto ora: prima mancava).

## Da fare
- Rilasci 3-5 come da `PIANO.md`.
- Quando escono: orari 2027, biglietti e tribune, ordinanza della Capitaneria, piano trasporti, mappa ufficiale del campo. Aggiornare le schede "Non ancora uscito".

- **Controllo UX con la skill UI/UX Pro Max** (01/10/2026, solo ramo di lavoro): su 31 pagine a 390 px, tutti i bersagli da toccare ora sono almeno 44 px (prima: i due link del logo erano 34 e 30 px) e nessun testo è sotto 12 px (prima: 248 testi tra 10,2 e 11,8 px, tutte etichette in maiuscolo). Nessuno scorrimento orizzontale a 320 e 390 px. La skill, provata e poi tolta dal progetto (il suo generatore di «design system» non era adatto al sito), non c'è più; restano i risultati del controllo e le piccole modifiche, solo sul ramo di lavoro (non su `main`).

## Cose che devi fare tu
1. **Vercel → Production Branch = `main`.** Non si può fare dalle API: Vercel → progetto *coppa-america-napoli* → **Settings → Environments → Production → Branch Tracking** (nelle versioni vecchie: Settings → Git → Production Branch) → scrivi `main` → Save.
2. **Guardare l'anteprima sul telefono** (serve essere collegati a Vercel) e dire cosa cambiare.
3. ~~Nome ed email del titolare~~ (fatto il 30/09/2026: Enrico Licenziati, napoliavela.guida@gmail.com).
4. ~~Pubblicare su `main`~~ (fatto il 30/09/2026: Rilascio 1, 1.1 e 2 online).
5. Far vedere a un avvocato l'elenco del punto 8 di `PIANO.md` e i testi di privacy e note legali.
6. **Reindirizzare il vecchio indirizzo** (1 minuto): Vercel → progetto *coppa-america-napoli* → **Settings → Domains** → `coppa-america-napoli.vercel.app` → **Edit** → «Redirect to» `napoli-a-vela.vercel.app`, codice 308 (permanente) → **Save**. La regola in `vercel.json` non sta funzionando; dopo la modifica si può togliere.

## Note
- Sito pubblico: https://napoli-a-vela.vercel.app (ramo `main`).
- Aggiornare un'informazione: modificare la scheda in `src/data/fatti.yaml` (e la fonte in `src/data/fonti.yaml`), cambiare la data `controllato`. Vedi `README.md`.
- Rigenerare la mappa: `scripts/mappa/scarica.sh <cartella>` e poi `node scripts/mappa/costruisci.mjs <cartella>`.
- Leggere le iscrizioni ad Avvisami: dalla dashboard Supabase (Table editor → `avvisami`).
- Supabase gratuito va in pausa dopo 7 giorni senza attività: se succede, riattivarlo dalla dashboard (le iscrizioni restano). Un controllo automatico si può aggiungere al Rilascio 3.

## Effort consigliato per il prossimo passo
- Rilascio 3 (Pronostici) → effort alto.
