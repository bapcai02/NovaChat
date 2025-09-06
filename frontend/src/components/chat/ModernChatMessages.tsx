"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MoreHorizontal, 
  Reply, 
  Heart, 
  Smile, 
  Download, 
  Trash2, 
  Edit3,
  Copy,
  Flag,
  Pin
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar?: string
    isOnline?: boolean
  }
  timestamp: string
  isOwn: boolean
  isEdited?: boolean
  reactions?: { emoji: string; count: number; users: string[] }[]
  replies?: Message[]
  attachments?: { name: string; url: string; type: string }[]
  isPinned?: boolean
  replyTo?: {
    id: string
    content: string
    sender: string
  }
}

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hey everyone! How is the project going?',
    sender: {
      id: '1',
      name: 'John Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
      isOnline: true
    },
    timestamp: '2:30 PM',
    isOwn: false,
    reactions: [
      { emoji: '👍', count: 3, users: ['user1', 'user2', 'user3'] },
      { emoji: '❤️', count: 1, users: ['user4'] }
    ]
  },
  {
    id: '2',
    content: 'Great progress! We just finished the authentication system. The new UI components are looking amazing too! 🚀',
    sender: {
      id: '2',
      name: 'Jane Smith',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
      isOnline: true
    },
    timestamp: '2:32 PM',
    isOwn: true,
    isEdited: true,
    reactions: [
      { emoji: '🎉', count: 5, users: ['user1', 'user2', 'user3', 'user4', 'user5'] }
    ]
  },
  {
    id: '3',
    content: 'That sounds awesome! Can you share the latest design mockups?',
    sender: {
      id: '3',
      name: 'Mike Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=random',
      isOnline: false
    },
    timestamp: '2:35 PM',
    isOwn: false,
    attachments: [
      { name: 'design-mockup-v2.pdf', url: '#', type: 'pdf' },
      { name: 'screenshot.png', url: '#', type: 'image' }
    ]
  },
  {
    id: '4',
    content: 'Sure! I\'ll upload them to the shared drive and send you the link.',
    sender: {
      id: '2',
      name: 'Jane Smith',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
      isOnline: true
    },
    timestamp: '2:36 PM',
    isOwn: true
  }
]

import { Message as ChatMessage, User } from '@/hooks/useChat'

interface ModernChatMessagesProps {
  messages: ChatMessage[]
  currentUser: User | null
  onOpenThread?: (message: { id: string; content: string; sender: string; timestamp: string }) => void
  onAddReaction?: (messageId: number, emoji: string) => void
  onRemoveReaction?: (messageId: number, emoji: string) => void
  onBookmark?: (messageId: number, note?: string) => void
  onRemoveBookmark?: (messageId: number) => void
  isLoading?: boolean
}

export default function ModernChatMessages({ 
  messages, 
  currentUser, 
  onOpenThread, 
  onAddReaction, 
  onRemoveReaction, 
  onBookmark, 
  onRemoveBookmark, 
  isLoading 
}: ModernChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji)
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions?.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count + 1, users: [...r.users, 'current-user'] }
                : r
            )
          }
        } else {
          return {
            ...msg,
            reactions: [...(msg.reactions || []), { emoji, count: 1, users: ['current-user'] }]
          }
        }
      }
      return msg
    }))
  }

  const MessageBubble = ({ 
    message, 
    currentUser, 
    onOpenThread, 
    onAddReaction, 
    onRemoveReaction, 
    onBookmark, 
    onRemoveBookmark 
  }: MessageBubbleProps) => {
    const isOwn = currentUser?.id === message.user_id
    const sender = message.user || { name: 'Unknown', avatar: undefined }
    
    const handleReaction = (emoji: string) => {
      if (isOwn) return
      
      const hasReacted = message.reactions?.some(r => 
        r.emoji === emoji && r.user_id === currentUser?.id
      )
      
      if (hasReacted) {
        onRemoveReaction?.(message.id, emoji)
      } else {
        onAddReaction?.(message.id, emoji)
      }
    }

    const handleBookmark = () => {
      if (message.is_bookmarked) {
        onRemoveBookmark?.(message.id)
      } else {
        onBookmark?.(message.id)
      }
    }

    const handleReply = () => {
      onOpenThread?.({
        id: message.id.toString(),
        content: message.content,
        sender: sender.name || 'Unknown',
        timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
    }

    return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "flex gap-3 group",
        message.isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!message.isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar} />
          <AvatarFallback className="text-xs">
            {message.sender.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div className={cn(
        "flex flex-col gap-1 max-w-[70%]",
        message.isOwn ? "items-end" : "items-start"
      )}>
        {/* Sender name and timestamp */}
        {!message.isOwn && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{message.sender.name}</span>
            <span>{message.timestamp}</span>
            {message.isEdited && (
              <span className="italic">(edited)</span>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className={cn(
          "relative px-4 py-2 rounded-2xl max-w-full group-hover:shadow-lg transition-shadow duration-200",
          message.isOwn 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-muted text-foreground rounded-bl-md"
        )}>
          {/* Reply reference */}
          {message.replyTo && (
            <div className="mb-2 p-2 bg-muted/50 rounded-lg border-l-2 border-primary">
              <div className="text-xs text-muted-foreground mb-1">
                Replying to {message.replyTo.sender}
              </div>
              <div className="text-sm truncate">{message.replyTo.content}</div>
            </div>
          )}

          {/* Message content */}
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-background/50 rounded-lg cursor-pointer hover:bg-background/70 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm truncate">{attachment.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Message actions - Fixed positioning */}
          <div className={cn(
            "absolute top-0 flex items-center gap-1 p-1 bg-background border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            message.isOwn ? "left-0 -translate-x-full" : "right-0 translate-x-full"
          )}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addReaction(message.id, '👍')
              }}
            >
              <Smile className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addReaction(message.id, '❤️')
              }}
            >
              <Heart className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onOpenThread?.({
                  id: message.id,
                  content: message.content,
                  sender: message.sender.name,
                  timestamp: message.timestamp
                })
              }}
            >
              <Reply className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Reply className="mr-2 h-4 w-4" />
                  Reply
                </DropdownMenuItem>
                {message.isOwn && (
                  <DropdownMenuItem>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Pin className="mr-2 h-4 w-4" />
                  Pin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
                {message.isOwn && (
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((reaction, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => addReaction(message.id, reaction.emoji)}
              >
                <span className="mr-1">{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Own message timestamp */}
        {message.isOwn && (
          <div className="text-xs text-muted-foreground">
            {message.timestamp}
            {message.isEdited && (
              <span className="italic ml-1">(edited)</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              currentUser={currentUser}
              onOpenThread={onOpenThread}
              onAddReaction={onAddReaction}
              onRemoveReaction={onRemoveReaction}
              onBookmark={onBookmark}
              onRemoveBookmark={onRemoveBookmark}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
