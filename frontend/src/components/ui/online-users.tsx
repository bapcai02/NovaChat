"use client"

import React, { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { userStatusService, OnlineUser } from '@/services/userStatusService'
import { getEcho } from '@/lib/echo'

interface OnlineUsersProps {
  roomId?: string
  className?: string
}

export const OnlineUsers: React.FC<OnlineUsersProps> = ({ roomId = '1', className }) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch online users
  const fetchOnlineUsers = async () => {
    try {
      const users = await userStatusService.getOnlineUsers(roomId)
      setOnlineUsers(users)
    } catch (error) {
      console.error('Failed to fetch online users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Listen for status changes
  useEffect(() => {
    fetchOnlineUsers()

    try {
      const echo = getEcho()
      const channel = echo.private(`chat.${roomId}`)

      // Listen for user status changes
      channel.listen('.UserStatusChanged', (event: any) => {
        console.log('User status changed:', event)
        
        if (event.status === 'online') {
          // Add user to online list
          setOnlineUsers(prev => {
            const existingUser = prev.find(u => u.id === event.userId)
            if (!existingUser) {
              return [...prev, {
                id: event.userId,
                name: event.userName,
                username: event.userName,
                status: event.status,
                statusMessage: event.statusMessage,
                lastSeenAt: event.timestamp
              }]
            }
            return prev
          })
        } else {
          // Remove user from online list
          setOnlineUsers(prev => prev.filter(u => u.id !== event.userId))
        }
      })

      return () => {
        channel.unsubscribe()
      }
    } catch (error) {
      console.error('Failed to setup WebSocket for online users:', error)
    }
  }, [roomId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online'
      case 'away': return 'Away'
      case 'busy': return 'Busy'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  if (isLoading) {
    return (
      <div className={cn("p-3", className)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Online — Loading...
          </h3>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2 animate-pulse">
              <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-600 rounded w-20"></div>
                <div className="h-2 bg-gray-700 rounded w-16 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
          Online — {onlineUsers.length}
        </h3>
      </div>
      
      <div className="space-y-1">
        {onlineUsers.length === 0 ? (
          <div className="text-gray-500 text-xs py-2 text-center">
            No users online
          </div>
        ) : (
          onlineUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center px-2 py-1 rounded cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white group transition-colors"
            >
              <div className="relative">
                <Avatar
                  fallback={user.name}
                  size="sm"
                  className="w-6 h-6"
                />
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800",
                  getStatusColor(user.status)
                )}></div>
              </div>
              <div className="flex-1 min-w-0 ml-2">
                <div className="flex items-center">
                  <span className="text-sm truncate">{user.name}</span>
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {user.statusMessage || getStatusText(user.status)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
