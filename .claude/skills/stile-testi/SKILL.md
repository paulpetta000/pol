---
name: stile-testi
description: Stile dei testi del sito Napoli a Vela (tono caldo, 75% guida di viaggio e 25% amico napoletano, fonti in fondo alla pagina). Usala ogni volta che scrivi, riscrivi o traduci un testo in src/testi/, una scheda di src/data/fatti.yaml mostrata così com'è, o un testo che finisce sul sito.
---

# Stile dei testi · Napoli a Vela

Prima di scrivere leggi **`specifiche/stile-testi.md`** (guida approvata da Enrico il 06/10/2026): è l'unica fonte delle regole. Qui sotto solo il promemoria.

1. **Il calore non inventa.** Ogni fatto viene da una scheda di `fatti.yaml` (elenco `usa` del blocco). Cambiano ordine, verbi e ritmo, non i fatti.
2. **Si apre con una cosa concreta** (luogo, anno, gesto, numero); il giudizio dopo; la parte pratica in coda.
3. **Tu** per le azioni concrete, il consiglio con il suo motivo, al massimo una parola napoletana per paragrafo, spiegata.
4. **Fonti in fondo alla pagina, non nel testo**: «Aperta dal 1936», non «secondo il locale». Premi e recensioni del passato letti sui giornali (`comeFatto: true`) si scrivono come fatti, nominando la guida e non il giornale.
5. **Non ancora sicuro per il 2027**: segno `{?id}` e parole. `atteso` → chi lo deciderà e cosa fare intanto («li diranno gli organizzatori più avanti»); `stampa` → condizionale («dovrebbe»); `segnalato` → «secondo alcuni siti non ufficiali»; anno 2024/2026 → l'anno nella frase.
6. **Termini tecnici**: prima l'immagine, poi il nome, una volta per pagina.
7. **Lista nera** (sezione 9 della guida): perla, imperdibile, mozzafiato, suggestivo, delizioso, eccellenza, tappa obbligata, a breve, prossimamente…
8. **Dopo**: `npm run testi:firma`, `npm test`, `npm run build`, `npm run check:links`.

Per il Rilascio 4 (lingue): niente giochi di parole né modi di dire che non si traducono; la stessa guida vale per ogni lingua.
