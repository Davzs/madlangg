'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flashcard } from '@/components/ui/flashcard';
import { Button } from '@/components/ui/button';
import { FlashcardDeck } from '@/components/ui/flashcard-deck';
import { cn } from '@/lib/utils';
import { ArrowLeft, Loader2, Volume2, Wand2, X, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { speakText } from '@/utils/speech';
import { Skeleton } from '@/components/ui/skeleton';

interface FlashcardsSettingsType {
  languages: ('english' | 'spanish')[];
  cardsPerDeck: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  includeExamples: boolean;
  topicFocus: 'general' | 'business' | 'academic' | 'daily-life' | 'travel';
  preventDuplicates: boolean;
  includeContext: boolean;
  characterStyle: 'simplified' | 'traditional' | 'both';
}

interface FlashcardType {
  _id: string;
  simplified: string;
  traditional?: string;
  pinyin: string;
  translations: {
    english: string;
    spanish?: string;
  };
  examples: Array<{
    chinese: string;
    pinyin: string;
    translations: {
      english: string;
      spanish?: string;
    };
  }>;
  metadata: {
    aiGenerated: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

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
      createdAt?: Date;
      updatedAt?: Date;
    };
  }>;
  metadata?: {
    aiGenerated?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

// Loading skeleton component
function LoadingState() {
  return (
    <div className="container px-4 py-6 md:px-6 lg:px-8">
      {/* Header and Generate AI button */}
      <div className="flex items-center justify-between mb-8">
        <div className="w-48" /> {/* Spacer instead of title */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[140px] rounded-md" /> {/* Generate with AI button */}
        </div>
      </div>

      {/* Flashcard Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6 space-y-3">
              {/* Deck Title and Date */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-[200px]" /> {/* Deck name */}
                <Skeleton className="h-4 w-32 bg-muted-foreground/10" /> {/* Created date */}
              </div>
              
              {/* Deck Info */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16" /> {/* Cards count */}
                <Skeleton className="h-5 w-24" /> {/* AI Generated badge */}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-10 w-full rounded-md" /> {/* Practice button */}
                <Skeleton className="h-10 w-10 rounded-md" /> {/* Menu button */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState<DeckType[]>([]);
  const [currentDeck, setCurrentDeck] = useState<DeckType | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardState, setCardState] = useState<'initial' | 'correct' | 'incorrect'>('initial');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<FlashcardsSettingsType>({
    languages: ['english'],
    cardsPerDeck: 5,
    difficulty: 'beginner',
    includeExamples: true,
    topicFocus: 'general',
    preventDuplicates: true,
    includeContext: true,
    characterStyle: 'simplified'
  });
  const [score, setScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [isSessionCompleteOpen, setIsSessionCompleteOpen] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flashcards');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load decks');
      }
      const data = await response.json();
      if (!Array.isArray(data.decks)) {
        throw new Error('Invalid response format');
      }
      setDecks(data.decks);
    } catch (error) {
      console.error('Error loading decks:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load flashcard decks',
        variant: 'destructive',
      });
      // Set empty decks array on error to avoid undefined state
      setDecks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      const response = await fetch(`/api/flashcards/${deckId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete flashcards');
      }

      // Refresh the deck list to get the updated state
      await loadDecks();

      // If the deleted deck was the current deck, reset the view
      if (currentDeck?._id === deckId) {
        setCurrentDeck(null);
        setCurrentCardIndex(0);
        setIsPreviewMode(false);
      }

      toast({
        title: 'Success',
        description: 'Flashcards deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting flashcards:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete flashcards',
        variant: 'destructive',
      });
    }
  };

  const generateAIFlashcards = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'Failed to generate flashcards';
        if (data.error) {
          errorMessage = data.error;
          if (data.details) {
            console.error('Error details:', data.details);
          }
        }
        throw new Error(errorMessage);
      }
      
      // Refresh the deck list to get the new deck
      await loadDecks();

      // Find the newly created deck and set it as current
      const newDeck = decks.find(deck => deck._id === data._id);
      if (newDeck) {
        setCurrentDeck(newDeck);
        setCurrentCardIndex(0);
        setIsPreviewMode(true);
      }

      toast({
        title: 'Success',
        description: 'New flashcard deck generated successfully!',
        variant: 'default',
      });

      setShowSettings(false);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate flashcards',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartPractice = (deckId: string) => {
    const deck = decks.find(d => d._id === deckId);
    if (deck) {
      setCurrentDeck(deck);
      setCurrentCardIndex(0);
      setIsPreviewMode(true);
    }
  };

  const handleRenameDeck = async (deckId: string, newName: string) => {
    try {
      const response = await fetch(`/api/flashcards/${deckId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) throw new Error('Failed to rename deck');

      setDecks(decks.map(deck => 
        deck._id === deckId ? { ...deck, name: newName } : deck
      ));
    } catch (error) {
      console.error('Error renaming deck:', error);
      toast({
        title: 'Error',
        description: 'Failed to rename deck',
        variant: 'destructive',
      });
    }
  };

  const handleAnswer = (correct: boolean) => {
    if (cardState !== 'initial') return;
    
    const points = correct ? (streakCount + 1) * 10 : 0;
    setScore(prev => prev + points);
    setStreakCount(prev => correct ? prev + 1 : 0);
    setCardState(correct ? 'correct' : 'incorrect');

    // Show subtle feedback animation
    const feedback = document.createElement('div');
    feedback.className = cn(
      'fixed top-20 left-1/2 transform -translate-x-1/2 z-50',
      'text-sm font-medium rounded-full px-3 py-1.5',
      'animate-in fade-in-0 slide-in-from-top-4',
      correct ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
    );
    feedback.textContent = correct ? `+${points} points` : 'Try again';
    document.body.appendChild(feedback);

    // Remove feedback after animation
    setTimeout(() => {
      feedback.classList.add('animate-out', 'fade-out-0', 'slide-out-to-top-4');
      setTimeout(() => feedback.remove(), 150);
    }, 1500);

    // Auto advance to next card after delay if correct
    if (correct && currentCardIndex < (currentDeck?.flashcards.length ?? 0) - 1) {
      setTimeout(() => {
        setCurrentCardIndex(i => i + 1);
        setShowAnswer(false);
        setCardState('initial');
      }, 1000);
    }
  };

  const handleSessionComplete = () => {
    setIsSessionCompleteOpen(true);
  };

  const restartSession = () => {
    setCurrentCardIndex(0);
    setIsSessionCompleteOpen(false);
  };

  const exitSession = () => {
    setCurrentDeck(null);
    setCurrentCardIndex(0);
    setIsSessionCompleteOpen(false);
    setIsPreviewMode(false);
  };

  const toggleReviewMode = (deck: DeckType) => {
    setCurrentDeck(deck);
    setIsReviewMode(true);
    setIsPreviewMode(true);
  };

  const handleNextCard = () => {
    if (currentDeck && currentCardIndex < currentDeck.flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      handleSessionComplete();
    }
  };

  return (
    <>
      <div className="px-6">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            {isPreviewMode && (
              <Button
                variant="ghost"
                className="mr-2"
                onClick={() => {
                  setIsPreviewMode(false);
                  setCurrentDeck(null);
                  setScore(0);
                  setStreakCount(0);
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to decks
              </Button>
            )}
            {!isPreviewMode && <h1 className="text-3xl font-bold">Flashcards</h1>}
          </div>
          <div className="flex items-center gap-2">
            {!isPreviewMode && (
              <div className="flex items-center space-x-2">
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setShowSettings(true)}
                      disabled={isGenerating}
                      className={cn(
                        "relative",
                        isGenerating && "cursor-not-allowed opacity-50"
                      )}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      Generate with AI
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Generate AI Flashcards</DialogTitle>
                      <DialogDescription>
                        Configure your flashcard generation settings
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Languages</Label>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="english"
                              checked={settings.languages.includes('english')}
                              onCheckedChange={(checked) => {
                                setSettings(prev => ({
                                  ...prev,
                                  languages: checked 
                                    ? [...prev.languages, 'english']
                                    : prev.languages.filter(l => l !== 'english')
                                }));
                              }}
                            />
                            <Label htmlFor="english">English</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="spanish"
                              checked={settings.languages.includes('spanish')}
                              onCheckedChange={(checked) => {
                                setSettings(prev => ({
                                  ...prev,
                                  languages: checked 
                                    ? [...prev.languages, 'spanish']
                                    : prev.languages.filter(l => l !== 'spanish')
                                }));
                              }}
                            />
                            <Label htmlFor="spanish">Spanish</Label>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="cardsPerDeck">Cards per Deck</Label>
                        <Input
                          id="cardsPerDeck"
                          type="number"
                          min={1}
                          max={20}
                          value={settings.cardsPerDeck}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            cardsPerDeck: parseInt(e.target.value)
                          }))}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select
                          value={settings.difficulty}
                          onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                            setSettings(prev => ({ ...prev, difficulty: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="topicFocus">Topic Focus</Label>
                        <Select
                          value={settings.topicFocus}
                          onValueChange={(value: 'general' | 'business' | 'academic' | 'daily-life' | 'travel') => 
                            setSettings(prev => ({ ...prev, topicFocus: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select topic focus" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="daily-life">Daily Life</SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="characterStyle">Character Style</Label>
                        <Select
                          value={settings.characterStyle}
                          onValueChange={(value: 'simplified' | 'traditional' | 'both') => 
                            setSettings(prev => ({ ...prev, characterStyle: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select character style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simplified">Simplified</SelectItem>
                            <SelectItem value="traditional">Traditional</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="preventDuplicates"
                          checked={settings.preventDuplicates}
                          onCheckedChange={(checked) => {
                            setSettings(prev => ({ ...prev, preventDuplicates: checked }));
                          }}
                        />
                        <Label htmlFor="preventDuplicates">Prevent duplicate words across decks</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="includeExamples"
                          checked={settings.includeExamples}
                          onCheckedChange={(checked) => {
                            setSettings(prev => ({ ...prev, includeExamples: checked }));
                          }}
                        />
                        <Label htmlFor="includeExamples">Include example sentences</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="includeContext"
                          checked={settings.includeContext}
                          onCheckedChange={(checked) => {
                            setSettings(prev => ({ ...prev, includeContext: checked }));
                          }}
                        />
                        <Label htmlFor="includeContext">Include usage context</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => {
                        setShowSettings(false);
                        generateAIFlashcards();
                      }}>
                        Generate Flashcards
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div
                key={deck._id}
                className="bg-card rounded-xl border shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{deck.name}</h3>
                    <Badge variant="secondary">
                      {deck.flashcards.length} cards
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setCurrentDeck(deck);
                          setCurrentCardIndex(0);
                          setIsPreviewMode(true);
                          setIsReviewMode(false);
                        }}
                        className="flex-1"
                      >
                        Start Practice
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => toggleReviewMode(deck)}
                        className="flex-1"
                      >
                        Review Cards
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRenameDeck(deck)}
                        className="flex-1"
                      >
                        Rename
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDeck(deck)}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {decks.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 text-muted-foreground">
                  <p>No flashcard decks yet.</p>
                  <p>Click "Generate with AI" to create your first deck!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Complete Dialog */}
      <Dialog open={isSessionCompleteOpen} onOpenChange={setIsSessionCompleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Complete!</DialogTitle>
            <DialogDescription>
              You've completed all flashcards in this deck. What would you like to do next?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Button onClick={restartSession}>
              Practice Again
            </Button>
            <Button variant="outline" onClick={exitSession}>
              Return to Deck List
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview/Review Mode */}
      <Dialog 
        open={isPreviewMode && currentDeck !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setCurrentDeck(null);
            setCurrentCardIndex(0);
            setIsPreviewMode(false);
            setIsReviewMode(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle>
                {isReviewMode ? 'Review Cards' : 'Practice Mode'} - {currentDeck?.name}
              </DialogTitle>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full opacity-70 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {currentDeck && (
              <motion.div 
                key={currentCardIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <div className="relative h-full">
                  <motion.div
                    animate={{ rotateY: showAnswer ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    className="preserve-3d h-full"
                    style={{ perspective: 2000 }}
                  >
                    {/* Front of card */}
                    <div className={cn(
                      "absolute inset-0 backface-hidden w-full h-full",
                      "bg-card rounded-xl border shadow-sm p-6 sm:p-8",
                      "flex flex-col items-center justify-center space-y-6"
                    )}>
                      <div className="text-6xl sm:text-7xl font-bold">
                        {currentDeck.flashcards[currentCardIndex].simplified}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl text-muted-foreground">
                          {currentDeck.flashcards[currentCardIndex].pinyin}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(currentDeck.flashcards[currentCardIndex].simplified);
                          }}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        size="lg"
                        className="mt-auto w-full max-w-sm text-lg"
                        onClick={() => setShowAnswer(true)}
                      >
                        Show Answer
                      </Button>
                    </div>

                    {/* Back of card */}
                    <div className={cn(
                      "absolute inset-0 backface-hidden w-full h-full rotate-y-180",
                      "bg-card rounded-xl border shadow-sm p-6 sm:p-8",
                      "flex flex-col"
                    )}>
                      <div className="flex-1 overflow-y-auto space-y-6 scrollbar-thin">
                        <div className="text-center space-y-4">
                          <div className="text-5xl sm:text-6xl font-bold">
                            {currentDeck.flashcards[currentCardIndex].simplified}
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xl sm:text-2xl text-muted-foreground">
                              {currentDeck.flashcards[currentCardIndex].pinyin}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakText(currentDeck.flashcards[currentCardIndex].simplified);
                              }}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-2xl">
                            {currentDeck.flashcards[currentCardIndex].translations.english}
                          </div>
                        </div>

                        {currentDeck.flashcards[currentCardIndex].examples && currentDeck.flashcards[currentCardIndex].examples.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Examples</h3>
                            <div className="space-y-4">
                              {currentDeck.flashcards[currentCardIndex].examples.map((example, idx) => (
                                <div key={idx} className="bg-muted/50 rounded-lg p-4 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{example.chinese}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakText(example.chinese);
                                      }}
                                    >
                                      <Volume2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {example.pinyin}
                                  </div>
                                  <div className="text-sm">
                                    {example.translations.english}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
            <div className="flex items-center gap-4">
              <span>{currentCardIndex + 1} / {currentDeck?.flashcards.length}</span>
              {streakCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-orange-500">{streakCount}</span>
                  <span className="text-orange-500">🔥</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{score}</span>
              <span>points</span>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="pt-4 border-t mt-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleAnswer(false)}
                className="border-destructive text-destructive hover:bg-destructive/10"
                disabled={!showAnswer}
              >
                <X className="h-4 w-4 mr-2" />
                Incorrect
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAnswer(true)}
                className="border-primary text-primary hover:bg-primary/10"
                disabled={!showAnswer}
              >
                <Check className="h-4 w-4 mr-2" />
                Correct
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
