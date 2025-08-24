"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface VoicePlayerProps {
  audioUrl: string
  duration: number
  author: string
  timestamp: string
  className?: string
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ 
  audioUrl, 
  duration, 
  author, 
  timestamp, 
  className 
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = async () => {
    if (!audioRef.current) {
      setIsLoading(true)
      setError(null)
      
      try {
        audioRef.current = new Audio(audioUrl)
        
        audioRef.current.addEventListener('loadeddata', () => {
          setIsLoading(false)
        })
        
        audioRef.current.addEventListener('error', () => {
          setError('Failed to load audio')
          setIsLoading(false)
        })
        
        audioRef.current.addEventListener('timeupdate', () => {
          setCurrentTime(audioRef.current?.currentTime || 0)
        })
        
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false)
          setCurrentTime(0)
        })
        
        audioRef.current.addEventListener('play', () => {
          setIsPlaying(true)
        })
        
        audioRef.current.addEventListener('pause', () => {
          setIsPlaying(false)
        })
        
        await audioRef.current.play()
      } catch (err) {
        setError('Failed to play audio')
        setIsLoading(false)
        console.error('Audio playback error:', err)
      }
    } else {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const getProgressPercentage = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0
  }

  const generateWaveform = () => {
    // Generate mock waveform data for visualization
    const bars = 20
    const waveform = []
    
    for (let i = 0; i < bars; i++) {
      const height = Math.random() * 0.8 + 0.2 // Random height between 0.2 and 1.0
      waveform.push(height)
    }
    
    return waveform
  }

  const waveform = generateWaveform()

  if (error) {
    return (
      <div className={cn("flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg", className)}>
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center space-x-3 p-3 bg-[hsl(var(--chat-message-bg))] rounded-lg border border-[hsl(var(--chat-border))]", className)}>
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlayPause}
        disabled={isLoading}
        className="h-8 w-8 flex-shrink-0"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-[hsl(var(--chat-accent))] border-t-transparent rounded-full animate-spin"></div>
        ) : isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </Button>

      {/* Waveform and Progress */}
      <div className="flex-1 min-w-0">
        {/* Waveform Visualization */}
        <div className="flex items-center space-x-1 mb-2">
          {waveform.map((height, index) => (
            <div
              key={index}
              className="bg-[hsl(var(--chat-text-muted))] rounded-sm transition-all duration-200"
              style={{
                width: '2px',
                height: `${height * 20}px`,
                opacity: index / waveform.length < getProgressPercentage() / 100 ? 1 : 0.3
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div 
          className="relative h-1 bg-[hsl(var(--chat-border))] rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-[hsl(var(--chat-accent))] rounded-full transition-all duration-100"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Time Display */}
      <div className="flex-shrink-0 text-xs text-[hsl(var(--chat-text-muted))] font-mono">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      {/* Voice Message Icon */}
      <div className="flex-shrink-0">
        <svg className="w-4 h-4 text-[hsl(var(--chat-text-muted))]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/>
          <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
        </svg>
      </div>
    </div>
  )
}
