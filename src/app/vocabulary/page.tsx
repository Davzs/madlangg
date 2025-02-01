'use client';

import { useState, useEffect, useCallback, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { VocabularyList } from "@/components/vocabulary/vocabulary-list";
import { VocabularyDialog } from '@/components/vocabulary/vocabulary-dialog';
import { VocabularyActions } from '@/components/vocabulary/vocabulary-actions';
import { VocabularyFilters } from '@/components/vocabulary/vocabulary-filters';
import { useVocabularyList } from "@/hooks/useVocabulary";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { Plus } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

// Separate loading component
function LoadingState() {
  return (
    <div className="container px-4 py-6 md:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Skeleton className="h-10 w-full sm:w-72" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Skeleton className="h-10 w-80" />
        </div>
      </div>
    </div>
  );
}

// Main content component
function VocabularyContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status: authStatus } = useSession();
  
  const [total, setTotal] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { words, isLoading, fetchWords } = useVocabularyList();

  // Get current values from URL
  const currentSearch = searchParams.get("search") || "";
  const currentFilter = searchParams.get("filter") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1");
  
  // Debounce the search term
  const debouncedSearch = useDebounce(currentSearch, 300);

  // Create query string helper
  const createQueryString = useCallback(
    (params: { [key: string]: string | number | null }) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all" || value === 1) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });

      return newSearchParams.toString();
    },
    [searchParams]
  );

  // Navigation handlers
  const handleSearch = useCallback((value: string) => {
    if (!mounted) return;
    const queryString = createQueryString({
      search: value,
      page: 1,
      filter: currentFilter,
    });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  }, [mounted, createQueryString, currentFilter, pathname, router]);

  const handleFilterChange = useCallback((value: string) => {
    if (!mounted) return;
    const queryString = createQueryString({
      search: currentSearch,
      page: 1,
      filter: value,
    });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  }, [mounted, createQueryString, currentSearch, pathname, router]);

  const handlePageChange = useCallback((page: number) => {
    if (!mounted) return;
    const queryString = createQueryString({
      search: currentSearch,
      page,
      filter: currentFilter,
    });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  }, [mounted, createQueryString, currentSearch, currentFilter, pathname, router]);

  const handleRefresh = useCallback(() => {
    fetchWords(currentPage, debouncedSearch, currentFilter);
  }, [currentPage, debouncedSearch, currentFilter, fetchWords]);

  // Mount effect
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Data fetching effect
  useEffect(() => {
    if (!mounted || authStatus !== 'authenticated') return;

    const loadData = async () => {
      const data = await fetchWords(currentPage, debouncedSearch, currentFilter);
      setTotal(data.total);
    };
    loadData();
  }, [mounted, authStatus, currentPage, debouncedSearch, currentFilter, fetchWords]);

  // Auth handling
  if (authStatus === 'loading' || !mounted) {
    return <LoadingState />;
  }

  if (authStatus === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="container px-4 py-6 md:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">My Vocabulary</h1>
          <div className="flex items-center gap-2">
            <VocabularyActions
              onImport={handleRefresh}
              onRefresh={handleRefresh}
            />
            <VocabularyDialog 
              onSuccess={() => {
                if (mounted) {
                  fetchWords(currentPage, debouncedSearch, currentFilter);
                }
              }} 
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <VocabularyFilters
            search={currentSearch}
            filter={currentFilter}
            onSearchChange={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </div>

        <Suspense fallback={<LoadingState />}>
          <VocabularyList 
            words={words} 
            isLoading={isLoading} 
            onWordUpdate={handleRefresh}
            onWordDelete={handleRefresh}
          />
        </Suspense>

        {total > ITEMS_PER_PAGE && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
              onPageChange={(page) => {
                const queryString = createQueryString({
                  search: currentSearch,
                  page,
                  filter: currentFilter,
                });
                router.push(`${pathname}?${queryString}`, { scroll: false });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Default export wraps the content in Suspense
export default function VocabularyPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VocabularyContent />
    </Suspense>
  );
}
