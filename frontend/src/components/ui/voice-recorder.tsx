"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  onCancel: () => void
  maxDuration?: number // in seconds
}

interface WaveformPoint {
  x: number
  y: number
  amplitude: number
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete, 
  onCancel, 
  maxDuration = 60 
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [waveformData, setWaveformData] = useState<WaveformPoint[]>([])
  const [currentPlayTime, setCurrentPlayTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Set up audio context for waveform
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)
      
      const bufferLength = analyserRef.current.frequencyBinCount
      dataArrayRef.current = new Uint8Array(bufferLength)

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setTotalDuration(recordingTime)
        
        // Stop audio context
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setWaveformData([])

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

      // Start waveform visualization
      updateWaveform()

    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }

  const updateWaveform = () => {
    if (!analyserRef.current || !dataArrayRef.current || !isRecording) return

    analyserRef.current.getByteFrequencyData(dataArrayRef.current)
    
    const newPoint: WaveformPoint = {
      x: recordingTime,
      y: 50,
      amplitude: dataArrayRef.current.reduce((sum, value) => sum + value, 0) / dataArrayRef.current.length
    }
    
    setWaveformData(prev => [...prev, newPoint])
    
    animationFrameRef.current = requestAnimationFrame(updateWaveform)
  }

  const playRecording = () => {
    if (!audioUrl) return

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentPlayTime(audioRef.current?.currentTime || 0)
      })
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
        setCurrentPlayTime(0)
      })
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSend = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, recordingTime)
    }
  }

  const handleRetry = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setCurrentPlayTime(0)
    setTotalDuration(0)
    setWaveformData([])
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getWaveformColor = (amplitude: number) => {
    const intensity = Math.min(amplitude / 128, 1)
    return `hsl(var(--chat-accent), ${intensity * 100}%, 50%)`
  }

  return (
            <div className="bg-[hsl(217.2_32.6%_17.5%)] rounded-xl p-4 space-y-4 border border-[hsl(217.2_32.6%_17.5%)] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Voice Message</h3>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-6 w-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      {/* Recording Status */}
      <div className="text-center">
        {isRecording && (
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-[hsl(var(--chat-text-muted))]">Recording...</span>
          </div>
        )}
        
        <div className="text-2xl font-mono text-[hsl(var(--chat-text))]">
          {formatTime(isRecording ? recordingTime : (isPlaying ? currentPlayTime : totalDuration))}
        </div>
        
        {isRecording && (
          <div className="text-xs text-[hsl(var(--chat-text-muted))] mt-1">
            Max {formatTime(maxDuration)}
          </div>
        )}
      </div>

      {/* Waveform Visualization */}
      <div className="h-16 bg-[hsl(var(--chat-message-bg))] rounded-lg p-2 relative overflow-hidden">
        {waveformData.length > 0 ? (
          <svg className="w-full h-full" viewBox={`0 0 ${Math.max(waveformData.length * 10, 200)} 60`}>
            {waveformData.map((point, index) => (
              <rect
                key={index}
                x={point.x * 10}
                y={30 - (point.amplitude / 4)}
                width="8"
                height={point.amplitude / 2}
                fill={getWaveformColor(point.amplitude)}
                rx="2"
              />
            ))}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-[hsl(var(--chat-text-muted))] text-xs">
            {isRecording ? 'Recording...' : 'No audio recorded'}
          </div>
        )}
        
        {/* Playback progress */}
        {!isRecording && audioUrl && (
          <div 
            className="absolute top-0 left-0 h-full bg-[hsl(var(--chat-accent))] opacity-20 transition-all duration-100"
            style={{ 
              width: `${(currentPlayTime / totalDuration) * 100}%` 
            }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!audioBlob ? (
          // Recording controls
          <>
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-6"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
                </svg>
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z"/>
                </svg>
                Stop Recording
              </Button>
            )}
          </>
        ) : (
          // Playback controls
          <>
            <Button
              onClick={playRecording}
              variant={isPlaying ? "outline" : "default"}
              className="px-6"
            >
              {isPlaying ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Play
                </>
              )}
            </Button>
            
            <Button onClick={handleRetry} variant="outline" className="px-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </Button>
            
            <Button onClick={handleSend} className="bg-[hsl(var(--chat-accent))] hover:bg-[hsl(var(--chat-accent-hover))] text-white px-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </Button>
          </>
        )}
      </div>

      {/* Tips */}
      <div className="text-xs text-[hsl(var(--chat-text-muted))] text-center">
        {!audioBlob ? (
          <p>Click "Start Recording" to begin your voice message</p>
        ) : (
          <p>Listen to your recording before sending</p>
        )}
      </div>
    </div>
  )
}
