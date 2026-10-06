# Controllo di coerenza · 06/10/2026 (Blocco 3, prima della grafica)

Fatto con la skill consistent-ui (dall'account di Enrico, non copiata nel progetto) e `design-napoli`.
Pagine misurate sul sito costruito da `main` (441be5c), telefono 390 × 844, Chrome senza finestra.

## Punteggio: 24/40 (accettabile)

| # | Cosa | Voto | Il problema principale |
|---|---|---|---|
| 1 | Spazi | 2/4 | nessuna scala di spazi: `rem` nel sito, `px` negli itinerari |
| 2 | Caratteri | 1/4 | 59 grandezze diverse, 9 pesi (fino a 850), 13 larghezze; testi sotto 12 px in 10 punti |
| 3 | Colori e temi | 3/4 | colori ben definiti, chiaro e scuro curati; 25 colori scritti a mano in 6 file |
| 4 | Componenti | 2/4 | due famiglie di pulsanti (`.btn` e `.it-btn`) e circa 8 pulsanti fatti a parte; 11 tipi di riquadri |
| 5 | Icone | 3/4 | un solo componente `Icon`; illustrazioni a parte, va bene |
| 6 | Angoli e ombre | 2/4 | sito 2–3 px, itinerari 6, 8, 9, 14 e 999 px; due ombre diverse |
| 7 | Movimento | 3/4 | «riduci movimento» rispettato ovunque; durate 0,1–0,15 s nel sito e variabili negli itinerari |
| 8 | Moduli | 3/4 | etichette visibili; «Avvisami» e i filtri di «Dove mangiare» hanno stili diversi |
| 9 | Intestazioni e navigazione | 2/4 | due intestazioni di pagina e due tipi di briciole di pane |
| 10 | Parole | 3/4 | tutto in italiano, maiuscole coerenti; qualche briciola che non corrisponde al menu |

## Il problema di fondo
Il sito ha **due stili**: «Regata» (Archivo stretto e nerissimo, scritte a macchina IBM Plex Mono, angoli quasi vivi,
riga tricolore sotto i titoli) su 25 pagine, e «Orario» (Barlow, nero e giallo, angoli tondi da 8 px) su Itinerari e Dove mangiare.
Si passa dall'uno all'altro senza avviso: cambiano caratteri, pulsanti, briciole e colori. Va deciso nelle due proposte grafiche.

## Problemi in ordine di importanza
- **P1 · Due stili nel sito** (vedi sopra). `src/styles/global.css` contro `src/styles/itinerari.css`.
- **P1 · Testi troppo piccoli**: sotto 12 px, illeggibili sul telefono.
  - `CalendarioMesi.astro:127,129` (9 px), `:102` (10 px), `CampoRegata.astro:127` (8 px).
  - 11 px: `.chip` (`global.css:235`), `calendario/index.astro:110`, `index.astro:192,212`, `squadre/index.astro:71`.
- **P1 · Nessuna scala dei caratteri**: 59 grandezze scritte a mano in 30 file (per esempio .75, .76, .78, .8, .82, .84, .85, .86, .88, .9, .92 rem).
  Pesi 400, 500, 600, 700, 750, 800, 850 nello stesso sito.
- **P1 · Troppi tipi di riquadri** (punto 5 del prompt): `terzo`, `avviso`, `nota`, `band`, `band--blu`, `spot`, `avv`, `cs`, `cifre`, `vai-box`, `calm`, `x3d__panel`, più le schede degli itinerari.
- **P2 · Pulsanti**: `.btn` (angolo 3 px, peso 750) e `.it-btn` (angolo 8 px, peso 600), più pulsanti fatti a parte in `Barca3D`, `barche.astro` (`x3d__modo`), `RegataIn60` (`r60__seg`), `quiz.astro`, `Mappa.astro`, `VideoYT.astro`.
- **P2 · Intestazioni**: `PageHead` su 25 pagine; Itinerari e Dove mangiare hanno `it-testa`; la home ha la sua.
  Briciole «Home / Squadre» a macchina contro «Napoli › Itinerari» sottolineate.
- **P2 · Colori scritti a mano** che non cambiano col tema scuro: `come-vederla/dal-mare.astro` (rosso e blu delle zone), `VideoYT.astro`, `CampoRegata.astro`, `Barca3D.astro`, `squadre/barche.astro`, `index.astro`.
- **P2 · Etichette a macchina maiuscole in 41 punti** («kicker»): sopra quasi ogni titolo, così non si capisce più cosa è importante.
- **P3 · Briciole**: «Come funziona una regata» sta sotto «Squadre» nelle briciole, ma nel menu e nell'etichetta è «Capire la Coppa».
- **P3 · Stili scritti dentro le righe** (`style="margin-top:…"`): `capire-la-coppa/storia.astro`, `come-vederla/dal-mare.astro`, `squadre/barche.astro`.
- **P3 · Larghezze dei testi**: 60, 64, 68 e 72 caratteri in posti diversi.

## Cosa va già bene
- Colori con nome (`--ink`, `--accent`, `--sea`…), tema chiaro e scuro definiti uno per uno, scelta del tema rispettata.
- Nessuna pagina scorre di lato a 390 px. «Riduci movimento» vale per tutto il sito.
- Caratteri serviti dal sito con caratteri di riserva della stessa misura (la pagina non salta).
- Fonti a fondo pagina uguali dappertutto (`FontiPagina`), un solo componente per le icone.

## Lunghezza delle pagine sul telefono (prima)
| Pagina | Schermate |
|---|---|
| Home | 10,0 |
| Squadre | 6,3 |
| Una squadra (Luna Rossa) | 6,8 |
| Le barche | 8,4 |
| Calendario | 9,8 |
| Vederla | 4,2 |
| Dal lungomare | 21,9 |
| Dal mare | 7,1 |
| In TV | 3,4 |
| Biglietti | 4,6 |
| Capire la Coppa | 8,1 |
| Storia | 9,4 |
| Glossario | 10,1 |
| Quiz | 6,9 |
| Video | 6,4 |
| Napoli | 3,8 |
| Mappa | 19,2 |
| Come arrivare | 6,1 |
| Accessibilità (Napoli) | 4,4 |
| Itinerari | 20,5 |
| Dove mangiare | 15,5 |
| Domande frequenti | 5,8 |
| Archivio 2026 | 6,0 |

## Cosa propongo
Non sistemare adesso i valori uno per uno: lo stile verrà rifatto con la direzione grafica scelta.
La nuova direzione porta con sé una scala unica (5–6 grandezze di testo, 3 pesi, spazi multipli di 4 e 8 px, uno o due raggi degli angoli),
**un solo** pulsante con 2–3 varianti, 3–4 tipi di riquadri e una sola intestazione di pagina. I testi sotto 12 px si correggono comunque.
