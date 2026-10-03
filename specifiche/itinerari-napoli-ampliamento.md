# Itinerari di Napoli: più luoghi, dove mangiare, autobus

_Specifica del 03/10/2026, da approvare da Enrico prima di costruire. Perimetro: solo Napoli. Il sito itinerari per più città è un lavoro a parte (vedi `PROGRESS.md`)._

## Obiettivo
Ampliare la pagina `/napoli/itinerari/` in tre modi, con lo stesso metodo delle 39 tappe attuali (fonti, schede, testi, controlli della build):
1. **Circa 10 luoghi di interesse in più** (almeno 10, se la ricerca li conferma aperti e documentati).
2. **Dove mangiare**: ristoranti come tappe vere dell'itinerario (pranzo, cena, spuntino) **e** una sezione «Cosa mangiare» sul cibo tipico, con dove trovarlo.
3. **Autobus** nei tempi di spostamento: quanto passano le linee che portano ai luoghi e quanto ci mettono tra una tappa e l'altra.

## Cosa non cambia
- Regola del progetto: **nessuna informazione senza fonte**, con stato, data di controllo e testo che lo dice a parole se non è confermata per il 2027 (`{?id}`).
- Il compositore, gli avvisi, la mappa, il salvataggio e la condivisione restano com'è la pagina oggi: si aggiungono dati, non si rifà la pagina. Eccezione: i pochi punti segnati con «(pagina)» qui sotto.
- Foto solo con licenza libera. Nessun servizio esterno prima di un tocco dell'utente.

## 1 · Luoghi in più
- **Candidati di partenza** (solo un elenco mio, non una fonte; la ricerca decide cosa entra): San Domenico Maggiore, Girolamini e Quadreria, Museo Filangieri, Villa Pignatelli, Donnaregina Vecchia, San Giovanni a Carbonara, Porta Capuana con Castel Capuano, Villa Rosebery, Palazzo Donn'Anna (da fuori), Santa Maria la Nova, il mercato di Porta Nolana, la Pignasecca, il Museo del Tesoro di San Gennaro se separato dal Duomo, Piazza Vanvitelli e il Vomero. Per le gite fuori città: Reggia di Caserta, Pozzuoli, ville vesuviane, Pietrarsa, Sorrento (non in città: restano giornate intere a parte come le altre gite).
- Per ogni luogo, come oggi: posizione dell'ingresso da OpenStreetMap, durata della visita (stima nostra o del gestore), schede `tp-…` per orari e prezzi, giorni di chiusura, prenotazione, al chiuso, gradini, bambini, momento migliore, foto libera, testo breve in `src/testi/tappe.yaml`.
- **Si scartano** i luoghi chiusi senza data di riapertura e quelli con orari non verificabili da una fonte ufficiale. Quello che si scarta, con il motivo, va nelle note di ricerca.
- I tempi tra le tappe si rifanno con `scripts/itinerari/costruisci.mjs` (la build si ferma finché non sono rifatti).

## 2 · Dove mangiare

### 2a · Locali come tappe vere
- Nuovo tipo di tappa: `categoria: mangiare`, con `pasto: [pranzo, cena, spuntino]` e `cucina: [pizza, friggitoria, napoletana, carne, pesce, dolci, caffè]`. Durata tipica (spuntino 15–20 min, pranzo e cena 60–90) e fascia oraria in cui ha senso, scritta nella scheda.
- Il compositore avvisa se un locale è **chiuso a quell'ora o in quel giorno** (stesso meccanismo del «Chiuso il martedì» di oggi) e se la tappa cade fuori dall'orario del pasto.
- Nei filtri di «Aggiungi una tappa» si aggiunge un filtro per tipo di cucina.
- Numeri proposti, da approvare: circa **25–30 locali** in totale, distribuiti nelle 6 zone, con almeno una proposta in ogni zona; per cucina all'incirca: pizzerie 6, friggitorie e cibo di strada 5, cucina napoletana 6, carne 4, pesce 4, dolci e caffè 5.

### 2b · Sezione «Cosa mangiare» (pagina)
- Una parte tutta sul cibo tipico, con una voce per piatto (per esempio il cuoppo di fritti con il baccalà, la pizza fritta, la frittatina di pasta, la pizza a portafoglio, la sfogliatella, il babà, il caffè), con due righe su cos'è, quando si mangia e dove si trova.
- Ogni piatto rimanda a 1–3 locali che sono anche tappe (stessi dati di 2a): un solo posto dove vivono i dati.
- Posto proposto: pagina `/napoli/dove-mangiare/` sotto «Napoli», collegata dalla pagina itinerari e da ogni locale. Non una voce nuova nel menu principale.

### 2c · Come si scelgono i locali (regole)
- Dati da fonte ufficiale del locale (sito, pagina ufficiale): indirizzo, orari, giorno di chiusura, prenotazione, prezzo indicativo (una cifra con data, per esempio il prezzo di un piatto o del menu base). Le valutazioni non sono dati: niente «il migliore», niente stelle nostre.
- Criteri di scelta scritti sulla pagina, uguali per tutti: **storia documentata** del locale, **riconoscimento di una guida o di una fonte indipendente** (per esempio Michelin, Gambero Rosso, Slow Food, UNESCO sulla pizza napoletana), e **posto comodo tra le tappe**. Se la scelta è nostra, lo diciamo.
- Stato delle informazioni: `confermato` (sito ufficiale), `stampa` (guida o giornale), `segnalato` (blog o siti non ufficiali, con `*`).
- **Nessun pagamento e nessuna affiliazione** legati alla scelta: i link di affiliazione del Rilascio 3 (`PIANO.md`, punto 8) non si applicano a questi locali, e la pagina dice che la lista è indipendente.
- Ricontrollo: orari e prezzi dei locali cambiano spesso: **ricontrollare entro il 30/04/2027** e poi prima della Coppa.

## 3 · Autobus
- **Cosa serve**: per le linee che portano ai luoghi, (a) ogni quanto passano, in modo approssimato, e (b) il **tempo medio di viaggio** tra una tappa e l'altra. Non gli orari di partenza.
- **Dichiararlo sempre**: l'autobus è meno affidabile della metro e può far ritardo. Lo scriviamo nel testo («Come calcoliamo i tempi») e nell'avviso sulla tappa raggiunta in bus.
- **Come si calcola** (stesso metodo delle altre linee): percorso della linea da OpenStreetMap, velocità media commerciale presa da una fonte (ANM o studio citato; stima nostra se non c'è, dichiarata), attesa media = metà della frequenza, più il tempo a piedi alla fermata e dalla fermata. Si aggiunge un blocco `LINEE` per i bus in `costruisci.mjs`.
- **Fin dove**: le linee che servono i luoghi altrimenti lontani a piedi (Marechiaro, Gaiola, Parco Virgiliano, Capodimonte, Posillipo) e quelle di collegamento tra zone che metro e funicolari non coprono. Quali linee e quanti passaggi vanno **verificati dalle fonti ufficiali ANM**: non si scrivono numeri di linea dalla memoria.
- **Da verificare in ricerca**: se ANM o il Comune pubblicano i dati delle linee in un formato aperto (frequenze, percorsi, fermate); se non ci sono, si usano le pagine ufficiali delle linee e OpenStreetMap, e la scheda dice che sono stime.
- Effetti sulla pagina: il compositore propone il bus come mezzo tra due tappe quando conviene (più corto del piede), nella riga dei mezzi con un colore suo; il «solo a piedi» lo esclude. Le tappe oggi segnate come «molto lontane a piedi» vanno rivalutate (i loro avvisi cambiano).
- Le fermate non sono tappe: compaiono solo come mezzo tra tappe.

## Casi limite da gestire
- Un locale chiuso il giorno scelto o a quell'ora; chiusure estive e per ferie (se la fonte le dice).
- Un bus che oggi non circola per lavori o deviazioni (stesso trattamento della funicolare di Montesanto: avviso e linea esclusa).
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

## Ordine e compiti (proposto, da confermare)
Un blocco per sessione, con commit e push alla fine e l'OK di Enrico prima di passare al successivo.
- [ ] **Blocco A · Luoghi**: ricerca, scelta di ~10–12 luoghi (Enrico approva l'elenco), schede, foto, testi, tempi, build.
- [ ] **Blocco B · Autobus**: ricerca delle linee, blocco `LINEE` per i bus, tempi rifatti, avvisi rivalutati, testo «Come calcoliamo i tempi».
- [ ] **Blocco C · Dove mangiare**: ricerca dei locali, nuovo tipo `mangiare`, filtri e avvisi di orario, pagina «Cosa mangiare», testi, controlli.
- [ ] Alla fine di ogni blocco: provare sul telefono, aggiornare `PROGRESS.md` (poche righe).

## Domande aperte per Enrico
1. L'ordine A → B → C va bene? (Proposto perché i luoghi usano il metodo già pronto, i bus risolvono i posti lontani e i locali sono i dati che invecchiano prima.)
2. I numeri dei locali (25–30 in totale, divisi come sopra) vanno bene?
3. I criteri di scelta dei locali (storia, riconoscimento indipendente, comodità) vanno bene, o ne vuoi altri?
4. Una pagina dedicata `/napoli/dove-mangiare/` va bene, oppure preferisci una parte dentro la pagina itinerari?
