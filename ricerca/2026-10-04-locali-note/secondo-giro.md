# Dove mangiare: secondo giro sui locali scartati (note di ricerca)

Ricerca del 04/10/2026, secondo tentativo (Opus) sui casi scartati dal primo giro (Sonnet). Tutte le letture sono del 04/10/2026.

## Regole usate

- Stesse regole del primo giro: dati (orari, chiusura, prezzi, menu, prenotazione) **solo dal sito ufficiale**; riconoscimenti e storia da guide e giornali; il sito vale per l'anno di fondazione solo come «dichiarato dal locale». Mai inventare.
- Cosa ho fatto in più rispetto al primo giro:
  - letto il codice grezzo delle pagine (con `curl`, non solo con il riassunto di WebFetch) e cercato i dati strutturati `openingHours` / `openingHoursSpecification`: **nessuno dei siti li ha**;
  - elencato tutte le pagine dei siti WordPress con l'indirizzo `/wp-json/wp/v2/pages` (così si vedono anche le pagine non collegate dal menu);
  - aperto i PDF dei menu ed estratto il testo;
  - provato varianti dell'indirizzo (www / senza www, http / https, pagine /en/).
- Non ho aggirato captcha, blocchi anti-robot né certificati scaduti.
- Instagram, Facebook, Google Maps: non usati come fonte.

## Tabella riassuntiva (solo chi ENTRA)

| Locale | Zona | Cucina | Orari | Chiuso | Prezzi base | Prenotazione | Menu | Stato | Fonte |
|---|---|---|---|---|---|---|---|---|---|
| Antica Pizzeria e Friggitoria Di Matteo, Via dei Tribunali 94 | centro-storico | pizza, strada | Lun-Sab 10:00-23:30 | domenica non indicata dal sito (vedi note) | margherita 5,00 · marinara 4,00 · pizza fritta tradizionale 7,00 · frittatina 2,00 · servizio 15% (menu PDF del 20/07/2022) | NON TROVATO | https://anticapizzeriadimatteo.it/wp-content/uploads/2022/07/Menu-Online-20072022.pdf | confermato (con riserva sui prezzi) | https://anticapizzeriadimatteo.it/ |
| Antica Pizza Fritta da Zia Esterina Sorbillo, Piazza Trieste e Trento 53 (scelta UNA sede) | toledo-plebiscito | strada | Tutti i giorni 11:00-22:00 | nessun giorno | prezzi non pubblicati | non si prenota (pagina contatti del gruppo: «Non si accettano prenotazioni») | menu non pubblicato online | confermato | https://www.sorbillo.it/antica-pizza-fritta-da-zia-esterina-sorbillo/ |
| Ciro a Santa Brigida, Via Santa Brigida 71/73 | toledo-plebiscito | pizza, pesce, napoletana | Tutti i giorni 12:30-15:30 e 19:30-00:00 | nessun giorno | prezzi non pubblicati | possibile (pagina «prenota», tel. 081 5524072) | menu non pubblicato online | confermato con riserva (sito trascurato) | http://www.ciroasantabrigida.it/info.php |

Riserva (da decidere con Enrico): **Gino Sorbillo «Lievito Madre al Mare», Via Partenope 1** (lungomare): orari chiari sul sito, ma stessa catena di Sorbillo (vedi note).

## Note per locale

### Pizzeria Di Matteo (Via dei Tribunali 94) · ENTRA
- Perché il primo giro falliva: `pizzeriadimatteo.it` in https mostra un certificato di un altro sito (1901factory.it); in http è solo una «cornice» che apre **https://anticapizzeriadimatteo.it** (il sito vero). `pizzeriadimatteo.com` è bloccato da Cloudflare (403). Il sito vero si legge con WebFetch (con `curl` la connessione si chiude).
- Indirizzo e telefono (home): «Via dei Tribunali, 94, 80138, Napoli», «(+39) 081.45.52.62», info@anticapizzeriadimatteo.it.
- Orari (home italiana e pagina /en/home-english/): «Dal Lunedì al Sabato 10.00 – 23.30». **La domenica non è scritta**: non c'è né un orario né «chiuso». Un blog (Dissapore, 2016, già nel primo giro) dice chiusa la domenica: solo «segnalato». Ferie: NON TROVATO.
- Prenotazione: NON TROVATO (il sito ha solo un modulo «Resta in contatto»).
- Menu PDF ufficiale (nome del file: 20/07/2022, quindi **prezzi forse vecchi**): margherita 5,00 €; marinara 4,00 €; pizza fritta tradizionale 7,00 €; pizza fritta carrettiere 8,00 €; frittatina 2,00 €; arancino bianco o rosso 2,00 €; crocchè 1,00 €; fritto misto piccolo 4 pezzi (solo di sera) 1,00 € (prezzo così nel PDF, da ricontrollare); «Servizio 15%». La parola «cuoppo» non è nel menu.
- Piatti tipici in menu: pizza fritta, frittatina, crocchè, arancino, pizza margherita e marinara.
- Storia: «20 Giugno del 1936» e «dal 1936», «Unica Sede» (dichiarato dal locale).
- Riconoscimento: Gambero Rosso International, «The best cuoppo in Naples: must-visit spots», Michela Becchi, 01/07/2024 — «A centuries-old pizzeria in the historic center of Naples and a must-stop for Neapolitan street food»: https://www.gamberorossointernational.com/news/the-best-cuoppo-in-naples-must-visit-spots/
- Pasto: pranzo, cena, spuntino. Foto: non cercata in questo giro.
- Dubbio: la domenica. Proposta: scrivere «lun-sab 10:00-23:30; domenica: il sito non la indica» e far confermare a Enrico.

### Antica Pizza Fritta da Zia Esterina Sorbillo · ENTRA (sede Piazza Trieste e Trento 53)
- Perché il primo giro falliva: aveva letto solo https://www.sorbillo.it/pizzerie/ . La pagina del marchio, trovata con l'elenco `/wp-json/wp/v2/pages`, **ha gli orari**: https://www.sorbillo.it/antica-pizza-fritta-da-zia-esterina-sorbillo/
- Orari dal sito: Piazza Trieste e Trento 53 «Tutti i giorni 11:00 – 22:00»; Via dei Tribunali 35 «Tutti i giorni 12:00 – 23:30»; Via Nilo 26 ang. Piazzetta Nilo «Lunedì 11:30 – 15:30, Mar/Dom 11:30 – 23:30» (c'è anche una sede a Milano).
- Catena: propongo **una sola sede, Piazza Trieste e Trento 53** (zona toledo-plebiscito, davanti al Gambrinus e vicino al Plebiscito; copre una zona che per il cibo di strada non aveva nessuno). In alternativa Via dei Tribunali 35 per il centro storico.
- Prenotazione: pagina https://www.sorbillo.it/contatti/ : «Non si accettano prenotazioni, eventuali richieste saranno cestinate.» (vale per il modulo del gruppo).
- Prezzi e menu: non pubblicati sul sito.
- Riconoscimento e rinomatoPer: Gambero Rosso International, «Where to eat the best pizza fritta in Naples», Michela Becchi, 13/10/2023 — la cita come «Antica Pizza Fritta da Zia Esterina Sorbillo dal 1935» e scrive «The traditional variant with ricotta, cicoli and pepper is worth tasting»: https://gamberorossointernational.com/?p=481956 → rinomatoPer: pizza fritta tradizionale con ricotta, cicoli e pepe.
- Storia: «dal 1935» (dal giornale qui sopra; il sito non dà l'anno nella pagina letta).
- Pasto: pranzo, cena, spuntino. Foto: non cercata.

### Ciro a Santa Brigida (Via Santa Brigida 71/73) · ENTRA con riserva
- Il sito in https ha il **certificato scaduto**; in http si legge: http://www.ciroasantabrigida.it/ . Le pagine mostrano in alto un errore del database («Errore connessione al MySQL»): il sito è trascurato.
- Orari (home e http://www.ciroasantabrigida.it/info.php): «Siamo aperti tutti i giorni! Orari Pranzo: 12:30 – 15:30, Orari Cena: 19:30 – 00:00». Tel. 081 5524072, ristorante@ciroasantabrigida.it.
- Cucina (pagine ufficiali): «piatti a base di pesce», «classiche specialità della cucina partenopea», «Vera Pizza Napoletana cotta nel forno a legna» → pizza, pesce, napoletana.
- Prenotazione: c'è una pagina «prenota» (http://www.ciroasantabrigida.it/prenota.php) e il telefono. Menu e prezzi: non pubblicati.
- Storia: «aprì le sue porte nel 1935»; «membro numero 1 dell'AVPN», titolare Antonio Pace presidente AVPN (dichiarato dal locale).
- Riconoscimento: scheda di recensione su 50 Top Pizza (data non indicata nella pagina; scrive anche «chiuso la domenica di agosto»): https://www.50toppizza.it/recensione/ciro-a-santa-brigida/
- Riserva: nel 2020 il locale era in vendita (Dissapore, 12/12/2020, già nel primo giro); non ho trovato notizie del 2025-2026. Prima di pubblicarlo conviene che Enrico controlli che sia aperto.

### Riserva: Gino Sorbillo «Lievito Madre al Mare» (Via Partenope 1, angolo Piazza Vittoria) · lungomare
- Pagina: https://www.sorbillo.it/pizzeria-gino-sorbillo-lievito-madre-al-mare/ → «Tutti i giorni 12:30 – 15:30, 19:00 – 24:00», «unica sede».
- Cucina: pizza. Prezzi e menu: non pubblicati. Aperta nel 2013 (Scatti di Gusto, 08/06/2013: https://www.scattidigusto.it/2013/06/08/gino-sorbillo-apre-lievito-madre-al-mare-joe-bastianich-e-sindaco-inclusi/ ). Riconoscimenti recenti: non trovati.
- È della stessa catena di Gino Sorbillo e Zia Esterina (stessa società sul sito). Se Enrico vuole Sorbillo per il lungomare, questa sede ha orari chiari; via dei Tribunali no (vedi scartati).

## Scartati (con il motivo)

| Locale | Zona | Motivo (secondo giro) |
|---|---|---|
| La Notizia (Enzo Coccia), Via Caravaggio 53 e 94 | posillipo-bagnoli (Fuorigrotta) | Il sito ora si apre (https://www.pizzarialanotizia.com/ , 200), ma **nessun orario** in nessuna pagina (home, /pizzeria-la-notizia-53/, /pizzeria-la-notizia-94/), né nei menu PDF, né nei dati strutturati. Dati utili se Enrico conferma gli orari: La Notizia 53, tel. 081 7142155, consegne 334 2534036; menu del 09/06/2026 https://www.pizzarialanotizia.com/wp-content/uploads/2026/06/La-Notizia-53-menu-260609.pdf : Marinara D.O.P 7 €, Margherita 8 €, coperto 3 €. La Notizia 94 (dal 2010, con prenotazione), tel. 081 19531937; menu https://www.pizzarialanotizia.com/wp-content/uploads/2026/06/La-Notizia-94-menu-260609.pdf : Marinara Dop 7, Margherita 8, coperto 3. Il sito dichiara: La Notizia 53 aperta nel 1994; La 94 «segnalata nella Guida Michelin» dall'apertura. |
| Pasticceria Attanasio, Vico Ferrovia 1 | centro-storico | Il sito https://www.sfogliatelleattanasio.it ha il **certificato scaduto** (verificato: «certificate has expired»); WebFetch risponde 503; in http rimanda a https. `.com` non esiste (502). Orari solo da fonti non ufficiali (mar-dom 6:30-19:30, lunedì chiuso): segnalato. Da controllare sul telefono. |
| La Masardona | lungomare (Piazza Vittoria) / Case Nuove (Via G.C. Capaccio 27) | Il sito https://masardona.it ha una pagina anti-robot con captcha (con `curl`); con WebFetch si legge ma **nessun orario** in home, menu Piazza Vittoria, menu asporto, elenco completo delle pagine (/wp-json): solo la sede legale Via Chiatamone 6. Indirizzo di Piazza Vittoria non scritto sul sito (solo «Piazza Vittoria»; Scatti di Gusto parla dei locali di una ex baguetteria in Piazza Vittoria). Sede storica: Via G.C. Capaccio 27 (Gambero Rosso International 13/10/2023). Prezzi letti oggi (menu Piazza Vittoria): pizza fritta completa 9,00 € (mezza 4,50), marinara 7,00/4,00, frittatina 2,50, crocchè 2,50, cuoppo 7,00. Orari: solo social/Google. |
| Scaturchio, Piazza San Domenico Maggiore 19 | centro-storico | `curl` bloccato (403 anti-robot); con WebFetch: /sedi/, home e /storia/ **senza orari**; la mappa PDF delle sedi è solo immagine. Storia: «inizio del '900», sede di San Domenico aperta dopo la prima guerra mondiale (dichiarato, senza anno). Orari: solo social/Google o telefono (081 5516944). |
| Gran Caffè Gambrinus, Via Chiaia 1 | toledo-plebiscito | Lette tutte le pagine (anche /en/, /il-salotto/, /contatti/, ricerca «orari» nel sito): **nessun orario né prezzo**. Fondato nel 1860 (dichiarato). Orari: solo social/Google o tel. 081 417582. |
| Antica Pasticceria Carraturo, Via Casanova 97 | centro-storico | Lette home, /storia, /contatti, /info-ordini, pagine prodotto: **nessun orario** (il sito è soprattutto un negozio online). Tel. 081 5545364, «unica sede», «dal 1837» (dichiarato). |
| Antica Osteria da Tonino, Via Santa Teresa a Chiaia 47 | lungomare (Chiaia) | Elenco completo delle pagine (/wp-json): home, menu, la-storia, dicono-di-noi, photogallery: **nessun orario**. Il menu con prezzi resta valido (vedi napoletana.md). Orari: solo social/Google o tel. 081 421533. |
| Mimì alla Ferrovia, Via Alfonso d'Aragona 19-21 | centro-storico (stazione) | Lette home, /contatti/, /prenota-il-tuo-tavolo/, menu e news: **nessun orario**; il pulsante «Prenota ora» si carica con JavaScript (sistema di prenotazione non visibile). Regole di prenotazione confermate (1-3 persone senza prenotazione, 4-10 online o telefono, 11+ telefono/email). |
| Gino Sorbillo, Via dei Tribunali 32 | centro-storico | Pagina https://www.sorbillo.it/gino-sorbillo-antica-pizzeria/ : ancora «Tutti i giorni 12:00 – 23:30» e subito sotto «Domenica Chiuso» (uguale per Piazza Vanvitelli 9). Probabilmente vuol dire lun-sab, ma è una lettura nostra: resta da confermare. Nessun menu né prezzo. Alternativa: sede Lievito Madre al Mare (sopra). |
| Friggitoria Vomero, Via Cimarosa 44 | vomero | **Nessun sito ufficiale**: provati friggitoriavomero.it e .com (non esistono); Gambero Rosso International (01/07/2024) indica solo la pagina Facebook. Orari solo social/Google (le fonti non ufficiali si contraddicono). |
| La Passione di Sofi, Via Toledo 206 | toledo-plebiscito | Il «sito ufficiale» indicato da Gambero Rosso (passionedisofi.us) è un dominio parcheggiato in vendita. Catena con più sedi. Nessun orario ufficiale. |
| Isabella De Cham, Via Arena della Sanità 27 | sanita-capodimonte | isabelladecham.com risponde con una pagina vuota/anti-robot (202); nessun dato leggibile. Orari solo da fonti non ufficiali. |
| Errico Porzio (Via Scarlatti 84 Vomero, Via Partenope 11, Via Cornelia dei Gracchi 27) | vomero / lungomare | Sito https://pizzerierricoporzio.it/pizzerie/ con le sedi ma **senza orari**; catena con sedi anche a Roma, Milano, Lecce, Aversa. |
| Ristorante di pesce a Mergellina | lungomare | **NON TROVATO**. Provati: Il Miracolo dei Pesci (nessun sito; ilmiracolodeipesci.it/.com non esistono), Salvatore a Mergellina, Hostaria Mergellina, Casa a Tre Pizzi, Ciro a Mergellina (nessun dominio valido; `ciroamergellina.it` è spam), Osteria del Mare / Osteria Sannazaro (osteriadelmare.it risponde 403, non si sa di chi sia). Anche `pescheriamattiucci.com` (Chiaia) oggi **rimanda a un sito di casinò**: da non usare. |

## Dubbi per Enrico

1. Di Matteo: il sito non scrive la domenica. Va bene «lun-sab 10:00-23:30, domenica non indicata»? I prezzi sono di un menu del 2022.
2. Sorbillo: Zia Esterina (pizza fritta, Piazza Trieste e Trento) e, se si vuole, Lievito Madre al Mare (pizza, lungomare) sono dello stesso gruppo. Contano come una catena sola o due marchi diversi?
3. Ciro a Santa Brigida: orari ufficiali, ma sito trascurato e locale in vendita nel 2020: controllare che sia aperto.
4. Da controllare sul telefono (orari solo su social/Google): Masardona (Piazza Vittoria), La Notizia, Scaturchio, Gambrinus, Attanasio, Carraturo, Da Tonino, Mimì, Friggitoria Vomero.
5. Mergellina resta senza ristorante di pesce con sito ufficiale.
