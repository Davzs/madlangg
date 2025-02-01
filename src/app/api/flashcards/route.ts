import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Flashcard from "@/models/Flashcard";
import FlashcardDeck from "@/models/FlashcardDeck";
import { Types } from "mongoose";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get all decks for the user with populated flashcards
    const decks = await FlashcardDeck.find({ 
      userId: new Types.ObjectId(session.user.id) 
    })
    .sort({ 'metadata.createdAt': -1 })
    .lean();

    // Get flashcards for each deck with proper population
    const decksWithCards = await Promise.all(
      decks.map(async (deck) => {
        let flashcards = await Flashcard.find({ 
          userId: new Types.ObjectId(session.user.id),
          deckId: deck._id 
        })
        .select({
          simplified: 1,
          traditional: 1,
          pinyin: 1,
          translations: 1,
          examples: 1,
          metadata: 1,
          userId: 1,
          deckId: 1
        })
        .lean();

        // Convert ObjectIds to strings and format dates
        const processedDeck = {
          ...deck,
          _id: deck._id.toString(),
          userId: deck.userId.toString(),
          flashcards: flashcards.map(card => ({
            ...card,
            _id: card._id.toString(),
            userId: card.userId.toString(),
            deckId: card.deckId.toString(),
            metadata: {
              ...card.metadata,
              createdAt: card.metadata.createdAt.toISOString(),
              updatedAt: card.metadata.updatedAt.toISOString()
            }
          })),
          metadata: {
            ...deck.metadata,
            createdAt: deck.metadata.createdAt.toISOString(),
            updatedAt: deck.metadata.updatedAt.toISOString()
          }
        };

        return processedDeck;
      })
    );

    return NextResponse.json({ decks: decksWithCards });
  } catch (error) {
    console.error('Error in GET /api/flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to load flashcard decks' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    await dbConnect();

    const deck = await FlashcardDeck.create({
      name,
      userId: new Types.ObjectId(session.user.id),
      flashcards: [],
      metadata: {
        aiGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      deck: {
        ...deck.toObject(),
        _id: deck._id.toString(),
        userId: deck.userId.toString(),
        metadata: {
          ...deck.metadata,
          createdAt: deck.metadata.createdAt.toISOString(),
          updatedAt: deck.metadata.updatedAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error in POST /api/flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to create flashcard deck' },
      { status: 500 }
    );
  }
}
