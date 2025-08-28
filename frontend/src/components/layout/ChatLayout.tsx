"use client"

import React from 'react'
import { Sidebar } from './Sidebar'
import { ChatArea } from './ChatArea'
import { RightSidebar } from './RightSidebar'

export const ChatLayout: React.FC = () => {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = React.useState(true)
  const [selectedThread, setSelectedThread] = React.useState<{messageId: string, messageContent: string} | null>(null)
  const [sidebarMode, setSidebarMode] = React.useState<'info' | 'thread'>('info')
  const [selectedChat, setSelectedChat] = React.useState<{ type: 'channel' | 'conversation', id: number, title: string } | null>(null)

  const handleThreadSelect = (messageId: string, messageContent: string) => {
    setSelectedThread({messageId, messageContent})
    setSidebarMode('thread')
    setIsRightSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setIsRightSidebarOpen(false)
    if (sidebarMode === 'thread') {
      setSelectedThread(null)
      setSidebarMode('info')
    }
  }

  const handleSidebarModeChange = (mode: 'info' | 'thread') => {
    setSidebarMode(mode)
    if (mode === 'info') {
      setSelectedThread(null)
    }
  }

  return (
    <div className="h-full w-full flex bg-[hsl(222.2_84%_4.9%)] text-[hsl(210_40%_98%)] overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar onSelectChat={(chat) => setSelectedChat(chat)} />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea 
          onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          onThreadSelect={handleThreadSelect}
          selectedChat={selectedChat}
        />
      </div>
      
      {/* Right Sidebar */}
      {isRightSidebarOpen && selectedChat && (
        <RightSidebar 
          onClose={handleCloseSidebar}
          mode={sidebarMode}
          onModeChange={handleSidebarModeChange}
          selectedThread={selectedThread}
        />
      )}
    </div>
  )
}
