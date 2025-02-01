import { getServerSession } from "next-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, BrainCircuit, Flashlight, TrendingUp, Clock, Star, Trophy, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import StartSessionButton from "./start-session-button";

export default async function DashboardPage() {
  const session = await getServerSession();
  const currentTime = new Date();
  const greetingTime = currentTime.getHours();
  
  const getGreeting = () => {
    if (greetingTime < 12) return "Good morning";
    if (greetingTime < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, {session?.user?.name}! 👋</h1>
            <Badge variant="secondary" className="animate-pulse">Premium</Badge>
          </div>
          <p className="text-muted-foreground">
            Your daily progress is looking great! Keep up the momentum.
          </p>
        </div>
        <StartSessionButton />
      </div>

      {/* Achievement Banner */}
      <Card className="bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-950/80 dark:to-orange-950/80 border-none">
        <CardContent className="flex items-center gap-4 py-4 px-6">
          <div className="p-2.5 bg-amber-200/90 dark:bg-amber-900/90 rounded-full">
            <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold">New Achievement Unlocked! 🎉</h3>
            <p className="text-muted-foreground text-sm">You've completed a 7-day study streak</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-background hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Characters Mastered</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground mt-1">+32 this week</p>
            <Progress value={78} className="mt-3" />
            <p className="text-xs text-muted-foreground mt-2">78% to next level</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Study Streak</CardTitle>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs">Level 3</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground">Personal best: 12 days</p>
            <Progress value={58} className="mt-3" />
            <p className="text-xs text-muted-foreground mt-2">3 days to next reward</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Progress</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Accuracy rate</p>
            <Progress value={92} className="mt-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Target: 85%</span>
              <span className="text-green-600">Exceeding!</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-background hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5h</div>
            <p className="text-xs text-muted-foreground">This week</p>
            <Progress value={85} className="mt-3" />
            <p className="text-xs text-muted-foreground mt-2">+2.3h vs last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Features */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900 group-hover:scale-110 transition-transform">
                <Flashlight className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <CardTitle>Flashcards</CardTitle>
                <CardDescription>Master new characters daily</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Due for review today</span>
              <Badge variant="secondary" className="font-medium">23 cards</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Completion rate</span>
              <span className="font-medium text-green-600">95%</span>
            </div>
            <Link href="/flashcards" className="block">
              <Button className="w-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                Review Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <CardTitle>Vocabulary</CardTitle>
                <CardDescription>Expand your word knowledge</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Words learned</span>
              <Badge variant="secondary" className="font-medium">150 words</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Daily goal</span>
              <span className="font-medium text-blue-600">8/10 words</span>
            </div>
            <Link href="/vocabulary" className="block">
              <Button className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Learn More
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900 group-hover:scale-110 transition-transform">
                <BrainCircuit className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>Get personalized help</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Available 24/7</span>
              <Badge variant="secondary" className="font-medium animate-pulse">Online</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Recent sessions</span>
              <span className="font-medium text-green-600">12 chats</span>
            </div>
            <Link href="/ai" className="block">
              <Button className="w-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                Chat with AI
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
