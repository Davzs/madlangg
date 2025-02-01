import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Vocabulary from '@/models/Vocabulary';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const { wordId } = await req.json();

    if (!wordId) {
      return new NextResponse("Word ID is required", { status: 400 });
    }

    // Find the word and verify ownership
    const word = await Vocabulary.findOne({
      _id: wordId,
      userId: session.user.id
    });

    if (!word) {
      return new NextResponse("Word not found", { status: 404 });
    }

    // Update the word's lastReviewed field
    const updatedWord = await Vocabulary.findByIdAndUpdate(
      wordId,
      { 
        lastReviewed: new Date(),
        $inc: { reviewCount: 1 } // Increment review count
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedWord);
  } catch (error) {
    console.error("[VOCABULARY_MARK_REVIEWED]", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}