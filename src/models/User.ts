import mongoose from 'mongoose';
import { hash, compare } from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  bio: {
    type: String,
    default: '',
    maxlength: [500, 'Bio cannot be longer than 500 characters'],
  },
  profilePicture: {
    type: String,
    default: '/default-avatar.png',
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
  },
  experience: {
    type: Number,
    default: 0,
    min: 0,
  },
  achievements: [{
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    icon: {
      type: String,
      required: true,
    },
  }],
  preferredLanguage: {
    type: String,
    enum: {
      values: ['english', 'spanish'],
      message: '{VALUE} is not supported',
    },
    default: 'english',
  },
  learningPreferences: {
    dailyGoal: {
      type: Number,
      default: 20,
      min: 5,
      max: 100,
    },
    preferredVoice: {
      type: String,
      enum: ['male', 'female'],
      default: 'female',
    },
    characterType: {
      type: String,
      enum: ['simplified', 'traditional', 'both'],
      default: 'simplified',
    },
    aiAssistance: {
      enabled: {
        type: Boolean,
        default: true,
      },
      feedbackLevel: {
        type: String,
        enum: ['basic', 'detailed', 'expert'],
        default: 'detailed',
      },
    },
  },
  stats: {
    totalCards: {
      type: Number,
      default: 0,
    },
    masteredCards: {
      type: Number,
      default: 0,
    },
    studyStreak: {
      type: Number,
      default: 0,
    },
    lastStudyDate: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    this.password = await hash(this.password, 12);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  try {
    // Need to select password since it's not included by default
    const user = await this.constructor.findById(this._id).select('+password');
    if (!user?.password) return false;
    return await compare(candidatePassword, user.password);
  } catch (error) {
    return false;
  }
};

// Method to update study streak
UserSchema.methods.updateStudyStreak = function() {
  const now = new Date();
  const lastStudy = this.stats.lastStudyDate;
  
  if (!lastStudy) {
    this.stats.studyStreak = 1;
  } else {
    const diffDays = Math.floor((now.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      this.stats.studyStreak += 1;
    } else if (diffDays > 1) {
      this.stats.studyStreak = 1;
    }
  }
  
  this.stats.lastStudyDate = now;
  return this.save();
};

// Define indexes once
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'stats.studyStreak': -1 });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
