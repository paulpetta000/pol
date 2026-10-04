# Bus con gli orari veri (partenze esatte e orologio del telefono)

_Specifica del 04/10/2026, **approvata da Enrico il 04/10/2026** (da fare subito, nella stessa sessione del blocco B). Idea di Enrico del 04/10/2026. Si fa subito dopo il blocco B (bus con attesa media) e si pubblica insieme._

## Obiettivo
Quando un itinerario cade in un giorno coperto dall'orario ANM, il tratto in bus usa **la partenza vera**: «arrivi alla fermata alle 15:05, il 140 passa alle 15:04 e poi alle 15:26». Se aspettare non conviene più, il sito propone **la strada migliore senza quel bus**. Per oggi, l'ora di partenza può venire dall'**orologio del telefono**.

## Regole
- **Quando si usano gli orari veri**: solo se la data dell'itinerario è dentro il periodo del feed ANM (oggi: dal 22/09 al 31/12/2026). Fuori (per esempio luglio 2027) resta l'attesa media di oggi, e la pagina lo dice: «orari 2027 non ancora pubblicati».
- **Cosa si confronta, per ogni tratto**: (1) la strada migliore con il bus, con l'attesa vera alla fermata; (2) la strada migliore senza bus (metro, funicolari, Cumana, a piedi), già calcolata. Vince la più corta; il bus resta solo se fa risparmiare almeno 5 minuti, come oggi.
- **Cosa si scrive**: linea, fermata e ora di partenza («Bus 140 da Acton alle 15:04»), più «può tardare». Niente promesse al minuto: gli orari sono programmati, non in tempo reale.
- **Orologio**: un pulsante «Parto adesso» mette come inizio della giornata l'ora attuale, e come data oggi. Nessun servizio esterno: l'ora la dà il telefono.
- **Gli orari si aggiornano** con il feed ANM (`aggiornamenti/fonti-dati.yaml`, riga `anm-gtfs`), come i tempi.
- **Senza rete** funziona come oggi: gli orari delle fermate usate sono nei file della pagina, salvati per l'uso offline.

## Come si fa (proposta)
- `costruisci.mjs` salva, per ogni coppia di punti e scenario, anche la strada migliore **senza bus** (minuti) e, per quella con il bus, **fermata di salita, linea e minuti a piedi fino alla fermata**.
- Un file nuovo, caricato solo quando serve, con le **partenze** delle linee bus dalle fermate di salita usate (solo quelle, non tutte), per i giorni tipici (feriale, sabato, domenica) e le date speciali (feste) del feed.
- In `src/lib/itinerari/calcolo.ts`: per ogni tratto in bus, ora di arrivo alla fermata → prossima partenza → minuti veri; confronto con la strada senza bus.

## Casi limite
- L'ultima corsa è già passata: si usa la strada senza bus, con un avviso.
- Giorni di festa con orario diverso (8 dicembre, Natale): si usa l'orario di quella data, se il feed lo ha.
- Due bus nello stesso tratto: le partenze si calcolano una dopo l'altra.
- Il feed è scaduto (dopo il 31/12/2026, se non è stato aggiornato): si torna all'attesa media, e la build avvisa.

## Controlli prima di dire «fatto»
- Build e `check:links` puliti; dimensione del file delle partenze ragionevole (obiettivo: sotto 300 kB).
- Prove: un tratto in bus alle 15:00 e alle 15:20 dello stesso giorno danno attese diverse; con la data a luglio 2027 resta l'attesa media; «Parto adesso»; senza rete.
- Revisione del `revisore`.

## Compiti
- [x] Enrico approva questa specifica (04/10/2026).
- [ ] Dati: strada senza bus e fermata di salita in `costruisci.mjs`; file delle partenze.
- [ ] Calcolo dei tratti con le partenze vere e confronto.
- [ ] Pagina: ora di partenza nel tratto, «Parto adesso», testo «Come calcoliamo i tempi».
- [ ] Prove sul telefono, revisione, `PROGRESS.md`.
