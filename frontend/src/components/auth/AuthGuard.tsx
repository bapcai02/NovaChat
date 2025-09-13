'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ModernLoadingScreen from './ModernLoadingScreen'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    const delayMs = (() => {
      const v = Number(process.env.NEXT_PUBLIC_LOADING_DELAY_MS)
      if (Number.isFinite(v) && v > 0) return v
      // Default slow loading to help visualize UI
      return 1200
    })()

    const checkAuth = async () => {
      try {
        // Wait for auth state to be determined
        await delay(delayMs)
        
        if (requireAuth && !isAuthenticated) {
          router.push('/login')
          return
        }
        
        if (!requireAuth && isAuthenticated) {
          router.push('/chat')
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (requireAuth) {
          router.push('/login')
        }
      } finally {
        setIsChecking(false)
      }
    }

    if (!isLoading) {
      checkAuth()
    }
  }, [isAuthenticated, isLoading, requireAuth, router])

  // Show loading while checking auth
  if (isLoading || isChecking) {
    return <ModernLoadingScreen />
  }

  // Don't render children if auth requirements not met
  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}