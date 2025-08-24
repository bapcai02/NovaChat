"use client"

import React, { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Avatar } from './avatar'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

interface CreateChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateChannel: (channelData: ChannelData) => void
}

interface ChannelData {
  name: string
  description: string
  type: 'public' | 'private'
  topic: string
  members: string[]
  permissions: {
    read: boolean
    write: boolean
    admin: boolean
  }
}

const mockUsers = [
  { id: '1', name: 'John Doe', username: 'johndoe', avatar: '/api/placeholder/32/32', online: true },
  { id: '2', name: 'Jane Smith', username: 'janesmith', avatar: '/api/placeholder/32/32', online: false },
  { id: '3', name: 'Mike Johnson', username: 'mikejohnson', avatar: '/api/placeholder/32/32', online: true },
  { id: '4', name: 'Sarah Wilson', username: 'sarahwilson', avatar: '/api/placeholder/32/32', online: true },
  { id: '5', name: 'Alex Brown', username: 'alexbrown', avatar: '/api/placeholder/32/32', online: false },
]

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  onCreateChannel
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'members' | 'permissions'>('basic')
  const [channelData, setChannelData] = useState<ChannelData>({
    name: '',
    description: '',
    type: 'public',
    topic: '',
    members: [],
    permissions: {
      read: true,
      write: true,
      admin: false
    }
  })
  const [searchQuery, setSearchQuery] = useState('')

  const handleInputChange = (field: keyof ChannelData, value: any) => {
    setChannelData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePermissionChange = (permission: keyof ChannelData['permissions'], value: boolean) => {
    setChannelData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }))
  }

  const toggleMember = (userId: string) => {
    setChannelData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }))
  }

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = () => {
    if (!channelData.name.trim()) {
      alert('Please enter a channel name')
      return
    }
    onCreateChannel(channelData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[hsl(217.2_32.6%_17.5%)] rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden border border-[hsl(217.2_32.6%_17.5%)]">
        {/* Header */}
        <div className="p-6 border-b border-[hsl(217.2_32.6%_17.5%)] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">🆕</span>
            <h2 className="text-xl font-semibold">Create New Channel</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[hsl(217.2_32.6%_17.5%)]">
          {[
            { key: 'basic', label: 'Basic Info', icon: '📝' },
            { key: 'members', label: 'Members', icon: '👥' },
            { key: 'permissions', label: 'Permissions', icon: '🔐' }
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
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Channel Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Channel Name <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-[hsl(215.4_16.3%_56.9%)]">#</span>
                  <Input
                    value={channelData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="channel-name"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-[hsl(215.4_16.3%_56.9%)] mt-1">
                  Use lowercase letters, numbers, and hyphens only
                </p>
              </div>

              {/* Channel Type */}
              <div>
                <label className="block text-sm font-medium mb-3">Channel Type</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="public"
                      checked={channelData.type === 'public'}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-4 h-4 text-[hsl(217.2_91.2%_59.8%)]"
                    />
                    <div>
                      <div className="font-medium">Public Channel</div>
                      <div className="text-sm text-[hsl(215.4_16.3%_56.9%)]">
                        Anyone can join and see messages
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="private"
                      checked={channelData.type === 'private'}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-4 h-4 text-[hsl(217.2_91.2%_59.8%)]"
                    />
                    <div>
                      <div className="font-medium">Private Channel</div>
                      <div className="text-sm text-[hsl(215.4_16.3%_56.9%)]">
                        Only invited members can join
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={channelData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="What is this channel about?"
                  className="w-full px-3 py-2 bg-[hsl(222.2_84%_4.9%)] border border-[hsl(217.2_32.6%_17.5%)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(217.2_91.2%_59.8%)] resize-none"
                  rows={3}
                />
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <Input
                  value={channelData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  placeholder="Set a topic for this channel"
                />
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Search */}
              <div>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members..."
                  className="w-full"
                />
              </div>

              {/* Members List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-[hsl(222.2_84%_4.9%)] rounded-lg hover:bg-[hsl(215_25%_27%)] transition-colors cursor-pointer"
                    onClick={() => toggleMember(user.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar
                        fallback={user.name}
                        size="sm"
                        src={user.avatar}
                      />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-[hsl(215.4_16.3%_56.9%)]">@{user.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.online && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      {channelData.members.includes(user.id) && (
                        <Badge variant="outline" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Count */}
              <div className="text-sm text-[hsl(215.4_16.3%_56.9%)]">
                {channelData.members.length} member{channelData.members.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="text-sm text-[hsl(215.4_16.3%_56.9%)]">
                Configure default permissions for channel members
              </div>

              {/* Read Messages */}
              <div className="flex items-center justify-between p-4 bg-[hsl(222.2_84%_4.9%)] rounded-lg">
                <div>
                  <div className="font-medium">Read Messages</div>
                  <div className="text-sm text-[hsl(215.4_16.3%_56.9%)]">
                    Members can view channel messages
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelData.permissions.read}
                    onChange={(e) => handlePermissionChange('read', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[hsl(217.2_32.6%_17.5%)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[hsl(217.2_91.2%_59.8%)]"></div>
                </label>
              </div>

              {/* Send Messages */}
              <div className="flex items-center justify-between p-4 bg-[hsl(222.2_84%_4.9%)] rounded-lg">
                <div>
                  <div className="font-medium">Send Messages</div>
                  <div className="text-sm text-[hsl(215.4_16.3%_56.9%)]">
                    Members can send messages to the channel
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelData.permissions.write}
                    onChange={(e) => handlePermissionChange('write', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[hsl(217.2_32.6%_17.5%)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[hsl(217.2_91.2%_59.8%)]"></div>
                </label>
              </div>

              {/* Admin Access */}
              <div className="flex items-center justify-between p-4 bg-[hsl(222.2_84%_4.9%)] rounded-lg">
                <div>
                  <div className="font-medium">Admin Access</div>
                  <div className="text-sm text-[hsl(215.4_16.3%_56.9%)]">
                    Members can manage channel settings
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelData.permissions.admin}
                    onChange={(e) => handlePermissionChange('admin', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[hsl(217.2_32.6%_17.5%)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[hsl(217.2_91.2%_59.8%)]"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[hsl(217.2_32.6%_17.5%)] flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-[hsl(215.4_16.3%_56.9%)]">
              {activeTab === 'basic' && 'Step 1 of 3'}
              {activeTab === 'members' && 'Step 2 of 3'}
              {activeTab === 'permissions' && 'Step 3 of 3'}
            </div>
            {activeTab !== 'permissions' ? (
              <Button
                onClick={() => {
                  if (activeTab === 'basic') setActiveTab('members')
                  else if (activeTab === 'members') setActiveTab('permissions')
                }}
                disabled={activeTab === 'basic' && !channelData.name.trim()}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleCreate}>
                Create Channel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
