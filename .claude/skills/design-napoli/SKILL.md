---
name: design-napoli
description: Design del sito Napoli a Vela (Astro, telefono per primo, tema chiaro e scuro). Usala per proposte grafiche, controlli di coerenza, rifinitura, caratteri, impaginazione, colori e accessibilità delle pagine, insieme a frontend-design.
---

# Design · Napoli a Vela

Skill del progetto, scritta il 06/10/2026: raccoglie testi controllati di altre skill (regola numero uno di Enrico:
letti per intero, **nessun programma, script, comando automatico o statistica** copiato). Vale con `frontend-design`
e `stile-testi` (per le parole sulle pagine).

## Regole del sito (vincono su tutto quello che c'è nei riferimenti)
- Telefono per primo (320 e 390 px senza scorrimento orizzontale), tema chiaro e scuro, «riduci movimento».
- Nessun servizio esterno prima di un tocco: caratteri scaricati in `public/fonts/`, niente CDN, niente Google Fonts dal vivo.
- Niente pacchetti nuovi senza l'OK di Enrico. Foto solo con licenza libera (`foto.yaml`).
- Prima di ogni anteprima: build, `npm run check:links`, axe in chiaro e scuro, Lighthouse su telefono 95+, nessun errore in console.
- Mai loghi, nomi, caratteri proprietari o colori che identificano un altro marchio, né «ufficiale» o loghi dell'evento.

## Riferimenti (leggi solo quello che serve al compito)
| File | Quando |
|---|---|
| `references/impeccable/craft-floor.md` | prima di ogni modifica grafica: soglia minima di qualità e cose da evitare |
| `references/impeccable/audit.md` | controllo tecnico (accessibilità, prestazioni, temi, telefono) con punteggio e priorità P0–P3 |
| `references/impeccable/polish.md` | rifinitura finale di una pagina o di un percorso |
| `references/impeccable/typeset.md` | caratteri e gerarchia dei testi |
| `references/impeccable/layout.md` | impaginazione, spazi, ritmo, ordine di lettura |
| `references/impeccable/colorize.md` | colori e contrasti, chiaro e scuro |
| `references/ui-ux-pro-max/quick-reference.md` | lista di controllo completa (accessibilità, tocco, prestazioni, moduli, navigazione) |
| `references/ispirazioni.md` | idee di stile per le proposte grafiche (8 stili riassunti da noi) |
| `design/ispirazioni/` (nel progetto) | schermate MUDD Napoli scelte da Enrico |

Nei file di impeccable i comandi «/impeccable …» non esistono: usa il file con lo stesso nome qui sopra, se c'è.
Alla fine del Blocco 3 si scrive il nostro `DESIGN.md` con il look scelto e lo si aggiunge a questa tabella.

## Licenze
impeccable: Apache 2.0, Paul Bakaus (`references/impeccable/LICENSE`, `NOTICE`, file modificati).
ui-ux-pro-max: MIT, Next Level Builder (`references/ui-ux-pro-max/LICENSE`).
Ispirazioni: riassunti nostri da awesome-design-md di VoltAgent (MIT).
