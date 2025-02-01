'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Download, Upload, MoreHorizontal, Trash, RefreshCw, SortAsc } from 'lucide-react';
import { IVocabulary } from '@/models/Vocabulary';

interface VocabularyActionsProps {
  onImport?: () => void;
  onSort?: (criteria: string) => void;
  onRefresh?: () => void;
  onBulkDelete?: () => void;
}

const validateVocabularyData = (data: any[]): boolean => {
  if (!Array.isArray(data)) return false;
  
  return data.every(item => 
    typeof item === 'object' &&
    typeof item.word === 'string' &&
    typeof item.pinyin === 'string' &&
    typeof item.meaning === 'string' &&
    (!item.notes || typeof item.notes === 'string') &&
    (!item.category || typeof item.category === 'string')
  );
};

export function VocabularyActions({
  onImport,
  onSort,
  onRefresh,
  onBulkDelete,
}: VocabularyActionsProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);

      if (!file.name.endsWith('.json')) {
        throw new Error('Please select a JSON file');
      }

      const text = await file.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON file format');
      }

      if (!validateVocabularyData(data)) {
        throw new Error('Invalid vocabulary data format');
      }

      const response = await fetch('/api/vocabulary/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import vocabulary');
      }

      toast({
        title: 'Import Successful',
        description: `Successfully imported ${data.length} words`,
      });

      setImportDialogOpen(false);
      onImport?.();

    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import vocabulary',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const response = await fetch('/api/vocabulary/export');
      if (!response.ok) {
        throw new Error('Failed to export vocabulary');
      }

      const data = await response.json();
      
      // Format the data for better readability
      const formattedData = JSON.stringify(data, null, 2);
      
      // Create blob and download
      const blob = new Blob([formattedData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `vocabulary-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Successfully exported ${data.length} words`,
      });

    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export vocabulary',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
      setExportDialogOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch('/api/vocabulary', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete all words');
      }

      toast('All words deleted successfully');
      onBulkDelete();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting all words:', error);
      toast('Failed to delete all words');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Words
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export Words
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSort?.('alphabetical')}>
            <SortAsc className="mr-2 h-4 w-4" />
            Sort Alphabetically
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRefresh?.()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh List
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete All Words
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Vocabulary</DialogTitle>
            <DialogDescription>
              Select a JSON file containing your vocabulary words.
              The file should contain an array of words with the following format:
              {`
[
  {
    "word": "你好",
    "pinyin": "nǐ hǎo",
    "meaning": "hello",
    "notes": "Common greeting",
    "category": "Greetings"
  }
]`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              disabled={isImporting}
            />
            <div className="text-sm text-muted-foreground">
              Note: Existing words with the same Chinese characters will be updated.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Words</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all vocabulary words? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete All'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
