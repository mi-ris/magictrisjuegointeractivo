
import { MagicCard, IslandLevel, WordData } from '../types';

const LEVEL_GROUPS = [
  { name: 'ISLA DE LAS VOCALES', islandIcon: '🏝️', items: ['A', 'E', 'I', 'O', 'U'] },
  { name: 'ISLA DE LAS PALABRAS', islandIcon: '🌟', items: ['MAMÁ', 'PAPÁ', 'CASA', 'AGUA', 'SOL'] },
  { name: 'ISLA DE LA LETRA B', islandIcon: '⛵', items: ['B', 'BA', 'BE', 'BI', 'BO', 'BU'] },
  { name: 'ISLA DE LA LETRA C', islandIcon: '🏠', items: ['C', 'CA', 'CE', 'CI', 'CO', 'CU'] },
  { name: 'ISLA DE LA LETRA D', islandIcon: '🎲', items: ['D', 'DA', 'DE', 'DI', 'DO', 'DU'] },
  { name: 'ISLA DE LA LETRA F', islandIcon: '🍓', items: ['F', 'FA', 'FE', 'FI', 'FO', 'FU'] },
  { name: 'ISLA DE LA LETRA G', islandIcon: '🐱', items: ['G', 'GA', 'GE', 'GI', 'GO', 'GU'] },
  { name: 'ISLA DE LA LETRA H', islandIcon: '🦛', items: ['H', 'HA', 'HE', 'HI', 'HO', 'HU'] },
  { name: 'ISLA DE LA LETRA J', islandIcon: '🦒', items: ['J', 'JA', 'JE', 'JI', 'JO', 'JU'] },
  { name: 'ISLA DE LA LETRA K', islandIcon: '🐨', items: ['K', 'KA', 'KE', 'KI', 'KO', 'KU'] },
  { name: 'ISLA DE LA LETRA L', islandIcon: '🦁', items: ['L', 'LA', 'LE', 'LI', 'LO', 'LU'] },
  { name: 'ISLA DE LA LETRA M', islandIcon: '🐒', items: ['M', 'MA', 'ME', 'MI', 'MO', 'MU'] },
  { name: 'ISLA DE LA LETRA N', islandIcon: '🍊', items: ['N', 'NA', 'NE', 'NI', 'NO', 'NU'] },
  { name: 'ISLA DE LA LETRA Ñ', islandIcon: '🐦', items: ['Ñ', 'ÑA', 'ÑE', 'ÑI', 'ÑO', 'ÑU'] },
  { name: 'ISLA DE LA LETRA P', islandIcon: '🦆', items: ['P', 'PA', 'PE', 'PI', 'PO', 'PU'] },
  { name: 'ISLA DE LA LETRA Q', islandIcon: '🧀', items: ['Q', 'QUE', 'QUI'] },
  { name: 'ISLA DE LA LETRA R', islandIcon: '🐭', items: ['R', 'RA', 'RE', 'RI', 'RO', 'RU'] },
  { name: 'ISLA DE LA LETRA S', islandIcon: '☀️', items: ['S', 'SA', 'SE', 'SI', 'SO', 'SU'] },
  { name: 'ISLA DE LA LETRA T', islandIcon: '🐢', items: ['T', 'TA', 'TE', 'TI', 'TO', 'TU'] },
  { name: 'ISLA DE LA LETRA V', islandIcon: '🐄', items: ['V', 'VA', 'VE', 'VI', 'VO', 'VU'] },
  { name: 'ISLA DE LA LETRA W', islandIcon: '🧇', items: ['W', 'WA', 'WE', 'WI', 'WO', 'WU'] },
  { name: 'ISLA DE LA LETRA X', islandIcon: '🎻', items: ['X', 'XA', 'XE', 'XI', 'XO', 'XU'] },
  { name: 'ISLA DE LA LETRA Y', islandIcon: '🪀', items: ['Y', 'YA', 'YE', 'YI', 'YO', 'YU'] },
  { name: 'ISLA DE LA LETRA Z', islandIcon: '🥕', items: ['Z', 'ZA', 'ZE', 'ZI', 'ZO', 'ZU'] },
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

const PICTOGRAM_DATA: Record<string, { icon: string, word: string }> = {
  'A': { icon: '🐝', word: 'Abeja' }, 'E': { icon: '🐘', word: 'Elefante' }, 'I': { icon: '🏝️', word: 'Isla' }, 'O': { icon: '🐻', word: 'Oso' }, 'U': { icon: '🍇', word: 'Uva' },
  'MAMÁ': { icon: '👩', word: 'Mamá' }, 'PAPÁ': { icon: '👨', word: 'Papá' }, 'CASA': { icon: '🏠', word: 'Casa' }, 'AGUA': { icon: '💧', word: 'Agua' }, 'SOL': { icon: '☀️', word: 'Sol' },
  'B': { icon: '⛵', word: 'Barco' }, 'BA': { icon: '🐳', word: 'Ballena' }, 'BE': { icon: '👶', word: 'Bebé' }, 'BI': { icon: '🚲', word: 'Bici' }, 'BO': { icon: '👢', word: 'Bota' }, 'BU': { icon: '🦉', word: 'Búho' },
  'C': { icon: '🏠', word: 'Casa' }, 'CA': { icon: '🛌', word: 'Cama' }, 'CE': { icon: '🦓', word: 'Cebra' }, 'CI': { icon: '🦢', word: 'Cisne' }, 'CO': { icon: '🐰', word: 'Conejo' }, 'CU': { icon: '🥄', word: 'Cuchara' },
  'D': { icon: '🎲', word: 'Dado' }, 'DA': { icon: '💃', word: 'Dama' }, 'DE': { icon: '☝️', word: 'Dedo' }, 'DI': { icon: '🦖', word: 'Dino' }, 'DO': { icon: '🍩', word: 'Dona' }, 'DU': { icon: '🧚', word: 'Duende' },
  'F': { icon: '🍓', word: 'Fresa' }, 'FA': { icon: '🔦', word: 'Faro' }, 'FE': { icon: '😊', word: 'Feliz' }, 'FI': { icon: '🎫', word: 'Ficha' }, 'FO': { icon: '🦭', word: 'Foca' }, 'FU': { icon: '🔥', word: 'Fuego' },
  'G': { icon: '🐱', word: 'Gato' }, 'GA': { icon: '🍪', word: 'Galleta' }, 'GE': { icon: '🍮', word: 'Gelatina' }, 'GI': { icon: '🌻', word: 'Girasol' }, 'GO': { icon: '🍬', word: 'Goma' }, 'GU': { icon: '🐛', word: 'Gusano' },
  'H': { icon: '🦛', word: 'Hipo' }, 'HA': { icon: '🧚‍♀️', word: 'Hada' }, 'HE': { icon: '🍦', word: 'Helado' }, 'HI': { icon: '🧊', word: 'Hielo' }, 'HO': { icon: '🍂', word: 'Hoja' }, 'HU': { icon: '🥚', word: 'Huevo' },
  'J': { icon: '🦒', word: 'Jirafa' }, 'JA': { icon: '🧼', word: 'Jabón' }, 'JE': { icon: '💉', word: 'Jeringa' }, 'JI': { icon: '🏇', word: 'Jinete' }, 'JO': { icon: '💍', word: 'Joya' }, 'JU': { icon: '🧃', word: 'Jugo' },
  'K': { icon: '🐨', word: 'Koala' }, 'KA': { icon: '🛶', word: 'Kayak' }, 'KE': { icon: '🥫', word: 'Kétchup' }, 'KI': { icon: '🥝', word: 'Kiwi' }, 'KO': { icon: '🐨', word: 'Koala' }, 'KU': { icon: '🥋', word: 'Kung-fu' },
  'L': { icon: '🦁', word: 'León' }, 'LA': { icon: '✏️', word: 'Lápiz' }, 'LE': { icon: '🥛', word: 'Leche' }, 'LI': { icon: '🍋', word: 'Limón' }, 'LO': { icon: '🐺', word: 'Lobo' }, 'LU': { icon: '🌙', word: 'Luna' },
  'M': { icon: '🐒', word: 'Mono' }, 'MA': { icon: '✋', word: 'Mano' }, 'ME': { icon: '🪑', word: 'Mesa' }, 'MI': { icon: '🍯', word: 'Miel' }, 'MO': { icon: '🐒', word: 'Mono' }, 'MU': { icon: '🦷', word: 'Muela' },
  'N': { icon: '🍊', word: 'Naranja' }, 'NA': { icon: '👃', word: 'Nariz' }, 'NE': { icon: '🌨️', word: 'Nevar' }, 'NI': { icon: '🪹', word: 'Nido' }, 'NO': { icon: '🎵', word: 'Nota' }, 'NU': { icon: '☁️', word: 'Nube' },
  'Ñ': { icon: '🐦', word: 'Ñandú' }, 'ÑA': { icon: '🕷️', word: 'Araña' }, 'ÑE': { icon: '🪆', word: 'Muñeca' }, 'ÑI': { icon: '🤙', word: 'Meñique' }, 'ÑO': { icon: '🍝', word: 'Ñoquis' }, 'ÑU': { icon: '🐃', word: 'Ñu' },
  'P': { icon: '🦆', word: 'Pato' }, 'PA': { icon: '🐼', word: 'Panda' }, 'PE': { icon: '⚽', word: 'Pelota' }, 'PI': { icon: '🍍', word: 'Piña' }, 'PO': { icon: '🐥', word: 'Pollito' }, 'PU': { icon: '🚪', word: 'Puerta' },
  'Q': { icon: '🧀', word: 'Queso' }, 'QUE': { icon: '🧀', word: 'Queso' }, 'QUI': { icon: '📅', word: 'Quince' },
  'R': { icon: '🐭', word: 'Ratón' }, 'RA': { icon: '🌿', word: 'Rama' }, 'RE': { icon: '⌚', word: 'Reloj' }, 'RI': { icon: '🏞️', word: 'Río' }, 'RO': { icon: '🤖', word: 'Robot' }, 'RU': { icon: '🎡', word: 'Rueda' },
  'S': { icon: '☀️', word: 'Sol' }, 'SA': { icon: '🐸', word: 'Sapo' }, 'SE': { icon: '🌱', word: 'Semilla' }, 'SI': { icon: '🪑', word: 'Silla' }, 'SO': { icon: '🥣', word: 'Sopa' }, 'SU': { icon: '🆙', word: 'Subir' },
  'T': { icon: '🐢', word: 'Tortuga' }, 'TA': { icon: '🥁', word: 'Tambor' }, 'TE': { icon: '📺', word: 'Tele' }, 'TI': { icon: '✂️', word: 'Tijera' }, 'TO': { icon: '🍅', word: 'Tomate' }, 'TU': { icon: '🦜', word: 'Tucán' },
  'V': { icon: '🐄', word: 'Vaca' }, 'VA': { icon: '🥛', word: 'Vaso' }, 'VE': { icon: '👗', word: 'Vestido' }, 'VI': { icon: '🎻', word: 'Violín' }, 'VO': { icon: '🌋', word: 'Volcán' }, 'VU': { icon: '✈️', word: 'Vuelo' },
  'W': { icon: '🧇', word: 'Waffle' }, 'WA': { icon: '🤽', word: 'Waterpolo' }, 'WE': { icon: '🌐', word: 'Web' }, 'WI': { icon: '📶', word: 'Wi-fi' }, 'WO': { icon: '🍳', word: 'Wok' }, 'WU': { icon: '🥋', word: 'Wushu' },
  'X': { icon: '🎻', word: 'Xilófono' }, 'XA': { icon: '📝', word: 'Examen' }, 'XE': { icon: '🥊', word: 'Boxeo' }, 'XI': { icon: '🎻', word: 'Xilófono' }, 'XO': { icon: '🎷', word: 'Saxofón' }, 'XU': { icon: '💦', word: 'Exudar' },
  'Y': { icon: '🪀', word: 'Yoyo' }, 'YA': { icon: '🚤', word: 'Yate' }, 'YE': { icon: '🐎', word: 'Yegua' }, 'YI': { icon: '⚡', word: 'Rayito' }, 'YO': { icon: '🪀', word: 'Yoyo' }, 'YU': { icon: '🍠', word: 'Yuca' },
  'Z': { icon: '🥕', word: 'Zanahoria' }, 'ZA': { icon: '👟', word: 'Zapato' }, 'ZE': { icon: '🎈', word: 'Zepelín' }, 'ZI': { icon: '📉', word: 'Zigzag' }, 'ZO': { icon: '🦊', word: 'Zorro' }, 'ZU': { icon: '🍹', word: 'Zumo' },
};

export const FIRST_WORDS: WordData[] = [
  { word: 'MAMÁ', icon: '👩', syllables: ['MA', 'MÁ'], audioInstruction: 'Mamá. Ma-má. ¡Mamá!' },
  { word: 'PAPÁ', icon: '👨', syllables: ['PA', 'PÁ'], audioInstruction: 'Papá. Pa-pá. ¡Papá!' },
  { word: 'CASA', icon: '🏠', syllables: ['CA', 'SA'], audioInstruction: 'Casa. Ca-sa. ¡Mi casa!' },
  { word: 'AGUA', icon: '💧', syllables: ['A', 'GUA'], audioInstruction: 'Agua. A-gua. ¡Agua!' },
  { word: 'SOL', icon: '☀️', syllables: ['SOL'], audioInstruction: 'Sol. Sol. ¡El sol!' },
];

const flattenPath = (): MagicCard[] => {
  const path: MagicCard[] = [];
  let colorCounter = 0;

  LEVEL_GROUPS.forEach((group, groupIdx) => {
    group.items.forEach((item) => {
      const pictInfo = PICTOGRAM_DATA[item] || { icon: '✨', word: 'Magia' };
      
      const colorSet = BRIGHT_COLORS[colorCounter % BRIGHT_COLORS.length];
      colorCounter++;

      const isVocal = groupIdx === 0;
      const isPalabra = groupIdx === 1;
      const isSilaba = !isPalabra && item.length > 1;
      
      const description = isPalabra
        ? `La palabra ${pictInfo.word}`
        : `${item} de ${pictInfo.word.toLowerCase()}`;

      const audioInstruction = isPalabra
        ? `Aprendamos la palabra ${item}. ${pictInfo.word}. ¡${pictInfo.word}!`
        : `Aprendamos la ${isSilaba ? 'sílaba' : 'letra'} ${item}. ${item} de ${pictInfo.word}`;

      path.push({
        id: `card-${item}`,
        title: isPalabra ? `Palabra ${item}` : (isSilaba ? `Sílaba ${item}` : `Letra ${item}`),
        value: item,
        type: isPalabra ? 'palabra' : (isVocal ? 'vocal' : (isSilaba ? 'silaba' : 'consonante')),
        color: colorSet.bg,
        highlightColor: '#000000',
        icon: pictInfo.icon,
        pictogramName: pictInfo.word,
        pictogramWord: pictInfo.word,
        monster: '👾',
        description: description,
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
