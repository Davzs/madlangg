'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  GraduationCap, 
  MessageCircle,
  Trophy,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'conversation' | 'culture';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  estimatedTime: number;
  content: {
    exercises: any[];
  };
}

export default function LessonList() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLessons() {
      try {
        const response = await fetch('/api/lessons');
        if (!response.ok) throw new Error('Failed to fetch lessons');
        const data = await response.json();
        setLessons(data.lessons);
      } catch (err) {
        setError('Failed to load lessons. Please try again later.');
        console.error('Error fetching lessons:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading lessons...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vocabulary':
        return <BookOpen className="h-4 w-4" />;
      case 'grammar':
        return <GraduationCap className="h-4 w-4" />;
      case 'conversation':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-primary/10 text-primary hover:bg-primary/20';
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {lessons.map((lesson) => (
        <Link key={lesson._id} href={`/lessons/${lesson._id}`}>
          <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn(
                    "capitalize font-medium",
                    getDifficultyColor(lesson.difficulty)
                  )}>
                    {lesson.difficulty}
                  </Badge>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{lesson.estimatedTime}m</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{lesson.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {lesson.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(lesson.type)}
                  <span className="capitalize">{lesson.type}</span>
                </div>
                <div className="flex items-center text-amber-500">
                  <Trophy className="h-4 w-4 mr-1" />
                  <span>{lesson.xpReward} XP</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  {lesson.content.exercises.length} exercises
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
