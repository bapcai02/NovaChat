'use client'

import { useState, useEffect } from 'react'
import { getEcho } from '@/lib/echo'

export default function WebSocketTestPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('Disconnected')
  const [echo, setEcho] = useState<any>(null)

  useEffect(() => {
    const echoInstance = getEcho()
    setEcho(echoInstance)

    // Listen for connection events
    const pusher = echoInstance.connector?.pusher
    if (pusher) {
      pusher.connection.bind('state_change', (state: any) => {
        console.log('Connection state changed:', state.previous, '→', state.current)
        setConnectionStatus(state.current)
      })

      pusher.connection.bind('connected', () => {
        console.log('Connected to WebSocket')
        setConnectionStatus('Connected')
      })

      pusher.connection.bind('error', (error: any) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('Error')
      })
    }

    // Subscribe to test channel
    const channel = echoInstance.private('chat.dm.1')
    
    channel.listen('.ChatMessageSent', (event: any) => {
      console.log('Received message:', event)
      setMessages(prev => [...prev, event])
    })

    return () => {
      echoInstance.leave('chat.dm.1')
    }
  }, [])

  const sendMessage = () => {
    if (!echo || !inputMessage.trim()) return

    const messageData = {
      conversation_id: 1,
      content: inputMessage,
      type: 'text',
      sender_id: 1
    }

    console.log('Sending message via WebSocket:', messageData)

    try {
      echo.private('chat.dm.1')
        .whisper('client-send-message', messageData)
      
      console.log('Message sent successfully')
      setInputMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const sendClientMessage = () => {
    if (!echo || !inputMessage.trim()) return

    const messageData = {
      conversation_id: 1,
      content: inputMessage,
      type: 'text',
      sender_id: 1
    }

    console.log('Sending client-send-message via WebSocket:', messageData)

    try {
      echo.private('chat.dm.1')
        .whisper('client-send-message', messageData)
      
      console.log('Client message sent successfully')
      setInputMessage('')
    } catch (error) {
      console.error('Failed to send client message:', error)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">WebSocket Test Page</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Connection Status: <span className={`font-semibold ${
            connectionStatus === 'Connected' ? 'text-green-600' : 
            connectionStatus === 'Error' ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {connectionStatus}
          </span>
        </p>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Enter message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send (client-send-message)
          </button>
          <button
            onClick={sendClientMessage}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Send (client-send-message)
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-3">Received Messages:</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages received yet...</p>
          ) : (
            messages.map((message, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <pre className="text-sm">{JSON.stringify(message, null, 2)}</pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}