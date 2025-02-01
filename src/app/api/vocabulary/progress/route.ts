import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { wordId, correct, reviewType } = await req.json();
    if (!wordId || typeof correct !== 'boolean' || !reviewType) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const { db } = await connectToDatabase();
    const vocabularyCollection = db.collection('vocabulary');

    // Get the current word
    const word = await vocabularyCollection.findOne({
      _id: new ObjectId(wordId),
      userId: session.user.id,
    });

    if (!word) {
      return new NextResponse('Word not found', { status: 404 });
    }

    // Initialize or update progress tracking
    const progress = word.progress || {
      character: { correct: 0, incorrect: 0, streak: 0, lastReviewed: null },
      pinyin: { correct: 0, incorrect: 0, streak: 0, lastReviewed: null },
      meaning: { correct: 0, incorrect: 0, streak: 0, lastReviewed: null },
    };

    // Update the specific review type's progress
    const typeProgress = progress[reviewType];
    if (correct) {
      typeProgress.correct++;
      typeProgress.streak++;
    } else {
      typeProgress.incorrect++;
      typeProgress.streak = 0;
    }
    typeProgress.lastReviewed = new Date();

    // Calculate mastery level based on correct answers and streak
    const totalAttempts = typeProgress.correct + typeProgress.incorrect;
    const accuracy = typeProgress.correct / totalAttempts;
    const mastery = Math.min(
      Math.floor((accuracy * 100 + typeProgress.streak * 10) / 20), 
      5
    );

    // Update word status if all review types have high mastery
    let status = word.status;
    if (
      Object.values(progress).every(p => 
        p.correct / (p.correct + p.incorrect) > 0.8 && p.streak >= 3
      )
    ) {
      status = 'Mastered';
    } else if (
      Object.values(progress).every(p => 
        p.correct / (p.correct + p.incorrect) > 0.6 && p.streak >= 2
      )
    ) {
      status = 'Familiar';
    }

    // Update the word in the database
    await vocabularyCollection.updateOne(
      { _id: new ObjectId(wordId) },
      {
        $set: {
          progress,
          status,
          lastReviewed: new Date(),
          [`mastery.${reviewType}`]: mastery,
        },
      }
    );

    return NextResponse.json({ success: true, progress, status, mastery });
  } catch (error) {
    console.error('Error updating vocabulary progress:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
