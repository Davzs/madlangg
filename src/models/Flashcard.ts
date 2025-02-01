import mongoose from 'mongoose';

const FlashcardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  deckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FlashcardDeck',
    required: true,
    index: true,
  },
  simplified: {
    type: String,
    required: false,
    index: true,
  },
  traditional: {
    type: String,
    required: false,
    index: true,
  },
  pinyin: {
    type: String,
    required: true,
    index: true,
  },
  translations: {
    english: {
      type: String,
      required: true,
      index: true,
    },
    spanish: {
      type: String,
      required: false,
      index: true,
    },
  },
  examples: [{
    chinese: {
      type: String,
      required: true,
    },
    pinyin: {
      type: String,
      required: true,
    },
    translations: {
      english: {
        type: String,
        required: true,
      },
      spanish: {
        type: String,
        required: false,
      },
    },
  }],
  context: {
    usage: {
      type: String,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  metadata: {
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    characterStyle: {
      type: String,
      enum: ['simplified', 'traditional', 'both'],
      default: 'simplified',
    },
    topicFocus: {
      type: String,
      enum: ['general', 'business', 'academic', 'daily-life', 'travel'],
      default: 'general',
    },
  },
});

// Add compound indices for common queries
FlashcardSchema.index({ userId: 1, deckId: 1 });
FlashcardSchema.index({ userId: 1, simplified: 1 });
FlashcardSchema.index({ userId: 1, traditional: 1 });
FlashcardSchema.index({ userId: 1, pinyin: 1 });
FlashcardSchema.index({ userId: 1, 'translations.english': 1 });
FlashcardSchema.index({ userId: 1, 'translations.spanish': 1 });
FlashcardSchema.index({ userId: 1, 'metadata.topicFocus': 1 });

const Flashcard = mongoose.models.Flashcard || mongoose.model('Flashcard', FlashcardSchema);
export default Flashcard;
