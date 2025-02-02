"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { IMessage } from "@/models/conversation"
import { AddToVocabularyButton } from "./add-to-vocabulary-button"

interface ChatMessagesProps {
  messages: IMessage[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const hasChinese = (text: string) => /[\u4e00-\u9fff]/.test(text)

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
          <div className="flex-1 space-y-2">
            <div
              className={cn(
                "rounded-lg px-4 py-2 max-w-[80%] inline-block",
                message.role === "assistant"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted"
              )}
            >
              {message.content}
            </div>
            {message.role === "assistant" && hasChinese(message.content) && (
              <div className="flex items-center gap-2 justify-end">
                <AddToVocabularyButton text={message.content} />
                {message.speaker && (
                  <div className="text-xs text-muted-foreground">
                    Speaker: {message.speaker}
                  </div>
                )}
              </div>
            )}
            <div
              className={cn(
                "text-xs text-muted-foreground",
                message.role === "assistant" ? "text-right" : "text-left"
              )}
            >
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
