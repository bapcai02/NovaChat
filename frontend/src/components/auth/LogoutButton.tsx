'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { logout } from '@/store/slices/authSlice'
import { getWebSocketClient } from '@/lib/websocket'

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({ className = '', children }: LogoutButtonProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleLogout = async () => {
    try {
      // Get WebSocket client instance
      const wsClient = getWebSocketClient()
      
      // Publish user_disconnected event and disconnect WebSocket
      if (wsClient.isConnected()) {
        // Send user_offline message to publish user_disconnected event
        wsClient.send({
          type: 'user_offline',
          user_id: null // Will be set by WebSocket Gateway
        })
        
        // Small delay to ensure message is sent
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Then disconnect
        wsClient.disconnect()
      }
      
      // Call logout API and clear state
      await dispatch(logout()).unwrap()
      
      // Redirect to login
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout fails, disconnect WebSocket and redirect to login
      const wsClient = getWebSocketClient()
      if (wsClient.isConnected()) {
        wsClient.disconnect()
      }
      router.push('/login')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className={className}
    >
      {children || 'Logout'}
    </button>
  )
}
