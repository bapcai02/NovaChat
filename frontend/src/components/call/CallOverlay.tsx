"use client"

import React from 'react'
import { X, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CallOverlayProps {
  open: boolean
  onClose: () => void
  calleeName?: string
  statusText?: string
  onHangup: () => void
}

export default function CallOverlay({ open, onClose, calleeName, statusText, onHangup }: CallOverlayProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 relative">
        <button aria-label="Close" onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold">
            {(calleeName || 'User').slice(0, 2).toUpperCase()}
          </div>
          <div className="text-lg font-semibold text-gray-800">{calleeName || 'Calling…'}</div>
          <div className="text-sm text-gray-500">{statusText || 'Audio call in progress'}</div>
          <div className="mt-4">
            <Button variant="destructive" onClick={onHangup} className="flex items-center gap-2">
              <PhoneOff className="h-4 w-4" />
              End Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


