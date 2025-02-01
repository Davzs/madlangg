'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CharacterMatchingGame from './CharacterMatchingGame';
import PinyinTypingGame from './PinyinTypingGame';
import CharacterWritingGame from './CharacterWritingGame';
import ListeningGame from './ListeningGame';
import SentenceBuilderGame from './SentenceBuilderGame';

const GAMES = [
  {
    id: 'character-matching',
    title: 'Character Matching',
    description: 'Match Chinese characters with their corresponding pairs',
    component: CharacterMatchingGame,
    xp: 20,
    time: '15m',
    level: 'Beginner'
  },
  {
    id: 'pinyin-typing',
    title: 'Pinyin Typing',
    description: 'Practice typing pinyin for Chinese characters',
    component: PinyinTypingGame,
    xp: 20,
    time: '20m',
    level: 'Beginner'
  },
  {
    id: 'character-writing',
    title: 'Character Writing',
    description: 'Learn to write Chinese characters with proper stroke order',
    component: CharacterWritingGame,
    xp: 25,
    time: '20m',
    level: 'Beginner'
  },
  {
    id: 'listening-game',
    title: 'Listening Game',
    description: 'Improve your listening skills with audio exercises',
    component: ListeningGame,
    xp: 20,
    time: '15m',
    level: 'Beginner'
  },
  {
    id: 'sentence-builder',
    title: 'Sentence Builder',
    description: 'Practice building correct Chinese sentences',
    component: SentenceBuilderGame,
    xp: 25,
    time: '20m',
    level: 'Beginner'
  }
];

export default function GamesSection() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const selectedGameData = GAMES.find(game => game.id === selectedGame);

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {!selectedGame ? (
        <>
          <h2 className="text-2xl font-bold mb-6">Learning Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GAMES.map((game) => (
              <Card key={game.id} className={`p-4 hover:shadow-lg transition-shadow ${game.featured ? 'md:col-span-2 lg:col-span-3 bg-gradient-to-r from-purple-50 to-blue-50' : ''}`}>
                <div className="flex flex-col h-full">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{game.title}</h3>
                    <p className="text-gray-600 mb-4">{game.description}</p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">{game.time}</span>
                      <span className="text-sm font-medium text-yellow-600">{game.xp} XP</span>
                      <span className="text-sm text-green-600">{game.level}</span>
                    </div>
                    <Button 
                      onClick={() => setSelectedGame(game.id)}
                      className="w-full"
                      disabled={!game.component}
                    >
                      {game.component ? 'Play Now' : 'Coming Soon'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div>
          <Button 
            onClick={() => setSelectedGame(null)}
            variant="outline"
            className="mb-4"
          >
            ← Back to Games
          </Button>
          {selectedGameData?.component && <selectedGameData.component />}
        </div>
      )}
    </div>
  );
}
