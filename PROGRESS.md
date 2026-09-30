# PROGRESS

_Ultimo aggiornamento: 30/09/2026_

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

## Da fare
- Rilascio 2: la regata in 60 secondi, video ufficiali, AC75 in 3D e confronto, "Capire la Coppa" (glossario, storia, quiz dal sito 2026 in `ricerca/sito-2026/`).
- Rilasci 3-5 come da `PIANO.md`.
- Quando escono: orari 2027, biglietti e tribune, ordinanza della Capitaneria, piano trasporti, mappa ufficiale del campo. Aggiornare le schede "Non ancora uscito".

## Cose che devi fare tu
1. **Vercel → Production Branch = `main`.** Non si può fare dalle API: Vercel → progetto *coppa-america-napoli* → **Settings → Environments → Production → Branch Tracking** (nelle versioni vecchie: Settings → Git → Production Branch) → scrivi `main` → Save.
2. **Guardare l'anteprima sul telefono** (serve essere collegati a Vercel) e dire cosa cambiare.
3. ~~Nome ed email del titolare~~ (fatto il 30/09/2026: Enrico Licenziati, napoliavela.guida@gmail.com).
4. Dopo il tuo OK: unire il ramo in `main` per pubblicare il Rilascio 1.
5. Far vedere a un avvocato l'elenco del punto 8 di `PIANO.md` e i testi di privacy e note legali.

## Note
- La versione pubblica su Vercel è ancora quella del 2026 finché non si pubblica su `main`.
- Aggiornare un'informazione: modificare la scheda in `src/data/fatti.yaml` (e la fonte in `src/data/fonti.yaml`), cambiare la data `controllato`. Vedi `README.md`.
- Rigenerare la mappa: `scripts/mappa/scarica.sh <cartella>` e poi `node scripts/mappa/costruisci.mjs <cartella>`.
- Leggere le iscrizioni ad Avvisami: dalla dashboard Supabase (Table editor → `avvisami`).
- Supabase gratuito va in pausa dopo 7 giorni senza attività: se succede, riattivarlo dalla dashboard (le iscrizioni restano). Un controllo automatico si può aggiungere al Rilascio 3.

## Effort consigliato per il prossimo passo
- Rilascio 2 → effort alto (come per il Rilascio 1).
