import { VocabularyItem } from '@/types';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private cache: Map<string, CacheItem<any>>;

  constructor() {
    this.cache = new Map();
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const vocabularyCache = new Cache();

export const getCachedVocabulary = (userId: string): VocabularyItem[] | null => {
  return vocabularyCache.get(`vocabulary:${userId}`);
};

export const setCachedVocabulary = (userId: string, items: VocabularyItem[]): void => {
  vocabularyCache.set(`vocabulary:${userId}`, items);
};
