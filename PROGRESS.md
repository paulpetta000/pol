# PROGRESS

_Ultimo aggiornamento: 03/10/2026. La storia completa dei rilasci (1, 1.1, 2, 2.1, 2.2, blocchi 1 e 2 del Rilascio 3, con i controlli fatti) è in `archivio/PROGRESS-fino-al-2026-10-03.md`: leggila solo se ti serve un dettaglio._

## Dove siamo
- Sito pubblico: https://napoli-a-vela.vercel.app (ramo `main`). Astro 7, Vercel, Supabase gratuito (progetto `coppa-america-napoli`, id `hcicqbcmtfksraabphie`).
- **Pubblicati**: Rilasci 1, 1.1 (nome «Napoli a Vela»), 2 (Capire la Coppa, 3D delle barche), 2.1 e 2.2 (testi discorsivi con fonti, statistiche senza cookie).
- **Rilascio 3 · Vivi Napoli**, diviso in 3 blocchi (un prompt per ciascuno in `PROMPT-BLOCCO-*.md`):
  - Blocco 1, itinerari, contenuti e design: **finito, su `main`** (39 tappe con fonti, tempi calcolati da noi, design «Orario» scelto).
  - Blocco 2, la pagina `/napoli/itinerari/` con il compositore, la mappa, salvataggio e condivisione: **su `main`, online, da provare sul telefono**.
  - Blocco 3, il sito più ordinato (controllo di coerenza e 7 proposte del 01/10/2026): **da fare**.
- Rilasci 4 (Lingue) e 5 (Pronostici): da fare, dopo il 3, come da `PIANO.md`. I pronostici vanno finiti almeno un mese prima del 22 maggio 2027.

## Prossimi passi
1. Le tue prove sul telefono della pagina itinerari, sul sito pubblico (elenco nell'archivio, sezione «Blocco 2 · Da fare»), e le correzioni che ne vengono.
2. Blocco 3 (`PROMPT-BLOCCO-3.md`). Skill: frontend-design, VectorLab UI/UX Skills, consistent-ui; alla fine spegnere VectorLab e consistent-ui.
3. Nuovo sito itinerari per più città (Napoli, poi Roma, Milano, Torino, Venezia…): idea del 03/10/2026, vedi sotto. Prima una spec.
4. Correggere la scheda `echia-ascensore` (orari da OpenStreetMap, diversi da quelli ANM: 7–22 tutti i giorni, 1,50 €).
5. Quando escono: orari 2027, biglietti e tribune, ordinanza della Capitaneria, piano trasporti, mappa ufficiale del campo, regole di regata 2027. Aggiornare le schede «Non ancora uscito». Orari e prezzi delle tappe da ricontrollare entro il 30/04/2027.

## Idea: sito itinerari per più città (03/10/2026, da decidere)
- Per turisti (anche italiani nella propria città). Per ora solo Napoli; poi Roma, Milano, Torino, Venezia.
- Sito **indipendente** da «Napoli a Vela»; il collegamento è a senso unico: da «Napoli a Vela» verso il sito itinerari, mai il contrario.
- Il compositore generico: la città e le regate arrivano come dati. Le regate compaiono solo dove la città ha un evento nel calendario.
- Domande ancora aperte: che ne facciamo di `/napoli/itinerari/`; stessa grafica o identità nuova; nome e indirizzo.

## Cose che devi fare tu
1. Guardare il sito sul telefono e dire cosa cambiare.
2. Parlare con un avvocato quando vuoi (privacy, termini, marchi, gioco, affiliazioni). Sul piano gratuito di Vercel non c'è il contratto sul trattamento dei dati.
3. **Reindirizzare il vecchio indirizzo**: Vercel → progetto *coppa-america-napoli* → Settings → Domains → `coppa-america-napoli.vercel.app` → Edit → «Redirect to» `napoli-a-vela.vercel.app`, codice 308 → Save. La regola in `vercel.json` non funziona; dopo si può togliere.

## Note operative
- Aggiornare un'informazione: scheda in `src/data/fatti.yaml` (fonte in `fonti.yaml`), cambiare `controllato`. Se un testo in `src/testi/` la usa, la build si ferma: rileggerlo e poi `npm run testi:firma`.
- Statistiche: persone e pagine nell'app Vercel → Analytics; tempo sulle pagine in Supabase → Table editor → `letture_per_giorno`, `letture_per_pagina`. Iscrizioni: tabella `avvisami`.
- Supabase gratuito va in pausa dopo 7 giorni senza attività (con il contatore ora riceve richieste ogni giorno).
- Rigenerare la mappa: `node scripts/mappa/scarica.mjs <cartella>` poi `node scripts/mappa/costruisci.mjs <cartella>`.
- Skill: accendere solo quelle della fase in corso (tabella nell'archivio, sezione «Skill»).
- Effort consigliato: Rilascio 3 e 5 alto; piccole modifiche e testi medio.
