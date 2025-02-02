import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to detect Chinese characters
const hasChinese = (text: string): boolean => {
  return /[\u4e00-\u9fff]/.test(text);
};

// Function to convert numbered pinyin to tone marks
const convertPinyinToTones = (pinyin: string): string => {
  const toneMarks: { [key: string]: { [key: string]: string } } = {
    a: { '1': 'ā', '2': 'á', '3': 'ǎ', '4': 'à' },
    e: { '1': 'ē', '2': 'é', '3': 'ě', '4': 'è' },
    i: { '1': 'ī', '2': 'í', '3': 'ǐ', '4': 'ì' },
    o: { '1': 'ō', '2': 'ó', '3': 'ǒ', '4': 'ò' },
    u: { '1': 'ū', '2': 'ú', '3': 'ǔ', '4': 'ù' },
    ü: { '1': 'ǖ', '2': 'ǘ', '3': 'ǚ', '4': 'ǜ' },
  };

  return pinyin
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (!word) return word;
      const tone = word.match(/[1-4]$/)?.[0];
      if (!tone) return word;

      word = word.replace(/v/g, 'ü').replace(/\d$/, '');
      const vowels = word.match(/[aeiouü]/g);
      if (!vowels) return word;

      // Find the vowel to modify based on priority
      let vowelToChange = vowels.find(v => v === 'a') ||
                         vowels.find(v => v === 'e') ||
                         vowels.find(v => v === 'o') ||
                         vowels[vowels.length - 1];

      return word.replace(
        vowelToChange,
        toneMarks[vowelToChange][tone] || vowelToChange
      );
    })
    .join(' ');
};

// Function to format the AI response
const formatAIResponse = (text: string): string => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  let formattedResponse = '';
  let currentBlock: string[] = [];
  let isChineseBlock = false;

  for (const line of lines) {
    // Start of a new Chinese block
    if (hasChinese(line) && !isChineseBlock) {
      if (currentBlock.length > 0) {
        formattedResponse += currentBlock.join('\n') + '\n\n';
        currentBlock = [];
      }
      currentBlock.push(line);
      isChineseBlock = true;
      continue;
    }

    // Handle pinyin line (contains numbers 1-4)
    if (isChineseBlock && line.match(/[a-z]+[1-4]/i)) {
      currentBlock.push(convertPinyinToTones(line));
      continue;
    }

    // Handle English translation or explanation
    if (isChineseBlock && currentBlock.length >= 1) {
      currentBlock.push(line);
      if (currentBlock.length >= 3) {
        formattedResponse += currentBlock.join('\n') + '\n\n';
        currentBlock = [];
        isChineseBlock = false;
      }
      continue;
    }

    // Regular text
    if (!isChineseBlock) {
      currentBlock.push(line);
    }
  }

  // Add any remaining block
  if (currentBlock.length > 0) {
    formattedResponse += currentBlock.join('\n');
  }

  return formattedResponse.trim();
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, messages = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemMessage = {
      role: 'system',
      content: `You are a helpful Mandarin Chinese language learning assistant. Follow these rules strictly:

1. When responding with Chinese words/phrases:
   - First line: Chinese characters only
   - Second line: Pinyin with tone numbers (1-4)
   - Third line: English translation
   - Optional fourth line: Usage examples or explanations

2. Format your responses consistently:
   - Put each Chinese word/phrase in its own block
   - Always include tone numbers in pinyin
   - Keep translations concise and accurate
   - Add usage examples when helpful

3. Response structure:
   - For Chinese input: Provide corrections if needed, explain errors
   - For English input: Give relevant Chinese vocabulary and examples
   - Always maintain clear separation between different words/phrases

4. Special cases:
   - For greetings/common phrases: Include cultural context
   - For grammar points: Provide clear explanations with examples
   - For corrections: Clearly show the correct form and explain why

Example format:
你好
ni3 hao3
hello

学习
xue2 xi2
to study, to learn

Remember to always use tone numbers (1-4) in pinyin, which will be automatically converted to tone marks.`
    };

    const chatMessages = [
      systemMessage,
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        return NextResponse.json(
          { error: 'No response from AI' },
          { status: 500 }
        );
      }

      const formattedResponse = formatAIResponse(aiResponse);
      const containsChinese = hasChinese(formattedResponse);

      return NextResponse.json({
        rawResponse: formattedResponse,
        hasChinese: containsChinese,
        speaker: containsChinese ? 'Native Speaker' : undefined,
        audioOptions: {
          speeds: ['normal', 'slow'],
          available: containsChinese
        }
      });
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: error?.message || 'Failed to get AI response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in chat POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
