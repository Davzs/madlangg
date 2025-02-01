import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LessonList from './lesson-list';
import GamesSection from '@/components/games/GamesSection';

export default async function LessonsPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Chinese Learning</h1>
          <p className="text-muted-foreground text-lg">
            Master Chinese through interactive lessons and games. Practice vocabulary, grammar, and cultural insights.
          </p>
        </div>

        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
          </TabsList>
          <TabsContent value="lessons">
            <Card className="p-6">
              <LessonList />
            </Card>
          </TabsContent>
          <TabsContent value="games">
            <GamesSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
