import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Vocabulary from '@/models/Vocabulary';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all vocabulary words for the user
    const words = await Vocabulary.find({ userId: user._id.toString() })
      .select('word pinyin meaning notes category examples')
      .lean();

    if (!words || words.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Format words for export
    const exportedWords = words.map(word => ({
      word: word.word,
      pinyin: word.pinyin,
      meaning: word.meaning,
      notes: word.notes || '',
      category: word.category || 'General',
      examples: word.examples || []
    }));

    return NextResponse.json(exportedWords, { status: 200 });

  } catch (error) {
    console.error('Export error:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
