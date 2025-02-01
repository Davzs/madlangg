"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { VocabularyWord } from "@/types/vocabulary";
import { Volume2, ChevronDown, ChevronUp, CheckCircle, Copy, Trash2, Edit, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WordCardProps {
  word: VocabularyWord;
  onMarkReviewed: (wordId: string) => void;
  onDelete?: (wordId: string) => void;
  onEdit?: (wordId: string) => void;
  onUpdateConfidence?: (wordId: string, confidence: number) => void;
}

export function WordCard({ 
  word, 
  onMarkReviewed, 
  onDelete,
  onEdit,
  onUpdateConfidence 
}: WordCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = "zh-CN";
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${word.word} (${word.pinyin}) - ${word.meaning}`);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-3xl font-chinese font-bold">
                {word.word}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">{word.pinyin}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePlayAudio}
              disabled={isPlaying}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(word._id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(word._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <p className="text-lg font-medium uppercase">
            {word.meaning}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {word.category}
            </Badge>
            <Badge variant="outline" className={cn(
              "text-xs",
              word.status === "Learning" && "bg-yellow-500/10 text-yellow-500",
              word.status === "Reviewing" && "bg-blue-500/10 text-blue-500",
              word.status === "Mastered" && "bg-green-500/10 text-green-500"
            )}>
              {word.status}
            </Badge>
          </div>

          {word.examples && word.examples.length > 0 && (
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 mt-4"
                >
                  {word.examples.map((example, index) => (
                    <div key={index} className="space-y-1 bg-muted/50 p-3 rounded-lg">
                      <p className="text-lg font-chinese">{example.chinese}</p>
                      <p className="text-sm text-muted-foreground">{example.pinyin}</p>
                      <p className="text-sm">{example.english}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMarkReviewed(word._id)}
          className="text-xs"
        >
          Mark as Reviewed
        </Button>
      </CardFooter>
    </Card>
  );
}
