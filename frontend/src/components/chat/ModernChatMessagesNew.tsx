'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, MoreHorizontal, Smile } from 'lucide-react';
import { apiService } from '@/services/api';
import EmojiPicker from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BookmarkButton from '@/components/ui/bookmark-button';
import { cn } from '@/lib/utils';
import type { Message, User } from '@/types/chat';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

interface ModernChatMessagesProps {
  messages: Message[];
  currentUser: User | null;
  conversationId?: number;
  onOpenThread?: (message: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    conversation_id: string;
  }) => void;
  onAddReaction?: (messageId: number, emoji: string) => void;
  onRemoveReaction?: (messageId: number, emoji: string) => void;
  onBookmark?: (messageId: number, note?: string) => void;
  onRemoveBookmark?: (messageId: number) => void;
  isLoading?: boolean;
  onEditMessage?: (messageId: number, content: string) => Promise<void> | void;
  onDeleteMessage?: (messageId: number) => Promise<void> | void;
  onReachBottom?: () => void;
  readPointers?: Record<number, number>;
  members?: Array<{ id: number; name?: string; avatar?: string }>;
}

interface MessageBubbleProps {
  message: Message;
  currentUser: User | null;
  onOpenThread?: (message: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    conversation_id: string;
  }) => void;
  onAddReaction?: (messageId: number, emoji: string) => void;
  onRemoveReaction?: (messageId: number, emoji: string) => void;
  onBookmark?: (messageId: number, note?: string) => void;
  onRemoveBookmark?: (messageId: number) => void;
  onEditMessage?: (messageId: number, content: string) => Promise<void> | void;
  onDeleteMessage?: (messageId: number) => Promise<void> | void;
}

const MessageBubble = ({
  message,
  currentUser,
  onOpenThread,
  onAddReaction,
  onRemoveReaction,
  onBookmark,
  onRemoveBookmark,
  onEditMessage,
  onDeleteMessage,
}: MessageBubbleProps) => {
  const messageUserId =
    message.user_id || message.sender?.id || message.user?.id;
  const currentUserId = currentUser?.id;
  const isOwn = String(currentUserId) === String(messageUserId);
  const testIsOwn = isOwn;
  const isDeleted = Boolean(
    (message as any).is_deleted ||
      (message as any).deleted_at ||
      (message.content || '').trim() === '[deleted]'
  );
  const sender = message.sender ||
    message.user || { name: 'Unknown', avatar: undefined };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [readers, setReaders] = useState<
    Array<{ id: number; name?: string; username?: string; avatar?: string }>
  >([]);
  const [versions, setVersions] = useState<
    Array<{
      id: number;
      action: string;
      old_content?: string;
      new_content?: string;
      created_at: string;
      editor_id?: number;
    }>
  >([]);
  const [showVersions, setShowVersions] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const handleReaction = (emoji: string) => {
    if (testIsOwn) return;

    const hasReacted = message.reactions?.some(
      r =>
        r.emoji === emoji &&
        (r.users?.includes(currentUser?.id || 0) ||
          r.user_id === currentUser?.id)
    );

    if (hasReacted) {
      onRemoveReaction?.(message.id, emoji);
    } else {
      onAddReaction?.(message.id, emoji);
    }
  };

  const handleReply = () => {
    onOpenThread?.({
      id: message.id.toString(),
      content: message.content,
      sender: sender.name || 'Unknown',
      timestamp: new Date(message.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      conversation_id: message.conversation_id?.toString() || '',
    });
  };

  const handleEditSave = async () => {
    if (!editValue.trim()) return;
    await onEditMessage?.(message.id, editValue.trim());
    setIsEditing(false);
    setIsEditModalOpen(false);
    setIsMenuOpen(false);
  };

  const escapeHtml = (str: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const renderWithMentions = (text: string) => {
    const safe = escapeHtml(text);
    return safe.replace(
      /(^|\s)(@\w{1,30})/g,
      (_m, p1, p2) => `${p1}<span class='text-red-600'>${p2}</span>`
    );
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showEmojiPicker]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'flex gap-2 mb-3',
        testIsOwn ? 'flex-row-reverse' : 'flex-row'
      )}
      data-message-id={message.id}
    >
      {/* Avatar */}
      {!testIsOwn && (
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarImage src={sender.avatar} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {sender.name
              ?.split(' ')
              .map(n => n[0])
              .join('') || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div
        className={cn(
          'flex flex-col gap-1 max-w-[70%] min-w-0',
          testIsOwn ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender name and timestamp */}
        {!testIsOwn && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <span className="font-medium">{sender.name}</span>
            <span>•</span>
            <span>
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'relative group px-3 py-2 rounded-xl shadow-sm transition-all duration-200 break-words',
            testIsOwn
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
          )}
        >
          {/* Content */}
          {
            <p
              className="text-sm whitespace-pre-wrap break-words leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: renderWithMentions(message.content),
              }}
            />
          }

          {/* Attachments preview */}
          {(() => {
            const attachments =
              (message as any).attachments ||
              (message as any).metadata?.attachments ||
              [];
            return (
              Array.isArray(attachments) &&
              attachments.length > 0 && (
                <div
                  className={cn(
                    'mt-2 grid gap-2',
                    attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                  )}
                >
                  {attachments.map((att: any, idx: number) => {
                    const isImage =
                      typeof att?.type === 'string' &&
                      att.type.startsWith('image/');
                    const url =
                      att?.data ||
                      att?.preview ||
                      att?.url ||
                      (att?.remoteKey
                        ? `/storage/${att.remoteKey}`
                        : undefined);
                    const filename =
                      att?.name || (isImage ? `image-${idx}` : `file-${idx}`);
                    if (isImage && url) {
                      return (
                        <div key={idx} className="relative group">
                          <div
                            className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg overflow-hidden border bg-gray-100 cursor-pointer"
                            style={{
                              borderColor: testIsOwn
                                ? 'rgba(255,255,255,0.2)'
                                : '#e5e7eb',
                              backgroundColor: testIsOwn
                                ? 'rgba(255,255,255,0.1)'
                                : '#f3f4f6',
                            }}
                            onClick={() =>
                              setPreviewImage({
                                url: url as string,
                                name: filename,
                              })
                            }
                          >
                            <img
                              src={url}
                              alt={filename}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              className="px-2 py-1 text-[10px] rounded bg-white/90 hover:bg-white border border-gray-200 text-gray-700 shadow-sm"
                              onClick={e => {
                                e.stopPropagation();
                                setPreviewImage({
                                  url: url as string,
                                  name: filename,
                                });
                              }}
                            >
                              Xem
                            </button>
                            <button
                              className="px-2 py-1 text-[10px] rounded bg-white/90 hover:bg-white border border-gray-200 text-gray-700 shadow-sm"
                              onClick={e => {
                                e.stopPropagation();
                                const link = document.createElement('a');
                                link.href = url as string;
                                link.download = filename;
                                link.click();
                              }}
                            >
                              Tải xuống
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="relative group">
                        <div
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-md border text-xs cursor-pointer',
                            testIsOwn
                              ? 'bg-white/10 border-white/20 text-white'
                              : 'bg-white border-gray-200 text-gray-700'
                          )}
                          onClick={() => {
                            console.log('File clicked:', {
                              url,
                              filename,
                              att,
                              message: message,
                            });
                            console.log(
                              'Message metadata:',
                              (message as any).metadata
                            );
                            console.log(
                              'Message attachments:',
                              (message as any).attachments
                            );

                            if (url) {
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = filename;
                              link.target = '_blank';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } else if (att?.data) {
                              // Download from base64 data
                              const link = document.createElement('a');
                              link.href = att.data;
                              link.download = filename;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } else if (att?.file) {
                              // Try to download from File object
                              const link = document.createElement('a');
                              link.href = URL.createObjectURL(att.file);
                              link.download = filename;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(link.href);
                            } else if (att?.preview) {
                              // Try to download from preview URL
                              const link = document.createElement('a');
                              link.href = att.preview;
                              link.download = filename;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } else {
                              // File không có nội dung, chỉ có metadata
                              alert(
                                `File "${filename}" không thể tải xuống vì chỉ có thông tin metadata:\n\n- Tên: ${filename}\n- Kích thước: ${att?.size ? Math.ceil(att.size / 1024) + 'KB' : 'Unknown'}\n- Loại: ${att?.type || 'Unknown'}\n\nFile này được upload trước khi hệ thống cập nhật để lưu nội dung file.`
                              );
                            }
                          }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />
                          <span className="truncate max-w-[160px]">
                            {filename}
                          </span>
                          {typeof att?.size === 'number' && (
                            <span
                              className={cn(
                                'ml-auto',
                                testIsOwn ? 'text-white/70' : 'text-gray-500'
                              )}
                            >
                              {Math.ceil(att.size / 1024)} KB
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            className="px-2 py-1 text-[10px] rounded bg-white/90 hover:bg-white border border-gray-200 text-gray-700 shadow-sm"
                            onClick={e => {
                              e.stopPropagation();
                              console.log('Download button clicked:', {
                                url,
                                filename,
                                att,
                              });
                              if (url) {
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = filename;
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } else if (att?.data) {
                                // Download from base64 data
                                const link = document.createElement('a');
                                link.href = att.data;
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } else {
                                alert(
                                  'Không thể tải xuống: File không có dữ liệu'
                                );
                              }
                            }}
                          >
                            Tải xuống
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            );
          })()}
          {/* Edited indicator for all messages */}
          {message.is_edited && (
            <div
              className={cn(
                'mt-1 text-[10px] italic opacity-75',
                testIsOwn
                  ? 'text-white/80 text-right'
                  : 'text-gray-500 text-right'
              )}
              title={
                message.edited_at
                  ? new Date(message.edited_at as any).toLocaleString()
                  : undefined
              }
            >
              (đã chỉnh sửa)
            </div>
          )}

          {/* Thread hint below the message */}
          {((message as any).parent_id ||
            ((message as any).replies_count || 0) > 0) && (
            <div className="mt-1 flex items-center gap-1 text-[11px] leading-none">
              <MessageCircle
                className={cn(
                  'h-3.5 w-3.5',
                  testIsOwn ? 'text-white/80' : 'text-gray-500'
                )}
              />
              <span
                className={cn(testIsOwn ? 'text-white/80' : 'text-gray-500')}
              >
                {(message as any).parent_id
                  ? 'Reply in thread'
                  : `${(message as any).replies_count || 0} replies`}
              </span>
            </div>
          )}

          {/* Message actions - shown on hover (flip outward by side) */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-xl z-10 pointer-events-none group-hover:pointer-events-auto backdrop-blur-sm',
              testIsOwn ? 'right-full mr-2' : 'left-full ml-2'
            )}
          >
            {/* caret */}
            <span
              className={cn(
                'absolute w-0 h-0 border-y-8 border-y-transparent',
                testIsOwn
                  ? '-right-2 border-l-8 border-l-white drop-shadow'
                  : '-left-2 border-r-8 border-r-white drop-shadow'
              )}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setShowEmojiPicker(v => !v);
              }}
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                handleReply();
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                onMouseEnter={async e => {
                  try {
                    const res = await apiService.getMessageReaders(
                      String(message.id)
                    );
                    const list = (res as any)?.data || (res as any) || [];
                    setReaders(list as any);
                  } catch (err) {
                    console.error('Failed to load readers', err);
                  }
                }}
              >
                Đã xem
              </Button>
              {/* Tooltip under bubble */}
              {readers && readers.length > 0 && (
                <div
                  className={cn(
                    'absolute mt-1 top-full bg-white border border-gray-200 rounded-md shadow px-2 py-1 z-20',
                    testIsOwn ? 'right-0' : 'left-0'
                  )}
                >
                  <div className="flex -space-x-1 items-center">
                    {readers.slice(0, 5).map(r => (
                      <div
                        key={r.id}
                        className="w-4 h-4 rounded-full overflow-hidden border border-white"
                      >
                        {r.avatar ? (
                          <img
                            src={r.avatar}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                    ))}
                    {readers.length > 5 && (
                      <div className="ml-1 text-[10px] text-gray-500">
                        +{readers.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  const cid = (message as any).conversation_id;
                  const url = `${window.location.origin}/chat?cid=${cid}&mid=${message.id}`;
                  navigator.clipboard?.writeText(url);
                } catch {}
              }}
            >
              Copy link
            </Button>
            <BookmarkButton
              messageId={message.id}
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              onBookmarkChange={isBookmarked => {
                if (isBookmarked) {
                  onBookmark?.(message.id);
                } else {
                  onRemoveBookmark?.(message.id);
                }
              }}
            />
            {testIsOwn && !isEditing && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(v => !v);
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                {isMenuOpen && (
                  <div
                    className={cn(
                      'absolute top-8 min-w-[140px] bg-white text-gray-800 border rounded-md shadow z-20',
                      testIsOwn ? 'right-0' : 'left-0'
                    )}
                  >
                    {!isDeleted && (
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => {
                          setIsEditing(true);
                          setIsEditModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        Chỉnh sửa
                      </button>
                    )}
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      onClick={async () => {
                        try {
                          const res = await apiService.getMessageVersions(
                            String(message.id)
                          );
                          const list = (res as any)?.data || (res as any) || [];
                          setVersions(list as any);
                          setShowVersions(true);
                        } catch (e) {
                          console.error('Failed to load versions', e);
                        } finally {
                          setIsMenuOpen(false);
                        }
                      }}
                    >
                      Lịch sử chỉnh sửa
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        await onDeleteMessage?.(message.id);
                        setIsMenuOpen(false);
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className={cn(
                'absolute z-20',
                // place picker outward to avoid covering bubble
                testIsOwn
                  ? 'top-1/2 -translate-y-1/2 right-full mr-2'
                  : 'top-1/2 -translate-y-1/2 left-full ml-2'
              )}
            >
              <EmojiPicker
                onEmojiClick={(data: any) => {
                  setShowEmojiPicker(false);
                  onAddReaction?.(message.id, data.emoji);
                }}
                width={300}
                height={350}
                theme={'light' as any}
                searchPlaceHolder={'Tìm emoji...'}
              />
            </div>
          )}
        </div>

        {/* Reactions and Thread indicator below message bubble */}
        <div
          className={cn(
            'flex flex-wrap gap-1 items-center',
            testIsOwn ? 'justify-end' : 'justify-start'
          )}
        >
          {/* Thread indicator - Hidden */}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <>
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className="relative flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors rounded-full border border-gray-200 hover:bg-gray-50"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleReaction(reaction.emoji);
                  }}
                >
                  <span>{reaction.emoji}</span>
                  <span>
                    {reaction.count && reaction.count > 0 ? reaction.count : ''}
                  </span>
                  {reaction.users?.includes(currentUser?.id || 0) ||
                  reaction.user_id === currentUser?.id ? (
                    <span className="text-blue-500">✓</span>
                  ) : null}
                  {/* Popover người đã react (simple) */}
                  {reaction.users && reaction.users.length > 0 && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-8 hidden group-hover:flex bg-white border rounded shadow px-2 py-1 text-[11px] text-gray-600 whitespace-nowrap">
                      {reaction.users.includes(currentUser?.id || -1)
                        ? 'Bạn, '
                        : ''}{' '}
                      {reaction.count ? `${reaction.count} người` : ''}
                    </div>
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Edit Modal (centered, light backdrop) */}
        {isEditing && isEditModalOpen && (
          <div className="fixed inset-0 z-[9999] pointer-events-auto">
            {/* light backdrop */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-2xl">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Chỉnh sửa tin nhắn
                  </h3>
                </div>
                <div className="p-4">
                  <textarea
                    className="w-full min-h-[120px] text-sm rounded-md border px-3 py-2 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                  />
                </div>
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 px-3"
                    onClick={() => {
                      setIsEditing(false);
                      setIsEditModalOpen(false);
                      setEditValue(message.content);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 px-3"
                    onClick={handleEditSave}
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Versions Modal */}
        {showVersions && (
          <div className="fixed inset-0 z-[9999] pointer-events-auto">
            <div
              className="absolute inset-0 bg-white/40 backdrop-blur-sm"
              onClick={() => setShowVersions(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-2xl max-h-[70vh] overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Lịch sử chỉnh sửa
                  </h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowVersions(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 space-y-3 overflow-auto max-h-[60vh]">
                  {versions.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      Không có lịch sử
                    </div>
                  ) : (
                    versions.map(v => (
                      <div
                        key={v.id}
                        className="border rounded-md p-2 bg-gray-50"
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(v.created_at).toLocaleString()} • {v.action}
                        </div>
                        {v.old_content !== undefined && (
                          <div className="text-xs text-gray-600">
                            <span className="font-semibold">Cũ:</span>{' '}
                            {v.old_content}
                          </div>
                        )}
                        {v.new_content !== undefined && (
                          <div className="text-xs text-gray-700">
                            <span className="font-semibold">Mới:</span>{' '}
                            {v.new_content}
                          </div>
                        )}
                        <div className="mt-2">
                          <button
                            className="text-xs text-blue-600 hover:underline"
                            onClick={async () => {
                              try {
                                await apiService.restoreMessageVersion(
                                  String(message.id),
                                  String(v.id)
                                );
                                setShowVersions(false);
                              } catch (e) {
                                console.error('Restore failed', e);
                              }
                            }}
                          >
                            Khôi phục phiên bản này
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timestamp for own messages */}
        {testIsOwn && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <span>
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {message.status === 'read' ? (
              <span className="text-blue-600">✓✓</span>
            ) : message.status === 'delivered' ? (
              <span className="text-gray-500">✓✓</span>
            ) : (
              <span className="text-gray-400">✓</span>
            )}
            {message.is_edited && (
              <span className="ml-1 italic">(đã chỉnh sửa)</span>
            )}
          </div>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 z-[9999] pointer-events-auto">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setPreviewImage(null)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative max-w-[90vw] max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = previewImage.url;
                      link.download = previewImage.name;
                      link.click();
                    }}
                    title="Tải xuống"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>
                  <button
                    className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
                    onClick={() => setPreviewImage(null)}
                    title="Đóng"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <img
                  src={previewImage.url}
                  alt={previewImage.name}
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3">
                  <p className="text-sm font-medium truncate">
                    {previewImage.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Memoize message bubble to avoid unnecessary re-renders
const MemoMessageBubble = React.memo(MessageBubble, (prev, next) => {
  // Re-render only if key fields change
  const a = prev.message as any;
  const b = next.message as any;
  return (
    a.id === b.id &&
    a.content === b.content &&
    a.is_edited === b.is_edited &&
    a.reactions?.length === b.reactions?.length
  );
});

export default function ModernChatMessages({
  messages,
  currentUser,
  conversationId,
  onOpenThread,
  onAddReaction,
  onRemoveReaction,
  onBookmark,
  onRemoveBookmark,
  isLoading,
  onEditMessage,
  onDeleteMessage,
  onReachBottom,
  readPointers,
  members,
}: ModernChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [showJumpLatest, setShowJumpLatest] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const lastMsgLenRef = useRef<number>(messages?.length || 0);
  const atBottomRef = useRef<boolean>(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Detect new messages and follow if at bottom
    const prev = lastMsgLenRef.current;
    const curr = messages?.length || 0;
    if (curr > prev) {
      if (atBottomRef.current) {
        setTimeout(() => {
          virtuosoRef.current?.scrollToIndex({
            index: curr - 1,
            align: 'end',
            behavior: 'auto',
          });
        }, 0);
        setNewMsgCount(0);
      } else {
        setNewMsgCount(c => c + (curr - prev));
      }
    }
    lastMsgLenRef.current = curr;
  }, [messages]);

  // Ensure we jump to bottom when switching conversations and after initial load
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    // small delay to allow Virtuoso to layout items
    const t = setTimeout(() => {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length - 1,
        align: 'end',
        behavior: 'auto',
      });
    }, 50);
    return () => clearTimeout(t);
  }, [conversationId, messages.length]);

  // Detect reach bottom to potentially send read receipts (handled in parent via WS)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => {
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
      if (nearBottom) {
        onReachBottom?.();
        setShowJumpLatest(false);
        atBottomRef.current = true;
        setNewMsgCount(0);
      } else {
        setShowJumpLatest(true);
        atBottomRef.current = false;
      }
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div ref={containerRef} className="flex-1 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-base font-medium text-gray-600 mb-1">
                No messages yet
              </p>
              <p className="text-sm text-gray-500">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: '100%' }}
            data={messages}
            initialTopMostItemIndex={Math.max(0, messages.length - 1)}
            itemContent={(index, message) => (
              <div className="px-4 py-1">
                <MemoMessageBubble
                  key={message.id || `message-${index}`}
                  message={message as any}
                  currentUser={currentUser}
                  onOpenThread={onOpenThread}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                  onBookmark={onBookmark}
                  onRemoveBookmark={onRemoveBookmark}
                  onEditMessage={onEditMessage}
                  onDeleteMessage={onDeleteMessage}
                />
              </div>
            )}
            atBottomThreshold={24}
            atBottomStateChange={atBottom => {
              if (atBottom) onReachBottom?.();
            }}
            followOutput={'smooth' as any}
          />
        )}
        {members && readPointers && (
          <div className="px-4 mt-1 flex gap-1 items-center">
            {members
              .filter(m => m.id !== (currentUser?.id || 0))
              .map(m =>
                readPointers[m.id] ? (
                  <div
                    key={m.id}
                    className="w-4 h-4 rounded-full overflow-hidden border border-white shadow"
                    title={`${m.name || 'User'} đã xem`}
                  >
                    {m.avatar ? (
                      <img
                        src={m.avatar}
                        alt={m.name || ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                ) : null
              )}
          </div>
        )}
        {(showJumpLatest || newMsgCount > 0) && (
          <div className="fixed right-6 bottom-28 z-[5]">
            <button
              className="px-3 h-9 rounded-full bg-blue-600 text-white text-xs shadow hover:bg-blue-700"
              onClick={() => {
                virtuosoRef.current?.scrollToIndex({
                  index: (messages?.length || 1) - 1,
                  align: 'end',
                  behavior: 'smooth',
                });
                setShowJumpLatest(false);
                setNewMsgCount(0);
              }}
            >
              {newMsgCount > 0
                ? `${newMsgCount} new messages`
                : 'Jump to latest'}
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
