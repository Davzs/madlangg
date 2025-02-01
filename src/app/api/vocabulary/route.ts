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
      return new NextResponse("Unauthorized", { status: 401 });
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
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['word', 'pinyin', 'meaning', 'category'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return new NextResponse(`Missing required field: ${field}`, { status: 400 });
      }
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
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Delete all vocabulary words for the current user
    const result = await Vocabulary.deleteMany({ userId: session.user.id });

    if (result.deletedCount === 0) {
      return new NextResponse("No words found to delete", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[VOCABULARY_BULK_DELETE]", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
