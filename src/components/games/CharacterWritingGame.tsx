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
  const [strokes, setStrokes] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const currentStrokeRef = useRef<Array<{ x: number; y: number }>>([]);
  const [timer, setTimer] = useState(30);
  const [feedback, setFeedback] = useState('');

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

  useEffect(() => {
    setTimer(30);
  }, [currentCharacter]);

  useEffect(() => {
    if (!currentCharacter) return;
    const timerInterval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(timerInterval);
          nextCharacter();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [currentCharacter]);

  useEffect(() => {
    redrawCanvas();
  }, [strokes, context]);

  const loadNewCharacter = () => {
    const randomIndex = Math.floor(Math.random() * mockCharacters.length);
    setCurrentCharacter(mockCharacters[randomIndex]);
  };

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.type === 'touchend' || e.type === 'touchcancel') {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleStart = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!context) return;
    e.preventDefault();
    setIsDrawing(true);
    const pos = getCoordinates(e);
    currentStrokeRef.current = [{ x: pos.x, y: pos.y }];
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  const handleDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !context) return;
    e.preventDefault();
    const pos = getCoordinates(e);
    currentStrokeRef.current.push({ x: pos.x, y: pos.y });
    context.lineTo(pos.x, pos.y);
    context.stroke();
  };

  const handleEnd = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!context) return;
    e.preventDefault();
    setIsDrawing(false);
    context.closePath();
    if (currentStrokeRef.current.length > 0) {
      setStrokes((prev) => [...prev, currentStrokeRef.current]);
    }
    currentStrokeRef.current = [];
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setStrokes([]);
  };

  const undoLastStroke = () => {
    setStrokes((prev) => prev.slice(0, prev.length - 1));
  };

  const redrawCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    strokes.forEach((stroke) => {
      if (stroke.length > 0) {
        context.beginPath();
        context.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          context.lineTo(stroke[i].x, stroke[i].y);
        }
        context.stroke();
        context.closePath();
      }
    });
  };

  const nextCharacter = () => {
    if (currentCharacter) {
      if (strokes.length === currentCharacter.strokes) {
        setScore((prev) => prev + 10);
        setFeedback('Great job! Perfect stroke count.');
      } else {
        setScore((prev) => prev + 5);
        setFeedback(
          `You drew ${strokes.length} stroke(s) but expected ${currentCharacter.strokes}.`
        );
      }
    }
    setTimeout(() => setFeedback(''), 3000);
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
          {feedback && <div className="text-center text-green-600 mb-4">{feedback}</div>}
        </div>

        <div className="relative mb-4">
          <canvas
            ref={canvasRef}
            style={{ touchAction: 'none' }}
            className="w-full h-64 border-2 border-gray-300 rounded-lg bg-white"
            onMouseDown={handleStart}
            onMouseMove={handleDrawing}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleDrawing}
            onTouchEnd={handleEnd}
            onTouchCancel={handleEnd}
          />
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
            <div className="flex items-center justify-center h-full text-9xl">
              {currentCharacter?.character}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearCanvas}>
                Clear
              </Button>
              <Button variant="outline" onClick={undoLastStroke}>
                Undo
              </Button>
              <Button onClick={nextCharacter}>Next Character</Button>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-lg">Score: {score}</div>
              <div className="text-lg">Time: {timer}s</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
