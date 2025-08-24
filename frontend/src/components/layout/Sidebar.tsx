"use client"

import React, { useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

interface Channel {
  id: string
  name: string
  type: 'channel' | 'direct'
  unreadCount?: number
  isActive?: boolean
  lastMessage?: string
  lastMessageTime?: string
  avatar?: string
}

const mockChannels: Channel[] = [
  { id: '1', name: 'general', type: 'channel', unreadCount: 3, isActive: true },
  { id: '2', name: 'random', type: 'channel', unreadCount: 0 },
  { id: '3', name: 'announcements', type: 'channel', unreadCount: 1 },
  { id: '4', name: 'John Doe', type: 'direct', unreadCount: 2 },
  { id: '5', name: 'Jane Smith', type: 'direct', unreadCount: 0 },
  { id: '6', name: 'Mike Johnson', type: 'direct', unreadCount: 0 },
]

export const Sidebar: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState('1')
  const [showDirectMessages, setShowDirectMessages] = useState(true)

  return (
    <div className="w-56 flex-shrink-0 chat-sidebar flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[hsl(var(--chat-border))] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <h1 className="text-sm font-semibold">NovaChat</h1>
          </div>
          <div className="flex items-center space-x-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-3 border-b border-[hsl(var(--chat-border))] flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Avatar 
            fallback="Your Name" 
            size="sm"
            className="ring-1 ring-[hsl(var(--chat-accent))]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">Your Name</p>
            <p className="text-xs text-[hsl(var(--chat-text-muted))]">Online</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Channels Section */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-[hsl(var(--chat-text-muted))] uppercase tracking-wider">
              Channels
            </h2>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Button>
          </div>
          
          <div className="space-y-0.5">
            {mockChannels.filter(c => c.type === 'channel').map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={cn(
                  "w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-left transition-colors duration-200",
                  activeChannel === channel.id
                    ? "bg-[hsl(var(--chat-accent-light))] text-[hsl(var(--chat-accent))]"
                    : "hover:bg-[hsl(var(--chat-message-hover))] text-[hsl(var(--chat-text))]"
                )}
              >
                <span className="text-[hsl(var(--chat-text-muted))] text-sm">#</span>
                <span className="flex-1 truncate text-xs">{channel.name}</span>
                {channel.unreadCount && channel.unreadCount > 0 && (
                  <Badge variant="default" className="ml-auto text-xs h-4 px-1.5">
                    {channel.unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="p-3 border-t border-[hsl(var(--chat-border))]">
          <button
            onClick={() => setShowDirectMessages(!showDirectMessages)}
            className="flex items-center justify-between w-full mb-2 text-xs font-semibold text-[hsl(var(--chat-text-muted))] uppercase tracking-wider hover:text-[hsl(var(--chat-text))] transition-colors"
          >
            Direct Messages
            <svg 
              className={cn("w-3 h-3 transition-transform", showDirectMessages && "rotate-90")} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {showDirectMessages && (
            <div className="space-y-0.5">
              {mockChannels.filter(c => c.type === 'direct').map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={cn(
                    "w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-left transition-colors duration-200",
                    activeChannel === channel.id
                      ? "bg-[hsl(var(--chat-accent-light))] text-[hsl(var(--chat-accent))]"
                      : "hover:bg-[hsl(var(--chat-message-hover))] text-[hsl(var(--chat-text))]"
                  )}
                >
                  <Avatar 
                    fallback={channel.name} 
                    size="sm"
                    className="w-5 h-5 text-xs"
                  />
                  <span className="flex-1 truncate text-xs">{channel.name}</span>
                  {channel.unreadCount && channel.unreadCount > 0 && (
                    <Badge variant="default" className="ml-auto text-xs h-4 px-1.5">
                      {channel.unreadCount}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
