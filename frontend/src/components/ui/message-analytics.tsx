"use client"

import React, { useState } from 'react'
import { Button } from './button'
import { Avatar } from './avatar'
import { cn } from '@/lib/utils'

interface MessageStats {
  id: string
  content: string
  author: {
    name: string
    username: string
    avatar?: string
  }
  timestamp: string
  readBy: Array<{
    id: string
    name: string
    username: string
    avatar?: string
    readAt: string
  }>
  reactions: Array<{
    emoji: string
    count: number
    users: Array<{
      id: string
      name: string
      username: string
      avatar?: string
    }>
  }>
  replies: Array<{
    id: string
    content: string
    author: {
      name: string
      username: string
      avatar?: string
    }
    timestamp: string
  }>
  views: number
  shares: number
  bookmarks: number
}

interface MessageAnalyticsProps {
  message: MessageStats
  isOpen: boolean
  onClose: () => void
}

export const MessageAnalytics: React.FC<MessageAnalyticsProps> = ({ message, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'readers' | 'reactions' | 'replies'>('overview')

  if (!isOpen) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'readers', label: 'Readers', icon: '👥' },
    { id: 'reactions', label: 'Reactions', icon: '😊' },
    { id: 'replies', label: 'Replies', icon: '💬' }
  ]

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getReadPercentage = () => {
    // Mock total recipients - in real app this would come from backend
    const totalRecipients = 15
    return Math.round((message.readBy.length / totalRecipients) * 100)
  }

  const getTotalReactions = () => {
    return message.reactions.reduce((total, reaction) => total + reaction.count, 0)
  }

      return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[hsl(217.2_32.6%_17.5%)] rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden border border-[hsl(217.2_32.6%_17.5%)]">
        {/* Header */}
        <div className="p-4 border-b border-[hsl(var(--chat-border))] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">📊</span>
            <h2 className="text-lg font-semibold">Message Analytics</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Message Preview */}
        <div className="p-4 border-b border-[hsl(var(--chat-border))] bg-[hsl(var(--chat-message-bg))]">
          <div className="flex items-start space-x-3">
            <Avatar fallback={message.author.name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="text-sm font-semibold">{message.author.name}</span>
                <span className="text-xs text-[hsl(var(--chat-text-muted))]">{message.timestamp}</span>
              </div>
              <p className="text-sm text-[hsl(var(--chat-text))] line-clamp-2">{message.content}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[hsl(var(--chat-border))]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-[hsl(var(--chat-accent))] border-b-2 border-[hsl(var(--chat-accent))]"
                  : "text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))]"
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[50vh]">
          {activeTab === 'overview' && (
            <div className="p-4 space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[hsl(var(--chat-message-bg))] rounded-lg">
                  <div className="text-2xl font-bold text-[hsl(var(--chat-accent))]">{getReadPercentage()}%</div>
                  <div className="text-xs text-[hsl(var(--chat-text-muted))]">Read Rate</div>
                </div>
                <div className="p-4 bg-[hsl(var(--chat-message-bg))] rounded-lg">
                  <div className="text-2xl font-bold text-[hsl(var(--chat-accent))]">{getTotalReactions()}</div>
                  <div className="text-xs text-[hsl(var(--chat-text-muted))]">Total Reactions</div>
                </div>
                <div className="p-4 bg-[hsl(var(--chat-message-bg))] rounded-lg">
                  <div className="text-2xl font-bold text-[hsl(var(--chat-accent))]">{message.replies.length}</div>
                  <div className="text-xs text-[hsl(var(--chat-text-muted))]">Replies</div>
                </div>
                <div className="p-4 bg-[hsl(var(--chat-message-bg))] rounded-lg">
                  <div className="text-2xl font-bold text-[hsl(var(--chat-accent))]">{message.views}</div>
                  <div className="text-xs text-[hsl(var(--chat-text-muted))]">Views</div>
                </div>
              </div>

              {/* Engagement Chart */}
              <div className="p-4 bg-[hsl(var(--chat-message-bg))] rounded-lg">
                <h3 className="text-sm font-medium mb-3">Engagement Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Reads</span>
                    <div className="flex-1 mx-2 h-2 bg-[hsl(var(--chat-border))] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[hsl(var(--chat-accent))] rounded-full"
                        style={{ width: `${getReadPercentage()}%` }}
                      />
                    </div>
                    <span>{message.readBy.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Reactions</span>
                    <div className="flex-1 mx-2 h-2 bg-[hsl(var(--chat-border))] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(getTotalReactions() / 20) * 100}%` }}
                      />
                    </div>
                    <span>{getTotalReactions()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Replies</span>
                    <div className="flex-1 mx-2 h-2 bg-[hsl(var(--chat-border))] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(message.replies.length / 10) * 100}%` }}
                      />
                    </div>
                    <span>{message.replies.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'readers' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Read by ({message.readBy.length})</h3>
                <span className="text-xs text-[hsl(var(--chat-text-muted))]">
                  {getReadPercentage()}% read rate
                </span>
              </div>
              {message.readBy.map((reader) => (
                <div key={reader.id} className="flex items-center justify-between p-3 bg-[hsl(var(--chat-message-bg))] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar fallback={reader.name} size="sm" />
                    <div>
                      <div className="text-sm font-medium">{reader.name}</div>
                      <div className="text-xs text-[hsl(var(--chat-text-muted))]">@{reader.username}</div>
                    </div>
                  </div>
                  <div className="text-xs text-[hsl(var(--chat-text-muted))]">
                    {formatTime(reader.readAt)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reactions' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Reactions ({getTotalReactions()})</h3>
              </div>
              {message.reactions.map((reaction, index) => (
                <div key={index} className="p-3 bg-[hsl(var(--chat-message-bg))] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{reaction.emoji}</span>
                      <span className="text-sm font-medium">{reaction.count}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reaction.users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2 px-2 py-1 bg-[hsl(var(--chat-bg))] rounded-full">
                        <Avatar fallback={user.name} size="xs" />
                        <span className="text-xs">{user.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'replies' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Replies ({message.replies.length})</h3>
              </div>
              {message.replies.map((reply) => (
                <div key={reply.id} className="p-3 bg-[hsl(var(--chat-message-bg))] rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Avatar fallback={reply.author.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="text-sm font-medium">{reply.author.name}</span>
                        <span className="text-xs text-[hsl(var(--chat-text-muted))]">{reply.timestamp}</span>
                      </div>
                      <p className="text-sm text-[hsl(var(--chat-text))]">{reply.content}</p>
                    </div>
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
