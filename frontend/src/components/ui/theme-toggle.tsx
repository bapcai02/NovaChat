"use client"

import React, { useEffect, useState } from 'react'
import { Button } from './button'
import { ThemeManager } from './theme-manager'
import { cn } from '@/lib/utils'

interface CustomTheme {
  id: string
  name: string
  description: string
  colors: Record<string, string>
  isDark: boolean
  isDefault?: boolean
}

interface ThemeToggleProps {
  className?: string
  onThemeChange?: (theme: CustomTheme) => void
}

const defaultLightTheme: CustomTheme = {
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
}

const defaultDarkTheme: CustomTheme = {
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

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, onThemeChange }) => {
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(defaultDarkTheme)
  const [showThemeManager, setShowThemeManager] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const themeMode = savedTheme || systemTheme
    
    setCurrentTheme(themeMode === 'dark' ? defaultDarkTheme : defaultLightTheme)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Apply theme colors to CSS variables
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value)
      })
      
      // Toggle dark class for Tailwind
      document.documentElement.classList.toggle('dark', currentTheme.isDark)
      localStorage.setItem('theme', currentTheme.isDark ? 'dark' : 'light')
      
      onThemeChange?.(currentTheme)
    }
  }, [currentTheme, mounted, onThemeChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        toggleTheme()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleTheme = React.useCallback(() => {
    setCurrentTheme(prev => prev.isDark ? defaultLightTheme : defaultDarkTheme)
  }, [])

  const handleThemeChange = (theme: CustomTheme) => {
    setCurrentTheme(theme)
    setShowThemeManager(false)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn("h-7 w-7", className)} disabled>
        <div className="w-4 h-4 border-2 border-[hsl(var(--chat-border))] border-t-transparent rounded-full animate-spin"></div>
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowThemeManager(true)}
        className={cn("h-7 w-7", className)}
        title="Theme settings (Ctrl/Cmd + /)"
      >
        {currentTheme.isDark ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </Button>

      <ThemeManager
        isOpen={showThemeManager}
        onClose={() => setShowThemeManager(false)}
        onThemeChange={handleThemeChange}
        currentTheme={currentTheme}
      />
    </>
  )
}
