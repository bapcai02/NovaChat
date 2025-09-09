"use client"

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Star, MoreHorizontal, Smile } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Message, User } from '@/types/chat'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

interface ModernChatMessagesProps {
  messages: Message[]
  currentUser: User | null
  conversationId?: number
  onOpenThread?: (message: { id: string; content: string; sender: string; timestamp: string }) => void
  onAddReaction?: (messageId: number, emoji: string) => void
  onRemoveReaction?: (messageId: number, emoji: string) => void
  onBookmark?: (messageId: number, note?: string) => void
  onRemoveBookmark?: (messageId: number) => void
  isLoading?: boolean
  onEditMessage?: (messageId: number, content: string) => Promise<void> | void
  onDeleteMessage?: (messageId: number) => Promise<void> | void
  onReachBottom?: () => void
  readPointers?: Record<number, number>
  members?: Array<{ id: number; name?: string; avatar?: string }>
}

interface MessageBubbleProps {
  message: Message
  currentUser: User | null
  onOpenThread?: (message: { id: string; content: string; sender: string; timestamp: string }) => void
  onAddReaction?: (messageId: number, emoji: string) => void
  onRemoveReaction?: (messageId: number, emoji: string) => void
  onBookmark?: (messageId: number, note?: string) => void
  onRemoveBookmark?: (messageId: number) => void
  onEditMessage?: (messageId: number, content: string) => Promise<void> | void
  onDeleteMessage?: (messageId: number) => Promise<void> | void
}

const MessageBubble = ({ 
  message, 
  currentUser, 
  onOpenThread, 
  onAddReaction, 
  onRemoveReaction, 
  onBookmark, 
  onRemoveBookmark,
  onEditMessage,
  onDeleteMessage
}: MessageBubbleProps) => {
  const messageUserId = message.user_id || message.sender?.id || message.user?.id
  const currentUserId = currentUser?.id
  const isOwn = String(currentUserId) === String(messageUserId)
  const testIsOwn = isOwn
  const sender = message.sender || message.user || { name: 'Unknown', avatar: undefined }
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(message.content)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  
  const handleReaction = (emoji: string) => {
    if (testIsOwn) return
    
    const hasReacted = message.reactions?.some(r => 
      r.emoji === emoji && (r.users?.includes(currentUser?.id || 0) || r.user_id === currentUser?.id)
    )
    
    if (hasReacted) {
      onRemoveReaction?.(message.id, emoji)
    } else {
      onAddReaction?.(message.id, emoji)
    }
  }

  const handleBookmark = () => {
    if (message.is_bookmarked) {
      onRemoveBookmark?.(message.id)
    } else {
      onBookmark?.(message.id)
    }
  }

  const handleReply = () => {
    onOpenThread?.({
      id: message.id.toString(),
      content: message.content,
      sender: sender.name || 'Unknown',
      timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  const handleEditSave = async () => {
    if (!editValue.trim()) return
    await onEditMessage?.(message.id, editValue.trim())
    setIsEditing(false)
    setIsMenuOpen(false)
  }

  const escapeHtml = (str: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const renderWithMentions = (text: string) => {
    const safe = escapeHtml(text)
    return safe.replace(/(^|\s)(@\w{1,30})/g, (_m, p1, p2) => `${p1}<span class='text-red-600'>${p2}</span>`)
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    if (showEmojiPicker) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showEmojiPicker])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "flex gap-2 mb-3",
        testIsOwn ? "flex-row-reverse" : "flex-row"
      )}
      data-message-id={message.id}
    >
      {/* Avatar */}
      {!testIsOwn && (
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarImage src={sender.avatar} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {sender.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div className={cn(
        "flex flex-col gap-1 max-w-[70%] min-w-0",
        testIsOwn ? "items-end" : "items-start"
      )}>
        {/* Sender name and timestamp */}
        {!testIsOwn && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <span className="font-medium">{sender.name}</span>
            <span>•</span>
            <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}

        {/* Message bubble */}
        <div className={cn(
          "relative group px-3 py-2 rounded-xl shadow-sm transition-all duration-200 break-words",
          testIsOwn 
            ? "bg-blue-500 text-white rounded-br-md" 
            : "bg-gray-100 text-gray-800 rounded-bl-md"
        )}>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                className={cn("w-full text-sm rounded-md border px-2 py-1", testIsOwn ? 'text-gray-900' : 'text-gray-900')}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-2 justify-end">
                <Button size="sm" variant="secondary" className="h-7 px-2" onClick={() => { setIsEditing(false); setEditValue(message.content) }}>Hủy</Button>
                <Button size="sm" className="h-7 px-3" onClick={handleEditSave}>Lưu</Button>
              </div>
            </div>
          ) : (
            <p
              className="text-sm whitespace-pre-wrap break-words leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderWithMentions(message.content) }}
            />
          )}

          {/* Message actions - shown on hover */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-lg z-10 pointer-events-none group-hover:pointer-events-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEmojiPicker(v => !v) }}
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleReply()
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleBookmark()
              }}
            >
              {message.is_bookmarked ? (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ) : (
                <Star className="h-4 w-4 text-gray-600" />
              )}
            </Button>
            {testIsOwn && !isEditing && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(v => !v) }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                {isMenuOpen && (
                  <div className="absolute right-0 top-8 min-w-[140px] bg-white border rounded-md shadow z-20">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setIsEditing(true); setIsMenuOpen(false) }}>Chỉnh sửa</button>
                    <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={async () => { await onDeleteMessage?.(message.id); setIsMenuOpen(false) }}>Xóa</button>
                  </div>
                )}
              </div>
            )}
          </div>
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute z-20 mt-2">
              <EmojiPicker
                onEmojiClick={(data: any) => { setShowEmojiPicker(false); onAddReaction?.(message.id, data.emoji) }}
                width={300}
                height={350}
                theme={'light' as any}
                searchPlaceHolder={"Tìm emoji..."}
              />
            </div>
          )}
        </div>

        {/* Reactions and Thread indicator below message bubble */}
        <div className={cn(
          "flex flex-wrap gap-1 items-center",
          testIsOwn ? "justify-end" : "justify-start"
        )}>
          {/* Thread indicator - Hidden */}
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <>
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className="relative flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors rounded-full border border-gray-200 hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleReaction(reaction.emoji)
                  }}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count && reaction.count > 0 ? reaction.count : ''}</span>
                  {reaction.users?.includes(currentUser?.id || 0) || reaction.user_id === currentUser?.id ? (
                    <span className="text-blue-500">✓</span>
                  ) : null}
                  {/* Popover người đã react (simple) */}
                  {(reaction.users && reaction.users.length > 0) && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-8 hidden group-hover:flex bg-white border rounded shadow px-2 py-1 text-[11px] text-gray-600 whitespace-nowrap">
                      {reaction.users.includes(currentUser?.id || -1) ? 'Bạn, ' : ''} {reaction.count ? `${reaction.count} người` : ''}
                    </div>
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Timestamp for own messages */}
        {testIsOwn && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {message.status === 'read' ? (
              <span className="text-blue-600">✓✓</span>
            ) : message.status === 'delivered' ? (
              <span className="text-gray-500">✓✓</span>
            ) : (
              <span className="text-gray-400">✓</span>
            )}
            {message.is_edited && <span className="ml-1 italic">(đã chỉnh sửa)</span>}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function ModernChatMessages({ 
  messages, 
  currentUser, 
  conversationId,
  onOpenThread, 
  onAddReaction, 
  onRemoveReaction, 
  onBookmark, 
  onRemoveBookmark, 
  isLoading,
  onEditMessage,
  onDeleteMessage,
  onReachBottom,
  readPointers,
  members
}: ModernChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // For non-virtuoso sections (empty state), keep behavior
    scrollToBottom()
  }, [messages])

  // Ensure we jump to bottom when switching conversations and after initial load
  useEffect(() => {
    if (!messages || messages.length === 0) return
    // small delay to allow Virtuoso to layout items
    const t = setTimeout(() => {
      virtuosoRef.current?.scrollToIndex({ index: messages.length - 1, align: 'end', behavior: 'auto' })
    }, 50)
    return () => clearTimeout(t)
  }, [conversationId, messages.length])

  // Detect reach bottom to potentially send read receipts (handled in parent via WS)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = () => {
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24
      if (nearBottom) {
        onReachBottom?.()
      }
    }
    el.addEventListener('scroll', handler)
    return () => el.removeEventListener('scroll', handler)
  }, [])

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div ref={containerRef} className="flex-1 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-base font-medium text-gray-600 mb-1">No messages yet</p>
              <p className="text-sm text-gray-500">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <Virtuoso
            key={conversationId}
            ref={virtuosoRef}
            style={{ height: '100%' }}
            data={messages}
            initialTopMostItemIndex={Math.max(0, messages.length - 1)}
            itemContent={(index, message) => (
              <div className="px-4 py-1">
                <MessageBubble
                  key={message.id || `message-${index}`}
                  message={message as any}
                  currentUser={currentUser}
                  onOpenThread={onOpenThread}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                  onBookmark={onBookmark}
                  onRemoveBookmark={onRemoveBookmark}
                  onEditMessage={onEditMessage}
                  onDeleteMessage={onDeleteMessage}
                />
              </div>
            )}
            atBottomThreshold={24}
            atBottomStateChange={(atBottom) => { if (atBottom) onReachBottom?.() }}
            followOutput={"smooth" as any}
          />
        )}
        {members && readPointers && (
          <div className="px-4 mt-1 flex gap-1 items-center">
            {members.filter(m => m.id !== (currentUser?.id || 0)).map(m => (
              readPointers[(m.id)] ? (
                <div key={m.id} className="w-4 h-4 rounded-full overflow-hidden border border-white shadow">
                  {m.avatar ? <img src={m.avatar} alt={m.name||''} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gray-200"/>}
                </div>
              ) : null
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
