'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { logout } from '@/store/slices/authSlice'

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({ className = '', children }: LogoutButtonProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout fails, redirect to login
      router.push('/login')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className={className}
    >
      {children || 'Logout'}
    </button>
  )
}
