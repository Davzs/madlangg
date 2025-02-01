'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Brain, GraduationCap, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const features = [
  {
    icon: BookOpen,
    title: 'Interactive Flashcards',
    description: 'Master Mandarin characters through spaced repetition learning'
  },
  {
    icon: GraduationCap,
    title: 'Vocabulary Lists',
    description: 'Organized word collections for effective learning'
  },
  {
    icon: Brain,
    title: 'AI Assistant',
    description: 'Get instant help with pronunciation and translations'
  },
  {
    icon: Star,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed statistics'
  }
];

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col -mx-[max(1rem,calc((100vw-80rem)/2+1rem))] -mt-8">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <motion.div 
          className="w-full max-w-[90rem] mx-auto px-4 flex flex-col items-center text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to MandApp
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Your personal Mandarin learning companion powered by AI. Master Chinese characters, 
            vocabulary, and pronunciation with our interactive tools.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline">
                Create Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24">
        <div className="w-full max-w-[90rem] mx-auto px-4">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={item}>
                  <Card className="h-full">
                    <CardHeader>
                      <Icon className="h-10 w-10 text-primary" />
                      <CardTitle className="mt-4">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full border-t bg-muted/50">
        <div className="w-full max-w-[90rem] mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to start your Mandarin journey?
            </h2>
            <p className="text-muted-foreground">
              Join thousands of learners mastering Mandarin with MandApp
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="mt-4">
                Sign Up Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
