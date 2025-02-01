import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errorHandler } from '@/middleware/error';
import dbConnect from '@/lib/db';
import Flashcard from '@/models/Flashcard';
import FlashcardDeck from '@/models/FlashcardDeck';

export async function DELETE(
  req: NextRequest,
  context: { params: { deckId: string } }
) {
  const { params } = context;
  
  return errorHandler(req, async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    await dbConnect();

    // Find the deck first to ensure it exists and belongs to the user
    const deck = await FlashcardDeck.findOne({
      _id: params.deckId,
      userId: session.user.id
    });

    if (!deck) {
      throw new Error('Deck not found');
    }

    // Delete all flashcards in the deck
    await Flashcard.deleteMany({
      deckId: params.deckId,
      userId: session.user.id
    });

    // Delete the deck itself
    await FlashcardDeck.findByIdAndDelete(params.deckId);

    return NextResponse.json({ message: 'Deck and flashcards deleted successfully' });
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: { deckId: string } }
) {
  const { params } = context;
  
  return errorHandler(req, async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    await dbConnect();

    const data = await req.json();
    const { name } = data;

    if (!name) {
      throw new Error('Name is required');
    }

    const deck = await FlashcardDeck.findOneAndUpdate(
      {
        _id: params.deckId,
        userId: session.user.id
      },
      { $set: { name, 'metadata.updatedAt': new Date() } },
      { new: true }
    );

    if (!deck) {
      throw new Error('Deck not found');
    }

    return NextResponse.json({ deck });
  });
}
