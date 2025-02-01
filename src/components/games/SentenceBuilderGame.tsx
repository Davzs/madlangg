'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Word {
  id: string;
  text: string;
  pinyin: string;
}

interface Sentence {
  id: string;
  words: Word[];
  english: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const mockSentences: Sentence[] = [
  {
    id: '1',
    words: [
      { id: '1-1', text: '我', pinyin: 'wǒ' },
      { id: '1-2', text: '是', pinyin: 'shì' },
      { id: '1-3', text: '学生', pinyin: 'xué shēng' },
    ],
    english: 'I am a student',
    difficulty: 'easy',
  },
  {
    id: '2',
    words: [
      { id: '2-1', text: '你', pinyin: 'nǐ' },
      { id: '2-2', text: '喜欢', pinyin: 'xǐ huān' },
      { id: '2-3', text: '中国', pinyin: 'zhōng guó' },
      { id: '2-4', text: '菜', pinyin: 'cài' },
    ],
    english: 'Do you like Chinese food?',
    difficulty: 'easy',
  },
  {
    id: '3',
    words: [
      { id: '3-1', text: '他们', pinyin: 'tā men' },
      { id: '3-2', text: '在', pinyin: 'zài' },
      { id: '3-3', text: '公园', pinyin: 'gōng yuán' },
      { id: '3-4', text: '跑步', pinyin: 'pǎo bù' },
    ],
    english: 'They are running in the park',
    difficulty: 'medium',
  },
];

export default function SentenceBuilderGame() {
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [shuffledWords, setShuffledWords] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'checking'>('waiting');

  const loadNewSentence = () => {
    const randomSentence = mockSentences[Math.floor(Math.random() * mockSentences.length)];
    setCurrentSentence(randomSentence);
    setShuffledWords([...randomSentence.words].sort(() => Math.random() - 0.5));
    setShowAnswer(false);
    setGameStatus('playing');
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(shuffledWords);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setShuffledWords(items);
  };

  const checkAnswer = () => {
    setGameStatus('checking');
    setShowAnswer(true);
    
    const isCorrect = currentSentence?.words.every(
      (word, index) => word.id === shuffledWords[index].id
    );

    if (isCorrect) {
      setScore(prev => prev + 20);
    }

    setTimeout(() => {
      loadNewSentence();
    }, 3000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Sentence Builder</h2>
          <p className="text-gray-600">
            Arrange the words to form a correct Chinese sentence
          </p>
        </div>

        {gameStatus === 'waiting' && (
          <div className="text-center">
            <p className="mb-4">Ready to practice building Chinese sentences?</p>
            <Button onClick={loadNewSentence}>Start Game</Button>
          </div>
        )}

        {(gameStatus === 'playing' || gameStatus === 'checking') && (
          <>
            <div className="mb-6">
              <p className="text-lg text-center mb-4">
                Translation: {currentSentence?.english}
              </p>
              <div className="text-center mb-4">
                <span className="text-sm text-gray-500">
                  Score: {score}
                </span>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="words" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-wrap gap-2 p-4 min-h-[100px] bg-gray-50 rounded-lg mb-6"
                  >
                    {shuffledWords.map((word, index) => (
                      <Draggable
                        key={word.id}
                        draggableId={word.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              p-2 bg-white rounded-lg shadow-sm border-2
                              ${showAnswer 
                                ? word.id === currentSentence?.words[index].id
                                  ? 'border-green-500'
                                  : 'border-red-500'
                                : 'border-transparent'
                              }
                            `}
                          >
                            <div className="text-lg">{word.text}</div>
                            <div className="text-xs text-gray-500">
                              {word.pinyin}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {showAnswer && (
              <div className="text-center mb-4">
                <p className="text-lg mb-2">Correct order:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentSentence?.words.map((word) => (
                    <div
                      key={word.id}
                      className="p-2 bg-green-100 rounded-lg"
                    >
                      <div className="text-lg">{word.text}</div>
                      <div className="text-xs text-gray-500">
                        {word.pinyin}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!showAnswer && (
              <div className="text-center">
                <Button onClick={checkAnswer}>Check Answer</Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
