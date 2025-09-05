"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModernLoginForm from './ModernLoginForm'
import ModernRegisterForm from './ModernRegisterForm'

interface AuthLayoutProps {
  onLogin?: (data: { email: string; password: string }) => void
  onRegister?: (data: { name: string; email: string; username: string; password: string; confirmPassword: string }) => void
  isLoading?: boolean
  error?: string
  onForgotPassword?: () => void
}

export default function ModernAuthLayout({
  onLogin,
  onRegister,
  isLoading = false,
  error,
  onForgotPassword
}: AuthLayoutProps) {
  const [isLogin, setIsLogin] = useState(true)

  const handleLogin = (data: { email: string; password: string }) => {
    onLogin?.(data)
  }

  const handleRegister = (data: { name: string; email: string; username: string; password: string; confirmPassword: string }) => {
    onRegister?.(data)
  }

  const handleSwitchToRegister = () => {
    setIsLogin(false)
  }

  const handleSwitchToLogin = () => {
    setIsLogin(true)
  }

  const handleForgotPassword = () => {
    onForgotPassword?.()
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {isLogin ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ModernLoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
              onSwitchToRegister={handleSwitchToRegister}
              onForgotPassword={handleForgotPassword}
            />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ModernRegisterForm
              onSubmit={handleRegister}
              isLoading={isLoading}
              error={error}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
