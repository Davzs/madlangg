"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2 } from "lucide-react";
import { IVocabulary } from "@/models/Vocabulary";
import { useToast } from "@/components/ui/use-toast";
import { speakChinese } from "@/utils/chineseSpeech";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReviewType = 'character' | 'pinyin' | 'meaning';

interface LearningSessionProps {
  initialWords?: IVocabulary[];
}

export default function LearningSession({ initialWords = [] }: LearningSessionProps) {
  const [words, setWords] = useState<IVocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewType, setReviewType] = useState<ReviewType>('character');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionFilter, setSessionFilter] = useState<'all' | 'flashcards'>('flashcards');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const loadWords = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = '/api/vocabulary';
      if (sessionFilter === 'flashcards') {
        url += '?inFlashcards=true';
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch words');
      const data = await response.json();
      
      // Shuffle the words
      const shuffledWords = [...data].sort(() => Math.random() - 0.5);
      setWords(shuffledWords);
      setCurrentIndex(0);
      setShowAnswer(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load vocabulary words',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionFilter, toast]);

  useEffect(() => {
    if (initialWords.length > 0) {
      setWords(initialWords);
      setIsLoading(false);
    } else {
      loadWords();
    }
  }, [initialWords, loadWords]);

  const currentWord = words[currentIndex];

  const speakWord = () => {
    if (!currentWord) return;
    setIsSpeaking(true);
    speakChinese(currentWord.word, {
      rate: 0.8,
      onEnd: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        toast({
          title: 'Speech Error',
          description: 'Failed to speak the word. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleAnswer = async (correct: boolean) => {
    if (!currentWord) return;

    try {
      const response = await fetch('/api/vocabulary/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: currentWord._id,
          correct,
          reviewType,
        }),
      });

      if (!response.ok) throw new Error('Failed to update progress');

      // Move to next word
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        toast({
          title: 'Session Complete!',
          description: 'You have reviewed all words in this session.',
        });
        // Reload words with new shuffle
        loadWords();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      });
    }
  };

  const getPrompt = () => {
    if (!currentWord) return '';
    switch (reviewType) {
      case 'character':
        return `What is the character for: ${currentWord.pinyin} (${currentWord.meaning})`;
      case 'pinyin':
        return 'What is the pinyin for this character?';
      case 'meaning':
        return 'What is the meaning of this character?';
    }
  };

  const getAnswer = () => {
    if (!currentWord) return '';
    switch (reviewType) {
      case 'character':
        return currentWord.word;
      case 'pinyin':
        return currentWord.pinyin;
      case 'meaning':
        return currentWord.meaning;
    }
  };

  const getQuestion = () => {
    if (!currentWord) return '';
    switch (reviewType) {
      case 'character':
        return `${currentWord.pinyin} (${currentWord.meaning})`;
      case 'pinyin':
      case 'meaning':
        return currentWord.word;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">No Words Available</h3>
          <p className="text-muted-foreground">
            {sessionFilter === 'flashcards' 
              ? 'Add some words to your flashcards to start practicing!'
              : 'Add some words to your vocabulary to start practicing!'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select value={reviewType} onValueChange={(value: ReviewType) => setReviewType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select review type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="character">Character</SelectItem>
              <SelectItem value="pinyin">Pinyin</SelectItem>
              <SelectItem value="meaning">Meaning</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sessionFilter} onValueChange={(value: 'all' | 'flashcards') => setSessionFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select word set" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flashcards">Flashcards Only</SelectItem>
              <SelectItem value="all">All Words</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {currentIndex + 1} / {words.length}
          </Badge>
        </div>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">{getPrompt()}</p>
            <div className="flex justify-center items-center gap-4">
              <h2 className="text-4xl font-bold">{getQuestion()}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={speakWord}
                disabled={isSpeaking}
              >
                <Volume2 className={`h-6 w-6 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
              </Button>
            </div>
          </div>

          {showAnswer ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-semibold">{getAnswer()}</h3>
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  variant="destructive"
                  onClick={() => handleAnswer(false)}
                >
                  Incorrect
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleAnswer(true)}
                >
                  Correct
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                onClick={() => setShowAnswer(true)}
              >
                Show Answer
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
