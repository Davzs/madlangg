import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Vocabulary from '@/models/Vocabulary';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { words } = await req.json();

    if (!Array.isArray(words)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of words.' },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let updatedCount = 0;

    for (const wordData of words) {
      const { word, pinyin, meaning, notes, category } = wordData;

      // Validate required fields
      if (!word || !pinyin || !meaning) {
        continue; // Skip invalid entries
      }

      try {
        // Check if word already exists for this user
        const existingWord = await Vocabulary.findOne({
          userId: user._id.toString(),
          word: word,
        });

        if (existingWord) {
          // Update existing word
          await Vocabulary.findByIdAndUpdate(existingWord._id, {
            pinyin,
            meaning,
            notes: notes || '',
            category: category || 'General',
            updatedAt: new Date(),
          });
          updatedCount++;
        } else {
          // Create new word
          await Vocabulary.create({
            userId: user._id.toString(),
            word,
            pinyin,
            meaning,
            notes: notes || '',
            category: category || 'General',
            status: 'Learning',
            inFlashcards: false,
            progress: {
              character: { correct: 0, incorrect: 0, streak: 0, lastReviewed: null },
              pinyin: { correct: 0, incorrect: 0, streak: 0, lastReviewed: null },
              meaning: { correct: 0, incorrect: 0, streak: 0, lastReviewed: null },
            },
            mastery: {
              character: 0,
              pinyin: 0,
              meaning: 0,
            },
            confidenceLevel: 0,
            lastReviewDate: new Date(),
            nextReviewDate: new Date(),
            reviewInterval: 1,
            easeFactor: 2.5,
            consecutiveCorrect: 0,
            reviewHistory: [],
          });
          importedCount++;
        }
      } catch (error) {
        console.error('Error processing word:', word, error);
        continue; // Skip failed entries but continue with the rest
      }
    }

    return NextResponse.json({
      message: 'Import completed successfully',
      imported: importedCount,
      updated: updatedCount,
    }, { status: 200 });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import vocabulary' },
      { status: 500 }
    );
  }
}
