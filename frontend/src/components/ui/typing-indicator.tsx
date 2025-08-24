"use client"

import React, { useState, useEffect } from 'react'
import { Avatar } from './avatar'
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
  const [dotAnimation, setDotAnimation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDotAnimation(prev => (prev + 1) % 3)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  if (users.length === 0) return null

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing`
    } else if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing`
    } else if (users.length === 3) {
      return `${users[0].name}, ${users[1].name}, and ${users[2].name} are typing`
    } else {
      return `${users[0].name} and ${users.length - 1} others are typing`
    }
  }

  return (
    <div className={cn("flex items-center space-x-2 p-2 text-xs text-[hsl(var(--chat-text-muted))]", className)}>
      {/* User Avatars */}
      <div className="flex -space-x-1">
        {users.slice(0, 3).map((user, index) => (
          <Avatar
            key={user.id}
            fallback={user.name}
            size="sm"
            className="border-2 border-[hsl(var(--chat-bg))]"
          />
        ))}
        {users.length > 3 && (
          <div className="w-6 h-6 bg-[hsl(var(--chat-accent))] rounded-full border-2 border-[hsl(var(--chat-bg))] flex items-center justify-center text-xs text-white font-medium">
            +{users.length - 3}
          </div>
        )}
      </div>

      {/* Typing Text */}
      <span className="flex-1">{getTypingText()}</span>

      {/* Animated Dots */}
      <div className="flex items-center space-x-1">
        <div
          className={cn(
            "w-1 h-1 bg-[hsl(var(--chat-text-muted))] rounded-full transition-all duration-300",
            dotAnimation >= 0 && "animate-pulse"
          )}
        />
        <div
          className={cn(
            "w-1 h-1 bg-[hsl(var(--chat-text-muted))] rounded-full transition-all duration-300",
            dotAnimation >= 1 && "animate-pulse"
          )}
        />
        <div
          className={cn(
            "w-1 h-1 bg-[hsl(var(--chat-text-muted))] rounded-full transition-all duration-300",
            dotAnimation >= 2 && "animate-pulse"
          )}
        />
      </div>
    </div>
  )
}
