"use client"

import React, { useState, useEffect } from 'react'
import { Button } from './button'
import { Avatar } from './avatar'
import { cn } from '@/lib/utils'

interface ToastNotificationProps {
  id: string
  type: 'message' | 'mention' | 'reaction' | 'system' | 'file'
  title: string
  message: string
  sender?: {
    name: string
    username: string
    avatar?: string
  }
  channel?: string
  duration?: number
  onClose: (id: string) => void
  onAction?: (action: 'navigate' | 'reply' | 'dismiss') => void
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  type,
  title,
  message,
  sender,
  channel,
  duration = 5000,
  onClose,
  onAction
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Show notification with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto-hide notification
    const hideTimer = setTimeout(() => {
      if (!isHovered) {
        setIsVisible(false)
        setTimeout(() => onClose(id), 300) // Wait for animation
      }
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [id, duration, isHovered, onClose])

  const getNotificationIcon = (type: ToastNotificationProps['type']) => {
    switch (type) {
      case 'mention':
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        )
      case 'reaction':
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        )
      case 'message':
        return (
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
        )
      case 'file':
        return (
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
        )
      case 'system':
        return (
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        )
    }
  }

  const handleAction = (action: 'navigate' | 'reply' | 'dismiss') => {
    onAction?.(action)
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-80 bg-[hsl(217.2_32.6%_17.5%)] border border-[hsl(217.2_32.6%_17.5%)] rounded-lg shadow-2xl p-4 transition-all duration-300",
        isVisible 
          ? "translate-x-0 opacity-100" 
          : "translate-x-full opacity-0"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-3">
        {getNotificationIcon(type)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-[hsl(210_40%_98%)]">
              {title}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction('dismiss')}
              className="h-4 w-4 text-[hsl(215.4_16.3%_56.9%)] hover:text-[hsl(210_40%_98%)]"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          <p className="text-sm text-[hsl(215.4_16.3%_56.9%)] mt-1">
            {message}
          </p>
          {sender && (
            <div className="flex items-center space-x-2 mt-2">
              <Avatar
                fallback={sender.name}
                size="xs"
                src={sender.avatar}
              />
              <span className="text-xs text-[hsl(215.4_16.3%_56.9%)]">
                {sender.name}
              </span>
              {channel && (
                <>
                  <span className="text-xs text-[hsl(215.4_16.3%_56.9%)]">in</span>
                  <span className="text-xs text-[hsl(217.2_91.2%_59.8%)]">
                    #{channel}
                  </span>
                </>
              )}
            </div>
          )}
          {type !== 'system' && (
            <div className="flex space-x-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('navigate')}
                className="text-xs h-6 px-2"
              >
                View
              </Button>
              {type === 'message' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('reply')}
                  className="text-xs h-6 px-2"
                >
                  Reply
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
