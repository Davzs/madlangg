'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Character {
  id: string;
  character: string;
  pinyin: string;
  strokes: number;
}

const mockCharacters: Character[] = [
  { id: '1', character: '一', pinyin: 'yi1', strokes: 1 },
  { id: '2', character: '二', pinyin: 'er4', strokes: 2 },
  { id: '3', character: '三', pinyin: 'san1', strokes: 3 },
  { id: '4', character: '口', pinyin: 'kou3', strokes: 3 },
  { id: '5', character: '日', pinyin: 'ri4', strokes: 4 },
  { id: '6', character: '月', pinyin: 'yue4', strokes: 4 },
];

export default function CharacterWritingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
      }
    }
  }, []);

  useEffect(() => {
    loadNewCharacter();
  }, []);

  const loadNewCharacter = () => {
    const randomIndex = Math.floor(Math.random() * mockCharacters.length);
    setCurrentCharacter(mockCharacters[randomIndex]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      context.beginPath();
      context.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!context) return;
    setIsDrawing(false);
    context.closePath();
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const nextCharacter = () => {
    setScore(prev => prev + 10);
    clearCanvas();
    loadNewCharacter();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Character Writing Practice</h2>
          <p className="text-gray-600 mb-2">
            Practice writing Chinese characters with proper stroke order
          </p>
          <div className="text-4xl font-bold mb-4">
            {currentCharacter?.character}
            <span className="text-lg text-gray-500 ml-2">
              ({currentCharacter?.pinyin})
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Strokes: {currentCharacter?.strokes}
          </p>
        </div>

        <div className="relative mb-4">
          <canvas
            ref={canvasRef}
            className="w-full h-64 border-2 border-gray-300 rounded-lg bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
            <div className="flex items-center justify-center h-full text-9xl">
              {currentCharacter?.character}
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <Button variant="outline" onClick={clearCanvas}>
            Clear
          </Button>
          <div className="text-lg">Score: {score}</div>
          <Button onClick={nextCharacter}>Next Character</Button>
        </div>
      </Card>
    </div>
  );
}
