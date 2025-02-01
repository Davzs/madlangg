'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AIButton } from '@/components/ui/ai-button';
import { slideUp, containerVariants } from '@/lib/animations';
import { AnimatedField } from '@/components/ui/animated-field';
import { cn } from '@/lib/utils';

interface VocabularyDialogProps {
  onSuccess?: () => void;
  initialWord?: {
    _id?: string;
    word: string;
    pinyin: string;
    meaning: string;
    category?: string;
    examples?: Array<{
      chinese: string;
      pinyin: string;
      english: string;
    }>;
  };
  trigger?: React.ReactNode;
  onWordSaved?: () => void;
  onWordAdded?: (word: any) => void;
}

const PREDEFINED_CATEGORIES = [
  "General",
  "Food",
  "Travel",
  "Business",
  "Technology",
  "Education",
  "Entertainment",
  "Sports",
  "Health",
  "Other"
];

const formSchema = z.object({
  word: z.string().min(1, "Chinese word is required"),
  pinyin: z.string().min(1, "Pinyin is required"),
  meaning: z.string().min(1, "English meaning is required"),
  category: z.string().min(1, "Category is required"),
  examples: z.array(z.object({
    chinese: z.string(),
    pinyin: z.string(),
    english: z.string()
  })).optional()
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  word: "",
  pinyin: "",
  meaning: "",
  category: "General",
  examples: []
};

export function VocabularyDialog({ onSuccess, initialWord, trigger, onWordSaved, onWordAdded }: VocabularyDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingFields, setUpdatingFields] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialWord ? {
      ...defaultValues,
      ...initialWord,
      category: initialWord.category || defaultValues.category,
      examples: initialWord.examples || defaultValues.examples,
    } : defaultValues,
  });

  const handleAutofill = async (field: string) => {
    if (isAutofilling) return;
    setIsAutofilling(true);

    try {
      // Get current values
      const currentWord = form.getValues("word");
      const currentPinyin = form.getValues("pinyin");
      const currentMeaning = form.getValues("meaning");

      // Check if we have at least one value when not autofilling all
      if (field !== "all" && !currentWord && !currentPinyin && !currentMeaning) {
        toast.error("Please enter at least one field (word, pinyin, or meaning)");
        return;
      }

      const response = await fetch("/api/vocabulary/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: currentWord,
          pinyin: currentPinyin,
          meaning: currentMeaning,
          field,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to autofill");
      }

      const data = await response.json();

      if (field === "all") {
        const updates = [
          { field: "word", value: data.word || "" },
          { field: "pinyin", value: data.pinyin || "" },
          { field: "meaning", value: data.meaning || "" },
          { field: "category", value: PREDEFINED_CATEGORIES.includes(data.category || "") ? data.category : "General" },
          { field: "examples", value: data.examples || [] }
        ];

        updates.forEach(({ field, value }) => {
          form.setValue(field as any, value);
          setUpdatingFields((prev) => [...prev, field]);
          setTimeout(() => {
            setUpdatingFields((prev) =>
              prev.filter((f) => f !== field)
            );
          }, 1000);
        });
      } else {
        form.setValue(field as any, data[field] || "");
        setUpdatingFields((prev) => [...prev, field]);
        setTimeout(() => {
          setUpdatingFields((prev) =>
            prev.filter((f) => f !== field)
          );
        }, 1000);
      }

      toast.success("Autofill successful");
    } catch (error) {
      console.error("Autofill error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to autofill");
    } finally {
      setIsAutofilling(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      const requiredFields = ['word', 'pinyin', 'meaning', 'category'];
      for (const field of requiredFields) {
        if (!values[field as keyof typeof values]) {
          toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
          return;
        }
      }

      const response = await fetch("/api/vocabulary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          examples: values.examples || []
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to save word");
      }

      const savedWord = await response.json();
      
      // Reset form
      form.reset({
        word: "",
        pinyin: "",
        meaning: "",
        category: "General",
        examples: []
      });

      // Close dialog and show success message
      setOpen(false);
      toast.success("Word added successfully!");

      // Trigger refresh of vocabulary list if provided
      onWordAdded?.(savedWord);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save word");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Word
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-hidden">
        <DialogHeader className="bg-background pb-4">
          <DialogTitle>
            {initialWord ? "Edit Word" : "Add New Word"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4 overflow-y-auto pr-4 max-h-[calc(90vh-8rem)] scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent hover:scrollbar-thumb-accent/80"
          >
            <div className="flex justify-end bg-background">
              <AIButton
                onClick={() => handleAutofill("all")}
                isLoading={isAutofilling}
              >
                Autofill with AI
              </AIButton>
            </div>

            <AnimatedField
              label="Chinese Word"
              {...form.register("word")}
              placeholder="你好"
              value={form.watch("word")}
              isUpdating={updatingFields.includes("word")}
            />

            <AnimatedField
              label="Pinyin"
              {...form.register("pinyin")}
              placeholder="nǐ hǎo"
              value={form.watch("pinyin")}
              isUpdating={updatingFields.includes("pinyin")}
            />

            <AnimatedField
              label="English Meaning"
              {...form.register("meaning")}
              placeholder="hello"
              value={form.watch("meaning")}
              isUpdating={updatingFields.includes("meaning")}
            />

            <motion.div
              variants={slideUp}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="grid w-full gap-1.5"
            >
              <Label>Category</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger className={cn(
                  "transition-colors duration-200",
                  isAutofilling && "border-blue-500/50 bg-blue-50/5 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]"
                )}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Examples Section */}
            <motion.div
              variants={slideUp}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="space-y-3 pb-16"
            >
              <Label>Example Sentences</Label>
              <div className="space-y-4">
                {form.watch("examples")?.map((example: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="rounded-lg border bg-card p-4 space-y-2"
                  >
                    <div className="space-y-1">
                      <div className="text-lg font-chinese">{example.chinese}</div>
                      <div className="text-sm text-muted-foreground">{example.pinyin}</div>
                      <div className="text-sm">{example.english}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="flex justify-end space-x-2 pt-4 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 absolute bottom-0 left-0 right-0 p-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading || isAutofilling || isSubmitting}
                className={cn(
                  "relative",
                  isSubmitting && "cursor-not-allowed opacity-50"
                )}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {initialWord ? (
                  "Save Changes"
                ) : (
                  "Add Word"
                )}
              </Button>
            </div>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
