"use client"

import React, { useState, useEffect } from 'react'
import { Button } from './button'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface ThemeColor {
  name: string
  value: string
  description: string
  category: 'primary' | 'background' | 'text' | 'accent' | 'status'
}

interface CustomTheme {
  id: string
  name: string
  description: string
  colors: Record<string, string>
  isDark: boolean
  isDefault?: boolean
}

interface ThemeCustomizerProps {
  isOpen: boolean
  onClose: () => void
  onThemeChange: (theme: CustomTheme) => void
  currentTheme: CustomTheme
}

const defaultColors: ThemeColor[] = [
  // Primary Colors
  { name: '--chat-accent', value: 'hsl(221.2 83.2% 53.3%)', description: 'Primary accent color', category: 'primary' },
  { name: '--chat-accent-hover', value: 'hsl(221.2 83.2% 43.3%)', description: 'Primary accent hover', category: 'primary' },
  { name: '--chat-accent-light', value: 'hsl(221.2 83.2% 93.3%)', description: 'Primary accent light', category: 'primary' },
  
  // Background Colors
  { name: '--chat-bg', value: 'hsl(0 0% 100%)', description: 'Main background', category: 'background' },
  { name: '--chat-sidebar', value: 'hsl(0 0% 98%)', description: 'Sidebar background', category: 'background' },
  { name: '--chat-message-bg', value: 'hsl(0 0% 96%)', description: 'Message background', category: 'background' },
  { name: '--chat-message-hover', value: 'hsl(0 0% 94%)', description: 'Message hover', category: 'background' },
  
  // Text Colors
  { name: '--chat-text', value: 'hsl(222.2 84% 4.9%)', description: 'Primary text', category: 'text' },
  { name: '--chat-text-muted', value: 'hsl(215.4 16.3% 46.9%)', description: 'Muted text', category: 'text' },
  
  // Accent Colors
  { name: '--chat-border', value: 'hsl(214.3 31.8% 91.4%)', description: 'Border color', category: 'accent' },
  { name: '--chat-ring', value: 'hsl(221.2 83.2% 53.3%)', description: 'Focus ring', category: 'accent' },
  
  // Status Colors
  { name: '--chat-success', value: 'hsl(142.1 76.2% 36.3%)', description: 'Success color', category: 'status' },
  { name: '--chat-warning', value: 'hsl(38 92% 50%)', description: 'Warning color', category: 'status' },
  { name: '--chat-error', value: 'hsl(0 84.2% 60.2%)', description: 'Error color', category: 'status' },
  { name: '--chat-info', value: 'hsl(221.2 83.2% 53.3%)', description: 'Info color', category: 'status' }
]

const darkColors: ThemeColor[] = [
  // Primary Colors
  { name: '--chat-accent', value: 'hsl(217.2 91.2% 59.8%)', description: 'Primary accent color', category: 'primary' },
  { name: '--chat-accent-hover', value: 'hsl(217.2 91.2% 69.8%)', description: 'Primary accent hover', category: 'primary' },
  { name: '--chat-accent-light', value: 'hsl(217.2 91.2% 19.8%)', description: 'Primary accent light', category: 'primary' },
  
  // Background Colors
  { name: '--chat-bg', value: 'hsl(222.2 84% 4.9%)', description: 'Main background', category: 'background' },
  { name: '--chat-sidebar', value: 'hsl(217.2 32.6% 17.5%)', description: 'Sidebar background', category: 'background' },
  { name: '--chat-message-bg', value: 'hsl(217.2 32.6% 17.5%)', description: 'Message background', category: 'background' },
  { name: '--chat-message-hover', value: 'hsl(217.2 32.6% 22.5%)', description: 'Message hover', category: 'background' },
  
  // Text Colors
  { name: '--chat-text', value: 'hsl(210 40% 98%)', description: 'Primary text', category: 'text' },
  { name: '--chat-text-muted', value: 'hsl(215.4 16.3% 56.9%)', description: 'Muted text', category: 'text' },
  
  // Accent Colors
  { name: '--chat-border', value: 'hsl(217.2 32.6% 17.5%)', description: 'Border color', category: 'accent' },
  { name: '--chat-ring', value: 'hsl(217.2 91.2% 59.8%)', description: 'Focus ring', category: 'accent' },
  
  // Status Colors
  { name: '--chat-success', value: 'hsl(142.1 70.6% 45.3%)', description: 'Success color', category: 'status' },
  { name: '--chat-warning', value: 'hsl(48 96% 53%)', description: 'Warning color', category: 'status' },
  { name: '--chat-error', value: 'hsl(0 62.8% 30.6%)', description: 'Error color', category: 'status' },
  { name: '--chat-info', value: 'hsl(217.2 91.2% 59.8%)', description: 'Info color', category: 'status' }
]

const presetThemes: CustomTheme[] = [
  {
    id: 'default-light',
    name: 'Default Light',
    description: 'Clean and modern light theme',
    colors: Object.fromEntries(defaultColors.map(c => [c.name, c.value])),
    isDark: false,
    isDefault: true
  },
  {
    id: 'default-dark',
    name: 'Default Dark',
    description: 'Elegant dark theme for night use',
    colors: Object.fromEntries(darkColors.map(c => [c.name, c.value])),
    isDark: true,
    isDefault: true
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Calming blue theme inspired by the ocean',
    colors: {
      '--chat-accent': 'hsl(199 89% 48%)',
      '--chat-accent-hover': 'hsl(199 89% 38%)',
      '--chat-accent-light': 'hsl(199 89% 93%)',
      '--chat-bg': 'hsl(210 40% 98%)',
      '--chat-sidebar': 'hsl(210 40% 96%)',
      '--chat-message-bg': 'hsl(210 40% 94%)',
      '--chat-message-hover': 'hsl(210 40% 92%)',
      '--chat-text': 'hsl(210 40% 10%)',
      '--chat-text-muted': 'hsl(210 40% 40%)',
      '--chat-border': 'hsl(210 40% 90%)',
      '--chat-ring': 'hsl(199 89% 48%)',
      '--chat-success': 'hsl(142 76% 36%)',
      '--chat-warning': 'hsl(38 92% 50%)',
      '--chat-error': 'hsl(0 84% 60%)',
      '--chat-info': 'hsl(199 89% 48%)'
    },
    isDark: false
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm orange theme for cozy vibes',
    colors: {
      '--chat-accent': 'hsl(25 95% 53%)',
      '--chat-accent-hover': 'hsl(25 95% 43%)',
      '--chat-accent-light': 'hsl(25 95% 93%)',
      '--chat-bg': 'hsl(30 20% 98%)',
      '--chat-sidebar': 'hsl(30 20% 96%)',
      '--chat-message-bg': 'hsl(30 20% 94%)',
      '--chat-message-hover': 'hsl(30 20% 92%)',
      '--chat-text': 'hsl(30 20% 10%)',
      '--chat-text-muted': 'hsl(30 20% 40%)',
      '--chat-border': 'hsl(30 20% 90%)',
      '--chat-ring': 'hsl(25 95% 53%)',
      '--chat-success': 'hsl(142 76% 36%)',
      '--chat-warning': 'hsl(38 92% 50%)',
      '--chat-error': 'hsl(0 84% 60%)',
      '--chat-info': 'hsl(25 95% 53%)'
    },
    isDark: false
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Nature-inspired green theme',
    colors: {
      '--chat-accent': 'hsl(142 76% 36%)',
      '--chat-accent-hover': 'hsl(142 76% 26%)',
      '--chat-accent-light': 'hsl(142 76% 93%)',
      '--chat-bg': 'hsl(120 20% 98%)',
      '--chat-sidebar': 'hsl(120 20% 96%)',
      '--chat-message-bg': 'hsl(120 20% 94%)',
      '--chat-message-hover': 'hsl(120 20% 92%)',
      '--chat-text': 'hsl(120 20% 10%)',
      '--chat-text-muted': 'hsl(120 20% 40%)',
      '--chat-border': 'hsl(120 20% 90%)',
      '--chat-ring': 'hsl(142 76% 36%)',
      '--chat-success': 'hsl(142 76% 36%)',
      '--chat-warning': 'hsl(38 92% 50%)',
      '--chat-error': 'hsl(0 84% 60%)',
      '--chat-info': 'hsl(142 76% 36%)'
    },
    isDark: false
  }
]

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ 
  isOpen, 
  onClose, 
  onThemeChange, 
  currentTheme 
}) => {
  const [selectedTheme, setSelectedTheme] = useState<CustomTheme>(currentTheme)
  const [customColors, setCustomColors] = useState<Record<string, string>>(currentTheme.colors)
  const [themeName, setThemeName] = useState(currentTheme.name)
  const [themeDescription, setThemeDescription] = useState(currentTheme.description)
  const [activeTab, setActiveTab] = useState<'presets' | 'customize' | 'preview'>('presets')
  const [isDarkMode, setIsDarkMode] = useState(currentTheme.isDark)

  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(currentTheme)
      setCustomColors(currentTheme.colors)
      setThemeName(currentTheme.name)
      setThemeDescription(currentTheme.description)
      setIsDarkMode(currentTheme.isDark)
    }
  }, [isOpen, currentTheme])

  const applyTheme = (theme: CustomTheme) => {
    setSelectedTheme(theme)
    setCustomColors(theme.colors)
    setThemeName(theme.name)
    setThemeDescription(theme.description)
    setIsDarkMode(theme.isDark)
    onThemeChange(theme)
  }

  const updateCustomColor = (colorName: string, value: string) => {
    const newColors = { ...customColors, [colorName]: value }
    setCustomColors(newColors)
    
    const updatedTheme: CustomTheme = {
      ...selectedTheme,
      name: themeName,
      description: themeDescription,
      colors: newColors,
      isDark: isDarkMode
    }
    
    onThemeChange(updatedTheme)
  }

  const saveCustomTheme = () => {
    const newTheme: CustomTheme = {
      id: `custom-${Date.now()}`,
      name: themeName,
      description: themeDescription,
      colors: customColors,
      isDark: isDarkMode
    }
    
    // Save to localStorage
    const savedThemes = JSON.parse(localStorage.getItem('customThemes') || '[]')
    savedThemes.push(newTheme)
    localStorage.setItem('customThemes', JSON.stringify(savedThemes))
    
    onThemeChange(newTheme)
    onClose()
  }

  const getColorCategory = (category: string) => {
    const colors = isDarkMode ? darkColors : defaultColors
    return colors.filter(c => c.category === category)
  }

  const renderColorPicker = (color: ThemeColor) => (
    <div key={color.name} className="flex items-center space-x-3 p-3 bg-[hsl(var(--chat-message-bg))] rounded-lg">
      <div className="flex-1">
        <div className="text-sm font-medium">{color.description}</div>
        <div className="text-xs text-[hsl(var(--chat-text-muted))]">{color.name}</div>
      </div>
      <div className="flex items-center space-x-2">
        <div 
          className="w-8 h-8 rounded border border-[hsl(var(--chat-border))] cursor-pointer"
          style={{ backgroundColor: customColors[color.name] }}
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'color'
            input.value = customColors[color.name].replace('hsl(', '').replace(')', '')
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement
              updateCustomColor(color.name, `hsl(${target.value})`)
            }
            input.click()
          }}
        />
        <Input
          value={customColors[color.name]}
          onChange={(e) => updateCustomColor(color.name, e.target.value)}
          className="w-24 text-xs"
        />
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[hsl(217.2_32.6%_17.5%)] rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden border border-[hsl(217.2_32.6%_17.5%)]">
        {/* Header */}
        <div className="p-4 border-b border-[hsl(var(--chat-border))] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">🎨</span>
            <h2 className="text-lg font-semibold">Theme Customizer</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[hsl(var(--chat-border))]">
          {[
            { id: 'presets', label: 'Presets', icon: '🎨' },
            { id: 'customize', label: 'Customize', icon: '⚙️' },
            { id: 'preview', label: 'Preview', icon: '👁️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-[hsl(var(--chat-accent))] border-b-2 border-[hsl(var(--chat-accent))]"
                  : "text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))]"
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          {activeTab === 'presets' && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presetThemes.map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => applyTheme(theme)}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                      selectedTheme.id === theme.id
                        ? "border-[hsl(var(--chat-accent))] bg-[hsl(var(--chat-accent-light))]"
                        : "border-[hsl(var(--chat-border))] bg-[hsl(var(--chat-message-bg))] hover:bg-[hsl(var(--chat-message-hover))]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{theme.name}</h3>
                      {theme.isDefault && (
                        <span className="text-xs bg-[hsl(var(--chat-accent))] text-white px-2 py-1 rounded">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-[hsl(var(--chat-text-muted))] mb-3">{theme.description}</p>
                    
                    {/* Color Preview */}
                    <div className="flex space-x-1">
                      {Object.entries(theme.colors).slice(0, 6).map(([name, value]) => (
                        <div
                          key={name}
                          className="w-6 h-6 rounded border border-[hsl(var(--chat-border))]"
                          style={{ backgroundColor: value }}
                          title={name}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'customize' && (
            <div className="p-4 space-y-6">
              {/* Theme Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Theme Name</label>
                    <Input
                      value={themeName}
                      onChange={(e) => setThemeName(e.target.value)}
                      placeholder="Enter theme name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={themeDescription}
                      onChange={(e) => setThemeDescription(e.target.value)}
                      placeholder="Enter theme description"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="darkMode"
                    checked={isDarkMode}
                    onChange={(e) => setIsDarkMode(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="darkMode" className="text-sm">Dark Mode</label>
                </div>
              </div>

              {/* Color Categories */}
              {['primary', 'background', 'text', 'accent', 'status'].map((category) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-md font-medium capitalize">{category} Colors</h4>
                  <div className="space-y-2">
                    {getColorCategory(category).map(renderColorPicker)}
                  </div>
                </div>
              ))}

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={saveCustomTheme} className="bg-[hsl(var(--chat-accent))] hover:bg-[hsl(var(--chat-accent-hover))] text-white">
                  Save Custom Theme
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-medium">Theme Preview</h3>
              
              {/* Chat Preview */}
              <div className="bg-[hsl(222.2_84%_4.9%)] rounded-lg p-4 space-y-4 border border-[hsl(217.2_32.6%_17.5%)]">
                {/* Header */}
                                  <div className="flex items-center justify-between p-3 bg-[hsl(217.2_32.6%_17.5%)] rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-[hsl(var(--chat-text-muted))]">#</span>
                    <span className="font-medium">general</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[hsl(var(--chat-text-muted))]">3 members</span>
                    <span className="text-sm text-[hsl(var(--chat-text-muted))]">•</span>
                    <span className="text-sm text-[hsl(var(--chat-text-muted))]">Public channel</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-[hsl(var(--chat-accent))] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      JD
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="text-sm font-medium">John Doe</span>
                        <span className="text-xs text-[hsl(var(--chat-text-muted))]">10:30 AM</span>
                      </div>
                      <div className="p-3 bg-[hsl(var(--chat-message-bg))] rounded-lg">
                        <p className="text-sm">Hey everyone! Welcome to NovaChat! 🚀</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-[hsl(var(--chat-success))] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      JS
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="text-sm font-medium">Jane Smith</span>
                        <span className="text-xs text-[hsl(var(--chat-text-muted))]">10:32 AM</span>
                      </div>
                      <div className="p-3 bg-[hsl(var(--chat-message-bg))] rounded-lg">
                        <p className="text-sm">Thanks John! This looks fantastic! ✨</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-3 bg-[hsl(var(--chat-sidebar))] rounded-lg border border-[hsl(var(--chat-border))]">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent border-none outline-none text-sm placeholder-[hsl(var(--chat-text-muted))]"
                      readOnly
                    />
                    <button className="p-2 bg-[hsl(var(--chat-accent))] text-white rounded-lg hover:bg-[hsl(var(--chat-accent-hover))] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
