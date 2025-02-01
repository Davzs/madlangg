import mongoose from 'mongoose';

export interface ILesson {
  _id: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'conversation' | 'culture';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  content: {
    introduction: string;
    objectives: string[];
    vocabularyWords?: string[]; // References to Vocabulary model
    grammarPoints?: {
      pattern: string;
      explanation: string;
      examples: {
        chinese: string;
        pinyin: string;
        english: string;
      }[];
    }[];
    exercises: {
      type: 'multiple-choice' | 'fill-in-blank' | 'matching' | 'conversation';
      question: string;
      options?: string[];
      correctAnswer: string;
      explanation: string;
    }[];
    culturalNotes?: string;
  };
  estimatedTime: number; // in minutes
  prerequisites?: string[]; // References to other Lesson IDs
  order: number; // For lesson sequencing
  isActive: boolean;
}

const LessonSchema = new mongoose.Schema<ILesson>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['vocabulary', 'grammar', 'conversation', 'culture'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  xpReward: {
    type: Number,
    default: 20,
  },
  content: {
    introduction: {
      type: String,
      required: true,
    },
    objectives: [{
      type: String,
      required: true,
    }],
    vocabularyWords: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vocabulary',
    }],
    grammarPoints: [{
      pattern: String,
      explanation: String,
      examples: [{
        chinese: String,
        pinyin: String,
        english: String,
      }],
    }],
    exercises: [{
      type: {
        type: String,
        enum: ['multiple-choice', 'fill-in-blank', 'matching', 'conversation'],
        required: true,
      },
      question: {
        type: String,
        required: true,
      },
      options: [String],
      correctAnswer: {
        type: String,
        required: true,
      },
      explanation: {
        type: String,
        required: true,
      },
    }],
    culturalNotes: String,
  },
  estimatedTime: {
    type: Number,
    required: true,
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
  }],
  order: {
    type: Number,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
