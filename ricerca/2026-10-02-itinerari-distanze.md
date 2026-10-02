# Tempi tra le tappe: come li calcoliamo e controlli a campione (02/10/2026)

I tempi tra le tappe in città stanno in `src/data/tempi-tappe.json`. Li calcola `scripts/itinerari/costruisci.mjs` sui dati scaricati da `scripts/itinerari/scarica.mjs`, senza servizi esterni nel sito: sul sito i tempi saranno sempre presentati come stime.

## Dati

- **Strade, piazze, scale e ascensori**: OpenStreetMap (Overpass API, dati del 2 ottobre 2026, licenza ODbL), nel riquadro della mappa del sito (da Nisida alla Stazione Centrale, da Posillipo a Capodimonte).
- **Quote del terreno**: Copernicus DEM GLO-30 (30 m, dati aperti ESA). È un modello «di superficie» che conta anche i tetti: per stare al livello della strada prendiamo il valore basso dei dintorni (25° percentile dei 25 punti vicini, circa 150 m per lato) e lo addolciamo lungo ogni strada (media su ±50 m). Su ponti, gallerie, portici e passaggi coperti la quota va dritta da un capo all'altro; agli ascensori la salita la fa l'ascensore.
- **Linee**: Linea 1, Linea 2, Linea 6, funicolari Centrale, di Chiaia e di Mergellina, Cumana fino a Bagnoli (fermate da OpenStreetMap).

## Il modello

| | Valore | Da dove viene |
|---|---|---|
| A piedi in piano | 4,5 km/h | Scelta prudente per turisti e famiglie, d'estate |
| Salita | +1 minuto ogni 10 m | Regola di Naismith |
| Scale | 1,4 volte più lente; in discesa +1 minuto ogni 30 m | Stima nostra |
| Ascensori pubblici | 2 minuti (attesa e corsa) | Stima nostra; orari ANM |
| Linea 1 | attesa 5 min; 32 km/h di velocità commerciale; 3 min per scendere ai binari, 2 per risalire | ANM (frequenza 10', velocità commerciale) |
| Linea 6 | attesa 7 min; 15 min da Mostra a Municipio | Comune (2026), ANM |
| Linea 2 | attesa 4 min (10 la domenica); 4 min tra Mergellina, Amedeo, Montesanto e Cavour, 5 fino a Garibaldi; ferma a Campi Flegrei | RFI, ViaggiaTreno, Trenitalia (interruzione del 21/06/2026) |
| Funicolari | attesa 5 min; Centrale 5'45", Chiaia 3'8", Mergellina 7' | ANM |
| Funicolare di Montesanto | **chiusa** (dal 15/05/2026, circa 9 mesi) | Comune |
| Cumana | attesa 7,5 min; 16 min da Montesanto a Bagnoli | Tabellone EAV del 2 ottobre 2026 (treni ogni 15 minuti fino alle 19) |
| Autobus | **non calcolati** | Frequenze non affidabili; per Posillipo nei testi consigliamo bus o taxi |

Due casi: **giorno feriale** e **domenica pomeriggio** (Linea 6 ferma dalle 14:50, ascensori gratuiti chiusi dalle 14, Linea 2 ogni 20 minuti). C'è anche il tempo **solo a piedi**.

Ogni tappa si aggancia al tratto di strada più vicino al suo ingresso (tutte entro 37 m). I percorsi a piedi lunghi (Spaccanapoli, via Toledo, lungomare, Pedamentina) hanno un punto di partenza e uno d'arrivo.

## Controlli a campione

Confronto con due motori indipendenti: **BRouter** (OpenStreetMap con le quote SRTM, profilo escursionistico) e **OSRM a piedi** (OpenStreetMap, senza quote). La colonna «noi con BRouter» applica la nostra formula alla distanza e alla salita di BRouter.

| Tratto | Noi: minuti (metri, salita) | Con i mezzi | BRouter: metri, salita | Noi con BRouter | OSRM: metri, minuti |
|---|---|---|---|---|---|
| MANN → Cappella Sansevero | 12 (710 m, +24 m) | — | 708 m, +10 m | 10 | 702 m, 9 |
| Castel Sant'Elmo → Spaccanapoli (Pedamentina) | 31 (1750 m, +9 m) | — | 2023 m, +3 m | 27 | 1728 m, 23 |
| Palazzo Reale → Monte Echia | 16 (890 m, +36 m) | — | 892 m, +52 m | 17 | 886 m, 12 |
| Duomo → Catacombe di San Gennaro | 38 (2300 m, +70 m) | — | 2297 m, +68 m | 37 | 2311 m, 31 |
| Piazza del Plebiscito → Castel Sant'Elmo | 51 (2060 m, +208 m) | **32 con la funicolare Centrale** | 2037 m, +212 m | 48 | 2040 m, 27 |
| Certosa di San Martino → Villa Floridiana | 22 (1420 m, +33 m) | — | 1408 m, +18 m | 21 | 1406 m, 19 |
| Tomba di Virgilio → Marechiaro | 93 (5920 m, +133 m) | 93 (funicolare di Mergellina) | 6109 m, +105 m | 92 | 6015 m, 80 |
| Il lungomare (Castel dell'Ovo → Mergellina) | 31 (2290 m, +5 m) | — | 2330 m, 0 m | 31 | 2283 m, 30 |
| La Pedamentina in discesa | 16 (650 m) | — | 945 m, +3 m | 13 | 650 m, 9 |

Com'è andata:
- **Distanze**: uguali agli altri due motori, con scarti dello 0–3% (BRouter a volte sceglie strade diverse: evita la Pedamentina).
- **Salite**: sulle salite vere coincidono (Plebiscito–Sant'Elmo 208 m contro 212; Duomo–Catacombe 70 contro 68). Nelle vie strette del centro il modello Copernicus aggiunge qualche metro di troppo (MANN–Sansevero 24 m contro 10): al massimo 1–2 minuti per chilometro.
- **Tempi**: i nostri sono più prudenti di OSRM, che non conta le salite (27 minuti da Plebiscito a Sant'Elmo sono troppo pochi per 210 m di dislivello). Applicando la nostra formula ai dati di BRouter si ottengono tempi quasi uguali ai nostri (scarto massimo 4 minuti).
- **Mezzi**: la funicolare Centrale fa risparmiare 19 minuti tra Plebiscito e Sant'Elmo; la Linea 6 porta da Mergellina al Plebiscito in 31 minuti contro 43 a piedi.
- **Limiti**: Marechiaro, Gaiola e Parco Virgiliano risultano lontani da tutto senza autobus (oltre un'ora e mezza a piedi da Mergellina). Gli orari dei mezzi del 2027 non sono ancora usciti: andranno ricontrollati in primavera, insieme alla riapertura della funicolare di Montesanto.
