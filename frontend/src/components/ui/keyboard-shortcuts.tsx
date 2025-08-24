"use client"

import React, { useEffect, useState } from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface KeyboardShortcutsProps {
  onSearch?: () => void
  onToggleTheme?: () => void
  onToggleRightSidebar?: () => void
  onToggleMute?: () => void
  onFileUpload?: () => void
  onEmojiPicker?: () => void
  onCloseModals?: () => void
}

interface Shortcut {
  key: string
  description: string
  action: () => void
  category: 'navigation' | 'actions' | 'formatting' | 'system'
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onSearch,
  onToggleTheme,
  onToggleRightSidebar,
  onToggleMute,
  onFileUpload,
  onEmojiPicker,
  onCloseModals
}) => {
  const [showHelp, setShowHelp] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const shortcuts: Shortcut[] = [
    // Navigation
    {
      key: 'Ctrl/Cmd + K',
      description: 'Quick search',
      action: () => onSearch?.(),
      category: 'navigation'
    },
    {
      key: 'Ctrl/Cmd + J',
      description: 'Toggle right sidebar',
      action: () => onToggleRightSidebar?.(),
      category: 'navigation'
    },
    {
      key: 'Ctrl/Cmd + /',
      description: 'Toggle theme',
      action: () => onToggleTheme?.(),
      category: 'navigation'
    },
    
    // Actions
    {
      key: 'Ctrl/Cmd + M',
      description: 'Toggle mute',
      action: () => {
        setIsMuted(!isMuted)
        onToggleMute?.()
      },
      category: 'actions'
    },
    {
      key: 'Ctrl/Cmd + U',
      description: 'Upload file',
      action: () => onFileUpload?.(),
      category: 'actions'
    },
    {
      key: 'Ctrl/Cmd + E',
      description: 'Emoji picker',
      action: () => onEmojiPicker?.(),
      category: 'actions'
    },
    {
      key: 'Ctrl/Cmd + V',
      description: 'Voice message',
      action: () => console.log('Voice message'),
      category: 'actions'
    },
    
    // Formatting
    {
      key: 'Ctrl/Cmd + B',
      description: 'Bold text',
      action: () => console.log('Bold formatting'),
      category: 'formatting'
    },
    {
      key: 'Ctrl/Cmd + I',
      description: 'Italic text',
      action: () => console.log('Italic formatting'),
      category: 'formatting'
    },
    {
      key: 'Ctrl/Cmd + `',
      description: 'Code formatting',
      action: () => console.log('Code formatting'),
      category: 'formatting'
    },
    
    // System
    {
      key: 'Escape',
      description: 'Close modals/sidebars',
      action: () => onCloseModals?.(),
      category: 'system'
    },
    {
      key: 'Ctrl/Cmd + ?',
      description: 'Show keyboard shortcuts',
      action: () => setShowHelp(true),
      category: 'system'
    }
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Check each shortcut
      shortcuts.forEach(shortcut => {
        const keys = shortcut.key.split(' + ')
        const isCtrlCmd = keys.includes('Ctrl/Cmd') && (e.ctrlKey || e.metaKey)
        const isKey = keys.some(key => {
          if (key === 'Ctrl/Cmd') return false
          if (key === 'Escape') return e.key === 'Escape'
          if (key === '?') return e.key === '?'
          return e.key.toLowerCase() === key.toLowerCase()
        })

        if ((keys.length === 1 && isKey) || (keys.length === 2 && isCtrlCmd && isKey)) {
          e.preventDefault()
          shortcut.action()
        }
      })
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, isMuted])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation':
        return '🧭'
      case 'actions':
        return '⚡'
      case 'formatting':
        return '📝'
      case 'system':
        return '⚙️'
      default:
        return '🔧'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'navigation':
        return 'Navigation'
      case 'actions':
        return 'Actions'
      case 'formatting':
        return 'Formatting'
      case 'system':
        return 'System'
      default:
        return 'Other'
    }
  }

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)

  return (
    <>
      {/* Help Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowHelp(true)}
        className="h-7 w-7"
        title="Keyboard shortcuts (Ctrl/Cmd + ?)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </Button>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--chat-bg))] border border-[hsl(var(--chat-border))] rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[hsl(var(--chat-border))] flex items-center justify-between">
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelp(false)}
                className="h-6 w-6"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg">{getCategoryIcon(category)}</span>
                      <h3 className="font-medium text-[hsl(var(--chat-text))]">
                        {getCategoryName(category)}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between py-2 px-3 bg-[hsl(var(--chat-message-bg))] rounded-md">
                          <span className="text-sm text-[hsl(var(--chat-text))]">
                            {shortcut.description}
                          </span>
                          <kbd className="px-2 py-1 text-xs font-mono bg-[hsl(var(--chat-message-hover))] border border-[hsl(var(--chat-border))] rounded">
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[hsl(var(--chat-border))] bg-[hsl(var(--chat-message-bg))]">
              <p className="text-xs text-[hsl(var(--chat-text-muted))] text-center">
                Press <kbd className="px-1 py-0.5 text-xs font-mono bg-[hsl(var(--chat-message-hover))] border border-[hsl(var(--chat-border))] rounded">Escape</kbd> to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
