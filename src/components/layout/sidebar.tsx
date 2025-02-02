"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Brain, 
  GraduationCap, 
  Settings, 
  LayoutDashboard, 
  BookType, 
  User, 
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/store/use-sidebar';
import '@/styles/sidebar.css';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Lessons', 
    href: '/lessons', 
    icon: BookType 
  },
  { 
    name: 'Flashcards', 
    href: '/flashcards', 
    icon: BookOpen 
  },
  { 
    name: 'Vocabulary', 
    href: '/vocabulary', 
    icon: GraduationCap 
  },
  { 
    name: 'AI Assistant', 
    href: '/ai', 
    icon: Brain 
  },
  { 
    name: 'Game Stats', 
    href: '/games/stats', 
    icon: Trophy 
  },
  { 
    name: 'Profile', 
    href: '/profile', 
    icon: User 
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebar();

  return (
    <>
      <aside className={cn("sidebar fixed left-0 top-0 z-20 flex h-full flex-col bg-white border-r border-gray-200", 
        isCollapsed && "collapsed",
        className
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center px-6">
          
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-violet-100 text-violet-900" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    "sidebar-icon h-5 w-5",
                    isActive ? "text-violet-600" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                <span className="sidebar-content">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="border-t border-gray-200 px-3 py-4">
          <Link
            href="/settings"
            className={cn(
              "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/settings" 
                ? "bg-violet-100 text-violet-900" 
                : "text-gray-700 hover:bg-gray-100"
            )}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings 
              className={cn(
                "sidebar-icon h-5 w-5",
                pathname === "/settings" ? "text-violet-600" : "text-gray-400 group-hover:text-gray-500"
              )}
              strokeWidth={pathname === "/settings" ? 2.5 : 2}
            />
            <span className="sidebar-content">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className={cn(
        "main-content min-h-screen",
        isCollapsed && "collapsed"
      )}>
        {/* Your page content will be rendered here */}
      </main>
    </>
  );
}
