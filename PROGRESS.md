# PROGRESS

_Ultimo aggiornamento: 03/10/2026 (Rilascio 3, blocco 1 finito e approvato, portato su `main`: vedi «Rilascio 3 · Blocco 1»; prossimo, blocco 2)_

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

- **Rilascio 2.2 · «Tutto discorsivo» pubblicato** (01/10/2026, ramo `ccr-2ebe6f48-tdkrwv` portato su `main` dopo il tuo OK). Contiene:
  - **Tutte le pagine riscritte con il sistema dei testi**, non solo la pagina campione: home, Vederla e le 4 sottopagine, Calendario, Napoli e le 3 sottopagine, Squadre, barche e le 7 pagine delle squadre, Archivio 2026, Domande frequenti, quiz, glossario, storia, video, Fonti. Niente più schede con etichetta, «Fonte:» e «controllato il» nelle pagine: testi per argomento, fonti solo in fondo con una sola data. Tolta anche la data «Ultimo controllo» sotto i titoli (resta su privacy, termini e accessibilità del sito).
  - **Schede dei punti panoramici**: via l'etichetta e la riga delle fonti; ogni punto ha un breve testo (`src/testi/punti.yaml`) che dice perché è in elenco e, se viene dalla stampa o da un blog, lo dice. Le loro fonti ora finiscono in fondo a `/come-vederla/dal-lungomare/` e a `/napoli/mappa/` (prima mancavano).
  - **Domande frequenti e spiegazioni del quiz** passate nel sistema dei testi (`domande-frequenti.yaml`, `quiz.yaml`): la home usa le stesse risposte controllate.
  - **Squadre**: storia, «da sapere» e protagonisti di ogni squadra sono testi (`squadra-<id>.yaml`); «Il suo 2027» è un testo comune (`squadre-2027.yaml`). La **tabella dei numeri** delle barche non ha più la fonte sotto ogni riga; le misure dell'AC40 prese da Wikipedia hanno il segno * e lo dice la nota.
  - **Domande frequenti nell'ordine giusto** (prima «Come funziona», «Quando», «Si può vedere gratis?»): prima uscivano in ordine alfabetico del codice, anche sul sito pubblicato. Ora ogni domanda ha il campo `ordine` in `src/data/faq.yaml`.
  - Tabella delle **tariffe dei taxi** e cifre in evidenza nate dai testi controllati: se una scheda cambia, la build chiede di rileggerle.
  - Tolte frasi senza fonte: «nel 2026 le pedane si riempivano ore prima», «bagagli compresi» nelle tariffe dei taxi, «con 100.000 persone sul lungomare» detto come se fosse il 2027, «aspettati la stessa regola» sui droni, «le squadre della Coppa devono partecipare» a Youth e Women's.
  - Sistema dei testi: un `*` per frase al massimo, `storico: true` per i risultati del passato (niente `*`), le voci di un elenco valgono con la prima frase del blocco, più file di testi nella stessa pagina, punteggi come «7–2» che non vanno a capo. Pagina **Fonti** con la nuova legenda («Come leggere i testi»). Componenti `Fatti` e `Fatto` eliminati.
  - La scheda `vil-due` (il sindaco annuncia due villaggi) non è più usata: i due villaggi sono già confermati da fonti ufficiali. La scheda `yw-bando-atteso` (bando di Youth e Women's non ancora trovato), prima mai mostrata, ora è nel Calendario e nelle domande frequenti.
  - **Controlli** (in locale, telefono simulato): build, `npm run check:links` (nessun link rotto), axe senza violazioni in chiaro e scuro su tutte le 34 pagine, nessuno scorrimento orizzontale a 320 e 390 px, «riduci movimento», Lighthouse su tutte le pagine riscritte: vedi sotto.

## Da fare
- Testi del giro in 3D delle barche (`src/data/tappe-ac75.json`, `tappe-ac40.json`): vengono dalle regole di classe e dalla pagina ufficiale delle barche (elencate in fondo alla pagina), ma non sono schede una per una. Da trasformare in schede se vuoi lo stesso controllo delle pagine.
- Rilasci 3-5 come da `PIANO.md`, **nel nuovo ordine deciso il 01/10/2026: 3 · Vivi Napoli, 4 · Lingue, 5 · Pronostici**. Ognuno parte solo dopo il tuo OK. Testi già pronti per i link di affiliazione (Rilascio 3, `PIANO.md` punto 8) e per il regolamento del gioco (Rilascio 5, punto 7). I pronostici vanno finiti almeno un mese prima del 22 maggio 2027.
- Quando escono: orari 2027, biglietti e tribune, ordinanza della Capitaneria, piano trasporti, mappa ufficiale del campo, regole di regata 2027. Aggiornare le schede "Non ancora uscito".

## Skill: quali, e quando (01/10/2026, ricontrollate la sera per il design degli itinerari)
Regola: ogni skill aggiunge poco peso, ma si somma. Accendere solo quelle della fase in corso, spegnere le altre. Le skill del tuo account si accendono e spengono dalle impostazioni di Claude; i plugin dalla scheda di installazione (chiedere a Claude di cercarli di nuovo con SearchPlugins).

**Scelte, da attivare quando vuoi** (catalogo «Anthropic Directory»):
- **frontend-design** (Anthropic): una sola skill, per interfacce curate. La prima da attivare.
- **Modern Web Guidance** (Google Chrome): buone pratiche del web moderno (CSS, prestazioni, accessibilità). La skill per le estensioni di Chrome non serve.
- **VectorLab UI/UX Skills** (comunità, 21 skill senza servizi esterni né comandi automatici): spazi, tipografia, riquadri, stati vuoti, errori, pulsanti, animazioni, «riduci movimento», controllo UX. Utile per il compositore degli itinerari e per il sito più ordinato. Accenderla solo durante il lavoro di design.
- **consistent-ui** (comunità, 1 skill, nessun servizio esterno): trova le differenze di spazi, caratteri, colori e componenti tra le pagine e prepara un elenco di correzioni. Per il «sito più ordinato».
- Già collegato: **Figma**, utile se vuoi vedere le proposte di design anche lì.

**Valutate e messe da parte:**
- **Design** (Anthropic): 7 skill utili (critica, accessibilità, UX writing, design system), ma collega anche Asana, Atlassian, Figma, Gmail, Google Calendar, Intercom, Linear, Notion e Slack. Utile solo per un restyling completo.
- **design-skills** (comunità): 10 skill soprattutto di ricerca e strategia UX; per noi fa doppione con VectorLab.
- **Axe Accessibility** (Deque): server esterno; i controlli axe li facciamo già prima di ogni anteprima.
- **MapMap**: calcola percorsi su un servizio esterno a pagamento; le distanze degli itinerari le calcoliamo noi, senza servizi esterni.
- **Critique**, **perception-first-design**, **ultrapowers-dev**: partono da sole su ogni messaggio o sono troppo grandi (55 skill).
- **UI Consistency**, **Backend Design**: partono da soli (comandi automatici) e hanno accesso ampio. Backend Design da rivalutare per il Rilascio 5 (Pronostici), dopo un controllo.
- **Fairmind Design**, **Rayden UI**, **jp-web-design**, **inhabited design**: non adatte.
- Controllate fuori catalogo: **UI/UX Pro Max** (provata e tolta: il generatore di design system non era adatto), **Graphify** (non serve a un sito piccolo), **ECC** (293 skill e 24 comandi automatici: consuma molti token, sconsigliata).

**Quali accendere, fase per fase:**
| Fase | Skill utili | Note |
|---|---|---|
| Restyling completo del sito (solo se deciso) | frontend-design, Design, Modern Web Guidance | Le «pesanti» servono qui; poi spegnerle |
| Rilascio 3 · Itinerari e sito più ordinato | frontend-design, Modern Web Guidance, VectorLab UI/UX Skills, consistent-ui; deep-research (già attiva) per orari e prezzi | Dopo il lavoro di design spegnere VectorLab e consistent-ui |
| Rilascio 4 · Lingue | nessuna in particolare | Serve un madrelingua per i termini di vela |
| Rilascio 5 · Pronostici | security-review, controllo di sicurezza di Supabase (advisors), dataviz, code-review; Backend Design dopo un controllo | Il più delicato: database e regole di accesso |
| Prima di ogni pubblicazione | security-review, code-review | Già incluse in Claude Code |

## Rilascio 3 · Blocco 1 (02–03/10/2026): finito, approvato e su `main`
Ramo `claude/itinerari-blocco-1`, creato da `main`. Niente è online: il sito pubblico non cambia (controllato: tutte le pagine costruite sono identiche a prima; cambiano solo le date di generazione dei calendari .ics e ci sono le 34 foto delle tappe, non usate da nessuna pagina).

**Fatto nella seconda sessione (02/10/2026)**
- **Tappe** in `src/data/tappe.yaml`: 33 in città (centro storico 10, Toledo e Plebiscito 6, lungomare 4, Vomero 4, Sanità e Capodimonte 4, Posillipo e Bagnoli 5) e 6 gite (Pompei, Ercolano, Vesuvio, Capri, Ischia, Procida). Per ognuna: posizione dell'ingresso da OpenStreetMap, durata, ingresso, prenotazione, giorni di chiusura, al chiuso, gradini, bambini, momento migliore. Tabella completa: `ricerca/2026-10-02-itinerari-tappe.md`.
- **Tolte** per chiusura: Castel dell'Ovo (resta il Borgo Marinari), Pausilypon, Pontile Nord, Orto Botanico (pagina ufficiale irraggiungibile), Largo Maradona (cantiere senza date). Segnate «in parte chiuse»: Tombe di Virgilio e Leopardi, Parco Virgiliano; il castello del Borgo Marinari.
- **83 schede** `tp-…` in `fatti.yaml` (orari, prezzi, viaggi delle gite, avvisi), da ricontrollare entro il 30/04/2027; **81 fonti** `tp-…` in `fonti.yaml`; **34 foto** di Wikimedia Commons (`tp-…` in `foto.yaml`, file in `src/assets/foto/`), più 3 foto già del sito. Senza foto: Cappella Sansevero (dentro non si fotografa) e Pedamentina.
- **Testi brevi** di tutte le 39 tappe in `src/testi/tappe.yaml`, con i controlli e le firme come le altre pagine. Dati incerti segnati: orari delle chiese di Spaccanapoli (siti non ufficiali), ingresso gratuito alle Tombe di Virgilio (2025), ZTL di Marechiaro (2026), orario estivo di Città della Scienza e traghetti 2027 (non ancora usciti).
- **Tempi tra le tappe** in `src/data/tempi-tappe.json` (script `scripts/itinerari/scarica.mjs` e `costruisci.mjs`): a piedi su strade, scale e ascensori di OpenStreetMap, con le salite dalle quote Copernicus; con Linea 1, 2 e 6, funicolari Centrale, Chiaia e Mergellina e Cumana fino a Bagnoli. Funicolare di Montesanto chiusa, Linea 2 ferma a Campi Flegrei. Due casi: giorno feriale e domenica pomeriggio, più solo a piedi. **9 controlli a campione** con BRouter e OSRM: distanze uguali (0–3%), salite forti uguali, tempi nostri più prudenti. Metodo e tabella: `ricerca/2026-10-02-itinerari-distanze.md`. La Cumana (16 minuti da Montesanto a Bagnoli, un treno ogni 15 minuti) viene dal tabellone EAV letto il 02/10/2026.
- **Nascosto finché non è online**: `ITINERARI_ONLINE = false` in `src/config/sito.ts`; le pagine Fonti e Note legali saltano tutto ciò che ha id `tp-`. La build controlla tappe, schede, testi e tempi dalla pagina `/napoli/` (`src/lib/tappe.ts`): se una tappa cambia posizione, chiede di rifare i tempi.
- **Due proposte di design** (con le skill frontend-design e VectorLab; tu hai detto che non serve restare nello stile «Regata»), bozzetti con i dati veri in `design/itinerari/` (`genera.mjs`, `foto.cjs`, `proposta-a.html`, `proposta-b.html`):
  - **A «Riggiola»** (schema «Lista»): l'elenco delle tappe è la pagina; l'itinerario sta in un vassoio in basso e si apre a tutto schermo; tappe numerate con piastrelle gialle; riordino con un modo «Cambia l'ordine» (maniglia e frecce). Caratteri Bricolage Grotesque e Atkinson Hyperlegible Next; blu cobalto e giallo limone.
  - **B «Orario»** (schema «Calendario»): la pagina è la giornata con gli orari, come una linea della metro; spostamenti nei colori dei mezzi; si aggiunge da un pannello che propone le tappe vicine all'ultima; la riga gialla e nera della fine giornata taglia la tappa che sfora. Caratteri Barlow; nero e giallo come i cartelli dei trasporti.
  - Schermate: elenco, tappa lontana («circa 40 minuti in più tra andata e ritorno»), cambio dell'ordine (A), giornata piena, giorno vuoto con gli itinerari pronti, mappa con i percorsi veri.
- Corretti due script che su Windows non trovavano le cartelle (`npm run testi:firma` e `npm run check:links`).
- Nuovo pacchetto di sviluppo: `geotiff` (lettura delle quote Copernicus).

**Decisione del 03/10/2026: scelta la proposta B «Orario», corretta (bozzetti aggiornati in `design/itinerari/`, schermate b1–b5)**
- Tienila come base della pagina: la giornata con gli orari a sinistra di ogni tappa, tempi e mezzi tra una tappa e l'altra, pannello «Aggiungi una tappa» con le tappe vicine all'ultima e i minuti per arrivarci, riga di fine giornata che taglia la tappa che sfora, giorni 1/2/+ in alto, vista Giornata/Mappa.
- **Cambiamenti chiesti da te rispetto a B**: niente linea con i pallini tipo fermata (l'ora è solo scritta a sinistra); le **foto** delle tappe, nelle schede e nell'elenco per aggiungere; le **piastrelle gialle quadrate e un po' arrotondate** di A, numerate, sulla foto di ogni tappa, nel riepilogo e sulla mappa, **piccole** (non devono coprire la mappa); il **+ per aggiungere sobrio** (bordo grigio, non giallo); **il giallo solo sulle piastrelle** e sulla riga della fine giornata; pulsanti principali neri (bianchi nello scuro).
- Non sei del tutto sicuro: puoi cambiare idea o ritoccare man mano, anche durante il blocco 2. Lo stile «Regata» non va seguito: il nuovo stile (caratteri Barlow e Barlow Semi Condensed, nero, giallo e grigi) vale per la pagina degli itinerari; se piace, se ne parla per il resto del sito nel blocco 3.
- **Posto nel menu**: dentro «Napoli», in una pagina tutta sua (nessuna voce nuova nel menu). **Itinerari pronti**: mezza giornata, 1, 2 e 3 giorni in città; le gite (Pompei, Ercolano, Vesuvio, Capri, Ischia, Procida) restano giornate intere a parte.
- Da ricordare per il blocco 2: la proposta A aveva anche «Cambia l'ordine» (maniglia e frecce): nella pagina servono maniglia e pulsanti Su/Giù per chi usa tastiera e lettore di schermo.

**Da sapere**
- Gli autobus non sono nei tempi: Marechiaro, Gaiola e Parco Virgiliano risultano molto lontani a piedi (da Mergellina a Marechiaro circa un'ora e mezza); nei testi consigliamo bus o taxi.
- Napoli Sotterranea non pubblica i prezzi sul suo sito: la scheda lo dice.
- Sul sito pubblico la scheda `echia-ascensore` (orari presi da OpenStreetMap) è diversa da quella del gestore ANM (7–22 tutti i giorni, 1,50 €): da correggere in un prossimo aggiornamento, quando si può cambiare il sito.
- Su questo PC la build a volte si chiude con un errore di sistema (codice 139): basta rilanciarla.

### Prima sessione del blocco 1 (02/10/2026)

**Deciso con te il 02/10/2026**
- Gli itinerari stanno dentro «Napoli», in una pagina tutta loro: niente voce nuova nel menu.
- Itinerari pronti: mezza giornata, 1, 2 e 3 giorni in città. Le gite fuori città (Pompei, Ercolano, Vesuvio, Capri, Ischia, Procida) restano a parte.

**Fatto**
- **Ricerca su orari, chiusure, prezzi e prenotazioni** (deep-research, 7 gruppi di luoghi più i trasporti, fonti ufficiali lette il 02/10/2026): riassunto con le tabelle in `ricerca/2026-10-02-itinerari-orari-prezzi.md`, note complete con le citazioni in `ricerca/2026-10-02-itinerari-note/`. Nessun ente ha ancora pubblicato il 2027: valgono gli orari di oggi, da ricontrollare nella primavera 2027.
- Cose che cambiano l'elenco delle tappe:
  - chiusi senza data di riapertura: **Castel dell'Ovo** e **Pausilypon con la Grotta di Seiano** (dal 1° ottobre 2026);
  - chiusi fino a circa febbraio 2027: **Pontile Nord di Bagnoli** e **funicolare di Montesanto**;
  - aperti solo in parte: **Parco Virgiliano** (lavori fino al 2027) e **Parco delle Tombe di Virgilio e Leopardi** a Piedigrotta;
  - **Linea 2** ferma a Campi Flegrei e **Cumana** ferma a Bagnoli dopo i terremoti del 2026; **Campania Express** sospeso; **Linea 6** il sabato e la domenica solo fino alle 14:50;
  - prenotazione obbligatoria: Cappella Sansevero, Catacombe, Fontanelle, Galleria Borbonica, spiaggia della Gaiola (maggio-settembre), Gran Cono del Vesuvio. Pompei: biglietti nominativi, al massimo 20.000 ingressi al giorno;
  - giorni di chiusura: martedì (MANN, Sansevero, Madre, musei del Vomero, Tombe di Virgilio e Leopardi), mercoledì (Capodimonte, Palazzo Reale, Catacombe, Fontanelle), domenica (Castel Nuovo).
- **Strumenti sul PC**: Node.js 24 (versione stabile) in `C:\Users\Windows11\tools\node-v24.21.0-win-x64`, senza cambiare le impostazioni di Windows; pacchetti installati (`npm ci`), build di prova riuscita. Per immagini e controlli si usa Chrome, già installato.

**Da fare nel blocco 1** (piano della prima sessione: tutto fatto nella seconda, vedi sopra)
1. **Tappe** in `src/data/tappe.yaml` (circa 33 in città più le 6 gite), con orari e prezzi come schede in `fatti.yaml` (data «da ricontrollare»), fonti in `fonti.yaml`, foto da Wikimedia Commons, testi in `src/testi/tappe.yaml`. Prima rivedere l'elenco per le chiusure qui sopra.
2. **Distanze**: script in `scripts/itinerari/` sulle strade e sulle scale di OpenStreetMap, con le salite (quote Copernicus a 30 m, dati aperti) e con metro, funicolari e ascensori, tenendo conto delle interruzioni del 2026. Almeno 5 controlli a campione.
3. **Due proposte di design** come immagini da telefono, in chiaro e in scuro: serve VectorLab UI/UX Skills.
4. Fermarsi e mandarti tabella delle tappe, controlli delle distanze e immagini.

**Da sapere per non cambiare il sito pubblico**
- Le pagine Fonti (`src/pages/fonti.astro`) e Note legali (`src/pages/note-legali.astro`) elencano tutte le fonti, le schede e le foto: quelle nuove degli itinerari vanno nascoste lì finché la pagina degli itinerari non è online.
- I controlli dei testi (`src/lib/testi.ts`) partono solo quando una pagina li carica: per controllare i testi delle tappe già nel blocco 1 serve un modo che non crei pagine nuove.

**Skill, situazione del 02/10/2026**
- Per il blocco 1 servono deep-research (dal tuo account, attiva), frontend-design (copia nel progetto e plugin) e VectorLab UI/UX Skills (plugin).
- Plugin installati nell'app desktop, trovati sul PC: frontend-design, modern-web-guidance (installato due volte), consistent-ui, VectorLab UI/UX Skills (aggiornato: ora 8 skill, tra cui audit, visual-taste e animation) e **Design di Anthropic, ancora installato**. La sessione «fork» del 02/10/2026 non li vedeva: controllarli in una sessione nuova.

## Prossima sessione
Il Rilascio 3 è diviso in **3 blocchi, uno per sessione**, con un prompt pronto per ciascuno:
1. `PROMPT-BLOCCO-1.md` · **itinerari, contenuti e proposte di design** (**finito e approvato il 03/10/2026, portato su `main`**: vedi la sezione qui sopra. Per partire con il blocco 2: sessione nuova con il testo di `PROMPT-BLOCCO-2.md`). Le tappe con le loro fonti, le distanze calcolate da noi su OpenStreetMap, 2 proposte di design da scegliere. Nessuna pagina nuova online. Skill: deep-research, frontend-design, VectorLab UI/UX Skills.
2. `PROMPT-BLOCCO-2.md` · **itinerari, la pagina**: il compositore (aggiungere, togliere, riordinare, distanze, avvisi), la mappa, salvare e condividere senza account. Skill: frontend-design, Modern Web Guidance, VectorLab UI/UX Skills.
3. `PROMPT-BLOCCO-3.md` · **il sito più ordinato**: controllo di coerenza e le 7 proposte del 01/10/2026 (pagine più corte, «In breve», home più leggera, fonti a tendina, meno riquadri, Avvisami in una pagina sola, 3D più in basso). Skill: frontend-design, VectorLab UI/UX Skills, consistent-ui.

Alla fine di ogni blocco la sessione **si ferma**: manda le cose da rivedere (anteprima, immagini, tabelle), aspetta l'OK e dice quali skill accendere o spegnere per il blocco dopo. Alla fine del blocco 3 chiede di spegnere VectorLab UI/UX Skills e consistent-ui.

## Cose che devi fare tu
1. ~~Vercel → Production Branch = `main`~~ (il sito pubblico si aggiorna da `main`).
2. **Guardare il sito sul telefono** e dire cosa cambiare.
3. ~~Nome ed email del titolare~~ (fatto il 30/09/2026: Enrico Licenziati, napoliavela.guida@gmail.com).
4. ~~Pubblicare su `main`~~ (Rilasci 1, 1.1 e 2 il 30/09/2026; Rilasci 2.1 e 2.2 il 01/10/2026).
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
- Rilascio 3 (Vivi Napoli) → effort alto: tante informazioni nuove da verificare con le fonti.
- Rilascio 5 (Pronostici) → effort alto.
