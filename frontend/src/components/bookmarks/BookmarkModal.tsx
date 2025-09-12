'use client';

import React, { useState } from 'react';
import { X, BookmarkIcon, TagIcon } from 'lucide-react';
import { bookmarkService } from '@/services/bookmarkService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: number;
  messageContent: string;
  onBookmarkAdded?: () => void;
}

export default function BookmarkModal({ 
  isOpen, 
  onClose, 
  messageId, 
  messageContent,
  onBookmarkAdded 
}: BookmarkModalProps) {
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      await bookmarkService.bookmarkMessage(messageId, {
        note: note.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined
      });

      onBookmarkAdded?.();
      onClose();
      setNote('');
      setTags('');
    } catch (error) {
      console.error('Error adding bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <BookmarkIcon className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Bookmark tin nhắn</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Message preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tin nhắn
            </label>
            <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-800 max-h-32 overflow-y-auto">
              {messageContent}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Thêm ghi chú cho bookmark này..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TagIcon className="inline h-4 w-4 mr-1" />
              Tags (tùy chọn)
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, important, meeting (phân cách bằng dấu phẩy)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Phân cách các tags bằng dấu phẩy
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {loading ? 'Đang lưu...' : 'Bookmark'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
