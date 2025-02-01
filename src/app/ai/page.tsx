'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Bot, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { useVocabulary } from '@/hooks/useVocabulary';
import { VocabularyDialog } from '@/components/vocabulary/vocabulary-dialog';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface FormattedMessage {
  chinese?: string;
  pinyin?: string;
  english?: string;
  text?: string;
  isChineseWord?: boolean;
}

function isValidChineseWord(text: string): boolean {
  // Check if the text contains Chinese characters
  const chineseCharRegex = /[\u4e00-\u9fff]/;
  // Check if the text is a reasonable length for a word/phrase (up to 8 characters)
  const maxLength = 8;
  // Check if text is mostly Chinese characters (>50%)
  const chineseCharCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const totalLength = text.length;
  
  return chineseCharRegex.test(text) && 
         text.length <= maxLength && 
         (chineseCharCount / totalLength) > 0.5;
}

function formatAIResponse(content: string): FormattedMessage[] {
  // If the content doesn't contain Chinese characters, return as plain text
  if (!/[\u4e00-\u9fff]/.test(content)) {
    return [{ text: content, isChineseWord: false }];
  }

  const messages: FormattedMessage[] = [];
  
  // Split content into lines to handle multiple words
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  
  for (const line of lines) {
    // Match the exact format: "Chinese (pinyin) - English"
    const match = line.match(/^([\u4e00-\u9fff]+)\s*\(([^)]+)\)\s*-\s*(.+)$/);
    if (match) {
      const [_, chinese, pinyin, english] = match;
      messages.push({
        chinese: chinese.trim(),
        pinyin: pinyin.trim(),
        english: english.trim(),
        isChineseWord: true
      });
    } else {
      // Try to detect Chinese words in regular text
      const words = line.match(/[\u4e00-\u9fff]+/g) || [];
      for (const word of words) {
        if (isValidChineseWord(word)) {
          messages.push({
            chinese: word,
            text: line,
            isChineseWord: true
          });
        }
      }
      
      // Add the original line as text
      if (!words.length) {
        messages.push({ text: line, isChineseWord: false });
      }
    }
  }

  return messages;
}

function extractChineseContent(text: string): string {
  // Match Chinese characters and their pinyin
  const chineseAndPinyinRegex = /[\u4e00-\u9fff]+|(?:[a-zA-Z]+\d?\s*)+(?=[\u4e00-\u9fff]|$|\.|。)/g;
  const matches = text.match(chineseAndPinyinRegex);
  return matches ? matches.join(' ') : '';
}

function MessageContent({ content, role }: { 
  content: string; 
  role: 'user' | 'assistant';
}) {
  const { addWordFromChat, isLoading } = useVocabulary();
  const formattedMessages = formatAIResponse(content);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const chineseVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('zh') || 
        voice.name.toLowerCase().includes('chinese') || 
        voice.name.toLowerCase().includes('mandarin')
      );
      console.log('Available Chinese voices:', chineseVoices);
      setVoices(chineseVoices);
    };

    // Load voices immediately
    loadVoices();

    // Also add event listener for Chrome which loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speakText = useCallback((text: string) => {
    console.log('Speaking text:', text);
    
    if (typeof window === 'undefined') {
      console.log('Window is undefined');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set Chinese language and properties
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find and use a Chinese voice
    if (voices.length > 0) {
      utterance.voice = voices[0];
      console.log('Using voice:', voices[0].name);
    } else {
      console.log('No Chinese voices available');
    }

    // Add event handlers with debug logging
    utterance.onstart = () => {
      console.log('Started speaking');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('Finished speaking');
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
    };

    // Speak the text
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking:', error);
      setIsSpeaking(false);
    }
  }, [voices]);

  // Function to handle click on speaker button
  const handleSpeak = useCallback((chinese: string, pinyin?: string) => {
    // First try to speak just the Chinese text
    try {
      speakText(chinese);
    } catch (error) {
      console.error('Error in handleSpeak:', error);
      // If there's an error, try reinitializing speech synthesis
      window.speechSynthesis.cancel();
      setTimeout(() => {
        try {
          speakText(chinese);
        } catch (retryError) {
          console.error('Error in retry speak:', retryError);
        }
      }, 100);
    }
  }, [speakText]);

  return (
    <div className="space-y-4">
      {formattedMessages.map((msg, index) => {
        if (msg.isChineseWord && msg.chinese) {
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-medium">{msg.chinese}</p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSpeak(msg.chinese, msg.pinyin)}
                        disabled={isSpeaking}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {role === 'assistant' && (
                        <VocabularyDialog
                          initialWord={{
                            word: msg.chinese || '',
                            pinyin: msg.pinyin || '',
                            meaning: msg.english || msg.text || '',
                            notes: msg.text || '',
                          }}
                          trigger={
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Vocabulary
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </div>
                  {msg.pinyin && (
                    <p className="text-sm text-muted-foreground">{msg.pinyin}</p>
                  )}
                  {msg.english && (
                    <p className="text-sm">{msg.english}</p>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // For regular text messages
        return (
          <div key={index} className="space-y-2">
            <p className="whitespace-pre-wrap">{msg.text}</p>
          </div>
        );
      })}
    </div>
  );
}

function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [mounted, setMounted] = useState(false);

  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load voices when component mounts - only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        // Filter only Chinese voices (including both zh-CN and zh-TW)
        const chineseVoices = availableVoices.filter(voice => 
          voice.lang.startsWith('zh') || // Standard Chinese voices
          voice.name.toLowerCase().includes('chinese') || // Names containing "Chinese"
          voice.name.toLowerCase().includes('mandarin') // Names containing "Mandarin"
        );
        setVoices(chineseVoices);

        // If we have Chinese voices and no voice is selected, select the first one
        if (chineseVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(chineseVoices[0].name);
        }
      };

      loadVoices(); // Initial load
      
      // Chrome loads voices asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [selectedVoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : 'An error occurred while processing your request',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Language Assistant</h1>
        {mounted && voices.length > 0 && (
          <Select onValueChange={setSelectedVoice} value={selectedVoice}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select Mandarin voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  {`${voice.name} (${voice.lang})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <p className="text-muted-foreground">
              Get help with pronunciation, translations, and more
            </p>
          </div>
        </div>

        <Card className="flex-1 min-h-[400px] p-4 relative">
          <div className="space-y-4 mb-16">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Start a conversation with your AI language assistant
              </div>
            )}
            
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-4",
                    message.role === 'user' ? 'bg-muted/50' : 'bg-background'
                  )}
                >
                  {message.role === 'user' ? (
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-primary/10 p-2">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <MessageContent 
                      content={message.content} 
                      role={message.role}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </motion.div>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about Mandarin..."
                className="min-h-[60px] flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="h-[60px] w-[60px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AIAssistant;
