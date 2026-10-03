# Prompt per la sessione del blocco A (luoghi)

Sessione nuova, ramo nuovo creato da `main` (per esempio `claude/itinerari-blocco-a`). Modello principale, effort alto.

> Leggi `CLAUDE.md`, `PROGRESS.md` e `specifiche/itinerari-napoli-ampliamento.md` (approvata il 03/10/2026). Lavoriamo solo sul **blocco A · Luoghi**.
>
> 1. Elenca fino a 18 candidati a Napoli che non sono già in `src/data/tappe.yaml`, **mescolando tre tipi: luoghi storici, luoghi panoramici e giardini o parchi belli** (vedi la specifica, sezione 1) (partendo dall'elenco della specifica, ma la ricerca decide). Per orari, chiusure, prezzi e prenotazioni usa agenti Sonnet in parallelo, uno per zona, con risposte corte e fonti ufficiali citate; poi rileggi tu le fonti prima di salvare. Scarta i luoghi chiusi senza data di riapertura o senza fonte ufficiale, e scrivi il motivo nelle note in `ricerca/`.
> 2. **Fermati e mostrami l'elenco dei 10–12 che propongi**, con orari e prezzi trovati, prima di costruire. Aspetta il mio OK.
> 3. Poi costruisci come per le altre tappe: `tappe.yaml`, schede `tp-…` e fonti, foto con licenza libera, testi brevi, tempi (`scripts/itinerari/`), build, `check:links`, firma dei testi.
> 4. Fatti rivedere le modifiche dal `revisore`. Alla fine fermati, aggiorna `PROGRESS.md` in poche righe e aspetta il mio OK. Non pubblicare su `main` senza il mio OK.

> 5. Prima di cominciare, **fai una prova piccola**: lancia un agente Sonnet su una sola cosa e vedi se puoi dargli un effort diverso da quello della sessione. Dimmi il risultato in una riga e scrivilo in `CLAUDE.md` (scala di salita).
> 6. Guidami passo passo come dice `CLAUDE.md`: dimmi sempre cosa devo fare io, quando cambiare effort e cosa fare a fine sessione.
