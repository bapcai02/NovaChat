'use client';

import React, { useState, useEffect } from 'react';
import { BookmarkIcon } from 'lucide-react';
import { bookmarkService } from '@/services/bookmarkService';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  messageId: number;
  messageContent?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onBookmarkChange?: (isBookmarked: boolean) => void;
  showModal?: boolean;
  onOpenModal?: () => void;
}

export default function BookmarkButton({ 
  messageId, 
  messageContent,
  className, 
  size = 'sm',
  onBookmarkChange,
  showModal = false,
  onOpenModal
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    checkBookmarkStatus();
  }, [messageId]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await bookmarkService.isBookmarked(messageId);
      setIsBookmarked(response.isBookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmarkToggle = async () => {
    if (loading) return;
    
    // If not bookmarked and showModal is true, open modal instead
    if (!isBookmarked && showModal && onOpenModal) {
      onOpenModal();
      return;
    }
    
    setLoading(true);
    try {
      if (isBookmarked) {
        await bookmarkService.removeBookmark(messageId);
        setIsBookmarked(false);
        onBookmarkChange?.(false);
      } else {
        await bookmarkService.bookmarkMessage(messageId);
        setIsBookmarked(true);
        onBookmarkChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonSizeClasses = {
    sm: 'h-6 w-6 p-1',
    md: 'h-8 w-8 p-1.5',
    lg: 'h-10 w-10 p-2'
  };

  return (
    <button
      onClick={handleBookmarkToggle}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'flex items-center justify-center rounded-md transition-all duration-200',
        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        buttonSizeClasses[size],
        className
      )}
      title={isBookmarked ? 'Xóa bookmark' : 'Bookmark tin nhắn'}
    >
      <BookmarkIcon 
        className={cn(
          sizeClasses[size],
          'transition-all duration-200',
          isBookmarked 
            ? 'text-yellow-500 fill-yellow-500' 
            : hovered 
              ? 'text-yellow-600' 
              : 'text-gray-400',
          loading && 'animate-pulse'
        )}
      />
    </button>
  );
}
