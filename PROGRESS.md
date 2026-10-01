# PROGRESS

_Ultimo aggiornamento: 01/10/2026 (Rilascio 2.1 pubblicato)_

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

- **Rilascio 2.1 · «Più chiaro» pubblicato** (01/10/2026, ramo `ccr-2ebe6f48-tdkrwv` portato su `main` su tua richiesta). Contiene:
  - **Testi discorsivi al posto delle schede, pagina campione `/capire-la-coppa/`** (sezione «I numeri da sapere»): niente più etichette, «Fonte:» e «controllato il» nei paragrafi; fonti solo in fondo, con una sola data («informazioni controllate il …», la più vecchia tra le schede) e la spiegazione del segno `*`. La data in alto sotto il titolo è stata tolta.
  - **Sistema dei testi** (`src/testi/<pagina>.yaml`, `src/lib/testi.ts`, `src/components/Testo.astro`): ogni blocco dichiara le schede che usa (`usa`) e l'elenco delle fonti nasce da lì. La build si ferma se una scheda manca o non ha fonte; se un'informazione non confermata per il 2027 (stampa, siti non ufficiali, non ancora uscita, 2024 o 2026) non ha il segno `{?id}` o la frase non lo dice a parole; se una scheda cambia dopo che il testo è stato scritto (rileggere il testo, poi `npm run testi:firma`). L'avviso «da ricontrollare» resta.
  - Schede: `reg-penalita` più precisa (riletta la regola 44 delle regole 2024); nuova `reg-2027-attese` (regole di regata 2027 non ancora uscite). Nella «regata in 60 secondi» una riga dice che le regole sono quelle del 2024.
  - **Il 3D in alto** in `/squadre/` (con la scelta dei colori) e nelle 7 pagine delle squadre (con i colori della squadra): prima l'immagine, il modello si carica con «Avvia il 3D». Componente `src/components/Barca3D.astro`; immagini `src/assets/barche/ac75-<squadra>.jpg` fatte dal 3D con `scripts/barche-immagini.cjs`. In `/squadre/barche/` il 3D resta primo.
  - **3D che gira in ogni direzione**: trascinando anche dall'alto in basso (da sotto il pelo dell'acqua a quasi dall'alto), pulsanti ↑ e ↓, zoom con due dita, con i pulsanti e con ctrl+rotella. I 7 pulsanti stanno su una riga a 390 px.
  - **Mappa più larga**: da Nisida alla Stazione Centrale e da Posillipo a Capodimonte (riquadro in `scripts/mappa/riquadro.mjs`), con centro storico, porto e 8 stazioni in più; nuovo pulsante «Centro e stazione», «Tutta la mappa» al posto di «Tutto il golfo». La vista iniziale «Lungomare» non cambia.
  - **Statistiche senza cookie**, solo sul sito pubblico e mai con «Do Not Track» o «Global Privacy Control»: Vercel Web Analytics (persone, pagine, provenienza, dispositivi) e un contatore nostro del tempo passato sulle pagine (tabella `letture` su Supabase: pagina, secondi, telefono/tablet/computer, giorno; nessun IP né identificativo; massimo 600 righe al minuto).
  - **Privacy riscritta** dopo un controllo vero del sito (nessun cookie; nel browser solo il tema e la copia offline; nessun servizio esterno prima del tocco su un video; YouTube salva dati nel browser dopo il tocco), con le statistiche. **Pagina nuova `/termini/`** (Termini d'uso). Piè di pagina, note legali e descrizione della home con la formula sui marchi e «guida indipendente».
  - Dal ramo della sessione precedente: etichette piccole portate a 12 px e link del logo alti 44 px.
  - **Controlli** (in locale, telefono simulato): build, `npm run check:links` (nessun link rotto), axe senza violazioni in chiaro e scuro, nessuno scorrimento orizzontale a 320 e 390 px, «riduci movimento», nessun errore in console, Lighthouse su tutte le 32 pagine: prestazioni 98–100, accessibilità, best practice e SEO 100 (la pagina 404 ha SEO 66 perché non deve essere indicizzata). Corretto anche un problema trovato da axe: le tabelle larghe dell'Archivio 2026 ora si scorrono anche da tastiera.
  - Il gioco dei pronostici e i link di affiliazione hanno i testi pronti in `PIANO.md` (punti 7 e 8).

## Da fare
- **Riscrivere tutte le altre pagine** con il sistema dei testi, come la pagina campione: tutte, non solo le 15 dell'elenco iniziale (home, Vederla e sottopagine, Calendario, Napoli e sottopagine, Squadre, barche e 7 squadre, Capire la Coppa e sottopagine, Archivio, Domande frequenti, schede dei punti panoramici, tabella delle barche). Poi togliere i componenti `Fatti`/`Fatto` non più usati e aggiornare la pagina Fonti.
- Rilasci 3-5 come da `PIANO.md` (testi pronti per il regolamento del gioco e per i link di affiliazione nel punto 7 e 8).
- Quando escono: orari 2027, biglietti e tribune, ordinanza della Capitaneria, piano trasporti, mappa ufficiale del campo, regole di regata 2027. Aggiornare le schede "Non ancora uscito".

## Skill: quali, e quando (01/10/2026)
Regola: ogni skill aggiunge poco peso, ma si somma. Accendere solo quelle della fase in corso, spegnere le altre. Le skill del tuo account si accendono e spengono dalle impostazioni di Claude; i plugin dalla scheda di installazione (chiedere a Claude di cercarli di nuovo con SearchPlugins).

**Scelte, da attivare quando vuoi** (catalogo «Anthropic Directory»):
- **frontend-design** (Anthropic): una sola skill, per interfacce curate. La prima da attivare.
- **Modern Web Guidance** (Google Chrome): buone pratiche del web moderno. La skill per le estensioni di Chrome non serve.

**Valutate e messe da parte:**
- **Design** (Anthropic): 7 skill utili (critica, accessibilità, UX writing, design system), ma collega anche Asana, Atlassian, Figma, Gmail, Google Calendar, Intercom, Linear, Notion e Slack. Utile solo per un restyling completo.
- **UI Consistency**, **Backend Design**: partono da soli (comandi automatici) e hanno accesso ampio. Backend Design da rivalutare per il Rilascio 3, dopo un controllo.
- **Fairmind Design**, **Rayden UI**, **jp-web-design**, **inhabited design**: non adatte.
- Controllate fuori catalogo: **UI/UX Pro Max** (provata e tolta: il generatore di design system non era adatto), **Graphify** (non serve a un sito piccolo), **ECC** (293 skill e 24 comandi automatici: consuma molti token, sconsigliata).

**Quali accendere, fase per fase:**
| Fase | Skill utili | Note |
|---|---|---|
| Restyling completo del sito (solo se deciso) | frontend-design, Design, Modern Web Guidance | Le «pesanti» servono qui; poi spegnerle |
| Rilascio 3 · Pronostici | security-review, controllo di sicurezza di Supabase (advisors), dataviz, code-review; Backend Design dopo un controllo | Il più delicato: database e regole di accesso |
| Rilascio 4 · Vivi Napoli | deep-research, frontend-design per le schede | Le informazioni vanno ricontrollate vicino alle date |
| Rilascio 5 · Lingue | nessuna in particolare | Serve un madrelingua per i termini di vela |
| Prima di ogni pubblicazione | security-review, code-review | Già incluse in Claude Code |

## Prossima sessione
Il prompt pronto da incollare è in `PROMPT-PROSSIMA-SESSIONE.md`: riscrivere tutte le altre pagine come la pagina campione.

## Cose che devi fare tu
1. ~~Vercel → Production Branch = `main`~~ (il sito pubblico si aggiorna da `main`).
2. **Guardare il sito sul telefono** e dire cosa cambiare.
3. ~~Nome ed email del titolare~~ (fatto il 30/09/2026: Enrico Licenziati, napoliavela.guida@gmail.com).
4. ~~Pubblicare su `main`~~ (Rilasci 1, 1.1 e 2 il 30/09/2026; Rilascio 2.1 il 01/10/2026).
5. Parlare con un avvocato quando vuoi (privacy, termini, marchi, gioco, affiliazioni). Da sapere: sul piano gratuito di Vercel non c'è il contratto sul trattamento dei dati (c'è da Pro in su).
6. **Reindirizzare il vecchio indirizzo** (1 minuto): Vercel → progetto *coppa-america-napoli* → **Settings → Domains** → `coppa-america-napoli.vercel.app` → **Edit** → «Redirect to» `napoli-a-vela.vercel.app`, codice 308 (permanente) → **Save**. La regola in `vercel.json` non sta funzionando; dopo la modifica si può togliere.
7. ~~Attivare Vercel Web Analytics~~ (attivo dal 01/10/2026).

## Note
- Sito pubblico: https://napoli-a-vela.vercel.app (ramo `main`).
- Aggiornare un'informazione: modificare la scheda in `src/data/fatti.yaml` (e la fonte in `src/data/fonti.yaml`), cambiare la data `controllato`. Se la scheda è usata da un testo in `src/testi/`, la build si ferma: rileggere il testo, correggerlo e poi `npm run testi:firma`. Vedi `README.md`.
- **Statistiche**: persone, pagine e provenienza nell'app Vercel → progetto → **Analytics** (sul piano gratuito si vede l'ultimo mese, al massimo 50.000 eventi al mese). Tempo sulle pagine nella dashboard Supabase → **Table editor** → viste `letture_per_giorno` e `letture_per_pagina`.
- Rigenerare la mappa: `node scripts/mappa/scarica.mjs <cartella>` e poi `node scripts/mappa/costruisci.mjs <cartella>`.
- Leggere le iscrizioni ad Avvisami: dalla dashboard Supabase (Table editor → `avvisami`).
- Supabase gratuito va in pausa dopo 7 giorni senza attività: se succede, riattivarlo dalla dashboard (iscrizioni e statistiche restano). Con il contatore delle visite il database ora riceve richieste ogni giorno.

## Effort consigliato per il prossimo passo
- Riscrittura di tutte le pagine → effort alto (tanto testo da scrivere bene, con le fonti giuste).
- Rilascio 3 (Pronostici) → effort alto.
