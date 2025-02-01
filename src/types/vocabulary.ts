export type ProficiencyLevel = 'New' | 'In Progress' | 'Mastered';
export type WordCategory = 'General' | 'Greetings' | 'Food' | 'Numbers' | 'Time' | 'Family' | 'Business' | 'Travel' | 'Academic';

export interface Example {
  chinese: string;
  pinyin: string;
  english: string;
}

export interface VocabularyWord {
  _id: string;
  userId: string;
  word: string;
  pinyin: string;
  meaning: string;
  category: WordCategory;
  dateAdded: string;
  progressStatus: ProficiencyLevel;
  lastReviewed?: string;
  examples?: Example[];
  mastery?: {
    character: number;
    pinyin: number;
    meaning: number;
  };
}

export interface VocabularyList {
  id: string;
  name: string;
  description: string;
  category: WordCategory;
  level: ProficiencyLevel;
  words: VocabularyWord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AddVocabularyRequest {
  word: string;
  pinyin: string;
  meaning: string;
  category?: string;
  examples?: Example[];
}
