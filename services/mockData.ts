
import { MagicCard, IslandLevel, WordData } from '../types';

const LEVEL_GROUPS = [
  { name: 'MIS PRIMERAS PALABRAS', islandIcon: '🌴', color: 'from-indigo-400 to-cyan-400', items: ['MAMÁ', 'PAPÁ', 'CASA', 'AGUA', 'SOL'] },
  { name: 'MI FAMILIA', islandIcon: '🌈', color: 'from-indigo-400 to-cyan-400', items: ['BEBÉ', 'FELIZ', 'PAPÁ', 'MAMÁ', 'CASA'] },
  { name: 'MI CASA', islandIcon: '🏡', color: 'from-indigo-400 to-cyan-400', items: ['CAMA', 'MESA', 'LECHE', 'VASO', 'PUERTA'] },
  { name: 'ANIMALES', islandIcon: '🐾', color: 'from-indigo-400 to-cyan-400', items: ['GATO', 'OSO', 'LOBO', 'CONEJO', 'PATO'] },
  { name: 'NATURALEZA', islandIcon: '🌳', color: 'from-indigo-400 to-cyan-400', items: ['LUNA', 'NUBE', 'RÍO', 'SOL', 'FUEGO'] },
  { name: 'JUEGOS Y OBJETOS', islandIcon: '🎁', color: 'from-indigo-400 to-cyan-400', items: ['PELOTA', 'DADO', 'JUGO', 'LÁPIZ', 'ROBOT'] },
];

export interface PictogramInfo {
  icon: string;
  word: string;
  syllables: string[];
  imageUrl: string;
}

const PICTOGRAM_DATA: Record<string, PictogramInfo> = {
  'MAMÁ': { icon: '👩', word: 'Mamá', syllables: ['MA', 'MÁ'], imageUrl: 'https://images.pexels.com/photos/19205992/pexels-photo-19205992.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'PAPÁ': { icon: '👨', word: 'Papá', syllables: ['PA', 'PÁ'], imageUrl: 'https://images.pexels.com/photos/19284179/pexels-photo-19284179.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'CASA': { icon: '🏠', word: 'Casa', syllables: ['CA', 'SA'], imageUrl: 'https://images.pexels.com/photos/13645517/pexels-photo-13645517.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'AGUA': { icon: '💧', word: 'Agua', syllables: ['A', 'GUA'], imageUrl: 'https://images.pexels.com/photos/9000378/pexels-photo-9000378.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'SOL': { icon: '☀️', word: 'Sol', syllables: ['SOL'], imageUrl: 'https://images.pexels.com/photos/1686230/pexels-photo-1686230.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'BEBÉ': { icon: '👶', word: 'Bebé', syllables: ['BE', 'BÉ'], imageUrl: 'https://images.pexels.com/photos/38008350/pexels-photo-38008350.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'FELIZ': { icon: '😊', word: 'Feliz', syllables: ['FE', 'LIZ'], imageUrl: 'https://images.pexels.com/photos/36586364/pexels-photo-36586364.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'CAMA': { icon: '🛏️', word: 'Cama', syllables: ['CA', 'MA'], imageUrl: 'https://images.pexels.com/photos/16880932/pexels-photo-16880932.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'MESA': { icon: '🪑', word: 'Mesa', syllables: ['ME', 'SA'], imageUrl: 'https://images.pexels.com/photos/3104526/pexels-photo-3104526.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'LECHE': { icon: '🥛', word: 'Leche', syllables: ['LE', 'CHE'], imageUrl: 'https://images.pexels.com/photos/5967316/pexels-photo-5967316.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'VASO': { icon: '🥛', word: 'Vaso', syllables: ['VA', 'SO'], imageUrl: 'https://images.pexels.com/photos/6593237/pexels-photo-6593237.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'PUERTA': { icon: '🚪', word: 'Puerta', syllables: ['PUER', 'TA'], imageUrl: 'https://images.pexels.com/photos/33244054/pexels-photo-33244054.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'GATO': { icon: '🐱', word: 'Gato', syllables: ['GA', 'TO'], imageUrl: 'https://images.pexels.com/photos/32026049/pexels-photo-32026049.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'OSO': { icon: '🐻', word: 'Oso', syllables: ['O', 'SO'], imageUrl: 'https://images.pexels.com/photos/7492295/pexels-photo-7492295.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'LOBO': { icon: '🐺', word: 'Lobo', syllables: ['LO', 'BO'], imageUrl: 'https://images.pexels.com/photos/36835951/pexels-photo-36835951.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'CONEJO': { icon: '🐰', word: 'Conejo', syllables: ['CO', 'NE', 'JO'], imageUrl: 'https://images.pexels.com/photos/19904640/pexels-photo-19904640.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'PATO': { icon: '🦆', word: 'Pato', syllables: ['PA', 'TO'], imageUrl: 'https://images.pexels.com/photos/11873014/pexels-photo-11873014.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'LUNA': { icon: '🌙', word: 'Luna', syllables: ['LU', 'NA'], imageUrl: 'https://images.pexels.com/photos/32088272/pexels-photo-32088272.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'NUBE': { icon: '☁️', word: 'Nube', syllables: ['NU', 'BE'], imageUrl: 'https://images.pexels.com/photos/7833039/pexels-photo-7833039.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'RÍO': { icon: '🏞️', word: 'Río', syllables: ['RÍ', 'O'], imageUrl: 'https://images.pexels.com/photos/14626539/pexels-photo-14626539.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'FUEGO': { icon: '🔥', word: 'Fuego', syllables: ['FUE', 'GO'], imageUrl: 'https://images.pexels.com/photos/12391921/pexels-photo-12391921.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'PELOTA': { icon: '⚽', word: 'Pelota', syllables: ['PE', 'LO', 'TA'], imageUrl: 'https://images.pexels.com/photos/28222529/pexels-photo-28222529.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'DADO': { icon: '🎲', word: 'Dado', syllables: ['DA', 'DO'], imageUrl: 'https://images.pexels.com/photos/7025165/pexels-photo-7025165.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'JUGO': { icon: '🧃', word: 'Jugo', syllables: ['JU', 'GO'], imageUrl: 'https://images.pexels.com/photos/15823268/pexels-photo-15823268.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'LÁPIZ': { icon: '✏️', word: 'Lápiz', syllables: ['LÁ', 'PIZ'], imageUrl: 'https://images.pexels.com/photos/18889468/pexels-photo-18889468.jpeg?auto=compress&cs=tinysrgb&h=350&w=350' },
  'ROBOT': { icon: '🤖', word: 'Robot', syllables: ['RO', 'BOT'], imageUrl: 'https://images.pexels.com/photos/36847299/pexels-photo-36847299.png?auto=compress&cs=tinysrgb&h=350&w=350' },
};

export const FIRST_WORDS: WordData[] = Object.entries(PICTOGRAM_DATA).map(([key, data]) => ({
  word: key,
  icon: data.icon,
  syllables: data.syllables,
  audioInstruction: `${data.word}. ${data.syllables.join('-')}. ¡${data.word}!`,
  imageUrl: data.imageUrl,
}));

const BRIGHT_COLORS = [
    { bg: 'bg-indigo-500', hex: '#6366f1' },
    { bg: 'bg-indigo-500', hex: '#6366f1' },
    { bg: 'bg-indigo-500', hex: '#6366f1' },
    { bg: 'bg-indigo-500', hex: '#6366f1' },
    { bg: 'bg-indigo-500', hex: '#6366f1' },
    { bg: 'bg-indigo-500', hex: '#6366f1' },
    { bg: 'bg-indigo-500', hex: '#6366f1' },
    { bg: 'bg-indigo-500', hex: '#6366f1' },
    { bg: 'bg-indigo-500', hex: '#6366f1' },
    { bg: 'bg-indigo-500', hex: '#6366f1' },
];

const flattenPath = (): MagicCard[] => {
  const path: MagicCard[] = [];
  let colorCounter = 0;

  LEVEL_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      const pictInfo = PICTOGRAM_DATA[item] || { icon: '✨', word: 'Magia', syllables: [item], imageUrl: '' };
      const colorSet = BRIGHT_COLORS[colorCounter % BRIGHT_COLORS.length];
      colorCounter++;

      const audioInstruction = `¡Vamos a aprender la palabra ${item}! ${pictInfo.word}. ${pictInfo.syllables.join('-')}. ¡${pictInfo.word}!`;

      path.push({
        id: `card-${item}`,
        title: `Palabra ${item}`,
        value: item,
        type: 'palabra',
        color: colorSet.bg,
        highlightColor: '#000000',
        icon: pictInfo.icon,
        pictogramName: pictInfo.word,
        pictogramWord: pictInfo.word,
        monster: '👾',
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
