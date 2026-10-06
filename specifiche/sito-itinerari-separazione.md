# Specifica · Separare gli itinerari in un sito nuovo (06/10/2026, da approvare)

Decisione di Enrico del 06/10/2026: due siti. **Napoli a Vela** resta la guida alla Coppa America 2027.
Gli itinerari e «Dove mangiare» vanno in un **sito nuovo di itinerari** (nome da decidere), prima Napoli e poi altre città.
Subito dopo la separazione si lavora sul sito nuovo (home «wow», itinerari curati meglio); la grafica del Blocco 3 di Napoli a Vela aspetta.

## Il problema di chi visita
- Chi cerca «cosa vedere a Napoli in 2 giorni» non cerca la vela: oggi trova gli itinerari dentro un sito sulla Coppa, con il menu della Coppa.
- Chi viene per la Coppa trova una parte del sito che sembra un'altra app (due stili, controllo di coerenza del 06/10/2026).
- Migliorare la pagina di oggi non basta: un sito per più città ha bisogno di una home sua, di un menu suo e di un indirizzo suo.

## Regole
- Valgono tutte le regole di `CLAUDE.md` anche nel sito nuovo: niente senza fonte, foto con licenza libera, nessun servizio esterno prima di un tocco, niente pacchetti nuovi, stile dei testi.
- Collegamento **a senso unico** (deciso il 03/10/2026): Napoli a Vela porta al sito nuovo, il sito nuovo non porta a Napoli a Vela.
- Il blocco «Regate dal lungomare» resta nel sito nuovo come evento di Napoli, solo nei giorni di regata del 2027, senza link alla Coppa.
- Il sito nuovo, alla separazione, **si vede e funziona come oggi** (stile «Orario»): la grafica nuova viene dopo, con due proposte.
- Una sola copia dei dati: tappe, locali, orari e tempi stanno solo nel sito nuovo.

## Cosa va nel sito nuovo
- Pagine: `napoli/itinerari/` (con i file `.json.ts`) e `napoli/dove-mangiare/`.
- Codice: `src/lib/itinerari/`, `src/lib/tappe.ts`, `src/lib/locali.ts`, `src/scripts/itinerari/`, `src/scripts/dove-mangiare.ts`, `src/components/itinerari/`, `src/styles/itinerari.css`.
- Dati: `tappe.yaml`, `locali.yaml`, `itinerari-pronti.yaml`, `tempi-tappe.json`, `percorsi-tappe.json`, `percorsi-alternativi.json`, `partenze-bus.json`, `linee-bus.json`, `mappa.json` (copia).
- Testi: `src/testi/itinerari.yaml`, `dove-mangiare.yaml`, `locali.yaml`, `tappe.yaml`. Foto `src/assets/foto/tp-*`. Caratteri Barlow.
- Script: `scripts/itinerari/`, `scripts/mappa/` (copia), `scripts/font/barlow.mjs`. Registro `aggiornamenti/` (feed ANM).
- Documenti: `specifiche/bus-orari-veri.md`, `specifiche/itinerari-napoli-ampliamento.md`, note di `ricerca/` su luoghi, locali e autobus.
- **Copiati e adattati** (poi i due siti vanno ognuno per conto suo): layout `Base`, `Testo`, `FontiPagina`, `Foto`, `Icon`, il controllo dei testi (`lib/testi.ts`, `lib/regole.mjs`, firme), `content.config.ts`, `check-links`, i test, il service worker, Privacy, Termini, Note legali, `CLAUDE.md`, la skill `stile-testi`, l'agente `revisore`.
- **Schede e fonti divise con uno script**: le schede `tp-…` e `lc-…` di `fatti.yaml` vanno nel sito nuovo; le fonti usate solo da loro si spostano, quelle usate da tutti e due si copiano. Stessa cosa per `foto.yaml`.

## Cosa resta in Napoli a Vela
- La parte Napoli: `/napoli/` (come arrivare, mappa per guardare le regate, accessibilità) con un riquadro che porta al sito nuovo. Home: «Girare Napoli» porta al sito nuovo.
- `/napoli/itinerari/` e `/napoli/dove-mangiare/` diventano una **pagina ponte** (vedi casi limite), poi un rimando permanente (308).
- Si tolgono codice, dati, stile «Orario», foto `tp-`, caratteri Barlow e le parti della Privacy su itinerari e posizione. In `vercel.json` si toglie il permesso alla posizione.

## Casi limite
- **Itinerari salvati sul telefono**: stanno nella memoria del browser, legata all'indirizzo del sito, e non passano da soli. La pagina ponte li trova e per ciascuno mostra «Apri nel nuovo sito» (con il link condiviso, che il sito nuovo già sa leggere). Se non ce ne sono, porta subito al sito nuovo. Resta fino al 31/12/2026, poi diventa un rimando 308.
- **Link condivisi** (`…/napoli/itinerari/#n=…`): la pagina ponte passa il «#» al sito nuovo, così l'itinerario si apre.
- **Uso offline**: il service worker di Napoli a Vela cambia versione e toglie dalla memoria le pagine degli itinerari.
- **Google**: il sito nuovo ha la sua mappa del sito; Enrico aggiunge il nuovo indirizzo in Search Console. Il resto della SEO si fa a fine blocco, come deciso.
- **Contatore delle letture**: si parte senza, oppure con un secondo progetto Supabase gratuito (decide Enrico).
- **Nome e indirizzo**: per ora un indirizzo gratuito di Vercel; il nome definitivo e un dominio proprio dopo l'avvocato (marchi).

## Controlli prima dell'anteprima
- Tutti e due i siti: `npm test` verde, build senza errori, `check:links` pulito, axe in chiaro e scuro, Lighthouse su telefono 95+, nessuno scorrimento orizzontale a 320 e 390 px, nessun errore in console.
- Sito nuovo: itinerari e «Dove mangiare» uguali a oggi (immagini prima e dopo, chiaro e scuro); un itinerario salvato e un link condiviso dal sito vecchio si aprono nel nuovo.
- Napoli a Vela: nessun riferimento ai file tolti; la parte Napoli e la home portano al sito nuovo.

## Compiti
- [ ] Enrico approva la specifica e sceglie un nome provvisorio.
- [ ] Enrico crea il repository vuoto su GitHub e lo collega a Vercel (istruzioni passo passo; sul computer `gh` non c'è).
- [ ] Copia dei file nel repository nuovo, menu e piè di pagina nuovi, minimi (Itinerari, Dove mangiare).
- [ ] Script che divide schede, fonti e foto; controllo che nessuna scheda resti senza fonte.
- [ ] Controlli e anteprima Vercel del sito nuovo.
- [ ] Napoli a Vela: pagina ponte, link, pulizia, Privacy, `README.md`, `CLAUDE.md`, `PROGRESS.md`.
- [ ] Anteprima di tutti e due e OK di Enrico, poi pubblicazione.
- [ ] Dopo: specifica del sito nuovo (home, città, grafica con due proposte).
