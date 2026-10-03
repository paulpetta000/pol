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

## Modelli e agenti
Obiettivo di Enrico: spendere poco, senza perdere qualità. Un agente parte da zero e deve rileggere ciò che gli serve:
si delega solo quando il lavoro è lungo o ripetitivo, mai per poche righe.
- **Fai da solo**: una domanda, un file, una modifica di poche righe, un testo da correggere.
- **Sonnet (agente `revisore` o altro agente di controllo)**: revisione di molte modifiche, controlli su molte pagine (link, accessibilità, formati),
  ricerche ripetitive di orari e prezzi su più luoghi, riordino di molti file. Il modello principale rilegge sempre il risultato prima di darlo per buono.
- **Haiku 4.5**: solo lavori meccanici (cercare, contare, estrarre). Per ora Enrico preferisce non usarlo.
- **Modello principale**: costruzione, design, struttura dei dati, bug difficili, decisioni di cui non si torna indietro.
- Più agenti insieme solo se i lavori sono davvero indipendenti. Chiedi sempre risposte corte (elenchi, non spiegazioni).
- **Effort**: lo sceglie Enrico per la sessione. Dì tu quando cambiarlo: medio per testi e piccole modifiche, alto per ricerca con fonti,
  bug difficili e struttura dei dati.
