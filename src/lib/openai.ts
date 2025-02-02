import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateFlashcardSuggestions = async (userProgress: any, interests: string[]) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a Mandarin learning assistant. Generate personalized flashcard suggestions based on user progress and interests."
        },
        {
          role: "user",
          content: `Generate 5 new Mandarin vocabulary suggestions based on user progress: ${JSON.stringify(userProgress)} and interests: ${interests.join(', ')}`
        }
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error(`Failed to generate flashcard suggestions: ${error.message}`);
  }
};

export const analyzePronunciation = async (audioUrl: string) => {
  try {
    const response = await openai.audio.transcriptions.create({
      file: await fetch(audioUrl).then(res => res.blob()),
      model: "whisper-1",
    });

    return response.text;
  } catch (error) {
    throw new Error(`Failed to analyze pronunciation: ${error.message}`);
  }
};

export const getWritingFeedback = async (characterImage: string, expectedCharacter: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a Mandarin writing expert. Analyze the written character and provide feedback."
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this handwritten Chinese character. The expected character is: ${expectedCharacter}` },
            { type: "image_url", image_url: characterImage }
          ]
        }
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error(`Failed to get writing feedback: ${error.message}`);
  }
};
