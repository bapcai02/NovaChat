"use client"

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Hash, Users, MessageCircle, Bell, HelpCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SettingsModal from '@/components/settings/SettingsModal'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserSearchDropdown } from '@/components/ui/user-search-dropdown'
import { cn } from '@/lib/utils'
import type { User, Team, Conversation } from '@/types/chat'
import { UserSearchResult } from '@/services/userSearchService'
import UserOnlineStatus from './UserOnlineStatus'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { useTranslation } from 'react-i18next'

interface ModernSidebarProps {
  teams: Team[]
  conversations: Conversation[]
  currentConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  currentUser: User | null
  onlineUserIds?: Set<number>
}

export default function ModernSidebar({
  teams,
  conversations,
  currentConversation,
  onSelectConversation,
  currentUser,
  onlineUserIds = new Set()
}: ModernSidebarProps) {
  const [openSettings, setOpenSettings] = useState(false)
  const { t } = useTranslation('common')
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Get team icon based on team name or index
  const getTeamIcon = (teamName: string) => {
    const name = teamName.toLowerCase()
    if (name.includes('dev') || name.includes('development')) return <Users className="h-4 w-4 text-white" />
    return <Hash className="h-4 w-4 text-white" />
  }

  // Get team gradient based on index
  const getTeamGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600', 
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-cyan-500 to-blue-600',
      'from-emerald-500 to-green-600',
      'from-rose-500 to-pink-600',
      'from-indigo-500 to-purple-600'
    ]
    return gradients[index % gradients.length]
  }

  // Get channel icon based on channel name
  const getChannelIcon = (channelName: string) => {
    const name = channelName.toLowerCase()
    if (name.includes('general') || name.includes('main')) return <Hash className="h-4 w-4 text-gray-600" />
    if (name.includes('random') || name.includes('fun')) return <MessageCircle className="h-4 w-4 text-gray-600" />
    if (name.includes('announce') || name.includes('news')) return <Bell className="h-4 w-4 text-gray-600" />
    if (name.includes('help') || name.includes('support')) return <HelpCircle className="h-4 w-4 text-gray-600" />
    if (name.includes('dev') || name.includes('development')) return <Users className="h-4 w-4 text-gray-600" />
    return <Hash className="h-4 w-4 text-gray-600" />
  }

  const directConversations = (conversations || []).filter(conv => conv.type === 'direct')
  const channelConversations = (conversations || []).filter(conv => conv.type === 'channel')

  const timeAgo = (iso?: string) => {
    if (!iso) return ''
    const now = Date.now()
    const then = new Date(iso).getTime()
    const diff = Math.max(0, Math.floor((now - then) / 1000))
    if (diff < 60) return 'just now'
    const m = Math.floor(diff / 60)
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    const d = Math.floor(h / 24)
    return `${d}d`
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setIsUserSearchOpen(value.trim().length > 0)
  }

  const handleUserSelect = (user: UserSearchResult) => {
    // Create a direct conversation with the selected user
    const directConversation: Conversation = {
      id: user.id,
      type: 'direct',
      title: user.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      other_member: {
        id: user.id,
        name: user.name,
        email: (user as any).email || '',
        username: (user as any).username ? String((user as any).username) : `user${user.id}`,
        avatar: user.avatar || undefined,
        is_online: user.status === 'online'
      } as unknown as User,
      members: [{
        id: user.id,
        name: user.name,
        email: (user as any).email || '',
        username: (user as any).username ? String((user as any).username) : `user${user.id}`,
        avatar: user.avatar || undefined,
        is_online: user.status === 'online'
      } as unknown as User],
      unread_count: 0
    }
    
    onSelectConversation(directConversation)
    setSearchQuery('')
    setIsUserSearchOpen(false)
  }

  const handleSearchInputFocus = () => {
    if (searchQuery.trim().length > 0) {
      setIsUserSearchOpen(true)
    }
  }

  const handleSearchInputBlur = () => {
    // Delay closing to allow for dropdown clicks
    setTimeout(() => {
      setIsUserSearchOpen(false)
    }, 150)
  }

  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 relative">
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <div className="relative">
                <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full opacity-80"></div>
                <div className="absolute top-2 left-2 w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
          </div>
          <span className="text-xs font-semibold text-gray-600">Nova</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-800"
            aria-label="Notifications"
            onClick={() => setShowNotifications(v => !v)}
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-800"
            aria-label="Help"
          >
            <a href="https://example.com/help" target="_blank" rel="noreferrer">
              <HelpCircle className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {showNotifications && (
          <div className="absolute right-4 top-14 w-72 bg-white border border-gray-100 shadow-xl rounded-md overflow-hidden z-20">
            <div className="px-3 py-2 border-b text-sm font-semibold">{t('notifications')}</div>
            <div className="max-h-64 overflow-auto divide-y">
              <div className="px-3 py-2 text-sm text-gray-600">{t('no_notifications')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            placeholder={t('search_messages')}
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={handleSearchInputFocus}
            onBlur={handleSearchInputBlur}
            className="pl-10 h-9 bg-gray-50 border-gray-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm text-gray-700 placeholder-gray-500 transition-all duration-200"
            style={{
              border: '1px solid #e5e7eb',
              boxShadow: 'none'
            }}
          />
          <UserSearchDropdown
            isOpen={isUserSearchOpen}
            onClose={() => setIsUserSearchOpen(false)}
            onUserSelect={handleUserSelect}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-6">
          {/* Teams */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('teams')}</span>
            </div>
            <div className="space-y-1">
              {(teams || []).map((team, index) => (
                <button
                  key={team.id}
                  onClick={() => onSelectConversation({ id: team.id, type: 'group', title: team.name, team_id: team.id } as Conversation)}
                  className={cn(
                    "flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-all duration-200 group",
                    (currentConversation?.team_id === team.id || currentConversation?.id === team.id) && "bg-gray-50 border border-gray-200"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <div className={cn("h-8 w-8 flex items-center justify-center bg-gradient-to-br rounded-lg", getTeamGradient(index))}>
                      {getTeamIcon(team.name)}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{team.name}</span>
                      <p className="text-xs text-gray-500">Team workspace</p>
                    </div>
                  </div>
                  {(team.members_count ?? 0) > 0 && (
                    <Badge className="bg-gray-100 text-gray-600 text-xs font-medium px-1.5 py-0.5">
                      {team.members_count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('channels')}</span>
            </div>
            <div className="space-y-1">
              {channelConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    "flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-all duration-200 group",
                    currentConversation?.id === conversation.id && "bg-gray-50 border border-gray-200"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 flex items-center justify-center bg-gray-100 rounded-lg">
                      {getChannelIcon(conversation.title || '')}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{conversation.title}</span>
                      <p className="text-xs text-gray-500">Channel</p>
                    </div>
                  </div>
                  {(conversation.unread_count ?? 0) > 0 && (
                    <Badge className="bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 h-4 min-w-[16px] flex items-center justify-center">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <MessageCircle className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('direct_messages')}</span>
            </div>
            <div className="space-y-1">
              {directConversations.map((conversation) => {
                const otherUser = conversation.other_member || conversation.members?.find(
                  member => member.id !== currentUser?.id
                )
                
                return (
                  <motion.button
                    key={conversation.id}
                    onClick={() => onSelectConversation(conversation)}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    className={cn(
                      "flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-all duration-200 group",
                      currentConversation?.id === conversation.id && "bg-gray-50 border border-gray-200"
                    )}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={otherUser?.avatar} />
                          <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {otherUser?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online/Offline indicator */}
                        <UserOnlineStatus 
                          userId={otherUser?.id || 0}
                          isOnline={otherUser?.id ? onlineUserIds.has(otherUser.id) : false}
                          className="absolute -bottom-0.5 -right-0.5"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate">
                            {conversation.title || otherUser?.name || 'Unknown User'}
                          </p>
                        </div>
                        {conversation.last_message && (
                          <p className="text-xs text-gray-500 truncate max-w-[180px]" title={conversation.last_message.content}>
                            {conversation.last_message.content.length > 25 
                              ? `${conversation.last_message.content.substring(0, 25)}...` 
                              : conversation.last_message.content
                            }
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-0.5">
                      <span className="text-xs text-gray-400">{timeAgo(conversation.last_message?.updated_at || conversation.last_message?.created_at || conversation.updated_at)}</span>
                      {(conversation.unread_count ?? 0) > 0 && (
                        <Badge className="bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 h-4 min-w-[16px] flex items-center justify-center">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile Section */}
      {currentUser && (
        <>
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {currentUser.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {currentUser.name || 'Unknown User'}
                </p>
                <p className="text-xs text-gray-500">{t('online')}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                  onClick={() => setOpenSettings(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <LogoutButton
                  className="h-8 w-8 p-0 hover:bg-red-100 text-gray-600 hover:text-red-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </LogoutButton>
              </div>
            </div>
          </div>
          <SettingsModal open={openSettings} onClose={() => setOpenSettings(false)} />
        </>
      )}
    </div>
  )
}
