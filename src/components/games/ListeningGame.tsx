'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioClip {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
  audioUrl: string;
}

// Mock data - replace with real audio clips from your database
const mockAudioClips: AudioClip[] = [
  {
    id: '1',
    character: '你好',
    pinyin: 'nǐ hǎo',
    meaning: 'hello',
    audioUrl: '/audio/nihao.mp3'
  },
  {
    id: '2',
    character: '谢谢',
    pinyin: 'xiè xie',
    meaning: 'thank you',
    audioUrl: '/audio/xiexie.mp3'
  },
  {
    id: '3',
    character: '再见',
    pinyin: 'zài jiàn',
    meaning: 'goodbye',
    audioUrl: '/audio/zaijian.mp3'
  },
  {
    id: '4',
    character: '对不起',
    pinyin: 'duì bù qǐ',
    meaning: 'sorry',
    audioUrl: '/audio/duibuqi.mp3'
  }
];

export default function ListeningGame() {
  const [currentClip, setCurrentClip] = useState<AudioClip | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const generateOptions = (correctAnswer: string) => {
    const allAnswers = mockAudioClips.map(clip => clip.meaning);
    const incorrectAnswers = allAnswers.filter(answer => answer !== correctAnswer);
    const shuffledIncorrect = incorrectAnswers.sort(() => Math.random() - 0.5).slice(0, 3);
    return [correctAnswer, ...shuffledIncorrect].sort(() => Math.random() - 0.5);
  };

  const loadNewClip = () => {
    const availableClips = mockAudioClips.filter(
      clip => clip.id !== currentClip?.id
    );
    const randomClip = availableClips[Math.floor(Math.random() * availableClips.length)];
    setCurrentClip(randomClip);
    setOptions(generateOptions(randomClip.meaning));
    setShowAnswer(false);
    if (audioRef.current) {
      audioRef.current.src = randomClip.audioUrl;
      audioRef.current.load();
    }
  };

  const startGame = () => {
    setGameStatus('playing');
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    loadNewClip();
  };

  const handleOptionClick = (selectedOption: string) => {
    if (showAnswer) return;
    
    setShowAnswer(true);
    if (selectedOption === currentClip?.meaning) {
      setScore(prev => prev + 10 + streak * 2);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (gameStatus === 'playing') {
        loadNewClip();
      }
    }, 2000);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Listening Comprehension</h2>
          <p className="text-gray-600">
            Listen to the audio and select the correct meaning
          </p>
        </div>

        {gameStatus === 'waiting' && (
          <div className="text-center">
            <p className="mb-4">Ready to test your listening skills?</p>
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
              <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <Button
                onClick={toggleAudio}
                size="lg"
                className="mb-6"
                variant="outline"
              >
                {isPlaying ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>

              <div className="grid grid-cols-2 gap-4">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    variant={
                      showAnswer
                        ? option === currentClip?.meaning
                          ? 'default'
                          : 'secondary'
                        : 'outline'
                    }
                    className={`p-4 text-lg ${
                      showAnswer && option === currentClip?.meaning
                        ? 'bg-green-500 hover:bg-green-600'
                        : ''
                    }`}
                    disabled={showAnswer}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {showAnswer && (
                <div className="mt-4 text-center">
                  <p className="text-2xl mb-2">{currentClip?.character}</p>
                  <p className="text-gray-600">{currentClip?.pinyin}</p>
                </div>
              )}
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
