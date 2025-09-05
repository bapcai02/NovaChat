"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModernSidebar from './ModernSidebarNew'
import ModernChatHeader from './ModernChatHeader'
import ModernChatMessages from './ModernChatMessagesNew'
import ModernChatInput from './ModernChatInput'
import ModernThreadChat from './ModernThreadChat'
import { useChat } from '@/hooks/useChat'

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
    isLoading,
    error,
    setCurrentConversation,
    loadMessages,
    sendMessage,
    addReaction,
    removeReaction,
    bookmarkMessage,
    removeBookmark,
    updateUserStatus,
  } = useChat()

  const [showThread, setShowThread] = useState(false)
  const [threadMessage, setThreadMessage] = useState<{
    id: string
    content: string
    sender: string
    timestamp: string
  } | null>(null)

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

  const handleTyping = (isTyping: boolean) => {
    // TODO: Implement typing indicator
    console.log('Typing:', isTyping)
  }

  const handleSearch = () => {
    // TODO: Implement search
    console.log('Search clicked')
  }

  const handleCall = () => {
    // TODO: Implement call
    console.log('Call clicked')
  }

  const handleVideoCall = () => {
    // TODO: Implement video call
    console.log('Video call clicked')
  }

  const handleViewMembers = () => {
    // TODO: Implement view members
    console.log('View members clicked')
  }

  const handleToggleMute = () => {
    // TODO: Implement mute toggle
    console.log('Toggle mute')
  }

  const handleTogglePin = () => {
    // TODO: Implement pin toggle
    console.log('Toggle pin')
  }

  const handleSettings = () => {
    // TODO: Implement settings
    console.log('Settings clicked')
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
      <div className={`flex h-screen bg-background text-foreground ${className || ''}`}>
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-80 flex-shrink-0"
        >
          <ModernSidebar 
            teams={teams}
            channels={channels}
            conversations={conversations}
            currentConversation={currentConversation}
            onSelectConversation={setCurrentConversation}
            onlineUsers={onlineUsers}
            currentUser={currentUser}
          />
        </motion.div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
              Welcome to NovaChat
            </h2>
            <p className="text-muted-foreground">
              Select a conversation to start chatting
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen bg-background text-foreground ${className || ''}`}>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-80 flex-shrink-0"
      >
        <ModernSidebar 
          teams={teams}
          channels={channels}
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={setCurrentConversation}
          onlineUsers={onlineUsers}
          currentUser={currentUser}
        />
      </motion.div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ModernChatHeader
            channelName={currentConversation.name || currentConversation.channel?.name || 'Direct Message'}
            channelType={currentConversation.type}
            memberCount={currentConversation.members?.length || 0}
            isOnline={true}
            lastSeen="now"
            avatar={currentConversation.channel?.team?.owner?.avatar}
            isMuted={false}
            isPinned={false}
            onSearch={handleSearch}
            onCall={handleCall}
            onVideoCall={handleVideoCall}
            onViewMembers={handleViewMembers}
            onToggleMute={handleToggleMute}
            onTogglePin={handleTogglePin}
            onSettings={handleSettings}
          />
        </motion.div>

        {/* Chat messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex-1 min-h-0"
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
          />
        </motion.div>

        {/* Chat input */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <ModernChatInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            placeholder={`Message ${currentConversation.name || currentConversation.channel?.name || 'here'}`}
            disabled={isLoading}
          />
        </motion.div>
      </div>

      {/* Thread Chat */}
      <AnimatePresence>
        {showThread && threadMessage && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
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
