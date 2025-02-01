'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IVocabulary } from '@/models/Vocabulary';
import { useVocabularyList } from '@/hooks/useVocabulary';
import { Slider } from '@/components/ui/slider';
import { Volume2 } from 'lucide-react';
import { TextToSpeech } from '@/lib/text-to-speech';
import { calculateNextReview } from '@/lib/spaced-repetition';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, VolumeX } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface EditVocabularyDialogProps {
  word?: IVocabulary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const defaultVocabulary: Partial<IVocabulary> = {
  word: '',
  pinyin: '',
  meaning: '',
  notes: '',
  category: 'general',
  status: 'Learning',
  inFlashcards: false,
  confidenceLevel: 1,
  lastReviewDate: new Date(),
  nextReviewDate: new Date(),
  reviewInterval: 0,
  easeFactor: 2.5,
  consecutiveCorrect: 0,
  reviewHistory: [],
  progress: {
    character: { correct: 0, incorrect: 0, streak: 0, lastReviewed: null },
    pinyin: { correct: 0, incorrect: 0, streak: 0, lastReviewed: null },
    meaning: { correct: 0, incorrect: 0, streak: 0, lastReviewed: null }
  },
  mastery: {
    character: 0,
    pinyin: 0,
    meaning: 0
  },
  lastPracticed: new Date()
};

export function EditVocabularyDialog({ 
  word = null, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditVocabularyDialogProps) {
  const [formData, setFormData] = useState<Partial<IVocabulary>>(defaultVocabulary);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { updateWord, addWord, isLoading } = useVocabularyList();
  const ttsRef = useRef<TextToSpeech | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (word) {
      setFormData({
        ...defaultVocabulary,
        ...word,
        notes: word.notes || '',
        category: word.category || 'general',
        status: word.status || 'Learning',
        inFlashcards: word.inFlashcards || false,
        confidenceLevel: word.confidenceLevel || 1,
        lastReviewDate: word.lastReviewDate || new Date(),
        nextReviewDate: word.nextReviewDate || new Date(),
        reviewInterval: word.reviewInterval || 0,
        easeFactor: word.easeFactor || 2.5,
        consecutiveCorrect: word.consecutiveCorrect || 0,
        reviewHistory: word.reviewHistory || [],
        progress: word.progress || defaultVocabulary.progress,
        mastery: word.mastery || defaultVocabulary.mastery,
        lastPracticed: word.lastPracticed || new Date()
      });
    } else {
      setFormData(defaultVocabulary);
    }
  }, [word]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      ttsRef.current = TextToSpeech.getInstance();
    }
    
    return () => {
      if (ttsRef.current) {
        ttsRef.current.stop();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!ttsRef.current) return;

    if (isSpeaking) {
      ttsRef.current.stop();
      setIsSpeaking(false);
    } else {
      ttsRef.current.speak(formData.word, {
        onEnd: () => setIsSpeaking(false)
      });
      setIsSpeaking(true);
    }
  };

  const handleConfidenceChange = (value: number[]) => {
    const confidenceLevel = value[0];
    
    const reviewInfo = calculateNextReview({
      lastReviewDate: formData.lastReviewDate,
      nextReviewDate: formData.nextReviewDate,
      interval: formData.reviewInterval,
      easeFactor: formData.easeFactor,
      consecutiveCorrect: formData.consecutiveCorrect,
    }, confidenceLevel);
    
    setFormData(prev => ({
      ...prev,
      confidenceLevel,
      ...reviewInfo,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare the update data
      const updateData: Partial<IVocabulary> = {
        word: formData.word,
        pinyin: formData.pinyin,
        meaning: formData.meaning,
        notes: formData.notes,
        category: formData.category,
        confidenceLevel: formData.confidenceLevel,
        lastReviewDate: formData.lastReviewDate,
        nextReviewDate: formData.nextReviewDate,
        reviewInterval: formData.reviewInterval,
        easeFactor: formData.easeFactor,
        consecutiveCorrect: formData.consecutiveCorrect,
        reviewHistory: formData.reviewHistory,
      };

      if (word?._id) {
        await updateWord(word._id, updateData);
        toast({
          title: "Success",
          description: "Word updated successfully",
        });
      } else {
        await addWord(updateData);
        toast({
          title: "Success",
          description: "New word added successfully",
        });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save word:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save word",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{word ? 'Edit' : 'Add New'} Word</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word">Chinese Character</Label>
            <div className="flex gap-2">
              <Input
                id="word"
                value={formData.word}
                onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSpeak}
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pinyin">Pinyin</Label>
            <Input
              id="pinyin"
              value={formData.pinyin}
              onChange={(e) => setFormData(prev => ({ ...prev, pinyin: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meaning">Meaning</Label>
            <Input
              id="meaning"
              value={formData.meaning}
              onChange={(e) => setFormData(prev => ({ ...prev, meaning: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="greetings">Greetings</SelectItem>
                <SelectItem value="numbers">Numbers</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes or example sentences..."
            />
          </div>

          {word && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Confidence Level</Label>
                <Badge variant="outline">{formData.confidenceLevel}</Badge>
              </div>
              <Slider
                value={[formData.confidenceLevel]}
                onValueChange={handleConfidenceChange}
                max={5}
                min={1}
                step={1}
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <CalendarDays className="h-4 w-4" />
                Next review: {format(new Date(formData.nextReviewDate), 'PPP')}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
