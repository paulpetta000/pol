// Collezioni di dati della guida. Se manca un campo obbligatorio (fonte, stato, data di controllo)
// la build si ferma: nessuna informazione va online senza fonte.
import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const data = z.coerce.date();

const fonti = defineCollection({
  loader: file('src/data/fonti.yaml'),
  schema: z.object({
    titolo: z.string().min(3),
    editore: z.string().min(2),
    url: z.string().url(),
    tipo: z.enum(['ufficiale', 'stampa', 'dati', 'altro']),
    pubblicato: data.optional(),
    controllato: data,
    letta: z.boolean(),
    nota: z.string().optional()
  })
});

const fatti = defineCollection({
  loader: file('src/data/fatti.yaml'),
  schema: z.object({
    testo: z.string().min(10),
    stato: z.enum(['confermato', 'stampa', 'segnalato', 'atteso']),
    anno: z.number().int().default(2027),
    fonti: z.array(reference('fonti')).min(1),
    controllato: data,
    ricontrollare: data.optional()
  })
});

const persona = z.object({ nome: z.string(), ruolo: z.string().optional() });

const squadre = defineCollection({
  loader: file('src/data/squadre.yaml'),
  schema: z.object({
    nome: z.string(),
    breve: z.string(),
    paese: z.string(),
    bandiera: z.enum(['nz', 'it', 'gb', 'ch', 'fr', 'us', 'au']),
    ruolo: z.enum(['defender', 'challenger-of-record', 'sfidante']),
    club: z.string().optional(),
    colore: z.string(),
    sito: z.string().url().optional(),
    ordine: z.number(),
    sintesi: z.string(),
    storia: z.array(z.string()),
    daSapere: z.array(z.string()),
    persone: z.array(persona),
    risultati2026: z.array(z.object({
      evento: z.enum(['cagliari', 'napoli']),
      barca: z.string(),
      pos: z.number(),
      punti: z.number(),
      nota: z.string().optional()
    })),
    equipaggi: z.array(z.object({ barca: z.string(), velisti: z.array(persona) })),
    protagonisti: z.array(z.object({
      nome: z.string(),
      paese: z.string(),
      testo: z.string(),
      fonti: z.array(reference('fonti')).min(1)
    })).default([]),
    fonti: z.array(reference('fonti')).min(1)
  })
});

// Foto con licenza libera: senza autore, licenza e pagina di origine la build si ferma
const foto = defineCollection({
  loader: file('src/data/foto.yaml'),
  schema: ({ image }) => z.object({
    src: image(),
    alt: z.string().min(20),
    didascalia: z.string().min(10),
    autore: z.string().min(2),
    autoreUrl: z.string().url().optional(),
    licenza: z.enum(['CC0', 'Pubblico dominio', 'CC BY 2.0', 'CC BY 3.0', 'CC BY 4.0', 'CC BY-SA 2.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0']),
    licenzaUrl: z.string().url().optional(),
    fonte: z.string().url(),
    anno: z.number().int().optional(),
    modifiche: z.string().default('Ritagliata e ridimensionata'),
    controllato: data
  })
});

const luoghi = defineCollection({
  loader: file('src/data/luoghi.yaml'),
  schema: z.object({
    nome: z.string(),
    tipo: z.enum(['vista', 'village', 'stazione', 'porto']),
    zona: z.string().optional(),
    // Solo per i punti da cui guardare: gruppo sulla mappa e nell'elenco
    gruppo: z.enum(['lungomare', 'colline', 'posillipo']).optional(),
    linea: z.string().optional(),
    lat: z.number().min(40.79).max(40.852),
    lon: z.number().min(14.15).max(14.264),
    indicativo: z.boolean().default(false),
    testo: z.string().optional(),
    vicino: z.enum(['prima-fila', 'vicino', 'dall-alto']).optional(),
    visuale: z.string().optional(),
    sole: z.string().optional(),
    gradini: z.string().optional(),
    folla: z.string().optional(),
    servizi: z.string().optional(),
    arrivare: z.array(reference('luoghi')).default([]),
    // La scheda che spiega perché il punto è nella lista (con stato e fonte)
    perche: reference('fatti').optional(),
    foto: reference('foto').optional(),
    fatti: z.array(reference('fatti')).default([])
  }).refine(l => l.tipo !== 'vista' || (l.gruppo && l.perche), { message: 'Ogni punto "vista" deve avere gruppo e perche (la scheda con la fonte)' })
});

const faq = defineCollection({
  loader: file('src/data/faq.yaml'),
  schema: z.object({
    domanda: z.string().endsWith('?'),
    risposta: z.string().min(20),
    fatti: z.array(reference('fatti')).min(1)
  })
});

// ---------- Capire la Coppa ----------
const glossario = defineCollection({
  loader: file('src/data/glossario.yaml'),
  schema: z.object({
    termine: z.string(),
    altri: z.array(z.string()).default([]),
    testo: z.string().min(15),
    fonti: z.array(reference('fonti')).min(1),
    vedi: z.string().startsWith('/').optional()
  })
});

const storia = defineCollection({
  loader: file('src/data/storia.yaml'),
  schema: z.object({
    quando: z.string(),
    titolo: z.string(),
    testo: z.string().min(20),
    italia: z.boolean().default(false),
    fonti: z.array(reference('fonti')).min(1)
  })
});

const quiz = defineCollection({
  loader: file('src/data/quiz.yaml'),
  schema: z.object({
    ordine: z.number().int(),
    domanda: z.string().endsWith('?'),
    opzioni: z.array(z.string()).length(3),
    giusta: z.number().int().min(0).max(2),
    spiegazione: z.string().min(15),
    fatti: z.array(reference('fatti')).default([]),
    fonti: z.array(reference('fonti')).default([])
  }).refine(q => q.fatti.length + q.fonti.length > 0, { message: 'Ogni domanda deve avere almeno una scheda o una fonte' })
});

// Video del canale ufficiale: l'id è il codice YouTube, verificato prima di pubblicarlo
const video = defineCollection({
  loader: file('src/data/video.yaml'),
  schema: z.object({
    ordine: z.number().int(),
    titolo: z.string().min(5),
    originale: z.string().min(3),
    durata: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/),
    gruppo: z.enum(['capire', 'regate', 'storia']),
    quando: z.string(),
    perche: z.string().min(20),
    controllato: data
  })
});

// ---------- Testi discorsivi ----------
// Un file per pagina (src/testi/<pagina>.yaml), un blocco per argomento. Ogni blocco dichiara le schede
// (usa) o le fonti che usa: l'elenco «Fonti di questa pagina» nasce da qui. Gli altri controlli
// (segni di cautela, firme delle schede) sono in src/lib/testi.ts.
const blocco = z.object({
  usa: z.array(reference('fatti')).default([]),
  fonti: z.array(reference('fonti')).default([]),
  // Solo per consigli nostri, che non hanno bisogno di una fonte: perché
  senzaFonte: z.string().min(10).optional(),
  testo: z.string().min(20).optional(),
  // Numeri in evidenza: cifra grande e spiegazione
  voci: z.array(z.object({ num: z.string(), testo: z.string().min(5) })).optional()
})
  .refine(b => b.testo || b.voci, { message: 'Ogni blocco deve avere un testo o delle voci' })
  .refine(b => b.usa.length + b.fonti.length > 0 || b.senzaFonte, { message: 'Ogni blocco deve dire quali schede (usa) o fonti usa. Se è solo un consiglio nostro, scrivi senzaFonte: "perché"' });

const testi = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/testi' }),
  schema: z.record(z.string().regex(/^[a-z0-9-]+$/), blocco)
});

export const collections = { fonti, fatti, squadre, foto, luoghi, faq, glossario, storia, quiz, video, testi };
