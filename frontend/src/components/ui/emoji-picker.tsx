"use client"

import React, { useState } from 'react'
import { Button } from './button'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
  variant?: 'default' | 'compact'
}

const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
  '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
  '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽'
]

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose, variant = 'default' }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEmojis = commonEmojis.filter(emoji => 
    emoji.includes(searchTerm) || emoji.charCodeAt(0).toString(16).includes(searchTerm)
  )

  const isCompact = variant === 'compact'

  return (
            <div className={`absolute bottom-full right-0 mb-2 bg-[hsl(var(--chat-message-bg))] rounded-lg shadow-lg p-3 z-50 ${
      isCompact ? 'w-64' : 'w-80'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Emoji</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      
      <input
        type="text"
        placeholder="Search emojis..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-2 py-1 text-xs bg-[hsl(var(--chat-input-bg))] border border-[hsl(var(--chat-border))] rounded mb-3 focus:outline-none focus:border-[hsl(var(--chat-accent))]"
      />
      
      <div className={`grid gap-1 overflow-y-auto ${
        isCompact ? 'grid-cols-8 max-h-32' : 'grid-cols-10 max-h-48'
      }`}>
        {filteredEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onEmojiSelect(emoji)
              onClose()
            }}
            className={`flex items-center justify-center text-lg hover:bg-[hsl(var(--chat-message-hover))] rounded transition-colors ${
              isCompact ? 'w-6 h-6' : 'w-8 h-8'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
