import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IFlashcard } from '@/types/flashcard';

interface FlashcardProps {
  word: IFlashcard;
  language?: 'en' | 'es';
  onMastery?: (quality: number) => void;
}

export default function Flashcard({ 
  word,
  language = 'en',
  onMastery 
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  if (!word) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No flashcard available</p>
      </Card>
    );
  }

  const translation = word.translations?.[language === 'en' ? 'english' : 'spanish'] || '';

  const handleFlip = () => {
    setIsRotating(true);
    setIsFlipped(!isFlipped);
    setTimeout(() => setIsRotating(false), 300);
  };

  const playAudio = async () => {
    try {
      if (word.audio?.male || word.audio?.female) {
        const url = word.audio.female || word.audio.male;
        if (url) {
          if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
          }
          const newAudio = new Audio(url);
          setAudioElement(newAudio);
          await newAudio.play();
        }
      } else {
        // Fallback to TTS if no audio file
        const utterance = new SpeechSynthesisUtterance(word.simplified);
        utterance.lang = 'zh-CN';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      // Fallback to TTS if audio file fails
      const utterance = new SpeechSynthesisUtterance(word.simplified);
      utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMastery = (quality: number) => {
    if (onMastery) {
      onMastery(quality);
    }
  };

  return (
    <Card className="w-full">
      <div 
        className={cn(
          "relative min-h-[400px] cursor-pointer perspective-1000",
          isRotating && "pointer-events-none"
        )}
        onClick={handleFlip}
      >
        <motion.div
          className={cn(
            "absolute w-full h-full backface-hidden",
            isFlipped ? "opacity-0" : "opacity-100"
          )}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="text-4xl font-bold mb-4">{word.simplified}</div>
            {word.traditional !== word.simplified && (
              <div className="text-2xl text-muted-foreground mb-2">
                {word.traditional}
              </div>
            )}
            <div className="text-xl text-muted-foreground">{word.pinyin}</div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation();
                playAudio();
              }}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          className={cn(
            "absolute w-full h-full backface-hidden",
            isFlipped ? "opacity-100" : "opacity-0"
          )}
          animate={{ rotateY: isFlipped ? 0 : -180 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="text-2xl font-medium mb-4">{translation}</div>
            {word.examples && word.examples.length > 0 && (
              <div className="text-center">
                <p className="text-lg mb-2">{word.examples[0].chinese}</p>
                <p className="text-muted-foreground mb-2">{word.examples[0].pinyin}</p>
                <p className="text-sm text-muted-foreground">
                  {word.examples[0].translations?.[language === 'en' ? 'english' : 'spanish']}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation();
                handleFlip();
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>

      {onMastery && (
        <div className="p-4 border-t flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleMastery(1);
            }}
          >
            Again
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleMastery(3);
            }}
          >
            Good
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleMastery(5);
            }}
          >
            Easy
          </Button>
        </div>
      )}
    </Card>
  );
}
