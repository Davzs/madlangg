'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Volume2, Edit, BookOpen, Check, Copy, Trash2 } from 'lucide-react';
import { IVocabulary } from '@/models/Vocabulary';
import { EditVocabularyDialog } from './edit-vocabulary-dialog';
import { useToast } from '@/components/ui/use-toast';
import { speakChinese } from '@/utils/chineseSpeech';
import { WordCard } from './word-card';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface VocabularyListProps {
  words: IVocabulary[];
  isLoading: boolean;
  onWordUpdate?: (wordId: string) => void;
  onWordDelete?: (wordId: string) => void;
}

export function VocabularyList({
  words,
  isLoading,
  onWordUpdate,
  onWordDelete,
}: VocabularyListProps) {
  const [editWord, setEditWord] = useState<IVocabulary | null>(null);
  const [wordToDelete, setWordToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMarkReviewed = async (wordId: string) => {
    try {
      const response = await fetch('/api/vocabulary/mark-reviewed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to mark word as reviewed');
      }

      const updatedWord = await response.json();
      toast.success('Word marked as reviewed', {
        description: `Last reviewed: ${new Date(updatedWord.lastReviewed).toLocaleDateString()}`
      });

      if (onWordUpdate) {
        onWordUpdate(wordId);
      }
    } catch (error) {
      console.error('Error marking word as reviewed:', error);
      toast.error('Failed to mark word as reviewed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  const handleDeleteClick = (wordId: string) => {
    setWordToDelete(wordId);
  };

  const handleDelete = async () => {
    if (!wordToDelete || !onWordDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/vocabulary/${wordToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete word');
      }

      toast('Word deleted successfully');
      onWordDelete(wordToDelete);
      setWordToDelete(null);
    } catch (error) {
      console.error('Error deleting word:', error);
      toast('Failed to delete word');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (wordId: string) => {
    const wordToEdit = words.find(w => w._id === wordId);
    if (wordToEdit) {
      setEditWord(wordToEdit);
    }
  };

  const handleConfidenceUpdate = async (wordId: string, confidence: number) => {
    try {
      const response = await fetch(`/api/vocabulary/${wordId}/confidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confidence }),
      });

      if (!response.ok) {
        throw new Error('Failed to update confidence');
      }

      if (onWordUpdate) {
        onWordUpdate(wordId);
      }
    } catch (error) {
      console.error('Error updating confidence:', error);
      toast('Failed to update confidence');
    }
  };

  const handleCopy = async (word: IVocabulary) => {
    try {
      const textToCopy = `${word.word} (${word.pinyin}) - ${word.meaning}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Word copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy word');
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!words || words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <p className="text-muted-foreground">No vocabulary words found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {words.map((word) => (
        <WordCard
          key={word._id}
          word={word}
          onMarkReviewed={handleMarkReviewed}
          onDelete={() => setWordToDelete(word._id)}
          onEdit={(wordId) => {
            setEditWord(word);
          }}
        />
      ))}

      <Dialog open={!!wordToDelete} onOpenChange={() => setWordToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Word</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this word? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setWordToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => wordToDelete && handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EditVocabularyDialog
        word={editWord}
        open={!!editWord}
        onOpenChange={(open) => !open && setEditWord(null)}
        onSuccess={() => {
          setEditWord(null);
          if (onWordUpdate) onWordUpdate(editWord?._id || '');
        }}
      />
    </div>
  );
}
