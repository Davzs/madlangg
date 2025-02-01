import mongoose from 'mongoose';

const GameProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gameId: {
    type: String,
    required: true,
    enum: ['character-matching', 'pinyin-typing', 'character-writing', 'listening-game', 'sentence-builder'],
  },
  highScore: {
    type: Number,
    default: 0,
  },
  totalXP: {
    type: Number,
    default: 0,
  },
  gamesPlayed: {
    type: Number,
    default: 0,
  },
  lastPlayed: {
    type: Date,
    default: Date.now,
  },
  achievements: [{
    type: String,
    enum: [
      'first-game',
      'high-scorer',
      'practice-master',
      'perfect-match',
      'speed-typer',
      'calligrapher',
      'listener',
      'sentence-master'
    ],
  }],
  stats: {
    correctAnswers: {
      type: Number,
      default: 0,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Index for faster queries
GameProgressSchema.index({ userId: 1, gameId: 1 });

// Virtual for accuracy percentage
GameProgressSchema.virtual('accuracy').get(function() {
  if (this.stats.totalAttempts === 0) return 0;
  return (this.stats.correctAnswers / this.stats.totalAttempts) * 100;
});

// Method to update stats after a game session
GameProgressSchema.methods.updateStats = function(sessionStats: {
  score: number;
  correctAnswers: number;
  totalAttempts: number;
  streak: number;
}) {
  // Update high score if necessary
  if (sessionStats.score > this.highScore) {
    this.highScore = sessionStats.score;
  }

  // Update total XP (assuming 1 point = 1 XP)
  this.totalXP += sessionStats.score;

  // Increment games played
  this.gamesPlayed += 1;

  // Update last played timestamp
  this.lastPlayed = new Date();

  // Update stats
  this.stats.correctAnswers += sessionStats.correctAnswers;
  this.stats.totalAttempts += sessionStats.totalAttempts;
  if (sessionStats.streak > this.stats.longestStreak) {
    this.stats.longestStreak = sessionStats.streak;
  }

  // Update average score
  this.stats.averageScore = (
    (this.stats.averageScore * (this.gamesPlayed - 1) + sessionStats.score) /
    this.gamesPlayed
  );

  // Check and award achievements
  this.checkAchievements();
};

// Method to check and award achievements
GameProgressSchema.methods.checkAchievements = function() {
  const achievements = new Set(this.achievements);

  // First game achievement
  if (this.gamesPlayed === 1) {
    achievements.add('first-game');
  }

  // High scorer achievement (score over 1000)
  if (this.highScore >= 1000) {
    achievements.add('high-scorer');
  }

  // Practice master achievement (played over 50 games)
  if (this.gamesPlayed >= 50) {
    achievements.add('practice-master');
  }

  // Game-specific achievements
  if (this.gameId === 'character-matching' && this.stats.longestStreak >= 10) {
    achievements.add('perfect-match');
  }
  if (this.gameId === 'pinyin-typing' && this.stats.averageScore >= 100) {
    achievements.add('speed-typer');
  }
  if (this.gameId === 'character-writing' && this.gamesPlayed >= 20) {
    achievements.add('calligrapher');
  }
  if (this.gameId === 'listening-game' && this.accuracy >= 90) {
    achievements.add('listener');
  }
  if (this.gameId === 'sentence-builder' && this.stats.longestStreak >= 5) {
    achievements.add('sentence-master');
  }

  this.achievements = Array.from(achievements);
};

export const GameProgress = mongoose.models.GameProgress || 
  mongoose.model('GameProgress', GameProgressSchema);

export type GameProgressType = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  gameId: string;
  highScore: number;
  totalXP: number;
  gamesPlayed: number;
  lastPlayed: Date;
  achievements: string[];
  stats: {
    correctAnswers: number;
    totalAttempts: number;
    longestStreak: number;
    averageScore: number;
  };
  accuracy: number;
  updateStats: (sessionStats: {
    score: number;
    correctAnswers: number;
    totalAttempts: number;
    streak: number;
  }) => void;
  checkAchievements: () => void;
};
