"use client"

import React from 'react'
import { Avatar } from './avatar'
import { cn } from '@/lib/utils'

interface ReadUser {
  id: string
  name: string
  username: string
  avatar?: string
  readAt: string
}

interface ReadReceiptsProps {
  users: ReadUser[]
  totalRecipients: number
  className?: string
  showAvatars?: boolean
  compact?: boolean
}

export const ReadReceipts: React.FC<ReadReceiptsProps> = ({ 
  users, 
  totalRecipients, 
  className,
  showAvatars = true,
  compact = false
}) => {
  if (users.length === 0) return null

  const unreadCount = totalRecipients - users.length
  const hasUnread = unreadCount > 0

  const getReadText = () => {
    if (compact) {
      if (users.length === totalRecipients) {
        return 'Read by all'
      } else if (users.length === 1) {
        return `Read by ${users[0].name}`
      } else {
        return `Read by ${users.length}/${totalRecipients}`
      }
    } else {
      if (users.length === totalRecipients) {
        return 'Read by everyone'
      } else if (users.length === 1) {
        return `Read by ${users[0].name}`
      } else if (users.length === 2) {
        return `Read by ${users[0].name} and ${users[1].name}`
      } else if (users.length === 3) {
        return `Read by ${users[0].name}, ${users[1].name}, and ${users[2].name}`
      } else {
        return `Read by ${users[0].name} and ${users.length - 1} others`
      }
    }
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Read Status Icon */}
      <div className="flex items-center space-x-1">
        {hasUnread ? (
          <svg className="w-3 h-3 text-[hsl(var(--chat-text-muted))]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        ) : (
          <svg className="w-3 h-3 text-[hsl(var(--chat-accent))]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )}
      </div>

      {/* User Avatars (if enabled) */}
      {showAvatars && (
        <div className="flex -space-x-1">
          {users.slice(0, 3).map((user) => (
            <Avatar
              key={user.id}
              fallback={user.name}
              size="xs"
              className="border border-[hsl(var(--chat-bg))]"
            />
          ))}
          {users.length > 3 && (
            <div className="w-5 h-5 bg-[hsl(var(--chat-accent))] rounded-full border border-[hsl(var(--chat-bg))] flex items-center justify-center text-xs text-white font-medium">
              +{users.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Read Text */}
      <span className={cn(
        "text-xs",
        hasUnread ? "text-[hsl(var(--chat-text-muted))]" : "text-[hsl(var(--chat-accent))]"
      )}>
        {getReadText()}
      </span>

      {/* Unread Count */}
      {hasUnread && (
        <span className="text-xs text-[hsl(var(--chat-text-muted))]">
          ({unreadCount} unread)
        </span>
      )}
    </div>
  )
}
