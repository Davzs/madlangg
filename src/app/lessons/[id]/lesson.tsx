'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Volume2, ChevronRight, ChevronLeft, Trophy, Timer } from 'lucide-react';
import { speakChinese } from '@/utils/chineseSpeech';
import { ILesson } from '@/models/Lesson';
import confetti from 'canvas-confetti';

interface LessonComponentProps {
  lesson: ILesson;
}

export default function LessonComponent({ lesson }: LessonComponentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime] = useState(Date.now());
  const [progress, setProgress] = useState({
    completedExercises: 0,
    totalExercises: lesson.content.exercises.length,
    score: 0,
    xpEarned: 0,
  });
  const router = useRouter();
  const { toast } = useToast();

  const currentExercise = lesson.content.exercises[currentStep];
  const isLastStep = currentStep === lesson.content.exercises.length - 1;

  const handleAnswer = async (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds

    try {
      const response = await fetch('/api/lessons/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson._id,
          exerciseIndex: currentStep,
          answer,
          timeSpent,
        }),
      });

      if (!response.ok) throw new Error('Failed to update progress');

      const data = await response.json();
      setProgress(data.progress);

      if (data.exercise.isCorrect) {
        toast({
          title: 'Correct! 🎉',
          description: data.exercise.explanation,
        });
      } else {
        toast({
          title: 'Not quite right',
          description: data.exercise.explanation,
          variant: 'destructive',
        });
      }

      // Show confetti on lesson completion
      if (isLastStep && data.exercise.isCorrect) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const nextStep = () => {
    if (isLastStep) {
      router.push('/lessons');
      return;
    }
    setCurrentStep(prev => prev + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const speakText = (text: string) => {
    speakChinese(text, {
      rate: 0.8,
      onError: () => {
        toast({
          title: 'Speech Error',
          description: 'Failed to speak the text. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <Badge variant="outline" className="text-sm">
            {currentStep + 1} / {lesson.content.exercises.length}
          </Badge>
        </div>
        <Progress 
          value={(currentStep / lesson.content.exercises.length) * 100} 
          className="h-2"
        />
      </div>

      {/* Introduction (only show on first step) */}
      {currentStep === 0 && (
        <Card className="p-6 bg-primary/5">
          <h2 className="text-xl font-semibold mb-4">Welcome to this lesson!</h2>
          <div className="space-y-4">
            <p>{lesson.content.introduction}</p>
            <div className="font-medium">Objectives:</div>
            <ul className="list-disc list-inside space-y-2">
              {lesson.content.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Exercise */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentExercise.question}</h3>
            
            {/* For vocabulary or grammar exercises, add speech button */}
            {(lesson.type === 'vocabulary' || lesson.type === 'grammar') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => speakText(currentExercise.question)}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Listen
              </Button>
            )}
          </div>

          {/* Multiple choice options */}
          <div className="grid gap-3">
            {currentExercise.options?.map((option, index) => (
              <Button
                key={index}
                variant={
                  isAnswered
                    ? option === currentExercise.correctAnswer
                      ? 'default'
                      : option === selectedAnswer
                      ? 'destructive'
                      : 'outline'
                    : selectedAnswer === option
                    ? 'default'
                    : 'outline'
                }
                className="justify-start h-auto py-4 px-6"
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
              >
                {option}
              </Button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/lessons')}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Exit Lesson
            </Button>
            
            {isAnswered && (
              <Button onClick={nextStep} className="gap-2">
                {isLastStep ? 'Finish' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Progress Stats */}
      <Card className="p-4">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>XP Earned: {progress.xpEarned}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span>Score: {progress.score}%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
