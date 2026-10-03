# Autobus ANM: dati aperti e prova sulle tappe (blocco B)

_Ricerca del 03/10/2026. Nessuna linea è scritta dalla memoria: tutto viene dal feed ufficiale ANM._

## La fonte
- **Feed GTFS ufficiale di ANM** (formato aperto per linee, fermate, percorsi e orari): https://www.anm.it/google/google-transit.zip, scaricato il 03/10/2026 (6 MB; i file sono datati 21–22/09/2026). Elencato anche nel catalogo Transitland (`f-s-anm~it`) e usato da Transitous.
- **Licenza: IODL 2.0** (Italian Open Data License). Si può riusare e derivare, **citando la fonte** («Dati ANM, licenza IODL 2.0»). La citazione va nella pagina «Come calcoliamo i tempi» e nella scheda fonte.
- **Validità: dal 22/09/2026 al 31/12/2026** (101 giorni di calendario). **Non è l'orario del 2027**: si dice a parole («orario d'autunno 2026, da ricontrollare quando ANM pubblica quello del 2027»), stato `confermato` per l'oggi, `atteso` per il 2027.
- **Sono orari programmati**, non tempi reali: traffico, lavori e ritardi non ci sono. Lo scriviamo nel testo e nell'avviso sulla tappa raggiunta in bus.
- Contenuto: 96 linee bus, 4 filobus (201, 202, 204, 254), 3 di tipo tram (412, 421, 422), metro e funicolari (già nel sito con altre fonti), più 5 «linee» che sono in realtà gli ascensori pubblici (ACTON, CHIAIA, ECHIA, SANITA, VENTA: restano con la fonte OSM/ANM di oggi, non entrano come bus).
- **Non c'è nel feed**: deviazioni e sospensioni per lavori in corso. Da verificare a parte sul sito ANM (le pagine avvisi sono costruite con JavaScript e non si leggono dal cloud con gli strumenti di oggi): vedi «Aperte».

## Frequenze (corse tra le 9 e le 19, per direzione; feriale 22/09, sabato 26/09, domenica 27/09/2026)
| Linea | Ogni circa (min), feriale / sabato / domenica | Serve |
|---|---|---|
| 204 (filobus) | 12 / 23 / 24 | Capodimonte, Sanità, Colli Aminei, centro |
| 140 | 19–22 / 16 / 16 | Chiaia, Posillipo (via Petrarca, Donn'Anna), Marechiaro |
| C16 | 19 / 21 / 19 | Mergellina, Posillipo |
| 151 | 17 / 16 / 17 | Fuorigrotta, Sannazaro, Mergellina |
| R2 | 13 / 12 / 13 | Plebiscito, Toledo ↔ Porta Nolana |
| R7 | 30 / 29 / 29 | Parco Virgiliano, Città della Scienza, Mostra d'Oltremare |
| C31 | 23 / 20 / 21 | Posillipo, Vomero |
| C21 | 22 / 23 / 25 | Posillipo (via Petrarca) |
| C1 | 33 / 34 / 43 | Coroglio, Città della Scienza |
| C44 | 30 / 50 / 43 | Camaldoli |
Altre: 168 (Capodimonte e Catacombe → San Domenico, ogni 23 min), 182 (Spaccanapoli → Orto Botanico), 147 (Orto Botanico ↔ Fontanelle), tutte con guadagni piccoli (6–9 minuti). A Capodimonte passano anche 3M, C67, C63, 178 (ogni 18–45 min). 612, R5, R6 passano vicino a tappe ma non migliorano nessuna coppia.

## Prova sulle tappe (prototipo, `prova-coppie.mjs`)
Per ogni coppia delle 55 tappe e punti: corsa diretta (senza cambi), tempo di viaggio dall'orario ANM (mediana delle corse tra le 9 e le 19), attesa = metà della frequenza, più il cammino alle fermate (stima grossolana in linea d'aria, ×1,3). Fermate entro 450 m.
- **801 coppie** hanno un bus diretto; **209 migliorano di almeno 3 minuti** il tempo di oggi (feriale, con tutte le linee aperte), **66 di almeno 15**.
- Le linee che migliorano qualcosa sono solo **13**: 204 (61 coppie), 140 (45), C16 (30), 151 (20), R2 (18), R7 (15), 182, C31, 147, 168, C21, C1, C44. Le altre ~90 linee non servono ai fini del sito.
- Guadagni grandi (da oggi a con il bus): Parco Virgiliano ↔ Mostra d'Oltremare 84→32 min (R7); Parco Virgiliano → Villa Pignatelli 102→51 (R7); Città della Scienza → Parco Virgiliano 54→23 (R7); Via Petrarca da Plebiscito/Toledo/San Carlo 66→43 (140); Spaccanapoli → Capodimonte 52→30 (204); Sanità → Parco Poggio 55→33 (204); Floridiana ↔ Via Petrarca 69→35 (C31).
- Il dato completo è in `prova-coppie.json` (209 coppie).

## I luoghi lontani
- **Marechiaro** e **Gaiola**: nessuna fermata entro 700 m. La più vicina è «Discesa Coroglio – Marechiaro» (140, C1, C21, C31), a circa 730 m da Marechiaro e 990 m dalla Gaiola in linea d'aria, in discesa ripida. Il bus non porta davanti: **lascia in cima alla discesa**. Il calcolo vero userà le strade e le pendenze di OpenStreetMap.
- **Parco Virgiliano**: R7 «Cattolica» a 300 m; C1 e 140/C21/C31 a 420–560 m.
- **Città della Scienza**: R7 e C1, fermata a 50 m, ma una corsa ogni 30 minuti.
- **Capodimonte**: 204, 3M, 168, C67, C63, 178 a 160 m (la 204 ogni 12 minuti).
- **Camaldoli**: C44 a 195 m (ogni 30 minuti), 144B quasi mai.

## Cosa NON si sa (da non scrivere come dato)
- Lavori, deviazioni e linee sospese in questo momento (il feed è un orario teorico).
- L'orario del 2027 (il feed finisce il 31/12/2026).
- I tempi reali di viaggio nel traffico di Napoli.
- Le linee notturne e gli orari fuori dalle 9–19 non sono stati analizzati (non servono agli itinerari di giorno).

## Scartato
- Linee ACTON, CHIAIA, ECHIA, SANITA, VENTA: sono ascensori, non bus.
- Cambi tra due linee bus: non nella prima versione (solo corse dirette, come la tabella `LINEE`).
