'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Character {
  id: string;
  character: string;
  pinyin: string;
}

const mockCharacters: Character[] = [
  { id: '1', character: '你', pinyin: 'ni3' },
  { id: '2', character: '好', pinyin: 'hao3' },
  { id: '3', character: '我', pinyin: 'wo3' },
  { id: '4', character: '是', pinyin: 'shi4' },
  { id: '5', character: '人', pinyin: 'ren2' },
  { id: '6', character: '大', pinyin: 'da4' },
  { id: '7', character: '小', pinyin: 'xiao3' },
  { id: '8', character: '中', pinyin: 'zhong1' },
];

export default function PinyinTypingGame() {
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    if (gameStatus === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameStatus('finished');
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStatus]);

  const loadNewCharacter = () => {
    const availableCharacters = mockCharacters.filter(
      (char) => char.id !== currentCharacter?.id
    );
    const randomIndex = Math.floor(Math.random() * availableCharacters.length);
    setCurrentCharacter(availableCharacters[randomIndex]);
    setUserInput('');
    setFeedback(null);
  };

  const startGame = () => {
    setGameStatus('playing');
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    loadNewCharacter();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCharacter || gameStatus !== 'playing') return;

    const normalizedInput = userInput.toLowerCase().trim();
    const normalizedPinyin = currentCharacter.pinyin.toLowerCase();

    if (normalizedInput === normalizedPinyin) {
      setScore((prev) => prev + 10 + streak * 2);
      setStreak((prev) => prev + 1);
      setFeedback('correct');
    } else {
      setStreak(0);
      setFeedback('incorrect');
    }

    setTimeout(() => {
      loadNewCharacter();
    }, 1000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Pinyin Typing Game</h2>
          <p className="text-gray-600">
            Type the correct pinyin for the Chinese character shown
          </p>
        </div>

        {gameStatus === 'waiting' && (
          <div className="text-center">
            <p className="mb-4">Ready to test your pinyin typing skills?</p>
            <Button onClick={startGame}>Start Game</Button>
          </div>
        )}

        {gameStatus === 'playing' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>Score: {score}</div>
              <div>Streak: {streak}</div>
              <div>Time: {timeLeft}s</div>
            </div>
            
            <Progress value={(timeLeft / 30) * 100} className="mb-6" />

            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{currentCharacter?.character}</div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type pinyin here..."
                  className={`text-xl ${
                    feedback === 'correct'
                      ? 'border-green-500'
                      : feedback === 'incorrect'
                      ? 'border-red-500'
                      : ''
                  }`}
                  autoFocus
                />
                <Button type="submit">Submit</Button>
              </form>
            </div>

            <div className="text-sm text-gray-600">
              Tip: Use numbers for tones (1-4). Example: ni3 hao3
            </div>
          </>
        )}

        {gameStatus === 'finished' && (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Game Over!</h3>
            <p className="mb-4">Final Score: {score}</p>
            <Button onClick={startGame}>Play Again</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
