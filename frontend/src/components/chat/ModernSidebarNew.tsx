"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Settings, 
  LogOut, 
  Hash, 
  Users, 
  MessageCircle,
  MoreHorizontal,
  Bell,
  BellOff,
  Star,
  StarOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { User, Team, Channel, Conversation } from '@/hooks/useChat'

interface ModernSidebarProps {
  teams: Team[]
  channels: Channel[]
  conversations: Conversation[]
  currentConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  onlineUsers: User[]
  currentUser: User | null
}

export default function ModernSidebar({
  teams,
  channels,
  conversations,
  currentConversation,
  onSelectConversation,
  onlineUsers,
  currentUser
}: ModernSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = (conversations || []).filter(conv => {
    if (!searchQuery) return true
    const name = conv.title || conv.name || conv.channel?.name || 'Direct Message'
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const directConversations = filteredConversations.filter(conv => conv.type === 'direct')
  const channelConversations = filteredConversations.filter(conv => conv.type === 'channel')

  return (
    <div className="w-full h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">NovaChat</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
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
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>


      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8">
          {/* Teams */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">TEAMS</span>
            </div>
            <div className="space-y-2">
              {(teams || []).map((team) => (
                <button
                  key={team.id}
                  onClick={() => onSelectConversation({ id: team.id, type: 'group', title: team.name, team_id: team.id } as any)}
                  className={cn(
                    "flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-lg p-3 transition-colors group",
                    currentConversation?.team_id === team.id && "bg-primary/10 border border-primary/20"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    <span className="text-sm font-medium group-hover:text-primary">{team.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {team.members_count || 0}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">CHANNELS</span>
            </div>
            <div className="space-y-2">
              {channelConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    "flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-lg p-3 transition-colors group",
                    currentConversation?.id === conversation.id && "bg-primary/10 border border-primary/20"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Hash className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    <span className="text-sm font-medium group-hover:text-primary">{conversation.title}</span>
                  </div>
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <Badge variant="destructive" className="text-xs font-bold">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">DIRECT MESSAGES</span>
            </div>
            <div className="space-y-2">
                          {directConversations.map((conversation) => {
              const otherUser = conversation.other_member || conversation.members?.find(
                member => member.id !== currentUser?.id
              )
              
              return (
                  <button
                    key={conversation.id}
                    onClick={() => onSelectConversation(conversation)}
                    className={cn(
                      "flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-lg p-3 transition-colors group",
                      currentConversation?.id === conversation.id && "bg-primary/10 border border-primary/20"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherUser?.avatar} />
                          <AvatarFallback className="text-sm font-semibold">
                            {otherUser?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {otherUser?.is_online && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-primary">
                          {conversation.title || otherUser?.name || 'Unknown User'}
                        </p>
                        {conversation.last_message && (
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                    {conversation.unread_count && conversation.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs font-bold">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </ScrollArea>

      {/* User Profile */}
      {currentUser && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>
                {currentUser.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser.status_message || 'Online'}
              </p>
            </div>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
