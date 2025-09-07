"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '@/services/api'
import type { User } from '@/types/chat'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    name: string
    email: string
    username: string
    password: string
    password_confirmation: string
  }) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          const response = await apiService.getCurrentUser()
          setUser(response.data)
        } catch (error) {
          console.error('Failed to get current user:', error)
          localStorage.removeItem('auth_token')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password)
      const { token, user: userData } = response.data
      
      localStorage.setItem('auth_token', token)
      setUser(userData)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (data: {
    name: string
    email: string
    username: string
    password: string
    password_confirmation: string
  }) => {
    try {
      const response = await apiService.register(data)
      const { token, user: userData } = response.data
      
      localStorage.setItem('auth_token', token)
      setUser(userData)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    apiService.logout().catch(console.error)
  }

  const updateUser = (userData: User) => {
    setUser(userData)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
