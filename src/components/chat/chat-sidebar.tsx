"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PlusCircle, Trash2, Edit2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

interface ChatSidebarProps {
  conversations: {
    _id: string
    title: string
  }[]
  currentConversationId: string
  onNewChat: () => void
}

export function ChatSidebar({ conversations, currentConversationId, onNewChat }: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleEdit = async (id: string, newTitle: string) => {
    try {
      await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      })
      setEditingId(null)
      window.location.reload() // Refresh to update titles
    } catch (error) {
      console.error('Error updating conversation title:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, {
        method: 'DELETE'
      })
      setDeleteId(null)
      if (id === currentConversationId) {
        onNewChat()
      } else {
        window.location.reload() // Refresh to update list
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  return (
    <div className="pb-12 w-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant="secondary"
              className="w-full justify-start gap-2"
              onClick={onNewChat}
            >
              <PlusCircle className="h-4 w-4" />
              New chat
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Your conversations
          </h2>
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div key={conv._id} className="flex items-center gap-2">
                {editingId === conv._id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleEdit(conv._id, editTitle)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant={currentConversationId === conv._id ? "secondary" : "ghost"}
                      className={cn(
                        "flex-1 justify-start font-normal truncate",
                        currentConversationId === conv._id && "bg-muted font-medium"
                      )}
                      asChild
                    >
                      <Link href={`/chat?id=${conv._id}`}>{conv.title}</Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingId(conv._id)
                        setEditTitle(conv.title)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteId(conv._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
