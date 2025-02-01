import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import UserProgress from "@/models/UserProgress";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const { flashcardId, quality } = await req.json();

    if (!flashcardId || quality === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (quality < 0 || quality > 5) {
      return new NextResponse("Quality must be between 0 and 5", { status: 400 });
    }

    // Find or create progress record
    let progress = await UserProgress.findOne({
      userId: session.user.id,
      flashcardId
    });

    if (!progress) {
      progress = new UserProgress({
        userId: session.user.id,
        flashcardId,
        status: {
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReview: new Date()
        },
        history: []
      });
    }

    // Add to history
    progress.history.push({
      date: new Date(),
      quality,
      timeSpent: 0 // Could be tracked in the frontend if needed
    });

    // Update spaced repetition parameters using SM-2 algorithm
    const { easeFactor, interval, repetitions } = progress.status;
    let newEaseFactor = easeFactor;
    let newInterval = interval;
    let newRepetitions = repetitions;

    if (quality >= 3) {
      // Successful recall
      if (newRepetitions === 0) {
        newInterval = 1;
      } else if (newRepetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(newInterval * easeFactor);
      }
      newRepetitions++;
    } else {
      // Failed recall
      newRepetitions = 0;
      newInterval = 1;
    }

    // Update ease factor
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < 1.3) newEaseFactor = 1.3;

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    // Update progress
    progress.status = {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReview
    };

    await progress.save();

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[FLASHCARD_PROGRESS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
