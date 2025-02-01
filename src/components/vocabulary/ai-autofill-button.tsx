import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AIAutofillButtonProps {
  onAutofill: (field: string) => Promise<void>;
  isLoading: boolean;
  hasContent: boolean;
}

export function AIAutofillButton({ onAutofill, isLoading, hasContent }: AIAutofillButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
          disabled={isLoading || !hasContent}
        >
          <Sparkles className="h-4 w-4" />
          {isLoading ? "Thinking..." : "Autofill with AI"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onAutofill("all")}>
          Complete All Fields
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAutofill("word")}>
          Suggest Chinese Word
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAutofill("pinyin")}>
          Get Pinyin
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAutofill("meaning")}>
          Get Meaning
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAutofill("notes")}>
          Generate Example
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
