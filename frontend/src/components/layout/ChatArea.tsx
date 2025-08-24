"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'

interface ChatAreaProps {
  onToggleRightSidebar: () => void
  onThreadSelect: (messageId: string, messageContent: string) => void
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onToggleRightSidebar, onThreadSelect }) => {
  const [currentChannel] = useState('general')
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        // TODO: Focus search input
        console.log('Search shortcut triggered')
      }
      
      // Ctrl/Cmd + /: Toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        toggleTheme()
      }
      
      // Ctrl/Cmd + J: Toggle right sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault()
        onToggleRightSidebar()
      }
      
      // Escape: Close modals/sidebars
      if (e.key === 'Escape') {
        // TODO: Close any open modals
        console.log('Escape pressed')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDarkMode, onToggleRightSidebar])

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
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Button>
          
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </Button>
          
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </Button>
          
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleTheme} title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
            {isDarkMode ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </Button>
          
          <div className="w-px h-5 bg-[hsl(var(--chat-border))] mx-1"></div>
          
          <Button variant="ghost" size="icon" onClick={onToggleRightSidebar} className="h-7 w-7">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </Button>
        </div>
      </div>

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
