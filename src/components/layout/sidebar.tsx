"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BookOpen, 
  Brain, 
  GraduationCap, 
  Settings, 
  LayoutDashboard,
  BookType,
  User,
  Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Lessons', href: '/lessons', icon: BookType },
  { name: 'Flashcards', href: '/flashcards', icon: BookOpen },
  { name: 'Vocabulary', href: '/vocabulary', icon: GraduationCap },
  { name: 'AI Assistant', href: '/ai', icon: Brain },
  { name: 'Game Stats', href: '/games/stats', icon: Trophy },
  { name: 'Profile', href: '/profile', icon: User },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn(
      "pb-12 w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "hidden lg:block", 
      className
    )}>
      <ScrollArea className="h-[calc(100vh-4rem)]"> 
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <h2 className="mb-4 px-4 text-xl font-semibold tracking-tight">
                Navigation
              </h2>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        "transition-colors duration-200", 
                        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
          <div className="px-3 py-2">
            <div className="space-y-1">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Settings
              </h2>
              <nav className="space-y-1">
                <Link
                  href="/settings"
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === "/settings" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
