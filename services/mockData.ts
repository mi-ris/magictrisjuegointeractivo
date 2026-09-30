
import { MagicCard, IslandLevel, WordData } from '../types';

const LEVEL_GROUPS = [
  { name: 'MUNDO 1 · MIS PRIMERAS PALABRAS', islandIcon: '🏝️', items: ['MAMÁ', 'PAPÁ', 'CASA', 'AGUA', 'SOL'] },
  { name: 'MUNDO 2 · MI FAMILIA', islandIcon: '🌈', items: ['BEBÉ', 'HADA', 'MAMÁ', 'PAPÁ', 'FELIZ'] },
  { name: 'MUNDO 3 · MI CASA', islandIcon: '🏠', items: ['CAMA', 'MESA', 'LECHE', 'VASO', 'PUERTA'] },
  { name: 'MUNDO 4 · ANIMALES', islandIcon: '🐾', items: ['GATO', 'OSO', 'LOBO', 'CONEJO', 'PATO'] },
  { name: 'MUNDO 5 · NATURALEZA', islandIcon: '🌳', items: ['LUNA', 'NUBE', 'RÍO', 'SOL', 'FUEGO'] },
  { name: 'MUNDO 6 · JUEGOS Y OBJETOS', islandIcon: '🎁', items: ['PELOTA', 'DADO', 'JUGO', 'LÁPIZ', 'ROBOT'] },
];

const BRIGHT_COLORS = [
    { bg: 'bg-indigo-500', hex: '#6366f1' },
    { bg: 'bg-blue-500', hex: '#3b82f6' },
    { bg: 'bg-cyan-500', hex: '#06b6d4' },
    { bg: 'bg-teal-500', hex: '#14b8a6' },
    { bg: 'bg-sky-500', hex: '#0ea5e9' },
    { bg: 'bg-amber-500', hex: '#f59e0b' },
    { bg: 'bg-emerald-500', hex: '#10b981' },
    { bg: 'bg-rose-500', hex: '#f43f5e' },
    { bg: 'bg-orange-500', hex: '#f97316' },
    { bg: 'bg-lime-500', hex: '#84cc16' },
];

const PICTOGRAM_DATA: Record<string, { icon: string, word: string, syllables: string[] }> = {
  'MAMÁ': { icon: '👩', word: 'Mamá', syllables: ['MA', 'MÁ'] },
  'PAPÁ': { icon: '👨', word: 'Papá', syllables: ['PA', 'PÁ'] },
  'CASA': { icon: '🏠', word: 'Casa', syllables: ['CA', 'SA'] },
  'AGUA': { icon: '💧', word: 'Agua', syllables: ['A', 'GUA'] },
  'SOL': { icon: '☀️', word: 'Sol', syllables: ['SOL'] },
  'BEBÉ': { icon: '👶', word: 'Bebé', syllables: ['BE', 'BÉ'] },
  'HADA': { icon: '🧚‍♀️', word: 'Hada', syllables: ['HA', 'DA'] },
  'FELIZ': { icon: '😊', word: 'Feliz', syllables: ['FE', 'LIZ'] },
  'CAMA': { icon: '🛌', word: 'Cama', syllables: ['CA', 'MA'] },
  'MESA': { icon: '🪑', word: 'Mesa', syllables: ['ME', 'SA'] },
  'LECHE': { icon: '🥛', word: 'Leche', syllables: ['LE', 'CHE'] },
  'VASO': { icon: '🥛', word: 'Vaso', syllables: ['VA', 'SO'] },
  'PUERTA': { icon: '🚪', word: 'Puerta', syllables: ['PUER', 'TA'] },
  'GATO': { icon: '🐱', word: 'Gato', syllables: ['GA', 'TO'] },
  'OSO': { icon: '🐻', word: 'Oso', syllables: ['O', 'SO'] },
  'LOBO': { icon: '🐺', word: 'Lobo', syllables: ['LO', 'BO'] },
  'CONEJO': { icon: '🐰', word: 'Conejo', syllables: ['CO', 'NE', 'JO'] },
  'PATO': { icon: '🦆', word: 'Pato', syllables: ['PA', 'TO'] },
  'LUNA': { icon: '🌙', word: 'Luna', syllables: ['LU', 'NA'] },
  'NUBE': { icon: '☁️', word: 'Nube', syllables: ['NU', 'BE'] },
  'RÍO': { icon: '🏞️', word: 'Río', syllables: ['RÍ', 'O'] },
  'FUEGO': { icon: '🔥', word: 'Fuego', syllables: ['FUE', 'GO'] },
  'PELOTA': { icon: '⚽', word: 'Pelota', syllables: ['PE', 'LO', 'TA'] },
  'DADO': { icon: '🎲', word: 'Dado', syllables: ['DA', 'DO'] },
  'JUGO': { icon: '🧃', word: 'Jugo', syllables: ['JU', 'GO'] },
  'LÁPIZ': { icon: '✏️', word: 'Lápiz', syllables: ['LÁ', 'PIZ'] },
  'ROBOT': { icon: '🤖', word: 'Robot', syllables: ['RO', 'BOT'] },
};

export const FIRST_WORDS: WordData[] = Object.entries(PICTOGRAM_DATA).map(([key, data]) => ({
  word: key,
  icon: data.icon,
  syllables: data.syllables,
  audioInstruction: `${data.word}. ${data.syllables.join('-')}. ¡${data.word}!`,
}));

const flattenPath = (): MagicCard[] => {
  const path: MagicCard[] = [];
  let colorCounter = 0;

  LEVEL_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      const pictInfo = PICTOGRAM_DATA[item] || { icon: '✨', word: 'Magia', syllables: [item] };
      
      const colorSet = BRIGHT_COLORS[colorCounter % BRIGHT_COLORS.length];
      colorCounter++;

      const audioInstruction = `Aprendamos la palabra ${item}. ${pictInfo.word}. ${pictInfo.syllables.join('-')}. ¡${pictInfo.word}!`;

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
        audioInstruction: audioInstruction
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
