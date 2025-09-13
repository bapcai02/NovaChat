"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslation } from 'react-i18next'
import { apiService } from '@/services/api'

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onMemberAdded?: (member: any) => void
  type: 'team' | 'channel'
  teamId?: string
  channelId?: string
  existingMembers?: any[]
}

export default function AddMemberModal({ 
  isOpen, 
  onClose, 
  onMemberAdded, 
  type, 
  teamId, 
  channelId, 
  existingMembers = [] 
}: AddMemberModalProps) {
  const { t } = useTranslation('common')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  const loadUsers = async () => {
    try {
      // Use real API to get users
      const response = await apiService.getUsers()
      setUsers(response.data || [])
    } catch (error) {
      console.error('Failed to load users:', error)
      // Fallback to empty array if API fails
      setUsers([])
    }
  }

  const filteredUsers = users.filter(user => {
    const isNotExisting = !existingMembers.some(member => member.id === user.id)
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchQuery.toLowerCase())
    return isNotExisting && matchesSearch
  })

  const handleUserSelect = (user: any) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id))
    } else {
      setSelectedUsers(prev => [...prev, user])
    }
  }

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return

    setIsLoading(true)
    try {
      for (const user of selectedUsers) {
        if (type === 'team' && teamId) {
          await apiService.addMemberToTeam(teamId, user.id.toString())
        } else if (type === 'channel' && teamId && channelId) {
          await apiService.addMemberToChannel(teamId, channelId, user.id.toString())
        }
      }
      
      onMemberAdded?.(selectedUsers)
      onClose()
      setSelectedUsers([])
      setSearchQuery('')
    } catch (error) {
      console.error('Failed to add members:', error)
      alert('Có lỗi xảy ra khi thêm thành viên')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Thêm thành viên
                </h2>
                <p className="text-sm text-gray-500">
                  {type === 'team' ? 'Thêm thành viên vào nhóm' : 'Thêm thành viên vào kênh'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected users */}
            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Đã chọn ({selectedUsers.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="relative flex items-center"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={() => handleUserSelect(user)}
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users list */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Người dùng có sẵn
                </span>
              </div>
              <ScrollArea className="h-48">
                <div className="space-y-1">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className={`relative w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                        selectedUsers.some(u => u.id === user.id) ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                      {selectedUsers.some(u => u.id === user.id) && (
                        <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <X className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Không tìm thấy người dùng nào
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddMembers}
                disabled={isLoading || selectedUsers.length === 0}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                {isLoading ? 'Đang thêm...' : `Thêm ${selectedUsers.length} thành viên`}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
