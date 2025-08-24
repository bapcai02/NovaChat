"use client"

import React, { useState, useEffect } from 'react'
import { Button } from './button'
import { ThemeCustomizer } from './theme-customizer'
import { cn } from '@/lib/utils'

interface CustomTheme {
  id: string
  name: string
  description: string
  colors: Record<string, string>
  isDark: boolean
  isDefault?: boolean
}

interface ThemeManagerProps {
  isOpen: boolean
  onClose: () => void
  onThemeChange: (theme: CustomTheme) => void
  currentTheme: CustomTheme
}

const defaultThemes: CustomTheme[] = [
  {
    id: 'default-light',
    name: 'Default Light',
    description: 'Clean and modern light theme',
    colors: {
      '--chat-accent': 'hsl(221.2 83.2% 53.3%)',
      '--chat-accent-hover': 'hsl(221.2 83.2% 43.3%)',
      '--chat-accent-light': 'hsl(221.2 83.2% 93.3%)',
      '--chat-bg': 'hsl(0 0% 100%)',
      '--chat-sidebar': 'hsl(0 0% 98%)',
      '--chat-message-bg': 'hsl(0 0% 96%)',
      '--chat-message-hover': 'hsl(0 0% 94%)',
      '--chat-text': 'hsl(222.2 84% 4.9%)',
      '--chat-text-muted': 'hsl(215.4 16.3% 46.9%)',
      '--chat-border': 'hsl(214.3 31.8% 91.4%)',
      '--chat-ring': 'hsl(221.2 83.2% 53.3%)',
      '--chat-success': 'hsl(142.1 76.2% 36.3%)',
      '--chat-warning': 'hsl(38 92% 50%)',
      '--chat-error': 'hsl(0 84.2% 60.2%)',
      '--chat-info': 'hsl(221.2 83.2% 53.3%)'
    },
    isDark: false,
    isDefault: true
  },
  {
    id: 'default-dark',
    name: 'Default Dark',
    description: 'Elegant dark theme for night use',
    colors: {
      '--chat-accent': 'hsl(217.2 91.2% 59.8%)',
      '--chat-accent-hover': 'hsl(217.2 91.2% 69.8%)',
      '--chat-accent-light': 'hsl(217.2 91.2% 19.8%)',
      '--chat-bg': 'hsl(222.2 84% 4.9%)',
      '--chat-sidebar': 'hsl(217.2 32.6% 17.5%)',
      '--chat-message-bg': 'hsl(217.2 32.6% 17.5%)',
      '--chat-message-hover': 'hsl(217.2 32.6% 22.5%)',
      '--chat-text': 'hsl(210 40% 98%)',
      '--chat-text-muted': 'hsl(215.4 16.3% 56.9%)',
      '--chat-border': 'hsl(217.2 32.6% 17.5%)',
      '--chat-ring': 'hsl(217.2 91.2% 59.8%)',
      '--chat-success': 'hsl(142.1 70.6% 45.3%)',
      '--chat-warning': 'hsl(48 96% 53%)',
      '--chat-error': 'hsl(0 62.8% 30.6%)',
      '--chat-info': 'hsl(217.2 91.2% 59.8%)'
    },
    isDark: true,
    isDefault: true
  }
]

export const ThemeManager: React.FC<ThemeManagerProps> = ({ 
  isOpen, 
  onClose, 
  onThemeChange, 
  currentTheme 
}) => {
  const [themes, setThemes] = useState<CustomTheme[]>(defaultThemes)
  const [showCustomizer, setShowCustomizer] = useState(false)

  useEffect(() => {
    // Load custom themes from localStorage
    const savedThemes = JSON.parse(localStorage.getItem('customThemes') || '[]')
    setThemes([...defaultThemes, ...savedThemes])
  }, [])

  const handleThemeSelect = (theme: CustomTheme) => {
    onThemeChange(theme)
    onClose()
  }

  const handleDeleteTheme = (themeId: string) => {
    if (themeId.startsWith('custom-')) {
      const updatedThemes = themes.filter(t => t.id !== themeId)
      setThemes(updatedThemes)
      
      // Update localStorage
      const customThemes = updatedThemes.filter(t => t.id.startsWith('custom-'))
      localStorage.setItem('customThemes', JSON.stringify(customThemes))
      
      // If deleted theme was current, switch to default
      if (currentTheme.id === themeId) {
        onThemeChange(defaultThemes[0])
      }
    }
  }

  const handleThemeChange = (theme: CustomTheme) => {
    onThemeChange(theme)
    setShowCustomizer(false)
    // Reload themes from localStorage
    const savedThemes = JSON.parse(localStorage.getItem('customThemes') || '[]')
    setThemes([...defaultThemes, ...savedThemes])
  }

  const handleCustomizerClose = () => {
    setShowCustomizer(false)
    // Reload themes after customizer closes
    const savedThemes = JSON.parse(localStorage.getItem('customThemes') || '[]')
    setThemes([...defaultThemes, ...savedThemes])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[hsl(217.2_32.6%_17.5%)] rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden border border-[hsl(217.2_32.6%_17.5%)]">
        {/* Header */}
        <div className="p-4 border-b border-[hsl(var(--chat-border))] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">🎨</span>
            <h2 className="text-lg font-semibold">Theme Manager</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] p-4">
          <div className="space-y-4">
            {/* Default Themes */}
            <div>
              <h3 className="text-sm font-medium text-[hsl(var(--chat-text-muted))] mb-3">Default Themes</h3>
              <div className="space-y-2">
                {themes.filter(t => t.isDefault).map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme)}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm",
                      currentTheme.id === theme.id
                        ? "border-[hsl(217.2_91.2%_59.8%)] bg-[hsl(217.2_91.2%_20%)]"
                        : "border-[hsl(217.2_32.6%_17.5%)] bg-[hsl(222.2_84%_4.9%)] hover:bg-[hsl(215_25%_27%)]"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        {Object.entries(theme.colors).slice(0, 4).map(([name, value]) => (
                          <div
                            key={name}
                            className="w-4 h-4 rounded border border-[hsl(var(--chat-border))]"
                            style={{ backgroundColor: value }}
                            title={name}
                          />
                        ))}
                      </div>
                      <div>
                        <div className="font-medium">{theme.name}</div>
                        <div className="text-sm text-[hsl(var(--chat-text-muted))]">{theme.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {theme.isDark && (
                        <span className="text-xs bg-[hsl(var(--chat-text-muted))] text-white px-2 py-1 rounded">Dark</span>
                      )}
                      {currentTheme.id === theme.id && (
                        <span className="text-xs bg-[hsl(var(--chat-accent))] text-white px-2 py-1 rounded">Active</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Themes */}
            {themes.filter(t => !t.isDefault).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--chat-text-muted))] mb-3">Custom Themes</h3>
                <div className="space-y-2">
                  {themes.filter(t => !t.isDefault).map((theme) => (
                    <div
                      key={theme.id}
                      className="flex items-center justify-between p-3 border border-[hsl(217.2_32.6%_17.5%)] rounded-lg bg-[hsl(222.2_84%_4.9%)] hover:bg-[hsl(215_25%_27%)] transition-all"
                    >
                      <div 
                        className="flex items-center space-x-3 flex-1 cursor-pointer"
                        onClick={() => handleThemeSelect(theme)}
                      >
                        <div className="flex space-x-1">
                          {Object.entries(theme.colors).slice(0, 4).map(([name, value]) => (
                            <div
                              key={name}
                              className="w-4 h-4 rounded border border-[hsl(var(--chat-border))]"
                              style={{ backgroundColor: value }}
                              title={name}
                            />
                          ))}
                        </div>
                        <div>
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-sm text-[hsl(var(--chat-text-muted))]">{theme.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {theme.isDark && (
                          <span className="text-xs bg-[hsl(var(--chat-text-muted))] text-white px-2 py-1 rounded">Dark</span>
                        )}
                        {currentTheme.id === theme.id && (
                          <span className="text-xs bg-[hsl(var(--chat-accent))] text-white px-2 py-1 rounded">Active</span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTheme(theme.id)}
                          className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete theme"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create New Theme */}
            <div className="pt-4">
              <Button
                onClick={() => setShowCustomizer(true)}
                className="w-full bg-[hsl(var(--chat-accent))] hover:bg-[hsl(var(--chat-accent-hover))] text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Theme
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Customizer Modal */}
      {showCustomizer && (
        <ThemeCustomizer
          isOpen={showCustomizer}
          onClose={handleCustomizerClose}
          onThemeChange={handleThemeChange}
          currentTheme={currentTheme}
        />
      )}
    </div>
  )
}
