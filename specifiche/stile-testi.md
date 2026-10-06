# Guida di stile dei testi (approvata da Enrico il 06/10/2026, con le sue modifiche)

**Obiettivo.** I testi del sito sono corretti ma freddi. Li vogliamo caldi e coinvolgenti, come una guida che ti accompagna, **senza perdere le fonti**: le fonti restano tutte in fondo alla pagina, ma nel testo **non si citano quasi mai**. Voce: **75% guida di viaggio, 25% amico napoletano** (scelta di Enrico, 06/10/2026).
Da dove viene: la ricerca in `ricerca/reports/Stile delle guide di viaggio.md` (con le fonti e le cose che non si sono potute leggere).

## 1. Le regole che non cambiano
- **Il calore non inventa.** Ogni fatto viene da una scheda di `fatti.yaml` con la sua fonte. Profumi, rumori, «a destra dell'ingresso», «la coda arriva all'angolo» si scrivono solo se una fonte li dice. Il calore sta nella **forma** (ordine, verbi, ritmo), non in fatti nuovi.
- Un'informazione non confermata per il 2027 ha il segno `{?id}` ed è **detta a parole**, anche solo con il condizionale (vedi punto 5).
- Un consiglio nostro si dice come nostro («noi ci andremmo la mattina») e ha `senzaFonte` se non ha una scheda.
- Niente «ufficiale», niente link di affiliazione, niente loghi.

## 2. La voce
- **Si dà del tu**, per le azioni concrete: «sali», «da qui vedi il Vesuvio», «porta una giacca». Mai per dire cosa proverai («ti innamorerai»).
- **Il consiglio arriva con il motivo**: «Prendi la funicolare: in pochi minuti sei su, senza traffico». L'ordine secco solo per i rischi veri (una multa, un traghetto perso).
- **Il 25% napoletano sta nella frase, non nel folclore**: una frase corta dopo una lunga, una domanda ogni tanto, «ti conviene», «vale la pena», un po' di ironia gentile. Al massimo **una parola napoletana per paragrafo**, solo se è il nome vero di una cosa (cuoppo, sfogliatella riccia, frittatina), spiegata la prima volta nella stessa frase. Niente «'o sole mio», niente Pulcinella.
- **«Noi» con misura**: «abbiamo scelto undici punti», «noi ci andremmo la mattina». Non in ogni testo.
- **Pensando alle lingue** (Rilascio 4): niente giochi di parole e modi di dire che non si traducono.

## 3. Come si apre e quanto è lungo
- **Si apre con una cosa concreta**: un luogo, un anno, un gesto, un numero. Il giudizio viene dopo, se serve.
  - No: «Un gioiello del centro storico.» · Sì: «Aperta dal 1936, su via dei Tribunali: …»
- **Ritmo**: frasi di 12–20 parole, con qualche frase da 4–6 parole nei momenti giusti. Paragrafi di 2–4 frasi: si legge sul telefono.
- **Ordine dentro un testo**: dove sei e cosa vedi o mangi → una o due date → il dettaglio che lo rende diverso → il fatto pratico (prenotare, orari, contanti) in coda.
- **Lunghezza** (indicativa):

| Testo | Oggi | Dopo |
|---|---|---|
| Locale | 30–60 parole | 50–80 |
| Tappa, punto panoramico | 40–80 | 50–100; anche di più per un luogo con molto da raccontare, **se le schede ci sono** |
| Testi di pagina (regate, trasporti, domande) | — | come oggi o più corti: la risposta prima di tutto |

## 4. Le fonti: in fondo alla pagina, quasi mai nel testo (decisione di Enrico, 06/10/2026)
Ogni fatto ha la sua fonte, ma la fonte **sta in fondo alla pagina** («Fonti di questa pagina»). Nel testo il fatto si scrive come fatto.

| Freddo (oggi) | Come si scrive |
|---|---|
| «Secondo il locale è aperta dal 1936» | «Aperta dal 1936, su via dei Tribunali» |
| «Segnalata dalla Guida Michelin 2025, secondo Scatti di Gusto» | «È nella Guida Michelin 2025» |
| «Gambero Rosso International scrive che è una tappa obbligata» | «Nel 2024 Gambero Rosso l'ha messa tra i posti migliori di Napoli per il cuoppo» |
| «Ha la Chiocciola di Slow Food nella guida 2025, secondo Scatti di Gusto» | «Ha la Chiocciola di Slow Food nella guida Osterie d'Italia 2025» |

- **Premi e guide** (Michelin, Gambero Rosso, Slow Food, 50 Top Pizza): si scrivono come fatti, con l'anno: «È nella Guida Michelin 2025», «Negli anni passati era nella Guida Michelin». Si nomina la guida che dà il premio, mai il giornale che lo racconta. Oggi quasi tutti sono letti su giornali e blog: nella scheda hanno `comeFatto: true`, la build li elenca come **da verificare** sulla fonte originale, e si verificano più avanti (riga in `da-risolvere.md`). Vale anche per le recensioni e le notizie del passato di un locale («ha riaperto a marzo 2026»).
- **Chi decide, non chi lo racconta**: per le regate si dice chi farà la cosa («gli orari li diranno gli organizzatori più avanti»), non «secondo il comunicato».
- **Il fatto, non la formula della fonte**: se una guida scrive «tappa obbligata», noi riportiamo il motivo (cosa, da quando), non il cliché.
- **Premi spiegati**: «la Chiocciola di Slow Food, che premia le osterie della tradizione», non solo «premiata».
- **Leggende come leggende**: «La leggenda dice che… La storia, quella vera, è più semplice: …».
- **Quando la fonte si nomina ancora**: solo se senza di lei la frase direbbe una cosa falsa o troppo sicura (un parere, una cifra discussa, siti non ufficiali).

## 5. Quando una cosa non è ancora sicura
Si dice **a parole**, ma con leggerezza: niente «a breve», «prossimamente», «pare», «si dice».
- **Non ancora uscito** (`atteso`): cosa manca → chi lo deciderà → cosa puoi fare adesso.
  «Gli orari delle regate li diranno gli organizzatori più avanti{?…}. Intanto tocca *Avvisami* e te li mandiamo noi.»
- **Notizie del 2027 dalla stampa** (`stampa`): **il condizionale** e l'asterisco, senza nominare il giornale (decisione di Enrico, 06/10/2026).
  «Il villaggio dovrebbe avere lo stesso formato del 2026{?…}.» Vanno bene anche «è previsto», «sarebbe», «si parla di».
- **Da siti non ufficiali** (`segnalato`): «secondo alcuni siti non ufficiali», perché qui la fonte è debole e va detto.
- **Com'era nel 2026 o nel 2024** (`anno`): l'anno nella frase, al passato. «Nel 2026 la diretta passava anche sui maxischermi{?…}.»

## 6. Termini tecnici: prima l'immagine, poi il nome
1. Cosa fa o che forma ha. 2. Il nome, dopo «cioè» o «in gergo». 3. Basta: si spiega **una volta per pagina**, poi si usa sempre la stessa parola.
- «Le barche non galleggiano: volano su due ali sott'acqua a forma di T, i *foil*.»
- Il formato si spiega dall'esito: «vince chi arriva per primo a 7 vittorie», poi il nome «match race».
- Bolina e poppa: prima «contro il vento» e «col vento alle spalle».
- Ammettere che è complicato avvicina: «All'inizio sembra complicato. Ti basta sapere una cosa: …»

## 7. Per argomento
- **Regate**: presente e frasi brevi quando racconti una regata; il punto di vista di chi guarda («dal lungomare vedi…»); numeri concreti invece di aggettivi («a pochi metri dalla riva», non «spettacolare»).
- **Luoghi**: dove sei e cosa vedi; poche date; un dettaglio che nota solo chi c'è stato (se la fonte lo dice); la parte pratica in coda.
- **Locali**: 4 mosse: gancio concreto (dove, da quando) → il piatto da ordinare, con una parola che si sente in bocca se la fonte la dà → l'atmosfera in poche parole → il fatto pratico (non si prenota, solo la sera). I nomi napoletani spiegati: «la frittatina, [com'è fatta, con parole semplici]», solo con quello che dice la fonte.
- **Trasporti e informazioni pratiche**: la risposta prima; poi come si fa (verbi diretti); i dati in elenco; un avviso con la conseguenza, se la fonte la dice («senza biglietto convalidato rischi la multa»); il consiglio alla fine.
- **Domande frequenti**: la prima riga risponde («Sì.», «No, ma…»), poi l'eccezione, poi il resto.

## 8. Numeri, date, orari, prezzi (come oggi sul sito)
- Orari con i due punti: «9:30»; nel discorso «dalle 9 alle 19».
- Date con il mese in lettere: «22 maggio 2027».
- Prezzi: «1,50 €», «da 10 a 15 €».
- Numeri in cifre quando sono dati (orari, prezzi, nodi, vittorie); in lettere fino a dieci nel discorso («sette squadre»).
- Grafie napoletane: come oggi («crocchè», «sfogliatella riccia»).

## 9. Lista nera
| Evita | Scrivi invece |
|---|---|
| perla, gioiello, angolo di paradiso, imperdibile, da non perdere, mozzafiato | il motivo: un numero, un luogo, un gesto |
| suggestivo, pittoresco, vibrante, «dove il tempo si è fermato», «tuffo nel passato», incastonato | il dettaglio che lo prova |
| delizioso, squisito, «esplosione di sapori», «da leccarsi i baffi» | cosa c'è nel piatto e com'è: «fritto asciutto», «sfoglia che si rompe» |
| eccellenza, tappa obbligata, splendida cornice, ambiente accogliente, tradizione e innovazione | da quando, chi lo dice, perché |
| battaglia, sfida all'ultimo sangue, «tutti gli occhi puntati» | cosa succede in acqua |
| a breve, prossimamente, pare, si dice | chi lo pubblica, cosa fare intanto |

**Prova veloce**: se la frase potrebbe stare nella guida di un'altra città, riscrivila con un nome, un numero o una fonte.

## 10. Prima e dopo (fatti di oggi, nessun fatto nuovo)
**Di Matteo** (locali)
- Prima: «Pizzeria e friggitoria su via dei Tribunali: pizza fritta, frittatine, crocchè e arancini da mangiare anche in piedi, oltre alle pizze al tavolo. Secondo il locale è aperta dal 1936; Gambero Rosso International scrive che è una tappa obbligata per il cibo di strada fritto{?…}.»
- Dopo: «Aperta dal 1936, su via dei Tribunali. Qui si frigge: pizza fritta, frittatine, crocchè e arancini, da mangiare anche in piedi, oppure seduto, con una pizza al tavolo. Nel 2024 Gambero Rosso l'ha messa tra i posti migliori di Napoli per il cuoppo di fritto.» (`comeFatto`: niente segno, va verificato sulla guida)

**Duomo** (tappe)
- Prima: «La cattedrale di Napoli. Dentro c'è la Cappella del Tesoro di San Gennaro, a ingresso libero. Il Museo del Tesoro, accanto, si paga a parte: …»
- Dopo: «Nella cattedrale di Napoli c'è la Cappella del Tesoro di San Gennaro, e si entra gratis. Il Museo del Tesoro, lì accanto, ha un biglietto a parte: con l'audioguida ti serve circa un'ora. Se lo compri online vale per tutto il giorno, non per un'ora precisa: entri quando vuoi.»

**Taxi** (come arrivare)
- Prima: «Dall'aeroporto, e per i tragitti più comuni in città, il taxi ha tariffe fisse decise dal Comune di Napoli. Chiedi la tariffa fissa **prima di partire**: …»
- Dopo: «Appena sali, prima che il taxi parta, chiedi la **tariffa fissa**: dall'aeroporto e per i tragitti più comuni la decide il Comune di Napoli, e il tassista non può dirti di no. …»

## 11. Cosa cambia nel controllo dei testi (`src/lib/regole.mjs`)
La regola resta: **un'informazione non confermata per il 2027 va detta a parole**. Cambiano le parole ammesse e un caso:
- **Stampa**: vale anche il **condizionale** («dovrebbe», «dovrebbero», «sarebbe», «avrebbe», «è previsto», «sono previsti», «si parla di»), più «racconta», «raccontano», «per i giornali».
- **Non ancora uscito**: anche «più avanti», «lo diranno», «li diranno», «non è uscito», «appena esce», «da confermare», «non confermato».
- **Fatti del passato letti sui giornali** (premi delle guide, classifiche, recensioni): una scheda con `comeFatto: true` si scrive come fatto, senza segno e senza parole di cautela; la build la elenca come `[da verificare]` (avviso, non si ferma). Cambia la riga di `CLAUDE.md` sulle informazioni non confermate.
- Si corregge «voci,» con la virgola (trovato dai test il 06/10/2026).
- Nuovi test in `test/` per ogni parola aggiunta, e un test che una frase senza cautela continui a fermare la build.

## 12. Controlli prima di dire «fatto»
- [ ] Tutti i testi di `src/testi/` riscritti e firmati (`npm run testi:firma`)
- [ ] Nessun fatto nuovo senza scheda; segni `{?id}` tutti al loro posto; nessun «secondo…» dove non serve
- [ ] Premi segnati `comeFatto: true` e riga in `da-risolvere.md` per verificarli sulle guide
- [ ] Nessuna parola della lista nera (ricerca automatica)
- [ ] `npm test` verde, build senza errori, `npm run check:links` pulito
- [ ] Rilettura a campione di un agente `revisore` (fonti, cautele, tono)
- [ ] Skill `stile-testi` in `.claude/skills/` che rimanda a questa guida
