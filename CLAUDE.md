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
- **Skill, plugin e programmi di altri: prima si legge il codice, regola numero uno di Enrico (04/10/2026).** Prima di copiare o installare qualsiasi skill, plugin, script o pacchetto, leggi **tutti** i suoi file e cerca malware e cose pericolose: comandi che scaricano o eseguono altro (`curl`, `wget`, `eval`, `exec`, `base64`), accesso a file personali, chiavi o password, invii di dati a server esterni (anche statistiche), hook che partono da soli, modifiche a impostazioni o permessi, installazioni nascoste. Se trovi **qualcosa di dubbio, avvisa Enrico prima di fare qualsiasi altra cosa** e aspetta il suo OK: non installare, non copiare, non eseguire. Dì sempre a Enrico, in parole semplici, cosa hai controllato e cosa hai trovato. Una skill che sembra pulita ma che non hai letto per intero non si usa.
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

## Guidare Enrico passo passo (regola di Enrico, 03/10/2026)
Enrico costruisce il sito **con te**, e vuole che sia tu a dirgli cosa fare a ogni passaggio, in italiano semplice e con il telefono in mano:
- **All'inizio di una sessione** (appena letti `CLAUDE.md` e `PROGRESS.md`) digli in 3 righe: cosa faremo, **quale modello e quale effort impostare**, e se la sessione è quella giusta o se conviene aprirne un'altra.
- **Prima di un lavoro più difficile o più leggero** del precedente, avvisalo: «adesso alza (o abbassa) l'effort a X», e aspetta il suo «fatto».
- **A fine lavoro** dagli sempre la lista «cosa fai adesso»: numerata, un'azione per riga, con il testo esatto da incollare, quando serve. Esempi: aprire una sessione nuova (su quale repository e da quale ramo), che modello ed effort impostare, che testo incollare, cosa guardare sul telefono, quando dire OK alla pubblicazione.
- **Prima di ogni pubblicazione su `main`** dì cosa cambia per chi visita il sito e chiedi il suo OK.
- **Skill e plugin, all'inizio e alla fine di ogni sessione** (richiesta di Enrico, 03/10/2026):
  - all'inizio confronta le skill e i plugin disponibili in quella sessione con quelli che servono al blocco (tabella «Skill e dove eseguire» in `PROGRESS.md`) e dì a Enrico cosa manca;
  - a fine sessione dì quali skill e plugin servono al blocco dopo, se sono già disponibili o se deve installarli (e dove), e se conviene eseguirlo **nel cloud o in locale sul suo computer**, con il motivo.
- Non dare mai per scontato che sappia cosa fare dopo: scrivilo.

## Cosa non leggere di default
`design/` (bozzetti da oltre 1 MB), `ricerca/` (note lunghe), `package-lock.json`, `src/data/*.json` grandi
(`percorsi-tappe.json`, `mappa.json`, `tempi-tappe.json`), `da-risolvere.md` (si apre solo per aggiungere una riga o per risolvere un gruppo). Aprili solo se il compito li riguarda, e solo la parte che serve.

## Modelli, effort e agenti
Obiettivo di Enrico: **efficienza**. Il risultato deve essere ottimo, ma senza spendere più del necessario. Regola: si parte dal livello più basso che può bastare
e si sale solo se il risultato non è buono. Effort, dal più leggero: medio · alto · extra · max. **L'effort basso non si usa mai.** Costo, dal più leggero: Haiku 4.5 · Sonnet · Opus.

| Compito | Modello | Effort |
|---|---|---|
| Domande, un testo da correggere, modifiche di poche righe, commit e push, aggiornare `PROGRESS.md` | principale o Sonnet, fai da solo | medio |
| Ricerche ripetitive (orari, prezzi, fonti di un gruppo di luoghi o locali) | agenti Sonnet in parallelo, uno per gruppo; il principale rilegge le fonti | medio–alto |
| Lavori meccanici (cercare, contare, estrarre, rinominare) | Haiku 4.5 (Enrico per ora preferisce non usarlo: usa Sonnet) | medio |
| Revisione del codice, controlli su molte pagine | agente `revisore` (Sonnet) | alto |
| Costruire una funzione nuova nel codice esistente (filtri, nuovo tipo di tappa, pagina) | modello principale (Opus) | alto |
| Struttura dei dati, specifiche, scelte difficili da cambiare dopo | Opus | extra |
| Bug difficile da trovare, sicurezza (Supabase, pronostici), fallimenti ripetuti | Opus | max |

- **Scala di salita sui fallimenti** (deciso da Enrico il 03/10/2026). Il modello leggero **finisce tutto il suo lavoro**: non si interrompe al primo problema.
  I casi falliti si raccolgono e si ritentano **in blocco** con un livello più forte, che parte sapendo cosa è già stato provato: Sonnet (effort della sessione) → Sonnet più alto, se l'effort per agente si può impostare → Opus alto. Un tentativo per livello.
  - **Prova del 03/10/2026** (sessione cloud): al lancio di un agente si sceglie il **modello**, non l'effort (lo strumento non ha quel parametro).
    L'effort per agente si può fissare solo nel file dell'agente (`.claude/agents/*.md`, riga `effort:`), e vale dalla sessione dopo. In pratica si sale cambiando modello: Sonnet → Opus alto.
  - Gli agenti devono scrivere «NON TROVATO» con cosa hanno provato. **Mai inventare**: vale la regola «niente senza fonte».
  - Prima di salire, capisci perché ha fallito. Se la cosa non esiste, il sito è bloccato o manca la fonte, **non salire**: scarta il caso o segnalalo a Enrico. Sali solo se ha cercato male o ragionato male.
  - Se anche Opus alto fallisce, **non salire da solo a extra o max**: scrivi il caso in `da-risolvere.md` (cosa manca, cosa è stato provato e da chi, perché, se si può ritentare) e vai avanti. Quando le righe aperte sono almeno 10, o a fine blocco, avvisa Enrico: li risolviamo insieme in un gruppo.
  - **Effort alzato a mano da Enrico**: conviene solo quando i casi falliti sono tanti o richiedono più ragionamento nella stessa conversazione (per esempio errori di build). Fermati **una volta sola, a fine lavoro**, con l'elenco, e chiedi: «alza l'effort a X, poi scrivimi fatto». Risolvi i casi, poi ricorda a Enrico di **riabbassarlo**, perché resta alto per tutto il resto. Per pochi casi o per lavori degli agenti è meglio cambiare modello da solo (Sonnet → Opus alto), che non richiede niente a Enrico.
  - Il modello principale controlla sempre tutti i dati delicati (orari, prezzi, fonti) e un campione del resto.
  Per le decisioni di struttura conta più il modello dell'effort: un Opus a effort medio vale più di un Sonnet a max.
- **Max** solo quando alto ed extra non bastano o quando la scelta è costosa da correggere: non è il livello normale.
- **Fai da solo** quando il lavoro è di poche righe: un agente parte da zero e deve rileggere il contesto, quindi per poco costa di più.
- **Il modello dei sub-agenti lo scegli tu** a ogni lancio. **L'effort della sessione lo imposta Enrico**: dì tu quando alzarlo o abbassarlo, in una riga.
- Più agenti insieme solo se i lavori sono davvero indipendenti. Chiedi sempre risposte corte (elenchi con le fonti, non spiegazioni).
- Il modello principale rilegge sempre il lavoro di un agente prima di darlo per buono.
