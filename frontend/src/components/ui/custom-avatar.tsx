'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { getAvatarColor, getUserInitials } from '@/lib/avatar-utils';

// Tạo màu nền random dựa trên tên
function getRandomColor(name: string): string {
  const colors = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#eab308', // yellow-500
    '#22c55e', // green-500
    '#3b82f6', // blue-500
    '#a855f7', // purple-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
    '#06b6d4', // cyan-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#f43f5e', // rose-500
    '#14b8a6', // teal-500
    '#84cc16', // lime-500
    '#0ea5e9', // sky-500
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

interface CustomAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

export function CustomAvatar({ 
  src, 
  alt, 
  name = 'U', 
  className,
  size = 'md'
}: CustomAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    console.log('Avatar image error for:', name, 'src:', src);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Avatar image loaded for:', name, 'src:', src);
    setImageLoaded(true);
  };

  // Chỉ hiển thị ảnh nếu có src, không lỗi, và đã load xong
  const showImage = src && !imageError && imageLoaded;
  
  // Lấy 2 ký tự đầu của tên
  const initials = name ? name.substring(0, 2).toUpperCase() : 'U';

  console.log('CustomAvatar render:', { name, src, showImage, initials, imageError, imageLoaded });

  return (
    <div className={cn(
      'relative flex shrink-0 overflow-hidden rounded-full',
      sizeClasses[size],
      className
    )}>
      {src && !imageError && (
        <img
          src={src}
          alt={alt || name}
          className="aspect-square h-full w-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      
      {!showImage && (
        <div 
          className="flex h-full w-full items-center justify-center rounded-full text-white font-semibold"
          style={{ backgroundColor: getRandomColor(name) }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
