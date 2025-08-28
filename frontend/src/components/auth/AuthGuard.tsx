'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { verifyToken, getCurrentUser } from '@/store/slices/authSlice'
import { LoadingScreen } from '@/components/ui/loading-screen'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth)
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
      const token = localStorage.getItem('auth_token')
      
      // If no token and auth is required, redirect to login
      if (!token && requireAuth) {
        router.push('/login')
        await delay(delayMs)
        setIsChecking(false)
        return
      }

      // If no token and auth is not required, allow access
      if (!token && !requireAuth) {
        await delay(delayMs)
        setIsChecking(false)
        return
      }

      // If we have a token but not authenticated, verify it
      if (token && !isAuthenticated) {
        try {
          await dispatch(verifyToken()).unwrap()
          await dispatch(getCurrentUser()).unwrap()
        } catch (error) {
          console.error('Auth verification failed:', error)
          // Clear invalid token
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          
          if (requireAuth) {
            router.push('/login')
          }
        }
      }

      await delay(delayMs)
      setIsChecking(false)
    }

    checkAuth()
  }, [dispatch, isAuthenticated, requireAuth, router])

  // Post-check redirects must happen in an effect to avoid updating router during render
  useEffect(() => {
    if (isLoading || isChecking) return
    if (requireAuth && !isAuthenticated) {
      router.push('/login')
      return
    }
    if (!requireAuth && isAuthenticated) {
      router.replace('/chat')
    }
  }, [isAuthenticated, isLoading, isChecking, requireAuth, router])

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    return <LoadingScreen />
  }

  // Block rendering while we determine and trigger redirects
  if (requireAuth && !isAuthenticated) return null
  if (!requireAuth && isAuthenticated) return null

  return <>{children}</>
}
