"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Reply, 
  Heart, 
  Smile, 
  Download, 
  Trash2, 
  Edit3,
  Copy,
  Flag,
  Pin,
  Send
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ThreadMessage {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar?: string
    isOnline?: boolean
  }
  timestamp: string
  isOwn: boolean
  isEdited?: boolean
  reactions?: { emoji: string; count: number; users: string[] }[]
  attachments?: { name: string; url: string; type: string }[]
}

interface ThreadChatProps {
  parentMessage: {
    id: string
    content: string
    sender: string
    timestamp: string
  }
  onClose: () => void
}

const mockThreadMessages: ThreadMessage[] = [
  {
    id: '1',
    content: 'This is a reply to the original message',
    sender: {
      id: '1',
      name: 'John Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
      isOnline: true
    },
    timestamp: '2:30 PM',
    isOwn: false,
    reactions: [
      { emoji: '👍', count: 2, users: ['user1', 'user2'] }
    ]
  },
  {
    id: '2',
    content: 'Another reply in the thread',
    sender: {
      id: '2',
      name: 'Jane Smith',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
      isOnline: true
    },
    timestamp: '2:32 PM',
    isOwn: true,
    isEdited: true
  },
  {
    id: '3',
    content: 'Thread discussion continues here...',
    sender: {
      id: '3',
      name: 'Mike Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=random',
      isOnline: false
    },
    timestamp: '2:35 PM',
    isOwn: false
  }
]

export default function ModernThreadChat({ parentMessage, onClose }: ThreadChatProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>(mockThreadMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ThreadMessage = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender: {
          id: 'current-user',
          name: 'You',
          avatar: 'https://ui-avatars.com/api/?name=You&background=random',
          isOnline: true
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      }
      setMessages(prev => [...prev, message])
      setNewMessage('')
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji)
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions?.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count + 1, users: [...r.users, 'current-user'] }
                : r
            )
          }
        } else {
          return {
            ...msg,
            reactions: [...(msg.reactions || []), { emoji, count: 1, users: ['current-user'] }]
          }
        }
      }
      return msg
    }))
  }

  const ThreadMessageBubble = ({ message }: { message: ThreadMessage }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 group"
    >
      {/* Avatar */}
      <Avatar className="h-6 w-6 flex-shrink-0">
        <AvatarImage src={message.sender.avatar} />
        <AvatarFallback className="text-xs">
          {message.sender.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Sender name and timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span className="font-medium">{message.sender.name}</span>
          <span>{message.timestamp}</span>
          {message.isEdited && (
            <span className="italic">(edited)</span>
          )}
        </div>

        {/* Message bubble */}
        <div className="relative group">
          <div className="px-3 py-2 bg-muted text-foreground rounded-lg max-w-full group-hover:shadow-md transition-shadow duration-200">
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>

            {/* Message actions */}
            <div className="absolute top-0 right-0 flex items-center gap-1 p-1 bg-background border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-y-full">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  addReaction(message.id, '👍')
                }}
              >
                <Smile className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  addReaction(message.id, '❤️')
                }}
              >
                <Heart className="h-3 w-3" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </DropdownMenuItem>
                  {message.isOwn && (
                    <DropdownMenuItem>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                  {message.isOwn && (
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {message.reactions.map((reaction, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => addReaction(message.id, reaction.emoji)}
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="flex flex-col h-full bg-card border-l border-border"
    >
      {/* Thread Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Thread</h3>
            <p className="text-sm text-muted-foreground">
              {messages.length} {messages.length === 1 ? 'reply' : 'replies'}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Parent Message */}
        <div className="p-3 bg-muted/50 rounded-lg border-l-2 border-primary">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="font-medium">{parentMessage.sender}</span>
            <span>{parentMessage.timestamp}</span>
          </div>
          <div className="text-sm">{parentMessage.content}</div>
        </div>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ThreadMessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Thread Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              if (e.target.value.trim() && !isTyping) {
                setIsTyping(true)
              } else if (!e.target.value.trim() && isTyping) {
                setIsTyping(false)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Reply in thread..."
            className="min-h-[40px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="h-10 w-10 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isTyping && (
          <div className="mt-2 text-xs text-muted-foreground">
            You are typing...
          </div>
        )}
      </div>
    </motion.div>
  )
}
