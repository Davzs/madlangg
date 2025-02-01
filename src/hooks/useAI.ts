import { useState } from 'react';
import { AIFeedback } from '@/services/ai.service';

interface UseAIOptions {
  onError?: (error: Error) => void;
}

export function useAI(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyzePronunciation = async (audioUrl: string, expectedPinyin: string): Promise<AIFeedback | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai/pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl, expectedPinyin }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze pronunciation');
      }

      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeWriting = async (characterImage: string, expectedCharacter: string): Promise<AIFeedback | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterImage, expectedCharacter }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze writing');
      }

      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonalizedSuggestions = async (): Promise<string[] | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai/suggestions');
      
      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      return data.suggestions;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    analyzePronunciation,
    analyzeWriting,
    getPersonalizedSuggestions,
  };
}
