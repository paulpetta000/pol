# Itinerari di Napoli: più luoghi, dove mangiare, autobus

_Specifica del 03/10/2026. **Approvata da Enrico il 03/10/2026** (ordine A → B → C, 40–50 locali, criteri di scelta e filtri come qui sotto)._
_Perimetro: solo Napoli. Il sito itinerari per più città è un lavoro a parte (vedi `PROGRESS.md`)._

## Obiettivo
Ampliare la pagina `/napoli/itinerari/` in tre modi, con lo stesso metodo delle 39 tappe attuali (fonti, schede, testi, controlli della build):
1. **Circa 10 luoghi in più** (almeno 10, se la ricerca li conferma aperti e documentati), **non solo storici**: anche **luoghi panoramici** e **giardini belli da visitare** (aggiunto il 03/10/2026).
2. **Dove mangiare**: una pagina sola con tutti i locali e i filtri (cucina, prezzo, aperto adesso, zona); ogni locale si può aggiungere all'itinerario come pranzo, cena o spuntino.
3. **Autobus** nei tempi di spostamento: quanto passano le linee che portano ai luoghi e quanto ci mettono tra una tappa e l'altra.

## Cosa non cambia
- Regola del progetto: **nessuna informazione senza fonte**, con stato, data di controllo e testo che lo dice a parole se non è confermata per il 2027 (`{?id}`).
- Il compositore, gli avvisi, la mappa, il salvataggio e la condivisione restano com'è la pagina oggi: si aggiungono dati, non si rifà la pagina. Eccezione: i pochi punti segnati con «(pagina)» qui sotto.
- Foto solo con licenza libera. Nessun servizio esterno prima di un tocco dell'utente.

## 1 · Luoghi in più
- **Candidati di partenza** (solo un elenco mio, non una fonte; la ricerca decide cosa entra): San Domenico Maggiore, Girolamini e Quadreria, Museo Filangieri, Villa Pignatelli, Donnaregina Vecchia, San Giovanni a Carbonara, Porta Capuana con Castel Capuano, Villa Rosebery, Palazzo Donn'Anna (da fuori), Santa Maria la Nova, il mercato di Porta Nolana, la Pignasecca, il Museo del Tesoro di San Gennaro se separato dal Duomo, Piazza Vanvitelli e il Vomero. Per le gite fuori città: Reggia di Caserta, Pozzuoli, ville vesuviane, Pietrarsa, Sorrento (non in città: restano giornate intere a parte come le altre gite).
- **Tre tipi di luogo, da mescolare nell'elenco proposto** (aggiunto il 03/10/2026): storici (come i 39 attuali); **panoramici** (terrazze, belvedere, punti da cui si vede il golfo, anche al tramonto); **giardini e parchi belli** da visitare, non storici. Ogni luogo ha `generi` con `panorama` o `giardino` quando è il caso.
- Per panoramici e giardini contano in più: ingresso gratuito o a pagamento, orari di apertura (i giardini chiudono al tramonto o per stagione), gradini e accessibilità, **momento migliore** (tramonto, mattina), e quanto è tranquillo. Fonti ufficiali del Comune o dell'ente che li gestisce.
- Evita doppioni con i **punti da cui guardare le regate** già nel sito (`src/data/luoghi.yaml`, pagina «Dal lungomare»): se un luogo è in entrambi, le due pagine si collegano tra loro e non ripetono lo stesso testo.
- Per ogni luogo, come oggi: posizione dell'ingresso da OpenStreetMap, durata della visita (stima nostra o del gestore), schede `tp-…` per orari e prezzi, giorni di chiusura, prenotazione, al chiuso, gradini, bambini, momento migliore, foto libera, testo breve in `src/testi/tappe.yaml`.
- **Si scartano** i luoghi chiusi senza data di riapertura e quelli con orari non verificabili da una fonte ufficiale. Quello che si scarta, con il motivo, va nelle note di ricerca.
- I tempi tra le tappe si rifanno con `scripts/itinerari/costruisci.mjs` (la build si ferma finché non sono rifatti).

## 2 · Dove mangiare (una pagina sola, con i filtri)

### 2a · La pagina
- **Una pagina `/napoli/dove-mangiare/`** sotto «Napoli», con tutti i locali in un elenco e i filtri in alto. Si apre dalla pagina itinerari (pulsante «Dove mangiare») e dal pannello «Aggiungi una tappa». Non una voce nuova nel menu principale.
- Ogni locale ha la sua scheda: cosa si mangia lì, indirizzo, orari, giorno di chiusura, prezzo indicativo, prenotazione, foto libera, fonte.
- **Ogni locale è anche una tappa**: con «Aggiungi all'itinerario» entra nella giornata come pranzo, cena o spuntino (durata tipica: spuntino 15–20 min, pasto 60–90). Un solo posto dove vivono i dati.
- Il cibo tipico (cuoppo di fritti con il baccalà, pizza fritta, frittatina di pasta, pizza a portafoglio, sfogliatella, babà, caffè…) non è una sezione a parte: è un filtro «Cosa vuoi mangiare» con due righe su ogni piatto e sui locali che lo fanno.
- Nell'itinerario: avviso se un locale è **chiuso a quell'ora o in quel giorno** (stesso meccanismo del «Chiuso il martedì» di oggi) e se la tappa cade fuori dall'orario del pasto.

### 2b · I filtri
Quelli che hai chiesto:
1. **Tipo di cucina**: locali tipici (cucina napoletana), pasta, ristoranti di mare, pizzerie, carne, friggitorie e cibo di strada, dolci e caffè.
2. **Prezzo**: tre fasce (€, €€, €€€), calcolate da prezzi ufficiali con la regola scritta sulla pagina (per esempio il costo di un pasto base preso dal menu o dal listino del locale, con data). Se il locale non pubblica i prezzi, la scheda lo dice, e il locale compare come «prezzo non pubblicato», non in una fascia inventata.

Le altre due che aggiungo per renderlo completo:
3. **Aperto in quel giorno e a quell'ora**: usa il giorno e l'ora dell'itinerario (o li scegli lì). Serve più di tutti, perché molti locali chiudono un giorno a settimana o a metà pomeriggio.
4. **Vicino a una zona o a una tappa**: le 6 zone della mappa, più «vicino alle tappe del mio itinerario» con i minuti a piedi, calcolati con lo stesso sistema dei tempi.

Altri filtri possibili, ma solo se la fonte ufficiale del locale li dice, e quindi non nella prima versione: vegetariano e senza glutine, adatto ai bambini, senza prenotare.

### 2c · Come si scelgono i locali (regole)
- Numeri decisi da Enrico: **40–50 locali** in totale, con almeno uno per zona. Per cucina all'incirca (totale 45): pizzerie 8, friggitorie e cibo di strada 6, cucina napoletana tipica 8, **pasta** 6 (osterie e trattorie dove la pasta è il piatto forte), carne 5, pesce 6, dolci e caffè 6. Le quantità si aggiustano in base a quanti locali hanno una fonte ufficiale con orari e prezzi: ne entrano meno ma sicuri, mai di più con dati inventati.
- Dati da fonte ufficiale del locale (sito, pagina ufficiale): indirizzo, orari, giorno di chiusura, prenotazione, prezzo. Le valutazioni non sono dati: niente «il migliore», niente stelle nostre.
- Criteri di scelta scritti sulla pagina, uguali per tutti: **storia documentata**, **riconoscimento di una guida o di una fonte indipendente** (per esempio Michelin, Gambero Rosso, Slow Food, UNESCO sulla pizza napoletana) e **posto comodo tra le tappe**. Se la scelta è nostra, lo diciamo.
- Stato delle informazioni: `confermato` (sito ufficiale), `stampa` (guida o giornale), `segnalato` (blog o siti non ufficiali, con `*`).
- **Nessun pagamento e nessuna affiliazione** legati alla scelta: i link di affiliazione del Rilascio 3 (`PIANO.md`, punto 8) non si applicano ai locali, e la pagina dice che la lista è indipendente.
- Ricontrollo: orari e prezzi dei locali cambiano spesso: **ricontrollare entro il 30/04/2027** e poi prima della Coppa.
- **Menu**: nella scheda di un locale, un pulsante «Apri il menu» che porta alla pagina del menu **sul sito ufficiale del locale**, solo se quella pagina esiste ed è pubblica. Non si copia il menu nel nostro sito (cambia spesso e non è nostro) e non si inventa niente: se il locale non ha un menu pubblico, il pulsante non c'è e la scheda dice «menu non pubblicato online». Il link porta fuori dal nostro sito e lo dice. L'indirizzo del menu ha la sua data di controllo e la build avvisa quando è da ricontrollare.
- **Un locale può stare in più categorie.** `cucina` è un elenco: un ristorante può essere insieme pesce, pasta e pizza. Il filtro lo mostra se corrisponde a **una qualsiasi** delle sue categorie. Una categoria si assegna solo se c'è nel menu o nella pagina ufficiale (per esempio «pesce» perché in carta c'è la pasta e vongole).
- **«Rinomato per»**: nella scheda, una riga che dice per quale piatto il locale è conosciuto, anche se è diverso dalla categoria con cui compare (per esempio: nel filtro «pesce» perché in carta c'è la pasta e vongole, ma conosciuto per il ragù o per la genovese). **Si scrive solo se lo dice una fonte indipendente** (guida, giornale, riconoscimento), citata nella scheda con il suo stato (`stampa`, `confermato`). Se non c'è una fonte, la riga non c'è: niente «rinomato» per sentito dire.
- Nei dati: `categoria: mangiare`, `pasto: [pranzo, cena, spuntino]`, `cucina: [...]` (più valori possibili), `rinomatoPer: {piatto, fonte}` (facoltativo), `fascia: 1|2|3|nd`, `piatti: [...]`, `menu: <indirizzo ufficiale>` (facoltativo).

### 2d · Come si fa (decisioni del 04/10/2026, con Enrico)
- **Elenco**: 32 locali con orari sul sito ufficiale, riletti dal modello principale il 04/10/2026 (`ricerca/2026-10-04-locali-note/riepilogo.md` e `secondo-giro.md`). Restano fuori, finché il sito non scrive gli orari, i locali famosi senza orari (Masardona, Scaturchio, Gambrinus…). Se un sito si contraddice sugli orari, il locale resta fuori. La Mattonella resta fuori (sito manomesso). **La scheda Google del locale vale come fonte ufficiale degli orari** (decisione di Enrico, 04/10/2026: la gestiscono i proprietari): dal cloud però Google non si legge, quindi gli orari da lì arrivano dalle schermate di Enrico o da una sessione sul suo computer con Claude in Chrome; la fonte è «Scheda Google del locale» con la data della schermata.
- **Fasce di prezzo** (approvate): «pasto base» a persona dal menu ufficiale, con la data. Ristoranti: il primo tipico meno caro più il secondo tipico meno caro. Pizzerie: una margherita. Cibo di strada: una pizza fritta o un cuoppo. Dolci e caffè: una sfogliatella e un caffè. Bevande e coperto esclusi. **€** fino a 15 €, **€€** fino a 35 €, **€€€** oltre.
- **Dove stanno i dati**: `src/data/locali.yaml` (collezione `locali`, separata dalle tappe perché ha campi diversi), testi brevi in `src/testi/locali.yaml` (firmati come gli altri). Per il compositore un locale è una tappa in città con `categoria: 'mangiare'`. Gli id dei locali non possono essere uguali a quelli delle tappe (la build controlla).
- **Orari**: scheda `lc-<id>-orari` (testo con fonte, stato, ricontrollo entro il 30/04/2027) più il campo `apertura`, giorno per giorno: fasce (`12:00-15:30, 19:00-23:30`), `chiuso` oppure `?` (il sito non lo dice). Una fascia che passa la mezzanotte finisce il giorno dopo; `19:30-?` vuol dire ora di chiusura non scritta. La build controlla che ogni ora del campo compaia nel testo della scheda.
- **Prezzi**: `prezzoBase` in euro (secondo la regola qui sopra) con la scheda `lc-<id>-prezzi`; la fascia la calcola la build. Senza prezzi: «prezzo non pubblicato».
- **Altri campi**: `cucina`, `pasto`, `piatti` (dall'elenco dei piatti tipici, solo se sono nel menu), `rinomatoPer` (piatto e scheda con la fonte indipendente), `perche` (scheda con storia e riconoscimenti, o «scelta nostra» con il motivo), `menu` (indirizzo e data di controllo; la build avvisa quando è da ricontrollare).
- **Durata**: spuntino 20 minuti, pizzeria 60, pasto 75 (si può cambiare per un locale).
- **Tempi**: i locali entrano nel calcolo dei tempi come le tappe (da 55 a circa 87 punti): a piedi, metro, funicolari e bus.
- **Nell'itinerario**: avviso se il locale è chiuso quel giorno, se a quell'ora è chiuso o se chiude prima della fine del pasto. Se l'orario di quel giorno non è pubblicato non c'è avviso, ma la scheda lo dice. L'«ordine più corto» non sposta i locali (come le regate: il pranzo resta all'ora del pranzo). I locali non danno l'avviso «lontana dalle altre tappe».
- **Pagina `/napoli/dove-mangiare/`**: l'elenco con i filtri cucina, prezzo, «cosa vuoi mangiare», zona, «aperto» (giorno e ora presi dall'itinerario aperto sul telefono, o scelti lì) e «vicino alle tappe del mio itinerario» (minuti a piedi). «Aggiungi all'itinerario» porta alla pagina itinerari e aggiunge il locale al giorno aperto. Nel compositore il pannello «Aggiungi una tappa» ha una terza scelta, «Mangiare», con i filtri per cucina e pasto, e il link alla pagina.
- **Peso** (misurato il 04/10/2026): la pagina itinerari passa da 468 a 770 KB (da 100 a 186 KB compressa), perché i tempi sono per 87 punti invece di 55; i percorsi della mappa (caricati quando servono) da 1,1 a 2,6 MB (260 KB compressi). «Dove mangiare» pesa 185 KB (36 KB compressa) ed è salvata anche per l'uso senza rete.
- **Come è stato fatto** (04/10/2026): ricerca di 7 agenti Sonnet più un secondo giro Opus sui siti bloccati; orari e prezzi riletti tutti dal modello principale sui siti e sui menu ufficiali (anche i PDF fatti di immagini). Il pannello «Aggiungi una tappa» ha la scelta «Mangiare» (filtri pasto e cucina, minuti dall'ultima tappa, avviso se a quell'ora è chiuso). I tempi sono stati rifatti con i dati di OpenStreetMap del 04/10/2026; `scripts/itinerari/scarica.mjs` ora scarta i server che danno dati più vecchi di 14 giorni. Revisione del `revisore`: 12 punti, tutti corretti. Restano fuori, in `da-risolvere.md`, i locali famosi senza orari scritti: si recuperano con le schermate di Enrico o con una sessione sul suo computer.

## 3 · Autobus
- **Cosa serve**: per le linee che portano ai luoghi, (a) ogni quanto passano, in modo approssimato, e (b) il **tempo medio di viaggio** tra una tappa e l'altra. Non gli orari di partenza.
- **Dichiararlo sempre**: l'autobus è meno affidabile della metro e può far ritardo. Lo scriviamo nel testo («Come calcoliamo i tempi») e nell'avviso sulla tappa raggiunta in bus.
- **Come si calcola** (stesso metodo delle altre linee): percorso della linea da OpenStreetMap, velocità media commerciale presa da una fonte (ANM o studio citato; stima nostra se non c'è, dichiarata), attesa media = metà della frequenza, più il tempo a piedi alla fermata e dalla fermata. Si aggiunge un blocco `LINEE` per i bus in `costruisci.mjs`.
- **Fin dove**: le linee che servono i luoghi altrimenti lontani a piedi (Marechiaro, Gaiola, Parco Virgiliano, Capodimonte, Posillipo) e quelle di collegamento tra zone che metro e funicolari non coprono. Quali linee e quanti passaggi vanno **verificati dalle fonti ufficiali ANM**: non si scrivono numeri di linea dalla memoria.
- **Da verificare in ricerca**: se ANM o il Comune pubblicano i dati delle linee in un formato aperto (frequenze, percorsi, fermate); se non ci sono, si usano le pagine ufficiali delle linee e OpenStreetMap, e la scheda dice che sono stime.
- Effetti sulla pagina: il compositore propone il bus come mezzo tra due tappe quando conviene (più corto del piede), nella riga dei mezzi con un colore suo; il «solo a piedi» lo esclude. Le tappe oggi segnate come «molto lontane a piedi» vanno rivalutate (i loro avvisi cambiano).
- Le fermate non sono tappe: compaiono solo come mezzo tra tappe.
- **Come è stato fatto** (03–04/10/2026, decisioni di Enrico): dati dal **feed GTFS ufficiale ANM** (orari programmati, licenza IODL 2.0, valido fino al 31/12/2026), non da velocità medie. Entrano solo le **13 linee** che accorciano almeno uno spostamento (204, 140, C16, 151, R2, R7, 182, C31, 147, 168, C21, C1, C44), con **tutte le loro fermate** in `src/data/linee-bus.json` per tappe e locali futuri. Il bus si propone solo se fa risparmiare **almeno 5 minuti**. Il ritardo possibile (circa 15%, stima nostra) **è scritto nel testo, non aggiunto ai minuti**; sul tratto in bus c'è «può tardare». Ricerca: `ricerca/2026-10-03-autobus-note/`; aggiornamento: `aggiornamenti/fonti-dati.yaml`.

## 4 · Una pagina propria per ogni luogo e locale (SEO e orientamento)
**Rimandata al blocco 3 del sito, da decidere lì** (Enrico, 03/10/2026: nel blocco A sarebbe troppo lavoro). Il blocco A aggiunge solo i dati dei luoghi; i blocchi C e D fanno la pagina «Dove mangiare» e l'elenco delle esperienze, senza pagine fisse per ogni locale o esperienza, salvo nuova decisione di Enrico all'inizio di quei blocchi. Le regole qui sotto restano come proposta per il blocco 3.

Proposta del 03/10/2026: ogni luogo e ogni locale ha la sua pagina fissa, che Google può indicizzare. Il compositore resta com'è.

**Indirizzi** (non cambiano mai dopo la pubblicazione, per non perdere i link): `/napoli/luoghi/<id>/` e `/napoli/dove-mangiare/<id>/`, con gli elenchi `/napoli/luoghi/` (per zona) e `/napoli/dove-mangiare/` (con i filtri). Le 39 tappe attuali ottengono la loro pagina nello stesso modo. Gli itinerari pronti (mezza giornata, un giorno, due, tre, regata) hanno anch'essi una pagina fissa con il testo e le tappe elencate.

**Contenuto**: titolo e descrizione propri, testo proprio, orari, prezzi, foto, fonti in fondo, dati strutturati (luogo o ristorante). Niente pagine fotocopia: una pagina esiste solo se ha almeno orari, prezzo o ingresso, foto o testo propri (la skill Programmatic SEO Gate controlla questo prima di pubblicare).

**Non perdersi: ogni pagina deve avere**
- il percorso in alto («Napoli › Luoghi › Centro storico › Duomo»), che porta indietro di un passo;
- un pulsante chiaro **«Aggiungi all'itinerario»**; se la persona arriva dal compositore, anche **«Torna al tuo itinerario»**;
- **«Vicino a qui»**: 3–4 luoghi e 2–3 locali vicini, con i minuti a piedi (già calcolati), e il mezzo se serve;
- precedente e successivo nella stessa zona;
- il menu del sito sempre visibile, e un solo passo successivo evidente: nessuna pagina senza uscita.

**Come lo misuriamo**: abbiamo già il contatore del tempo passato sulle pagine (tabella `letture` su Supabase) e Search Console; dopo la pubblicazione si guardano le pagine dove la gente resta poco e si correggono.

**Quando**: nel blocco 3, insieme alla parte SEO, per tutti i luoghi, i locali e le esperienze già presenti. Se si decide di farle, i dati sono già pronti: serve un solo modello di pagina.

## 5 · Esperienze (blocco D, aggiunto il 03/10/2026)
Attività da fare a Napoli, oltre a visitare e mangiare: **cooking class**, laboratori (per esempio pizza, pasta fresca, ceramica), degustazioni e simili.
- **Come i locali**: sono dati di operatori privati, con prezzi e orari che cambiano, quindi stesso metodo di C: fonte ufficiale dell'operatore (sito), prezzo «da» con data, durata, lingua, giorni, prenotazione, dove; stato `confermato` / `stampa` / `segnalato`; ricontrollo entro il 30/04/2027.
- **Solo offerte che si ripetono** (corsi e laboratori regolari). Gli **eventi singoli** (una serata, un festival) invecchiano subito e non entrano nell'elenco: se serve, vanno in una pagina «Novità» con la data.
- **Nell'itinerario** un'esperienza è una tappa con orario di inizio e durata fissi (non si può spostare liberamente): il compositore avvisa se non c'è il giorno o l'ora.
- **Regole di scelta** uguali a quelle dei locali (storia documentata o riconoscimento indipendente, comodità), **nessun pagamento e nessuna affiliazione**; la pagina dice che la lista è indipendente.
- Pagina propria per ogni esperienza: rimandata al blocco 3 (sezione 4). Un elenco `/napoli/esperienze/` con filtri (tipo di attività, prezzo, durata, lingua, giorno).
- Numeri proposti, da approvare con Enrico prima di costruire: 10–15.
- Dati: `categoria: esperienza`, `attivita: [cucina, laboratorio, degustazione, …]`, `durata`, `fascia`, `lingue`, `giorni`, `prenota`.

## Casi limite da gestire
- Un locale chiuso il giorno scelto o a quell'ora; chiusure estive e per ferie (se la fonte le dice).
- ~~Un bus che oggi non circola per lavori o deviazioni~~: non si gestisce (deciso da Enrico il 03/10/2026). Il testo dice che lavori e strade chiuse non li conosciamo.
- Un luogo che entra e poi chiude prima del 2027: la scheda ha la data di controllo, e la build avvisa «da ricontrollare».
- Locali che non pubblicano prezzi: la scheda lo dice, come per Napoli Sotterranea.
- Troppi locali vicini che appesantiscono la lista «Aggiungi»: il filtro per cucina e per pasto è obbligatorio, non facoltativo.
- Link condivisi di itinerari già salvati: devono continuare a funzionare dopo l'aggiunta di nuove tappe (gli id delle tappe esistenti non cambiano).

## Controlli prima di dire «fatto»
- `npm run build` senza errori (schede, testi firmati, tempi rifatti per tutte le tappe nuove).
- `npm run check:links`.
- Ogni luogo e ogni locale ha: fonte per orari e prezzi, foto con licenza (dove esiste), testo breve, tempi calcolati.
- Provato sul telefono: aggiungere un locale, avviso di chiusura, un tratto in bus, itinerario condiviso e riaperto, senza rete.
- axe senza violazioni; Lighthouse da telefono come le altre pagine.
- Revisione del `revisore` (Sonnet) sulle modifiche e controllo del modello principale sui risultati.

## Come si lavora (modelli e agenti)
- **Ricerca** (orari, prezzi, fonti): agenti Sonnet in parallelo, uno per gruppo (luoghi per zona; locali per cucina; bus per zona), con risposte corte e le fonti citate, nello stile di `ricerca/2026-10-02-itinerari-orari-prezzi.md`. Il modello principale rilegge e verifica le fonti prima di salvare nelle schede. Effort alto.
- **Struttura dei dati e costruzione** (tipo `mangiare`, bus nei tempi, avvisi): modello principale, effort alto.
- **Testi brevi e correzioni**: effort medio.
- **Revisione e controlli su molte pagine**: `revisore` (Sonnet).

## Ordine e compiti (A → B → C → D, poi il blocco 3 del sito)
Un blocco per sessione, con commit e push alla fine e l'OK di Enrico prima di passare al successivo.
- [x] **Blocco A · Luoghi** (pubblicato il 03/10/2026; Pozzuoli e ville vesuviane rimandate, vedi `da-risolvere.md`): ricerca di **18 luoghi** (circa 8 storici, 5 panoramici, 5 giardini; entrano tutti quelli con fonte ufficiale) e **5 gite in più** (Reggia di Caserta, Pozzuoli, ville vesuviane, Pietrarsa, Sorrento), Enrico rivede l'elenco, schede, foto, testi, tempi, build. Pagine fisse: rimandate al blocco 3 (sezione 4).
- [x] **Blocco B · Autobus** (pubblicato su `main` il 04/10/2026 con l'OK di Enrico, insieme all'itinerario dal vivo: `specifiche/bus-orari-veri.md`): ricerca delle linee, blocco `LINEE` per i bus, tempi rifatti, avvisi rivalutati, testo «Come calcoliamo i tempi».
- [x] **Blocco C · Dove mangiare** (costruito il 04/10/2026, sul ramo di lavoro, in attesa dell'OK di Enrico per `main`): ricerca dei locali (32), nuovo tipo `mangiare`, filtri, avvisi di orario, pagina «Dove mangiare» con i filtri, testi, controlli (pagine fisse per locale: rimandate al blocco 3, sezione 4).
- [ ] **Blocco D · Esperienze**: ricerca degli operatori, nuovo tipo `esperienza`, filtri, testi, controlli (pagine fisse: rimandate al blocco 3). Prima di costruire, Enrico approva elenco e numeri.
- [ ] Alla fine di ogni blocco: provare sul telefono, aggiornare `PROGRESS.md` (poche righe).

## Domande per Enrico (tutte risolte)
1. ~~L'ordine A → B → C va bene?~~ → **sì** (03/10/2026). (Proposto perché i luoghi usano il metodo già pronto, i bus risolvono i posti lontani e i locali sono i dati che invecchiano prima.)
2. ~~I numeri dei locali~~ → **40–50, con la pasta come categoria** (deciso il 03/10/2026).
3. ~~I criteri di scelta dei locali~~ → **vanno bene** (03/10/2026).
4. ~~I due filtri in più~~ → **vanno bene** (03/10/2026).
