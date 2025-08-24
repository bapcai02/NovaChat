"use client"

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface TouchGesturesProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinchIn?: () => void
  onPinchOut?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  className?: string
  disabled?: boolean
}

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

interface GestureState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  startTime: number
  isSwiping: boolean
  isPinching: boolean
  initialDistance: number
  currentDistance: number
  touchPoints: TouchPoint[]
}

const SWIPE_THRESHOLD = 50
const SWIPE_VELOCITY_THRESHOLD = 0.3
const LONG_PRESS_DURATION = 500
const DOUBLE_TAP_DELAY = 300

export const TouchGestures: React.FC<TouchGesturesProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchIn,
  onPinchOut,
  onDoubleTap,
  onLongPress,
  className,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gestureState, setGestureState] = useState<GestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isSwiping: false,
    isPinching: false,
    initialDistance: 0,
    currentDistance: 0,
    touchPoints: []
  })
  const [lastTapTime, setLastTapTime] = useState(0)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getVelocity = (distance: number, time: number) => {
    return distance / time
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return

    const touches = Array.from(e.touches)
    const now = Date.now()

    if (touches.length === 1) {
      // Single touch - potential swipe or tap
      const touch = touches[0]
      setGestureState(prev => ({
        ...prev,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: now,
        isSwiping: false,
        touchPoints: [{ x: touch.clientX, y: touch.clientY, timestamp: now }]
      }))

      // Start long press timer
      const timer = setTimeout(() => {
        onLongPress?.()
      }, LONG_PRESS_DURATION)
      setLongPressTimer(timer)

    } else if (touches.length === 2) {
      // Two touches - potential pinch
      const distance = getDistance(touches[0], touches[1])
      setGestureState(prev => ({
        ...prev,
        isPinching: true,
        initialDistance: distance,
        currentDistance: distance,
        startTime: now
      }))
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled) return

    const touches = Array.from(e.touches)
    const now = Date.now()

    if (touches.length === 1 && !gestureState.isPinching) {
      // Single touch move - potential swipe
      const touch = touches[0]
      const deltaX = Math.abs(touch.clientX - gestureState.startX)
      const deltaY = Math.abs(touch.clientY - gestureState.startY)

      // Determine if we're swiping
      if (deltaX > SWIPE_THRESHOLD || deltaY > SWIPE_THRESHOLD) {
        setGestureState(prev => ({
          ...prev,
          isSwiping: true,
          currentX: touch.clientX,
          currentY: touch.clientY,
          touchPoints: [...prev.touchPoints, { x: touch.clientX, y: touch.clientY, timestamp: now }]
        }))

        // Cancel long press timer
        if (longPressTimer) {
          clearTimeout(longPressTimer)
          setLongPressTimer(null)
        }
      }

    } else if (touches.length === 2 && gestureState.isPinching) {
      // Two touch move - pinch gesture
      const distance = getDistance(touches[0], touches[1])
      setGestureState(prev => ({
        ...prev,
        currentDistance: distance
      }))
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled) return

    const now = Date.now()
    const timeElapsed = now - gestureState.startTime

    // Cancel long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }

    if (gestureState.isSwiping && timeElapsed > 0) {
      // Handle swipe gesture
      const deltaX = gestureState.currentX - gestureState.startX
      const deltaY = gestureState.currentY - gestureState.startY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const velocity = getVelocity(distance, timeElapsed)

      if (velocity > SWIPE_VELOCITY_THRESHOLD) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            onSwipeRight?.()
          } else {
            onSwipeLeft?.()
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            onSwipeDown?.()
          } else {
            onSwipeUp?.()
          }
        }
      }

    } else if (gestureState.isPinching) {
      // Handle pinch gesture
      const scaleChange = gestureState.currentDistance / gestureState.initialDistance
      if (scaleChange < 0.8) {
        onPinchIn?.()
      } else if (scaleChange > 1.2) {
        onPinchOut?.()
      }
    } else if (timeElapsed < LONG_PRESS_DURATION) {
      // Handle tap gesture
      const timeSinceLastTap = now - lastTapTime
      if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
        onDoubleTap?.()
        setLastTapTime(0)
      } else {
        setLastTapTime(now)
      }
    }

    // Reset gesture state
    setGestureState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      startTime: 0,
      isSwiping: false,
      isPinching: false,
      initialDistance: 0,
      currentDistance: 0,
      touchPoints: []
    })
  }

  const handleTouchCancel = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    setGestureState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      startTime: 0,
      isSwiping: false,
      isPinching: false,
      initialDistance: 0,
      currentDistance: 0,
      touchPoints: []
    })
  }

  return (
    <div
      ref={containerRef}
      className={cn("touch-manipulation", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </div>
  )
}
