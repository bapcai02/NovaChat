"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from './button'
import { Avatar } from './avatar'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

interface Notification {
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
  timestamp: Date
  isRead: boolean
  action?: {
    type: 'navigate' | 'reply' | 'dismiss'
    data?: any
  }
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  onNotificationClick?: (notification: Notification) => void
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'mention',
    title: 'You were mentioned',
    message: '@you Check out this new feature!',
    sender: {
      name: 'John Doe',
      username: 'johndoe',
      avatar: '/api/placeholder/32/32'
    },
    channel: 'general',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isRead: false,
    action: {
      type: 'navigate',
      data: { channel: 'general', messageId: '123' }
    }
  },
  {
    id: '2',
    type: 'reaction',
    title: 'New reaction',
    message: '👍 on your message',
    sender: {
      name: 'Jane Smith',
      username: 'janesmith',
      avatar: '/api/placeholder/32/32'
    },
    channel: 'random',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    isRead: false,
    action: {
      type: 'navigate',
      data: { channel: 'random', messageId: '456' }
    }
  },
  {
    id: '3',
    type: 'message',
    title: 'New message',
    message: 'Hey, can you review this PR?',
    sender: {
      name: 'Mike Johnson',
      username: 'mikejohnson',
      avatar: '/api/placeholder/32/32'
    },
    channel: 'dev-team',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: true,
    action: {
      type: 'navigate',
      data: { channel: 'dev-team' }
    }
  },
  {
    id: '4',
    type: 'file',
    title: 'File shared',
    message: 'document.pdf was shared in #general',
    sender: {
      name: 'Sarah Wilson',
      username: 'sarahwilson',
      avatar: '/api/placeholder/32/32'
    },
    channel: 'general',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: true,
    action: {
      type: 'navigate',
      data: { channel: 'general', fileId: '789' }
    }
  },
  {
    id: '5',
    type: 'system',
    title: 'System update',
    message: 'New features are now available!',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    action: {
      type: 'dismiss'
    }
  }
]

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNotificationClick
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'mentions'>('all')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio for notification sounds
    audioRef.current = new Audio('/sounds/notification.mp3')
    audioRef.current.volume = 0.3
  }, [])

  const getNotificationIcon = (type: Notification['type']) => {
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

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    )

    // Play sound if enabled
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      })
    }

    // Call parent handler
    onNotificationClick?.(notification)
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead
    if (activeTab === 'mentions') return n.type === 'mention'
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[hsl(217.2_32.6%_17.5%)] rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden border border-[hsl(217.2_32.6%_17.5%)]">
        {/* Header */}
        <div className="p-4 border-b border-[hsl(217.2_32.6%_17.5%)] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">🔔</span>
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn("h-6 w-6", soundEnabled ? "text-[hsl(217.2_91.2%_59.8%)]" : "text-[hsl(215.4_16.3%_56.9%)]")}
              title={soundEnabled ? "Sound enabled" : "Sound disabled"}
            >
              {soundEnabled ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[hsl(217.2_32.6%_17.5%)]">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'mentions', label: 'Mentions', count: notifications.filter(n => n.type === 'mention').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "text-[hsl(217.2_91.2%_59.8%)] border-b-2 border-[hsl(217.2_91.2%_59.8%)]"
                  : "text-[hsl(215.4_16.3%_56.9%)] hover:text-[hsl(210_40%_98%)]"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="p-3 border-b border-[hsl(217.2_32.6%_17.5%)] flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs"
          >
            Mark all as read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Clear all
          </Button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto max-h-[50vh]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-[hsl(215.4_16.3%_56.9%)]">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-[hsl(217.2_32.6%_17.5%)]">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "p-4 hover:bg-[hsl(215_25%_27%)] transition-colors cursor-pointer",
                    !notification.isRead && "bg-[hsl(217.2_91.2%_20%)]"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-[hsl(210_40%_98%)]">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-[hsl(215.4_16.3%_56.9%)]">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-[hsl(215.4_16.3%_56.9%)] mt-1">
                        {notification.message}
                      </p>
                      {notification.sender && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Avatar
                            fallback={notification.sender.name}
                            size="xs"
                            src={notification.sender.avatar}
                          />
                          <span className="text-xs text-[hsl(215.4_16.3%_56.9%)]">
                            {notification.sender.name}
                          </span>
                          {notification.channel && (
                            <>
                              <span className="text-xs text-[hsl(215.4_16.3%_56.9%)]">in</span>
                              <span className="text-xs text-[hsl(217.2_91.2%_59.8%)]">
                                #{notification.channel}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-[hsl(217.2_91.2%_59.8%)] rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
