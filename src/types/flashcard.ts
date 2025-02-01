export interface IFlashcard {
  _id: string;
  simplified: string;
  traditional: string;
  pinyin: string;
  translations: {
    english: string;
    spanish: string;
  };
  examples?: Array<{
    chinese: string;
    pinyin: string;
    translations: {
      english?: string;
      spanish?: string;
    };
    aiGenerated?: boolean;
  }>;
  audio?: {
    male?: string;
    female?: string;
  };
  category: string;
  hskLevel?: number;
}
