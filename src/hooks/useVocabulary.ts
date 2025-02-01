'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { IVocabulary } from '@/models/Vocabulary';

interface VocabularyResponse {
  words: IVocabulary[];
  total: number;
}

export function useVocabulary() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [words, setWords] = useState<IVocabulary[]>([]);

  const addWordFromChat = useCallback(async (
    word: string,
    pinyin: string,
    meaning: string,
    notes?: string,
    category: string = 'General'
  ) => {
    if (!session?.user) {
      toast.error('Please sign in to add words to your vocabulary');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word,
          pinyin,
          meaning,
          notes,
          category,
          status: 'Learning',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add word');
      }

      const data = await response.json();
      setWords((prevWords) => [...prevWords, data]);
      toast.success('Word added to vocabulary!');
      return true;
    } catch (error) {
      console.error('Error adding word:', error);
      toast.error('Failed to add word to vocabulary');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  return {
    addWordFromChat,
    isLoading,
  };
}

export function useVocabularyList() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [words, setWords] = useState<IVocabulary[]>([]);

  const fetchWords = useCallback(async (
    page: number,
    search?: string,
    filter?: string
  ): Promise<VocabularyResponse> => {
    // Don't attempt to fetch if we're still checking auth status
    if (status === 'loading') return { words: [], total: 0 };
    
    // Only show the error toast once when definitely not authenticated
    if (status === 'unauthenticated') {
      toast.error('Please sign in to view vocabulary');
      return { words: [], total: 0 };
    }

    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (search) searchParams.set('search', search);
      if (filter) searchParams.set('filter', filter);
      searchParams.set('page', String(page));

      const response = await fetch(`/api/vocabulary?${searchParams.toString()}`);
      const data = await response.json();
      
      setWords(data.words);
      return data;
    } catch (error) {
      console.error('Error fetching words:', error);
      return { words: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  const addWord = useCallback(async (word: Partial<IVocabulary>) => {
    try {
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(word),
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding word:', error);
      throw error;
    }
  }, []);

  const updateWord = useCallback(async (id: string, updates: Partial<IVocabulary>) => {
    try {
      const response = await fetch(`/api/vocabulary/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update word');
      }

      const data = await response.json().catch(() => null);
      if (!data) {
        throw new Error('Invalid response from server');
      }

      return data;
    } catch (error) {
      console.error('Error updating word:', error);
      throw error;
    }
  }, []);

  return {
    words,
    isLoading,
    fetchWords,
    addWord,
    updateWord,
  };
}
