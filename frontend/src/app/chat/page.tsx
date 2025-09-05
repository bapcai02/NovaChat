"use client"

import React from 'react'
import ModernChatLayout from '@/components/chat/ModernChatLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function ChatPage() {
  return (
    <AuthGuard requireAuth={true}>
      <ModernChatLayout />
    </AuthGuard>
  )
}
