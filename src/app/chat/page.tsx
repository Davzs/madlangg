"use client"

import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { useState } from "react"

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock chat data - replace with real data from your MongoDB
  const mockChats = [
    { id: "1", title: "Create Html Game Environment..." },
    { id: "2", title: "Apply To Leave For Emergency" },
    { id: "3", title: "What Is UI UX Design?" },
    { id: "4", title: "Create POS System" },
    { id: "5", title: "What Is UX Audit?" },
  ]

  const handleSendMessage = async (content: string) => {
    setIsLoading(true)
    // Add user message
    setMessages(prev => [...prev, { role: "user", content }])

    try {
      // Here you would normally make an API call to your AI endpoint
      // For now, we'll just mock a response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "This is a mock response. Replace this with real AI integration."
        }])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 border-r">
        <ChatSidebar chats={mockChats} />
      </div>
      <div className="flex-1 flex flex-col">
        <ChatMessages messages={messages} />
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
