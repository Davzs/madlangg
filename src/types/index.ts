import { IVocabulary } from '@/models/Vocabulary';

export type Language = 'english' | 'spanish';

export interface UserSettings {
  preferredLanguage: Language;
  dailyGoal: number;
  notifications: boolean;
}

export interface VocabularyItem extends Omit<IVocabulary, 'userId'> {
  id: string;
}

export interface StudySession {
  date: Date;
  wordsStudied: number;
  correctAnswers: number;
  timeSpent: number;
}

export interface AIResponse {
  translation?: string;
  pronunciation?: string;
  suggestions?: string[];
  error?: string;
}

export type StudyMode = 'flashcards' | 'quiz' | 'writing' | 'speaking';
