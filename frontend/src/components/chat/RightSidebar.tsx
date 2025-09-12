"use client"

import React from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'

interface RightSidebarProps {
  open: boolean
  mode: 'members' | 'settings' | 'call' | 'video' | null
  onClose: () => void
  members?: Array<{ id: number; name?: string; username?: string }>
  isMuted: boolean
  isPinned: boolean
  onToggleMute: () => void
  onTogglePin: () => void
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  open,
  mode,
  onClose,
  members = [],
  isMuted,
  isPinned,
  onToggleMute,
  onTogglePin,
}) => {
  const { t } = useTranslation('common')
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-80 border-l border-gray-100 bg-white flex-shrink-0 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold">
              {mode === 'members' && t('members')}
              {mode === 'settings' && t('conversation_settings')}
              {mode === 'call' && t('voice_call')}
              {mode === 'video' && t('video_call')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm"
              aria-label="Close sidebar"
            >
              ×
            </button>
          </div>

          <div className="p-4 overflow-auto flex-1">
            {mode === 'members' && (
              <div className="space-y-3">
                {(members || []).map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold">
                      {(m.name || m.username || 'U').toString().charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{m.name || m.username}</div>
                      {m.username && (
                        <div className="text-xs text-gray-500 truncate">@{m.username}</div>
                      )}
                    </div>
                  </div>
                ))}
                {(!members || members.length === 0) && (
                  <div className="text-sm text-gray-500">{t('no_members')}</div>
                )}
              </div>
            )}

            {mode === 'settings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('mute_conversation')}</span>
                  <button
                    onClick={onToggleMute}
                    className={`px-2 py-1 text-xs rounded ${isMuted ? 'bg-gray-600 text-white' : 'bg-gray-100'}`}
                  >
                    {isMuted ? t('muted') : t('mute')}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('pin_conversation')}</span>
                  <button
                    onClick={onTogglePin}
                    className={`px-2 py-1 text-xs rounded ${isPinned ? 'bg-gray-600 text-white' : 'bg-gray-100'}`}
                  >
                    {isPinned ? t('pinned') : t('pin')}
                  </button>
                </div>
              </div>
            )}

            {mode === 'call' && (
              <div className="text-sm text-gray-600 space-y-3">
                <p>Preparing voice call UI...</p>
                <p className="text-xs text-gray-400">(Placeholder) Integrate WebRTC or a calling SDK here.</p>
              </div>
            )}

            {mode === 'video' && (
              <div className="text-sm text-gray-600 space-y-3">
                <p>Preparing video call UI...</p>
                <p className="text-xs text-gray-400">(Placeholder) Integrate WebRTC or a video SDK here.</p>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export default RightSidebar


