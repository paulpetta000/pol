// Collezioni di dati della guida. Se manca un campo obbligatorio (fonte, stato, data di controllo)
// la build si ferma: nessuna informazione va online senza fonte.
import { defineCollection, reference } from 'astro:content';
import { file } from 'astro/loaders';
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
    stato: z.enum(['confermato', 'stampa', 'atteso']),
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

const luoghi = defineCollection({
  loader: file('src/data/luoghi.yaml'),
  schema: z.object({
    nome: z.string(),
    tipo: z.enum(['vista', 'village', 'stazione', 'porto']),
    zona: z.string().optional(),
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
    fatti: z.array(reference('fatti')).default([])
  })
});

const faq = defineCollection({
  loader: file('src/data/faq.yaml'),
  schema: z.object({
    domanda: z.string().endsWith('?'),
    risposta: z.string().min(20),
    fatti: z.array(reference('fatti')).min(1)
  })
});

export const collections = { fonti, fatti, squadre, luoghi, faq };
