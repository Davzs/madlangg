import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { STATIC_LESSONS } from '@/data/static-lessons';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await req.json();
    const { lessonId, exerciseIndex, answer, timeSpent } = data;

    // Find the lesson from static lessons
    const lesson = STATIC_LESSONS.find(l => l._id === lessonId);
    if (!lesson) {
      return new NextResponse(JSON.stringify({ error: 'Lesson not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const exercise = lesson.content.exercises[exerciseIndex];
    const isCorrect = exercise.correctAnswer === answer;

    // Calculate XP
    let xpEarned = isCorrect ? 20 : 0; // Base XP for correct answer

    // Bonus XP for quick answers (if answered within 30 seconds)
    if (isCorrect && timeSpent <= 30) {
      xpEarned += 5;
    }

    // Update user's experience
    if (xpEarned > 0) {
      user.experience = (user.experience || 0) + xpEarned;
      
      // Calculate new level (1 level per 100 XP)
      const newLevel = Math.floor(user.experience / 100) + 1;
      if (newLevel > (user.level || 1)) {
        user.level = newLevel;
      }
      
      await user.save();
    }

    // Return the result
    return new NextResponse(JSON.stringify({
      exercise: {
        isCorrect,
        explanation: exercise.explanation
      },
      progress: {
        xpEarned,
        newExperience: user.experience,
        newLevel: user.level
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
