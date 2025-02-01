import mongoose, { Model } from 'mongoose';

export interface IVocabulary extends mongoose.Document {
  userId: string;
  word: string;
  pinyin: string;
  meaning: string;
  notes?: string;
  category: string;
  examples: Array<{
    chinese: string;
    pinyin: string;
    english: string;
  }>;
  status: 'Learning' | 'Reviewing' | 'Mastered';
  inFlashcards: boolean;
  lastPracticed?: Date;
  progress?: {
    character: {
      correct: number;
      incorrect: number;
      streak: number;
      lastReviewed: Date | null;
    };
    pinyin: {
      correct: number;
      incorrect: number;
      streak: number;
      lastReviewed: Date | null;
    };
    meaning: {
      correct: number;
      incorrect: number;
      streak: number;
      lastReviewed: Date | null;
    };
  };
  mastery?: {
    character: number;
    pinyin: number;
    meaning: number;
  };
  confidenceLevel: number;
  lastReviewDate: Date;
  nextReviewDate: Date;
  reviewInterval: number;
  easeFactor: number;
  consecutiveCorrect: number;
  reviewHistory: {
    date: Date;
    performance: number;
    interval: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const vocabularySchema = new mongoose.Schema<IVocabulary>(
  {
    userId: { type: String, required: true },
    word: { type: String, required: true },
    pinyin: { type: String, required: true },
    meaning: { type: String, required: true },
    notes: { type: String, default: '' },
    category: { type: String, default: 'General' },
    examples: [{
      chinese: String,
      pinyin: String,
      english: String
    }],
    status: {
      type: String,
      enum: ['Learning', 'Reviewing', 'Mastered'],
      default: 'Learning',
    },
    inFlashcards: { type: Boolean, default: false },
    lastPracticed: { type: Date },
    progress: {
      character: {
        correct: { type: Number, default: 0 },
        incorrect: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        lastReviewed: { type: Date, default: null },
      },
      pinyin: {
        correct: { type: Number, default: 0 },
        incorrect: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        lastReviewed: { type: Date, default: null },
      },
      meaning: {
        correct: { type: Number, default: 0 },
        incorrect: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        lastReviewed: { type: Date, default: null },
      },
    },
    mastery: {
      character: { type: Number, default: 0 },
      pinyin: { type: Number, default: 0 },
      meaning: { type: Number, default: 0 },
    },
    confidenceLevel: { type: Number, default: 0 },
    lastReviewDate: { type: Date, default: Date.now },
    nextReviewDate: { type: Date, default: Date.now },
    reviewInterval: { type: Number, default: 1 },
    easeFactor: { type: Number, default: 2.5 },
    consecutiveCorrect: { type: Number, default: 0 },
    reviewHistory: [{
      date: { type: Date },
      performance: { type: Number },
      interval: { type: Number }
    }],
  },
  {
    timestamps: true,
  }
);

// Create indexes
vocabularySchema.index({ userId: 1, word: 1 }, { unique: true });
vocabularySchema.index({ userId: 1, category: 1 });
vocabularySchema.index({ userId: 1, status: 1 });
vocabularySchema.index({ userId: 1, inFlashcards: 1 });

const Vocabulary = (mongoose.models.Vocabulary as Model<IVocabulary>) || 
  mongoose.model<IVocabulary>('Vocabulary', vocabularySchema);

export default Vocabulary;
