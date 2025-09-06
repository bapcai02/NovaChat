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
  StarOff,
  Grid3X3,
  Maximize2,
  HelpCircle,
  Calendar
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
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
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
          </div>
          <span className="text-xs font-semibold text-gray-600">Nova</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-800">
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-800">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-800">
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-800">
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-800">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700 placeholder-gray-500"
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
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teams</span>
            </div>
            <div className="space-y-1">
              {(teams || []).map((team) => (
                <button
                  key={team.id}
                  onClick={() => onSelectConversation({ id: team.id, type: 'group', title: team.name, team_id: team.id } as any)}
                  className={cn(
                    "flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-all duration-200 group",
                    currentConversation?.team_id === team.id && "bg-blue-50 border border-blue-200"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{team.name}</span>
                      <p className="text-xs text-gray-500">Team workspace</p>
                    </div>
                  </div>
                  {(team.members_count ?? 0) > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5">
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
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Channels</span>
            </div>
            <div className="space-y-1">
              {channelConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    "flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-all duration-200 group",
                    currentConversation?.id === conversation.id && "bg-blue-50 border border-blue-200"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 flex items-center justify-center bg-gray-100 rounded-lg">
                      <Hash className="h-4 w-4 text-gray-600" />
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
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Direct Messages</span>
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
                      currentConversation?.id === conversation.id && "bg-blue-50 border border-blue-200"
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
                        {otherUser?.is_online && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate">
                            {conversation.title || otherUser?.name || 'Unknown User'}
                          </p>
                          {otherUser?.is_online && (
                            <span className="text-xs text-green-600 font-medium">Active now</span>
                          )}
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
                      <span className="text-xs text-gray-400">8min</span>
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
              <p className="text-xs text-gray-500">Online</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
