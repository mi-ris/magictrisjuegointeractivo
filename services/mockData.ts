
import { MagicCard, IslandLevel, WordData } from '../types';

const LEVEL_GROUPS = [
  { name: 'MIS PRIMERAS PALABRAS', islandIcon: 'sun', color: 'from-indigo-400 to-cyan-400', items: ['MAMÁ', 'PAPÁ', 'CASA', 'AGUA', 'SOL'] },
  { name: 'MI FAMILIA', islandIcon: 'family', color: 'from-indigo-400 to-cyan-400', items: ['BEBÉ', 'FELIZ', 'PAPÁ', 'MAMÁ', 'CASA'] },
  { name: 'MI CASA', islandIcon: 'home', color: 'from-indigo-400 to-cyan-400', items: ['CAMA', 'MESA', 'LECHE', 'VASO', 'PUERTA'] },
  { name: 'ANIMALES', islandIcon: 'paw', color: 'from-indigo-400 to-cyan-400', items: ['GATO', 'OSO', 'LOBO', 'CONEJO', 'PATO'] },
  { name: 'NATURALEZA', islandIcon: 'tree', color: 'from-indigo-400 to-cyan-400', items: ['LUNA', 'NUBE', 'RÍO', 'SOL', 'FUEGO'] },
  { name: 'JUEGOS Y OBJETOS', islandIcon: 'gift', color: 'from-indigo-400 to-cyan-400', items: ['PELOTA', 'DADO', 'JUGO', 'LÁPIZ', 'ROBOT'] },
];

export interface PictogramInfo {
  word: string;
  syllables: string[];
  imageUrl: string;
}

const PICTOGRAM_DATA: Record<string, PictogramInfo> = {
  'MAMÁ':   { word: 'Mamá',   syllables: ['MA', 'MÁ'],   imageUrl: '/word-mama.webp' },
  'PAPÁ':   { word: 'Papá',   syllables: ['PA', 'PÁ'],   imageUrl: '/word-papa.webp' },
  'CASA':   { word: 'Casa',   syllables: ['CA', 'SA'],   imageUrl: '/word-casa.webp' },
  'AGUA':   { word: 'Agua',   syllables: ['A', 'GUA'],   imageUrl: '/word-agua.webp' },
  'SOL':    { word: 'Sol',    syllables: ['SOL'],         imageUrl: '/word-sol.webp' },
  'BEBÉ':   { word: 'Bebé',   syllables: ['BE', 'BÉ'],   imageUrl: '/word-bebe.webp' },
  'FELIZ':  { word: 'Feliz',  syllables: ['FE', 'LIZ'],  imageUrl: '/word-feliz.webp' },
  'CAMA':   { word: 'Cama',   syllables: ['CA', 'MA'],   imageUrl: '/word-cama.webp' },
  'MESA':   { word: 'Mesa',   syllables: ['ME', 'SA'],   imageUrl: '/word-mesa.webp' },
  'LECHE':  { word: 'Leche',  syllables: ['LE', 'CHE'],  imageUrl: '/word-leche.webp' },
  'VASO':   { word: 'Vaso',   syllables: ['VA', 'SO'],   imageUrl: '/word-vaso.webp' },
  'PUERTA': { word: 'Puerta', syllables: ['PUER', 'TA'], imageUrl: '/word-puerta.webp' },
  'GATO':   { word: 'Gato',   syllables: ['GA', 'TO'],   imageUrl: '/word-gato.webp' },
  'OSO':    { word: 'Oso',    syllables: ['O', 'SO'],    imageUrl: '/word-oso.webp' },
  'LOBO':   { word: 'Lobo',   syllables: ['LO', 'BO'],   imageUrl: '/word-lobo.webp' },
  'CONEJO': { word: 'Conejo', syllables: ['CO', 'NE', 'JO'], imageUrl: '/word-conejo.webp' },
  'PATO':   { word: 'Pato',   syllables: ['PA', 'TO'],   imageUrl: '/word-pato.webp' },
  'LUNA':   { word: 'Luna',   syllables: ['LU', 'NA'],   imageUrl: '/word-luna.webp' },
  'NUBE':   { word: 'Nube',   syllables: ['NU', 'BE'],   imageUrl: '/word-nube.webp' },
  'RÍO':    { word: 'Río',    syllables: ['RÍ', 'O'],    imageUrl: '/word-rio.webp' },
  'FUEGO':  { word: 'Fuego',  syllables: ['FUE', 'GO'],  imageUrl: '/word-fuego.webp' },
  'PELOTA': { word: 'Pelota', syllables: ['PE', 'LO', 'TA'], imageUrl: '/word-pelota.webp' },
  'DADO':   { word: 'Dado',   syllables: ['DA', 'DO'],   imageUrl: '/word-dado.webp' },
  'JUGO':   { word: 'Jugo',   syllables: ['JU', 'GO'],   imageUrl: '/word-jugo.webp' },
  'LÁPIZ':  { word: 'Lápiz',  syllables: ['LÁ', 'PIZ'],  imageUrl: '/word-lapiz.webp' },
  'ROBOT':  { word: 'Robot',  syllables: ['RO', 'BOT'],  imageUrl: '/word-robot.webp' },
};

export const FIRST_WORDS: WordData[] = Object.entries(PICTOGRAM_DATA).map(([key, data]) => ({
  word: key,
  syllables: data.syllables,
  audioInstruction: `${data.word}. ${data.syllables.join('-')}. ¡${data.word}!`,
  imageUrl: data.imageUrl,
}));

const flattenPath = (): MagicCard[] => {
  const path: MagicCard[] = [];

  LEVEL_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      const pictInfo = PICTOGRAM_DATA[item] || { word: item, syllables: [item], imageUrl: '' };

      const audioInstruction = `¡Vamos a aprender la palabra ${item}! ${pictInfo.word}. ${pictInfo.syllables.join('-')}. ¡${pictInfo.word}!`;

      path.push({
        id: `card-${item}`,
        title: `Palabra ${item}`,
        value: item,
        type: 'palabra',
        color: 'bg-indigo-500',
        highlightColor: '#6366f1',
        pictogramName: pictInfo.word,
        pictogramWord: pictInfo.word,
        description: `La palabra ${pictInfo.word}`,
        audioInstruction: audioInstruction,
        imageUrl: pictInfo.imageUrl
      });
    });
  });
  return path;
};

export const MAGIC_PATH: MagicCard[] = flattenPath();

export const MAGIC_ISLANDS: IslandLevel[] = LEVEL_GROUPS.map((group, idx) => ({
  id: `island-${idx}`,
  name: group.name,
  islandIcon: group.islandIcon,
  cardIds: group.items.map((item, itemIdx) => {
    let offset = 0;
    for (let i = 0; i < idx; i++) offset += LEVEL_GROUPS[i].items.length;
    return MAGIC_PATH[offset + itemIdx].id;
  }),
}));

export const MAGIC_LEVELS = LEVEL_GROUPS;
export const PICTOGRAMS = PICTOGRAM_DATA;
