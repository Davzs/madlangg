import OpenAI from 'openai';
import { env } from '@/lib/config';
import { AIServiceError } from '@/lib/exceptions';
import { withRetry } from '@/lib/retry';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export interface AIFeedback {
  type: 'pronunciation' | 'writing' | 'usage';
  content: string;
  confidence: number;
}

export interface AIFlashcard {
  simplified: string;
  pinyin: string;
  translations: {
    english: string;
    spanish?: string;
  };
  examples?: Array<{
    chinese: string;
    pinyin: string;
    translations: {
      english: string;
      spanish?: string;
    };
  }>;
  traditional?: string;
  context?: {
    usage: string;
    notes: string;
  };
}

export interface GenerateFlashcardsOptions {
  userId: string;
  settings: {
    languages: ('english' | 'spanish')[];
    cardsPerDeck: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    includeExamples: boolean;
    topicFocus: 'general' | 'business' | 'academic' | 'daily-life' | 'travel';
    preventDuplicates: boolean;
    includeContext: boolean;
    characterStyle: 'simplified' | 'traditional' | 'both';
  };
}

export class AIService {
  private static async makeOpenAIRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    return withRetry(
      requestFn,
      {
        maxRetries,
        shouldRetry: (error) => {
          return error instanceof Error && error.message.includes('rate limit');
        },
        onRetry: (error, attempt) => {
          console.warn(`Retry attempt ${attempt} due to error:`, error);
        }
      }
    );
  }

  static async generateFlashcards(options: GenerateFlashcardsOptions): Promise<AIFlashcard[]> {
    const {
      settings: {
        languages,
        cardsPerDeck,
        difficulty,
        includeExamples,
        topicFocus,
        preventDuplicates,
        includeContext,
        characterStyle
      }
    } = options;

    const difficultyDescriptions = {
      beginner: "common, everyday words suitable for beginners",
      intermediate: "moderately complex words for intermediate learners",
      advanced: "advanced vocabulary for experienced learners"
    };

    const topicDescriptions = {
      general: "general vocabulary for everyday use",
      business: "business and professional settings",
      academic: "academic and educational contexts",
      'daily-life': "daily life activities and situations",
      travel: "travel and tourism related vocabulary"
    };

    const rules = [
      `1. Generate exactly ${cardsPerDeck} words`,
      `2. Difficulty level: ${difficulty} (${difficultyDescriptions[difficulty]})`,
      `3. Topic focus: ${topicFocus} (${topicDescriptions[topicFocus]})`,
      '4. Include tone marks in all pinyin',
      preventDuplicates ? '5. Ensure all words are unique and not commonly found in other decks' : null,
      characterStyle === 'both' ? '6. Include both simplified and traditional characters for each word' : `6. Use only ${characterStyle} characters`,
      includeContext ? '7. Provide relevant usage context and cultural notes when applicable' : null
    ].filter(Boolean);

    const cardStructure = `{
  ${characterStyle === 'both' ? 
    `"simplified": "Chinese character in simplified form",
    "traditional": "Chinese character in traditional form",` :
    `"${characterStyle}": "Chinese character in ${characterStyle} form",`
  }
  "pinyin": "Pinyin with tone marks",
  "translations": {
    ${languages.includes('english') ? '"english": "English translation",' : ''}
    ${languages.includes('spanish') ? '"spanish": "Spanish translation"' : ''}
  }${includeExamples || includeContext ? `,
  "examples": [{
    "chinese": "Example sentence in Chinese",
    "pinyin": "Pinyin for the example",
    "translations": {
      ${languages.includes('english') ? '"english": "English translation of example",' : ''}
      ${languages.includes('spanish') ? '"spanish": "Spanish translation of example"' : ''}
    }
  }]${includeContext ? `,
  "context": {
    "usage": "Brief explanation of when and how to use this word",
    "notes": "Additional cultural or linguistic notes if relevant"
  }` : ''}` : ''}
}`;

    const prompt = `You are a Mandarin Chinese language tutor. Generate ${cardsPerDeck} unique ${difficultyDescriptions[difficulty]} focused on ${topicDescriptions[topicFocus]}.

Return a JSON object with a 'flashcards' array containing exactly ${cardsPerDeck} objects. Each object must follow this structure:
${cardStructure}

Important rules:
${rules.join('\n')}`;

    return this.makeOpenAIRequest(
      async () => {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a helpful Mandarin Chinese language tutor. Always respond with valid JSON.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
          });

          const responseContent = completion.choices[0].message.content;
          if (!responseContent) {
            throw new AIServiceError(
              'No response from AI service',
              'EMPTY_RESPONSE'
            );
          }

          // Clean up the response content by removing markdown code blocks if present
          const cleanedContent = responseContent.replace(/^```json\n|\n```$/g, '').trim();

          let parsedContent: any;
          try {
            parsedContent = JSON.parse(cleanedContent);
          } catch (e) {
            console.error('Failed to parse AI response. Content:', cleanedContent);
            console.error('Parse error:', e);
            throw new AIServiceError(
              'Invalid JSON response from AI service',
              'INVALID_RESPONSE_FORMAT',
              { content: cleanedContent, error: e }
            );
          }

          if (!parsedContent.flashcards || !Array.isArray(parsedContent.flashcards)) {
            console.error('Invalid flashcards structure:', parsedContent);
            throw new AIServiceError(
              'Invalid response format: missing or invalid flashcards array',
              'INVALID_RESPONSE_FORMAT',
              { content: parsedContent }
            );
          }

          // Validate the number of flashcards
          if (parsedContent.flashcards.length !== cardsPerDeck) {
            console.error(`Expected ${cardsPerDeck} flashcards but got ${parsedContent.flashcards.length}`);
            throw new AIServiceError(
              `Expected ${cardsPerDeck} flashcards but got ${parsedContent.flashcards.length}`,
              'INVALID_RESPONSE_FORMAT',
              { expected: cardsPerDeck, received: parsedContent.flashcards.length }
            );
          }

          // Validate each flashcard
          parsedContent.flashcards.forEach((card: AIFlashcard, index: number) => {
            if (!card.simplified && !card.traditional || !card.pinyin || !card.translations?.english) {
              console.error('Invalid flashcard at index', index, ':', card);
              throw new AIServiceError(
                `Invalid flashcard at index ${index}: missing required fields`,
                'INVALID_RESPONSE_FORMAT',
                { card, index }
              );
            }
          });

          return parsedContent.flashcards;
        } catch (error) {
          console.error('Error in AI service:', error);
          throw error instanceof AIServiceError 
            ? error 
            : new AIServiceError(
                'Failed to generate flashcards',
                'AI_SERVICE_ERROR'
              );
        }
      }
    );
  }
}
