import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Vocabulary from '@/models/Vocabulary';
import Flashcard from '@/models/Flashcard';
import { Types } from 'mongoose';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wordId } = await req.json();
    if (!wordId) {
      return NextResponse.json({ error: 'Missing word ID' }, { status: 400 });
    }

    // Validate wordId format
    if (!Types.ObjectId.isValid(wordId)) {
      return NextResponse.json({ error: 'Invalid word ID format' }, { status: 400 });
    }

    // Connect to MongoDB using mongoose
    await dbConnect();

    // Find and update the word
    const word = await Vocabulary.findOne({
      _id: wordId,
      userId: session.user.id,
    }).lean();

    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    console.log('Found word:', word);

    // Validate required fields
    if (!word.word || !word.pinyin || !word.meaning) {
      return NextResponse.json({ 
        error: 'Word is missing required fields',
        word: word 
      }, { status: 400 });
    }

    // Update inFlashcards status in vocabulary
    await Vocabulary.updateOne(
      { _id: wordId, userId: session.user.id },
      { $set: { inFlashcards: !word.inFlashcards } }
    );

    if (!word.inFlashcards) { // If it was false, we're adding it
      try {
        // Check if flashcard already exists
        const existingFlashcard = await Flashcard.findOne({
          userId: session.user.id,
          simplified: word.word,
        }).lean();

        console.log('Existing flashcard:', existingFlashcard);

        if (!existingFlashcard) {
          // Create a new flashcard
          const flashcardData = {
            userId: new Types.ObjectId(session.user.id),
            simplified: word.word,
            traditional: word.word, // Using the same as simplified since we don't have traditional
            pinyin: word.pinyin,
            translations: {
              english: word.meaning,
              spanish: word.meaning, // Using English meaning as Spanish since we don't have Spanish
            },
            category: word.category || 'Vocabulary',
            examples: [], // Can be populated later
          };

          console.log('Creating flashcard with data:', flashcardData);

          const flashcard = new Flashcard(flashcardData);
          await flashcard.save();
          
          console.log('Flashcard created successfully:', flashcard);
        }
      } catch (flashcardError) {
        console.error('Error creating flashcard:', flashcardError);
        return NextResponse.json({ 
          error: 'Failed to create flashcard',
          details: flashcardError instanceof Error ? flashcardError.message : 'Unknown error',
          word: word
        }, { status: 500 });
      }
    } else {
      try {
        // Remove the flashcard
        const result = await Flashcard.deleteOne({
          userId: session.user.id,
          simplified: word.word,
        });
        console.log('Delete result:', result);
      } catch (deleteError) {
        console.error('Error deleting flashcard:', deleteError);
        return NextResponse.json({ 
          error: 'Failed to delete flashcard',
          details: deleteError instanceof Error ? deleteError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      inFlashcards: !word.inFlashcards
    });
  } catch (error) {
    console.error('Error toggling flashcard status:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
