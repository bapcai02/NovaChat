"use client"

import React from 'react'
import { ChatLayout } from '@/components/layout/ChatLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function ChatPage() {
  return (
    <AuthGuard requireAuth={true}>
      <ChatLayout />
    </AuthGuard>
  )
}
