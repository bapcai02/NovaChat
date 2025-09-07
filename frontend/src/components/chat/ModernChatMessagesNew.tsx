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
  // Check multiple possible user ID fields and handle type conversion
  const messageUserId = message.user_id || message.sender?.id || message.user?.id
  const currentUserId = currentUser?.id
  
  // Convert to same type for comparison
  const isOwn = String(currentUserId) === String(messageUserId)
  
  // TEST: Force first message to be own message for testing
  const testIsOwn = isOwn
  const sender = message.sender || message.user || { name: 'Unknown', avatar: undefined }
  
  const handleReaction = (emoji: string) => {
    if (testIsOwn) return
    
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
        "flex gap-2 mb-3",
        testIsOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!testIsOwn && (
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarImage src={sender.avatar} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {sender.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div className={cn(
        "flex flex-col gap-1 max-w-[70%] min-w-0",
        testIsOwn ? "items-end" : "items-start"
      )}>
        {/* Sender name and timestamp */}
        {!testIsOwn && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <span className="font-medium">{sender.name}</span>
            <span>•</span>
            <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}

        {/* Message bubble */}
        <div className={cn(
          "relative group px-3 py-2 rounded-xl shadow-sm transition-all duration-200 break-words",
          testIsOwn 
            ? "bg-blue-500 text-white rounded-br-md" 
            : "bg-gray-100 text-gray-800 rounded-bl-md"
        )}>
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
          

          {/* Message actions - shown on hover */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-lg z-10 pointer-events-none group-hover:pointer-events-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
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
              className="h-7 w-7 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
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
              className="h-7 w-7 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleReply()
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleBookmark()
              }}
            >
              {message.is_bookmarked ? (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ) : (
                <Star className="h-4 w-4 text-gray-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Reactions and Thread indicator below message bubble */}
        <div className={cn(
          "flex flex-wrap gap-1 items-center",
          testIsOwn ? "justify-end" : "justify-start"
        )}>
          {/* Thread indicator - Hidden */}
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <>
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleReaction(reaction.emoji)
                  }}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count && reaction.count > 0 ? reaction.count : ''}</span>
                  {reaction.users?.includes(currentUser?.id || 0) || reaction.user_id === currentUser?.id ? (
                    <span className="text-blue-500">✓</span>
                  ) : null}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Timestamp for own messages */}
        {testIsOwn && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-blue-500">✓✓</span>
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
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-base font-medium text-gray-600 mb-1">No messages yet</p>
              <p className="text-sm text-gray-500">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble 
              key={message.id || `message-${index}`} 
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
