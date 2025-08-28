"use client"

import React, { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Textarea } from './textarea'
import { Switch } from './switch'
import { api } from '@/services/api'

interface CreateChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onChannelCreated?: (channel: any) => void
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ 
  isOpen, 
  onClose, 
  onChannelCreated 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    is_private: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Channel name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post('/channels', formData)
      const newChannel = response.data?.data

      if (newChannel) {
        onChannelCreated?.(newChannel)
        handleClose()
      }
    } catch (error: any) {
      console.error('Failed to create channel:', error)
      setError(error.response?.data?.message || 'Failed to create channel')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      is_private: false,
    })
    setError(null)
    setIsLoading(false)
    onClose()
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[hsl(217.2_32.6%_17.5%)] rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-[hsl(217.2_32.6%_17.5%)]">
        {/* Header */}
        <div className="p-4 border-b border-[hsl(var(--chat-border))] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">#</span>
            </div>
            <h2 className="text-lg font-semibold">Create New Channel</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-6 w-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Channel Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[hsl(var(--chat-text))]">
              Channel Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., general, random, announcements"
              className="w-full"
              disabled={isLoading}
            />
            <p className="text-xs text-[hsl(var(--chat-text-muted))]">
              Lowercase letters, numbers, hyphens, and underscores only
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[hsl(var(--chat-text))]">
              Display Name
            </label>
            <Input
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="e.g., General Discussion"
              className="w-full"
              disabled={isLoading}
            />
            <p className="text-xs text-[hsl(var(--chat-text-muted))]">
              Optional. How the channel will appear to users
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[hsl(var(--chat-text))]">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="What is this channel about?"
              className="w-full min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-[hsl(var(--chat-text-muted))]">
              Help others understand what this channel is for
            </p>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[hsl(var(--chat-text))]">
                Private Channel
              </label>
              <p className="text-xs text-[hsl(var(--chat-text-muted))]">
                Only invited members can see and join this channel
              </p>
            </div>
            <Switch
              checked={formData.is_private}
              onCheckedChange={(checked) => handleInputChange('is_private', checked)}
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Channel'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
