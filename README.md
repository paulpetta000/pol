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
| `src/testi/*.yaml` | I testi discorsivi delle pagine, con le schede che usano (vedi sotto) |
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
| `src/data/tappe.yaml` | Le tappe degli itinerari (51 in città e 9 gite): posizione, durata, schede di orari e prezzi, foto (vedi «Itinerari») |
| `src/data/locali.yaml` | I 32 locali di «Dove mangiare» (`/napoli/dove-mangiare/`): orari giorno per giorno, cucina, prezzo base, piatti; nel compositore sono tappe in città (vedi «Itinerari») |
| `src/data/tempi-tappe.json` | I tempi tra le tappe, calcolati da `scripts/itinerari/` (non si modifica a mano) |
| `src/data/partenze-bus.json`, `src/data/percorsi-alternativi.json` | Orari veri dei bus: partenze ANM per tipo di giorno e disegni delle strade alternative (calcolati da `scripts/itinerari/`; pagine `/napoli/itinerari/partenze.json` e `percorsi-alternativi.json`). Specifica: `specifiche/bus-orari-veri.md` |
| `src/data/linee-bus.json` | Tutte le fermate delle 13 linee bus usate, con le frequenze (dal feed ANM, calcolato da `scripts/itinerari/`; per tappe e locali futuri) |

Stati delle schede: `confermato`, `stampa` (giornali), `segnalato` (blog e siti non ufficiali), `atteso`.

Regola: **nessuna informazione senza fonte**. Se una scheda non ha fonte, stato o data, la build si ferma.
Quando una scheda supera la data `ricontrollare`, la build scrive un avviso `[da ricontrollare]`.

## Testi discorsivi delle pagine

Nessuna pagina mostra le schede una per una: tutte hanno testi normali, scritti in `src/testi/<pagina>.yaml` (un blocco per argomento) e mostrati con `<Testo b={T.b('nome')} />` dopo `const T = await getTesti('<pagina>')`. Le fonti finiscono da sole in fondo alla pagina (`<FontiPagina testi={T} />`; con più file di testi `testi={[T, P]}`).

```yaml
formato:
  usa: [cal-flotta, cal-rr]          # le schede di fatti.yaml usate dal testo
  testo: |
    ### Titoletto

    Paragrafo. **Grassetto**, *corsivo*, [link](/calendario/).

    Secondo la stampa i percorsi avevano 8 lati{?reg-percorso}.
```

Regole controllate dalla build (se non sono rispettate si ferma):
- ogni scheda in `usa` deve esistere, con la sua fonte; per un consiglio nostro senza fonte si scrive `senzaFonte: "perché"`;
- un'informazione non confermata per il 2027 (stato `stampa`, `segnalato` o `atteso`, oppure `anno` 2024 o 2026) va segnata con `{?id}` (sul sito diventa un piccolo `*`, spiegato in fondo) e la frase deve dirlo a parole: «secondo la stampa», «non è ancora uscito», «nel 2024»…;
- ogni testo è «firmato» con le schede che usava quando è stato scritto (`src/testi/firme.json`): se una scheda cambia, la build si ferma finché qualcuno non rilegge il testo e lo firma di nuovo con `npm run testi:firma`.

Altre cose utili:
- un blocco può avere anche `fonti: [id]` (fonti senza scheda, per esempio OpenStreetMap o le fonti di una squadra) e `voci:` (elenchi di `num` e `testo`: le cifre in evidenza, le tariffe dei taxi, la tabella AC75–AC40). Le voci valgono con la prima frase del blocco: se dice «Nel 2026 funzionava così», le voci non devono ripeterlo;
- i risultati del passato hanno `storico: true` in `fatti.yaml`: la frase dice l'anno, ma non serve il `*`;
- un `*` per frase al massimo: se una frase usa più schede, si scrive `{?id1,id2}` alla fine;
- dove sono i testi: un file per pagina (`home.yaml`, `calendario.yaml`, `dal-lungomare.yaml`…), `punti.yaml` per le schede dei punti panoramici (stesso id di `luoghi.yaml`), `domande-frequenti.yaml` per le risposte (stesso id di `faq.yaml`), `quiz.yaml` per le spiegazioni del quiz (stesso id di `quiz.yaml` in `src/data`), `squadra-<id>.yaml` per storia, «da sapere» e protagonisti di ogni squadra, `squadre-2027.yaml` per le parti comuni alle 7 squadre.

## Aggiornare un'informazione

1. Apri la fonte e controlla.
2. Cambia il `testo` della scheda in `fatti.yaml`, lo `stato` se serve, e la data `controllato`.
3. Se la fonte è nuova, aggiungila in `fonti.yaml`.
4. `npm run build` per controllare. Se la scheda è usata da un testo in `src/testi/`, rileggi il testo, correggilo e poi `npm run testi:firma`.

## Itinerari (Rilascio 3)

- **Locali** (blocco C, 04/10/2026): `src/data/locali.yaml`, controllati da `src/lib/locali.ts` (le ore di «apertura» devono comparire nella scheda `lc-<id>-orari`; la fascia di prezzo la calcola la build dal «prezzoBase»). Schede e fonti con id `lc-`, testi brevi in `src/testi/locali.yaml`, testi della pagina e due righe sui piatti in `src/testi/dove-mangiare.yaml`. I locali entrano nei tempi tra le tappe: dopo averne aggiunto o spostato uno, rifare i tempi con `scripts/itinerari/`.
- **Tappe**: `src/data/tappe.yaml`. Orari, prezzi e viaggi delle gite sono schede in `fatti.yaml` con id che cominciano con `tp-` (fonti e foto anche); i testi brevi stanno in `src/testi/tappe.yaml` (stesso id della tappa). Con `ITINERARI_ONLINE` (in `src/config/sito.ts`) a `false` le pagine Fonti e Note legali non mostrano niente con id `tp-`; dal blocco 2 è `true`.
- **Tempi tra le tappe**: `node scripts/itinerari/scarica.mjs <cartella>` scarica strade, scale, ascensori e linee da OpenStreetMap, le quote Copernicus e gli orari degli autobus ANM (feed GTFS, letto da `scripts/itinerari/gtfs.mjs`); `node scripts/itinerari/costruisci.mjs <cartella>` scrive `src/data/tempi-tappe.json` (giorno feriale, sabato, sabato dopo le 14:50, domenica mattina, domenica pomeriggio, solo a piedi) e `src/data/percorsi-tappe.json` (il disegno dei percorsi per la mappa, compresso). Se una tappa nuova o spostata non è nei tempi, la build si ferma. Metodo e controlli: `ricerca/2026-10-02-itinerari-distanze.md`. I parametri (velocità, attese, linee chiuse come la funicolare di Montesanto, le linee bus e le fasce orarie nella tabella `BUS`) sono in testa allo script. Da dove vengono i dati e come si rinnovano: `aggiornamenti/`.
- **Bozzetti del design**: `design/itinerari/` (non fanno parte del sito). `node design/itinerari/genera.mjs <cartella>` rifà le due proposte in HTML con i dati veri; `node design/itinerari/foto.cjs <uscita> <percorso di playwright-core>` le fotografa come schermate da telefono, in chiaro e in scuro.
- **La pagina** `/napoli/itinerari/` (`src/pages/napoli/itinerari/`): il compositore. Il calcolo (orari, avvisi, ordine più corto, link) sta in `src/lib/itinerari/` e non sa niente di Napoli: la città arriva come dati da `napoli.ts` (tappe, tempi, miniature, giorni delle regate da `src/data/eventi.ts`). Lo script della pagina è in `src/scripts/itinerari/` (`app.ts`; `mappa.ts` si carica solo quando apri la mappa; `memoria.ts` salva nel browser; `trascina.ts` per riordinare). Stile in `src/styles/itinerari.css`; caratteri Barlow con `node scripts/font/barlow.mjs`.
- **Itinerari pronti**: `src/data/itinerari-pronti.yaml` (descrizioni in `src/testi/itinerari.yaml`, blocchi `pronto-<id>`). La build li ricalcola: si ferma se un giorno non ci sta negli orari, se una tappa è lontana dalle altre, se si arriva tardi alle regate o se esiste un ordine più corto di almeno 5 minuti (e lo stampa).
- **Link condivisi**: tutto dopo il «#» (`n` nome, `d` data del primo giorno, `w=1` solo a piedi, `g` un giorno: `0930-1900.duomo.sansevero`, `@pompei` per una gita). Un link vecchio con una tappa che non esiste più si apre lo stesso, senza quella tappa.

## Altro

- Mappa: `scripts/mappa/` (dati © OpenStreetMap, ODbL). Il riquadro è in `scripts/mappa/riquadro.mjs`; per rifarla: `node scripts/mappa/scarica.mjs <cartella>` e poi `node scripts/mappa/costruisci.mjs <cartella>`.
- Font: `scripts/font/prepara.py` (licenza SIL OFL).
- Logo: `src/lib/logo.mjs`; icone dell'app e favicon: `node scripts/icone.mjs`.
- Un nuovo punto panoramico entra solo con due fonti indipendenti, o una fonte affidabile più i dati di OpenStreetMap; aggiungilo anche in `ORDINE_VISTE` (`src/lib/luoghi.ts`).
- Database "Avvisami" e statistiche del tempo sulle pagine (tabella `letture`, viste `letture_per_giorno` e `letture_per_pagina`): `supabase/migrations/`.
- Statistiche: partono solo sul sito pubblico (`src/scripts/sito.ts`) e mai con «Do Not Track» o «Global Privacy Control».
- 3D in alto in Squadre e nelle pagine delle squadre: `src/components/Barca3D.astro`. Le immagini con i colori delle squadre si rifanno con `node scripts/barche-immagini.cjs <indirizzo> '' nz,gb,al,fr,us,au`.
- Motore 3D: `src/lib/3d/`. Le misure di AC75 e AC40 stanno nella tabella `CLASSI` di `src/lib/3d/b3/model.js`; `mount(stage, { classe: 'ac75' | 'ac40' | 'confronto' })`. Con `?b3q=low` si prova la qualità più bassa.
- Immagini fisse del 3D (`src/assets/barche/ac75.jpg`, `ac40.jpg`, `confronto.jpg`): sono schermate del 3D stesso, a 2x, senza pulsanti. Se cambi il modello, rifalle con `node scripts/barche-immagini.cjs` (serve Playwright; istruzioni in testa al file).
- La regata in 60 secondi: `src/lib/regata60.ts` (percorsi, scritte, testi delle scene). Con `?r60t=43` il lettore si apre fermo a quell'istante.
- Un nuovo video entra solo se è del canale ufficiale e si può incorporare: prova `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=CODICE` (deve rispondere 200).
- **Gli id non si rinominano** (tappe, locali, schede): finiscono nei link condivisi degli itinerari e nella memoria dei telefoni; se cambiano, le tappe dei link già mandati spariscono. Per toglierne uno, cancellalo e basta (il link lo scarta e lo dice).
