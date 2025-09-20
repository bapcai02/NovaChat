'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  userSearchService,
  UserSearchResult,
} from '@/services/userSearchService';
import { cn } from '@/lib/utils';

interface UserSearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (user: UserSearchResult) => void;
  searchQuery: string;
  className?: string;
}

export function UserSearchDropdown({
  isOpen,
  onClose,
  onUserSelect,
  searchQuery,
  className,
}: UserSearchDropdownProps) {
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !searchQuery.trim()) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setIsLoading(true);
      try {
        const results = await userSearchService.searchUsers(searchQuery);
        setUsers(results);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Failed to search users:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, users.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && users[selectedIndex]) {
          onUserSelect(users[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto',
        className
      )}
      onKeyDown={handleKeyDown}
    >
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center p-4"
          >
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">
              Searching users...
            </span>
          </motion.div>
        ) : users.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-1"
          >
            {users.map((user, index) => (
              <motion.button
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors',
                  selectedIndex === index && 'bg-blue-50'
                )}
                onClick={() => onUserSelect(user)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white',
                      user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : searchQuery.trim() ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center p-4 text-gray-500"
          >
            <User className="h-4 w-4 mr-2" />
            <span className="text-sm">No users found</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
