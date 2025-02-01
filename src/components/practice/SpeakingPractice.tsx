'use client';

import { useState, useRef } from 'react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { AIFeedback } from '@/services/ai.service';

interface SpeakingPracticeProps {
  character: string;
  pinyin: string;
  onFeedback?: (feedback: AIFeedback) => void;
}

export default function SpeakingPractice({ character, pinyin, onFeedback }: SpeakingPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  
  const { analyzePronunciation, isLoading, error } = useAI({
    onError: (error) => {
      console.error('AI Error:', error);
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        analyzePronunciationAndGetFeedback(url);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      
      // Simulate progress for visual feedback
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 2;
        if (currentProgress > 100) {
          clearInterval(progressInterval);
          stopRecording();
        } else {
          setProgress(currentProgress);
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setProgress(100);
      
      // Stop all audio tracks
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const analyzePronunciationAndGetFeedback = async (url: string) => {
    const feedback = await analyzePronunciation(url, pinyin);
    if (feedback) {
      onFeedback?.(feedback);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-4xl font-bold">{character}</span>
            <span className="text-2xl text-muted-foreground">{pinyin}</span>
          </div>
          <Button
            size="icon"
            variant={isRecording ? "destructive" : "secondary"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className="h-12 w-12"
          >
            {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
        </CardTitle>
        <CardDescription>
          Practice pronouncing this character
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isRecording && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Recording...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {audioUrl && (
          <div className="flex items-center space-x-2 bg-secondary/20 p-3 rounded-md">
            <Volume2 className="h-4 w-4" />
            <audio controls src={audioUrl} className="w-full h-8" />
          </div>
        )}

        {isLoading && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Analyzing pronunciation...
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive">
            {error.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
