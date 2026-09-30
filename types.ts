
export type Section = 'pre-login' | 'login' | 'register' | 'hub' | 'play' | 'profile' | 'info' | 'printable';

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
  lastLogin: string;
  progressIndex: number;
}

export interface MagicCard {
  id: string;
  title: string;
  value: string;
  type: 'vocal' | 'consonante' | 'silaba' | 'palabra';
  color: string;
  highlightColor: string;
  icon: string;
  pictogramName: string;
  pictogramWord: string;
  monster: string;
  description: string;
  audioInstruction: string;
  imageUrl?: string;
}

export interface IslandLevel {
  id: string;
  name: string;
  islandIcon: string;
  cardIds: string[];
}

export interface GameState {
  card: MagicCard;
  step: 'intro' | 'identify' | 'findLetter' | 'wordMatch' | 'success';
  score: number;
}

export interface LearnedItem {
  value: string;
  timesPracticed: number;
  lastPracticed: number;
  nextReview: number;
}

export interface WordData {
  word: string;
  icon: string;
  syllables: string[];
  audioInstruction: string;
  imageUrl?: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  reduceAnimations: boolean;
  autoPlayVoice: boolean;
  speechRate: 'slow' | 'normal';
  sessionStartTime: number;
}

export interface Flashcard {
  id: number;
  word: string;
  image: string;
  category: string;
}

export interface Emotion {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export interface ImageGenerationOptions {
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '2:3' | '3:2' | '21:9';
  imageSize: '1K' | '2K' | '4K';
}

export interface VideoGenerationOptions {
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}
