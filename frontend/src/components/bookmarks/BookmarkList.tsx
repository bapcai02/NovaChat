"use client";

import React, { useState, useEffect } from "react";
import { bookmarkService, Bookmark } from "@/services/bookmarkService";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BookmarkIcon,
  TrashIcon,
  TagIcon,
  UserIcon,
  CalendarIcon,
  MessageSquareIcon,
} from "lucide-react";

interface BookmarkListProps {
  onRemoveBookmark?: (messageId: number) => void;
}

export default function BookmarkList({ onRemoveBookmark }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadBookmarks = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookmarkService.getBookmarks(pageNum, 20);
      const newBookmarks = response.data || [];
      const pagination = response.pagination || { last_page: 1 };

      if (reset) {
        setBookmarks(newBookmarks);
      } else {
        setBookmarks((prev) => [...prev, ...newBookmarks]);
      }

      setHasMore(pageNum < pagination.last_page);
      setPage(pageNum);
    } catch (err) {
      setError("Không thể tải danh sách bookmark");
      console.error("Error loading bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (messageId: number) => {
    try {
      await bookmarkService.removeBookmark(messageId);
      setBookmarks((prev) =>
        prev.filter((bookmark) => bookmark.message_id !== messageId),
      );
      onRemoveBookmark?.(messageId);
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadBookmarks(page + 1, false);
    }
  };

  useEffect(() => {
    loadBookmarks(1, true);
  }, []);

  if (loading && bookmarks.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Đang tải bookmark...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => loadBookmarks(1, true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center p-8">
        <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có bookmark nào
        </h3>
        <p className="text-gray-500">
          Bạn chưa bookmark tin nhắn nào. Hãy bookmark những tin nhắn quan
          trọng!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Message content */}
              <div className="mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <MessageSquareIcon className="h-4 w-4" />
                  <span>Tin nhắn từ</span>
                  <div className="flex items-center space-x-1">
                    {bookmark.message.user.avatar ? (
                      <img
                        src={bookmark.message.user.avatar}
                        alt={bookmark.message.user.name}
                        className="h-4 w-4 rounded-full"
                      />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {bookmark.message.user.name}
                    </span>
                    {bookmark.message.user.username && (
                      <span className="text-gray-400">
                        @{bookmark.message.user.username}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {bookmark.message.content}
                  </p>
                </div>
              </div>

              {/* Bookmark note */}
              {bookmark.note && (
                <div className="mb-3">
                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                    <BookmarkIcon className="h-4 w-4" />
                    <span>Ghi chú:</span>
                  </div>
                  <p className="text-gray-800 bg-yellow-50 border-l-4 border-yellow-400 pl-3 py-2 rounded">
                    {bookmark.note}
                  </p>
                </div>
              )}

              {/* Tags */}
              {bookmark.tags && bookmark.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                    <TagIcon className="h-4 w-4" />
                    <span>Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {bookmark.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>
                    Bookmark:{" "}
                    {formatDistanceToNow(new Date(bookmark.created_at), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquareIcon className="h-3 w-3" />
                  <span>
                    Tin nhắn:{" "}
                    {formatDistanceToNow(
                      new Date(bookmark.message.created_at),
                      {
                        addSuffix: true,
                        locale: vi,
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleRemoveBookmark(bookmark.message_id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Xóa bookmark"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Load more button */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang tải..." : "Tải thêm"}
          </button>
        </div>
      )}
    </div>
  );
}
