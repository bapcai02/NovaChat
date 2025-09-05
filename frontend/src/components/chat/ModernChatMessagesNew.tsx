"use client"

import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Star, StarOff, Smile, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Message, User } from '@/hooks/useChat'

interface ModernChatMessagesProps {
  messages: Message[]
  currentUser: User | null
  onOpenThread?: (message: { id: string; content: string; sender: string; timestamp: string }) => void
  onAddReaction?: (messageId: number, emoji: string) => void
  onRemoveReaction?: (messageId: number, emoji: string) => void
  onBookmark?: (messageId: number, note?: string) => void
  onRemoveBookmark?: (messageId: number) => void
  isLoading?: boolean
}

interface MessageBubbleProps {
  message: Message
  currentUser: User | null
  onOpenThread?: (message: { id: string; content: string; sender: string; timestamp: string }) => void
  onAddReaction?: (messageId: number, emoji: string) => void
  onRemoveReaction?: (messageId: number, emoji: string) => void
  onBookmark?: (messageId: number, note?: string) => void
  onRemoveBookmark?: (messageId: number) => void
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
  const sender = message.sender || message.user || { name: 'Unknown', avatar: undefined }
  
  const handleReaction = (emoji: string) => {
    if (isOwn) return
    
    const hasReacted = message.reactions?.some(r => 
      r.emoji === emoji && (r.users?.includes(currentUser?.id || 0) || r.user_id === currentUser?.id)
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
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={sender.avatar} />
          <AvatarFallback className="text-xs">
            {sender.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div className={cn(
        "flex flex-col gap-1 max-w-[70%]",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* Sender name and timestamp */}
        {!isOwn && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{sender.name}</span>
            <span>•</span>
            <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}

        {/* Message bubble */}
        <div className={cn(
          "relative px-4 py-2 rounded-2xl shadow-sm transition-all duration-200",
          isOwn 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-muted text-foreground rounded-bl-md"
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* Message actions - shown on hover */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-background border border-border rounded-lg px-2 py-1 shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleReaction('👍')
              }}
            >
              👍
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleReaction('❤️')
              }}
            >
              ❤️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleReply()
              }}
            >
              <MessageCircle className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleBookmark()
              }}
            >
              {message.is_bookmarked ? (
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ) : (
                <Star className="h-3 w-3" />
              )}
            </Button>
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
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleReaction(reaction.emoji)
                }}
              >
                {reaction.emoji} {reaction.count && reaction.count > 0 ? reaction.count : ''} {reaction.users?.includes(currentUser?.id || 0) || reaction.user_id === currentUser?.id ? '✓' : ''}
              </Button>
            ))}
          </div>
        )}

        {/* Timestamp for own messages */}
        {isOwn && (
          <div className="text-xs text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </motion.div>
  )
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
