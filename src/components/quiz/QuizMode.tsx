import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Flashcard {
  _id: string;
  simplified: string;
  traditional: string;
  pinyin: string;
  translations: {
    english: string;
    spanish: string;
  };
  examples: Array<{
    chinese: string;
    pinyin: string;
    translations: {
      english: string;
      spanish: string;
    };
  }>;
  hskLevel: number;
  category: string;
}

export function QuizMode() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<Date>();

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchFlashcards();
  }, [session]);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch('/api/flashcards?dueOnly=true');
      const data = await response.json();
      if (data.flashcards) {
        setFlashcards(data.flashcards);
        setStartTime(new Date());
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuizQuestion = (flashcard: Flashcard) => {
    // Generate multiple choice options including the correct answer
    const correctAnswer = flashcard.translations.english;
    const otherFlashcards = flashcards.filter(f => f._id !== flashcard._id);
    const wrongAnswers = otherFlashcards
      .map(f => f.translations.english)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);

    return {
      id: flashcard._id,
      type: 'multiple-choice',
      question: `What is the meaning of ${flashcard.simplified} (${flashcard.pinyin})?`,
      options,
      correctAnswer
    };
  };

  const checkAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const currentFlashcard = flashcards[currentQuestion];
    const isCorrect = answer === currentFlashcard.translations.english;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Calculate time spent
    const timeSpent = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000) : 0;

    // Update progress in database
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: currentFlashcard._id,
          quality: isCorrect ? 5 : 2, // 5 for correct, 2 for incorrect
          timeSpent
        })
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer('');
    setStartTime(new Date());
    if (currentQuestion < flashcards.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading quiz...</div>;
  }

  if (flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">No Cards Due</h2>
          <p className="mb-4">You've completed all your reviews for now!</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuizQuestion = generateQuizQuestion(flashcards[currentQuestion]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <Progress value={(currentQuestion / flashcards.length) * 100} />
        <p className="text-sm text-gray-500 mt-2">
          Question {currentQuestion + 1} of {flashcards.length}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          {!showResult ? (
            <>
              <h2 className="text-2xl font-bold mb-4">
                {currentQuizQuestion.question}
              </h2>
              
              <div className="grid grid-cols-1 gap-3">
                {currentQuizQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === option 
                      ? option === currentQuizQuestion.correctAnswer 
                        ? "default"
                        : "destructive"
                      : "outline"}
                    className="justify-start text-left h-auto py-4 px-6"
                    onClick={() => checkAnswer(option)}
                    disabled={!!selectedAnswer}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {selectedAnswer && (
                <div className="mt-4 space-y-4">
                  <div className={`p-4 rounded-lg ${
                    selectedAnswer === currentQuizQuestion.correctAnswer 
                      ? "bg-green-50 text-green-700" 
                      : "bg-red-50 text-red-700"
                  }`}>
                    {selectedAnswer === currentQuizQuestion.correctAnswer 
                      ? "Correct! Well done!" 
                      : `Incorrect. The correct answer is: ${currentQuizQuestion.correctAnswer}`}
                  </div>
                  <Button 
                    className="w-full"
                    onClick={nextQuestion}
                  >
                    Next Question
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
              <p className="text-lg mb-4">Your score: {score}/{flashcards.length}</p>
              <div className="space-x-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setCurrentQuestion(0);
                    setScore(0);
                    setShowResult(false);
                    fetchFlashcards();
                  }}
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')}
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
