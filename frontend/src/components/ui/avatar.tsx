"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-8 h-8 text-[10px]",
      md: "w-10 h-10 text-xs",
      lg: "w-12 h-12 text-sm",
      xl: "w-16 h-16 text-base",
    }

    const gradientClasses = {
      sm: "avatar-default-sm",
      md: "avatar-default-md", 
      lg: "avatar-default-lg",
      xl: "avatar-default-xl",
    }

    // Generate consistent color based on fallback name
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    // Generate consistent gradient based on name
    const getGradientClass = (name: string, size: keyof typeof gradientClasses) => {
      const gradients = [
        'from-blue-500 to-purple-600',
        'from-green-500 to-blue-600', 
        'from-purple-500 to-pink-600',
        'from-orange-500 to-red-600',
        'from-teal-500 to-cyan-600',
        'from-indigo-500 to-purple-600',
        'from-pink-500 to-rose-600',
        'from-yellow-500 to-orange-600',
        'from-emerald-500 to-teal-600',
        'from-violet-500 to-purple-600'
      ]
      
      const index = name.charCodeAt(0) % gradients.length
      return `bg-gradient-to-br ${gradients[index]}`
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            className="aspect-square h-full w-full object-cover"
            src={src}
            alt={alt}
            onError={(e) => {
              // Fallback to default avatar if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.classList.add('bg-gradient-to-br', getGradientClass(fallback || 'User', size))
                parent.classList.add('flex', 'items-center', 'justify-center', 'text-white', 'font-semibold')
                parent.textContent = getInitials(fallback || 'User')
              }
            }}
          />
        ) : (
          <div className={cn(
            "flex h-full w-full items-center justify-center bg-gradient-to-br text-white font-semibold",
            getGradientClass(fallback || 'User', size)
          )}>
            {getInitials(fallback || 'User')}
          </div>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
