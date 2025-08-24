"use client"

import React from 'react'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

interface NotificationBadgeProps {
  count: number
  onClick?: () => void
  className?: string
  showBadge?: boolean
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  onClick,
  className,
  showBadge = true
}) => {
  if (!showBadge || count === 0) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "relative p-2 hover:bg-[hsl(215_25%_27%)] rounded-lg transition-colors",
          className
        )}
        title="Notifications"
      >
        <svg className="w-5 h-5 text-[hsl(215.4_16.3%_56.9%)]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        </svg>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 hover:bg-[hsl(215_25%_27%)] rounded-lg transition-colors",
        className
      )}
      title={`${count} notifications`}
    >
      <svg className="w-5 h-5 text-[hsl(215.4_16.3%_56.9%)]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
      </svg>
      <Badge
        variant="destructive"
        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium"
      >
        {count > 99 ? '99+' : count}
      </Badge>
    </button>
  )
}
