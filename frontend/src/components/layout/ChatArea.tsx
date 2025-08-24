"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { KeyboardShortcuts } from '@/components/ui/keyboard-shortcuts'
import { SearchModal } from '@/components/ui/search-modal'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { cn } from '@/lib/utils'

interface ChatAreaProps {
  onToggleRightSidebar: () => void
  onThreadSelect: (messageId: string, messageContent: string) => void
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onToggleRightSidebar, onThreadSelect }) => {
  const [currentChannel] = useState('general')
  const [isMuted, setIsMuted] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <div className="flex-1 flex flex-col bg-[hsl(var(--chat-bg))] overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-[hsl(var(--chat-border))] bg-[hsl(var(--chat-sidebar))] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-[hsl(var(--chat-text-muted))] text-lg">#</span>
            <h1 className="text-sm font-semibold">{currentChannel}</h1>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[hsl(var(--chat-text-muted))]">
            <span>•</span>
            <span>3 members</span>
            <span>•</span>
            <span>Public channel</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setIsSearchOpen(true)}
            title="Search (Ctrl/Cmd + K)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-7 w-7", isMuted && "text-red-500")}
            title={isMuted ? "Unmute (Ctrl/Cmd + M)" : "Mute (Ctrl/Cmd + M)"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          </Button>
          
          <div className="w-px h-5 bg-[hsl(var(--chat-border))] mx-1"></div>
          
          <KeyboardShortcuts
            onSearch={() => setIsSearchOpen(true)}
            onToggleTheme={() => console.log('Theme toggle triggered')}
            onToggleRightSidebar={onToggleRightSidebar}
            onToggleMute={() => setIsMuted(!isMuted)}
            onFileUpload={() => console.log('File upload triggered')}
            onEmojiPicker={() => console.log('Emoji picker triggered')}
            onCloseModals={() => console.log('Close modals triggered')}
          />
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onResultSelect={(result) => {
          console.log('Search result selected:', result)
          // TODO: Navigate to the selected result
        }}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-[hsl(var(--chat-border))] scrollbar-track-transparent hover:scrollbar-thumb-[hsl(var(--chat-text-muted))]">
        <MessageList onThreadSelect={onThreadSelect} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[hsl(var(--chat-border))] bg-[hsl(var(--chat-sidebar))] p-3 flex-shrink-0">
        <MessageInput />
      </div>
    </div>
  )
}
