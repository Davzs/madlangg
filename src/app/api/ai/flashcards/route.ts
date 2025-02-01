import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIService, AIServiceError } from '@/services/ai.service';
import dbConnect from '@/lib/db';
import Flashcard from '@/models/Flashcard';
import FlashcardDeck from '@/models/FlashcardDeck';
import { z } from 'zod';
import { Types } from 'mongoose';

const settingsSchema = z.object({
  languages: z.array(z.enum(['english', 'spanish'])),
  cardsPerDeck: z.number().min(1).max(20),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  includeExamples: z.boolean(),
  topicFocus: z.enum(['general', 'business', 'academic', 'daily-life', 'travel']),
  preventDuplicates: z.boolean(),
  includeContext: z.boolean(),
  characterStyle: z.enum(['simplified', 'traditional', 'both'])
});

const requestSchema = z.object({
  settings: settingsSchema,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { settings } = requestSchema.parse(body);

    // Generate flashcards using AI
    try {
      const flashcardsData = await AIService.generateFlashcards({
        userId: session.user.id,
        settings,
      });

      await dbConnect();

      // Create a new deck
      const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });

      const deck = await FlashcardDeck.create({
        userId: new Types.ObjectId(session.user.id),
        name: `AI Generated Deck (${timestamp})`,
        flashcards: [], // Will be populated after creating flashcards
        metadata: {
          aiGenerated: true,
          aiSettings: {
            languages: settings.languages,
            difficulty: settings.difficulty,
            topicFocus: settings.topicFocus,
            includeExamples: settings.includeExamples,
            preventDuplicates: settings.preventDuplicates,
            includeContext: settings.includeContext,
            characterStyle: settings.characterStyle,
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create flashcards in the deck
      const savedFlashcards = await Promise.all(
        flashcardsData.map(async (card) => {
          const flashcard = await Flashcard.create({
            userId: new Types.ObjectId(session.user.id),
            deckId: deck._id,
            simplified: card.simplified,
            traditional: card.traditional,
            pinyin: card.pinyin,
            translations: card.translations,
            examples: card.examples || [],
            context: card.context,
            metadata: {
              aiGenerated: true,
              characterStyle: settings.characterStyle,
              topicFocus: settings.topicFocus,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          return flashcard;
        })
      );

      // Update deck with flashcard references
      deck.flashcards = savedFlashcards.map(card => card._id);
      await deck.save();

      // Return the complete deck with populated flashcards
      const populatedDeck = await FlashcardDeck.findById(deck._id)
        .populate({
          path: 'flashcards',
          select: 'simplified traditional pinyin translations examples context metadata'
        });

      if (!populatedDeck) {
        throw new Error('Failed to retrieve created deck');
      }

      // Process the response to ensure proper serialization
      const response = {
        _id: populatedDeck._id.toString(),
        name: populatedDeck.name,
        userId: populatedDeck.userId.toString(),
        flashcards: populatedDeck.flashcards.map((card: any) => ({
          _id: card._id.toString(),
          simplified: card.simplified,
          traditional: card.traditional,
          pinyin: card.pinyin,
          translations: card.translations,
          examples: card.examples,
          context: card.context,
          metadata: {
            ...card.metadata,
            createdAt: card.metadata.createdAt.toISOString(),
            updatedAt: card.metadata.updatedAt.toISOString()
          }
        })),
        metadata: {
          ...populatedDeck.metadata,
          createdAt: populatedDeck.metadata.createdAt.toISOString(),
          updatedAt: populatedDeck.metadata.updatedAt.toISOString()
        }
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error('Error in AI flashcards generation:', error);
      
      if (error instanceof AIServiceError) {
        return new NextResponse(
          JSON.stringify({ 
            error: error.message,
            code: error.code,
            details: error.details
          }),
          { status: 500 }
        );
      }

      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to generate flashcards',
          details: error instanceof Error ? error.message : String(error)
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in API route:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Invalid request data',
          errors: error.errors 
        }),
        { status: 400 }
      );
    }
    return new NextResponse(
      JSON.stringify({ 
        message: error instanceof Error ? error.message : 'Failed to generate flashcards' 
      }),
      { status: 500 }
    );
  }
}
