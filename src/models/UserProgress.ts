import mongoose from 'mongoose';

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  flashcardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard',
    required: true,
    index: true,
  },
  status: {
    easeFactor: {
      type: Number,
      default: 2.5, // SM2 algorithm default ease factor
      min: 1.3,
      max: 5.0,
    },
    interval: {
      type: Number,
      default: 0,
      min: 0,
    },
    repetitions: {
      type: Number,
      default: 0,
      min: 0,
    },
    nextReview: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  history: [{
    date: {
      type: Date,
      default: Date.now,
    },
    quality: {
      type: Number,
      min: 0,
      max: 5,
      required: true,
    },
    timeSpent: {
      type: Number,
      min: 0,
      required: true,
    }, // in seconds
    mistakes: {
      type: [{
        type: String,
        enum: ['pronunciation', 'meaning', 'character_writing', 'tone'],
      }],
      default: [],
    },
  }],
  aiFeedback: [{
    type: {
      type: String,
      enum: ['pronunciation', 'writing', 'usage'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  mastery: {
    overall: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    pronunciation: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    writing: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    recognition: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  lastReviewed: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound indexes for better query performance
UserProgressSchema.index({ userId: 1, flashcardId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, 'status.nextReview': 1 });
UserProgressSchema.index({ userId: 1, 'mastery.overall': -1 });

// Virtual for time until next review
UserProgressSchema.virtual('timeUntilReview').get(function() {
  return this.status.nextReview.getTime() - Date.now();
});

// Method to update mastery scores based on history
UserProgressSchema.methods.updateMasteryScores = function() {
  const recentHistory = this.history.slice(-5); // Consider last 5 reviews
  
  if (recentHistory.length === 0) return;

  // Calculate average scores
  const avgQuality = recentHistory.reduce((sum, h) => sum + h.quality, 0) / recentHistory.length;
  
  // Update mastery scores
  this.mastery.overall = Math.min(100, (avgQuality / 5) * 100);
  
  // Update specific mastery areas based on mistakes
  const mistakes = recentHistory.flatMap(h => h.mistakes);
  const mistakeCount = {
    pronunciation: mistakes.filter(m => m === 'pronunciation').length,
    writing: mistakes.filter(m => m === 'character_writing').length,
    tone: mistakes.filter(m => m === 'tone').length,
  };
  
  this.mastery.pronunciation = Math.min(100, 100 - (mistakeCount.pronunciation + mistakeCount.tone) * 20);
  this.mastery.writing = Math.min(100, 100 - mistakeCount.writing * 20);
  
  return this.save();
};

export default mongoose.models.UserProgress || mongoose.model('UserProgress', UserProgressSchema);
