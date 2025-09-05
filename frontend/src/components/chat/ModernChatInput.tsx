"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Smile, 
  Paperclip, 
  Mic, 
  MicOff, 
  Image, 
  File,
  X,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Attachment {
  id: string
  name: string
  size: number
  type: string
  preview?: string
}

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: Attachment[]) => void
  onTyping?: (isTyping: boolean) => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
}

const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯']

export default function ModernChatInput({
  onSendMessage,
  onTyping,
  placeholder = "Type a message...",
  disabled = false,
  maxLength = 2000
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments)
      setMessage('')
      setAttachments([])
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= maxLength) {
      setMessage(value)
      
      // Typing indicator
      if (value.trim() && !isTyping) {
        setIsTyping(true)
        onTyping?.(true)
      } else if (!value.trim() && isTyping) {
        setIsTyping(false)
        onTyping?.(false)
      }
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji)
    textareaRef.current?.focus()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newAttachments: Attachment[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  return (
    <div className="border-t border-border bg-card">
      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-border"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  {attachment.preview ? (
                    <div className="relative">
                      <img
                        src={attachment.preview}
                        alt={attachment.name}
                        className="h-20 w-20 object-cover rounded-lg border border-border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg border border-border">
                      {getFileIcon(attachment.type)}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-32">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input area */}
      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* Attachment buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled}
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[44px] max-h-32 resize-none pr-12"
              rows={1}
            />
            
            {/* Character count */}
            {message.length > maxLength * 0.8 && (
              <div className="absolute bottom-1 right-12 text-xs text-muted-foreground">
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Emoji picker */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setShowEmojis(!showEmojis)}
                disabled={disabled}
              >
                <Smile className="h-4 w-4" />
              </Button>
              
              <AnimatePresence>
                {showEmojis && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 p-3 bg-popover border border-border rounded-lg shadow-lg z-50"
                  >
                    <div className="grid grid-cols-5 gap-2">
                      {emojis.map((emoji) => (
                        <Button
                          key={emoji}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-lg hover:bg-muted"
                          onClick={() => handleEmojiSelect(emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Voice recording */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0",
                isRecording && "text-destructive"
              )}
              onClick={() => setIsRecording(!isRecording)}
              disabled={disabled}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            {/* Send button */}
            <Button
              onClick={handleSend}
              disabled={disabled || (!message.trim() && attachments.length === 0)}
              className="h-9 w-9 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 text-xs text-muted-foreground"
          >
            You are typing...
          </motion.div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*"
      />
    </div>
  )
}
