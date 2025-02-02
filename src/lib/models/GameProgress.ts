import mongoose, { Document, Model } from 'mongoose';

export interface IGameProgress extends Document {
  userId: string;
  gameId: string;
  score: number;
  completedAt: Date;
  stats: {
    correctAnswers: number;
    totalAttempts: number;
    streak: number;
    accuracy: number;
  };
}

const GameProgressSchema = new mongoose.Schema<IGameProgress>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  gameId: {
    type: String,
    required: true,
    enum: ['character-matching', 'pinyin-typing', 'character-writing', 'listening-game', 'sentence-builder'],
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  completedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  stats: {
    correctAnswers: {
      type: Number,
      default: 0,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Add indexes for better query performance
GameProgressSchema.index({ userId: 1, gameId: 1 });
GameProgressSchema.index({ completedAt: -1 });

export const GameProgress: Model<IGameProgress> = mongoose.models.GameProgress || 
  mongoose.model<IGameProgress>('GameProgress', GameProgressSchema);
