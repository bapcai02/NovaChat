"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Avatar } from './avatar'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  type: 'message' | 'channel' | 'user' | 'file'
  title: string
  content?: string
  author?: string
  timestamp?: string
  channel?: string
  reactions?: number
  attachments?: number
  avatar?: string
  url?: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onResultSelect?: (result: SearchResult) => void
}

type SearchFilter = 'all' | 'messages' | 'channels' | 'users' | 'files'
type TimeFilter = 'all' | 'today' | 'week' | 'month' | 'year'

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onResultSelect }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'message',
      title: 'Welcome to NovaChat!',
      content: 'Hey everyone! Welcome to **NovaChat**! 🚀 This is going to be an *amazing* place for our team to collaborate.',
      author: 'John Doe',
      timestamp: '10:30 AM',
      channel: 'general',
      reactions: 5
    },
    {
      id: '2',
      type: 'message',
      title: 'Performance improvements',
      content: 'Great work everyone! I can see the progress we\'ve made. The new interface looks much cleaner.',
      author: 'Sarah Wilson',
      timestamp: '10:40 AM',
      channel: 'general',
      reactions: 2
    },
    {
      id: '3',
      type: 'channel',
      title: 'general',
      content: 'General discussion for the team',
      author: '3 members',
      timestamp: 'Public channel'
    },
    {
      id: '4',
      type: 'user',
      title: 'John Doe',
      content: 'Online • Last seen 2 minutes ago',
      avatar: 'JD'
    },
    {
      id: '5',
      type: 'file',
      title: 'design-mockups-v2.pdf',
      content: '2.4 MB • Uploaded by Mike Johnson',
      author: 'Mike Johnson',
      timestamp: '10:35 AM',
      channel: 'general'
    },
    {
      id: '6',
      type: 'message',
      title: 'API integration help',
      content: 'Yes, please include the analytics. Also, can someone help me with the API integration? I\'m getting a `404 error`.',
      author: 'Mike Johnson',
      timestamp: '10:50 AM',
      channel: 'general',
      reactions: 1
    }
  ]

  // Filter options
  const filterOptions: { value: SearchFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '🔍' },
    { value: 'messages', label: 'Messages', icon: '💬' },
    { value: 'channels', label: 'Channels', icon: '#' },
    { value: 'users', label: 'Users', icon: '👤' },
    { value: 'files', label: 'Files', icon: '📎' }
  ]

  const timeOptions: { value: TimeFilter; label: string }[] = [
    { value: 'all', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' }
  ]

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSelectedIndex(-1)
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch()
    } else {
      setResults([])
    }
  }, [searchQuery, activeFilter, timeFilter])

  const performSearch = async () => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Filter results based on query and filters
    const filteredResults = mockResults.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.author?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = activeFilter === 'all' || result.type === activeFilter
      
      return matchesQuery && matchesFilter
    })
    
    setResults(filteredResults)
    setIsLoading(false)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 4)]) // Keep last 5 searches
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultSelect(results[selectedIndex])
      } else if (searchQuery.trim()) {
        handleSearch(searchQuery)
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result)
    onClose()
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬'
      case 'channel':
        return '#'
      case 'user':
        return '👤'
      case 'file':
        return '📎'
      default:
        return '🔍'
    }
  }

  const getResultColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'channel':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'user':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'file':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--chat-bg))] border border-[hsl(var(--chat-border))] rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[hsl(var(--chat-border))] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-[hsl(var(--chat-text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-lg font-semibold">Search</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-[hsl(var(--chat-border))]">
          <div className="relative">
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search messages, channels, users, and files..."
              className="pl-10 pr-4"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[hsl(var(--chat-text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-[hsl(var(--chat-border))] space-y-3">
          {/* Type Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-[hsl(var(--chat-text-muted))]">Type:</span>
            <div className="flex space-x-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-md transition-colors",
                    activeFilter === option.value
                      ? "bg-[hsl(var(--chat-accent))] text-white"
                      : "bg-[hsl(var(--chat-message-bg))] text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))]"
                  )}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-[hsl(var(--chat-text-muted))]">Time:</span>
            <div className="flex space-x-1">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeFilter(option.value)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-md transition-colors",
                    timeFilter === option.value
                      ? "bg-[hsl(var(--chat-accent))] text-white"
                      : "bg-[hsl(var(--chat-message-bg))] text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))]"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto max-h-[50vh]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-[hsl(var(--chat-accent))] border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-[hsl(var(--chat-text-muted))]">Searching...</p>
            </div>
          ) : searchQuery.trim() ? (
            <div className="p-4 space-y-2">
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultSelect(result)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      selectedIndex === index
                        ? "bg-[hsl(var(--chat-accent-light))] border border-[hsl(var(--chat-accent))]"
                        : "bg-[hsl(var(--chat-message-bg))] hover:bg-[hsl(var(--chat-message-hover))]"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium", getResultColor(result.type))}>
                        {result.avatar ? (
                          <Avatar fallback={result.avatar} size="sm" />
                        ) : (
                          getResultIcon(result.type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium truncate">{result.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                        {result.content && (
                          <p className="text-xs text-[hsl(var(--chat-text-muted))] line-clamp-2 mb-1">
                            {result.content}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-[hsl(var(--chat-text-muted))]">
                          {result.author && (
                            <span>{result.author}</span>
                          )}
                          {result.channel && (
                            <span>#{result.channel}</span>
                          )}
                          {result.timestamp && (
                            <span>{result.timestamp}</span>
                          )}
                          {result.reactions && (
                            <span>💬 {result.reactions}</span>
                          )}
                          {result.attachments && (
                            <span>📎 {result.attachments}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-[hsl(var(--chat-text-muted))]">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-[hsl(var(--chat-text-muted))] mb-2">Recent searches</h3>
                  <div className="space-y-1">
                    {searchHistory.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(query)}
                        className="w-full text-left p-2 text-sm text-[hsl(var(--chat-text))] hover:bg-[hsl(var(--chat-message-hover))] rounded-md transition-colors"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Search Tips */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--chat-text-muted))] mb-2">Search tips</h3>
                <div className="space-y-1 text-xs text-[hsl(var(--chat-text-muted))]">
                  <p>• Use quotes for exact phrases: "hello world"</p>
                  <p>• Search by author: from:username</p>
                  <p>• Search by channel: in:channel-name</p>
                  <p>• Search by date: after:2024-01-01</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[hsl(var(--chat-border))] bg-[hsl(var(--chat-message-bg))]">
          <div className="flex items-center justify-between text-xs text-[hsl(var(--chat-text-muted))]">
            <div className="flex items-center space-x-4">
              <span>↑↓ Navigate</span>
              <span>Enter Select</span>
              <span>Esc Close</span>
            </div>
            <span>{results.length} results</span>
          </div>
        </div>
      </div>
    </div>
  )
}
