'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getReviewPriority } from '@/lib/spaced-repetition';
import { IVocabulary } from '@/models/Vocabulary';
import { useVocabularyList } from '@/hooks/useVocabulary';
import { Button } from '@/components/ui/button';
import { Brain, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function ReviewScheduler() {
  const [dueWords, setDueWords] = useState<IVocabulary[]>([]);
  const { words, isLoading } = useVocabularyList();

  useEffect(() => {
    if (!words) return;

    // Sort words by review priority
    const sortedWords = [...words].sort((a, b) => {
      const priorityA = getReviewPriority(a);
      const priorityB = getReviewPriority(b);
      return priorityB - priorityA;
    });

    // Get words that need review (priority > 0.5)
    const due = sortedWords.filter(word => getReviewPriority(word) > 0.5);
    setDueWords(due);
  }, [words]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Review Schedule</h3>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Schedule Reviews
        </Button>
      </div>

      <div className="space-y-4">
        {dueWords.length === 0 ? (
          <p className="text-muted-foreground text-sm">No words due for review!</p>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {dueWords.length} words due for review
            </p>
            <div className="grid gap-2">
              {dueWords.slice(0, 5).map((word) => (
                <div
                  key={word._id}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{word.word}</p>
                    <p className="text-sm text-muted-foreground">
                      {word.pinyin} - {word.meaning}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-right">
                      <p className="text-muted-foreground">Next Review</p>
                      <p>
                        {word.nextReviewDate
                          ? format(new Date(word.nextReviewDate), 'MMM d')
                          : 'Not scheduled'}
                      </p>
                    </div>
                    <Brain className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
              {dueWords.length > 5 && (
                <Button variant="ghost" className="w-full">
                  View {dueWords.length - 5} more
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
