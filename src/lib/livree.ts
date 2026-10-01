// Colori delle squadre nel 3D (le stesse sigle di LIVERY in src/lib/3d/boat3d.js) e immagini fisse dell'AC75
import type { ImageMetadata } from 'astro';
import lr from '../assets/barche/ac75.jpg';
import nz from '../assets/barche/ac75-nz.jpg';
import gb from '../assets/barche/ac75-gb.jpg';
import al from '../assets/barche/ac75-al.jpg';
import fr from '../assets/barche/ac75-fr.jpg';
import us from '../assets/barche/ac75-us.jpg';
import au from '../assets/barche/ac75-au.jpg';

export type Livrea = 'lr' | 'nz' | 'gb' | 'al' | 'fr' | 'us' | 'au';

export const LIVREE: { k: Livrea; nome: string; img: ImageMetadata }[] = [
  { k: 'lr', nome: 'Luna Rossa', img: lr },
  { k: 'nz', nome: 'Emirates Team New Zealand', img: nz },
  { k: 'gb', nome: 'GB1', img: gb },
  { k: 'al', nome: 'Tudor Team Alinghi', img: al },
  { k: 'fr', nome: 'La Roche-Posay Racing Team', img: fr },
  { k: 'us', nome: 'ARC Team USA', img: us },
  { k: 'au', nome: 'Team Australia', img: au }
];

// Dalla bandiera della squadra (src/data/squadre.yaml) ai suoi colori nel 3D
export const LIVREA_DI_BANDIERA: Record<string, Livrea> = { it: 'lr', nz: 'nz', gb: 'gb', ch: 'al', fr: 'fr', us: 'us', au: 'au' };
