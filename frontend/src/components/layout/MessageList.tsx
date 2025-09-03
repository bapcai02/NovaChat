"use client"

import React, { useEffect, useRef, useState } from 'react'
import { api } from '@/services/api'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { VoicePlayer } from '@/components/ui/voice-player'
import { ReadReceipts } from '@/components/ui/read-receipts'
import { MessageAnalytics } from '@/components/ui/message-analytics'
import { MessageRenderer } from '@/components/ui/message-renderer'
import { cn } from '@/lib/utils'
import { getEcho } from '@/lib/echo'
import { MessageReactions } from '@/components/ui/message-reactions'
import { MessageEditor } from '@/components/ui/message-editor'
import { TypingIndicator } from '@/components/ui/typing-indicator'

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
    content: 'Hey everyone! Welcome to **NovaChat**! 🚀 This is going to be an *amazing* place for our team to collaborate.\n\nCheck out our `README.md` for setup instructions!',
    author: {
      name: 'John Doe',
      username: 'johndoe'
    },
    timestamp: '10:30 AM',
    readBy: [
      { id: '1', name: 'Jane Smith', username: 'janesmith', readAt: '2024-01-15T10:31:00Z' },
      { id: '2', name: 'Mike Johnson', username: 'mikejohnson', readAt: '2024-01-15T10:32:00Z' },
      { id: '3', name: 'Sarah Wilson', username: 'sarahwilson', readAt: '2024-01-15T10:33:00Z' },
      { id: '4', name: 'Alex Brown', username: 'alexbrown', readAt: '2024-01-15T10:34:00Z' }
    ],
    reactions: [
      { emoji: '🚀', count: 3, users: [
        { id: '1', name: 'Jane Smith', username: 'janesmith' },
        { id: '2', name: 'Mike Johnson', username: 'mikejohnson' },
        { id: '3', name: 'Sarah Wilson', username: 'sarahwilson' }
      ]},
      { emoji: '👋', count: 2, users: [
        { id: '4', name: 'Alex Brown', username: 'alexbrown' },
        { id: '5', name: 'Emma Davis', username: 'emmadavis' }
      ]}
    ],
    thread: {
      count: 5,
      lastReply: {
        author: 'Mike Johnson',
        timestamp: '2 minutes ago'
      },
      participants: ['Jane Smith', 'Mike Johnson', 'Sarah Wilson']
    },
    views: 15,
    shares: 2,
    bookmarks: 1
  },
  {
    id: '2',
    content: 'Thanks John! This looks absolutely *fantastic*! ✨ I love the modern design and the smooth animations.\n\nHere\'s a link to our [documentation](https://docs.novachat.com) and some `code examples`!',
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
    content: 'I\'ve uploaded the latest design mockups for the new feature. Let me know what you think!\n\n**Key features:**\n• ~~Old design~~ New modern UI\n• *Responsive* layout\n• `TypeScript` support\n\nVisit https://figma.com/design for preview!',
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
    content: 'Great work everyone! I can see the progress we\'ve made. The new interface looks much cleaner.\n\n**Performance metrics:**\n• Load time: `2.3s` → `0.8s`\n• *60% improvement* in speed! 🚀',
    author: {
      name: 'Sarah Wilson',
      username: 'sarahwilson'
    },
    timestamp: '10:40 AM',
    reactions: [
      { emoji: '👍', count: 2, users: ['user1', 'user2'] }
    ]
  },
  {
    id: '5',
    content: 'I agree! The performance improvements are *noticeable*. Much faster loading times.\n\nHere\'s a quick `console.log` example:\n```js\nconsole.log("Hello NovaChat!");\n```',
    author: {
      name: 'Alex Brown',
      username: 'alexbrown'
    },
    timestamp: '10:42 AM'
  },
  {
    id: '6',
    content: 'Don\'t forget about the meeting at **2 PM today**! We\'ll be discussing the Q4 roadmap.\n\n~~Old meeting time~~ → *New meeting time*\n\n[Meeting Link](https://meet.google.com/abc-defg-hij)',
    author: {
      name: 'John Doe',
      username: 'johndoe'
    },
    timestamp: '10:45 AM',
    isPinned: true,
    reactions: [
      { emoji: '📅', count: 1, users: ['user1'] },
      { emoji: '✅', count: 3, users: ['user2', 'user3', 'user4'] }
    ]
  },
  {
    id: '7',
    content: 'I\'ll prepare the presentation slides. Should I include the analytics data from last month?\n\n**Topics to cover:**\n• ~~Old metrics~~ *New improved metrics*\n• `API performance`\n• User engagement 📊',
    author: {
      name: 'Jane Smith',
      username: 'janesmith'
    },
    timestamp: '10:47 AM',
    thread: {
      count: 2,
      lastReply: {
        author: 'John Doe',
        timestamp: '1 minute ago'
      },
      participants: ['John Doe', 'Jane Smith']
    }
  },
  {
    id: '8',
    type: 'voice',
    audioUrl: 'data:audio/webm;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
    duration: 15,
    author: {
      name: 'Mike Johnson',
      username: 'mikejohnson'
    },
    timestamp: '10:50 AM'
  },
  {
    id: '9',
    type: 'voice',
    audioUrl: 'data:audio/webm;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
    duration: 8,
    author: {
      name: 'Sarah Wilson',
      username: 'sarahwilson'
    },
    timestamp: '10:52 AM'
  },
  {
    id: '10',
    content: 'Yes, please include the analytics. Also, can someone help me with the API integration? I\'m getting a `404 error`.\n\n**Error details:**\n• Endpoint: `GET /api/users`\n• Status: *404 Not Found*\n• Check https://api.novachat.com/docs for reference',
    author: {
      name: 'Mike Johnson',
      username: 'mikejohnson'
    },
    timestamp: '10:53 AM',
    isEdited: true
  },
  {
    id: '11',
    content: 'I can help with the API issue. What endpoint are you trying to access?\n\nTry using the `v2` API: `https://api.novachat.com/v2/users`\n\n*Let me know if you need more help!* 🛠️',
    author: {
      name: 'Sarah Wilson',
      username: 'sarahwilson'
    },
    timestamp: '10:54 AM'
  },
  {
    id: '12',
    content: 'The new emoji reactions are so much fun! 🎉 I love how we can express ourselves better now.\n\n**Available reactions:**\n• 👍 *Like*\n• ❤️ *Love*\n• 🚀 *Awesome*\n• ~~Old reactions~~ *New reactions*\n\nCheck out [emoji guide](https://emojipedia.org) for more!',
    author: {
      name: 'Alex Brown',
      username: 'alexbrown'
    },
    timestamp: '10:55 AM',
    reactions: [
      { emoji: '🎉', count: 4, users: ['user1', 'user2', 'user3', 'user4'] },
      { emoji: '❤️', count: 2, users: ['user5', 'user6'] }
    ]
  }
]

interface MessageListProps {
  onThreadSelect: (messageId: string, messageContent: string) => void
  selectedChat?: { type: 'channel' | 'conversation', id: number } | null
  refreshTrigger?: number
}

export const MessageList: React.FC<MessageListProps> = ({ onThreadSelect, selectedChat, refreshTrigger }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  const [showAnalytics, setShowAnalytics] = useState<string | null>(null)
  const [messages, setMessages] = useState<typeof mockMessages>([] as any)
  const [typingUsers, setTypingUsers] = useState<Array<{
    id: string
    name: string
    username: string
    avatar?: string
  }>>([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  // WebSocket connection and subscription
  useEffect(() => {
    if (!selectedChat) return

    const roomId = selectedChat.id.toString()
    console.log('Setting up WebSocket for room:', roomId)

    try {
      const echo = getEcho()
      console.log('Echo instance:', echo)
      console.log('Echo connection state:', echo.connector.pusher.connection.state)
      
      // Subscribe to private channel
      const channel = echo.private(`chat.${roomId}`)
      console.log('Channel subscription created for:', `chat.${roomId}`)
      
      // Listen for ChatMessageSent events
      console.log('Setting up listener for .ChatMessageSent event')
      channel.listen('.ChatMessageSent', (event: any) => {
        console.log('🎉 RECEIVED WebSocket message:', event)
        
        const newMessage = {
          id: event.messageId,
          content: event.content,
          type: 'text',
          author: { 
            name: `User ${event.senderId}`, 
            username: `user${event.senderId}` 
          },
          timestamp: new Date(event.createdAt).toLocaleTimeString(),
          reactions: [],
          attachments: [],
        }
        
        console.log('Adding new message to list:', newMessage)
        setMessages(prev => {
          const updated = [...prev, newMessage]
          console.log('Updated messages list:', updated.length, 'messages')
          return updated
        })
        setTimeout(scrollToBottom, 100)
      })

      // Listen for UserTyping events
      channel.listen('.UserTyping', (event: any) => {
        console.log('User started typing:', event)
        setTypingUsers(prev => {
          const existingUser = prev.find(u => u.id === event.userId)
          if (!existingUser) {
            return [...prev, {
              id: event.userId,
              name: event.userName,
              username: event.userName
            }]
          }
          return prev
        })
      })

      // Listen for UserStoppedTyping events
      channel.listen('.UserStoppedTyping', (event: any) => {
        console.log('User stopped typing:', event)
        setTypingUsers(prev => prev.filter(u => u.id !== event.userId))
      })

      // Connection status
      echo.connector.pusher.connection.bind('connected', () => {
        console.log('WebSocket connected for room:', roomId)
      })

      echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('WebSocket disconnected for room:', roomId)
      })

      return () => {
        console.log('Cleaning up WebSocket for room:', roomId)
        channel.unsubscribe()
      }
    } catch (error) {
      console.error('Failed to setup WebSocket:', error)
    }
  }, [selectedChat])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log('fetchMessages - selectedChat:', selectedChat)
        if (!selectedChat) {
          console.log('No selectedChat, setting empty messages')
          setMessages([] as any)
          return
        }
        
        const roomId = selectedChat.id.toString()
        console.log('Fetching messages for room:', roomId)
        const res = await api.get<any[]>(`/messages/${roomId}`)
        const data = Array.isArray(res.data?.data) ? res.data.data : []
        console.log('Fetched messages:', data.length, 'messages')
        console.log('Latest message:', data[data.length - 1])
        
        // Map backend shape to frontend shape
        const mapped = data.map((m: any, idx: number) => ({
          id: String(m.id ?? idx),
          content: m.type === 'voice' ? '' : (m.content || ''),
          type: m.type === 'voice' ? 'voice' : undefined,
          audioUrl: m.type === 'voice' ? 'data:audio/webm;base64,' : undefined,
          duration: m.duration,
          author: { 
            name: m.sender?.name || 'User', 
            username: (m.sender?.username || 'user').toLowerCase() 
          },
          timestamp: new Date(m.created_at).toLocaleTimeString(),
          reactions: (m.reactions || []).map((r: any) => ({ 
            emoji: r.emoji, 
            count: r.count || 1, 
            users: [] 
          })),
          attachments: (m.attachments || []).map((a: any) => ({ 
            type: a.type || 'file', 
            url: a.url || '#', 
            name: a.name || 'file', 
            size: a.size 
          })),
        })) as any
        
        setMessages(mapped)
        setTimeout(scrollToBottom, 0)
      } catch (e) {
        console.error('Failed to load messages', e)
        // Fallback to empty array
        setMessages([] as any)
      }
    }
    fetchMessages()
  }, [selectedChat, refreshTrigger])

  const handleThreadClick = (messageId: string, messageContent: string) => {
    onThreadSelect(messageId, messageContent)
  }

  const handleReplyInThread = (messageId: string, messageContent: string) => {
    onThreadSelect(messageId, messageContent)
  }

  const handleReactionSelect = (messageId: string, emoji: string) => {
    console.log(`Adding reaction ${emoji} to message ${messageId}`)
    // TODO: Add reaction to message
    setShowReactionPicker(null)
  }

  const handleReactionAdd = (messageId: string, emoji: string) => {
    console.log(`Adding reaction ${emoji} to message ${messageId}`)
    // TODO: Call API to add reaction
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji)
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions?.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count + 1, isReacted: true }
                : r
            )
          }
        } else {
          return {
            ...msg,
            reactions: [...(msg.reactions || []), { emoji, count: 1, users: [], isReacted: true }]
          }
        }
      }
      return msg
    }))
  }

  const handleReactionRemove = (messageId: string, emoji: string) => {
    console.log(`Removing reaction ${emoji} from message ${messageId}`)
    // TODO: Call API to remove reaction
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          reactions: msg.reactions?.map(r => 
            r.emoji === emoji 
              ? { ...r, count: Math.max(0, r.count - 1), isReacted: false }
              : r
          ).filter(r => r.count > 0)
        }
      }
      return msg
    }))
  }

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)

  const handleEditMessage = (messageId: string, newContent: string) => {
    console.log(`Editing message ${messageId}: ${newContent}`)
    // TODO: Call API to update message
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          content: newContent,
          isEdited: true
        }
      }
      return msg
    }))
    setEditingMessageId(null)
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
  }

  if (!selectedChat) {
    return (
      <div className="h-full w-full flex items-center justify-center text-[hsl(var(--chat-text-muted))]">
        <div className="text-center">
          <div className="text-2xl mb-2">Welcome to NovaChat</div>
          <div className="text-sm">Select a channel or conversation to start chatting</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      {console.log('Rendering messages:', messages.length, 'messages')}
      {messages.map((message, index) => (
        <div key={message.id} className="message-enter">
          <div className="flex space-x-3 group hover:bg-[hsl(var(--chat-message-hover))] rounded-lg p-1.5 -m-1.5 transition-colors duration-200">
            <Avatar 
              fallback={message.author.name} 
              size="md"
              className="flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2 mb-0.5">
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
              
                                   {/* Message Content */}
              {editingMessageId === message.id ? (
                <MessageEditor
                  messageId={message.id}
                  initialContent={message.content}
                  onSave={handleEditMessage}
                  onCancel={handleCancelEdit}
                  className="mb-1"
                />
              ) : message.type === 'voice' ? (
                <div className="mb-1">
                  <VoicePlayer
                    audioUrl={message.audioUrl}
                    duration={message.duration}
                    author={message.author.name}
                    timestamp={message.timestamp}
                  />
                </div>
              ) : (
                <div className="mb-1">
                  <MessageRenderer content={message.content} />
                </div>
              )}
              
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
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
              <MessageReactions
                reactions={message.reactions || []}
                messageId={message.id}
                onReactionAdd={handleReactionAdd}
                onReactionRemove={handleReactionRemove}
                className="mt-2"
              />

              {/* Thread Summary */}
              {message.thread && (
                <div className="mt-2">
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
              <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="relative">
                  <button 
                    onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                    className="p-1 hover:bg-[hsl(var(--chat-message-hover))] rounded text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] transition-colors"
                    title="Add reaction"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  
                  {/* Reaction Picker */}
                  {showReactionPicker === message.id && (
                    <div className="absolute bottom-full left-0 mb-2 z-50">
                      <EmojiPicker
                        variant="compact"
                        onEmojiSelect={(emoji) => handleReactionSelect(message.id, emoji)}
                        onClose={() => setShowReactionPicker(null)}
                      />
                    </div>
                  )}
                </div>
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
                <button 
                  onClick={() => setEditingMessageId(message.id)}
                  className="flex items-center space-x-1 px-2 py-1 hover:bg-[hsl(var(--chat-message-hover))] rounded text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] transition-colors"
                  title="Edit message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-xs">Edit</span>
                </button>
                <button className="p-1 hover:bg-[hsl(var(--chat-message-hover))] rounded text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setShowAnalytics(showAnalytics === message.id ? null : message.id)}
                  className="p-1 hover:bg-[hsl(var(--chat-message-hover))] rounded text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] transition-colors"
                  title="Message analytics"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <TypingIndicator
          users={typingUsers}
        />
      )}
      
      {/* Read Receipts for last message */}
      {messages.length > 0 && (
        <div className="px-4 py-2">
          <ReadReceipts
            users={(messages as any)[0].readBy || []}
            totalRecipients={15}
            compact={true}
          />
        </div>
      )}

      {/* Message Analytics Modal */}
      {showAnalytics && (
        <MessageAnalytics
          message={{
            id: showAnalytics,
            content: messages.find(m => m.id === showAnalytics)?.content || '',
            author: messages.find(m => m.id === showAnalytics)?.author || { name: '', username: '' },
            timestamp: messages.find(m => m.id === showAnalytics)?.timestamp || '',
            readBy: (messages as any).find(m => m.id === showAnalytics)?.readBy || [],
            reactions: messages.find(m => m.id === showAnalytics)?.reactions || [],
            replies: (messages as any).find(m => m.id === showAnalytics)?.thread?.participants.map((p: string, i: number) => ({
              id: i.toString(),
              content: `Reply from ${p}`,
              author: { name: p, username: p.toLowerCase().replace(' ', '') },
              timestamp: '2 minutes ago'
            })) || [],
            views: (messages as any).find(m => m.id === showAnalytics)?.views || 0,
            shares: (messages as any).find(m => m.id === showAnalytics)?.shares || 0,
            bookmarks: (messages as any).find(m => m.id === showAnalytics)?.bookmarks || 0
          }}
          isOpen={!!showAnalytics}
          onClose={() => setShowAnalytics(null)}
        />
      )}

      {/* Scroll to bottom reference */}
      <div ref={messagesEndRef} />
    </div>
  )
}
