"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/hooks/useAppSelector'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/chat')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-[hsl(222.2_84%_4.9%)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--chat-accent))] mx-auto mb-4"></div>
          <p className="text-[hsl(210_40%_98%)]">Redirecting...</p>
        </div>
      </div>
    </AuthGuard>
  )
}
