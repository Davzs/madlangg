import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Conversation, IConversation } from '@/models/conversation';

// List conversations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const conversations = await Conversation.find({
      userId: session.user.id,
    }).sort({ updatedAt: -1 });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error in GET conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// Create conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, messages } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const conversation = await Conversation.create({
      userId: session.user.id,
      title,
      messages: messages || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error in POST conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
