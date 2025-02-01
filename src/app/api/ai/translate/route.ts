import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a Chinese language expert. Your task is to provide accurate translations and pinyin for Chinese words.
Always respond with a JSON object containing:
- pinyin: with tone marks
- meaning: clear English translation

Example for "你好":
{
  "pinyin": "nǐ hǎo",
  "meaning": "hello"
}

Keep translations accurate and concise.`;

export async function POST(req: Request) {
  try {
    const { word } = await req.json();

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Translate: ${word}` }
      ],
      temperature: 0.3,
      max_tokens: 100
    });

    const response = completion.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(response || '{}');
      return NextResponse.json(parsed);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate' },
      { status: 500 }
    );
  }
}
