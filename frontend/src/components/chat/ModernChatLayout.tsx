"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModernSidebar from './ModernSidebar'
import ModernChatHeader from './ModernChatHeader'
import ModernChatMessages from './ModernChatMessages'
import ModernChatInput from './ModernChatInput'
import ModernThreadChat from './ModernThreadChat'

interface ChatLayoutProps {
  className?: string
}

export default function ModernChatLayout({ className }: ChatLayoutProps) {
  const [currentChannel, setCurrentChannel] = useState({
    id: '1',
    name: 'general',
    type: 'channel' as 'channel' | 'direct' | 'group',
    memberCount: 12,
    isOnline: true,
    lastSeen: '2 minutes ago',
    avatar: undefined,
    isMuted: false,
    isPinned: false
  })

  const [showThread, setShowThread] = useState(false)
  const [threadMessage, setThreadMessage] = useState<{
    id: string
    content: string
    sender: string
    timestamp: string
  } | null>(null)

  const handleSendMessage = (content: string, attachments?: any[]) => {
    console.log('Sending message:', content, attachments)
    // Implement message sending logic here
  }

  const handleTyping = (isTyping: boolean) => {
    console.log('Typing:', isTyping)
    // Implement typing indicator logic here
  }

  const handleSearch = () => {
    console.log('Search clicked')
    // Implement search logic here
  }

  const handleCall = () => {
    console.log('Call clicked')
    // Implement call logic here
  }

  const handleVideoCall = () => {
    console.log('Video call clicked')
    // Implement video call logic here
  }

  const handleViewMembers = () => {
    console.log('View members clicked')
    // Implement view members logic here
  }

  const handleToggleMute = () => {
    setCurrentChannel(prev => ({ ...prev, isMuted: !prev.isMuted }))
  }

  const handleTogglePin = () => {
    setCurrentChannel(prev => ({ ...prev, isPinned: !prev.isPinned }))
  }

  const handleSettings = () => {
    console.log('Settings clicked')
    // Implement settings logic here
  }

  const handleOpenThread = (message: { id: string; content: string; sender: string; timestamp: string }) => {
    setThreadMessage(message)
    setShowThread(true)
  }

  const handleCloseThread = () => {
    setShowThread(false)
    setThreadMessage(null)
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
        <ModernSidebar />
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
            channelName={currentChannel.name}
            channelType={currentChannel.type}
            memberCount={currentChannel.memberCount}
            isOnline={currentChannel.isOnline}
            lastSeen={currentChannel.lastSeen}
            avatar={currentChannel.avatar}
            isMuted={currentChannel.isMuted}
            isPinned={currentChannel.isPinned}
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
          <ModernChatMessages onOpenThread={handleOpenThread} />
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
            placeholder={`Message #${currentChannel.name}`}
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
