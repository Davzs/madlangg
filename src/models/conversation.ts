import mongoose, { Schema, Document, Model } from 'mongoose';

interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasChinese?: boolean;
  speaker?: string;
}

export interface IConversation extends Document {
  userId: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  role: { type: String, required: true, enum: ['user', 'assistant'] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  hasChinese: { type: Boolean },
  speaker: { type: String }
});

const conversationSchema = new Schema<IConversation>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
conversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Delete mongoose.models.Conversation if it exists to prevent OverwriteModelError
const Conversation = (mongoose.models.Conversation as Model<IConversation>) || 
                    mongoose.model<IConversation>('Conversation', conversationSchema);

export { Conversation };
export type { IMessage };
