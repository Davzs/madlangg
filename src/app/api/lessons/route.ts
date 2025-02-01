import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Lesson from '@/models/Lesson';
import LessonProgress from '@/models/LessonProgress';
import User from '@/models/User';
import mongoose from 'mongoose';
import { STATIC_LESSONS } from '@/data/static-lessons';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const difficulty = url.searchParams.get('difficulty');
    const status = url.searchParams.get('status');

    // Filter lessons based on status if needed
    let lessons = STATIC_LESSONS;
    if (status === 'not_started') {
      // In a real app, we would check the user's progress
      // For now, just return all lessons since they're always available
      lessons = STATIC_LESSONS;
    }

    // Filter by type and difficulty if requested
    if (type) lessons = lessons.filter(lesson => lesson.type === type);
    if (difficulty) lessons = lessons.filter(lesson => lesson.difficulty === difficulty);

    return NextResponse.json({ lessons });
  } catch (error: any) {
    console.error('Lessons fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    await dbConnect();
    
    // Get the highest order number
    const highestOrder = await Lesson.findOne({})
      .sort('-order')
      .select('order')
      .lean();
    
    const newOrder = (highestOrder?.order || 0) + 1;
    
    const lesson = new Lesson({
      ...data,
      order: newOrder,
    });
    
    await lesson.save();

    return NextResponse.json({ lesson });
  } catch (error: any) {
    console.error('Lesson creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
