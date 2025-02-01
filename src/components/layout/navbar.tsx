"use client"

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { UserMenu } from '@/components/user-menu'
import { Sidebar } from './sidebar'
import { ModeToggle } from '@/components/mode-toggle'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export function Navbar() {
  const { data: session, status } = useSession();
  const [cachedSession, setCachedSession] = useState<any>(null);

  useEffect(() => {
    // On mount, try to get cached session
    const cached = localStorage.getItem('userSession');
    if (cached) {
      setCachedSession(JSON.parse(cached));
    }
  }, []);

  useEffect(() => {
    // When session changes and is available, cache it
    if (session) {
      localStorage.setItem('userSession', JSON.stringify(session));
      setCachedSession(session);
    }
  }, [session]);

  // Use cached session while loading
  const effectiveSession = status === 'loading' ? cachedSession : session;
  
  // Don't render anything while checking authentication
  if (status === "loading") {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">MandApp</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">MandApp</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {effectiveSession ? (
            <>
              <UserMenu />
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[300px]">
                    <div className="py-2 px-4 border-b">
                      <span className="font-bold text-xl">MandApp</span>
                    </div>
                    <Sidebar className="block lg:hidden border-none" />
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
