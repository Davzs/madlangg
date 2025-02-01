import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Play, Pencil, Trash2 } from 'lucide-react';

interface FlashcardDeckProps {
  deck: {
    _id: string;
    name: string;
    flashcards: Array<{
      _id: string;
      simplified: string;
      pinyin: string;
      translations: {
        english: string;
        spanish?: string;
      };
      examples?: Array<{
        chinese: string;
        pinyin: string;
        translations: {
          english: string;
          spanish?: string;
        };
      }>;
    }>;
  };
  onDelete: (id: string) => void;
  onStartPractice: (id: string) => void;
  onNameChange: (id: string, newName: string) => void;
}

export function FlashcardDeck({ deck, onDelete, onStartPractice, onNameChange }: FlashcardDeckProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(deck.name);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() !== deck.name) {
      onNameChange(deck._id, newName.trim());
    }
    setIsEditing(false);
  };

  return (
    <Card className="relative group">
      <CardHeader>
        {isEditing ? (
          <form onSubmit={handleNameSubmit} className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-7 text-lg font-semibold"
              autoFocus
              onBlur={handleNameSubmit}
            />
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{deck.name}</CardTitle>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(deck._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <CardDescription>
          {deck.flashcards.length} {deck.flashcards.length === 1 ? 'card' : 'cards'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end">
          <Button
            className="w-full sm:w-auto"
            onClick={() => onStartPractice(deck._id)}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Practice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
