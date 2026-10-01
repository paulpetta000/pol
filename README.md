# Napoli a Vela · Guida per il 2027

Sito statico in [Astro](https://astro.build), pubblicato su Vercel.

## Comandi

```sh
npm install
npm run dev      # sito in locale su http://localhost:4321
npm run build    # costruisce il sito in dist/
npm run check:links  # dopo la build: controlla che ogni link interno porti a una pagina o a un file
```

## Dove sono le informazioni

| File | Cosa contiene |
|---|---|
| `src/data/fatti.yaml` | Le schede: testo, stato (`confermato` / `stampa` / `atteso`), fonti, data di controllo, data entro cui ricontrollare |
| `src/data/fonti.yaml` | Le fonti, con indirizzo e data di controllo |
| `src/data/eventi.ts` | Il calendario 2027 (anche i file .ics) |
| `src/data/squadre.yaml` | Le 7 squadre |
| `src/data/luoghi.yaml` | Punti della mappa e schede "Dove mi metto?" (gruppo, fonte `perche`, foto) |
| `src/data/foto.yaml` | Foto con licenza libera: file in `src/assets/foto/`, autore, licenza, origine, descrizione |
| `src/data/faq.yaml` | Domande frequenti |
| `src/data/risultati-2026.json` | Risultati ufficiali 2026 |
| `src/config/sito.ts` | Nome del sito, titolare, date chiave |
| `src/data/glossario.yaml` | Glossario di Capire la Coppa (ogni voce con fonte) |
| `src/data/storia.yaml`, `src/data/albo.ts` | Tappe della storia e albo d'oro dal 1983 |
| `src/data/quiz.yaml` | Domande del quiz, con spiegazione e scheda o fonte |
| `src/data/video.yaml` | Video del canale ufficiale (codice YouTube, titolo nostro, durata) |
| `src/data/tappe-ac75.json`, `src/data/tappe-ac40.json` | Le tappe del 3D |

Stati delle schede: `confermato`, `stampa` (giornali), `segnalato` (blog e siti non ufficiali), `atteso`.

Regola: **nessuna informazione senza fonte**. Se una scheda non ha fonte, stato o data, la build si ferma.
Quando una scheda supera la data `ricontrollare`, la build scrive un avviso `[da ricontrollare]`.

## Aggiornare un'informazione

1. Apri la fonte e controlla.
2. Cambia il `testo` della scheda in `fatti.yaml`, lo `stato` se serve, e la data `controllato`.
3. Se la fonte è nuova, aggiungila in `fonti.yaml`.
4. `npm run build` per controllare.

## Altro

- Mappa: `scripts/mappa/` (dati © OpenStreetMap, ODbL). Il riquadro è in `scripts/mappa/riquadro.mjs`; per rifarla: `node scripts/mappa/scarica.mjs <cartella>` e poi `node scripts/mappa/costruisci.mjs <cartella>`.
- Font: `scripts/font/prepara.py` (licenza SIL OFL).
- Logo: `src/lib/logo.mjs`; icone dell'app e favicon: `node scripts/icone.mjs`.
- Un nuovo punto panoramico entra solo con due fonti indipendenti, o una fonte affidabile più i dati di OpenStreetMap; aggiungilo anche in `ORDINE_VISTE` (`src/lib/luoghi.ts`).
- Database "Avvisami": `supabase/migrations/`.
- Motore 3D: `src/lib/3d/`. Le misure di AC75 e AC40 stanno nella tabella `CLASSI` di `src/lib/3d/b3/model.js`; `mount(stage, { classe: 'ac75' | 'ac40' | 'confronto' })`. Con `?b3q=low` si prova la qualità più bassa.
- Immagini fisse del 3D (`src/assets/barche/ac75.jpg`, `ac40.jpg`, `confronto.jpg`): sono schermate del 3D stesso, a 2x, senza pulsanti. Se cambi il modello, rifalle con `node scripts/barche-immagini.cjs` (serve Playwright; istruzioni in testa al file).
- La regata in 60 secondi: `src/lib/regata60.ts` (percorsi, scritte, testi delle scene). Con `?r60t=43` il lettore si apre fermo a quell'istante.
- Un nuovo video entra solo se è del canale ufficiale e si può incorporare: prova `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=CODICE` (deve rispondere 200).
