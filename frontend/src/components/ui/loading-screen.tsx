"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  className?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ className }) => {
  return (
    <div className={cn("h-screen w-screen flex bg-[hsl(222.2_84%_4.9%)] text-[hsl(210_40%_98%)]", className)}>
      {/* Left sidebar skeleton */}
      <div className="w-56 flex-shrink-0 bg-[hsl(217.2_32.6%_17.5%)] border-r border-[hsl(var(--chat-border))] p-3 space-y-3">
        <div className="h-6 w-28 rounded bg-[hsl(var(--chat-message-hover))] animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 rounded bg-[hsl(var(--chat-message-hover))] animate-pulse" />
          ))}
        </div>
        <div className="h-4 w-20 rounded bg-[hsl(var(--chat-message-hover))] animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 rounded bg-[hsl(var(--chat-message-hover))] animate-pulse" />
          ))}
        </div>
      </div>

      {/* Main area skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-10 flex items-center px-4 border-b border-[hsl(var(--chat-border))] bg-[hsl(222.2_84%_4.9%)]">
          <div className="h-4 w-24 rounded bg-[hsl(var(--chat-message-hover))] animate-pulse" />
        </div>
        {/* Messages area */}
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-3xl space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-[hsl(var(--chat-message-hover))] animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-[hsl(var(--chat-message-hover))] animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-[hsl(var(--chat-message-hover))] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Composer */}
        <div className="px-4 py-3 border-t border-[hsl(var(--chat-border))]">
          <div className="h-10 rounded-md bg-[hsl(var(--chat-message-hover))] animate-pulse" />
        </div>
      </div>

      {/* Right sidebar skeleton */}
      <div className="hidden xl:block w-96 flex-shrink-0 bg-[hsl(217.2_32.6%_17.5%)] border-l border-[hsl(var(--chat-border))] p-3">
        <div className="space-y-3 w-full">
          <div className="h-6 w-24 rounded bg-[hsl(var(--chat-message-hover))] animate-pulse" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-[hsl(var(--chat-message-hover))] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen


