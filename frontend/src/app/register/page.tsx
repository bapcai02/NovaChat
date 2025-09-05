"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { clearError } from '@/store/slices/authSlice'
import { AuthGuard } from '@/components/auth/AuthGuard'
import ModernAuthLayout from '@/components/auth/ModernAuthLayout'
import ModernLoadingScreen from '@/components/auth/ModernLoadingScreen'

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    dispatch(clearError())
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [dispatch])

  const handleLogin = async (data: { email: string; password: string }) => {
    router.push('/login')
  }

  const handleRegister = async (data: { name: string; email: string; username: string; password: string; confirmPassword: string }) => {
    console.log('Register data:', data)
    router.push('/login')
  }

  const handleForgotPassword = async (email: string) => {
    console.log('Forgot password for:', email)
  }

  // Show loading screen during initial load
  if (isInitialLoading) {
    return <ModernLoadingScreen message="Welcome to NovaChat..." />
  }

  return (
    <AuthGuard requireAuth={false}>
      <ModernAuthLayout
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isLoading}
        error={error}
        onForgotPassword={handleForgotPassword}
      />
    </AuthGuard>
  )
}
