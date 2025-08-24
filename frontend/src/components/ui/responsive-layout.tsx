"use client"

import React, { useState, useEffect } from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  rightSidebar?: React.ReactNode
  onSidebarToggle?: () => void
  onRightSidebarToggle?: () => void
  className?: string
}

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  rightSidebar,
  onSidebarToggle,
  onRightSidebarToggle,
  className
}) => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      let newBreakpoint: Breakpoint = 'xs'
      
      if (width >= BREAKPOINTS['2xl']) newBreakpoint = '2xl'
      else if (width >= BREAKPOINTS.xl) newBreakpoint = 'xl'
      else if (width >= BREAKPOINTS.lg) newBreakpoint = 'lg'
      else if (width >= BREAKPOINTS.md) newBreakpoint = 'md'
      else if (width >= BREAKPOINTS.sm) newBreakpoint = 'sm'
      
      setBreakpoint(newBreakpoint)
      setIsMobile(width < BREAKPOINTS.md)
      
      // Auto-close sidebars on mobile when screen size changes
      if (width < BREAKPOINTS.md) {
        setIsSidebarOpen(false)
        setIsRightSidebarOpen(false)
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen)
    onSidebarToggle?.()
  }

  const handleRightSidebarToggle = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen)
    onRightSidebarToggle?.()
  }

  const shouldShowSidebar = breakpoint >= 'lg' || isSidebarOpen
  const shouldShowRightSidebar = breakpoint >= 'xl' || isRightSidebarOpen

  return (
    <div className={cn("h-full w-full flex bg-[hsl(222.2_84%_4.9%)] text-[hsl(210_40%_98%)] overflow-hidden", className)}>
      {/* Mobile Overlay */}
      {(isSidebarOpen || isRightSidebarOpen) && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => {
            setIsSidebarOpen(false)
            setIsRightSidebarOpen(false)
          }}
        />
      )}

      {/* Left Sidebar */}
      {sidebar && (
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-300 ease-in-out",
            shouldShowSidebar
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100",
            isMobile && isSidebarOpen
              ? "fixed left-0 top-0 z-50 h-full w-64"
              : "relative w-56 lg:w-56"
          )}
        >
          {sidebar}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        {isMobile && (
          <div className="lg:hidden h-12 bg-[hsl(217.2_32.6%_17.5%)] flex items-center justify-between px-3 border-b border-[hsl(217.2_32.6%_17.5%)]">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSidebarToggle}
              className="h-8 w-8"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">NovaChat</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRightSidebarToggle}
              className="h-8 w-8"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex">
          <div className="flex-1 min-w-0">
            {children}
          </div>

          {/* Right Sidebar */}
          {rightSidebar && (
            <div
              className={cn(
                "flex-shrink-0 transition-all duration-300 ease-in-out",
                shouldShowRightSidebar
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0 xl:translate-x-0 xl:opacity-100",
                isMobile && isRightSidebarOpen
                  ? "fixed right-0 top-0 z-50 h-full w-80"
                  : "relative w-80 xl:w-80"
              )}
            >
              {rightSidebar}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
