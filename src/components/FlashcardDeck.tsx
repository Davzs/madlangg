import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Play, 
  Edit2, 
  Trash2,
  Check,
  X,
  BookOpen
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DeckType {
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
    metadata?: {
      aiGenerated?: boolean;
      createdAt?: string;
      updatedAt?: string;
    };
  }>;
  metadata: {
    aiGenerated: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface Props {
  deck: DeckType;
  onDelete: (id: string) => void;
  onStartPractice: (id: string) => void;
  onNameChange: (id: string, newName: string) => void;
}

export function FlashcardDeck({ deck, onDelete, onStartPractice, onNameChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(deck.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const handleSave = () => {
    if (newName.trim() === '') {
      toast({
        title: 'Error',
        description: 'Deck name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    onNameChange(deck._id, newName.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewName(deck.name);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(deck._id);
    setShowDeleteDialog(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="group relative hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="absolute top-4 right-4 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive" 
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-6">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="font-medium"
                    placeholder="Deck name"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold">{deck.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created {formatDate(deck.metadata.createdAt)}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-sm">
                  {deck.flashcards?.length || 0} cards
                </Badge>
                {deck.metadata?.aiGenerated && (
                  <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                    AI Generated
                  </Badge>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => onStartPractice(deck._id)}
                  className="flex-1"
                  disabled={!deck.flashcards || deck.flashcards.length === 0}
                >
                  <Play className="mr-2 h-4 w-4" /> Practice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewDialog(true)}
                  disabled={!deck.flashcards || deck.flashcards.length === 0}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deck</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deck.name}" and all its flashcards? This action cannot be undone and will permanently remove both the deck and all associated flashcards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Deck & Cards
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{deck.name}</DialogTitle>
            <DialogDescription>
              Preview of all flashcards in this deck
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {deck.flashcards.map((card, index) => (
                <div key={card._id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-medium mb-1">
                        {card.simplified}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {card.pinyin}
                      </div>
                      <div className="text-sm">
                        {card.translations.english}
                        {card.translations.spanish && (
                          <span className="text-muted-foreground ml-2">
                            • {card.translations.spanish}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {index + 1}/{deck.flashcards.length}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
