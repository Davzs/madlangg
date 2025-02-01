import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MatchingCard {
  id: string;
  content: string;
  type: 'character' | 'pinyin' | 'translation';
  matched: boolean;
  flipped: boolean;
}

export function MatchingGame() {
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<MatchingCard[]>([]);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Example cards - in production this would come from your database
    const wordSets = [
      { character: '你好', pinyin: 'nǐ hǎo', translation: 'hello' },
      { character: '谢谢', pinyin: 'xiè xiè', translation: 'thank you' },
      // Add more sets as needed
    ];

    const gameCards: MatchingCard[] = [];
    wordSets.forEach((set, index) => {
      gameCards.push(
        {
          id: `char-${index}`,
          content: set.character,
          type: 'character',
          matched: false,
          flipped: false,
        },
        {
          id: `pin-${index}`,
          content: set.pinyin,
          type: 'pinyin',
          matched: false,
          flipped: false,
        },
        {
          id: `trans-${index}`,
          content: set.translation,
          type: 'translation',
          matched: false,
          flipped: false,
        }
      );
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  };

  const handleCardClick = (clickedCard: MatchingCard) => {
    if (isLocked || clickedCard.matched || clickedCard.flipped) return;

    const newCards = cards.map(card =>
      card.id === clickedCard.id ? { ...card, flipped: true } : card
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 3) {
      setIsLocked(true);
      checkForMatch(newFlippedCards, newCards);
    }
  };

  const checkForMatch = (flipped: MatchingCard[], currentCards: MatchingCard[]) => {
    setTimeout(() => {
      const [card1, card2, card3] = flipped;
      const isMatch = checkIfCardsMatch(card1, card2, card3);

      const updatedCards = currentCards.map(card => ({
        ...card,
        matched: card.matched || (isMatch && flipped.some(f => f.id === card.id)),
        flipped: card.matched || (isMatch && flipped.some(f => f.id === card.id)),
      }));

      setCards(updatedCards);
      setFlippedCards([]);
      setIsLocked(false);

      if (isMatch) {
        setMatches(m => m + 1);
      }
    }, 1000);
  };

  const checkIfCardsMatch = (card1: MatchingCard, card2: MatchingCard, card3: MatchingCard) => {
    // In production, this would check against your database of correct matches
    return true; // Simplified for demo
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Matching Game</h2>
            <Button onClick={initializeGame}>New Game</Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {cards.map((card) => (
              <Button
                key={card.id}
                variant={card.flipped ? "secondary" : "outline"}
                className={cn(
                  "h-24 text-lg",
                  card.matched && "opacity-50 cursor-default"
                )}
                onClick={() => handleCardClick(card)}
              >
                {card.flipped || card.matched ? card.content : '?'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
