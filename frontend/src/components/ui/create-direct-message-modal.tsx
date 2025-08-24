"use client"

import React, { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Avatar } from './avatar'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

interface CreateDirectMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onStartConversation: (userId: string, userData: UserData) => void
}

interface UserData {
  id: string
  name: string
  username: string
  avatar?: string
  status: 'online' | 'offline' | 'away' | 'busy'
  lastSeen?: string
}

const mockUsers: UserData[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    username: 'johndoe', 
    avatar: '/api/placeholder/32/32', 
    status: 'online',
    lastSeen: '2 minutes ago'
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    username: 'janesmith', 
    avatar: '/api/placeholder/32/32', 
    status: 'away',
    lastSeen: '1 hour ago'
  },
  { 
    id: '3', 
    name: 'Mike Johnson', 
    username: 'mikejohnson', 
    avatar: '/api/placeholder/32/32', 
    status: 'online',
    lastSeen: '5 minutes ago'
  },
  { 
    id: '4', 
    name: 'Sarah Wilson', 
    username: 'sarahwilson', 
    avatar: '/api/placeholder/32/32', 
    status: 'busy',
    lastSeen: '30 minutes ago'
  },
  { 
    id: '5', 
    name: 'Alex Brown', 
    username: 'alexbrown', 
    avatar: '/api/placeholder/32/32', 
    status: 'offline',
    lastSeen: '2 hours ago'
  },
  { 
    id: '6', 
    name: 'Emily Davis', 
    username: 'emilydavis', 
    avatar: '/api/placeholder/32/32', 
    status: 'online',
    lastSeen: '1 minute ago'
  },
  { 
    id: '7', 
    name: 'David Miller', 
    username: 'davidmiller', 
    avatar: '/api/placeholder/32/32', 
    status: 'offline',
    lastSeen: '1 day ago'
  },
  { 
    id: '8', 
    name: 'Lisa Garcia', 
    username: 'lisagarcia', 
    avatar: '/api/placeholder/32/32', 
    status: 'online',
    lastSeen: '10 minutes ago'
  }
]

export const CreateDirectMessageModal: React.FC<CreateDirectMessageModalProps> = ({
  isOpen,
  onClose,
  onStartConversation
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState<'recent' | 'all'>('recent')

  const getStatusColor = (status: UserData['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'busy':
        return 'bg-red-500'
      case 'offline':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: UserData['status']) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'away':
        return 'Away'
      case 'busy':
        return 'Busy'
      case 'offline':
        return 'Offline'
      default:
        return 'Unknown'
    }
  }

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const recentUsers = mockUsers.filter(user => 
    user.status === 'online' || user.lastSeen?.includes('minutes') || user.lastSeen?.includes('hour')
  )

  const handleUserSelect = (user: UserData) => {
    setSelectedUser(user)
  }

  const handleStartConversation = () => {
    if (selectedUser) {
      onStartConversation(selectedUser.id, selectedUser)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedUser(null)
    setSearchQuery('')
    setActiveTab('recent')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[hsl(217.2_32.6%_17.5%)] rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden border border-[hsl(217.2_32.6%_17.5%)]">
        {/* Header */}
        <div className="p-6 border-b border-[hsl(217.2_32.6%_17.5%)] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">💬</span>
            <h2 className="text-xl font-semibold">New Direct Message</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-[hsl(217.2_32.6%_17.5%)]">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or username..."
            className="w-full"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[hsl(217.2_32.6%_17.5%)]">
          {[
            { key: 'recent', label: 'Recent', icon: '🕒', count: recentUsers.length },
            { key: 'all', label: 'All Users', icon: '👥', count: mockUsers.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "text-[hsl(217.2_91.2%_59.8%)] border-b-2 border-[hsl(217.2_91.2%_59.8%)]"
                  : "text-[hsl(215.4_16.3%_56.9%)] hover:text-[hsl(210_40%_98%)]"
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              <Badge variant="outline" className="ml-2 text-xs">
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto max-h-[50vh]">
          <div className="p-4 space-y-2">
            {(activeTab === 'recent' ? recentUsers : filteredUsers).map(user => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors",
                  selectedUser?.id === user.id
                    ? "bg-[hsl(217.2_91.2%_20%)] border border-[hsl(217.2_91.2%_59.8%)]"
                    : "hover:bg-[hsl(215_25%_27%)]"
                )}
              >
                <div className="relative">
                  <Avatar
                    fallback={user.name}
                    size="md"
                    src={user.avatar}
                  />
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[hsl(217.2_32.6%_17.5%)]",
                    getStatusColor(user.status)
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium truncate">{user.name}</h3>
                    <span className="text-xs text-[hsl(215.4_16.3%_56.9%)]">@{user.username}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      user.status === 'online' && "bg-green-500/20 text-green-400",
                      user.status === 'away' && "bg-yellow-500/20 text-yellow-400",
                      user.status === 'busy' && "bg-red-500/20 text-red-400",
                      user.status === 'offline' && "bg-gray-500/20 text-gray-400"
                    )}>
                      {getStatusText(user.status)}
                    </span>
                    {user.lastSeen && user.status !== 'online' && (
                      <span className="text-xs text-[hsl(215.4_16.3%_56.9%)]">
                        • {user.lastSeen}
                      </span>
                    )}
                  </div>
                </div>

                {selectedUser?.id === user.id && (
                  <div className="w-5 h-5 bg-[hsl(217.2_91.2%_59.8%)] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected User Preview */}
        {selectedUser && (
          <div className="p-4 border-t border-[hsl(217.2_32.6%_17.5%)] bg-[hsl(222.2_84%_4.9%)]">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar
                  fallback={selectedUser.name}
                  size="md"
                  src={selectedUser.avatar}
                />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[hsl(222.2_84%_4.9%)]",
                  getStatusColor(selectedUser.status)
                )} />
              </div>
              <div>
                <h3 className="font-medium">{selectedUser.name}</h3>
                <p className="text-sm text-[hsl(215.4_16.3%_56.9%)]">
                  {getStatusText(selectedUser.status)}
                  {selectedUser.lastSeen && selectedUser.status !== 'online' && ` • ${selectedUser.lastSeen}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-[hsl(217.2_32.6%_17.5%)] flex items-center justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartConversation}
            disabled={!selectedUser}
            className="bg-[hsl(217.2_91.2%_59.8%)] hover:bg-[hsl(217.2_91.2%_50%)] text-white"
          >
            Start Conversation
          </Button>
        </div>
      </div>
    </div>
  )
}
