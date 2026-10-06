# PROGRESS

_Ultimo aggiornamento: 06/10/2026 (Blocco 3, stile dei testi). La storia completa dei rilasci (1, 1.1, 2, 2.1, 2.2, blocchi 1 e 2 del Rilascio 3, con i controlli fatti) è in `archivio/PROGRESS-fino-al-2026-10-03.md`: leggila solo se ti serve un dettaglio._

## Cosa fa Enrico adesso (06/10/2026, Blocco 3 · prima parte, stile dei testi: sul ramo `ccr-8d2ed67d-c97lqi`, non su `main`)
1. Leggere sul telefono i testi nuovi nell'anteprima di Vercel del ramo e dire cosa non va.
2. Dare l'OK per pubblicare su `main` (cambia solo il testo delle pagine, niente grafica).
3. Poi: seconda parte del Blocco 3 (estetica, due proposte grafiche, logo), Opus effort alto o extra; installare prima SEO Audit Kit e Programmatic SEO Gate per la parte SEO.
4. Mandare il link dello strumento per confrontare il sito con i concorrenti (senza abbonamenti).
5. Dopo: sessione di gruppo su `da-risolvere.md` (29 righe aperte: 16 locali senza orari, 19 premi da verificare sulle guide in una riga sola).

## Blocco 3 · prima parte: lo stile dei testi (06/10/2026)
- Ricerca: `ricerca/reports/Stile delle guide di viaggio.md` (note in `ricerca/research_notes/`). Molte guide bloccano la lettura dal cloud.
- **Guida di stile approvata da Enrico**: `specifiche/stile-testi.md`. Voce 75% guida di viaggio, 25% amico napoletano; il calore non inventa fatti; fonti in fondo alla pagina, non nel testo; notizie di stampa sul 2027 al condizionale; ciò che non è uscito dice chi lo deciderà.
- **Skill del progetto `stile-testi`** (`.claude/skills/stile-testi/`): rimanda alla guida; vale anche per le traduzioni del Rilascio 4.
- Controllo dei testi (`src/lib/regole.mjs`): parole nuove (condizionale, «lo diranno… più avanti»…), corretto «voci,». Schede `comeFatto: true` (19 premi e recensioni dei locali, decisione di Enrico): scritte come fatti, la build le elenca come `[da verificare]`; riga in `da-risolvere.md`.
- Nuovo `test/testi.test.mjs`: segni e cautele dei testi veri e lista nera, senza build. `CLAUDE.md` e README aggiornati.
- Tutti i 31 file di `src/testi/` riscritti (agenti Sonnet per gruppi, riletti dal modello principale; controllo automatico dei numeri: nessun numero nuovo). Lunghezze simili a prima: senza fatti nuovi non si allunga. I fatti nuovi sui luoghi sono un lavoro a parte (scelta di Enrico).
- Controlli: `npm test` 26/26, build ok, `check:links` 2441 link senza errori.

## Revisione tecnica del 06/10/2026 (analisi approvata da Enrico; A fatto)
- **A, fatto**: contraddizioni di questo file, 4 schermate tolte, riga sugli id nel README, due frasi in `CLAUDE.md` (funzioni nuove, cosa conta come fallimento).
- **B, pubblicato su `main` il 06/10/2026, con l'OK di Enrico**: `npm test` con `node:test`, zero pacchetti nuovi, 22 test (cautela, firma, date, link; non fermano Vercel, scelta di Enrico). Regole in un solo file, `src/lib/regole.mjs` (la firma era copiata in due posti). Fonti `altro` divise: 26 `enciclopedia` (Wikipedia), 4 `blog`, 4 restano `altro`. Avviso `[fonti deboli]` nella build, che non la ferma: oggi `reg-partenza`, `reg-precedenze`, `reg-penalita`, `tp-donnanna-orari`, da sistemare. Tabelle «Cercare una fonte» e «Test» nel README. Trovato dai test: la regola accetta «voci» solo se seguito da uno spazio (non «voci,»): da sistemare quando si allargano le parole nel Blocco 3.
- **C**: test del calcolo della giornata, dei tempi compressi e degli orari dei locali all'inizio del Blocco D; script per i link esterni con «dati che si tengono aggiornati da soli»; axe e Lighthouse come comando.
- **Deciso da Enrico il 06/10/2026**: niente pacchetti nuovi quando se ne può fare a meno (regola in `CLAUDE.md`); Playwright resta fuori dal progetto, si usa quello del cloud.

## Skill valutate il 04/10/2026 (verifica del codice fatta da agenti; niente è installato)
Copie lette in sola lettura in `/home/user/<autore>/<repo>` (fuori dal progetto, solo in quella sessione). Decisioni di Enrico e piano per il blocco 3:
- **claude-seo** (MIT): sì, solo i comandi di analisi (technical, page, schema, sitemap, images, hreflang, audit) sul sito pubblicato; installare come plugin, non con `install.sh`, senza estensioni a pagamento. Il primo uso scarica circa 20 pacchetti Python e un browser: sessione apposta.
- **impeccable** (Apache-2.0) e **ui-ux-pro-max** (MIT): copiare a mano solo i testi utili (audit, critique, polish, typeset; la lista di controllo di accessibilità) in una skill del progetto, con la nota di licenza e senza hook, senza il programma scaricato, senza telemetria. I caratteri di Google vanno scaricati e messi nel sito (regola: nessun servizio esterno prima di un tocco).
- **awesome-design-md** (MIT): solo come ispirazione per le due proposte grafiche del blocco 3 (idee e struttura); mai caratteri proprietari, loghi, nomi o colori che identificano un marchio.
- **img2threejs** (Apache-2.0): da accendere solo quando si rifanno le barche 3D, solo il clone base, senza plugin né `integrations/`.
- **playwright-cli** (Microsoft): da provare con `npx`, senza aggiungerlo al progetto.
- **Regola numero uno (Enrico, 04/10/2026), ora in `CLAUDE.md`:** di ogni skill o plugin si legge tutto il codice cercando malware e cose pericolose; se c'è qualcosa di dubbio si avvisa Enrico prima, sempre. Vale anche per le skill già scelte qui sotto: le copio solo dopo averle riletto per intero in quella sessione.
- **Fatto il 06/10/2026 (sera): skill `design-napoli`** in `.claude/skills/`. Letti per intero i testi copiati. impeccable **com'è è pericoloso** (scarica ed esegue un programma, 3 hook automatici, statistiche a impeccable.style): copiati solo 6 testi (craft-floor, audit, polish, typeset, layout, colorize) senza le righe del programma, con licenza Apache e NOTICE. ui-ux-pro-max: solo `quick-reference.md` (gli script Python e i dati restano fuori). awesome-design-md: 8 stili riassunti da noi in `references/ispirazioni.md`, niente file copiati. Scelta di Enrico: «solo i testi». Copie di lettura in `/home/user/terzi/` (solo in quella sessione). **Da fare**: Enrico attiva sul suo account SEO Audit Kit, Programmatic SEO Gate, VectorLab e consistent-ui (catalogo «Anthropic Directory»); in una sessione nuova si leggono e si copiano nel progetto.
- **Skill di design del progetto (Blocco 3, deciso il 06/10/2026)**: una sola skill in `.claude/skills/` che raccoglie: 6-8 stili di awesome-design-md vicini a noi (Airbnb, Spotify, Nike, Ferrari, BMW, Apple…), le schermate MUDD di `design/ispirazioni/`, le guide di impeccable (controllo, critica, rifinitura, caratteri), la lista di accessibilità di ui-ux-pro-max e, alla fine, un nostro `DESIGN.md` col look scelto. Si prende ispirazione anche dallo **stile di scrittura** (tono, ritmo delle frasi) per la prima parte del Blocco 3; mai copiare testi, caratteri, loghi o colori che identificano un marchio. Prima si legge tutto il codice (regola numero uno).
- **find-skills** (MIT, Vercel, `vercel-labs/skills`, cartella `skills/find-skills`): è la vera «Find Skills» (il link `llmfit` che Enrico ha mandato è un'altra cosa: sceglie quali modelli di IA girano sul tuo computer, non serve al sito). È un solo file di istruzioni che cerca altre skill con `npx skills find` e controlla installazioni, fonte e stelle prima di consigliarle. Sì: copiare solo il testo di `SKILL.md` in una skill del progetto, con la nota di licenza; **non** il programma `npx skills` (manda statistiche di installazione a Vercel) e mai installare una skill trovata senza far leggere il codice a me e dire a Enrico cosa fa.
- **No**: taste-skill, claude-mem, graphify, llmfit.
- Da cercare ancora: uno strumento che confronti il sito con i concorrenti (senza abbonamenti): Enrico manda il link.
- **Barche 3D (deciso da Enrico il 04/10/2026)**: devono sembrare vere come una fotografia e restare 3D: **si ruotano con il dito e si muovono nell'acqua** (onde, scia, foil che si alza). Non basta un'immagine ferma. Forma da AC75 vera (scafo e foil da foto e disegni con licenza libera), materiali realistici, luce da ambiente vero, caricamento solo al tocco e Lighthouse 95+ sulle pagine. Fare prima una prova su una sola barca (con img2threejs, clone base) e farla vedere a Enrico.

## Skill e dove eseguire (aggiornato il 03/10/2026)
Controllato in una sessione nel cloud il 03/10/2026: Node 22.22 (serve 22.12 o più), Chromium installato, raggiungibili Copernicus, Wikimedia e il sito del Comune; l'Overpass principale non risponde, ma gli script usano anche due server di riserva.

| Blocco | Skill e plugin | Dove |
|---|---|---|
| A · Luoghi | deep-research (c'è nel cloud), frontend-design e Modern Web Guidance (nel progetto) | **Cloud va bene** |
| B · Autobus | nessuna in più: il feed ANM e OpenStreetMap si scaricano dal cloud (provato il 03/10/2026) | **Fatto nel cloud, pubblicato** |
| C · Dove mangiare | deep-research, frontend-design | **Fatto nel cloud, pubblicato il 04/10/2026** |
| D · Esperienze | deep-research, frontend-design | Cloud |
| 3 · Sito più ordinato e SEO | frontend-design (c'è) + le skill scelte il 04/10/2026 (sezione «Skill valutate»): claude-seo, impeccable, ui-ux-pro-max, awesome-design-md, img2threejs, find-skills. Si copiano nel progetto (`.claude/skills/`) solo dopo aver letto tutto il codice (regola numero uno in `CLAUDE.md`) | Cloud (Chromium c'è); il computer solo per gli orari da Google |

## Dove siamo
- Sito pubblico: https://napoli-a-vela.vercel.app (ramo `main`, che dal 03/10/2026 è anche il ramo principale su GitHub: le sessioni nel cloud partono da lì). Astro 7, Vercel, Supabase gratuito (progetto `coppa-america-napoli`, id `hcicqbcmtfksraabphie`).
- **Pubblicati**: Rilasci 1, 1.1 (nome «Napoli a Vela»), 2 (Capire la Coppa, 3D delle barche), 2.1 e 2.2 (testi discorsivi con fonti, statistiche senza cookie).
- **Rilascio 3 · Vivi Napoli**, diviso in 3 blocchi (un prompt per ciascuno in `PROMPT-BLOCCO-*.md`):
  - Blocco 1, itinerari, contenuti e design: **finito, su `main`** (39 tappe con fonti, tempi calcolati da noi, design «Orario» scelto).
  - Blocco 2, la pagina `/napoli/itinerari/` con il compositore, la mappa, salvataggio e condivisione: **su `main`, online, da provare sul telefono**.
  - Blocco 3, il sito più ordinato (controllo di coerenza e 7 proposte del 01/10/2026): **da fare**.
- Rilascio 4 (Lingue): da fare, dopo il 3, come da `PIANO.md`.
- **Rilascio 5 (Pronostici): in attesa, opzionale** (deciso da Enrico il 03/10/2026: non è più sicuro di volerlo fare). Se si rifà, vanno finiti almeno un mese prima del 22 maggio 2027; i testi pronti restano in `PIANO.md`, punto 7.

## Prossimi passi
1. Le tue prove sul telefono della pagina itinerari, sul sito pubblico (elenco nell'archivio, sezione «Blocco 2 · Da fare»), e le correzioni che ne vengono.
2. Blocco 3 (`PROMPT-BLOCCO-3.md`): prima parte, lo stile dei testi, **fatta il 06/10/2026, in attesa dell'OK** (sezione sopra); poi **estetica con due proposte grafiche e SEO**. Skill: vedi «Skill valutate il 04/10/2026» (si copiano all'inizio, dopo averle lette per intero); a fine blocco restano solo quelle utili al progetto.
   **Da decidere nel blocco 3**: una pagina fissa per ogni luogo e locale (`specifiche/itinerari-napoli-ampliamento.md`, sezione 4), rimandata qui dal blocco A il 03/10/2026.
   **Ispirazioni di design** di Enrico: `design/ispirazioni/` (schermate e descrizioni; MUDD Napoli, 03/10/2026): leggerle prima delle due proposte grafiche.
   **Google Search Console è già collegata**: il file di verifica è nel sito dal 01/10/2026 (`public/googlee54aa324270bde6d.html`). Da controllare con Enrico solo se la mappa del sito (`/sitemap.xml`, già indicata in `robots.txt`) è stata inviata in Search Console.
3. **Itinerari di Napoli ampliati** (specifica `specifiche/itinerari-napoli-ampliamento.md`): **blocco A pubblicato su `main` il 03/10/2026, con l'OK di Enrico** (18 luoghi, gite a Caserta, Pietrarsa e Sorrento, Villa Campolieto nella gita a Ercolano; ricerca in `ricerca/2026-10-03-luoghi-note/`; 7 cose aperte in `da-risolvere.md`). Pagine fisse dei luoghi rimandate al blocco 3. **Blocco B (autobus) e itinerario dal vivo pubblicati su `main` il 04/10/2026, con l'OK di Enrico**: 13 linee ANM dal feed GTFS ufficiale (orari fino al 31/12/2026), bus solo se fa risparmiare almeno 5 minuti; partenze vere dei bus, ora del telefono, «Fatto», posizione con pannello sulla privacy, itinerari nuovi con la data di oggi (`specifiche/bus-orari-veri.md`). Verificato con 42 prove automatiche sull'anteprima di Vercel. Da decidere con Enrico: la giornata oltre l'orario di fine e l'«ordine più corto» con le tappe fatte. **Blocco C (dove mangiare) pubblicato su `main` il 04/10/2026, con l'OK di Enrico**: 32 locali con orari e prezzi riletti sui siti ufficiali, pagina `/napoli/dove-mangiare/` con i filtri (cucina, prezzo, piatto, giorno e ora, zona, vicino alle mie tappe), scelta «Mangiare» nel pannello del compositore, avvisi «chiuso a quest'ora», tempi rifatti per 87 punti (OSM del 04/10/2026). Ricerca in `ricerca/2026-10-04-locali-note/`. La scheda Google del locale vale come fonte degli orari (Enrico, 04/10/2026), ma dal cloud non si legge. Poi blocco D (esperienze).
   La Cumana va di nuovo fino a Pozzuoli dall'11/09/2026 (EAV): da tenere presente nel blocco B.
4. Nuovo sito itinerari per più città (Napoli, poi Roma, Milano, Torino, Venezia…): idea del 03/10/2026, vedi sotto. Prima una spec.
5. Correggere la scheda `echia-ascensore` (orari da OpenStreetMap, diversi da quelli ANM: 7–22 tutti i giorni, 1,50 €).
6. Quando escono: orari 2027, biglietti e tribune, ordinanza della Capitaneria, piano trasporti, mappa ufficiale del campo, regole di regata 2027. Aggiornare le schede «Non ancora uscito». Orari e prezzi delle tappe da ricontrollare entro il 30/04/2027.

## Idea: sito itinerari per più città (03/10/2026, da decidere)
- Per turisti (anche italiani nella propria città). Per ora solo Napoli; poi Roma, Milano, Torino, Venezia.
- Sito **indipendente** da «Napoli a Vela»; il collegamento è a senso unico: da «Napoli a Vela» verso il sito itinerari, mai il contrario.
- Il compositore generico: la città e le regate arrivano come dati. Le regate compaiono solo dove la città ha un evento nel calendario.
- Domande ancora aperte: che ne facciamo di `/napoli/itinerari/`; stessa grafica o identità nuova; nome e indirizzo.

## Idea: dati che si tengono aggiornati da soli (03/10/2026, da decidere)
- Detta da Enrico: gli orari dei bus sono d'autunno e cambiano spesso; il sito dovrebbe **accorgersi da solo quando i dati ufficiali cambiano** e avvisarci (o, più avanti, aggiornarsi).
- Primo passo semplice (nessuna API a pagamento): un controllo periodico (ogni settimana) che riscarica il feed ANM (https://www.anm.it/google/google-transit.zip), lo confronta con quello usato e, se cambia, apre un avviso. Stesso metodo per altre fonti con un indirizzo fisso (orari dei parchi, EAV).
- Da decidere con una specifica: dove gira il controllo, come ci avvisa, se l'aggiornamento è automatico o solo segnalato. Non fa parte del blocco B.

## Cose che devi fare tu
1. Guardare il sito sul telefono e dire cosa cambiare.
2. Parlare con un avvocato quando vuoi (privacy, termini, marchi, gioco, affiliazioni, **foto**: Enrico (04/10/2026) vorrebbe togliere il divieto di foto senza licenza libera; per ora la regola resta, da decidere dopo l'avvocato; se cambia vanno cambiati `CLAUDE.md` e il controllo in `src/content.config.ts`). Sul piano gratuito di Vercel non c'è il contratto sul trattamento dei dati.
3. **Reindirizzare il vecchio indirizzo**: Vercel → progetto *coppa-america-napoli* → Settings → Domains → `coppa-america-napoli.vercel.app` → Edit → «Redirect to» `napoli-a-vela.vercel.app`, codice 308 → Save. La regola in `vercel.json` non funziona; dopo si può togliere.

## Note operative
- **Da dove vengono i dati e come si rinnovano**: `aggiornamenti/` (registro delle fonti, 03/10/2026). Gli orari bus ANM scadono il **31/12/2026**: a gennaio riscaricare il feed e rifare i tempi.
- Aggiornare un'informazione: scheda in `src/data/fatti.yaml` (fonte in `fonti.yaml`), cambiare `controllato`. Se un testo in `src/testi/` la usa, la build si ferma: rileggerlo e poi `npm run testi:firma`.
- Statistiche: persone e pagine nell'app Vercel → Analytics; tempo sulle pagine in Supabase → Table editor → `letture_per_giorno`, `letture_per_pagina`. Iscrizioni: tabella `avvisami`.
- Supabase gratuito va in pausa dopo 7 giorni senza attività (con il contatore ora riceve richieste ogni giorno).
- Rigenerare la mappa: `node scripts/mappa/scarica.mjs <cartella>` poi `node scripts/mappa/costruisci.mjs <cartella>`.
- Skill: accendere solo quelle della fase in corso (tabella nell'archivio, sezione «Skill»).
- Effort consigliato: Rilascio 3 e 5 alto; piccole modifiche e testi medio.
