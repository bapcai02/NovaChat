"use client"

import React, { useEffect, useState } from 'react'
import { getEcho } from '@/lib/echo'

export default function WebSocketTestPage() {
  const [messages, setMessages] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    console.log('Setting up WebSocket test...')
    
    try {
      const echo = getEcho()
      
      // Subscribe to private channel
      const channel = echo.private('chat.1')
      
      // Listen for ChatMessageSent events
      channel.listen('.ChatMessageSent', (event: any) => {
        console.log('Received WebSocket message:', event)
        setMessages(prev => [...prev, `New message: ${event.content}`])
      })

      // Connection status
      echo.connector.pusher.connection.bind('connected', () => {
        console.log('WebSocket connected!')
        setIsConnected(true)
        setMessages(prev => [...prev, 'Connected to WebSocket'])
      })

      echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('WebSocket disconnected!')
        setIsConnected(false)
        setMessages(prev => [...prev, 'Disconnected from WebSocket'])
      })

      echo.connector.pusher.connection.bind('error', (error: any) => {
        console.error('WebSocket error:', error)
        setMessages(prev => [...prev, `Error: ${error.message}`])
      })

      return () => {
        console.log('Cleaning up WebSocket test...')
        channel.unsubscribe()
      }
    } catch (error) {
      console.error('Failed to setup WebSocket:', error)
      setMessages(prev => [...prev, `Setup error: ${error}`])
    }
  }, [])

  const sendTestMessage = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/test/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: '1',
          senderId: '1',
          content: `Test message at ${new Date().toLocaleTimeString()}`
        })
      })
      
      const data = await response.json()
      console.log('Message sent:', data)
      setMessages(prev => [...prev, `Message sent: ${data.data.content}`])
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [...prev, `Send error: ${error}`])
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">WebSocket Test</h1>
      
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Status: {isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <button 
        onClick={sendTestMessage}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        Send Test Message
      </button>

      <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto">
        <h2 className="font-bold mb-2">Messages:</h2>
        {messages.map((message, index) => (
          <div key={index} className="mb-1 text-sm">
            {message}
          </div>
        ))}
      </div>
    </div>
  )
}
