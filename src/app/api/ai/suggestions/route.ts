import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/services/ai.service';
import { errorHandler } from '@/middleware/error';
import { AppError } from '@/middleware/error';

const SYSTEM_PROMPT = `You are a helpful Mandarin Chinese language tutor. When responding:

1. If the user asks about a Chinese word or phrase:
   - Always provide the response in this format: [Chinese characters] (pinyin) - [English meaning]
   - Example: "苹果 (píng guǒ) - apple"
   - Include tone marks in pinyin
   - Keep explanations brief and clear

2. For questions about Chinese language:
   - Provide clear, concise explanations
   - Use examples when helpful
   - Format any Chinese words as shown above

3. Always maintain a friendly, encouraging tone.

Remember: Every Chinese word or phrase MUST be formatted as: [Chinese] (pinyin) - [English]`;

export async function POST(req: NextRequest) {
  return errorHandler(req, async () => {
    try {
      const { message } = await req.json();
      
      if (!message) {
        throw new AppError(400, 'Message is required');
      }

      const response = await AIService.chat(message, SYSTEM_PROMPT);
      
      if (!response) {
        throw new AppError(500, 'No response received from AI service');
      }

      return NextResponse.json({ response });
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'Failed to process chat request');
    }
  });
}
