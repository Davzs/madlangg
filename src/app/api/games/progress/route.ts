import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { GameProgress } from '@/lib/models/GameProgress';

// GET /api/games/progress
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const progress = await GameProgress.find({ userId: session.user.id });
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching game progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game progress' },
      { status: 500 }
    );
  }
}

// POST /api/games/progress
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { gameId, sessionStats } = body;

    if (!gameId || !sessionStats) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find or create progress record
    let progress = await GameProgress.findOne({
      userId: session.user.id,
      gameId,
    });

    if (!progress) {
      progress = new GameProgress({
        userId: session.user.id,
        gameId,
      });
    }

    // Update stats
    progress.updateStats(sessionStats);
    await progress.save();

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating game progress:', error);
    return NextResponse.json(
      { error: 'Failed to update game progress' },
      { status: 500 }
    );
  }
}
