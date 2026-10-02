# Trasporto pubblico urbano di Napoli (metro, funicolari, ascensori, tariffe) — note per il modello dei tempi di spostamento

Data verifica di tutte le fonti: 2026-10-02 (venerdì). Ricerca completata entro il budget di chiamate; i punti non coperti sono elencati nei "Gaps".

Legenda per ogni fatto: URL esatto · titolo pagina · editore · letto per intero? · data verifica · citazione testuale breve.
- "SI (integrale)" = HTML o PDF scaricato per intero con curl e testo estratto da me: citazione esatta.
- "SI (WebFetch)" = pagina aperta per intero ma letta tramite strumento automatico che restituisce estratti: le citazioni sono quelle riportate dallo strumento, da ricontrollare a vista prima della pubblicazione.
- "SNIPPET" = solo estratto di motore di ricerca, NON aperto.

Nota sulle fonti ANM: il sito principale www.anm.it oggi carica una piattaforma JavaScript che agli strumenti automatici restituisce solo "Sorry to interrupt / CSS Error" (prova su https://www.anm.it/index.php?option=com_content&task=view&id=71&Itemid=98 e sulle pagine biglietti, 2026-10-02). Le stesse schede sono ancora pubblicate sul vecchio sito ufficiale www2.anm.it (dominio ANM, quindi fonte ufficiale). Il vecchio sito non mostra la data di aggiornamento delle pagine: alcune schede contengono date del 2025, la scheda Linea 6 è rimasta all'orario 2024-25. Fonte di supporto ufficiale: "La Carta della Mobilità – Edizione 2025" di ANM (PDF, dati riferiti al 2024), https://www.anm.it/resource/1768990802000/cartadellamobilita25 · ANM S.p.A. · SI (integrale, 2522 righe di testo) · 2026-10-02.

Parametri sintetici per lo script (dettagli e fonti nelle sezioni sotto):

| Servizio | Tempo di corsa ufficiale | Frequenza | Orario base | Stato al 2026-10-02 |
|---|---|---|---|---|
| Linea 1 (Piscinola – Centro Direzionale) | non pubblicato | 10' dalle 6 alle 20; 14' dalle 20 a fine servizio | dom–gio fino 23:00 (C. Direzionale) / 22:30 (Piscinola); ven–sab fino 01:32 / 01:20 | in servizio |
| Linea 6 (Mostra – Municipio) | 15 min capolinea-capolinea | 14' | lun–ven 7:10–21:10; sab–dom 7:10–14:50 | in servizio |
| Linea 2 (Campi Flegrei – S. Giovanni Barra) | Mergellina→P. Garibaldi 17 min (inverso 16) | ~8' feriali, ~15' sabato, ~20' festivi | ~05:00 – ~23:00 | tratta Campi Flegrei – Pozzuoli INTERROTTA dal 21/6/2026 (Bagnoli e Cavalleggeri Aosta senza treni; bus) |
| Funicolare Centrale (… – Fuga) | 4 min 20 s diretta / 5 min 45 s con fermate | 10' (dirette ogni 30' dalle 8:30) | 7:00 – 22:30 lun–mar; 00:30 mer, gio, dom; 02:00 ven–sab | in servizio |
| Funicolare Chiaia (… – Cimarosa) | 3 min 8 s | 10' | 7:00 – 22:30 mer–gio; 00:30 dom, lun, mar; 02:00 ven–sab | in servizio |
| Funicolare Montesanto | 4 min 25 s | 10' | 7:00–22:00 | CHIUSA dal 15/5/2026 per circa 9 mesi; bus sostitutivo |
| Funicolare Mergellina | 7 min | 10' (dirette ogni 30' 9:30–21:30) | 7:00–22:00 | in servizio |
| Cumana Montesanto – Bagnoli | non trovato | non trovato | non trovato | treni fino a Bagnoli; oltre Bagnoli bus (sisma 31/7/2026) |
| Ascensori Chiaia, Acton, Sanità, Ventaglieri | – | – | lun–sab 7:00–21:30; dom e festivi 7:30–14:00 | gratuiti |
| Ascensore Monte Echia | – | – | tutti i giorni 7:00–22:00 | 1,50 € corsa singola (Tap&Go accettato) |

## Linea 1 metropolitana (ANM)

### Takeaway
Linea 1 = 20 stazioni Piscinola – Centro Direzionale (via Vomero e centro storico); frequenza unica 10 min dalle 6:00 alle 20:00 e 14 min dalle 20:00 a fine servizio; domenica–giovedì ultima corsa 23:00 da Centro Direzionale / 22:30 da Piscinola, venerdì e sabato fino alle 01:32 / 01:20. Estate 2026: chiusura diurna della sola tratta periferica Piscinola – Colli Aminei dal 22 giugno al 14 settembre 2026 (navette ogni 10 min). America's Cup: fino alle 02:00 dal 24 al 27 settembre 2026. Nessun tempo di percorrenza ufficiale trovato.

### Cited Findings
- Stazioni in ordine: "20 stazioni : Centro Direzionale, Garibaldi, Duomo, Università, Municipio, Toledo, Dante, Museo, Materdei, Salvator Rosa, Quattro Giornate, Vanvitelli, Medaglie d'Oro, Montedonzelli, Rione Alto, Policlinico, Colli Aminei, Frullone, Chiaiano, Piscinola." — [ANM, scheda Metro Linea 1](https://www2.anm.it/index.php?option=com_content&task=view&id=71&Itemid=98) · titolo "ANM Web Site" (nei risultati di ricerca "ANM Web Site - METRO LINEA 1") · ANM S.p.A. · SI (integrale) · 2026-10-02.
  - CORREZIONE alla lista del brief: tra Salvator Rosa e Vanvitelli c'è "Quattro Giornate", non "Cilea" (Cilea non è una stazione della Linea 1). Il capolinea sud oggi è Centro Direzionale (dopo Garibaldi).
- Orario in vigore: "Prima e ultima corsa dalla domenica al giovedì da Centro Direzionale … 6.15 /23.00"; "… da Piscinola … 6.00 /22.30"; "Prima e ultima corsa venerdì e sabato da Centro Direzionale … 6.15 /01.32"; "… da Piscinola: 6.00 /01.20" — stessa scheda ANM, SI (integrale), 2026-10-02.
- Frequenza: "fascia oraria unica dalle ore 6.00 alle ore 20.00 | 6 am to 8 pm >> 10 min ." e "dalle ore 20.00 a fine servizio | 8 pm to last service >> 14 min ." — stessa scheda ANM. La scheda non distingue feriale/festivo/estate.
- Sere prolungate: "il corridoio di collegamento linea 1 e linea 2 di Museo chiuderà alle ore 23.15, e il corridoio uscita PORTO stazione Municipio alle ore 22.00." — stessa scheda ANM.
- Testo storico sulla stessa scheda: "Nei giorni feriali i treni circolano dalle ore 6:00 alle 23:00 , con una frequenza nelle ore di punta di 9 minuti con una velocità commerciale di 32 km orari." CONTRADDIZIONE interna: 9 min (testo descrittivo) contro 10 min (riquadro "ORARIO IN VIGORE"): usare 10 min.
- Avviso: "ATTENZIONE! STAZIONE MONTEDONZELLI CHIUSA PRIMA USCITA. ACCESSIBILE SOLO DA VIA DELL'ERBA." — stessa scheda ANM.
- Orario 2024 (Carta della Mobilità ANM 2025, pag. 30): "dalla domenica al giovedì: prima corsa da Garibaldi ore 6.20 ultima corsa da Garibaldi ore 23.02 … Venerdì e sabato … ultima corsa da Garibaldi ore 01.32" — [ANM, Carta della Mobilità 2025](https://www.anm.it/resource/1768990802000/cartadellamobilita25) · ANM · SI (integrale) · 2026-10-02. Coerente con la scheda attuale (che parte da Centro Direzionale, capolinea più recente).
- Lavori 2024-25 sulla linea (Carta 2025): rinnovo binari Piscinola-Vanvitelli "da ottobre 2024 stanno determinando la chiusura anticipata per 3/4 giorni a settimana." — Carta della Mobilità 2025, SI.
- Chiusura estiva 2026: "Linea 1, chiusura estiva dal 22 giugno al 14 settembre: in Commissione Infrastrutture il piano dei lavori e il servizio sostitutivo" (pubblicata 8 giugno 2026) — [Comune di Napoli](https://www.comune.napoli.it/novita/linea-1-chiusura-estiva-dal-22-giugno-al-14-settembre-in-commissione-infrastrutture-il-piano-dei-lavori-e-il-servizio-sostitutivo/) · Comune di Napoli · SI (WebFetch) · 2026-10-02. Tratta: "la tratta Piscinola–Colli Aminei"; lavori di "rinnovo dell'armamento ferroviario nella tratta Frullone–Piscinola", "Un intervento obbligatorio per legge, da eseguire ogni trent'anni"; sostitutivo "12 navette bus sulla tratta Piscinola–Colli Aminei, con una frequenza di passaggio ogni 10 minuti"; "Nelle fasce orarie di punta, mattutine e serali, i treni continueranno comunque a circolare"; in galleria lavori "in orario notturno", all'aperto "sospensione diurna del servizio".
- America's Cup (Regata preliminare 24–27 settembre 2026): "prolunga il servizio fino alle ore 02:00 con ultima partenza: da Centro Direzionale alle ore 01:32, da Piscinola 01:20" — pagina "Servizi di trasporto Anm in occasione della Coppa America" (pubblicata 24 settembre 2026) — [Comune di Napoli](https://www.comune.napoli.it/novita/servizi-di-trasporto-anm-in-occasione-della-coppa-america/) · Comune di Napoli · SI (WebFetch) · 2026-10-02. La stessa notizia appare su napolike.it (non ufficiale, solo SNIPPET): coerente.
- Sciopero (vale per metro e funicolari): fasce garantite "dalle ore 6:30 alle ore 9:30 e dalle ore 17:00 alle ore 20:00" — Carta della Mobilità 2025, SI.
- Riduzioni stagionali generiche: "Di sabato, domenica e nei giorni festivi … nonché nel periodo estivo, il servizio può subire riduzioni e/o rimodulazioni" — Carta della Mobilità 2025, SI.

### Inferences
- Attesa media per il modello: ~5 min di giorno, ~7 min dopo le 20:00 (metà della frequenza).
- La chiusura estiva 2026 riguarda solo Colli Aminei – Piscinola (periferia nord), irrilevante per le tappe turistiche (Garibaldi – Vanvitelli/Medaglie d'Oro); ma lavori estivi e chiusure anticipate serali per lavori sono ricorrenti dal 2024: per luglio 2027 ricontrollare.
- Il prolungamento America's Cup corrisponde all'orario normale del venerdì e sabato; in pratica estende alle 02:00 anche giovedì 24 e domenica 27 settembre 2026.

### Gaps
- Nessuna fonte ufficiale con tempo di percorrenza capolinea-capolinea o tra stazioni consecutive della Linea 1. Dato ufficiale disponibile solo la velocità commerciale "32 km orari" (ANM). Per lo script serve una stima (es. distanze tra stazioni da OpenStreetMap ÷ 32 km/h), da marcare come stima.
- Non è chiaro se le "chiusure anticipate 3/4 giorni a settimana" (ottobre 2024) siano ancora in vigore nel 2026: la scheda ANM attuale non le cita.
- Data di apertura della stazione Centro Direzionale non trovata.
- Nessun orario estivo specifico 2027 pubblicato.

## Linea 6 metropolitana (ANM)

### Takeaway
Linea 6 = 8 stazioni Mostra – Augusto – Lala – Mergellina – Arco Mirelli – San Pasquale – Chiaia – Municipio (circa 6 km), riaperta il 17 luglio 2024. Tempo ufficiale Mostra–Municipio 15 minuti; frequenza 14 minuti. Orario più recente (Comune, 20 marzo 2026): dal 23 marzo 2026 lun–ven 7:10–21:10, sabato e domenica 7:10–14:50. Prolungata fino alle 00:30 dal 24 al 27 settembre 2026 (America's Cup). Frequenza 8 min (entro dic. 2026) e 4,5 min (dal 2027) sono solo piani.

### Cited Findings
- "Presentata la Linea 6 della Metropolitana" (pubblicata 12 luglio 2024) — [Comune di Napoli](https://www.comune.napoli.it/novita/presentata-la-linea-6-della-metropolitana/) · Comune di Napoli · SI (WebFetch) · 2026-10-02: stazioni "Mostra, Augusto, Lala, Mergellina, Arco Mirelli, San Pasquale, Chiaia, Municipio"; "circa 6 km"; apertura al pubblico 17 luglio 2024; tempo Mostra–Municipio "15 minuti, rispetto ai circa 20 minuti di percorrenza media in auto"; frequenza iniziale 13,5 minuti con 5 treni; orario iniziale "dalle 7.30 alle 15.30", "da settembre l'orario sarà completo"; 6 nuovi treni dall'estate 2025 a dicembre 2026 con frequenza 8 minuti; dal 2027 22 treni, "frequenza di servizio di 4,5 min".
- "Linea 6 della metro, nei giorni feriali corse fino alle 21.10" (pubblicata 20 marzo 2026) — [Comune di Napoli](https://www.comune.napoli.it/novita/linea-6-della-metro-nei-giorni-feriali-corse-fino-alle-21-10/) · Comune di Napoli · SI (WebFetch) · 2026-10-02: "A partire da lunedì prossimo, 23 marzo, la Linea 6 della metropolitana di Napoli sarà attiva anche nelle ore pomeridiane e serali"; lun–ven prima 7.10, ultima "21.10"; sabato e domenica prima 7.10, ultima "14.50". Frequenza non indicata.
- Scheda ANM: "DA MUNICIPIO PER MOSTRA … Prima corsa : 07:36 | Ultima corsa: 14:50"; "DA MOSTRA PER MUNICIPIO … Prima corsa : 07:30 | Ultima corsa: 14:44"; "FREQUENZA CORSE | frequency 14'" — [ANM, scheda Linea 6](https://www2.anm.it/index.php?option=com_content&task=view&id=72&Itemid=96) · "ANM Web Site" · ANM · SI (integrale) · 2026-10-02. Identico all'orario 2024 della Carta della Mobilità 2025 ("Frequenza corse 14'"), quindi scheda non aggiornata.
  - CONTRADDIZIONE: ANM (scheda non datata, ferma al 2024-25) = solo mattina fino alle 14:50, prima corsa 07:30/07:36; Comune (20 marzo 2026, più recente) = feriali fino alle 21:10, prima corsa 7:10. Usare il Comune per l'orario; la frequenza 14' viene solo da ANM.
- America's Cup: dal 24 al 27 settembre 2026 "prolunga il servizio con ultime partenze da Mostra e da Municipio alle 00:30" — [Comune di Napoli, 24/9/2026](https://www.comune.napoli.it/novita/servizi-di-trasporto-anm-in-occasione-della-coppa-america/) · SI (WebFetch) · 2026-10-02.
- Dato aziendale: "Linea 6 5 elettrotreni" — Carta della Mobilità 2025, SI.

### Inferences
- Mostra–Municipio 15 min su 7 tratte → circa 2 min per tratta (stima lineare, non ufficiale). Attesa media ~7 min.
- Sabato e domenica dopo le 14:50 la Linea 6 non circola: per Mergellina/Chiaia–Municipio nel weekend pomeriggio usare a piedi o Linea 2.
- La frequenza a 8 min non risulta in vigore in nessuna fonte ufficiale letta: per luglio 2027 ricontrollare.

### Gaps
- Nessuna fonte ufficiale con tempi tra stazioni consecutive.
- Nessun orario estivo 2026 specifico (a parte il prolungamento America's Cup).

## Linea 2 (Trenitalia/RFI)

### Takeaway
Linea 2 = servizio "metropolitano" Trenitalia sul passante RFI. AL 2026-10-02 i treni metropolitani fanno Napoli Campi Flegrei – Napoli San Giovanni Barra: la tratta Campi Flegrei – Pozzuoli (con Cavalleggeri Aosta e Bagnoli) è interrotta "fino a nuovo avviso" dal 21 giugno 2026 per il bradisismo, con bus sostitutivi. Tempo ufficiale programmato Mergellina → Piazza Garibaldi 17 min (Garibaldi → Mergellina 16 min). Frequenza ufficiale RFI: circa 8' feriali, 15' sabato, 20' festivi. Nei dati RFI compare una fermata "Napoli Piazza Leopardi" tra Campi Flegrei e Mergellina.

### Cited Findings
- Interruzione per sismicità: pagina Trenitalia "Linee Napoli Campi Flegrei – Villa Literno; Pozzuoli Solfatara – Napoli San Giovanni Barra; Napoli Campi Flegrei – Caserta", dal 21 giugno 2026 — [Trenitalia, lavori programmati](https://www.trenitalia.com/content/trenitalia/it/informazioni/lavori-programmati/20260621-circolazione-interrotta-tra-napoli-campi-flegrei-e-puzzuoli-solfatara.html) · Trenitalia · SI (WebFetch) · 2026-10-02: "A seguito dell'intensificarsi dei fenomeni sismici nell'area dei Campi Flegrei, per motivi tecnici, la circolazione ferroviaria è interrotta" tra Napoli Campi Flegrei e Pozzuoli Solfatara; "Attivo servizio sostitutivo con bus tra le stazioni di Napoli Campi Flegrei e Pozzuoli Solfatara", fermate nei piazzali delle stazioni tranne Cavalleggeri Aosta; durata indicata dallo strumento: fino a nuovo avviso.
- Conferma al 2026-10-02 dai dati ufficiali in tempo reale ViaggiaTreno (Trenitalia/RFI): stazione "BAGNOLI AGNANO TERME" (S09102) e "POZZUOLI SOLFATARA" (S09101): 0 partenze venerdì 2 ottobre 2026 ore 10; da Mergellina tutti i treni verso ovest terminano a "NAPOLI CAMPI FLEGREI" — endpoint pubblici http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/partenze/S09102/… , …/partenze/S09101/… , …/partenze/S09105/… · ViaggiaTreno (Trenitalia) · SI (risposte JSON lette integralmente) · 2026-10-02.
- Orari programmati treno MET 20923 (Campi Flegrei → S. Giovanni Barra, 2/10/2026): Campi Flegrei p. 10:24; "NAPOLI PIAZZA LEOPARDI" a. 10:26 p. 10:27; Mergellina a. 10:30 p. 10:31; Piazza Amedeo a. 10:34 p. 10:35; Montesanto a. 10:38 p. 10:39; Piazza Cavour a. 10:42 p. 10:43; Piazza Garibaldi a. 10:48 p. 10:49; Gianturco a. 10:54 p. 10:55; S. Giovanni Barra a. 11:02 — http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/andamentoTreno/S09103/20923/… · ViaggiaTreno · SI · 2026-10-02.
- Senso inverso, treno MET 21447 (Caserta → Campi Flegrei): Gianturco p. 10:15; Piazza Garibaldi a. 10:18 p. 10:19; Piazza Cavour a. 10:24 p. 10:25; Montesanto a. 10:27 p. 10:28; Piazza Amedeo a. 10:30 p. 10:31; Mergellina a. 10:35 p. 10:36; Piazza Leopardi a. 10:39 p. 10:40; Campi Flegrei a. 10:43 — …/andamentoTreno/S09211/21447/… · ViaggiaTreno · SI · 2026-10-02.
- Partenze da Mergellina (S09105) venerdì 2/10/2026, 10:31–11:43: verso est 10:31, 10:46, 11:01 (S. G. Barra), 11:09 (Salerno), 11:16 (Barra), 11:24 (Caserta), 11:31 (Barra), 11:39 (Salerno); verso Campi Flegrei 10:36, 10:43, 10:51, 10:58, 11:06, 11:13, 11:21, 11:28, 11:43 — tutti categoria "MET" — ViaggiaTreno, SI.
- Frequenze per tipo di giorno: "IL SERVIZIO E' SVOLTO CON UNA CADENZA DI CIRCA 8' NEI GIORNI FERIALI, DI CIRCA 15' NEI GIORNI DI SABATO E DI CIRCA 20' NEI GIORNI FESTIVI." e "I TRENI METROPOLITANI POSSONO PARTIRE IN ANTICIPO DI ORARIO." — [RFI, quadro orario Partenze BAGNOLI-AGNANO TERME, "14 GIU 2026 - 12 DIC 2026", "pubblicato il 23-06-2026"](https://prm.rfi.it/qo_prm/QO_Pdf.aspx?Tipo=P&lin=it&id=530) · titolo "Partenze Departures/Departs/Abfahrten" · RFI · SI (integrale, PDF 2 pagine) · 2026-10-02. Lo stesso PDF elenca corse notturne straordinarie Bagnoli → Pozzuoli Solfatara (0.01, 0.16, 0.41; 5 min di viaggio) solo in date di giugno 2026: pubblicato prima/a ridosso dell'interruzione del 21 giugno.
- Pagina Trenitalia "Metropolitana di Napoli linea 2" — [Trenitalia, Regionale Campania](https://www.trenitalia.com/it/regionale/campania/metro-napoli.html) · Trenitalia · SI (WebFetch) · 2026-10-02: "circa 182 corse" feriali, "frequenza media di 8 minuti per ciascun senso di marcia"; "Prima corsa da Napoli Campi Flegrei verso Napoli S.G.Barra alle ore 05:17 e verso Pozzuoli alle ore 05:00 e ultima corsa da Napoli S.G.Barra verso Napoli Campi flegrei alle 22:53; da Pozzuoli verso Napoli Campi Flegrei ultima corsa alle 23:03"; "circa 90.000 viaggiatori". Pagina senza data di validità e senza tariffe; non riflette l'interruzione verso Pozzuoli.
- Interruzione temporanea del 25 agosto 2026 (non strutturale): "lieve principio d'incendio nella stazione di Piazza Amedeo", circolazione sospesa tra S. Giovanni-Barra e Campi Flegrei dalle 14:30 — [RFI, comunicato 25/8/2026](https://www.rfi.it/it/news-e-media/comunicati-stampa-e-news/2026/8/25/rfi---circolazione-ferroviaria-sospesa-sulla-metropolitana-linea.html) · RFI · SI (WebFetch) · 2026-10-02.
- Altri avvisi visti solo come titoli (SNIPPET, non aperti): Trenitalia "20260301-chiusura-stazione-di-napoli-montesanto" e "20260607-lavori-nella-stazione-di-napoli-campi-flegrei"; RFI 31/7/2026 "Nodo di Napoli: circolazione ferroviaria tornata regolare dopo una scossa di terremoto a Napoli Campi Flegrei". I dati ViaggiaTreno del 2/10/2026 mostrano Montesanto regolarmente servita.

### Inferences
- Per lo script: Mergellina–Garibaldi 16–17 min a bordo; tratte medie 3–4 min (Garibaldi–Cavour 5–6 min). Attesa media ~4 min feriali, ~8 sabato, ~10 festivi (RFI, più recente e datata, prevale sulla pagina Trenitalia senza data).
- Ordine reale delle stazioni (dati RFI 2026): (Pozzuoli – Bagnoli – Cavalleggeri Aosta, sospese) – Campi Flegrei – Piazza Leopardi – Mergellina – Piazza Amedeo – Montesanto – Piazza Cavour – Piazza Garibaldi – Gianturco – S. Giovanni Barra. Nel brief l'ordine "Mergellina, Piazza Amedeo, Montesanto" è corretto; la lista Trenitalia restituita dallo strumento (Piazza Amedeo prima di Mergellina, senza Cavalleggeri) è errata.
- Bagnoli NON è raggiungibile in Linea 2 al 2026-10-02: usare Cumana (fino a Bagnoli) o bus sostitutivo.
- Ultime corse ~23:00: niente rientri notturni in Linea 2 salvo corse straordinarie per eventi.

### Gaps
- Le richieste ViaggiaTreno per sabato 3 e domenica 4 ottobre hanno restituito gli stessi treni del venerdì: l'endpoint "partenze" sembra ignorare la data, quindi nessun dato verificato sugli orari del fine settimana oltre alla nota RFI (15'/20').
- "Napoli Piazza Leopardi" compare nei dati ufficiali RFI ma non nella pagina Trenitalia: data di attivazione non verificata.
- Nessuna data di riattivazione Campi Flegrei – Pozzuoli; orario RFI dal 13 dicembre 2026 non ancora pubblicato nelle fonti lette; nulla di pubblicato per il 2027.

## Funicolari ANM (Centrale, Chiaia, Montesanto, Mergellina)

### Takeaway
Tutte: corse ogni 10 minuti, prima corsa 7:00. Ultime corse: Centrale 22:30 (lun–mar) / 00:30 (mer, gio, dom) / 02:00 (ven–sab); Chiaia 22:30 (mer–gio) / 00:30 (dom, lun, mar) / 02:00 (ven–sab); Montesanto e Mergellina 22:00. Durate ufficiali: Centrale 4 min 20 s diretta / 5 min 45 s con fermate; Chiaia 3 min 8 s; Montesanto 4 min 25 s; Mergellina 7 min. Montesanto CHIUSA dal 15 maggio 2026 per circa 9 mesi. Lunghe chiusure ricorrenti per revisioni ventennali e lavori (Chiaia 10/2022–1/2025, Centrale fino al 29/4/2025, Montesanto dal 5/2026), non legate all'estate.

### Cited Findings
- Funicolare Centrale, orario: "Prima e ultima corsa lunedì e martedì: ore 7:00 > ore 22:30"; "mercoledì, giovedì e domenica: ore 7:00 > ore 00:30"; "venerdì e sabato: ore 7:00 > ore 02:00"; "corse ogni 10 minuti" — [ANM, scheda Funicolare Centrale](https://www2.anm.it/index.php?option=com_content&task=view&id=81&Itemid=98) · "ANM Web Site" · ANM · SI (integrale) · 2026-10-02. Identico nella Carta della Mobilità 2025 (orari 2024), SI.
- Centrale, corse dirette: "Dalle ore 08:30 fino al termine del servizio, si effettuano corse dirette ogni 30 minuti , ad eccezione delle corse delle 13:30, 22:30, 0:30 e 2:00 che saranno miste."; le dirette non fermano a "petraio" e "corso vittorio emanuele" — stessa scheda, SI.
- Centrale, durata: "Tempo di percorrenza (diretto): 4 min 20 sec"; "Tempo di percorrenza (misto): 5 min 45 sec"; "1234 metri, con pendenza media del 12%" — stessa scheda, SI. Stazione superiore: "stazione di Fuga della Funicolare Centrale" (Carta 2025, SI).
- Centrale, chiusura 2025: "La Funicolare Centrale resta chiusa fino a martedì 29 aprile. Riapre con regolare servizio mercoledì 30 aprile" (29 aprile martedì = 2025) — stessa scheda, SI.
- Funicolare di Chiaia, orario: "La funicolare Chiaia da sabato 1 marzo 2025 il venerdì e sabato effettua l'ultima corsa alle ore 02:00 , domenica, lunedì e martedì alle ore 00:30 e mercoledì e giovedì alle ore 22:30."; prima corsa 7:00; "corse ogni 10 minuti" — [ANM, scheda Funicolare Chiaia](https://www2.anm.it/index.php?option=com_content&task=view&id=82&Itemid=98) · ANM · SI (integrale) · 2026-10-02.
- Chiaia, tracciato e durata: "circa 500 metri, con quattro fermate e una pendenza costante del 29%"; "Tempo di percorrenza: 3 min 8 sec"; collega "Via Cimarosa nel quartiere Vomero (nodo di interscambio con la Linea 1 metropolitana) con il quartiere Chiaia (interscambio con la Linea 2 metro)" — stessa scheda, SI.
- Chiaia, chiusure: "Dal 1/10/2022 al 30/01/2025, l'impianto è stato chiuso al pubblico, per disposizione Ministeriale."; "I lavori di revisione sono iniziati il 1/2/2024 e sono terminati a gennaio 2025." — Carta della Mobilità 2025, SI. Precedente: "Dal 7 luglio 2003 al 30 aprile 2004 … manutenzione straordinaria ventennale" (scheda ANM Chiaia, SI).
- Funicolare di Montesanto, orario normale: "Prima e ultima corsa: ore 7:00 > ore 22:00"; "corse ogni 10 minuti"; "Tempo di percorrenza: 4 min 25 sec"; collega "la parte più alta del quartiere Vomero con Piazzetta Montesanto" — [ANM, scheda Funicolare Montesanto](https://www2.anm.it/index.php?option=com_content&task=view&id=83&Itemid=98) · ANM · SI (integrale) · 2026-10-02.
- Montesanto, CHIUSURA 2026: "15 maggio 2026, chiusura Funicolare Montesanto per manutenzione ventennale" (pubblicata 27 aprile 2026); ultima corsa 14 maggio alle 22:00; durata stimata "9 mesi"; "revisione generale ventennale" (ANSFISA); bus "Piazzetta Montesanto – Corso Vittorio Emanuele – Via Morghen - Vanvitelli"; frequenza bus non indicata ("il percorso e le fermate di dettaglio saranno pubblicati sui canali istituzionali e social di ANM") — [Comune di Napoli](https://www.comune.napoli.it/novita/15-maggio-2026-chiusura-funicolare-montesanto-per-manutenzione-ventennale/) · Comune di Napoli · SI (WebFetch) · 2026-10-02.
- Funicolare di Mergellina: "Prima e ultima corsa: ore 7:00 > ore 22:00"; "corse ogni 10 minuti"; corse dirette "ore 9:30 > ore 21:30", "corse ogni 30 minuti"; "Tempo di percorrenza: 7 min" — [ANM, scheda Funicolare Mergellina](https://www2.anm.it/index.php?option=com_content&task=view&id=84&Itemid=98) · "ANM Web Site - FUNICOLARE MERGELLINA" · ANM · SI (integrale) · 2026-10-02. In servizio nel 2026: prolungata per l'America's Cup (vedi sotto).
- America's Cup 2026: Mergellina dal 25 al 27 settembre "prolunga il servizio ed effettua l'ultima corsa alle ore 00:30"; Chiaia e Centrale 25 e 26 settembre "prolungano regolarmente fino alle ore 02:00" — [Comune di Napoli, 24/9/2026](https://www.comune.napoli.it/novita/servizi-di-trasporto-anm-in-occasione-della-coppa-america/) · SI (WebFetch) · 2026-10-02.
- Collegamenti a piedi meccanizzati al Vomero: "SISTEMA INTERMODALE VOMERO (scale mobili esterne e tappeti mobili cunicolo di collegamento Piazza Fuga - Via Cimarosa): tutti i giorni dalle ore 7:00 alle ore 21:45" — Carta della Mobilità 2025, SI.

### Inferences
- Montesanto: con 9 mesi dal 15/5/2026 la riapertura cadrebbe verso metà febbraio 2027, prima di luglio 2027; ma le revisioni ventennali sono spesso slittate (Chiaia chiusa oltre 2 anni). Nel modello: "chiusa fino a riapertura confermata".
- Tempi da usare (corsa + attesa media ~5 min): Chiaia 3 min; Centrale 5:45 se si sale/scende a fermate intermedie o con corsa mista, 4:20 diretta; Montesanto 4:25 (quando riaperta); Mergellina 7 min.
- Non risultano chiusure "estive" programmate per Centrale, Chiaia e Mergellina nel 2024–2026: le chiusure sono state lunghe revisioni in altri periodi.

### Gaps
- Nomi ufficiali di tutte le fermate intermedie non verificati nelle pagine lette (verificati solo: Fuga, Petraio, Corso Vittorio Emanuele per la Centrale; Cimarosa per Chiaia; Piazzetta Montesanto per Montesanto). Augusteo, Parco Margherita, Morghen, Manzoni ecc. non citati nei testi letti.
- Pagine ANM sull'orario estivo degli anni passati (id 3816, 1447, 2928, 3016) viste solo come titoli di ricerca (SNIPPET).
- Frequenza del bus sostitutivo Montesanto non pubblicata nelle fonti lette.

## Cumana (EAV) Montesanto – Fuorigrotta – Bagnoli

### Takeaway
Dopo il terremoto di venerdì 31 luglio 2026 la Cumana circola solo fino a Bagnoli (danni nella galleria di Monte Olibano tra Dazio e Gerolomini); oltre Bagnoli bus sostitutivi ogni 25–30 minuti, senza data di riattivazione. Montesanto – Fuorigrotta – Bagnoli resta quindi la via ferroviaria per Bagnoli (la Linea 2 non ci arriva). Tempo di percorrenza e frequenza attuali Montesanto–Bagnoli non trovati in fonte ufficiale letta.

### Cited Findings
- "Cumana: continuano i controlli dopo il sisma, attivi i collegamenti sostitutivi con bus per la continuità del servizio" (pubblicata 2 agosto 2026) — [EAV](https://www.eavsrl.it/cumana-continuano-i-controlli-dopo-il-sisma-attivi-i-collegamenti-sostitutivi-con-bus-per-la-continuita-del-servizio-_info-ed-aggiornamenti-sul-sito-www-eavsrl-it/) · EAV S.r.l. · SI (WebFetch) · 2026-10-02: sisma di venerdì 31 luglio 2026; "lesioni significative nella galleria di Monte Olibano, nel tratto compreso tra le stazioni di Dazio e Gerolomini"; servizio ferroviario limitato fino a Bagnoli; bus con "partenze da Bagnoli e Torregaveta, mediamente ogni 25'/30′"; obiettivo di "ripristinare il servizio ferroviario nel più breve tempo possibile, compatibilmente con gli esiti delle verifiche tecniche" (nessuna data). L'avviso è ancora in evidenza sulla home page EAV il 2026-10-02 (link letto con curl).
- Dato di programmazione (non orario): "potenziamento della relazione Montesanto–Bagnoli finalizzato ad ottenere una frequenza a livello di servizio metropolitano, cioè 1 treno ogni 10 minuti, con 73 corse feriali e 73 festive" — documento sul Bollettino Ufficiale Regione Campania, https://burc.regione.campania.it/eBurcWeb/directServlet?DOCUMENT_ID=93795&ATTACH_ID=136792 · Regione Campania (BURC) · SNIPPET (non aperto; data del documento ignota) · 2026-10-02.
- Prolungamenti serali per eventi allo stadio (Fuorigrotta) nel 2026: titoli EAV "Prolungamento linea Cumana: Treni straordinari venerdì 5 giugno 2026", "… martedì 10 febbraio 2026", "… mercoledì 28 gennaio 2026" — https://www.eavsrl.it/prolungamento-linea-cumana-treni-straordinari-venerdi-5-giugno-2026/ · EAV · SNIPPET · 2026-10-02.
- Orario ufficiale consultabile: motore orari EAV https://orariotreni.eavsrl.it/ e pagina https://www.eavsrl.it/orari-linee-ferroviarie/ (link trovati sulla home EAV, non consultati per limite di budget).

### Inferences
- Per raggiungere Bagnoli nel 2026: Cumana da Montesanto (o da Fuorigrotta) fino a Bagnoli; la Linea 2 è sospesa oltre Campi Flegrei. Il dato "1 treno ogni 10 minuti" è un obiettivo di programmazione regionale, non un orario verificato: non usarlo senza conferma.

### Gaps
- Tempo di percorrenza Montesanto – Fuorigrotta – Bagnoli, frequenza feriale/festiva/estiva, prima e ultima corsa: non verificati (fonte da usare: orariotreni.eavsrl.it).
- Nessuna data di riattivazione oltre Bagnoli; nessun orario 2027.

## Ascensori pubblici di Napoli

### Takeaway
ANM gestisce 5 ascensori pubblici. Chiaia (via Chiaia ↔ piazza S. Maria degli Angeli/Monte di Dio), Acton (via Acton ↔ piazza Plebiscito), Sanità (Ponte della Sanità ↔ quartiere Sanità/S. Vincenzo) e Ventaglieri (parco Ventaglieri ↔ via Avellino a Tarsia): gratuiti, lun–sab 7:00–21:30, domenica e festivi 7:30–14:00. Monte Echia (via Santa Lucia ↔ belvedere di Pizzofalcone): tutti i giorni 7:00–22:00, a pagamento 1,50 € corsa singola (Tap&Go accettato).

### Cited Findings
- Scheda "Ascensori pubblici" — [ANM](https://www2.anm.it/index.php?option=com_content&task=view&id=1339&Itemid=320) · "ANM Web Site - Ascensori pubblici" · ANM · SI (integrale) · 2026-10-02: "Ascensore Chiaia l'impianto composto da due ascensori collega via Chiaia con piazza S. Maria degli Angeli (Monte di Dio) Orario : 7:00/21:30 ( dal lunedì al sabato ) 7:30/14:00 (domenica e festivi)"; "Ascensore Acton collega via Acton con piazza Plebiscito" (stesso orario); "Ascensore Sanità collega il ponte della Sanità in via Santa Teresa degli Scalzi con il quartiere Sanità (Chiesa di S. Vincenzo)" (stesso orario); "Ascensore Ventaglieri insieme alle scale mobili collega la parte bassa del parco Ventaglieri nel quartiere Montesanto con la parte alta di via Avellino a Tarsia" (stesso orario); "Ascensore Monte Echia l'impianto composto da due ascensori collega via Santa Lucia con la collina di Pizzofalcone Orario : 7:00/22:00 ( lunedì/ domenica )"; "Per accedere all'ascensore Monte Echia munirsi di un biglietto di corsa singola (€ 1,50)".
- Gratuità e tariffa: elenco dei 4 impianti, poi "Il servizio è gratuito per l'utenza."; Monte Echia "L'utilizzo degli impianti è a pagamento per i non residenti, per un importo di 1,50 singola corsa."; "SERVIZIO ASCENSORI: nei giorni feriali dalle ore 7:00 alle ore 21:30; nei giorni festivi dalle ore 7:30 alle ore 14:00."; "MONTE ECHIA: tutti i giorni 7:00/22:00"; "VENTAGLIERI (scale mobili): dal lunedì al venerdì dalle ore 7:00 alle ore 21:30" — [ANM, Carta della Mobilità 2025](https://www.anm.it/resource/1768990802000/cartadellamobilita25) · ANM · SI (integrale) · 2026-10-02.
- Scheda "Ascensore Monte Echia" — [ANM](https://www2.anm.it/index.php?option=com_content&task=view&id=4286&Itemid=314) · "ANM Web Site - Ascensore Monte Echia" · ANM · SI (integrale) · 2026-10-02: "dal lunedì alla domenica, dalle ore 07:00 alle ore 22:00"; "Abbonamento ANM o titolo di viaggio ANM da 1,50 euro (quest'ultimo valido per una sola corsa in salita o in discesa) e tramite carta di credito/bancomat (sistema Tap&Go)".
- CONTRADDIZIONE di prezzo: un estratto di ricerca (SNIPPET, probabilmente dalla notizia di apertura del Comune "Entra in funzione l'ascensore di monte Echia", https://www.comune.napoli.it/novita/entra-in-funzione-lascensore-di-monte-echia/, non aperta) indicava "biglietto di corsa singola (€ 1,30)" o titolo integrato orario "a partire da 1,80€". Le pagine ANM (più recenti, dopo l'aumento ANM di maggio 2024) dicono 1,50 €: usare 1,50 €.

### Inferences
- Nel modello gli ascensori gratuiti vanno trattati come scorciatoie pedonali con orario (chiusi la domenica pomeriggio e la sera dopo le 21:30). Monte Echia ha un costo (1,50 €) per i non residenti.
- La Carta dice "nei giorni feriali" e la scheda "dal lunedì al sabato": coerenti (il sabato è feriale). Ventaglieri: l'ascensore ha l'orario degli altri, le scale mobili solo lun–ven.

### Gaps
- Nessun avviso 2026 di chiusura o riapertura specifico per i singoli ascensori trovato; la scheda ANM non è datata. Stato effettivo al 2026 non confermato da notizie datate.
- Durata della corsa degli ascensori non pubblicata (per il modello: ~1–2 min + attesa, stima).

## Tariffe (ANM, Unico Campania, Tap&Go)

### Takeaway
Biglietto aziendale ANM di corsa singola: vale "una sola corsa su singolo mezzo ANM" (niente cambi). Prezzo ufficiale ANM visto solo per Monte Echia: 1,50 € (dal 2024 la corsa singola ANM per metro e servizi suburbani è allineata a EAV/Trenitalia). Giornaliero: corse illimitate fino alle 24:00 del giorno di convalida. Tap&Go (carte contactless) attivo su Linea 1, Linea 6, funicolari, ascensore Monte Echia e Alibus. Dal 1° ottobre 2026 la Regione ha aumentato (indice ISTAT) corse singole, titoli orari, giornalieri urbani; ANM ed EAV hanno lasciato invariati i propri biglietti aziendali. I nuovi importi Unico non sono stati estratti.

### Cited Findings
- Tipi di titolo — scheda "Biglietti e abbonamenti" — [ANM](https://www2.anm.it/index.php?option=com_content&task=view&id=1344&Itemid=320) · ANM · SI (integrale; i prezzi in tabella non risultano nel testo estratto) · 2026-10-02: "Biglietto corsa singola: (aziendale) valido una sola corsa su singolo mezzo ANM"; "Biglietto orario (solo integrato): valido una o più corse, anche di aziende diverse"; "Biglietto giornaliero (aziendale e integrato): valido per numero illimitato di corse fino a ore 24.00 del giorno di validazione"; "Si applica la tariffa urbana per gli spostamenti che iniziano e termino all'interno del comune di Napoli. Per la sola tariffa di corsa singola, si distinguono due livelli tariffari"; "Liv.2: si applica agli spostamenti in ambito urbano su tratte di linee suburbane e agli spostamenti su linee su ferro di EAV e Trenitalia (servizi non operati da ANM)"; per i titoli digitali "La validità, di 120 minuti, potrà decorrere dal momento dell'acquisto, oppure differita". La stessa pagina cita abbonamenti agevolati "dal 1 Gennaio al 31 Dicembre 2023": pagina in parte non aggiornata.
- Aumento ANM 2024: "Da maggio 2024 ha preso corpo l'aumento della tariffa di corsa singola ANM per Metro e servizi suburbani, finalmente equiparata a quella dei servizi analoghi svolti da EAV e Trenitalia in ambito cittadino."; nel 2024 la Regione ha introdotto titoli "esclusivamente in formato digitale, come il biglietto giornaliero, il biglietto settimanale e i carnet di biglietti" — [ANM, Carta della Mobilità 2025](https://www.anm.it/resource/1768990802000/cartadellamobilita25) · SI (integrale) · 2026-10-02.
- Prezzo 1,50 € (corsa singola ANM) — schede ANM Ascensori pubblici e Monte Echia (citate sopra), SI.
- Tap&Go — scheda "Tap & Go Ticket-less" — [ANM](https://www2.anm.it/index.php?option=com_content&task=view&id=3869&Itemid=320) · ANM · SI (integrale) · 2026-10-02: "Tap&Go® consente di viaggiare in modalità ticketless utilizzando direttamente le carte di pagamento contactless sui tornelli abilitati."; "Il sistema Tap &Go ® è attivo su Linea 1, Linea 6, Funicolari, Ascensore Monte Echia e linea Alibus." La pagina NON indica un tetto giornaliero.
- Aumento dal 1° ottobre 2026 — notizia "Adeguamento tariffario dal 1° ottobre" (28-09-2026) — [Unico Campania](https://www.unicocampania.it/news/Adeguamento+tariffario+dal+1%C2%B0+ottobre/181) · Consorzio UnicoCampania · SI (integrale) · 2026-10-02: "Dal 1° ottobre 2026 è previsto, in Campania, un nuovo adeguamento delle tariffe del trasporto pubblico locale. La modifica è stata disposta dalla Regione Campania con il Decreto Dirigenziale n. 55 del 3 luglio 2026, per tener conto dell'incremento dell'indice ISTAT."; "La nuova disciplina riguarda i biglietti di corsa singola, i titoli orari, i giornalieri urbani e i biglietti a bordo con sovrapprezzo. Gli abbonamenti settimanali, mensili e annuali non aumentano."; "ANM e EAV hanno deciso di lasciare invariate le tariffe dei propri biglietti aziendali."
- Contactless su bus (Unico Campania, notizia 08-07-2026, stessa pagina news) — SI (integrale): "Per le sole linee urbane sarà sufficiente effettuare il Tap In"; il sistema "applica automaticamente la soluzione tariffaria più conveniente … tenendo conto di eventuali soglie massime giornaliere o settimanali previste dal sistema". L'operatore dei "bus abilitati" non è chiaro dal testo estratto.
- Fonti non ufficiali (SNIPPET, non aperte, solo come pista): napolike.it e in3giorni.com riportano corsa singola ANM "livello 1" 1,30 € e "livello 2" 1,50 €, e che con Tap&Go "verrà addebitato al massimo il costo del biglietto giornaliero".

### Inferences
- Per il modello dei costi: ogni cambio tra mezzi ANM (es. Linea 1 → funicolare) con biglietto di corsa singola richiede un nuovo biglietto; per più spostamenti conviene il giornaliero (o il tetto Tap&Go, se confermato). Con biglietto di corsa singola 1,50 € (livello metro/funicolare) due corse costano 3,00 €.
- Linea 2 e Cumana in ambito urbano: si applica il livello 2 dei rispettivi operatori (Trenitalia, EAV) o un titolo integrato Unico. Poiché solo ANM ed EAV hanno mantenuto invariati i biglietti aziendali, è plausibile che il biglietto urbano Trenitalia e i titoli integrati siano aumentati dal 1/10/2026 (non verificato).

### Gaps
- Prezzi ufficiali correnti (dopo il 1/10/2026) di: corsa singola livello 1 e 2, biglietto orario integrato (durata in minuti), giornaliero urbano aziendale e integrato, biglietto Trenitalia urbano Linea 2, biglietto EAV urbano Cumana. Lo "Schema tariffario" Unico (https://www.unicocampania.it/uploads/testistatici/schema_tariffario.pdf, scaricato, 11 KB) non contiene testo estraibile; la pagina "Trova la tariffa" (https://www.unicocampania.it/trova-tariffa) non è stata consultata.
- Tetto giornaliero Tap&Go ANM: nessuna fonte ufficiale letta lo indica (solo fonti non ufficiali).
- Nessuna informazione tariffaria 2027 pubblicata.
