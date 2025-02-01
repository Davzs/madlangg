import mongoose from 'mongoose';

const FlashcardDeckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  flashcards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard',
  }],
  metadata: {
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    aiSettings: {
      languages: [{
        type: String,
        enum: ['english', 'spanish'],
      }],
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
      },
      topicFocus: {
        type: String,
        enum: ['general', 'business', 'academic', 'daily-life', 'travel'],
      },
      includeExamples: {
        type: Boolean,
      },
      preventDuplicates: {
        type: Boolean,
      },
      includeContext: {
        type: Boolean,
      },
      characterStyle: {
        type: String,
        enum: ['simplified', 'traditional', 'both'],
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
});

// Add compound indices for common queries
FlashcardDeckSchema.index({ userId: 1, name: 1 });
FlashcardDeckSchema.index({ userId: 1, 'metadata.aiGenerated': 1 });
FlashcardDeckSchema.index({ userId: 1, 'metadata.aiSettings.topicFocus': 1 });
FlashcardDeckSchema.index({ userId: 1, 'metadata.aiSettings.difficulty': 1 });

const FlashcardDeck = mongoose.models.FlashcardDeck || mongoose.model('FlashcardDeck', FlashcardDeckSchema);
export default FlashcardDeck;
