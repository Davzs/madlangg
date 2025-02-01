import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/services/ai.service';
import { errorHandler } from '@/middleware/error';

export async function POST(req: NextRequest) {
  return errorHandler(req, async () => {
    const data = await req.json();
    const { audioUrl, expectedPinyin } = data;

    if (!audioUrl || !expectedPinyin) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const feedback = await AIService.analyzePronunciation(audioUrl, expectedPinyin);
    return NextResponse.json(feedback);
  });
}
