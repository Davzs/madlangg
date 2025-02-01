"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface ChatSidebarProps {
  chats: {
    id: string
    title: string
  }[]
}

export function ChatSidebar({ chats }: ChatSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="pb-12 w-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant="secondary"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/chat">
                <PlusCircle className="h-4 w-4" />
                New chat
              </Link>
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Your conversations
          </h2>
          <div className="space-y-1">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant={pathname === `/chat/${chat.id}` ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start font-normal",
                  pathname === `/chat/${chat.id}` && "bg-muted font-medium"
                )}
                asChild
              >
                <Link href={`/chat/${chat.id}`}>{chat.title}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
