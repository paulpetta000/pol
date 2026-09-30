# Napoli a Vela · Guida per il 2027

Sito statico in [Astro](https://astro.build), pubblicato su Vercel.

## Comandi

```sh
npm install
npm run dev      # sito in locale su http://localhost:4321
npm run build    # costruisce il sito in dist/
```

## Dove sono le informazioni

| File | Cosa contiene |
|---|---|
| `src/data/fatti.yaml` | Le schede: testo, stato (`confermato` / `stampa` / `atteso`), fonti, data di controllo, data entro cui ricontrollare |
| `src/data/fonti.yaml` | Le fonti, con indirizzo e data di controllo |
| `src/data/eventi.ts` | Il calendario 2027 (anche i file .ics) |
| `src/data/squadre.yaml` | Le 7 squadre |
| `src/data/luoghi.yaml` | Punti della mappa e schede "Dove mi metto?" (gruppo, fonte `perche`, foto) |
| `src/data/foto.yaml` | Foto con licenza libera: file in `src/assets/foto/`, autore, licenza, origine, descrizione |
| `src/data/faq.yaml` | Domande frequenti |
| `src/data/risultati-2026.json` | Risultati ufficiali 2026 |
| `src/config/sito.ts` | Nome del sito, titolare, date chiave |

Stati delle schede: `confermato`, `stampa` (giornali), `segnalato` (blog e siti non ufficiali), `atteso`.

Regola: **nessuna informazione senza fonte**. Se una scheda non ha fonte, stato o data, la build si ferma.
Quando una scheda supera la data `ricontrollare`, la build scrive un avviso `[da ricontrollare]`.

## Aggiornare un'informazione

1. Apri la fonte e controlla.
2. Cambia il `testo` della scheda in `fatti.yaml`, lo `stato` se serve, e la data `controllato`.
3. Se la fonte è nuova, aggiungila in `fonti.yaml`.
4. `npm run build` per controllare.

## Altro

- Mappa: `scripts/mappa/` (dati © OpenStreetMap, ODbL).
- Font: `scripts/font/prepara.py` (licenza SIL OFL).
- Logo: `src/lib/logo.mjs`; icone dell'app e favicon: `node scripts/icone.mjs`.
- Un nuovo punto panoramico entra solo con due fonti indipendenti, o una fonte affidabile più i dati di OpenStreetMap; aggiungilo anche in `ORDINE_VISTE` (`src/lib/luoghi.ts`).
- Database "Avvisami": `supabase/migrations/`.
- Motore 3D dell'AC40: `src/lib/3d/`.
