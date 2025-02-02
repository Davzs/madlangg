'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Bot, User, Plus, X, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { VocabularyDialog } from '@/components/vocabulary/vocabulary-dialog';
import { useSession } from "next-auth/react";
import { IMessage } from "@/models/conversation";
import { useRouter } from 'next/navigation';
import { useVocabulary } from '@/hooks/useVocabulary';

interface StructuredResponse {
  chinese: string;
  pinyin: string;
  english: string;
  explanation?: string;
}

interface AIResponse {
  rawResponse: string;
  structuredResponses: StructuredResponse[];
  hasChinese: boolean;
  audioOptions: {
    speeds: string[];
    available: boolean;
  };
}

interface FormattedMessage {
  chinese?: string;
  pinyin?: string;
  english?: string;
  text?: string;
  isChineseWord?: boolean;
}

function hasChinese(text: string): boolean {
  // Check if the text contains Chinese characters
  const chineseCharRegex = /[\u4e00-\u9fff]/;
  return chineseCharRegex.test(text);
}

function formatAIResponse(content: string): FormattedMessage[] {
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  const messages: Array<{
    isChineseWord?: boolean;
    chinese?: string;
    pinyin?: string;
    english?: string;
    text?: string;
  }> = [];

  let currentBlock = {
    chinese: '',
    pinyin: '',
    english: '',
    isChineseWord: false
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    const nextNextLine = lines[i + 2];

    // Check if this is a Chinese character line
    if (hasChinese(line)) {
      // If we have a previous block, push it
      if (currentBlock.chinese) {
        messages.push({ ...currentBlock });
        currentBlock = {
          chinese: '',
          pinyin: '',
          english: '',
          isChineseWord: false
        };
      }

      // Start a new Chinese word block
      if (nextLine && /^[a-z0-9\s]+$/i.test(nextLine)) {
        currentBlock = {
          chinese: line,
          pinyin: nextLine,
          english: nextNextLine || '',
          isChineseWord: true
        };
        i += 2; // Skip the next two lines since we've processed them
      } else {
        // If it's just Chinese text without pinyin/translation
        messages.push({
          text: line
        });
      }
    } else if (!currentBlock.chinese) {
      // If it's regular text and we're not in a Chinese block
      messages.push({
        text: line
      });
    }
  }

  // Push any remaining block
  if (currentBlock.chinese) {
    messages.push({ ...currentBlock });
  }

  return messages;
}

function convertNumbersToTones(pinyin: string): string {
  return pinyin.replace(/([a-zA-Z]+)([1-5])/g, (match, letters, tone) => {
    const vowels = 'aeiouüvAEIOUÜV';
    const toneMarks = {
      a: ['ā', 'á', 'ǎ', 'à', 'a'],
      e: ['ē', 'é', 'ě', 'è', 'e'],
      i: ['ī', 'í', 'ǐ', 'ì', 'i'],
      o: ['ō', 'ó', 'ǒ', 'ò', 'o'],
      u: ['ū', 'ú', 'ǔ', 'ù', 'u'],
      ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
      v: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
    };

    let found = false;
    let result = letters;

    // Find the last vowel in the syllable
    for (let i = letters.length - 1; i >= 0; i--) {
      const char = letters[i].toLowerCase();
      if (vowels.includes(char)) {
        const vowel = char === 'v' ? 'ü' : char;
        const toneChar = toneMarks[vowel][parseInt(tone) - 1];
        result = letters.slice(0, i) + toneChar + letters.slice(i + 1);
        found = true;
        break;
      }
    }

    return found ? result : match;
  });
}

function MessageContent({ 
  content, 
  role, 
  timestamp 
}: { 
  content: string; 
  role: 'user' | 'assistant';
  timestamp: Date;
}) {
  const { addWordFromChat } = useVocabulary();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow'>('normal');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const chineseVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('zh') || 
        voice.name.toLowerCase().includes('chinese')
      );
      setVoices(chineseVoices);
      if (chineseVoices.length > 0) {
        setSelectedVoice(chineseVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = useCallback((text: string, speed: 'normal' | 'slow' = 'normal') => {
    if (!selectedVoice) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = speed === 'normal' ? 1.0 : 0.7;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [selectedVoice]);

  const handleAddToVocabulary = useCallback(async (chinese: string, pinyin: string, english: string) => {
    if (addedWords.has(chinese)) return;
    
    try {
      setError(null);
      await addWordFromChat({
        chinese,
        pinyin: convertNumbersToTones(pinyin),
        english
      });
      
      setAddedWords(prev => new Set(prev).add(chinese));
    } catch (err) {
      setError('Failed to add word to vocabulary. Please try again.');
      console.error('Error adding word to vocabulary:', err);
    }
  }, [addWordFromChat, addedWords]);

  // Parse the content for Chinese text
  const messages = formatAIResponse(content);

  return (
    <div className="space-y-4">
      {messages.map((msg, index) => {
        if (msg.isChineseWord && msg.chinese) {
          const isAdded = addedWords.has(msg.chinese);
          const formattedPinyin = msg.pinyin ? convertNumbersToTones(msg.pinyin) : '';
          
          return (
            <div key={index} className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xl font-medium">{msg.chinese}</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isSpeaking || !selectedVoice}
                    onClick={() => speakText(msg.chinese!, playbackSpeed)}
                    className="h-8 w-8"
                  >
                    {isSpeaking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span role="img" aria-label="speak">🔊</span>
                    )}
                  </Button>
                  <select
                    className="bg-transparent border rounded px-2 py-1 text-sm"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(e.target.value as 'normal' | 'slow')}
                  >
                    <option value="normal">Normal</option>
                    <option value="slow">Slow</option>
                  </select>
                </div>
              </div>
              {formattedPinyin && (
                <div className="text-sm text-muted-foreground font-mono">{formattedPinyin}</div>
              )}
              {msg.english && (
                <div className="text-sm">{msg.english}</div>
              )}
              {error && (
                <div className="text-sm text-red-500">{error}</div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (msg.chinese && msg.pinyin && msg.english) {
                    handleAddToVocabulary(msg.chinese, msg.pinyin, msg.english);
                  }
                }}
                className="mt-2 h-8"
                disabled={!msg.chinese || !msg.pinyin || !msg.english || isAdded}
              >
                {isAdded ? (
                  <>
                    <span className="text-green-500 mr-2">✓</span>
                    Added to Vocabulary
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Vocabulary
                  </>
                )}
              </Button>
            </div>
          );
        } else {
          return (
            <div key={index} className="whitespace-pre-wrap">
              {msg.text || msg.english || ''}
            </div>
          );
        }
      })}
    </div>
  );
}

function ChatList({ 
  conversations, 
  currentId, 
  onSelect,
  onNewChat,
  onRefresh 
}: { 
  conversations: any[];
  currentId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRefresh: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleEdit = async (id: string, newName: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newName }),
      });

      if (!response.ok) throw new Error('Failed to update conversation');
      
      onRefresh();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete conversation');
      
      onRefresh();
      if (currentId === id) {
        onNewChat();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="default"
        className="w-full justify-start"
        onClick={onNewChat}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Chat
      </Button>
      {conversations.map((conv) => (
        <div
          key={conv._id}
          className={cn(
            "flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-muted/50 relative group",
            currentId === conv._id && "bg-muted"
          )}
        >
          <button
            className="flex-1 text-left truncate"
            onClick={() => onSelect(conv._id)}
          >
            {editingId === conv._id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  if (editName.trim()) {
                    handleEdit(conv._id, editName);
                  }
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editName.trim()) {
                    handleEdit(conv._id, editName);
                  }
                }}
                className="w-full bg-transparent border-none focus:outline-none"
                autoFocus
              />
            ) : (
              <span className="truncate">{conv.title || 'New Chat'}</span>
            )}
          </button>
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(conv._id);
                setEditName(conv.title || '');
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(conv._id);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AIAssistant() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch conversations on mount
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchConversations();
  }, [session, status]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    }
  };

  const handleSelectConversation = async (id: string) => {
    try {
      setCurrentConversationId(id);
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) throw new Error('Failed to fetch conversation');
      const data = await response.json();
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load conversation');
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(undefined);
    setMessages([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !session) return;

    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    };

    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Create new conversation if needed
      if (!currentConversationId) {
        const createResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: input.slice(0, 50),
            messages: [userMessage],
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || 'Failed to create conversation');
        }

        const newConversation = await createResponse.json();
        setCurrentConversationId(newConversation._id);
        await fetchConversations();
      } else {
        // Add message to existing conversation
        const updateResponse = await fetch(`/api/conversations/${currentConversationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || 'Failed to update conversation');
        }
      }

      // Get AI response
      const aiResponse = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await aiResponse.json();
      if (!data.rawResponse) {
        throw new Error('Invalid AI response format');
      }

      const assistantMessage = {
        role: 'assistant' as const,
        content: data.rawResponse,
        timestamp: new Date(),
        hasChinese: data.hasChinese,
        speaker: data.speaker,
      };

      // Add assistant message to conversation
      if (currentConversationId) {
        const updateResponse = await fetch(`/api/conversations/${currentConversationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: assistantMessage }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || 'Failed to save AI response');
        }
      }

      setMessages(prev => [...prev, assistantMessage]);
      await fetchConversations();
    } catch (err) {
      console.error('Error in chat:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setMessages(prev => prev.slice(0, -1)); // Remove the user message if there was an error
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-background border-r p-2 flex flex-col">
        <ChatList 
          conversations={conversations} 
          currentId={currentConversationId} 
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
          onRefresh={fetchConversations}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4"
              >
                <Card className="p-4">
                  <div className="flex items-start gap-4">
                    {message.role === 'assistant' ? (
                      <Bot className="h-8 w-8 mt-1" />
                    ) : (
                      <User className="h-8 w-8 mt-1" />
                    )}
                    <div className="flex-1">
                      <MessageContent
                        content={message.content}
                        role={message.role}
                        timestamp={message.timestamp}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 mx-4 mt-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-[95%] mx-auto">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Mandarin..."
              className="min-h-[60px] flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="h-[60px] w-[60px] self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
