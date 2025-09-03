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
    <div className={cn("hidden group-hover:flex items-center space-x-1", className)}>
      {/* Existing reactions */}
      {reactions.map((reaction, index) => (
        <button
          key={`${reaction.emoji}-${index}`}
          onClick={() => handleReactionClick(reaction.emoji)}
          className={cn(
            "flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] transition-colors",
            "bg-[hsl(var(--chat-message-bg))] border border-[hsl(var(--chat-border))]",
            "hover:bg-[hsl(var(--chat-message-hover))]",
            reaction.isReacted && "bg-[hsl(var(--chat-accent-light))] border-[hsl(var(--chat-accent))]"
          )}
        >
          <span>{reaction.emoji}</span>
          <span className="text-[10px] text-[hsl(var(--chat-text-muted))]">{reaction.count}</span>
        </button>
      ))}


    </div>
  )
}
