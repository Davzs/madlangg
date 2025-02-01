'use client';

import { ReactNode } from 'react';
import { SessionProvider } from "next-auth/react";
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from "next-themes";
import { Toaster } from 'sonner';

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary>
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
