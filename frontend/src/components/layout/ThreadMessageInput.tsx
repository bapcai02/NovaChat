"use client"

import React, { useState, useRef } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { cn } from '@/lib/utils'

// Message formatting utilities
const formatText = (text: string, format: 'bold' | 'italic' | 'code' | 'strike') => {
  const formats = {
    bold: { prefix: '**', suffix: '**' },
    italic: { prefix: '*', suffix: '*' },
    code: { prefix: '`', suffix: '`' },
    strike: { prefix: '~~', suffix: '~~' }
  }
  
  const { prefix, suffix } = formats[format]
  return `${prefix}${text}${suffix}`
}

interface ThreadMessageInputProps {
  onSendMessage: (message: string) => void
}

export const ThreadMessageInput: React.FC<ThreadMessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
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

  const applyFormatting = (format: 'bold' | 'italic' | 'code' | 'strike') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = message.substring(start, end)
    
    if (selectedText) {
      const formattedText = formatText(selectedText, format)
      const newMessage = message.substring(0, start) + formattedText + message.substring(end)
      setMessage(newMessage)
      
      // Set cursor position after formatting
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
      }, 0)
    } else {
      // If no text selected, insert format markers
      const formatMarkers = format === 'bold' ? '**bold text**' : 
                           format === 'italic' ? '*italic text*' :
                           format === 'code' ? '`code`' : '~~strikethrough~~'
      
      const newMessage = message.substring(0, start) + formatMarkers + message.substring(end)
      setMessage(newMessage)
      
      // Set cursor position between markers
      setTimeout(() => {
        textarea.focus()
        const cursorPos = start + (format === 'code' ? 1 : format === 'bold' ? 2 : 1)
        textarea.setSelectionRange(cursorPos, cursorPos + (format === 'bold' ? 9 : format === 'italic' ? 12 : format === 'code' ? 4 : 13))
      }, 0)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newMessage = message.substring(0, start) + emoji + message.substring(end)
    setMessage(newMessage)
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
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
        <div className="flex items-end space-x-2 p-2 bg-[hsl(var(--chat-input-bg))] border border-[hsl(var(--chat-border))] rounded-md focus-within:border-[hsl(var(--chat-accent))] focus-within:ring-2 focus-within:ring-[hsl(var(--chat-accent-light))] transition-all duration-200">
          {/* Left toolbar */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleFileUpload}
              className="h-6 w-6 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))] rounded flex items-center justify-center"
              title="Attach file"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="h-6 w-6 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))] rounded flex items-center justify-center"
              title="Emoji picker"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            <button
              type="button"
              className="h-6 w-6 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))] rounded flex items-center justify-center"
              title="Insert image"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Formatting toolbar */}
            <div className="w-px h-4 bg-[hsl(var(--chat-border))] mx-1"></div>
            
            <button
              type="button"
              onClick={() => applyFormatting('bold')}
              className="h-6 w-6 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))] rounded flex items-center justify-center"
              title="Bold (Ctrl+B)"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={() => applyFormatting('italic')}
              className="h-6 w-6 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))] rounded flex items-center justify-center"
              title="Italic (Ctrl+I)"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={() => applyFormatting('code')}
              className="h-6 w-6 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))] rounded flex items-center justify-center"
              title="Code (Ctrl+`)"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
          </div>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Reply to thread..."
              className="w-full min-h-[20px] max-h-24 resize-none bg-transparent border-none outline-none text-[hsl(var(--chat-text))] placeholder-[hsl(var(--chat-text-muted))] text-xs leading-relaxed"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '20px',
                maxHeight: '96px'
              }}
            />
          </div>

          {/* Right toolbar */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              className="h-6 w-6 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))] rounded flex items-center justify-center"
              title="More options"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            <button
              type="submit"
              disabled={!message.trim()}
              className={cn(
                "h-6 px-2 text-xs transition-all duration-200 rounded",
                message.trim()
                  ? "chat-button"
                  : "bg-[hsl(var(--chat-message-hover))] text-[hsl(var(--chat-text-muted))] cursor-not-allowed"
              )}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2 z-50">
            <EmojiPicker
              variant="compact"
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
      </div>
    </form>
  )
}
