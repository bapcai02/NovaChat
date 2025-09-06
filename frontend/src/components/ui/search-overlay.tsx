"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SearchResult } from '@/services/searchService'

interface SearchOverlayProps {
  isVisible: boolean
  isSearching: boolean
  results: SearchResult[]
  onSelectResult: (result: SearchResult) => void
  onClose: () => void
}

export function SearchOverlay({ 
  isVisible, 
  isSearching, 
  results, 
  onSelectResult, 
  onClose 
}: SearchOverlayProps) {
  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50"
        onClick={onClose}
      >
        {/* Backdrop with blur effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />
        
        {/* Search Results Card */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            duration: 0.3, 
            ease: [0.4, 0.0, 0.2, 1],
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="absolute top-20 left-4 right-4 max-w-md mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Search Results</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {results.length} users
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="p-8 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-amber-200 border-t-amber-500 rounded-full mx-auto mb-3"
                  />
                  <p className="text-sm text-gray-500">Searching users...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="p-2">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: index * 0.05,
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                      className="group relative"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group-hover:bg-gradient-to-r group-hover:from-amber-50 group-hover:to-orange-50"
                        onClick={() => onSelectResult(result)}
                      >
                        {/* Avatar with online status */}
                        <div className="relative">
                          <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                            <AvatarImage src={result.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 font-medium">
                              {result.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online status dot */}
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white shadow-sm",
                            result.isOnline 
                              ? "bg-green-500" 
                              : "bg-gray-400"
                          )} />
                        </div>

                        {/* User info */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate group-hover:text-amber-700 transition-colors">
                              {result.name}
                            </h3>
                            <Badge 
                              variant="secondary" 
                              className="text-xs bg-amber-100 text-amber-700 border-amber-200"
                            >
                              User
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate group-hover:text-gray-600 transition-colors">
                            {result.description || 'User'}
                          </p>
                        </div>

                        {/* Hover effect indicator */}
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="text-amber-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <User className="h-4 w-4" />
                        </motion.div>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <Search className="h-8 w-8 text-gray-400" />
                  </motion.div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-sm text-gray-500">
                    Try searching with a different keyword
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Click to select</span>
                  <span>ESC to close</span>
                </div>
                <span>Powered by NovaChat</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
