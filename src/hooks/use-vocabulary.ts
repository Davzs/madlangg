import { useCallback } from 'react';
import { addVocabularyWord } from '@/services/vocabulary';
import { toast } from 'sonner';

export function useVocabulary() {
  const addWordFromChat = useCallback(async (
    word: string,
    pinyin: string,
    meaning: string,
    category: string = 'General'
  ) => {
    try {
      await addVocabularyWord({
        word,
        pinyin,
        meaning,
        category,
        progressStatus: 'New',
      });
      toast.success('Word added to vocabulary');
      return true;
    } catch (error) {
      toast.error('Failed to add word to vocabulary');
      return false;
    }
  }, []);

  return {
    addWordFromChat,
  };
}
