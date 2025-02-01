'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Star,
  Clock,
  Target,
  Activity,
  Award,
  BarChart,
} from 'lucide-react';

interface GameProgress {
  gameId: string;
  highScore: number;
  totalXP: number;
  gamesPlayed: number;
  lastPlayed: string;
  achievements: string[];
  stats: {
    correctAnswers: number;
    totalAttempts: number;
    longestStreak: number;
    averageScore: number;
  };
}

const GAME_INFO = {
  'character-matching': {
    title: 'Character Matching',
    description: 'Match pairs of Chinese characters',
    icon: Target,
    color: 'text-blue-500',
  },
  'pinyin-typing': {
    title: 'Pinyin Typing',
    description: 'Type the pinyin for Chinese characters',
    icon: Activity,
    color: 'text-green-500',
  },
  'character-writing': {
    title: 'Character Writing',
    description: 'Practice writing Chinese characters',
    icon: Star,
    color: 'text-purple-500',
  },
  'listening-game': {
    title: 'Listening Game',
    description: 'Test your Chinese listening skills',
    icon: BarChart,
    color: 'text-orange-500',
  },
  'sentence-builder': {
    title: 'Sentence Builder',
    description: 'Create correct Chinese sentences',
    icon: Award,
    color: 'text-red-500',
  },
};

const ACHIEVEMENT_INFO = {
  'first-game': {
    title: 'First Steps',
    description: 'Complete your first game',
    icon: '🎮',
  },
  'high-scorer': {
    title: 'High Achiever',
    description: 'Score over 1000 points',
    icon: '🏆',
  },
  'practice-master': {
    title: 'Practice Makes Perfect',
    description: 'Play 50 games',
    icon: '⭐',
  },
  'perfect-match': {
    title: 'Perfect Match',
    description: '10 matches in a row',
    icon: '🎯',
  },
  'speed-typer': {
    title: 'Speed Demon',
    description: 'Average score over 100',
    icon: '⚡',
  },
  'calligrapher': {
    title: 'Master Calligrapher',
    description: '20 writing sessions',
    icon: '✒️',
  },
  'listener': {
    title: 'Golden Ear',
    description: '90% listening accuracy',
    icon: '👂',
  },
  'sentence-master': {
    title: 'Sentence Sage',
    description: '5 perfect sentences in a row',
    icon: '📝',
  },
};

export default function GameStatsPage() {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<GameProgress[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [allAchievements, setAllAchievements] = useState<string[]>([]);

  useEffect(() => {
    if (!session?.user) {
      redirect('/auth/signin');
    } else {
      fetchProgress();
    }
  }, [session]);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/games/progress');
      if (!response.ok) throw new Error('Failed to fetch progress');
      
      const data = await response.json();
      setProgress(data);

      // Calculate totals
      const xp = data.reduce((sum: number, game: GameProgress) => sum + game.totalXP, 0);
      const games = data.reduce((sum: number, game: GameProgress) => sum + game.gamesPlayed, 0);
      const achievements = [...new Set(data.flatMap((game: GameProgress) => game.achievements))];

      setTotalXP(xp);
      setTotalGamesPlayed(games);
      setAllAchievements(achievements);
    } catch (error) {
      console.error('Error fetching game progress:', error);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Game Statistics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold">Total XP</h3>
              <p className="text-2xl font-bold">{totalXP}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Games Played</h3>
              <p className="text-2xl font-bold">{totalGamesPlayed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Award className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold">Achievements</h3>
              <p className="text-2xl font-bold">{allAchievements.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Game Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {progress.map((game) => {
          const gameInfo = GAME_INFO[game.gameId as keyof typeof GAME_INFO];
          const Icon = gameInfo.icon;

          return (
            <Card key={game.gameId} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Icon className={`h-8 w-8 ${gameInfo.color}`} />
                <div>
                  <h3 className="text-lg font-semibold">{gameInfo.title}</h3>
                  <p className="text-sm text-gray-500">{gameInfo.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>High Score</span>
                    <span>{game.highScore}</span>
                  </div>
                  <Progress value={(game.highScore / 1000) * 100} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Games Played</span>
                    <p className="font-semibold">{game.gamesPlayed}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total XP</span>
                    <p className="font-semibold">{game.totalXP}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Best Streak</span>
                    <p className="font-semibold">{game.stats.longestStreak}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Accuracy</span>
                    <p className="font-semibold">
                      {((game.stats.correctAnswers / game.stats.totalAttempts) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Achievements */}
      <h2 className="text-2xl font-bold mb-4">Achievements</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(ACHIEVEMENT_INFO).map(([id, achievement]) => {
          const isUnlocked = allAchievements.includes(id);

          return (
            <Card
              key={id}
              className={`p-4 ${
                isUnlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50'
                  : 'opacity-50'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-semibold mb-1">{achievement.title}</h3>
                <p className="text-sm text-gray-500">{achievement.description}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
