"use client"

import React, { useState } from 'react'
import { api } from '@/services/api'

export default function TestChatPage() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    try {
      console.log('Sending test message:', message)
      console.log('Token:', typeof window !== 'undefined' ? localStorage.getItem('auth_token') : 'Server-side')
      
      const response = await api.post('/messages', {
        roomId: '1',
        senderId: '13', // Hardcoded for test
        content: message.trim()
      })
      
      console.log('Response:', response.data)
      setResponse(JSON.stringify(response.data, null, 2))
      setMessage('')
    } catch (error: any) {
      console.error('Error:', error)
      setResponse(`Error: ${error.message}\n${JSON.stringify(error.response?.data, null, 2)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Chat</h1>
      
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <span>Token:</span>
          <code className="bg-gray-100 p-2 rounded text-sm">
            {typeof window !== 'undefined' && localStorage.getItem('auth_token') ? 'Present' : 'Missing'}
          </code>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message..."
            className="flex-1 p-2 border rounded"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>

      {response && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Response:</h3>
          <pre className="text-sm whitespace-pre-wrap">{response}</pre>
        </div>
      )}
    </div>
  )
}
