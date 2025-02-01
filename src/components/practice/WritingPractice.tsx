'use client';

import { useRef, useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eraser, PenTool, Loader2 } from 'lucide-react';
import { AIFeedback } from '@/services/ai.service';

interface WritingPracticeProps {
  character: string;
  onFeedback?: (feedback: AIFeedback) => void;
}

export default function WritingPractice({ character, onFeedback }: WritingPracticeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  
  const { analyzeWriting, isLoading, error } = useAI({
    onError: (error) => {
      console.error('AI Error:', error);
    },
  });

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setHasDrawing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 300;

    // Get context
    const context = canvas.getContext('2d');
    if (!context) return;

    // Configure context
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 3;
    contextRef.current = context;

    // Clear canvas with white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  };

  const getCanvasImage = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL('image/png');
  };

  const handleAnalyze = async () => {
    const imageUrl = getCanvasImage();
    const feedback = await analyzeWriting(imageUrl, character);
    if (feedback) {
      onFeedback?.(feedback);
    }
  };

  // Initialize canvas on component mount
  useState(() => {
    initializeCanvas();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-4xl font-bold">{character}</span>
            <PenTool className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardTitle>
        <CardDescription>
          Practice writing this character by drawing in the box below
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative border-2 border-dashed rounded-lg bg-background">
          {/* Reference character overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <span className="text-9xl">{character}</span>
          </div>
          
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-[300px] rounded-lg cursor-crosshair"
            style={{ touchAction: 'none' }}
          />
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={clearCanvas}
            disabled={!hasDrawing || isLoading}
            className="space-x-2"
          >
            <Eraser className="h-4 w-4" />
            <span>Clear</span>
          </Button>
          
          <Button 
            onClick={handleAnalyze}
            disabled={!hasDrawing || isLoading}
            className="space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <PenTool className="h-4 w-4" />
                <span>Analyze Writing</span>
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive mt-2">
            {error.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
