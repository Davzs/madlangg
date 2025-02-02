"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { IConversation } from "@/models/conversation"
import { useSession } from "next-auth/react"

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('id')
  
  const [conversations, setConversations] = useState<Array<{ _id: string; title: string }>>([])
  const [currentConversation, setCurrentConversation] = useState<IConversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchConversations()
  }, [session, status])

  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId)
    } else {
      setCurrentConversation(null)
    }
  }, [conversationId])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      setConversations(data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`)
      const data = await res.json()
      setCurrentConversation(data)
    } catch (error) {
      console.error('Error fetching conversation:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!session) return

    setIsLoading(true)
    try {
      let activeConversation = currentConversation

      // Create new conversation if none exists
      if (!activeConversation) {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: content.slice(0, 50) + '...' })
        })
        activeConversation = await res.json()
        setCurrentConversation(activeConversation)
        router.push(`/chat?id=${activeConversation._id}`)
      }

      // Add user message
      const userMessage = {
        role: 'user' as const,
        content,
        timestamp: new Date()
      }

      // Update conversation with user message
      const updateRes = await fetch(`/api/conversations/${activeConversation._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })

      const updatedConversation = await updateRes.json()
      setCurrentConversation(updatedConversation)

      // Send message to AI and get response
      const aiRes = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId: activeConversation._id
        })
      })

      const aiData = await aiRes.json()

      // Update conversation with AI response
      const finalRes = await fetch(`/api/conversations/${activeConversation._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            role: 'assistant',
            content: aiData.response,
            timestamp: new Date()
          }
        })
      })

      const finalConversation = await finalRes.json()
      setCurrentConversation(finalConversation)
      fetchConversations() // Refresh conversation list
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 border-r">
        <ChatSidebar 
          conversations={conversations}
          currentConversationId={conversationId || ''}
          onNewChat={() => {
            setCurrentConversation(null)
            router.push('/chat')
          }}
        />
      </div>
      <div className="flex-1 flex flex-col">
        <ChatMessages messages={currentConversation?.messages || []} />
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
