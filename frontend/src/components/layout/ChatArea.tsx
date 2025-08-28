"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { KeyboardShortcuts } from '@/components/ui/keyboard-shortcuts'
import { SearchModal } from '@/components/ui/search-modal'
import { NotificationCenter } from '@/components/ui/notification-center'
import { NotificationBadge } from '@/components/ui/notification-badge'
import { ToastNotification } from '@/components/ui/toast-notification'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { cn } from '@/lib/utils'

interface ChatAreaProps {
  onToggleRightSidebar: () => void
  onThreadSelect: (messageId: string, messageContent: string) => void
  selectedChat: { type: 'channel' | 'conversation', id: number, title: string } | null
}

import { api } from '@/services/api'

export const ChatArea: React.FC<ChatAreaProps> = ({ onToggleRightSidebar, onThreadSelect, selectedChat }) => {
  const [currentChannel, setCurrentChannel] = useState('general')
  const [isMuted, setIsMuted] = useState(false)
  useEffect(() => {
    if (selectedChat) {
      setCurrentChannel(selectedChat.title)
    }
  }, [selectedChat])

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(2)
  const [toastNotifications, setToastNotifications] = useState<Array<{
    id: string
    type: 'message' | 'mention' | 'reaction' | 'system' | 'file'
    title: string
    message: string
    sender?: { name: string; username: string; avatar?: string }
    channel?: string
  }>>([])

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification)
    // TODO: Navigate to the notification target
  }

  const handleToastAction = (action: 'navigate' | 'reply' | 'dismiss') => {
    console.log('Toast action:', action)
    // TODO: Handle toast actions
  }

  const addToastNotification = (notification: any) => {
    const id = Date.now().toString()
    setToastNotifications(prev => [...prev, { ...notification, id }])
  }

  const removeToastNotification = (id: string) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Simulate incoming notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const notifications = [
          {
            type: 'mention' as const,
            title: 'You were mentioned',
            message: '@you Check out this new feature!',
            sender: { name: 'John Doe', username: 'johndoe' },
            channel: 'general'
          },
          {
            type: 'reaction' as const,
            title: 'New reaction',
            message: '👍 on your message',
            sender: { name: 'Jane Smith', username: 'janesmith' },
            channel: 'random'
          },
          {
            type: 'message' as const,
            title: 'New message',
            message: 'Hey, can you review this PR?',
            sender: { name: 'Mike Johnson', username: 'mikejohnson' },
            channel: 'dev-team'
          }
        ]
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
        addToastNotification(randomNotification)
        setNotificationCount(prev => prev + 1)
      }
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-1 flex flex-col bg-[hsl(222.2_84%_4.9%)] overflow-hidden">
      {/* Header */}
                  <div className="h-14 bg-[hsl(217.2_32.6%_17.5%)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-[hsl(var(--chat-text-muted))] text-lg">#</span>
            <h1 className="text-sm font-semibold">{currentChannel}</h1>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[hsl(var(--chat-text-muted))]">
            <span>•</span>
            <span>3 members</span>
            <span>•</span>
            <span>Public channel</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <ThemeToggle />
          <NotificationBadge
            count={notificationCount}
            onClick={() => setIsNotificationCenterOpen(true)}
            className="h-7 w-7"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setIsSearchOpen(true)}
            title="Search (Ctrl/Cmd + K)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-7 w-7", isMuted && "text-red-500")}
            title={isMuted ? "Unmute (Ctrl/Cmd + M)" : "Mute (Ctrl/Cmd + M)"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          </Button>
          
          <div className="w-px h-5 bg-[hsl(var(--chat-border))] mx-1"></div>
          
          <KeyboardShortcuts
            onSearch={() => setIsSearchOpen(true)}
            onToggleTheme={() => console.log('Theme toggle triggered')}
            onToggleRightSidebar={onToggleRightSidebar}
            onToggleMute={() => setIsMuted(!isMuted)}
            onFileUpload={() => console.log('File upload triggered')}
            onEmojiPicker={() => console.log('Emoji picker triggered')}
            onCloseModals={() => console.log('Close modals triggered')}
            onOpenNotifications={() => setIsNotificationCenterOpen(true)}
          />
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onResultSelect={(result) => {
          console.log('Search result selected:', result)
          // TODO: Navigate to the selected result
        }}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onNotificationClick={handleNotificationClick}
      />

      {/* Toast Notifications */}
      {toastNotifications.map((notification, index) => (
        <ToastNotification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          sender={notification.sender}
          channel={notification.channel}
          onClose={removeToastNotification}
          onAction={handleToastAction}
        />
      ))}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-[hsl(var(--chat-border))] scrollbar-track-transparent hover:scrollbar-thumb-[hsl(var(--chat-text-muted))]">
        <MessageList onThreadSelect={onThreadSelect} selectedChat={selectedChat ? { type: selectedChat.type, id: selectedChat.id } : null} />
      </div>

      {/* Input Area */}
                  <div className="bg-[hsl(217.2_32.6%_17.5%)] p-3 flex-shrink-0">
        <MessageInput />
      </div>
    </div>
  )
}
