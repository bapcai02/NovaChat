"use client"

import React, { useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThreadMessageInput } from './ThreadMessageInput'
import { cn } from '@/lib/utils'
import { api } from '@/services/api'

interface RightSidebarProps {
  onClose: () => void
  mode: 'info' | 'thread'
  onModeChange: (mode: 'info' | 'thread') => void
  selectedThread?: {messageId: string, messageContent: string} | null
}

interface Member {
  id: string
  name: string
  username: string
  status: 'online' | 'away' | 'busy' | 'offline'
  role?: 'admin' | 'moderator' | 'member'
  lastSeen?: string
}

const mockMembers: Member[] = [
  { id: '1', name: 'John Doe', username: 'johndoe', status: 'online', role: 'admin' },
  { id: '2', name: 'Jane Smith', username: 'janesmith', status: 'online', role: 'moderator' },
  { id: '3', name: 'Mike Johnson', username: 'mikejohnson', status: 'away' },
  { id: '4', name: 'Sarah Wilson', username: 'sarahwilson', status: 'busy' },
  { id: '5', name: 'Alex Brown', username: 'alexbrown', status: 'offline', lastSeen: '2 hours ago' },
]

export const RightSidebar: React.FC<RightSidebarProps> = ({ onClose, mode, onModeChange, selectedThread }) => {
  const [activeTab, setActiveTab] = React.useState<'info' | 'members' | 'files' | 'pinned'>('info')
  const [threadReplies, setThreadReplies] = useState<Array<{
    id: string
    content: string
    author: string
    timestamp: string
  }>>([])
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const [repliesError, setRepliesError] = useState<string | null>(null)

  React.useEffect(() => {
    const loadReplies = async () => {
      if (mode !== 'thread' || !selectedThread?.messageId) {
        setThreadReplies([])
        return
      }
      try {
        setIsLoadingReplies(true)
        setRepliesError(null)
        const res = await api.get<any[]>(`/messages/${selectedThread.messageId}/replies`)
        const data = Array.isArray(res.data?.data) ? res.data.data : []
        const mapped = data.map((r: any, idx: number) => ({
          id: String(r.id ?? idx),
          content: r.content ?? '',
          author: r.author?.name ?? 'User',
          timestamp: r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : '',
        }))
        setThreadReplies(mapped)
      } catch (e: any) {
        console.error('Failed to load replies', e)
        setRepliesError('Failed to load replies')
      } finally {
        setIsLoadingReplies(false)
      }
    }
    loadReplies()
  }, [mode, selectedThread?.messageId])

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleBadge = (role?: Member['role']) => {
    if (!role) return null
    const variants = {
      admin: { variant: 'destructive' as const, text: 'Admin' },
      moderator: { variant: 'default' as const, text: 'Mod' },
      member: { variant: 'outline' as const, text: 'Member' }
    }
    const config = variants[role]
    return <Badge variant={config.variant} className="text-xs">{config.text}</Badge>
  }

  const handleThreadMessageSend = async (message: string) => {
    if (!selectedThread?.messageId) return
    try {
      const res = await api.post(`/messages/${selectedThread.messageId}/replies`, { content: message })
      const r: any = res.data?.data
      const newReply = {
        id: String(r?.id ?? Date.now()),
        content: r?.content ?? message,
        author: r?.author?.name ?? 'You',
        timestamp: r?.timestamp ? new Date(r.timestamp).toLocaleTimeString() : 'now'
      }
      setThreadReplies(prev => [...prev, newReply])
    } catch (e) {
      console.error('Failed to post reply', e)
    }
  }

  return (
            <div className="w-96 flex-shrink-0 bg-[hsl(217.2_32.6%_17.5%)] flex flex-col overflow-hidden">
              {/* Header */}
        <div className="p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {mode === 'thread' && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onModeChange('info')}
                className="h-6 w-6"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            )}
            <h2 className="text-sm font-semibold">
              {mode === 'thread' ? 'Thread' : 'Channel Info'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Tabs - Only show for info mode */}
      {mode === 'info' && (
        <div className="flex border-b border-[hsl(var(--chat-border))] flex-shrink-0">
          {[
            { id: 'info', label: 'Info', icon: 'ℹ️' },
            { id: 'members', label: 'Members', icon: '👥' },
            { id: 'files', label: 'Files', icon: '📁' },
            { id: 'pinned', label: 'Pinned', icon: '📌' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "text-[hsl(var(--chat-accent))] border-b-2 border-[hsl(var(--chat-accent))]"
                  : "text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))]"
              )}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {mode === 'thread' && selectedThread ? (
          <div className="p-3 space-y-3">
            {/* Original Message */}
            <div className="space-y-2">
              <div className="text-xs text-[hsl(var(--chat-text-muted))] font-medium">
                Original Message
              </div>
              <div className="p-2 bg-[hsl(var(--chat-message-bg))] border border-[hsl(var(--chat-border))] rounded-md">
                <div className="flex space-x-2">
                  <Avatar fallback="John Doe" size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium">John Doe</span>
                      <span className="text-xs text-[hsl(var(--chat-text-muted))]">10:30 AM</span>
                    </div>
                    <div className="text-xs text-[hsl(var(--chat-text))]">
                      {selectedThread.messageContent}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thread Replies */}
            <div className="space-y-3">
              <div className="text-xs text-[hsl(var(--chat-text-muted))] font-medium">
                {isLoadingReplies ? 'Loading replies…' : `${threadReplies.length} ${threadReplies.length === 1 ? 'reply' : 'replies'}`}
              </div>
              
              <div className="space-y-2">
                {repliesError && (
                  <div className="text-xs text-red-400">{repliesError}</div>
                )}
                {threadReplies.map((reply) => (
                  <div key={reply.id} className="flex space-x-2">
                    <Avatar fallback={reply.author} size="sm" className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-xs font-medium">{reply.author}</span>
                        <span className="text-xs text-[hsl(var(--chat-text-muted))]">{reply.timestamp}</span>
                      </div>
                      <div className="text-xs text-[hsl(var(--chat-text))]">
                        {reply.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Input */}
            <div className="sticky bottom-0 pt-2">
              <ThreadMessageInput onSendMessage={handleThreadMessageSend} />
            </div>
          </div>
        ) : mode === 'info' && activeTab === 'info' ? (
          <div className="p-3 space-y-4">
            {/* Channel Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">#</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">#general</h3>
                  <p className="text-xs text-[hsl(var(--chat-text-muted))]">Public channel</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-medium text-[hsl(var(--chat-text-muted))] uppercase tracking-wider mb-1">
                    Topic
                  </h4>
                  <p className="text-xs">General discussion for the team</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-[hsl(var(--chat-text-muted))] uppercase tracking-wider mb-1">
                    Description
                  </h4>
                  <p className="text-xs text-[hsl(var(--chat-text-muted))]">
                    This is the main channel for team-wide announcements and general discussions.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-[hsl(var(--chat-text-muted))] uppercase tracking-wider mb-1">
                    Created
                  </h4>
                  <p className="text-xs text-[hsl(var(--chat-text-muted))]">January 15, 2024 by John Doe</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[hsl(var(--chat-message-bg))] p-2 rounded-md">
                <div className="text-lg font-bold text-[hsl(var(--chat-accent))]">5</div>
                <div className="text-xs text-[hsl(var(--chat-text-muted))]">Members</div>
              </div>
              <div className="bg-[hsl(var(--chat-message-bg))] p-2 rounded-md">
                <div className="text-lg font-bold text-[hsl(var(--chat-accent))]">127</div>
                <div className="text-xs text-[hsl(var(--chat-text-muted))]">Messages</div>
              </div>
            </div>
          </div>
        ) : mode === 'info' && activeTab === 'members' ? (
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Members ({mockMembers.length})</h3>
              <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Invite
              </Button>
            </div>
            
            <div className="space-y-1">
              {mockMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-[hsl(var(--chat-message-hover))] transition-colors">
                  <div className="relative">
                    <Avatar 
                      fallback={member.name} 
                      size="sm"
                      className="w-6 h-6"
                    />
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[hsl(var(--chat-sidebar))]",
                      getStatusColor(member.status)
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium truncate">{member.name}</span>
                      {getRoleBadge(member.role)}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-[hsl(var(--chat-text-muted))]">
                      <span>@{member.username}</span>
                      {member.lastSeen && (
                        <>
                          <span>•</span>
                          <span>{member.lastSeen}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : mode === 'info' && activeTab === 'files' ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Files & Media</h3>
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload
              </Button>
            </div>
            
            <div className="text-center py-8 text-[hsl(var(--chat-text-muted))]">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No files shared yet</p>
              <p className="text-xs mt-1">Files shared in this channel will appear here</p>
            </div>
          </div>
        ) : mode === 'info' && activeTab === 'pinned' ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pinned Messages</h3>
            </div>
            
            <div className="text-center py-8 text-[hsl(var(--chat-text-muted))]">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p className="text-sm">No pinned messages</p>
              <p className="text-xs mt-1">Important messages can be pinned here</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
