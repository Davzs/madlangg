'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useGameProgress } from '@/hooks/useGameProgress';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface CharacterCard {
  id: string;
  character: string;
  pinyin: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const mockCharacters = [
  { id: '1', character: '你', pinyin: 'nǐ' },
  { id: '2', character: '好', pinyin: 'hǎo' },
  { id: '3', character: '我', pinyin: 'wǒ' },
  { id: '4', character: '是', pinyin: 'shì' },
  // Duplicate for matching pairs
  { id: '5', character: '你', pinyin: 'nǐ' },
  { id: '6', character: '好', pinyin: 'hǎo' },
  { id: '7', character: '我', pinyin: 'wǒ' },
  { id: '8', character: '是', pinyin: 'shì' },
];

export default function CharacterMatchingGame() {
  const { progress, updateProgress } = useGameProgress('character-matching');
  const [cards, setCards] = useState<CharacterCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');

  useEffect(() => {
    if (gameStatus === 'playing') {
      initializeGame();
    }
  }, [gameStatus]);

  const initializeGame = () => {
    const gameCards = mockCharacters.map((char) => ({
      ...char,
      isFlipped: false,
      isMatched: false,
    }));
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setMoves(0);
    setScore(0);
    setCorrectMatches(0);
    setTotalAttempts(0);
    setCurrentStreak(0);
  };

  const handleCardClick = (id: string) => {
    if (selectedCards.length === 2) return;
    if (cards.find(c => c.id === id)?.isMatched) return;
    if (selectedCards.includes(id)) return;

    const newSelectedCards = [...selectedCards, id];
    setSelectedCards(newSelectedCards);
    setMoves(moves + 1);

    if (newSelectedCards.length === 2) {
      setTotalAttempts(prev => prev + 1);
      const [card1, card2] = newSelectedCards.map(cardId => 
        cards.find(c => c.id === cardId)!
      );

      if (card1.character === card2.character) {
        setScore(score + 100 + currentStreak * 10);
        setCurrentStreak(prev => prev + 1);
        setCorrectMatches(prev => prev + 1);
        setCards(cards.map(card => 
          card.id === card1.id || card.id === card2.id 
            ? { ...card, isMatched: true } 
            : card
        ));

        // Check if game is finished
        if (correctMatches + 1 === mockCharacters.length / 2) {
          setGameStatus('finished');
          updateProgress({
            score: score + 100 + currentStreak * 10,
            correctAnswers: correctMatches + 1,
            totalAttempts: totalAttempts + 1,
            streak: currentStreak + 1,
          });
        }
      } else {
        setScore(Math.max(0, score - 20));
        setCurrentStreak(0);
      }
      setTimeout(() => setSelectedCards([]), 1000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Character Matching</h2>
          <p className="text-gray-600 mb-4">Match pairs of Chinese characters</p>
          
          {progress && (
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>High Score: {progress.highScore}</div>
              <div>Total XP: {progress.totalXP}</div>
              <div>Games Played: {progress.gamesPlayed}</div>
              <div>Best Streak: {progress.stats.longestStreak}</div>
            </div>
          )}
        </div>

        {gameStatus === 'waiting' && (
          <div className="text-center">
            <Button onClick={() => setGameStatus('playing')}>
              Start Game
            </Button>
          </div>
        )}

        {gameStatus === 'playing' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>Score: {score}</div>
              <div>Streak: {currentStreak}</div>
              <div>Moves: {moves}</div>
            </div>

            <Progress 
              value={(correctMatches / (mockCharacters.length / 2)) * 100} 
              className="mb-6"
            />

            <div className="grid grid-cols-4 gap-4">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`aspect-square flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 ${
                    card.isMatched || selectedCards.includes(card.id)
                      ? 'bg-green-100' 
                      : 'bg-blue-100 hover:bg-blue-200'
                  }`}
                >
                  {card.isMatched || selectedCards.includes(card.id) ? (
                    <span>{card.character}</span>
                  ) : (
                    <span className="text-gray-400">?</span>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}

        {gameStatus === 'finished' && (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Game Complete!</h3>
            <p className="mb-4">
              Final Score: {score}<br />
              Moves: {moves}<br />
              Accuracy: {((correctMatches / totalAttempts) * 100).toFixed(1)}%
            </p>
            <Button onClick={() => setGameStatus('playing')}>
              Play Again
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
