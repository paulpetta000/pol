# PIANO — Guida alla 38ª America's Cup a Napoli (2027)

_Fase 1 · scritto il 30/09/2026 · stato: approvato. Rilascio 1 costruito il 30/09/2026 (vedi PROGRESS.md)_

## Cosa cambierà per te

1. Il sito diventa una **guida a più pagine** per maggio-luglio 2027. La home "Cosa vuoi fare?" porta a ogni risposta in 1 tocco, al massimo 2.
2. **Nuovo design**, chiaro e scuro. Scelto lo stile B **"Regata"** (30/09/2026). Veloce sul telefono, funziona anche senza rete sul lungomare affollato.
3. **Ogni informazione ha fonte e data di controllo.** Oggi biglietti, tribune, ospitalità e regole per le barche 2027 **non sono ancora usciti**: il sito lo dirà chiaramente e offrirà "Avvisami".
4. Passiamo ad **Astro**, uno strumento per siti con molte pagine e più lingue. I **risultati 2026** e il **3D** si salvano e migliorano.
5. **Pubblicazione automatica** da GitHub a Vercel: devi collegarli una volta (5 minuti).
6. 5 rilasci: Base → Spiegazioni e 3D AC75 → Pronostici → Vivi Napoli → Lingue.
7. Da te servono: **3 risposte** (stile, nome e dominio, budget), un **avvocato** per marchi e privacy e, più avanti, qualche account gratuito.
8. Costi: si può restare a **0 €** fino ai link sponsorizzati (Rilascio 4). Da lì Vercel richiede il piano Pro (20 $/mese). Un dominio costa circa 11-20 €/anno.
9. ⚠️ Da questo ambiente molti siti ufficiali **non si aprono** (blocco di rete). Per ora quindi le informazioni 2027 vengono dai riassunti dei motori di ricerca e **nessuna è ancora "confermata" su pagina aperta**. Qui sotto trovi l'elenco dei link da controllare.

---

## 1. Ricerca: cosa si sa oggi sul 2027

**Come ho lavorato.** 6 agenti ricercatori, uno per gruppo di argomenti, più un verificatore scettico che ha ricontrollato soprattutto le informazioni pratiche per chi viene a vederla. Il resto del piano l'ho scritto io da solo, per coerenza. Tutti i dati, completi di link, sono salvati in `ricerca/` nel repository.

**Limite importante.** La rete di questo ambiente blocca l'apertura diretta di americascup.com, comune.napoli.it, governo.it, guardiacostiera.gov.it, anm.it e quasi tutti gli altri siti. Gli agenti hanno quindi letto i **riassunti dei motori di ricerca** (gli "snippet") e non le pagine intere. Per onestà ho diviso "Annunciato" in due livelli:
- **A1**: scritto su un sito ufficiale, letto solo nel riassunto (pagina da aprire).
- **A2**: solo stampa.

Si può togliere il blocco: nelle impostazioni dell'ambiente Claude (menu dell'ambiente nella barra del titolo della sessione → *Edit* → *Network access*) aggiungi `americascup.com`, `comune.napoli.it`, `guardiacostiera.gov.it` e `anm.it`, oppure scegli un accesso più ampio. Al Rilascio 1 riapro le pagine e porto i dati a "Confermato".

**Data di controllo di tutte le righe: 29-30/09/2026.**

> **Aggiornamento 30/09/2026 (Rilascio 1).** La rete dell'ambiente ora apre americascup.com, comune.napoli.it e gli altri siti ufficiali. Le pagine principali sono state aperte e lette: date 2027, formato della Louis Vuitton Cup, Protocollo definitivo, diritti Rai, Race Village, basi di Bagnoli, tariffe dei taxi, orari ANM 2026, risultati ufficiali 2026. Nel sito i livelli A1/A2 sono diventati tre etichette: **Confermato** (fonte ufficiale o dati aperti, letta), **Dalla stampa**, **Non ancora uscito**, più **Com'era nel 2026** per i precedenti. Le schede sono in `src/data/fatti.yaml`. Restano chiusi guardiacostiera.gov.it (blocca i programmi automatici) e anm.it (la pagina non si carica).

### ✅ CONFERMATO (pagina ufficiale aperta davvero)

| Informazione | Fonte |
|---|---|
| Il Defender (Emirates Team New Zealand) può correre nella fase a gironi della Louis Vuitton Cup ma non in semifinale né in finale. I suoi risultati non contano per gli sfidanti | [Bozza finale del Protocollo AC38, art. 7.2d](https://emirates-team-new-zealand-media.s3.amazonaws.com/files/m7569_AC38-Protocol-FINAL-DRAFT.pdf) |
| Youth e Women's America's Cup si corrono nella sede del Match, su AC40 con 4 persone. Nella Youth massimo 25 anni, nella Women's nessun limite d'età | stessa fonte |
| Organizza l'America's Cup Partnership (ACP). Defender: Royal New Zealand Yacht Squadron. Challenger of Record: Royal Yacht Squadron (team GB1) | stessa fonte |

*Nota: è una bozza di maggio 2025. Il Protocollo definitivo del 12/08/2025 ([PDF](https://www.americascup.com/files/m26244_FINAL-PROTOCOL-12-AUGUST-2025.pdf)) era bloccato: va aperto per confermare.*

### 🟡 ANNUNCIATO — A1: fonte ufficiale (pagina da aprire)

| Argomento | Informazione | Fonte |
|---|---|---|
| **Louis Vuitton Cup** | **22 maggio – 4 luglio 2027** al più tardi. 22-23 maggio: regate di flotta con 7 AC75 (6 sfidanti + il Defender). Round Robin 1: 26-28 maggio; RR2: 29-31 maggio; pausa 1-8 giugno; RR3: 9-11 giugno; ripescaggio 12-13 giugno; semifinali 16-20 giugno (21 di riserva, vince chi arriva a 5); finale dal 26-27 giugno (vince chi arriva a 7) | [AC news 4148](https://www.americascup.com/news/4148_FLEET-RACING-AC75-s-TO-KICK-START-THE-LOUIS-VUITTON-CUP) · [ETNZ](https://emirates-team-new-zealand.americascup.com/en/news/813_2027-THE-LOUIS-VUITTON-38TH-AMERICA-S-CUP-MAY-JULY-2027.html) |
| **Youth America's Cup** | **2-6 giugno 2027**, su AC40 | [AC news 4332](https://www.americascup.com/news/4332_YOUTH-AMERICAS-CUP-DATES-ANNOUNCED-AS-THE-AMERICAS-CUP-CELEBRATES-THE-NEXT-GENERATION-AT-PINO-DANIELE-SPORTS-CENTRE-IN-CAIVANO) |
| **Women's America's Cup** | **5-9 luglio 2027**, su AC40 | [AC news 3837](https://www.americascup.com/news/3837_WOMENS-AMERICAS-CUP-SET-TO-CONTINUE-MOMENTUM-IN-NAPLES-IN-2027-AS-FEMALE-ATHLETES-CONFIRMED-ONBOARD-THE-AC75-YACHTS) |
| **America's Cup (Match)** | Da **sabato 10 luglio 2027** (2 regate), al meglio delle 13: vince chi arriva a 7. Fine **al più tardi il 19 luglio** | [americascup.com/38th-americascup](https://www.americascup.com/38th-americascup) · [Grazie Napoli](https://www.americascup.com/news/4372_GRAZIE-NAPOLI) |
| Campo di regata | Sotto costa, dal Castel dell'Ovo al promontorio di Posillipo, davanti a via Caracciolo | [host-venue](https://www.americascup.com/host-venue) |
| **Race Village** | Principale su **viale Francesco Caracciolo**: tribune ricavate sui promontori, palco, stand, ristoro. A **Bagnoli** un "AC Tech Fan Village" con maxischermi accanto alle basi dei team. **Gratuità 2027 non ancora dichiarata** | [AC news 3843](https://www.americascup.com/news/3843_AMERICAS-CUP-EVENTS-SPORT-E-SALUTE-UNVEIL-THE-DRAMATIC-VISION-FOR-THE-LOUIS-VUITTON-38TH-AMERICAS-CUP-IN-NAPLES-2027-AT-THE-65TH-GENOA-INTERNATIONAL-BOAT-SHOW) |
| Punti alti da cui guardare | Pizzofalcone/Monte Echia, Vomero (San Martino, Sant'Elmo), Posillipo | [AC news 4176](https://www.americascup.com/it/news/4176_NAPOLI-UN-ANFITEATRO-NATURALE-PER-L-AMERICA-S-CUP) |
| **Ospitalità** | "Esperienze VIP a terra e in mare" in preparazione: fornitore e prezzi non ancora usciti | AC news 3843 |
| Superyacht | BWA Yachting è il partner ufficiale per gli ormeggi dei superyacht: prenotazioni aperte | [AC news 4263](https://www.americascup.com/news/4263_BWA-YACHTING-OPENS-OFFICIAL-BERTH-BOOKINGS-FOR-THE-LOUIS-VUITTON-38TH-AMERICA-S-CUP-AND-GETS-READY-FOR-THE-PRELIMINARY-REGATTA-IN-NAPLES) |
| **TV** | **Rai**: diritti in chiaro per l'Italia (Match, Louis Vuitton Cup, Youth, Women's). **Sky/NOW**: diritti a pagamento. Dirette gratis anche su YouTube America's Cup | [AC news 3924](https://www.americascup.com/it/news/3924_LAMERICAS-CUP-PARTNERSHIP-ASSEGNA-ALLA-RAI-I-DIRITTI-MEDIA-PER-LITALIA-DELLA-LOUIS-VUITTON-38-AMERICAS-CUP) |
| Equipaggio AC75 | **5 velisti** invece di 8, **almeno una donna**. Almeno 3 della nazionalità del team, fino a 2 stranieri. Più sistemi a batteria, niente ciclisti | [Protocollo 12/08/2025](https://www.americascup.com/files/m26244_FINAL-PROTOCOL-12-AUGUST-2025.pdf) |
| Regola della barca | AC75 Class Rule V3.01 del 9/9/2025 | [PDF](https://www.americascup.com/files/m26296_2025-09-09-AC75-Class-Rule-V301.pdf) |
| Taxi dall'aeroporto | Tariffe fisse 24 ore su 24: 21 € fino alla Stazione Centrale, 24 € fino al Molo Beverello (28,50 € fino a Mergellina non ricontrollato) | [Tariffario taxi](https://www.aeroportodinapoli.it/documents/d/gesac/tariffario-taxi-2024-ita-eng-4-pdf?download=true) |
| Alibus | Aeroporto → Stazione Centrale → Beverello, 5 €, biglietto valido 90 minuti | anm.it |
| Tap&Go | Si paga con la carta contactless su Linea 1 e funicolari Centrale e Chiaia (tap all'entrata e all'uscita) | anm.it |
| Caldo | Il Ministero della Salute pubblica bollettini sulle ondate di calore anche per Napoli; numero 1500 | [salute.gov.it](https://www.salute.gov.it/new/it/news-e-media/notizie/estate-2026-dal-25-maggio-disponibili-i-bollettini-sulle-ondate-di-calore) |
| Precedente 2026 in mare | Registrazione online delle barche spettatori ("Watch on Water"), zone a colori, marshal in acqua | [americascup.com/it/watch-on-water](https://www.americascup.com/it/watch-on-water) |
| Precedente 2026 a terra | Race Village gratuito alla Rotonda Diaz; orari del Comune 11-21 (sabato fino alle 20:30, domenica fino alle 22) | [Comune](https://www.comune.napoli.it/novita/americas-cup-race-village/) |
| Precedente 2026 trasporti | Metro Linea 1 fino alle 2 di notte; Linea 6 e funicolare di Mergellina fino alle 00:30 | [Comune/ANM](https://www.comune.napoli.it/novita/servizi-di-trasporto-anm-in-occasione-della-coppa-america/) |

### 🟠 ANNUNCIATO — A2: solo stampa

| Argomento | Informazione | Fonte |
|---|---|---|
| **Squadre iscritte** | 7 team: **Emirates Team New Zealand** (Defender); sfidanti **GB1** (Challenger of Record), **Luna Rossa**, **Tudor Team Alinghi**, **La Roche-Posay Racing Team** (Francia), **American Racing Challenger Team USA** (Sail Newport), **Team Australia** (Royal Prince Edward YC) | [Scuttlebutt 31/08/2026](https://www.sailingscuttlebutt.com/2026/08/31/new-challenge-for-americas-cup/) + snippet AC news 4148 |
| Basi dei team | A Bagnoli (ex area industriale); consegna delle aree annunciata entro l'8/10/2026. Il pubblico non entra nei piazzali; attività aperte a tutti sul retro | [AC news 4370](https://www.americascup.com/news/4370_BAGNOLI-DEVELOPMENT-CONTINUES-AT-ASTONISHING-PACE) · Il Mattino |
| Pedane sugli scogli | Permesso della Soprintendenza fino a luglio 2027: potrebbero tornare | [Fanpage](https://www.fanpage.it/napoli/pedane-dellamericas-cup-sul-lungomare-di-napoli-ok-per-un-anno-fino-a-luglio-2027/) |
| Via Caracciolo chiusa per circa 3 mesi | **Solo voce di stampa**: nessuna ordinanza, e la verifica non ha ritrovato l'articolo | Fanpage / NapoliToday |
| Metro Capodichino | La stazione aeroporto della Linea 1 forse nel primo semestre 2027, forse a fine 2027: **non contarci** | vari |
| Nuova fermata Linea 2 "Porta del Parco" (Bagnoli) | Apertura stimata a maggio 2027. Treni Pozzuoli–Campi Flegrei fermi da ottobre 2026 a gennaio 2027 per i lavori | [ANSA](https://www.ansa.it/campania/notizie/2026/03/26/americas-cup-pronto-progetto-per-stazione-a-bagnoli-linea-2-della-metro_b7c4149a-5f7c-43de-8452-e1d03178f17f.html) |
| Precedente 2026 in mare | Ordinanza Capitaneria n. 99/2026 con Race Area vietata; spettatori a massimo 5 nodi, niente ancora, niente vela; senza motore non si entra; vietati bagno e droni; aliscafi e traghetti con rotte più lunghe | NapoliToday, Nautica Report, ANSA |
| Precedente 2026 folla | Da 85.000 a oltre 130.000 persone in un giorno, secondo le varie fonti | AC, ANSA, Sport e Salute |
| Precedente Barcellona 2024 | Village e fan zone gratuiti a capienza limitata; ospitalità ufficiale da circa 500 €/giorno | stampa |
| Risultati Cagliari 2026 | 1ª Luna Rossa 63, 2ª ETNZ 60, 3ª Luna Rossa W&Y 59… 8ª GB1 27. In finale Luna Rossa batte ETNZ | [Scuttlebutt](https://www.sailingscuttlebutt.com/2026/05/24/italy-grabs-bragging-rights-in-sardinia/) |
| Risultati Napoli 2026 | 1ª Luna Rossa 71, 2ª ETNZ 56, 3ª La Roche-Posay 48; poi a 44 punti ARC Team USA (4ª), ETNZ W&Y, Luna Rossa 2, Alinghi; **GB1 42, GB2 circa 36** (finalmente trovati i britannici). In finale Luna Rossa batte ETNZ | [Scuttlebutt](https://www.sailingscuttlebutt.com/2026/09/27/americas-cup-italy-remains-on-form/) · [AC news 4373](https://www.americascup.com/news/4373_LUNA-ROSSA-SCORE-AN-OUTSTANDING-STATEMENT-WIN-IN-NAPLES) |
| Misure AC40 | 11,80 m di lunghezza, 3,38 m di larghezza, albero 17,9 m, circa 2.000 kg, 4 persone | Wikipedia / costruttore |
| Misure AC75 (2024) | Scafo 20,7 m, larghezza 5 m, albero 26,5 m, circa 7,6 t in regata. Record: 55,6 nodi (Barcellona 2024) | Wikipedia / stampa |

### ⚪ NON ANCORA USCITO (cercato, niente di pubblicato)

| Cosa | Dove ho cercato |
|---|---|
| **Biglietti e tribune 2027**: posizione, prezzi, data di vendita, piattaforma. *Nota: le cifre che girano su alcuni blog (30-150 €) sono stime, non dati ufficiali* | americascup.com, stampa, blog |
| **Pacchetti di ospitalità**: prezzi e pagina di iscrizione | americascup.com |
| Orari delle regate 2027 e calendario giorno per giorno del Match | americascup.com, ETNZ, GB1, stampa |
| Date, orari e regole d'ingresso del Race Village 2027 (borse, vetro, droni); bagni e acqua | americascup.com, Comune, stampa |
| **Ordinanza 2027 della Capitaneria** e regole per le barche spettatori 2027; avvisi ai naviganti | guardiacostiera, stampa |
| Piano trasporti e traffico 2027 | Comune, ANM, stampa |
| Bando (Notice of Race) e squadre di Youth e Women's America's Cup | americascup.com |
| Cerimonie di apertura e chiusura | americascup.com, stampa |
| App ufficiale AC38; **API pubblica dei risultati** (non esiste nessuna API documentata) | store, americascup.com |
| Modelli 3D o disegni ufficiali con licenza di riuso | nessuno trovato |
| Altre regate preliminari prima del 22 maggio 2027 | nessuna annunciata |

### ⚠️ Dove le fonti si contraddicono

| Tema | Contraddizione | Cosa faccio |
|---|---|---|
| Fine del Match | 17-18 luglio (annuncio di gennaio) oppure "al più tardi 19 luglio" (ACP, più recente) | Uso "entro il 19 luglio" |
| Dove sarà il Race Village | ACP: via Caracciolo + Fan Village a Bagnoli. Comune: "il villaggio" a Bagnoli. Sindaco (29/9): "due Race Village" | Scrivo "due aree, dettagli in arrivo" |
| Barche nelle prime regate | "7 sfidanti" in alcuni articoli, ma sono 6 sfidanti + il Defender | Scrivo 6 + 1 |
| Semifinali | La bozza del Protocollo dice le prime 4; il formato di luglio 2026 dice le prime 3 + il ripescaggio | Vale il formato 2026 |
| Women's AC | Giugno (Sky, maggio 2026) oppure 5-9 luglio (comunicato ufficiale di settembre) | 5-9 luglio |
| Ordinanza mare 2026 | Divieti dal 21 o dal 22 settembre | È un precedente: lo cito senza data precisa |
| Taxi dall'aeroporto | "Da 16 €" (aggregatori) oppure 21 € fissi (tariffario comunale) | 21 € |
| GB2 a Napoli | 36 punti dichiarati, ma dai piazzamenti ne risultano 37 | Da verificare sui risultati ufficiali |
| Folla 2026 | 100.000 (ANSA) oppure 130.000 (Sport e Salute) in un giorno | Scrivo "oltre 100.000" |

### 🚩 Da sapere

- **americascupitalia.it** si presenta come "portale ufficiale" e vende pacchetti, ma **non risulta collegato agli organizzatori**. Il sito ufficiale è americascup.com. Nella guida metterò in guardia i lettori, con cautela.
- Il sito attuale dice "Novità 2027: 5 velisti e almeno una donna": **la ricerca lo conferma** (livello A1).

### Link che devi controllare tu (in ordine di importanza)

1. [americascup.com/news/4372 — Grazie Napoli](https://www.americascup.com/news/4372_GRAZIE-NAPOLI): date ufficiali 2027
2. [americascup.com/news/4148](https://www.americascup.com/news/4148_FLEET-RACING-AC75-s-TO-KICK-START-THE-LOUIS-VUITTON-CUP): formato della Louis Vuitton Cup e squadre
3. [americascup.com/news/3843](https://www.americascup.com/news/3843_AMERICAS-CUP-EVENTS-SPORT-E-SALUTE-UNVEIL-THE-DRAMATIC-VISION-FOR-THE-LOUIS-VUITTON-38TH-AMERICAS-CUP-IN-NAPLES-2027-AT-THE-65TH-GENOA-INTERNATIONAL-BOAT-SHOW): Race Village, tribune, ospitalità (c'è scritto se è gratis?)
4. [americascup.com/it/watch-on-water](https://www.americascup.com/it/watch-on-water): regole per le barche (aggiornate per il 2027?)
5. [Protocollo definitivo (PDF)](https://www.americascup.com/files/m26244_FINAL-PROTOCOL-12-AUGUST-2025.pdf): 5 velisti, donna a bordo, nazionalità
6. [americascup.com/news/4332](https://www.americascup.com/news/4332_YOUTH-AMERICAS-CUP-DATES-ANNOUNCED-AS-THE-AMERICAS-CUP-CELEBRATES-THE-NEXT-GENERATION-AT-PINO-DANIELE-SPORTS-CENTRE-IN-CAIVANO): date Youth (e Women's)
7. [Comune: orari ANM 2026](https://www.comune.napoli.it/novita/servizi-di-trasporto-anm-in-occasione-della-coppa-america/): modello per il 2027
8. [Tariffario taxi aeroporto (PDF)](https://www.aeroportodinapoli.it/documents/d/gesac/tariffario-taxi-2024-ita-eng-4-pdf?download=true)
9. [Guardia Costiera Napoli](https://www.guardiacostiera.gov.it/napoli): ordinanze 2027 quando usciranno
10. [Risultati ufficiali](https://www.americascup.com/results): classifica completa di Napoli 2026 (GB1 e GB2)


## 2. Il sito attuale: cosa tenere, cambiare, eliminare

**Com'è fatto oggi** (verificato leggendo il repository, non dalla descrizione):

- **Una sola pagina** (`site/index.html`, 136 KB) con 5 schede: *Oggi*, *Classifica*, *Squadre e velisti*, *Come funziona*, *Curiosità e quiz*. Viene creata unendo 5 pezzi di HTML (`src/parts/`) e inserendo i dati di `site/live.json`.
- **Solo tema scuro.** I font arrivano dai server di Google (Barlow Condensed e Source Sans 3).
- **Funzioni "in diretta"**: stato della regata, orologio di Napoli, aggiornamento automatico ogni 60 secondi, simulatore "chi va in finale", coriandoli.
- **Contenuti di valore**: risultati completi di Napoli 2026 con fonti, riassunto di Cagliari 2026, schede di squadre e velisti, guida "come funziona" con lo schema del percorso, glossario, storia, curiosità, quiz, conto alla rovescia.
- **Esploratore 3D dell'AC40** (`site/boat3d.js` + `site/b3/`, circa 82 KB più la libreria three.js): lo scafo è costruito con calcoli a partire dalle misure di classe, ha i colori di ogni squadra, un mare con riflessi e onde, 14 tappe con inquadrature, e abbassa da solo la qualità sui telefoni lenti. Si carica solo quando lo apri, quindi non rallenta la pagina.
- **Punteggio attuale** (Lighthouse mobile, cioè il test di Google per la qualità di una pagina su telefono, fatto oggi sulla versione del repository avviata in locale): Prestazioni 95, Accessibilità 94, Best practice 96, SEO 100. LCP 2,1 s, CLS 0. Difetti trovati: alcuni testi con poco contrasto, titoli non in ordine, un errore nel codice. *Nota: da qui i server di Google Fonts e vercel.app sono bloccati, quindi il punteggio reale online può essere un po' più basso.*
- **Pubblicazione**: la versione online è stata caricata a mano. GitHub non pubblica ancora da solo su Vercel (vedi punto 3).
- `src/app.html` (129 KB) è una vecchia copia che la build non usa più.

**Tenere**

| Cosa | Perché |
|---|---|
| Risultati 2026 (Napoli e Cagliari) con le loro fonti | Diventano l'**Archivio 2026** |
| Il motore 3D (scafo ricostruito, mare, luci, colori delle squadre) | È il pezzo più originale: lo allargo all'AC75 |
| "Come funziona", glossario, storia, curiosità, quiz | Buona base: li riscrivo, li ricontrollo e li sposto in "Capire la Coppa" |
| L'abitudine "ogni notizia con la sua fonte" | Diventa una regola di tutto il sito |
| Condivisione (WhatsApp, copia link) e "Tifo per…" | Il tifo servirà per il calendario personale e i pronostici |
| Conto alla rovescia | Utile in home |

**Cambiare**

| Cosa | Come | Perché |
|---|---|---|
| Una pagina sola | Tante pagine, ognuna con il suo indirizzo | Google mostra la pagina giusta per ogni ricerca; si condividono link precisi |
| Solo tema scuro | Chiaro e scuro, automatico più tasto manuale | Richiesta tua; al sole si legge meglio il chiaro |
| Font presi da Google | Font salvati sul nostro sito | Privacy (nessun dato inviato a Google) e velocità |
| Emoji usate come icone (⛵ 📺 🗺️ 🏆 e bandiere) | Icone disegnate apposta, bandiere vere in SVG (immagini vettoriali: nitide a ogni dimensione) | Richiesta tua; aspetto curato |
| Mappa schematica | Mappa vera, disegnata su misura con i dati di OpenStreetMap (la mappa libera del mondo) | Precisa, bella, funziona anche senza rete |
| Testi scritti dentro il codice | Testi in file separati, uno per lingua | Tradurre diventa facile |
| Dati scritti a mano in un file | Schede con **fonte e data di controllo obbligatorie** | Se manca la fonte il sito non si pubblica |
| 3D solo AC40 | AC40 + AC75, confronto, comandi touch migliori, immagine per chi non ha il 3D | Richiesta tua; accessibilità |

**Eliminare**

| Cosa | Perché |
|---|---|
| Parti "in diretta": stato, orologio, "In questo momento", aggiornamento ogni 60 s, box "Come si aggiorna" | L'evento è finito |
| "AC38 Live", "Oggi", "classifica live" nel titolo, nell'app installabile e nei testi di condivisione | Superati |
| Simulatore "chi va in finale" | Serviva solo durante la regata; i risultati restano nell'archivio |
| Coriandoli | Pesano e distraggono |
| Disegno 2D della barca | Sostituito da un'immagine del modello 3D |
| `src/app.html` | Copia vecchia, inutile |

## 3. Scelta tecnica

**Cos'è un framework**: una cassetta degli attrezzi per costruire siti. Invece di scrivere ogni pagina a mano, si scrivono dei "modelli" e dei contenuti, e lo strumento produce le pagine.

| | Restare così | **Astro (consigliato)** | Next.js |
|---|---|---|---|
| Cos'è | Pezzi di HTML uniti da un piccolo script | Genera pagine HTML pronte e aggiunge JavaScript (il codice che rende la pagina interattiva) solo dove serve | Strumento per applicazioni web basato su React |
| Molte pagine | Scomodo, ogni pagina a mano | Naturale | Naturale |
| Più lingue | Tutto da costruire | Già previsto: indirizzi per lingua | Previsto, ma più complicato |
| Google (SEO) | Limitato: una pagina sola | Ottimo | Ottimo |
| Velocità su telefono medio | Buona | **Ottima**: niente codice inutile | Buona, ma ogni pagina carica anche React |
| 3D e gioco | Già funzionano | Come "isole" che si caricano solo quando servono | Funzionano |
| Lavoro per passare | Nessuno oggi, ma cresce a ogni pagina | Rientra nel Rilascio 1, che è comunque un rifacimento | Rifacimento più lungo |

**Scelta: Astro** (versione 7, stabile da giugno 2026 secondo il blog ufficiale; ha già il supporto per più lingue e le "collezioni di contenuti" con controllo dei campi). Il sito è soprattutto contenuto da leggere, con poche parti interattive: è il caso ideale per Astro. Next.js è pensato per applicazioni complesse e ci costringerebbe a caricare più codice su ogni pagina, rendendo più difficile stare sopra 90 su un telefono medio. Il costo in lavoro è contenuto, perché il Rilascio 1 rifà comunque design e struttura; il motore 3D e i dati del 2026 si spostano così come sono.

**Come si tengono aggiornate le informazioni**

1. Ogni informazione è una "scheda" in un file di testo con campi obbligatori: fonte (link), stato (confermato / annunciato / non ancora uscito) e data di controllo. Se un campo manca, il sito non si pubblica.
2. Ogni pagina mostra "Fonte · controllato il …". Una pagina **Fonti** elenca tutto.
3. Ogni scheda ha una data "da ricontrollare entro". Quando scade, la build (la costruzione automatica del sito) mi avvisa.
4. **Giro di controllo settimanale (facoltativo)**: una routine di Claude, per esempio ogni lunedì, apre i link ufficiali, confronta e prepara le modifiche su un ramo di prova. Tu guardi l'anteprima e dici OK. Consuma parte del tuo utilizzo di Claude: si attiva solo se vuoi.
5. Un controllo automatico segnala i link delle fonti che non funzionano più.

**Pubblicare su Vercel**

*Perché "git_info_fail"*: ho guardato i tuoi deploy (le pubblicazioni) su Vercel, solo in lettura. Il deploy fallito (29 settembre, 13:44:57 UTC) è stato chiesto 15 secondi dopo la creazione del commit c59a3d8, quando GitHub probabilmente non lo aveva ancora ricevuto. Vercel quindi non ha trovato il codice. Un deploy successivo da GitHub (commit 16343cf, 22:53 UTC) è andato a buon fine. L'accesso quindi funziona: manca solo il collegamento automatico.

*Conviene sistemarlo? Sì.* Con il collegamento, ogni volta che salvo su GitHub Vercel crea da solo un'**anteprima** privata (visibile solo a te, da loggato); il sito pubblico cambia solo quando un rilascio è approvato. Niente più caricamenti a mano.

*Cosa devi fare tu (una volta, circa 5 minuti)*:
1. Vercel → progetto *coppa-america-napoli* → **Settings → Git → Connect Git Repository** → GitHub → scegli `paulpetta000/pol`. Se GitHub lo chiede, installa l'app Vercel su quel repository.
2. Autorizzami a creare su GitHub il ramo **`main`** (il "ramo" è una linea di lavoro; `main` sarà la versione pubblica). Poi imposti `main` come *Production Branch* nella stessa pagina (ti guido io).

*Altre cose verificate* (fonte: documentazione Vercel, letta nei riassunti di ricerca):
- "git_info_fail" significa "non riesco a leggere i dati del commit": conferma la mia spiegazione.
- Sul piano gratuito (Hobby) Vercel blocca i deploy di commit scritti da altri solo se il repository è **privato**. Il tuo è pubblico: nessun problema con i commit firmati "Claude".
- Il piano Hobby è **solo per uso non commerciale**. I link di affiliazione come scopo principale del sito o la pubblicità lo rendono commerciale: serve **Pro, 20 $/mese**. Riguarda il Rilascio 4.
- Le **statistiche** Vercel (Web Analytics) non usano cookie: riconoscono il visitatore con un codice che si cancella ogni giorno. Sul piano gratuito includono **50.000 eventi al mese**. Nei mesi della Coppa potrebbero non bastare: in quel caso passo a un'alternativa gratuita, oppure si valuta Pro.
- Le operazioni automatiche programmate (Cron) sul piano gratuito girano al massimo una volta al giorno.

Note: oggi il repository è **pubblico** (chiunque può leggere il codice). Va bene, ma nessuna password o chiave segreta sarà mai scritta nel codice: staranno solo nelle impostazioni di Vercel.

## 4. Struttura del sito

**Menu (5 voci)**: **Vederla · Calendario · Napoli · Squadre · Pronostici**. *Pronostici* compare dal Rilascio 3; prima ci sono 4 voci.

| Pagina | Scopo | Rilascio |
|---|---|---|
| **Home** "Cosa vuoi fare?" | Portare ognuno alla sua risposta in 1 tocco | 1 |
| **Vederla** (pagina guida) | Tutti i modi di vedere la Coppa, a confronto | 1 |
| ├ Dal lungomare, gratis | Punti migliori, orari, cosa portare, bambini, accessibilità | 1 |
| ├ Dal mare | Regole della Capitaneria, zone vietate, iscrizione barche, uscite organizzate | 1 |
| ├ Biglietti e ospitalità | Tribune, pacchetti, date di vendita, truffe da evitare, "Avvisami" | 1 |
| └ In TV e in streaming | Canali, orari, app ufficiale | 1 |
| **Calendario** | Tutte le date 2027, conto alla rovescia, "aggiungi al calendario"; durante l'evento il programma del giorno e i risultati | 1 |
| **Napoli** (pagina guida) | Arrivare, muoversi, mappa | 1 |
| ├ Mappa | Mappa su misura: punti di osservazione, stazioni, Race Village | 1 |
| ├ Come arrivare e muoversi | Aereo, treno, traghetto, metro, funicolari, bus, auto | 1 |
| ├ Accessibilità | Percorsi senza gradini, ascensori, assistenza | 1 |
| └ Itinerari di 1, 2, 3 giorni | Vivere Napoli intorno alle regate | 4 |
| **Squadre** (pagina guida) | Chi gareggia | 1 |
| ├ Una pagina per squadra | Storia, persone, risultati (utile per ricerche come "Luna Rossa Napoli 2027") | 1 |
| ├ Le barche | AC75 e AC40 in cifre; poi in 3D con confronto | 1 → 2 |
| └ Capire la Coppa | La regata in 60 secondi, video, glossario, storia, quiz | 2 |
| **Pronostici** | Gioco tra amici | 3 |
| Archivio 2026 | Cagliari e Napoli: classifiche, regate, storie, fonti | 1 |
| Domande frequenti | 20-25 risposte brevi | 1 |
| Fonti | Tutte le fonti con data di controllo | 1 |
| Privacy · Note legali · Accessibilità | Obblighi di legge e avviso "sito non ufficiale" | 1 |

**Indirizzi pronti per le lingue**: italiano senza prefisso (`/come-vederla/`), le altre lingue con il prefisso e l'indirizzo tradotto (`/en/how-to-watch/`, `/fr/…`). Ogni pagina avrà l'etichetta **hreflang**, un'indicazione nascosta che dice a Google "questa pagina esiste anche in inglese, a questo indirizzo".

**Prima schermata della home (telefono)**

1. In alto: nome del sito, tasto chiaro/scuro, menu.
2. Riga piccola: "Guida non ufficiale · aggiornata il …".
3. Titolo grande con le date: per esempio "L'America's Cup è a Napoli", poi "Regate nel golfo da … al … 2027".
4. Conto alla rovescia in una riga: "Mancano N giorni alla prima regata".
5. **Cosa vuoi fare?**: 6 pulsanti grandi con icona: *Vederla gratis dal lungomare · Vederla dal mare · Biglietti e ospitalità · Date e orari · Come arrivare · Chi gareggia*.
6. Sullo sfondo un'illustrazione leggera del golfo con il Vesuvio e una barca che vola.

Sotto: prossimo appuntamento, "Avvisami quando escono i biglietti", anteprima della mappa, squadre, domande frequenti, archivio 2026.

**Criterio "2 tocchi" rispettato**: dalla home ogni risposta è a 1 tocco, da qualsiasi pagina a 2 (menu → pagina).

## 5. Direzione grafica: due alternative

Regole valide per tutte e due: niente gradienti viola, niente emoji al posto delle icone, niente griglie di schede tutte uguali (alterno liste, mappe, linee del tempo, blocchi grandi e piccoli). Font salvati sul nostro sito, tutti con licenza libera. Tema chiaro e scuro studiati uno per uno, non uno il "negativo" dell'altro. Tutte le animazioni si fermano se sul telefono è attiva l'opzione "riduci movimento". Ho controllato i colori: tutti i testi superano il contrasto minimo richiesto dalle regole di accessibilità (WCAG AA). Il giallo/oro serve solo per decorazioni, mai per il testo sul chiaro.

### A · "Golfo" (non scelta)
*Come una bella guida di viaggio stampata: carta calda, titoli eleganti, i colori di Napoli.*

| | |
|---|---|
| **Font dei titoli** | **Fraunces**: un carattere con grazie (i piccoli "piedini" delle lettere dei libri), morbido e con personalità |
| **Font del testo** | **Atkinson Hyperlegible Next**: disegnato dal Braille Institute per chi vede poco. Lettere che non si confondono (I, l, 1), si legge bene anche al sole. Per orari e risultati la versione **Mono**, con cifre tutte larghe uguali che restano in colonna |
| **Chiaro ("giorno")** | fondo carta tufo `#F5EFE3` · testo blu notte `#12293A` · accento rosso pompeiano `#B3362B` · link blu golfo `#1C5F8A` · decorazioni oro tufo `#C9962A` |
| **Scuro ("sera sul lungomare")** | fondo notte `#0C1722` · testo avorio `#F2EBDD` · accento corallo `#EF7A6D` · link azzurro `#6CB7E3` · lampioni oro `#F0C25A` |
| **Immagini** | Illustrazioni in stile manifesto di viaggio (forme piatte, 3-4 colori, grana di carta) disegnate apposta: Vesuvio, Castel dell'Ovo, vele. Mappa disegnata su misura. Foto vere solo con licenza (tue, o Creative Commons con l'autore citato). Il 3D con luce calda di pomeriggio |
| **Animazioni** | Lente e morbide: onde che si muovono piano, la barca che si alza sui foil mentre scorri, contenuti che compaiono con dolcezza |
| **Tono dei testi** | Caldo e pratico, come un amico napoletano che ti accompagna. Esempio: "Da Castel dell'Ovo sei in prima fila. Porta acqua e cappello: a luglio il sole picchia." |

### B · "Regata" (scelta il 30/09/2026)
*Come la grafica TV delle regate e gli strumenti di bordo: preciso, veloce, numeri in primo piano.*

| | |
|---|---|
| **Font dei titoli e del testo** | **Archivo**: una sola famiglia che si allarga e si stringe. Stretta e nera per i titoli sportivi, normale per il testo. Pochi file, pagina veloce |
| **Font dei numeri** | **IBM Plex Mono**, come il display di uno strumento |
| **Chiaro ("vela")** | fondo bianco vela `#F3F6F7` · testo carbonio `#0F1519` · accento arancio sicurezza `#C2410C` · mare `#0B6E80` · giallo boa `#E6B800` (solo forme) |
| **Scuro ("strumenti")** | fondo `#090D10` · testo `#EDF3F5` · arancio `#FF7A3D` · ciano strumenti `#2CC4D8` · giallo `#FFD84D` |
| **Immagini** | Il nostro 3D; disegni in stile carta nautica con le linee di profondità del golfo (dati pubblici); grafica "da diretta TV" (confini del campo, frecce del vento); foto Creative Commons in due colori (blu e arancio) |
| **Animazioni** | Rapide e precise: numeri che scorrono, rotte che si disegnano, frecce del vento |
| **Tono dei testi** | Diretto ed energico, prima i numeri. Esempio: "Partenza 14:10. Vento 12 nodi. Punto migliore: Rotonda Diaz." |

**Il mio consiglio era A; hai scelto B, ed è lo stile del Rilascio 1.** Il pubblico è fatto di turisti e famiglie, e A è più accogliente. Nessun altro sito sull'evento ha un'identità "napoletana" come questa, e il tema chiaro si legge meglio al sole. Da B prenderei la precisione per calendario, risultati e 3D. Il sito attuale è già in stile "B scuro": A è un salto netto.

## 6. Funzioni

| Funzione | Cosa fa | Come la costruisco | Rilascio |
|---|---|---|---|
| **La regata in 60 secondi** | 6 scene da circa 10 secondi: il campo e il vento, la partenza, la bolina (controvento a zig-zag), la poppa (vento alle spalle), sorpassi e penalità, arrivo e come si vince la serie | Disegno animato (SVG) con didascalie di testo, tasti play/pausa/avanti. Non è un video: pesa poco, si traduce cambiando il testo, è accessibile. Con "riduci movimento" diventa 6 immagini ferme. Testi controllati sulle regole ufficiali | 2 |
| **Video ufficiali da YouTube** | Una selezione curata (gare, spiegazioni, momenti storici) con titolo, durata e perché guardarlo | Prima del clic mostro una nostra immagine con il tasto play, e YouTube non viene contattato: pagina veloce e niente tracciamento. Al clic parte il lettore ufficiale in modalità privacy avanzata. Solo video del canale ufficiale; se un video non si può incorporare, metto il link | 2 |
| **AC75 in 3D + confronto con l'AC40** | Esplorazione a tappe come oggi, confronto affiancato alla stessa scala (con una persona per capire le dimensioni), tabella dei numeri con le fonti | Riuso il motore attuale e ci costruisco l'AC75 dalle misure pubbliche, con la scritta "ricostruzione non ufficiale". Comandi touch (ruota, zoom), immagine fissa per chi non ha il 3D. Si carica solo quando tocchi "Avvia 3D" | 2 |
| **Gioco dei pronostici** | Vedi punto 7 | | 3 |

**Altre idee, solo se davvero utili**

| Idea | Perché serve | Rilascio |
|---|---|---|
| **"Dove mi metto?"**: schede dei punti di osservazione sulla mappa (vicinanza al campo, sole o ombra, gradini, affollamento, servizi se ufficiali) | È la domanda n.1 di chi va sul lungomare | 1 |
| **Funziona anche senza rete**: l'app installabile salva mappa, calendario e informazioni pratiche | Con 100.000 persone sul lungomare la rete del telefono spesso non funziona (nel 2026 le fonti parlano di 85.000–130.000 persone in un giorno) | 1 |
| **Calendario "segui la tua squadra"**: un file calendario a cui ci si iscrive; se un orario cambia, si aggiorna da solo sul telefono | Più utile di un semplice "aggiungi al calendario" | 1 |
| **Cosa portare e consigli per famiglie** (acqua, cappello, binocolo, bambini, caldo di luglio) | Pratico, e nessun altro lo spiega bene | 1 |
| **Immagine di anteprima per ogni pagina** (quella che compare su WhatsApp) | Condivisioni più belle, quindi più visite | 1 |

**Cosa non farei**: chat o assistente automatico, commenti e forum (vanno moderati), notifiche push per ora (su iPhone funzionano solo dopo aver installato l'app), newsletter frequenti. Dal sito attuale tolgo le parti "in diretta", il simulatore e i coriandoli (vedi punto 2).

## 7. Il gioco dei pronostici (Rilascio 3)

**Regole di punteggio** (semplici, da adattare al bando ufficiale quando uscirà):

| Pronostico | Si blocca | Punti |
|---|---|---|
| Chi vince ogni regata | All'orario di partenza previsto per quella regata | **3** se indovini |
| Chi vince ogni sfida (semifinali e finale della Louis Vuitton Cup, America's Cup) | Alla partenza della prima regata della sfida | **10** |
| Risultato esatto della sfida (es. 7-4) | Come sopra | **+10** bonus |
| Vincitrice di Youth e Women's America's Cup | Alla prima regata dell'evento | **5** |
| **Jolly**: una volta per fase raddoppi un pronostico | Come il pronostico scelto | ×2 |

A parità di punti vince chi ha più risultati esatti, poi chi ha indovinato più regate.

**Come si gioca senza registrazione**
1. Scegli un **soprannome** (parole offensive bloccate).
2. **Crei una lega** e ricevi un codice (es. `VELA-7K4Q`) da mandare su WhatsApp, oppure entri con il codice di un amico.
3. Il telefono ti riconosce da solo, con un'identità anonima (la funzione "accesso anonimo" di Supabase). Ricevi anche un **codice personale segreto**: se cambi telefono lo inserisci e ritrovi tutto. Niente email, niente password, niente nome vero.

**Come si aggiornano i risultati**
- **Fonte automatica**: non esiste un'API pubblica documentata (un canale di dati ufficiale pensato per altri siti). Non "prendo" i dati dalle pagine ufficiali: sarebbe fragile e forse vietato dalle loro condizioni d'uso.
- **Procedura manuale semplice**: c'è una pagina di amministrazione protetta, dove entri solo tu con un link via email. Dopo ogni regata tocchi il vincitore, incolli il link del risultato ufficiale e confermi una seconda volta. I punti si ricalcolano da soli; se la giuria cambia un risultato, lo correggi e tutto si ricalcola. Bastano circa 2 minuti per giornata.
- In alternativa lo chiedi a me in una sessione ("inserisci i risultati di oggi"). Facoltativo: una routine di Claude a fine giornata prepara i risultati e **tu confermi**.

**Come si evitano gli imbrogli**

| Rischio | Contromisura |
|---|---|
| Cambiare il pronostico a regata iniziata | Il blocco usa l'**ora del server**, non quella del telefono. Se la regata slitta, il blocco resta all'orario previsto |
| Copiare gli altri | I pronostici altrui si vedono solo dopo il blocco |
| Truccare i punti | I punti li calcola solo il database: il telefono non può scriverli |
| Risultati falsi | Li inserisce solo l'amministratore, con fonte, ora e autore registrati |
| Account finti | Non c'è premio, quindi poco interesse. Supabase limita gli accessi anonimi (30 all'ora per indirizzo); se serve aggiungo un controllo anti-robot. Chi crea la lega può togliere un partecipante |
| Soprannomi offensivi | Filtro delle parole; chi crea la lega può rinominare o rimuovere |

**Gratuito, senza premi**: "gioco gratuito tra amici, nessun premio in denaro o in natura, nessuna scommessa". Le regole sui "concorsi a premio" (DPR 430/2001) riguardano l'assegnazione di premi: senza premi il gioco dovrebbe restarne fuori, ma **lo deve confermare l'avvocato**.

**Dati su Supabase** (un servizio che offre un database, cioè un archivio di dati con regole di accesso)
- Progetto in regione UE (Francoforte), con l'accordo per il trattamento dei dati (DPA) che Supabase offre.
- **RLS** (regole scritte dentro il database che decidono chi legge e scrive ogni riga): ognuno scrive solo i propri pronostici, e solo prima del blocco.
- Unico dato: il soprannome. Cancellazione dei dati del gioco qualche mese dopo la Coppa, più un tasto "Cancella i miei dati".
- ⚠️ Supabase **mette in pausa i progetti gratuiti** dopo 7 giorni con poca attività (fonte ufficiale, letta). Soluzione gratuita: un controllo automatico giornaliero che lo tiene attivo. Soluzione a pagamento: Pro a 25 $/mese nei mesi di gara.

## 8. Stima per rilascio

| Rilascio | Grandezza | Rischi | Cosa serve da te |
|---|---|---|---|
| **1 · Base** | **Grande** | Molte informazioni 2027 ancora non uscite (il sito deve mostrarlo bene); qualità del design; testi legali; Google impiega settimane a far salire le pagine nuove, quindi **prima si pubblica meglio è** | Risposte alle 3 domande; collegare GitHub e Vercel; OK al ramo `main`; nome ed email del titolare per la pagina privacy; account gratuito Brevo per le email di "Avvisami" (serve un dominio proprio: Brevo non manda email da un mittente @gmail.com); sblocco rete (facoltativo); guardare l'anteprima sul telefono |
| **2 · Spiegazioni e 3D** | Media | Misure AC75 in parte approssimate (le dichiaro come tali); 3D fluido sui telefoni medi; alcuni video forse non incorporabili | Commenti sul copione dei 60 secondi; video preferiti (facoltativo) |
| **3 · Pronostici** | Media | Formato delle regate non ancora definitivo; sicurezza del database; pausa del piano gratuito | Parere dell'avvocato; chi inserisce i risultati durante l'evento; eventuale piano a pagamento |
| **4 · Vivi Napoli** | Media | Orari e aperture cambiano (ricontrollo vicino alle date); i link sponsorizzati rendono il sito "commerciale" | Iscrizione ai programmi di affiliazione e i link; passaggio a Vercel Pro; parere del commercialista |
| **5 · Lingue** | Media | Termini di vela corretti; 5 lingue da tenere aggiornate | Facoltativo: un madrelingua che rilegge |

**Tempi suggeriti**: Rilascio 1 entro novembre 2026; 2 in inverno; 3 almeno un mese prima del 22 maggio 2027; 4 e 5 in primavera. Valuta di anticipare le lingue (5) prima di Vivi Napoli (4): i turisti stranieri prenotano presto.

**Da far verificare a un avvocato**
1. Uso di "America's Cup", "Coppa America", "Louis Vuitton Cup" e dei nomi delle squadre nel **nome del sito**, nel **dominio** e nei titoli. Il marchio "America's Cup" risulta di America's Cup Properties Inc.; "Louis Vuitton Cup" di Louis Vuitton Malletier (fonti secondarie).
2. Testo dell'avviso "sito non ufficiale, non affiliato".
3. Pagine privacy e cookie: statistiche senza cookie (le linee guida del Garante del 10/06/2021 le esentano dal consenso a certe condizioni); video YouTube caricati solo al clic; modulo "Avvisami" con doppia conferma; gioco con dati anonimi; età minima di 14 anni per dare il consenso da soli.
4. Gioco senza premi, fuori dalle regole dei concorsi a premio.
5. Link di affiliazione: dicitura "link sponsorizzato" (regole AGCM e IAP sulla pubblicità riconoscibile) e aspetti fiscali.
6. Foto (quelle ufficiali non si possono usare senza permesso), mappe OpenStreetMap (va citata la fonte), modello 3D con i colori delle squadre ma senza loghi.

## 9. Domande (rispondi con A, B o C)

**1 · Stile grafico**
- **A — "Golfo"** (consigliata): caldo, editoriale, napoletano
- **B — "Regata"**: sportivo e tecnico

**2 · Nome e indirizzo del sito**
- **A — Nome nuovo senza marchi + dominio proprio** (consigliata). Proposte: *Napoli a Vela*, *Golfo in Regata*, *Vele sul Golfo*. Il .com si compra da Vercel a 11,25 $/anno (oggi `napoliavela.com` e `golfoinregata.com` risultano liberi). Il .it va comprato da un registrar italiano, 10-20 €/anno, e la disponibilità va controllata su nic.it. Serve anche per mandare le email di "Avvisami". Nome definitivo dopo l'ok dell'avvocato.
- **B — Restiamo su coppa-america-napoli.vercel.app** per ora: gratis, ma il nome contiene un marchio e forse andrà cambiato più avanti (con reindirizzamenti, quindi senza perdere visite).

**3 · Budget mensile**
- **A — 0 € fino al Rilascio 4** (consigliata): piani gratuiti; Vercel Pro (20 $/mese) solo quando mettiamo i link sponsorizzati; Supabase Pro (25 $/mese) solo se serve nei mesi di gara.
- **B — Piani a pagamento subito** (circa 45 $/mese): più margine su statistiche e database fin da ora.

**Oltre alle risposte, per partire con il Rilascio 1 mi serve**:
1. Il collegamento GitHub → Vercel (punto 3).
2. L'OK a creare il ramo `main` su GitHub.
3. Nome ed email di contatto del titolare del sito, da mettere nella pagina privacy.

---

**Rilascio 1 fatto. Prima del Rilascio 2 usa lo stesso effort (alto).**
