"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import ModernAuthLayout from '@/components/auth/ModernAuthLayout'
import ModernLoadingScreen from '@/components/auth/ModernLoadingScreen'

export default function LoginPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      setError(null)
      await login(data.email, data.password)
      setIsInitialLoading(true)
      setTimeout(() => {
        router.push('/chat')
      }, 1000)
    } catch (error: any) {
      setError(error.message || 'Login failed')
    }
  }

  const handleRegister = async (data: {
    name: string
    email: string
    username: string
    password: string
    password_confirmation: string
  }) => {
    try {
      setError(null)
      await login(data.email, data.password) // For now, just login after register
      setIsInitialLoading(true)
      setTimeout(() => {
        router.push('/chat')
      }, 1000)
    } catch (error: any) {
      setError(error.message || 'Registration failed')
    }
  }

  const handleForgotPassword = async (data: { email: string }) => {
    try {
      setError(null)
      // TODO: Implement forgot password API call
      console.log('Forgot password for:', data.email)
      setForgotPasswordSuccess(true)
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email')
    }
  }

  if (isInitialLoading) {
    return <ModernLoadingScreen message="Welcome to NovaChat..." />
  }

  return (
    <AuthGuard>
      <ModernAuthLayout
        showForgotPassword={showForgotPassword}
        forgotPasswordSuccess={forgotPasswordSuccess}
        onToggleForgotPassword={() => setShowForgotPassword(!showForgotPassword)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onForgotPassword={handleForgotPassword}
        error={error}
        isLoading={isLoading}
      />
    </AuthGuard>
  )
}