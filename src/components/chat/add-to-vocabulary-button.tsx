'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useVocabulary } from '@/hooks/useVocabulary';

interface AddToVocabularyButtonProps {
  word: string;
  pinyin: string;
  meaning: string;
  notes?: string;
}

export function AddToVocabularyButton({
  word,
  pinyin,
  meaning,
  notes,
}: AddToVocabularyButtonProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('General');
  const [isLoading, setIsLoading] = useState(false);
  const { addWordFromChat } = useVocabulary();

  const handleAddToVocabulary = async () => {
    try {
      setIsLoading(true);
      await addWordFromChat(word, pinyin, meaning, notes, category);
      toast.success('Word added to vocabulary');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to add word to vocabulary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Add to vocabulary"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Vocabulary</DialogTitle>
          <DialogDescription>
            Add this word to your vocabulary list for review later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="word">Chinese Word</Label>
            <Input id="word" value={word} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pinyin">Pinyin</Label>
            <Input id="pinyin" value={pinyin} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meaning">Meaning</Label>
            <Input id="meaning" value={meaning} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Greetings">Greetings</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddToVocabulary}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add to Vocabulary'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
