"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      console.log('Sending message:', message)
      setMessage('')
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      console.log('Files selected:', files)
      // Handle file upload logic here
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* File upload preview area */}
      <div className="hidden">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Message input area */}
      <div className="relative">
        <div className="flex items-end space-x-3 p-3 bg-[hsl(var(--chat-input-bg))] border border-[hsl(var(--chat-border))] rounded-lg focus-within:border-[hsl(var(--chat-accent))] focus-within:ring-2 focus-within:ring-[hsl(var(--chat-accent-light))] transition-all duration-200">
          {/* Left toolbar */}
          <div className="flex items-center space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleFileUpload}
              className="h-8 w-8 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Button>
          </div>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setIsTyping(e.target.value.length > 0)
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full min-h-[20px] max-h-32 resize-none bg-transparent border-none outline-none text-[hsl(var(--chat-text))] placeholder-[hsl(var(--chat-text-muted))] text-xs leading-relaxed"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '20px',
                maxHeight: '128px'
              }}
            />
          </div>

          {/* Right toolbar */}
          <div className="flex items-center space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
            
            <Button
              type="submit"
              disabled={!message.trim()}
              className={cn(
                "h-8 px-3 text-xs transition-all duration-200",
                message.trim()
                  ? "chat-button"
                  : "bg-[hsl(var(--chat-message-hover))] text-[hsl(var(--chat-text-muted))] cursor-not-allowed"
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Additional info */}
      <div className="flex items-center justify-between text-xs text-[hsl(var(--chat-text-muted))] px-1">
        <div className="flex items-center space-x-4">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {isTyping && <span className="flex items-center space-x-1">
            <div className="typing-dot w-1 h-1 bg-[hsl(var(--chat-text-muted))] rounded-full"></div>
            <div className="typing-dot w-1 h-1 bg-[hsl(var(--chat-text-muted))] rounded-full"></div>
            <div className="typing-dot w-1 h-1 bg-[hsl(var(--chat-text-muted))] rounded-full"></div>
          </span>}
        </div>
        <div className="flex items-center space-x-2">
          <span>Message length: {message.length}</span>
          <span>•</span>
          <span>Online: 5 members</span>
        </div>
      </div>
    </form>
  )
}
