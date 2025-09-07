"use client"

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'
import { apiService } from '@/services/api'

interface HeaderSearchOverlayProps {
  open: boolean
  onClose: () => void
  onJumpToMessage?: (conversationId: number, messageId: number) => void
}

type SearchResult = {
  type: 'message' | 'user' | 'channel'
  id: number
  title: string
  snippet?: string
  conversation_id?: number
  message_id?: number
}

const HeaderSearchOverlay: React.FC<HeaderSearchOverlayProps> = ({ open, onClose, onJumpToMessage }) => {
  const { t } = useTranslation('common')
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [open])

  useEffect(() => {
    const run = async () => {
      const q = query.trim()
      if (!q) { setResults([]); return }
      setLoading(true)
      try {
        const res: any = await apiService.searchMessages(q)
        const data = res?.data ?? []
        const mapped: SearchResult[] = (Array.isArray(data) ? data : (data.messages || [])).map((m: any) => ({
          type: 'message', id: m.id, title: m.sender?.name || 'User', snippet: m.content, conversation_id: m.conversation_id, message_id: m.id
        }))
        setResults(mapped)
      } finally {
        setLoading(false)
      }
    }
    const tmr = setTimeout(run, 250)
    return () => clearTimeout(tmr)
  }, [query])

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute left-1/2 -translate-x-1/2 mt-6 w-[92%] max-w-2xl">
        <div className="rounded-xl bg-white shadow-2xl ring-1 ring-black/5 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder={t('search_messages')}
              className="pl-10 h-11 text-sm border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              onClick={(e) => e.stopPropagation()}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
            />
          </div>
          <div className="mt-3 max-h-80 overflow-auto divide-y">
            {loading && <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>}
            {!loading && results.length === 0 && query.trim() && (
              <div className="px-3 py-2 text-sm text-gray-500">No results</div>
            )}
            {results.map((r) => (
              <button
                key={`${r.type}-${r.id}-${r.message_id || ''}`}
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation()
                  if (r.type === 'message' && r.conversation_id && r.message_id && onJumpToMessage) {
                    onJumpToMessage(r.conversation_id, r.message_id)
                  }
                  onClose()
                }}
              >
                <div className="text-sm font-medium text-gray-800">
                  {r.type === 'message' ? 'Message' : r.type === 'user' ? 'User' : 'Channel'} · {r.title}
                </div>
                {r.snippet && (
                  <div className="text-xs text-gray-500 truncate" dangerouslySetInnerHTML={{ __html: highlight(r.snippet, query) }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function highlight(text: string, query: string) {
  const q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>')
}

export default HeaderSearchOverlay


