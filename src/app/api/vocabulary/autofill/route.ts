import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { word, pinyin, meaning, field } = await req.json();

    // Check if we have at least one field to work with
    if (!word && !pinyin && !meaning && field !== 'all') {
      return new NextResponse("At least one of word, pinyin, or meaning is required", { status: 400 });
    }

    let prompt = '';
    if (field === 'all') {
      const knownInfo = [
        word ? `Chinese word: "${word}"` : '',
        pinyin ? `pinyin: "${pinyin}"` : '',
        meaning ? `meaning: "${meaning}"` : '',
      ].filter(Boolean).join(', ');

      prompt = `Based on the following information: ${knownInfo || 'no information provided'}, generate a complete vocabulary entry.
If any of the following are missing, generate them:
1. Chinese characters
2. Pinyin with tone marks
3. English meaning/translation
4. Most appropriate category from: General, Food, Travel, Business, Technology, Education, Family, Health, Hobbies, Nature
5. Two practical example sentences that clearly demonstrate the word usage

You must respond with a valid JSON object in exactly this format:
{
  "word": "Chinese characters",
  "pinyin": "Pinyin with tone marks",
  "meaning": "English translation",
  "category": "Category name",
  "examples": [
    {
      "chinese": "Short, clear example in Chinese",
      "pinyin": "Pinyin with tone marks",
      "english": "English translation"
    },
    {
      "chinese": "Another short, practical example",
      "pinyin": "Pinyin with tone marks",
      "english": "English translation"
    }
  ]
}

Make sure the examples are:
1. Short but complete sentences
2. Practical and commonly used
3. Clearly demonstrate the word usage
4. Include proper grammar and natural expressions

Respond only with the JSON object, no other text.`;
    } else {
      const knownInfo = [
        word ? `Chinese word: "${word}"` : '',
        pinyin ? `pinyin: "${pinyin}"` : '',
        meaning ? `meaning: "${meaning}"` : '',
      ].filter(Boolean).join(', ');

      const fieldPrompts: { [key: string]: string } = {
        word: `Based on ${knownInfo}, provide the correct Chinese character(s). Respond only with a JSON object in this exact format: {"word": "characters"}`,
        pinyin: `Based on ${knownInfo}, provide the correct pinyin with tone marks. Respond only with a JSON object in this exact format: {"pinyin": "pinyin"}`,
        meaning: `Based on ${knownInfo}, provide the accurate English translation. Respond only with a JSON object in this exact format: {"meaning": "translation"}`,
        category: `Based on ${knownInfo}, suggest the most appropriate category from: General, Food, Travel, Business, Technology, Education, Family, Health, Hobbies, Nature. Respond only with a JSON object in this exact format: {"category": "category"}`,
        examples: `Based on ${knownInfo}, generate two practical example sentences. Respond only with a JSON object in this exact format:
{
  "examples": [
    {
      "chinese": "Short, clear example in Chinese",
      "pinyin": "Pinyin with tone marks",
      "english": "English translation"
    },
    {
      "chinese": "Another short, practical example",
      "pinyin": "Pinyin with tone marks",
      "english": "English translation"
    }
  ]
}`
      };
      prompt = fieldPrompts[field] || '';
    }

    if (!prompt) {
      return new NextResponse("Invalid field specified", { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a Chinese language expert. Always respond with valid JSON objects that match the exact format requested. Use standard Mandarin Chinese characters and proper pinyin with tone marks. Never include any text outside of the JSON object."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error("No response from OpenAI");
    }

    try {
      const parsedResult = JSON.parse(result);
      return NextResponse.json(parsedResult);
    } catch (parseError) {
      console.error("[JSON_PARSE_ERROR]", result);
      throw new Error("Failed to parse OpenAI response as JSON");
    }
  } catch (error) {
    console.error("[AUTOFILL_ERROR]", error);
    return new NextResponse(error instanceof Error ? error.message : "Internal server error", { status: 500 });
  }
}
