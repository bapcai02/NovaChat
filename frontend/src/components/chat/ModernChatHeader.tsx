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
      </div>

      {/* Search overlay */}
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 p-4 bg-card border-b border-border shadow-lg z-50"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-10"
              autoFocus
              onBlur={() => setIsSearchOpen(false)}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
