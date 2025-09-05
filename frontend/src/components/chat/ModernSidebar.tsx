"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Hash, 
  Users, 
  Plus, 
  Search, 
  Settings, 
  Bell, 
  MessageCircle,
  Phone,
  Video,
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Channel {
  id: string
  name: string
  type: 'channel' | 'direct' | 'group'
  unreadCount?: number
  isOnline?: boolean
  lastMessage?: string
  lastMessageTime?: string
  avatar?: string
}

interface Team {
  id: string
  name: string
  channels: Channel[]
  isExpanded?: boolean
}

const mockTeams: Team[] = [
  {
    id: '1',
    name: 'General',
    isExpanded: true,
    channels: [
      { id: '1', name: 'general', type: 'channel', unreadCount: 3 },
      { id: '2', name: 'random', type: 'channel', unreadCount: 0 },
      { id: '3', name: 'announcements', type: 'channel', unreadCount: 1 },
    ]
  },
  {
    id: '2',
    name: 'Development',
    isExpanded: true,
    channels: [
      { id: '4', name: 'frontend', type: 'channel', unreadCount: 0 },
      { id: '5', name: 'backend', type: 'channel', unreadCount: 2 },
      { id: '6', name: 'devops', type: 'channel', unreadCount: 0 },
    ]
  }
]

const mockDirectMessages: Channel[] = [
  { 
    id: '7', 
    name: 'John Doe', 
    type: 'direct', 
    isOnline: true, 
    lastMessage: 'Hey, how are you?',
    lastMessageTime: '2m',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
  },
  { 
    id: '8', 
    name: 'Jane Smith', 
    type: 'direct', 
    isOnline: false, 
    lastMessage: 'Thanks for the help!',
    lastMessageTime: '1h',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random'
  },
  { 
    id: '9', 
    name: 'Mike Johnson', 
    type: 'direct', 
    isOnline: true, 
    lastMessage: 'See you tomorrow',
    lastMessageTime: '3h',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=random'
  }
]

export default function ModernSidebar() {
  const [teams, setTeams] = useState<Team[]>(mockTeams)
  const [directMessages] = useState<Channel[]>(mockDirectMessages)
  const [selectedChannel, setSelectedChannel] = useState<string>('1')
  const [searchQuery, setSearchQuery] = useState('')

  const toggleTeam = (teamId: string) => {
    setTeams(teams.map(team => 
      team.id === teamId 
        ? { ...team, isExpanded: !team.isExpanded }
        : team
    ))
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'channel':
        return <Hash className="h-4 w-4" />
      case 'direct':
        return <MessageCircle className="h-4 w-4" />
      case 'group':
        return <Users className="h-4 w-4" />
      default:
        return <Hash className="h-4 w-4" />
    }
  }

  const ChannelItem = ({ channel, teamId }: { channel: Channel, teamId?: string }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group",
        selectedChannel === channel.id 
          ? "bg-accent text-accent-foreground" 
          : "hover:bg-muted/50"
      )}
      onClick={() => setSelectedChannel(channel.id)}
    >
      {channel.type === 'direct' ? (
        <div className="relative">
          <Avatar className="h-6 w-6">
            <AvatarImage src={channel.avatar} />
            <AvatarFallback className="text-xs">
              {channel.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {channel.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
      ) : (
        <div className="h-6 w-6 flex items-center justify-center text-muted-foreground group-hover:text-foreground">
          {getChannelIcon(channel.type)}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {channel.type === 'channel' ? `#${channel.name}` : channel.name}
          </span>
          {channel.unreadCount && channel.unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
              {channel.unreadCount}
            </Badge>
          )}
        </div>
        {channel.lastMessage && (
          <p className="text-xs text-muted-foreground truncate">
            {channel.lastMessage}
          </p>
        )}
      </div>
      
      {channel.lastMessageTime && (
        <span className="text-xs text-muted-foreground">
          {channel.lastMessageTime}
        </span>
      )}
    </motion.div>
  )

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">NovaChat</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels, messages, or people"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Teams */}
          {teams.map((team) => (
            <div key={team.id}>
              <motion.button
                className="flex items-center gap-2 w-full text-left text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
                onClick={() => toggleTeam(team.id)}
                whileHover={{ x: 2 }}
              >
                {team.isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {team.name}
                <Plus className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
              
              <AnimatePresence>
                {team.isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    {team.channels.map((channel) => (
                      <ChannelItem key={channel.id} channel={channel} teamId={team.id} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <Separator />

          {/* Direct Messages */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ChevronDown className="h-4 w-4" />
              <span className="text-sm font-semibold text-muted-foreground">Direct Messages</span>
              <Plus className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1">
              {directMessages.map((channel) => (
                <ChannelItem key={channel.id} channel={channel} />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://ui-avatars.com/api/?name=You&background=random" />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Your Name</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
