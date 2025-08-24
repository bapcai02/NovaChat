"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { VoiceRecorder } from '@/components/ui/voice-recorder'
import { MessageRenderer } from '@/components/ui/message-renderer'
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

export const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Formatting shortcuts (only when not in input)
    if (e.target === textareaRef.current) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        applyFormatting('bold')
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault()
        applyFormatting('italic')
      } else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault()
        applyFormatting('code')
      }
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
              title="Attach file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="h-8 w-8 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))]"
              title="Emoji picker"
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
              title="Insert image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Button>

            {/* Formatting toolbar */}
            <div className="w-px h-6 bg-[hsl(var(--chat-border))] mx-1"></div>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => applyFormatting('bold')}
              className="h-8 w-8 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))]"
              title="Bold (Ctrl+B)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
              </svg>
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => applyFormatting('italic')}
              className="h-8 w-8 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))]"
              title="Italic (Ctrl+I)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => applyFormatting('code')}
              className="h-8 w-8 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))]"
              title="Code (Ctrl+`)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </Button>
          </div>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setIsTyping(e.target.value.length > 0)
              }}
              onKeyPress={handleKeyPress}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full min-h-[20px] max-h-32 resize-none bg-transparent border-none outline-none text-[hsl(var(--chat-text))] placeholder-[hsl(var(--chat-text-muted))] text-xs leading-relaxed"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '20px',
                maxHeight: '128px'
              }}
            />
            {/* Formatting Preview */}
            {message && (
              <div className="mt-2 p-3 bg-[hsl(var(--chat-message-bg))] border border-[hsl(var(--chat-border))] rounded-lg text-sm">
                <div className="text-[hsl(var(--chat-text-muted))] mb-2 text-xs font-medium">Preview:</div>
                <MessageRenderer content={message} />
              </div>
            )}
          </div>

          {/* Right toolbar */}
          <div className="flex items-center space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowVoiceRecorder(true)}
              className="h-8 w-8 text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))]"
              title="Voice Message"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/>
                <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
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
        
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        {/* Voice Recorder */}
        {showVoiceRecorder && (
          <div className="absolute bottom-full left-0 right-0 mb-2">
            <VoiceRecorder
              onRecordingComplete={(audioBlob, duration) => {
                console.log('Voice message recorded:', { audioBlob, duration })
                // TODO: Send voice message to backend
                setShowVoiceRecorder(false)
              }}
              onCancel={() => setShowVoiceRecorder(false)}
              maxDuration={60}
            />
          </div>
        )}
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
