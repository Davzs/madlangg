"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface VocabularyFiltersProps {
  search: string;
  filter: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}

const categories = [
  { value: "general", label: "General" },
  { value: "greetings", label: "Greetings" },
  { value: "numbers", label: "Numbers" },
  { value: "food", label: "Food" },
  { value: "travel", label: "Travel" },
  { value: "business", label: "Business" },
];

export function VocabularyFilters({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: VocabularyFiltersProps) {
  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search words..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Categories</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.value}
                variant="outline"
                className={cn(
                  "cursor-pointer hover:bg-primary/10 transition-colors",
                  filter === category.value && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={() => onFilterChange(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
