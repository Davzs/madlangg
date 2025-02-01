import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/use-toast';

interface GameStats {
  score: number;
  correctAnswers: number;
  totalAttempts: number;
  streak: number;
}

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

export function useGameProgress(gameId: string) {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchProgress();
    }
  }, [session]);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/games/progress');
      if (!response.ok) throw new Error('Failed to fetch progress');
      
      const allProgress = await response.json();
      const gameProgress = allProgress.find((p: GameProgress) => p.gameId === gameId);
      setProgress(gameProgress || null);
    } catch (error) {
      console.error('Error fetching game progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to load game progress',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (sessionStats: GameStats) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/games/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          sessionStats,
        }),
      });

      if (!response.ok) throw new Error('Failed to update progress');

      const updatedProgress = await response.json();
      setProgress(updatedProgress);

      // Show achievement notifications
      if (updatedProgress.achievements?.length > (progress?.achievements?.length || 0)) {
        const newAchievements = updatedProgress.achievements.filter(
          (a: string) => !progress?.achievements.includes(a)
        );
        
        newAchievements.forEach((achievement: string) => {
          toast({
            title: '🏆 Achievement Unlocked!',
            description: formatAchievementName(achievement),
          });
        });
      }

      // Show high score notification
      if (updatedProgress.highScore > (progress?.highScore || 0)) {
        toast({
          title: '🎯 New High Score!',
          description: `You scored ${updatedProgress.highScore} points!`,
        });
      }

    } catch (error) {
      console.error('Error updating game progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to save game progress',
        variant: 'destructive',
      });
    }
  };

  const formatAchievementName = (achievement: string): string => {
    const names: Record<string, string> = {
      'first-game': 'First Game Completed!',
      'high-scorer': 'High Scorer - Score over 1000!',
      'practice-master': 'Practice Master - 50 games played!',
      'perfect-match': 'Perfect Match - 10 matches in a row!',
      'speed-typer': 'Speed Typer - Average score over 100!',
      'calligrapher': 'Calligrapher - 20 writing sessions!',
      'listener': 'Expert Listener - 90% accuracy!',
      'sentence-master': 'Sentence Master - 5 perfect sentences!',
    };
    return names[achievement] || achievement;
  };

  return {
    progress,
    isLoading,
    updateProgress,
  };
}
