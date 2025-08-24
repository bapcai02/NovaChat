"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface MessageRendererProps {
  content: string
  className?: string
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ content, className }) => {
  // Function to parse and render formatted text (non-recursive)
  const renderFormattedText = (text: string) => {
    // Split by newlines to handle line breaks
    const lines = text.split('\n')
    
    return lines.map((line, lineIndex) => {
      if (line.trim() === '') {
        return <br key={lineIndex} />
      }

      // Parse formatting patterns
      const parts = parseFormattedText(line)
      
      return (
        <span key={lineIndex}>
          {parts.map((part, partIndex) => {
            if (typeof part === 'string') {
              return <span key={partIndex}>{part}</span>
            }
            
            const { type, content: partContent, url } = part
            
            switch (type) {
              case 'bold':
                return (
                  <strong key={partIndex} className="font-semibold">
                    {partContent}
                  </strong>
                )
              case 'italic':
                return (
                  <em key={partIndex} className="italic">
                    {partContent}
                  </em>
                )
              case 'code':
                return (
                  <code key={partIndex} className="bg-[hsl(var(--chat-message-hover))] px-1 py-0.5 rounded text-xs font-mono">
                    {partContent}
                  </code>
                )
              case 'strike':
                return (
                  <del key={partIndex} className="line-through">
                    {partContent}
                  </del>
                )
              case 'link':
                return (
                  <a 
                    key={partIndex} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[hsl(var(--chat-accent))] hover:underline"
                  >
                    {partContent}
                  </a>
                )
              case 'emoji':
                return (
                  <span key={partIndex} className="inline-block">
                    {partContent}
                  </span>
                )
              default:
                return <span key={partIndex}>{partContent}</span>
            }
          })}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      )
    })
  }

  // Function to parse text and extract formatting (simplified)
  const parseFormattedText = (text: string) => {
    const parts: Array<string | { type: string; content: string; url?: string }> = []
    let currentIndex = 0
    
    // Regex patterns for different formatting (in order of priority)
    const patterns = [
      // Links: [text](url) - highest priority
      { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' },
      // URLs: http://example.com
      { regex: /(https?:\/\/[^\s]+)/g, type: 'url' },
      // Bold: **text**
      { regex: /\*\*(.*?)\*\*/g, type: 'bold' },
      // Italic: *text*
      { regex: /\*(.*?)\*/g, type: 'italic' },
      // Code: `code`
      { regex: /`([^`]+)`/g, type: 'code' },
      // Strikethrough: ~~text~~
      { regex: /~~(.*?)~~/g, type: 'strike' },
      // Emojis: Unicode emoji characters
      { regex: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, type: 'emoji' }
    ]
    
    // Find all matches
    const matches: Array<{ type: string; content: string; url?: string; start: number; end: number }> = []
    
    patterns.forEach(({ regex, type }) => {
      // Reset regex lastIndex to avoid issues
      regex.lastIndex = 0
      let match
      while ((match = regex.exec(text)) !== null) {
        if (type === 'link') {
          matches.push({
            type,
            content: match[1],
            url: match[2],
            start: match.index,
            end: match.index + match[0].length
          })
        } else if (type === 'url') {
          matches.push({
            type: 'link',
            content: match[1],
            url: match[1],
            start: match.index,
            end: match.index + match[0].length
          })
        } else {
          matches.push({
            type,
            content: match[1] || match[0],
            start: match.index,
            end: match.index + match[0].length
          })
        }
      }
    })
    
    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start)
    
    // Build parts array
    matches.forEach((match) => {
      // Add text before match
      if (match.start > currentIndex) {
        parts.push(text.slice(currentIndex, match.start))
      }
      
      // Add formatted part
      parts.push({
        type: match.type,
        content: match.content,
        url: match.url
      })
      
      currentIndex = match.end
    })
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex))
    }
    
    return parts.length > 0 ? parts : [text]
  }

  return (
    <div className={cn("text-xs text-[hsl(var(--chat-text))] leading-relaxed", className)}>
      {renderFormattedText(content)}
    </div>
  )
}
