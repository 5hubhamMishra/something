export interface FatherInfo {
  name: string;
  displayName: string;
  birthDate: string;
  birthplace: string;
  profession: string;
  tagline: string;
  traits: TraitEntry[];
  quotes: string[];
}

export interface TraitEntry {
  word: string;
  story: string;
}

export interface TimelineEntry {
  year: string;
  title: string;
  description: string;
  image?: string;
  video?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  image?: string;
  message: string;
  x: number;
  y: number;
  z: number;
}

export interface MemoryEntry {
  id: string;
  title: string;
  date?: string;
  description: string;
  image?: string;
  video?: string;
}

export interface AchievementEntry {
  year: string;
  title: string;
  description: string;
}

export interface LessonEntry {
  word: string;
  quote: string;
  story: string;
}

export interface FutureDream {
  title: string;
  description: string;
}

export interface HiddenMemory {
  id: string;
  chapter: string;
  title: string;
  content: string;
  image?: string;
  audio?: string;
}

export interface DadConsoleEntry {
  category: 'Classic Dad Quote' | 'Dad Advice' | 'Dad Joke' | 'Dad Habit' | 'Family Memory';
  content: string;
}

export interface FunSideOfDad {
  favoritePhrases: string[];
  dadJokes: string[];
  funnyHabits: string[];
  favoriteFood: string;
  favoriteMovie: string;
  favoriteSong: string;
  insideJokes: string[];
  console: DadConsoleEntry[];
}

export interface AudioConfig {
  ambientOpening?: string;
  ambientJourney?: string;
  ambientMemories?: string;
  ambientFamily?: string;
  ambientLegacy?: string;
  ambientFinal?: string;
  voiceRecordings?: { id: string; title: string; src: string }[];
}

export interface SiteConfig {
  father: FatherInfo;
  timeline: TimelineEntry[];
  family: FamilyMember[];
  memories: MemoryEntry[];
  achievements: AchievementEntry[];
  lessons: LessonEntry[];
  futureDreams: FutureDream[];
  hiddenMemories: HiddenMemory[];
  funSide: FunSideOfDad;
  audio: AudioConfig;
  finalMessage: {
    heading: string;
    body: string[];
    closing: string[];
  };
}
