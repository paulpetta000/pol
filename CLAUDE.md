# Napoli a Vela

Guida in italiano alla Coppa America 2027 a Napoli, con gli itinerari in città.
Sito statico in Astro 7, pubblicato su Vercel dal ramo `main` (https://napoli-a-vela.vercel.app).
Supabase (gratuito) serve solo per «Avvisami» e per il contatore delle letture.
Rispondi in italiano semplice e spiega i termini tecnici.

## Comandi
- `npm run dev` · sito in locale (porta 4321)
- `npm run build` · costruisce il sito; **si ferma da sola** se mancano fonti o testi da rileggere
- `npm run check:links` · dopo la build, controlla i link interni
- `npm run testi:firma` · dopo aver riletto un testo cambiato, lo firma di nuovo
- Node 22.12 o più recente. Non ci sono test automatici: i controlli sono la build e i link.

## Dove sono le cose
- Dati: `src/data/` (schede in `fatti.yaml`, fonti in `fonti.yaml`, tappe degli itinerari in `tappe.yaml`)
- Testi delle pagine: `src/testi/*.yaml` · pagine: `src/pages/` · componenti: `src/components/`
- Itinerari: `src/pages/napoli/itinerari/`, tempi in `src/data/tempi-tappe.json` (non si modifica a mano, lo calcola `scripts/itinerari/`)
- Tabella completa dei file e spiegazione dei testi: `README.md`

## Regole che non si rompono
- **Nessuna informazione senza fonte.** Ogni dato ha fonte, stato (`confermato`, `stampa`, `segnalato`, `atteso`) e data di controllo.
- Un'informazione non confermata per il 2027 va segnata con `{?id}` e detta a parole («secondo la stampa», «non è ancora uscito»).
- Se una scheda cambia, i testi che la usano vanno riletti e poi firmati con `npm run testi:firma`.
- Foto solo con licenza libera, con autore e licenza in `foto.yaml`.
- Nessun cookie e nessun servizio esterno prima di un tocco dell'utente (vedi la pagina Privacy).

## Come si lavora
- Stato e prossimi passi: `PROGRESS.md` (corto). La storia dei rilasci è in `archivio/`: non leggerla se non serve.
- Il piano generale è in `PIANO.md` e i prompt dei blocchi in `PROMPT-BLOCCO-*.md`: leggili solo se il compito li riguarda.
- Lavora su un ramo nuovo creato da `main`. Niente pubblicazione su `main` senza l'OK di Enrico: ogni rilascio parte solo dopo il suo OK.
- Per una funzione nuova e grande scrivi prima una **specifica** corta in `specifiche/` (obiettivo, regole, casi limite, controlli da fare, compiti da spuntare)
  e fala approvare, poi costruisci. Per le piccole modifiche non serve.
- Alla fine di un blocco fermati, mostra cosa c'è da rivedere e aspetta l'OK.
- Prima di dire «fatto»: build senza errori e `check:links` pulito.
- Aggiorna `PROGRESS.md` a fine lavoro, in poche righe.

## Cosa non leggere di default
`design/` (bozzetti da oltre 1 MB), `ricerca/` (note lunghe), `package-lock.json`, `src/data/*.json` grandi
(`percorsi-tappe.json`, `mappa.json`, `tempi-tappe.json`). Aprili solo se il compito li riguarda, e solo la parte che serve.

## Modelli, effort e agenti
Obiettivo di Enrico: **efficienza**. Il risultato deve essere ottimo, ma senza spendere più del necessario. Regola: si parte dal livello più basso che può bastare
e si sale solo se il risultato non è buono. Effort, dal più leggero: basso · medio · alto · extra · max. Costo, dal più leggero: Haiku 4.5 · Sonnet · Opus.

| Compito | Modello | Effort |
|---|---|---|
| Domande, un testo da correggere, modifiche di poche righe, commit e push, aggiornare `PROGRESS.md` | principale o Sonnet, fai da solo | basso–medio |
| Ricerche ripetitive (orari, prezzi, fonti di un gruppo di luoghi o locali) | agenti Sonnet in parallelo, uno per gruppo; il principale rilegge le fonti | medio–alto |
| Lavori meccanici (cercare, contare, estrarre, rinominare) | Haiku 4.5 (Enrico per ora preferisce non usarlo: usa Sonnet) | basso |
| Revisione del codice, controlli su molte pagine | agente `revisore` (Sonnet) | alto |
| Costruire una funzione nuova nel codice esistente (filtri, nuovo tipo di tappa, pagina) | modello principale (Opus) | alto |
| Struttura dei dati, specifiche, scelte difficili da cambiare dopo | Opus | extra |
| Bug difficile da trovare, sicurezza (Supabase, pronostici), fallimenti ripetuti | Opus | max |

- **Max** solo quando alto ed extra non bastano o quando la scelta è costosa da correggere: non è il livello normale.
- **Fai da solo** quando il lavoro è di poche righe: un agente parte da zero e deve rileggere il contesto, quindi per poco costa di più.
- **Il modello dei sub-agenti lo scegli tu** a ogni lancio. **L'effort della sessione lo imposta Enrico**: dì tu quando alzarlo o abbassarlo, in una riga.
- Più agenti insieme solo se i lavori sono davvero indipendenti. Chiedi sempre risposte corte (elenchi con le fonti, non spiegazioni).
- Il modello principale rilegge sempre il lavoro di un agente prima di darlo per buono.
