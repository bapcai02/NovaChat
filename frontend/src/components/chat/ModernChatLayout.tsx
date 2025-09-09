"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModernSidebar from './ModernSidebarNew'
import ModernChatHeader from './ModernChatHeader'
import ModernChatMessages from './ModernChatMessagesNew'
import ModernChatInput from './ModernChatInput'
import ModernThreadChat from './ModernThreadChat'
import RightSidebar from './RightSidebar'
import { useChat } from '@/hooks/useChat'
import { getWebSocketClient } from '@/lib/websocket'
import { unreadService } from '@/services/unreadService'
import UserOnlineStatus from './UserOnlineStatus'

interface ChatLayoutProps {
  className?: string
}

export default function ModernChatLayout({ className }: ChatLayoutProps) {
  const {
    currentUser,
    teams,
    channels,
    conversations,
    currentConversation,
    messages,
    onlineUsers,
    onlineUserIds,
    isLoading,
    error,
    setCurrentConversation,
    handleSelectConversation,
    loadMessages,
    sendMessage,
    addReaction,
    removeReaction,
    bookmarkMessage,
    removeBookmark,
    editMessage,
    deleteMessage,
    updateUserStatus,
    loadUnreadCounts,
    readPointers,
    typingByConversation,
  } = useChat()

  const [showThread, setShowThread] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [rightSidebarMode, setRightSidebarMode] = useState<'members' | 'settings' | 'call' | 'video' | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [threadMessage, setThreadMessage] = useState<{
    id: string
    content: string
    sender: string
    timestamp: string
  } | null>(null)

  // Helper function to get conversation display name
  const getConversationDisplayName = (conversation: any) => {
    if (!conversation) return 'Select a conversation'
    
    if (conversation.type === 'direct') {
      const otherUser = conversation.other_member || conversation.members?.find(
        (member: any) => member.id !== currentUser?.id
      )
      return otherUser?.name || conversation.title || 'Direct Message'
    }
    
    if (conversation.type === 'channel') {
      return conversation.title || conversation.channel?.name || 'Channel'
    }
    
    if (conversation.type === 'group') {
      return conversation.title || 'Team'
    }
    
    return conversation.name || conversation.title || 'Unknown'
  }

  // Helper function to get conversation avatar
  const getConversationAvatar = (conversation: any) => {
    if (!conversation) return null
    
    if (conversation.type === 'direct') {
      const otherUser = conversation.other_member || conversation.members?.find(
        (member: any) => member.id !== currentUser?.id
      )
      return otherUser?.avatar
    }
    
    if (conversation.type === 'channel') {
      return conversation.channel?.team?.owner?.avatar
    }
    
    return null
  }

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id)
    }
  }, [currentConversation, loadMessages])

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    if (!currentConversation) return
    
    try {
      await sendMessage(currentConversation.id, content, 'text')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleReachBottom = () => {
    if (!currentConversation || !currentUser) return
    try {
      const wsClient = getWebSocketClient()
      if (wsClient.getConnectionState() === 'connected' && messages.length > 0) {
        const lastMsg = messages[messages.length - 1]
        wsClient.send({ type: 'message_read', conversation_id: currentConversation.id, message_id: lastMsg.id as any, user_id: currentUser.id } as any)
      }
    } catch {}
  }

  const handleTyping = (isTyping: boolean) => {
    if (!currentConversation || !currentUser) return
    
    try {
      const wsClient = getWebSocketClient()
      if (wsClient.getConnectionState() === 'connected') {
        wsClient.send({
          type: isTyping ? 'typing_start' : 'typing_stop',
          conversation_id: currentConversation.id,
          user_id: currentUser.id
        })
      }
    } catch (error) {
      console.error('Failed to send typing indicator:', error)
    }
  }

  const typingNames = (() => {
    if (!currentConversation) return [] as string[]
    const set = typingByConversation[currentConversation.id]
    if (!set) return []
    const ids = Array.from(set).filter(id => id !== (currentUser?.id || 0))
    const names = (currentConversation.members || [])
      .filter((m: any) => ids.includes(m.id))
      .map((m: any) => m.name || m.username || `user${m.id}`)
    return names
  })()

  const handleSearch = () => {
    // Search overlay handled in header; no-op hook for now
  }

  const jumpToMessage = (conversationId: number, messageId: number, q?: string) => {
    // If jumping within current conversation, scroll to message; else switch then fetch and scroll.
    const doScroll = () => {
      const el = document.querySelector(`[data-message-id="${messageId}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-2', 'ring-yellow-300')
        setTimeout(() => el.classList.remove('ring-2', 'ring-yellow-300'), 1500)
      }
    }
    if (currentConversation?.id !== conversationId) {
      const conv = conversations.find(c => c.id === conversationId)
      if (conv) {
        handleSelectConversation(conv)
        // delay to ensure messages loaded
        let attempts = 0
        const tryScroll = () => {
          attempts++
          const found = document.querySelector(`[data-message-id="${messageId}"]`)
          if (found) { doScroll(); return }
          if (attempts < 8) { setTimeout(tryScroll, 250); return }
        }
        setTimeout(tryScroll, 500)
      }
    } else {
      let attempts = 0
      const tryScroll = () => {
        attempts++
        const found = document.querySelector(`[data-message-id="${messageId}"]`)
        if (found) { doScroll(); return }
        if (attempts < 8) { setTimeout(tryScroll, 200); return }
      }
      tryScroll()
    }
  }

  const handleCall = () => {
    setRightSidebarMode('call')
    setIsRightSidebarOpen(true)
  }

  const handleVideoCall = () => {
    setRightSidebarMode('video')
    setIsRightSidebarOpen(true)
  }

  const handleViewMembers = () => {
    setRightSidebarMode('members')
    setIsRightSidebarOpen(true)
  }

  const handleToggleMute = () => {
    setIsMuted(prev => !prev)
  }

  const handleTogglePin = () => {
    setIsPinned(prev => !prev)
  }

  const handleSettings = () => {
    setRightSidebarMode('settings')
    setIsRightSidebarOpen(true)
  }

  const handleToggleRightSidebar = () => {
    setIsRightSidebarOpen(prev => !prev)
  }

  const handleOpenThread = (message: { id: string; content: string; sender: string; timestamp: string }) => {
    setThreadMessage(message)
    setShowThread(true)
  }

  const handleCloseThread = () => {
    setShowThread(false)
    setThreadMessage(null)
  }

  // Show loading if no conversation selected
  if (!currentConversation) {
    return (
      <div className={`flex h-screen bg-gray-50 text-gray-900 ${className || ''}`}>
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-80 flex-shrink-0"
        >
          <ModernSidebar 
            teams={teams}
            conversations={conversations}
            currentConversation={currentConversation}
            onSelectConversation={handleSelectConversation}
            currentUser={currentUser}
            onlineUserIds={onlineUserIds}
          />
        </motion.div>
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="flex flex-col items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <div className="relative">
                    <div className="w-10 h-10 border-3 border-white rounded-full"></div>
                    <div className="absolute top-1.5 left-1.5 w-7 h-7 bg-white rounded-full opacity-90"></div>
                    <div className="absolute top-3 left-3 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-3 border-white shadow-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="text-center">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  Nova Chat
                </h2>
                <p className="text-sm font-medium text-gray-500">Modern Communication</p>
              </div>
            </div>
            <p className="text-lg text-gray-500">
              Select a conversation to start chatting
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen bg-gray-50 text-gray-900 ${className || ''}`}>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-80 flex-shrink-0"
      >
        <ModernSidebar 
          teams={teams}
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={handleSelectConversation}
          currentUser={currentUser}
          onlineUserIds={onlineUserIds}
        />
      </motion.div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white h-screen">
        {/* Chat header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-shrink-0"
        >
          <ModernChatHeader
            channelName={getConversationDisplayName(currentConversation)}
            channelType={currentConversation.type}
            memberCount={currentConversation.members?.length || 0}
            isOnline={true}
            lastSeen="now"
            avatar={getConversationAvatar(currentConversation)}
            isMuted={isMuted}
            isPinned={isPinned}
            onSearch={handleSearch}
            onCall={handleCall}
            onVideoCall={handleVideoCall}
            onViewMembers={handleViewMembers}
            onToggleMute={handleToggleMute}
            onTogglePin={handleTogglePin}
            onSettings={handleSettings}
            onJumpToMessage={jumpToMessage}
            onMarkAllRead={async () => {
              if (!currentConversation) return
              await unreadService.markConversationAsRead(currentConversation.id)
              loadUnreadCounts()
            }}
            
          />
        </motion.div>

        {/* Chat messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex-1 min-h-0 overflow-hidden"
        >
          <ModernChatMessages 
            messages={messages}
            currentUser={currentUser}
            onOpenThread={handleOpenThread}
            onAddReaction={addReaction}
            onRemoveReaction={removeReaction}
            onBookmark={bookmarkMessage}
            onRemoveBookmark={removeBookmark}
            isLoading={isLoading}
            onEditMessage={async (id, content) => { await editMessage(id, content) }}
            onDeleteMessage={async (id) => { await deleteMessage(id) }}
            onReachBottom={handleReachBottom}
            members={(currentConversation?.members || []).map((m: any) => ({ id: m.id, name: m.name, avatar: m.avatar }))}
            readPointers={currentConversation ? (readPointers[currentConversation.id] || {}) : {}}
          />
        </motion.div>

        {/* Chat input */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex-shrink-0"
        >
          <ModernChatInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            placeholder={`Type message...`}
            disabled={isLoading}
            typingUsers={typingNames}
            mentionUsers={(currentConversation?.members || []).map((m: any) => ({ id: m.id, name: m.name, username: m.username, avatar: m.avatar }))}
          />
        </motion.div>
      </div>

      <RightSidebar
        open={isRightSidebarOpen}
        mode={rightSidebarMode}
        onClose={() => setIsRightSidebarOpen(false)}
        members={(currentConversation?.members || []).map((m: any) => ({ id: m.id, name: m.name, username: m.username }))}
        isMuted={isMuted}
        isPinned={isPinned}
        onToggleMute={handleToggleMute}
        onTogglePin={handleTogglePin}
      />

      {/* Global search overlay for jump-to-message */}
      {/* The overlay is managed in header, but we pass the jumper here */}

      {/* Thread Chat */}
      <AnimatePresence>
        {showThread && threadMessage && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-96 flex-shrink-0"
          >
            <ModernThreadChat
              parentMessage={threadMessage}
              onClose={handleCloseThread}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
