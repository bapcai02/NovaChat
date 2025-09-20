'use client';

import React from 'react';
import { X, BookmarkIcon } from 'lucide-react';
import BookmarkList from './BookmarkList';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookmarkModal({ isOpen, onClose }: BookmarkModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center"
      style={{ zIndex: 99999 }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <BookmarkIcon className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Bookmarks</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            <BookmarkList />
          </div>
        </div>
      </div>
    </div>
  );
}
