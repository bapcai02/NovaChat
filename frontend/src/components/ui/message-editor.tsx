"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface MessageEditorProps {
  messageId: string
  initialContent: string
  onSave: (messageId: string, newContent: string) => void
  onCancel: () => void
  className?: string
}

export const MessageEditor: React.FC<MessageEditorProps> = ({
  messageId,
  initialContent,
  onSave,
  onCancel,
  className
}) => {
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
    textareaRef.current?.setSelectionRange(content.length, content.length)
  }, [])

  const handleSave = async () => {
    if (content.trim() === initialContent.trim()) {
      onCancel()
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(messageId, content.trim())
    } catch (error) {
      console.error('Failed to save message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Edit your message..."
        className="min-h-[60px] resize-none"
      />
      <div className="flex items-center justify-between">
        <div className="text-xs text-[hsl(var(--chat-text-muted))]">
          Press Enter to save, Esc to cancel
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting || content.trim() === initialContent.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
