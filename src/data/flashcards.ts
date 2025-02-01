export interface Flashcard {
  id: number;
  character: string;
  pinyin: string;
  translations: {
    en: string;
    es: string;
  };
}

export const flashcards: Flashcard[] = [
  {
    id: 1,
    character: '你好',
    pinyin: 'nǐ hǎo',
    translations: {
      en: 'Hello',
      es: 'Hola'
    },
  },
  {
    id: 2,
    character: '谢谢',
    pinyin: 'xiè xiè',
    translations: {
      en: 'Thank you',
      es: 'Gracias'
    },
  },
  {
    id: 3,
    character: '再见',
    pinyin: 'zài jiàn',
    translations: {
      en: 'Goodbye',
      es: 'Adiós'
    },
  },
];
