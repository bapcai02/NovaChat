"use client"

import React, { useState, useEffect } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { CreateChannelModal } from '@/components/ui/create-channel-modal'
import { CreateDirectMessageModal } from '@/components/ui/create-direct-message-modal'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { fetchChannels } from '@/store/slices/channelSlice'
import { fetchUsers } from '@/store/slices/userSlice'
import { api } from '@/services/api'

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

interface ApiChannel {
  id: number
  name: string
  display_name: string
  description?: string
  is_private: boolean
  members_count: number
  unread_count: number
  last_message_preview?: string
  updated_at: string
}

interface Conversation {
  id: number
  type: 'dm' | 'group'
  title: string
  avatar: string | null
  unread_count: number
  last_message_preview?: string
  updated_at: string
}

interface SidebarProps {
  onSelectChat?: (chat: { type: 'channel' | 'conversation', id: number, title: string }) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectChat }) => {
  const [activeChannel, setActiveChannel] = useState('1')
  const [showDirectMessages, setShowDirectMessages] = useState(true)
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false)
  const [isCreateDirectMessageOpen, setIsCreateDirectMessageOpen] = useState(false)
  const [apiChannels, setApiChannels] = useState<ApiChannel[] | null>(null)
  const [conversations, setConversations] = useState<Conversation[] | null>(null)
  const [loadingLists, setLoadingLists] = useState(false)
  
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { channels, isLoading: channelsLoading } = useAppSelector((state) => state.channels)
  const { users, isLoading: usersLoading } = useAppSelector((state) => state.users)

  useEffect(() => {
    // Fetch channels and users when component mounts
    dispatch(fetchChannels())
    dispatch(fetchUsers())
  }, [dispatch])

  useEffect(() => {
    // Fetch backend fake lists using shared api client (handles baseURL + auth token)
    const fetchLists = async () => {
      try {
        setLoadingLists(true)
        const [chRes, convRes] = await Promise.all([
          api.get<ApiChannel[]>('/channels'),
          api.get<Conversation[]>('/conversations'),
        ])
        setApiChannels(Array.isArray(chRes.data?.data) ? chRes.data.data : [])
        setConversations(Array.isArray(convRes.data?.data) ? convRes.data.data : [])
      } catch (err) {
        console.error('Failed to fetch lists', err)
        setApiChannels([])
        setConversations([])
      } finally {
        setLoadingLists(false)
      }
    }
    fetchLists()
  }, [])

  return (
    <div className="w-56 flex-shrink-0 bg-[hsl(217.2_32.6%_17.5%)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <h1 className="text-sm font-semibold">NovaChat</h1>
          </div>
          <div className="flex items-center space-x-1">
            <ThemeToggle />
            <LogoutButton 
              className="h-6 w-6 p-0"
              title="Logout"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </LogoutButton>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Avatar 
            fallback={user?.name || "User"} 
            size="sm"
            className="ring-1 ring-[hsl(var(--chat-accent))]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.name || "User"}</p>
            <p className="text-xs text-[hsl(var(--chat-text-muted))]">{user?.status || "Online"}</p>
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setIsCreateChannelOpen(true)}
              title="Create new channel"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Button>
          </div>
          
          <div className="space-y-0.5">
            {(apiChannels ?? []).map((channel) => (
              <button
                key={channel.id}
                onClick={() => {
                  setActiveChannel(String(channel.id))
                  onSelectChat?.({ type: 'channel', id: channel.id, title: channel.display_name || channel.name })
                }}
                className={cn(
                  "w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-left transition-colors duration-200",
                  activeChannel === String(channel.id)
                    ? "bg-[hsl(var(--chat-accent-light))] text-[hsl(var(--chat-accent))]"
                    : "hover:bg-[hsl(var(--chat-message-hover))] text-[hsl(var(--chat-text))]"
                )}
              >
                <span className="text-[hsl(var(--chat-text-muted))] text-sm">#</span>
                <span className="flex-1 truncate text-xs">{channel.display_name || channel.name}</span>
                {channel.unread_count && channel.unread_count > 0 && (
                  <Badge variant="default" className="ml-auto text-xs h-4 px-1.5">
                    {channel.unread_count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowDirectMessages(!showDirectMessages)}
              className="flex items-center space-x-1 text-xs font-semibold text-[hsl(var(--chat-text-muted))] uppercase tracking-wider hover:text-[hsl(var(--chat-text))] transition-colors"
            >
              <span>Direct Messages</span>
              <svg 
                className={cn("w-3 h-3 transition-transform", showDirectMessages && "rotate-90")} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setIsCreateDirectMessageOpen(true)}
              title="Start new conversation"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Button>
          </div>
          
          {showDirectMessages && (
            <div className="space-y-0.5">
              {(conversations ?? []).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveChannel(String(conv.id))
                    onSelectChat?.({ type: 'conversation', id: conv.id, title: conv.title })
                  }}
                  className={cn(
                    "w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-left transition-colors duration-200",
                    activeChannel === String(conv.id)
                      ? "bg-[hsl(var(--chat-accent-light))] text-[hsl(var(--chat-accent))]"
                      : "hover:bg-[hsl(var(--chat-message-hover))] text-[hsl(var(--chat-text))]"
                  )}
                >
                  <Avatar 
                    fallback={conv.title} 
                    size="sm"
                    className="w-5 h-5"
                  />
                  <span className="flex-1 truncate text-xs">{conv.title}</span>
                  {conv.unread_count && conv.unread_count > 0 && (
                    <Badge variant="default" className="ml-auto text-xs h-4 px-1.5">
                      {conv.unread_count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onChannelCreated={(newChannel) => {
          console.log('Channel created:', newChannel)
          // Refresh the channels list
          const fetchLists = async () => {
            try {
              const chRes = await api.get<ApiChannel[]>('/channels')
              setApiChannels(Array.isArray(chRes.data?.data) ? chRes.data.data : [])
            } catch (err) {
              console.error('Failed to refresh channels', err)
            }
          }
          fetchLists()
        }}
      />

      {/* Create Direct Message Modal */}
      <CreateDirectMessageModal
        isOpen={isCreateDirectMessageOpen}
        onClose={() => setIsCreateDirectMessageOpen(false)}
        onStartConversation={(userId, userData) => {
          console.log('Starting conversation with:', userData)
          // TODO: Implement direct message creation
          setIsCreateDirectMessageOpen(false)
        }}
      />
    </div>
  )
}
