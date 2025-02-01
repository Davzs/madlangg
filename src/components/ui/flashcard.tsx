import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardProps {
  card: {
    simplified: string;
    pinyin: string;
    translations: {
      english: string;
      spanish?: string;
    };
    examples?: Array<{
      chinese: string;
      pinyin: string;
      translations: {
        english: string;
        spanish?: string;
      };
    }>;
  };
  showAnswer?: boolean;
  onFlip?: () => void;
  className?: string;
}

export function Flashcard({ card, showAnswer = false, onFlip, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(showAnswer);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  return (
    <div 
      className={cn(
        "perspective-1000 w-full cursor-pointer select-none",
        className
      )}
      onClick={handleFlip}
    >
      <div
        className={cn(
          "relative w-full h-[300px] transition-transform duration-500",
          "transform-style-3d",
          isFlipped ? "[transform:rotateX(180deg)]" : ""
        )}
      >
        {/* Front of card */}
        <Card className={cn(
          "absolute inset-0 w-full h-full backface-hidden",
          "flex flex-col items-center justify-center p-6 space-y-4",
          "bg-card"
        )}>
          <div className="text-4xl font-bold">{card.simplified}</div>
          <div className="text-xl text-muted-foreground">{card.pinyin}</div>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4">
            <Volume2 className="h-4 w-4" />
          </Button>
        </Card>

        {/* Back of card */}
        <Card className={cn(
          "absolute inset-0 w-full h-full backface-hidden [transform:rotateX(180deg)]",
          "flex flex-col p-6",
          "bg-card"
        )}>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Translations</h3>
              <p className="text-xl">{card.translations.english}</p>
              {card.translations.spanish && (
                <p className="text-lg text-muted-foreground">{card.translations.spanish}</p>
              )}
            </div>

            {card.examples && card.examples.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Example</h3>
                <div className="space-y-2">
                  <p className="text-lg">{card.examples[0].chinese}</p>
                  <p className="text-sm text-muted-foreground">{card.examples[0].pinyin}</p>
                  <p>{card.examples[0].translations.english}</p>
                  {card.examples[0].translations.spanish && (
                    <p className="text-sm text-muted-foreground">
                      {card.examples[0].translations.spanish}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
