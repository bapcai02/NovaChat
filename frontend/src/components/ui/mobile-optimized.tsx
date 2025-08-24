"use client"

import React, { useState, useEffect } from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface MobileOptimizedProps {
  children: React.ReactNode
  className?: string
}

interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

interface MobileFloatingActionProps {
  onClick: () => void
  icon: React.ReactNode
  label?: string
  className?: string
}

// Mobile-optimized container with touch-friendly spacing
export const MobileOptimized: React.FC<MobileOptimizedProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("min-h-screen touch-manipulation", className)}>
      {children}
    </div>
  )
}

// Mobile bottom sheet component
export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const deltaY = currentY - startY
    if (deltaY > 100) {
      onClose()
    }
    
    setIsDragging(false)
    setStartY(0)
    setCurrentY(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-[hsl(217.2_32.6%_17.5%)] rounded-t-xl shadow-2xl transition-transform duration-300",
          className
        )}
        style={{
          transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'
        }}
      >
        {/* Handle */}
        <div 
          className="flex justify-center pt-3 pb-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1 bg-[hsl(215.4_16.3%_56.9%)] rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-4 pb-3 border-b border-[hsl(217.2_32.6%_17.5%)]">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

// Mobile floating action button
export const MobileFloatingAction: React.FC<MobileFloatingActionProps> = ({
  onClick,
  icon,
  label,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 bg-[hsl(217.2_91.2%_59.8%)] hover:bg-[hsl(217.2_91.2%_50%)] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation",
        className
      )}
      title={label}
    >
      {icon}
    </button>
  )
}

// Mobile-optimized input with better touch targets
export const MobileInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  ...props
}) => {
  return (
    <input
      className={cn(
        "w-full px-4 py-3 text-base bg-[hsl(217.2_32.6%_17.5%)] border border-[hsl(217.2_32.6%_17.5%)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(217.2_91.2%_59.8%)] focus:border-transparent touch-manipulation",
        className
      )}
      {...props}
    />
  )
}

// Mobile-optimized button with larger touch target
export const MobileButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}> = ({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const baseClasses = "touch-manipulation transition-all duration-200 active:scale-95"
  
  const variantClasses = {
    primary: "bg-[hsl(217.2_91.2%_59.8%)] hover:bg-[hsl(217.2_91.2%_50%)] text-white",
    secondary: "bg-[hsl(217.2_32.6%_17.5%)] hover:bg-[hsl(215_25%_27%)] text-[hsl(210_40%_98%)]",
    ghost: "bg-transparent hover:bg-[hsl(215_25%_27%)] text-[hsl(210_40%_98%)]"
  }

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg"
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        "rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[hsl(217.2_91.2%_59.8%)] focus:ring-offset-2 focus:ring-offset-[hsl(222.2_84%_4.9%)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Mobile swipeable list item
export const MobileSwipeableItem: React.FC<{
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  className?: string
}> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className
}) => {
  const [isSwiping, setIsSwiping] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsSwiping(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - startX
    setCurrentX(deltaX)
    
    if (Math.abs(deltaX) > 20) {
      setIsSwiping(true)
    }
  }

  const handleTouchEnd = () => {
    const deltaX = currentX
    
    if (Math.abs(deltaX) > 100) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }
    
    setIsSwiping(false)
    setStartX(0)
    setCurrentX(0)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        {leftAction && (
          <div className="flex-1 bg-blue-500 flex items-center justify-center">
            {leftAction}
          </div>
        )}
        {rightAction && (
          <div className="flex-1 bg-red-500 flex items-center justify-center">
            {rightAction}
          </div>
        )}
      </div>

      {/* Main content */}
      <div
        className={cn(
          "relative bg-[hsl(217.2_32.6%_17.5%)] transition-transform duration-200",
          className
        )}
        style={{
          transform: isSwiping ? `translateX(${currentX}px)` : 'translateX(0)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
