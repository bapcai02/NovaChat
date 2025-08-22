"use client"

import React from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  author: {
    name: string
    username: string
  }
  timestamp: string
  reactions?: Array<{
    emoji: string
    count: number
    users: string[]
  }>
  attachments?: Array<{
    type: 'image' | 'file'
    url: string
    name: string
    size?: string
  }>
  isEdited?: boolean
  isPinned?: boolean
  thread?: {
    count: number
    lastReply?: {
      author: string
      timestamp: string
    }
    participants: string[]
  }
}

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hey everyone! Welcome to NovaChat! 🚀 This is going to be an amazing place for our team to collaborate.',
    author: {
      name: 'John Doe',
      username: 'johndoe'
    },
    timestamp: '10:30 AM',
    reactions: [
      { emoji: '🚀', count: 3, users: ['user1', 'user2', 'user3'] },
      { emoji: '👋', count: 2, users: ['user4', 'user5'] }
    ],
    thread: {
      count: 5,
      lastReply: {
        author: 'Mike Johnson',
        timestamp: '2 minutes ago'
      },
      participants: ['Jane Smith', 'Mike Johnson', 'Sarah Wilson']
    }
  },
  {
    id: '2',
    content: 'Thanks John! This looks absolutely fantastic! ✨ I love the modern design and the smooth animations.',
    author: {
      name: 'Jane Smith',
      username: 'janesmith'
    },
    timestamp: '10:32 AM',
    reactions: [
      { emoji: '✨', count: 1, users: ['user1'] }
    ]
  },
  {
    id: '3',
    content: 'I\'ve uploaded the latest design mockups for the new feature. Let me know what you think!',
    author: {
      name: 'Mike Johnson',
      username: 'mikejohnson'
    },
    timestamp: '10:35 AM',
    attachments: [
      {
        type: 'file',
        url: '#',
        name: 'design-mockups-v2.pdf',
        size: '2.4 MB'
      }
    ],
    thread: {
      count: 3,
      lastReply: {
        author: 'John Doe',
        timestamp: '5 minutes ago'
      },
      participants: ['John Doe', 'Sarah Wilson']
    }
  },
  {
    id: '4',
    content: 'The designs look great! I especially like the new color scheme. Should we schedule a call to discuss the implementation details?',
    author: {
      name: 'Sarah Wilson',
      username: 'sarahwilson'
    },
    timestamp: '10:38 AM',
    isEdited: true
  },
  {
    id: '5',
    content: 'Absolutely! Let\'s set up a meeting for tomorrow. I\'ll create a calendar invite.',
    author: {
      name: 'John Doe',
      username: 'johndoe'
    },
    timestamp: '10:40 AM'
  }
]

interface MessageListProps {
  onThreadSelect: (messageId: string, messageContent: string) => void
}

export const MessageList: React.FC<MessageListProps> = ({ onThreadSelect }) => {
  const handleThreadClick = (messageId: string, messageContent: string) => {
    onThreadSelect(messageId, messageContent)
  }

  const handleReplyInThread = (messageId: string, messageContent: string) => {
    onThreadSelect(messageId, messageContent)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {mockMessages.map((message, index) => (
        <div key={message.id} className="message-enter">
          <div className="flex space-x-3 group hover:bg-[hsl(var(--chat-message-hover))] rounded-lg p-2 -m-2 transition-colors duration-200">
            <Avatar 
              fallback={message.author.name} 
              size="md"
              className="flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="text-xs font-semibold text-[hsl(var(--chat-text))] hover:underline cursor-pointer">
                  {message.author.name}
                </span>
                <span className="text-xs text-[hsl(var(--chat-text-muted))]">
                  {message.timestamp}
                </span>
                {message.isEdited && (
                  <span className="text-xs text-[hsl(var(--chat-text-muted))] italic">
                    (edited)
                  </span>
                )}
                {message.isPinned && (
                  <Badge variant="outline" className="text-xs h-4 px-1.5">
                    📌 Pinned
                  </Badge>
                )}
              </div>
              
              <div className="text-xs text-[hsl(var(--chat-text))] leading-relaxed">
                {message.content}
              </div>
              
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.attachments.map((attachment, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 bg-[hsl(var(--chat-message-bg))] border border-[hsl(var(--chat-border))] rounded-lg hover:bg-[hsl(var(--chat-message-hover))] transition-colors cursor-pointer">
                      <div className="w-10 h-10 bg-[hsl(var(--chat-accent-light))] rounded-lg flex items-center justify-center">
                        {attachment.type === 'image' ? (
                          <svg className="w-5 h-5 text-[hsl(var(--chat-accent))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-[hsl(var(--chat-accent))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{attachment.name}</p>
                        {attachment.size && (
                          <p className="text-xs text-[hsl(var(--chat-text-muted))]">{attachment.size}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {message.reactions.map((reaction, idx) => (
                    <button
                      key={idx}
                      className="flex items-center space-x-1 px-2 py-1 bg-[hsl(var(--chat-message-bg))] border border-[hsl(var(--chat-border))] rounded-full hover:bg-[hsl(var(--chat-message-hover))] transition-colors text-xs"
                    >
                      <span>{reaction.emoji}</span>
                      <span className="text-[hsl(var(--chat-text-muted))]">{reaction.count}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Thread Summary */}
              {message.thread && (
                <div className="mt-3">
                  <button
                    onClick={() => handleThreadClick(message.id, message.content)}
                    className="flex items-center space-x-2 px-3 py-2 bg-[hsl(var(--chat-message-bg))] border border-[hsl(var(--chat-border))] rounded-lg hover:bg-[hsl(var(--chat-message-hover))] transition-colors group/thread"
                  >
                    <div className="flex -space-x-1">
                      {message.thread.participants.slice(0, 3).map((participant, idx) => (
                        <Avatar
                          key={idx}
                          fallback={participant}
                          size="sm"
                          className="border-2 border-[hsl(var(--chat-bg))]"
                        />
                      ))}
                      {message.thread.participants.length > 3 && (
                        <div className="w-6 h-6 bg-[hsl(var(--chat-text-muted))] rounded-full border-2 border-[hsl(var(--chat-bg))] flex items-center justify-center text-xs text-white">
                          +{message.thread.participants.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-[hsl(var(--chat-accent))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-xs font-medium text-[hsl(var(--chat-accent))]">
                          {message.thread.count} {message.thread.count === 1 ? 'reply' : 'replies'}
                        </span>
                      </div>
                      {message.thread.lastReply && (
                        <div className="text-xs text-[hsl(var(--chat-text-muted))] mt-1">
                          Last reply by {message.thread.lastReply.author} • {message.thread.lastReply.timestamp}
                        </div>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-[hsl(var(--chat-text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Message Actions (hidden by default, shown on hover) */}
              <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button className="p-1 hover:bg-[hsl(var(--chat-message-hover))] rounded text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleReplyInThread(message.id, message.content)}
                  className="flex items-center space-x-1 px-2 py-1 hover:bg-[hsl(var(--chat-message-hover))] rounded text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] transition-colors"
                  title="Reply in thread"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-xs">Reply</span>
                </button>
                <button className="p-1 hover:bg-[hsl(var(--chat-message-hover))] rounded text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-[hsl(var(--chat-message-hover))] rounded text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Typing indicator */}
      <div className="flex space-x-3">
        <Avatar fallback="Someone" size="md" className="flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="font-semibold text-[hsl(var(--chat-text))]">Someone</span>
            <span className="text-xs text-[hsl(var(--chat-text-muted))]">typing...</span>
          </div>
          <div className="flex space-x-1">
            <div className="typing-dot w-2 h-2 bg-[hsl(var(--chat-text-muted))] rounded-full"></div>
            <div className="typing-dot w-2 h-2 bg-[hsl(var(--chat-text-muted))] rounded-full"></div>
            <div className="typing-dot w-2 h-2 bg-[hsl(var(--chat-text-muted))] rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
