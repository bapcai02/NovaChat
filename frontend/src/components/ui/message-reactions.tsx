"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Reaction {
  emoji: string
  count: number
  users: string[]
  isReacted?: boolean
}

interface MessageReactionsProps {
  reactions: Reaction[]
  messageId: string
  onReactionAdd?: (messageId: string, emoji: string) => void
  onReactionRemove?: (messageId: string, emoji: string) => void
  className?: string
}

const COMMON_REACTIONS = ['👍', '❤️', '😄', '😮', '😢', '😡', '🎉', '🚀']

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  messageId,
  onReactionAdd,
  onReactionRemove,
  className
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  const handleReactionClick = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji)
    
    if (existingReaction?.isReacted) {
      onReactionRemove?.(messageId, emoji)
    } else {
      onReactionAdd?.(messageId, emoji)
    }
    setShowReactionPicker(false)
  }

  const handleQuickReaction = (emoji: string) => {
    handleReactionClick(emoji)
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {/* Existing reactions */}
      {reactions.map((reaction, index) => (
        <button
          key={`${reaction.emoji}-${index}`}
          onClick={() => handleReactionClick(reaction.emoji)}
          className={cn(
            "flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors",
            "bg-[hsl(var(--chat-message-bg))] border border-[hsl(var(--chat-border))]",
            "hover:bg-[hsl(var(--chat-message-hover))]",
            reaction.isReacted && "bg-[hsl(var(--chat-accent-light))] border-[hsl(var(--chat-accent))]"
          )}
        >
          <span>{reaction.emoji}</span>
          <span className="text-[hsl(var(--chat-text-muted))]">{reaction.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="h-6 w-6 p-0 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))]"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </Button>

        {/* Quick reaction picker */}
        {showReactionPicker && (
          <div className="absolute bottom-full left-0 mb-2 z-50 bg-[hsl(var(--chat-bg))] border border-[hsl(var(--chat-border))] rounded-lg p-2 shadow-lg">
            <div className="grid grid-cols-4 gap-1">
              {COMMON_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleQuickReaction(emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-[hsl(var(--chat-message-hover))] rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
