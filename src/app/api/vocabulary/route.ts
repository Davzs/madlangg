import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Vocabulary from '@/models/Vocabulary';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all";
    const inFlashcards = searchParams.get("inFlashcards") === "true";
    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    const query = {
      userId: session.user.id,
      ...(search ? {
        $or: [
          { word: { $regex: search, $options: 'i' } },
          { pinyin: { $regex: search, $options: 'i' } },
          { meaning: { $regex: search, $options: 'i' } }
        ]
      } : {}),
      ...(filter !== 'all' ? { status: filter } : {}),
      ...(inFlashcards ? { inFlashcards: true } : {})
    };

    const [words, total] = await Promise.all([
      Vocabulary.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Vocabulary.countDocuments(query)
    ]);

    return NextResponse.json({ words, total });
  } catch (error) {
    console.error("[VOCABULARY_GET]", error);
    return NextResponse.json({ error: 'Failed to fetch vocabulary' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['word', 'pinyin', 'meaning', 'category'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
    }

    // Check if word already exists for this user
    const existingWord = await Vocabulary.findOne({
      userId: session.user.id,
      word: data.word,
    });

    if (existingWord) {
      return NextResponse.json({ error: 'Word already exists in your vocabulary' }, { status: 409 });
    }

    const vocabulary = await Vocabulary.create({
      ...data,
      userId: session.user.id,
      status: 'Learning',
      inFlashcards: false,
      lastPracticed: new Date(),
      progress: {
        character: { correct: 0, incorrect: 0, streak: 0, lastReviewed: null },
        pinyin: { correct: 0, incorrect: 0, streak: 0, lastReviewed: null },
        meaning: { correct: 0, incorrect: 0, streak: 0, lastReviewed: null }
      },
      mastery: {
        character: 0,
        pinyin: 0,
        meaning: 0
      },
      confidenceLevel: 0,
      lastReviewDate: new Date(),
      nextReviewDate: new Date(),
      reviewInterval: 1,
      easeFactor: 2.5,
      consecutiveCorrect: 0,
      reviewHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json(vocabulary);
  } catch (error) {
    console.error("[VOCABULARY_POST]", error);
    return NextResponse.json({ error: 'Failed to add word to vocabulary' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Delete all vocabulary words for the current user
    const result = await Vocabulary.deleteMany({ userId: session.user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'No words found to delete' }, { status: 404 });
    }

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("[VOCABULARY_BULK_DELETE]", error);
    return NextResponse.json({ error: 'Failed to delete vocabulary' }, { status: 500 });
  }
}
