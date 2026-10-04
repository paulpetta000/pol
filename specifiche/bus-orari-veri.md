# Itinerario dal vivo: orari veri dei bus, ora del telefono, «Fatto» e posizione

_Specifica del 04/10/2026. Prima versione approvata da Enrico il 04/10/2026; **cambiata lo stesso giorno su sua richiesta** (niente pulsante «Parto adesso»: la giornata si aggiorna da sola; «Fatto» con un tocco; posizione dal GPS con un pannello sulla privacy). **Riapprovata da Enrico il 04/10/2026.** Si fa subito dopo il blocco B (bus con attesa media) e si pubblica insieme._

## Obiettivo
Il giorno dell'itinerario la pagina funziona come un navigatore: guarda **che ora è**, sa **quali tappe hai fatto** (le segni tu) e, se lo permetti, **dove sei**; fa slittare le tappe che mancano e ricalcola gli spostamenti con **le partenze vere dei bus** in quel momento. Se un bus è appena passato e aspettare non conviene, propone un'altra strada.

## Regole

### Quando è «dal vivo»
- Solo per il **giorno di oggi** di un itinerario con la data (il giorno 2 di un itinerario che comincia ieri è oggi). Gli altri giorni restano come oggi: un piano.
- Si aggiorna **da solo**: quando apri o riapri la pagina e ogni minuto mentre è aperta. Nessun pulsante.
- Prima dell'inizio della giornata resta il piano; dopo la fine della giornata, le tappe che mancano restano con l'avviso che c'è già («la giornata è piena»).

### Tappe fatte
- Su ogni tappa del giorno di oggi c'è **«Fatto»** (un tocco; un altro tocco lo toglie). Il sito **non segna mai da solo** una tappa come fatta: essere vicino non vuol dire averla visitata.
- Le tappe fatte restano nella giornata, in grigio con «fatta», senza orari; gli orari nuovi valgono per quelle che mancano.
- «Fatto» si salva con l'itinerario sul telefono (come il resto). Nel link condiviso non va.

### Da dove riparti e quando
- **Ora**: l'ora del telefono, arrotondata al minuto.
- **Punto di partenza**, in quest'ordine:
  1. se hai dato il permesso e sei **entro 200 m** da una tappa di oggi non fatta, sei lì: quella tappa è **in corso** e la lasci quando finisce la visita prevista, o subito se l'ora prevista è già passata;
  2. altrimenti l'ultima tappa segnata **«Fatto»**: riparti da lì adesso;
  3. altrimenti (nessuna tappa fatta, nessuna posizione) il piano parte dall'ora attuale, se è più tardi dell'inizio previsto.
- Se la posizione è lontana da tutte le tappe, non si usa per i tempi (non abbiamo i tempi da un punto qualsiasi): si usa il punto 2 o 3 e la pagina lo dice («non sei vicino a nessuna tappa: calcolo dall'ultima tappa fatta»).

### Posizione (GPS) e privacy
- **Mai chiesta da sola.** Il giorno di oggi compare un pannello nostro, curato nella grafica, con il pulsante «Usa la mia posizione» e «No, grazie». Solo dopo il tocco il telefono mostra la sua richiesta.
- Il pannello dice, in parole semplici: **la posizione resta sul telefono**, non arriva a noi né a nessun altro, non viene salvata e sparisce quando chiudi la pagina; serve solo a capire vicino a quale tappa sei; si può togliere quando vuoi dalle impostazioni del telefono. Il sito non usa cookie.
- Niente parole false: non diciamo «criptata» (non è il punto: la posizione non lascia proprio il telefono).
- Se dici «No, grazie», il pannello non torna per quell'itinerario (si può riattivare da un link piccolo «Usa la mia posizione»).
- La pagina **Privacy** si aggiorna con lo stesso testo.

### Bus con le partenze vere
- Si usano solo se la data è dentro il periodo del feed ANM (oggi: dal 22/09 al 31/12/2026), per tutti i giorni dell'itinerario (non solo oggi). Fuori (per esempio luglio 2027) resta l'attesa media, e il testo lo dice («gli orari 2027 non sono ancora usciti»).
- Per ogni tratto si confrontano: la strada migliore **senza bus**; le strade migliori **con il bus**, con l'attesa vera alla fermata. Il bus vince solo se fa risparmiare almeno 5 minuti, come oggi.
- Sul tratto: linea, fermata e ora («Bus 140 da Acton alle 15:04 · può tardare»). Se il bus della media non conviene più: «il 140 passa alle 15:26: conviene andare così».
- Orari programmati, non in tempo reale: lo dice il testo.

### Sempre
- Funziona senza rete (le partenze sono in un file salvato per l'uso offline). Nessun servizio esterno: ora e posizione le dà il telefono.
- Gli orari si aggiornano con il feed ANM (`aggiornamenti/fonti-dati.yaml`, riga `anm-gtfs`).

## Come si fa
- `costruisci.mjs`: per ogni coppia di punti e scenario, anche la strada migliore **senza bus** e due strade **con il bus** (la migliore con l'attesa media e la migliore se il bus arrivasse subito), scritte come pezzi: minuti fissi, poi «linea, fermata di salita e di discesa». Il disegno di queste strade per la mappa.
- `src/data/partenze-bus.json` (pagina `/napoli/itinerari/partenze.json`, caricata dopo e salvata per l'offline): per ogni linea e coppia di fermate usate, le partenze di ogni tipo di giorno, il tempo di viaggio, i nomi delle fermate, e la data → tipo di giorno.
- `src/lib/itinerari/calcolo.ts`: il calcolo del giorno riceve l'ora attuale, le tappe fatte e la tappa dove sei; per ogni tratto in bus valuta le partenze vere.
- La pagina: «Fatto», tappe grigie, aggiornamento ogni minuto, pannello della posizione, testo del tratto in bus, testi «Come calcoliamo i tempi» e Privacy.

## Casi limite
- L'ultima corsa è già passata: strada senza bus.
- Giorni di festa con orario diverso (8 dicembre, Natale): l'orario di quella data, se il feed lo ha.
- Due bus nello stesso tratto: le partenze una dopo l'altra.
- Il feed è scaduto: attesa media, e la build avvisa (c'è già).
- Il telefono non dà la posizione (permesso negato, GPS spento, al chiuso): si va avanti senza, con il punto 2 o 3.
- La posizione è imprecisa (più di 200 m di incertezza): non si usa.
- Un itinerario condiviso e aperto da un altro telefono: niente «Fatto» (sono solo di chi li ha segnati).
- Le tappe fatte cambiano l'ordine più corto e le tappe lontane: si calcolano solo sulle tappe che mancano.

## Controlli prima di dire «fatto»
- Build e `check:links` puliti; il file delle partenze piccolo da scaricare (fatto: 475 kB, **87 kB compresso**; i disegni delle strade alternative, 1,4 MB, si scaricano solo se la mappa li deve mostrare).
- Prove nel browser (con ora e posizione finte): un tratto in bus alle 15:00 e alle 15:20 dà attese diverse; luglio 2027 resta con l'attesa media; in ritardo di 30 minuti le tappe slittano; «Fatto» e ripartenza; posizione vicino a una tappa; permesso negato; senza rete.
- axe senza violazioni sul pannello; revisione del `revisore`; prova di Enrico sul telefono.

## Compiti
- [x] Prima versione approvata (04/10/2026).
- [x] Enrico approva questa versione (04/10/2026).
- [x] Dati: strade senza bus e con il bus, disegni, file delle partenze.
- [x] Calcolo: partenze vere, ora attuale, tappe fatte, tappa dove sei.
- [x] Pagina: «Fatto», aggiornamento da solo, pannello della posizione, testi, Privacy.
- [x] Prove nel browser (ora e posizione finte, senza rete, axe), `PROGRESS.md`.
- [x] Revisione del `revisore` (04/10/2026): 11 correzioni fatte (tappa in corso, Su/Giù e trascinamento con le fatte, aggiornamento senza ridisegnare mappa e avvisi, GPS che riparte da solo solo con il permesso già dato, testo del pannello, corse che «attraversavano» il capolinea, «oggi non passa», messaggi della posizione, «Fatto» ripulito quando togli una tappa, testi).
- [x] Pubblicato su `main` il 04/10/2026 con l'OK di Enrico (42 prove automatiche sull'anteprima). Il GPS sul telefono di Enrico non è stato chiesto: vedi `da-risolvere.md`.

## Fatto il 04/10/2026: cosa è venuto fuori
- Martedì dalle 9 alle 19, ogni spostamento provato ogni 10 minuti: il bus si propone nel 18,4% dei casi (16,5% con l'attesa media), la scelta cambia nel 5,5%.
- Le fermate dei bus sono separate per direzione: al capolinea si scende e si riprende il bus (prima il calcolo poteva «restare sul bus» cambiando direzione, cosa che nessuna corsa fa).
- Da decidere con Enrico, se serve: dopo la fine della giornata le tappe che mancano slittano oltre con l'avviso «giornata piena»; l'«ordine più corto» dal vivo tiene ferma la prima tappa che manca.
- Deciso da Enrico il 04/10/2026: **ogni itinerario nuovo parte con la data di oggi** (dall'orologio del telefono, senza permessi; si cambia o si toglie con «Cambia»); **toccando la riga di data e orari** si apre la stessa finestra di «Cambia»; il pannello della posizione compare solo se nella giornata c'è almeno una tappa. Gli itinerari pronti con le regate restano senza data finché non la scegli.
- Un caso deciso in corso d'opera: se il GPS dice che sei a una tappa che non è la prossima, quella diventa «in corso» e le tappe prima, non segnate «Fatto», vanno dopo (la pagina lo scrive).
