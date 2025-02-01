import mongoose from 'mongoose';

export interface ILessonProgress {
  userId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  completedExercises: number;
  totalExercises: number;
  mistakes: {
    exerciseIndex: number;
    userAnswer: string;
    timestamp: Date;
  }[];
  startedAt: Date;
  completedAt?: Date;
  attempts: number;
  timeSpent: number; // in seconds
  xpEarned: number;
}

const LessonProgressSchema = new mongoose.Schema<ILessonProgress>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  completedExercises: {
    type: Number,
    default: 0,
  },
  totalExercises: {
    type: Number,
    required: true,
  },
  mistakes: [{
    exerciseIndex: Number,
    userAnswer: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  attempts: {
    type: Number,
    default: 1,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
  xpEarned: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Create a compound index for userId and lessonId
LessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export default mongoose.models.LessonProgress || mongoose.model<ILessonProgress>('LessonProgress', LessonProgressSchema);
