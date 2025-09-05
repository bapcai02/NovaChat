"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { login, clearError } from '@/store/slices/authSlice'
import { AuthGuard } from '@/components/auth/AuthGuard'
import ModernAuthLayout from '@/components/auth/ModernAuthLayout'
import ModernLoadingScreen from '@/components/auth/ModernLoadingScreen'

export default function LoginPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)
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
    try {
      await dispatch(login(data)).unwrap()
      // Show loading while redirecting to chat
      setIsInitialLoading(true)
      router.push('/chat')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleRegister = async (data: { name: string; email: string; username: string; password: string; confirmPassword: string }) => {
    try {
      // Implement register logic here
      console.log('Register data:', data)
      // For now, just redirect to login
      router.push('/login')
    } catch (error) {
      console.error('Register failed:', error)
    }
  }

  const handleForgotPassword = async (email: string) => {
    try {
      // Implement forgot password logic here
      console.log('Forgot password for:', email)
      setForgotPasswordSuccess(true)
    } catch (error) {
      console.error('Forgot password failed:', error)
    }
  }

  // Show loading screen during initial load
  if (isInitialLoading) {
    return <ModernLoadingScreen message="Welcome to NovaChat..." />
  }

  if (showForgotPassword) {
    return (
      <AuthGuard requireAuth={false}>
        <ModernForgotPasswordForm
          onSubmit={handleForgotPassword}
          onBackToLogin={() => setShowForgotPassword(false)}
          isLoading={isLoading}
          error={error}
          success={forgotPasswordSuccess}
        />
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={false}>
      <ModernAuthLayout
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isLoading}
        error={error}
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    </AuthGuard>
  )
}
