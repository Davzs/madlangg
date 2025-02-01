import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import LessonComponent from './lesson';
import { STATIC_LESSONS } from '@/data/static-lessons';

interface Props {
  params: {
    id: string;
  };
}

export default async function LessonPage({ params }: Props) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  // Find the lesson from static lessons
  const lesson = STATIC_LESSONS.find(l => l._id === params.id);

  if (!lesson) {
    redirect('/lessons');
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <Card className="p-6">
        <LessonComponent lesson={lesson} />
      </Card>
    </div>
  );
}
