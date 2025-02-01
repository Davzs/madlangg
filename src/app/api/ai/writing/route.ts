import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/services/ai.service';
import { errorHandler } from '@/middleware/error';

export async function POST(req: NextRequest) {
  return errorHandler(req, async () => {
    const data = await req.json();
    const { characterImage, expectedCharacter } = data;

    if (!characterImage || !expectedCharacter) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const feedback = await AIService.getWritingFeedback(characterImage, expectedCharacter);
    return NextResponse.json(feedback);
  });
}
