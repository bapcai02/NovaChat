"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, 
  Video, 
  MoreHorizontal, 
  Search, 
  Users, 
  Pin, 
  Bell,
  BellOff,
  Hash,
  MessageCircle,
  Settings
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { LogoutButton } from '@/components/auth/LogoutButton'

interface ChatHeaderProps {
  channelName: string
  channelType: 'channel' | 'direct' | 'group'
  memberCount?: number
  isOnline?: boolean
  lastSeen?: string
  avatar?: string
  isMuted?: boolean
  isPinned?: boolean
  onSearch?: () => void
  onCall?: () => void
  onVideoCall?: () => void
  onViewMembers?: () => void
  onToggleMute?: () => void
  onTogglePin?: () => void
  onSettings?: () => void
}

export default function ModernChatHeader({
  channelName,
  channelType,
  memberCount,
  isOnline,
  lastSeen,
  avatar,
  isMuted = false,
  isPinned = false,
  onSearch,
  onCall,
  onVideoCall,
  onViewMembers,
  onToggleMute,
  onTogglePin,
  onSettings
}: ChatHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const getChannelIcon = () => {
    switch (channelType) {
      case 'channel':
        return <Hash className="h-5 w-5 text-muted-foreground" />
      case 'direct':
        return <MessageCircle className="h-5 w-5 text-muted-foreground" />
      case 'group':
        return <Users className="h-5 w-5 text-muted-foreground" />
      default:
        return <Hash className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    if (channelType === 'direct') {
      return isOnline ? 'Online' : lastSeen ? `Last seen ${lastSeen}` : 'Offline'
    }
    return memberCount ? `${memberCount} members` : ''
  }

  const getStatusColor = () => {
    if (channelType === 'direct') {
      return isOnline ? 'text-green-500' : 'text-muted-foreground'
    }
    return 'text-muted-foreground'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 border-b border-gray-100 bg-white"
    >
      {/* Left side - Channel info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {channelType === 'direct' ? (
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                {channelName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
        ) : (
          <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-lg">
            {getChannelIcon()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800 truncate">
              {channelType === 'channel' ? `#${channelName}` : channelName}
            </h2>
            {isPinned && (
              <Pin className="h-4 w-4 text-gray-400" />
            )}
            {isMuted && (
              <BellOff className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <p className={cn("text-sm truncate", getStatusColor())}>
            {getStatusText()}
          </p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setIsSearchOpen(true); onSearch && onSearch(); }}
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          aria-label="Search in conversation"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Voice Call */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onCall}
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          aria-label="Start voice call"
        >
          <Phone className="h-4 w-4" />
        </Button>

        {/* Video Call */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onVideoCall}
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          aria-label="Start video call"
        >
          <Video className="h-4 w-4" />
        </Button>

        {/* View Members (for group/channel) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewMembers}
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          aria-label="View members"
        >
          <Users className="h-4 w-4" />
        </Button>

        {/* Toggle Mute */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMute}
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          aria-label={isMuted ? 'Unmute conversation' : 'Mute conversation'}
        >
          {isMuted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        </Button>

        {/* Toggle Pin */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onTogglePin}
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          aria-label={isPinned ? 'Unpin conversation' : 'Pin conversation'}
        >
          <Pin className="h-4 w-4" />
        </Button>
        {/* Information button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
        >
          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
            i
          </div>
        </Button>
        
        {/* More options dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <LogoutButton className="w-full text-left">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </LogoutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search overlay (floating, centered at top) */}
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
          onClick={() => setIsSearchOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Panel */}
          <div className="absolute left-1/2 -translate-x-1/2 mt-6 w-[92%] max-w-2xl">
            <div className="rounded-xl bg-white shadow-2xl ring-1 ring-black/5 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  className="pl-10 h-11 text-sm border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => { if (e.key === 'Escape') setIsSearchOpen(false) }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
