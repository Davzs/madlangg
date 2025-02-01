"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ChatMessagesProps {
  messages: {
    role: "user" | "assistant"
    content: string
  }[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-4 text-sm",
            message.role === "assistant" && "flex-row-reverse"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={message.role === "assistant" ? "/bot-avatar.png" : "/user-avatar.png"}
              alt={message.role}
            />
            <AvatarFallback>
              {message.role === "assistant" ? "AI" : "You"}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "rounded-lg px-4 py-2 max-w-[80%]",
              message.role === "assistant"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  )
}
