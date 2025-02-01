import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/db";
import UserProgress from "@/models/UserProgress";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { flashcardId, quality, timeSpent } = await req.json();
    
    await dbConnect();

    // Find existing progress or create new
    let progress = await UserProgress.findOne({
      userId: session.user.id,
      flashcardId,
    });

    if (!progress) {
      progress = new UserProgress({
        userId: session.user.id,
        flashcardId,
      });
    }

    // Update progress using SM2 algorithm
    const { interval, easeFactor } = calculateNextReview(
      quality,
      progress.status.interval,
      progress.status.easeFactor,
      progress.status.repetitions
    );

    progress.status.interval = interval;
    progress.status.easeFactor = easeFactor;
    progress.status.repetitions += 1;
    progress.status.nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
    
    progress.history.push({
      date: new Date(),
      quality,
      timeSpent,
    });

    progress.lastReviewed = new Date();
    progress.mastered = quality >= 4 && progress.status.repetitions >= 3;

    await progress.save();

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json(
      { error: "Error updating progress" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const flashcardId = searchParams.get("flashcardId");

    await dbConnect();

    const query = { userId: session.user.id };
    if (flashcardId) {
      query.flashcardId = flashcardId;
    }

    const progress = await UserProgress.find(query)
      .populate("flashcardId")
      .sort({ lastReviewed: -1 });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Progress fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching progress" },
      { status: 500 }
    );
  }
}

// SM2 algorithm implementation
function calculateNextReview(
  quality: number,
  previousInterval: number,
  previousEaseFactor: number,
  repetitions: number
) {
  let interval: number;
  let easeFactor = previousEaseFactor;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(previousInterval * previousEaseFactor);
    }

    // Update ease factor
    easeFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    // Reset interval on failure
    interval = 1;
    repetitions = 0;
    easeFactor = Math.max(1.3, previousEaseFactor - 0.2);
  }

  // Ensure reasonable bounds
  easeFactor = Math.max(1.3, Math.min(2.5, easeFactor));
  interval = Math.min(interval, 365); // Cap at 1 year

  return { interval, easeFactor };
}
