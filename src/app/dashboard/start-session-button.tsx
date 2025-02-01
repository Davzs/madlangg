"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function StartSessionButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const startSession = async () => {
    setIsLoading(true);
    try {
      // Find the next available lesson
      const response = await fetch("/api/lessons?status=not_started");
      if (!response.ok) throw new Error("Failed to fetch lessons");
      
      const data = await response.json();
      if (data.lessons && data.lessons.length > 0) {
        // Redirect to the first available lesson
        router.push(`/lessons/${data.lessons[0]._id}`);
      } else {
        // If no new lessons, show completed message
        toast({
          title: "All caught up!",
          description: "You've completed all available lessons. Check back later for more!",
        });
        router.push('/lessons');
      }
    } catch (error) {
      console.error("Failed to start session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start learning session. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
      onClick={startSession}
      disabled={isLoading}
    >
      {isLoading ? "Starting..." : "Start Today's Session"}
    </Button>
  );
}
