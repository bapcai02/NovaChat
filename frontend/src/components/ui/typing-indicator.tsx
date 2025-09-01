"use client"

import React from 'react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface TypingUser {
  id: string
  name: string
  username: string
  avatar?: string
}

interface TypingIndicatorProps {
  users: TypingUser[]
  className?: string
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users, className }) => {
  if (users.length === 0) return null

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing...`
    } else if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing...`
    } else {
      return `${users[0].name} and ${users.length - 1} others are typing...`
    }
  }

  return (
    <div className={cn("flex items-center space-x-3 p-3", className)}>
      {/* User avatars */}
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user, index) => (
          <Avatar
            key={user.id}
            fallback={user.name}
            size="sm"
            className="border-2 border-[hsl(var(--chat-bg))]"
          />
        ))}
        {users.length > 3 && (
          <div className="w-8 h-8 bg-[hsl(var(--chat-text-muted))] rounded-full border-2 border-[hsl(var(--chat-bg))] flex items-center justify-center text-xs text-white">
            +{users.length - 3}
          </div>
        )}
      </div>

      {/* Typing indicator */}
      <div className="flex-1">
        <div className="text-xs text-[hsl(var(--chat-text-muted))] mb-1">
          {getTypingText()}
        </div>
        <div className="flex space-x-1">
          <div className="typing-dot w-2 h-2 bg-[hsl(var(--chat-text-muted))] rounded-full animate-bounce"></div>
          <div className="typing-dot w-2 h-2 bg-[hsl(var(--chat-text-muted))] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="typing-dot w-2 h-2 bg-[hsl(var(--chat-text-muted))] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
