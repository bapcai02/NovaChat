'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VoicePlayer } from '@/components/ui/voice-player';
import { ReadReceipts } from '@/components/ui/read-receipts';
import { MessageAnalytics } from '@/components/ui/message-analytics';
import { MessageReactions } from '@/components/ui/message-reactions';
import { MessageEditor } from '@/components/ui/message-editor';
import { TypingIndicator } from '@/components/ui/typing-indicator';

interface Message {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
  };
  timestamp: string;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: string;
  }>;
  isEdited?: boolean;
  isPinned?: boolean;
  thread?: {
    count: number;
    lastReply?: {
      author: string;
      timestamp: string;
    };
    participants: string[];
  };
}
interface MessageListProps {
  onThreadSelect: (messageId: string, messageContent: string) => void;
  selectedChat?: { type: 'channel' | 'conversation'; id: number } | null;
  refreshTrigger?: number;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({
  onThreadSelect,
  selectedChat,
  refreshTrigger,
  scrollContainerRef,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(
    null
  );
  const [showAnalytics, setShowAnalytics] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [beforeId, setBeforeId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [typingUsers, setTypingUsers] = useState<
    Array<{
      id: string;
      name: string;
      username: string;
      avatar?: string;
    }>
  >([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isNearBottom = (): boolean => {
    const el = scrollContainerRef?.current;
    if (!el) return true;
    const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
    return distance < 80;
  };

  // Only autoscroll if user is already near bottom
  useEffect(() => {
    if (messages.length > 0 && isNearBottom()) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!selectedChat) {
          setMessages([] as any);
          setBeforeId(null);
          setHasMore(true);
          return;
        }

        const roomId = selectedChat.id.toString();
        const type =
          selectedChat.type === 'conversation'
            ? 'direct'
            : selectedChat.type || 'channel';
        const res = await api.get<any[]>(`/messages/${roomId}`, {
          params: { type, limit: 50 },
        });
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        const meta = (res.data as any)?.meta || {};
        setHasMore(!!meta.hasMore);
        setBeforeId(meta.nextBeforeId ?? (data.length ? data[0].id : null));

        // Map backend shape to frontend shape
        const mapped = data.map((m: any, idx: number) => ({
          id: String(m.id ?? idx),
          content: m.type === 'voice' ? '' : String(m.content ?? m.text ?? ''),
          type: m.type === 'voice' ? 'voice' : undefined,
          audioUrl: m.type === 'voice' ? 'data:audio/webm;base64,' : undefined,
          duration: m.duration,
          author: {
            name: m.sender?.name || 'User',
            username: (m.sender?.username || 'user').toLowerCase(),
          },
          timestamp: new Date(m.created_at).toLocaleTimeString(),
          reactions: (m.reactions || []).map((r: any) => ({
            emoji: r.emoji,
            count: r.count || 1,
            users: [],
          })),
          attachments: (m.attachments || []).map((a: any) => ({
            type: a.type || 'file',
            url: a.url || '#',
            name: a.name || 'file',
            size: a.size,
          })),
        })) as any;
        setMessages(mapped);
        setTimeout(scrollToBottom, 0);

        // Update bookmark status from backend response
        const bookmarkedIds = data
          .filter((m: any) => m.is_bookmarked)
          .map((m: any) => String(m.id));
        setBookmarkedMessages(new Set(bookmarkedIds));
      } catch (e) {
        console.error('Failed to fetch messages:', e);
        setMessages([] as any);
      }
    };
    fetchMessages();
  }, [selectedChat, refreshTrigger]);

  // Infinite scroll on outer container
  useEffect(() => {
    const el = scrollContainerRef?.current;
    if (!el) return;
    let loading = false;
    const onScroll = async () => {
      if (el.scrollTop <= 50 && hasMore && !loading && selectedChat) {
        loading = true;
        setIsTopLoading(true);
        try {
          const roomId = selectedChat.id.toString();
          const type =
            selectedChat.type === 'conversation'
              ? 'direct'
              : selectedChat.type || 'channel';
          const res = await api.get<any[]>(`/messages/${roomId}`, {
            params: { type, limit: 50, beforeId },
          });
          const raw = (res.data as any)?.data;
          const data = Array.isArray(raw) ? raw : Object.values(raw || {});
          const meta = (res.data as any)?.meta || {};

          const mapped = data.map((m: any, idx: number) => ({
            id: String(m.id ?? `tmp-${Date.now()}-${idx}`),
            content:
              m.type === 'voice' ? '' : String(m.content ?? m.text ?? ''),
            author: {
              name: m.sender?.name || 'User',
              username: (m.sender?.username || 'user').toLowerCase(),
            },
            timestamp: new Date(m.created_at).toLocaleTimeString(),
            reactions: (m.reactions || []).map((r: any) => ({
              emoji: r.emoji,
              count: r.count || 1,
              users: [],
            })),
            attachments: (m.attachments || []).map((a: any) => ({
              type: a.type || 'file',
              url: a.url || '#',
              name: a.name || 'file',
              size: a.size,
            })),
          })) as any;

          const prevHeight = el.scrollHeight;
          setMessages(prev => {
            const existing = new Set(prev.map((p: any) => String(p.id)));
            const dedup = (mapped as any[]).filter(
              m => !existing.has(String(m.id))
            );
            return [...dedup, ...prev];
          });

          // Update bookmark status for new messages
          const newBookmarkedIds = data
            .filter((m: any) => m.is_bookmarked)
            .map((m: any) => String(m.id));
          setBookmarkedMessages(prev => {
            const newSet = new Set(prev);
            newBookmarkedIds.forEach(id => newSet.add(id));
            return newSet;
          });

          setHasMore(!!meta.hasMore);
          setBeforeId(
            meta.nextBeforeId ?? (mapped.length ? mapped[0].id : beforeId)
          );
          setTimeout(() => {
            const newHeight = el.scrollHeight;
            el.scrollTop = newHeight - prevHeight;
          }, 0);
        } catch (e) {
          console.error('Failed to fetch messages:', e);
          setHasMore(false);
        } finally {
          setIsTopLoading(false);
          loading = false;
        }
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollContainerRef?.current, hasMore, beforeId, selectedChat]);

  const [isTopLoading, setIsTopLoading] = useState(false);

  const handleThreadClick = (messageId: string, messageContent: string) => {
    onThreadSelect(messageId, messageContent);
  };

  const handleReplyInThread = (messageId: string, messageContent: string) => {
    onThreadSelect(messageId, messageContent);
  };

  const handleReactionSelect = async (messageId: string, emoji: string) => {
    // Optimistic local update
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const existingReactions = msg.reactions || [];
          const existing = existingReactions.find(r => r.emoji === emoji);
          if (existing) {
            return {
              ...msg,
              reactions: existingReactions.map(r =>
                r.emoji === emoji ? { ...r, count: r.count + 1 } : r
              ),
            };
          }
          return {
            ...msg,
            reactions: [...existingReactions, { emoji, count: 1, users: [] }],
          };
        }
        return msg;
      })
    );

    // Save to database via API (for persistence)
    try {
      await api.post(`/messages/${messageId}/reactions`, { emoji });
    } catch (error) {
      console.error('Failed to save reaction to database:', error);
    }

    // Whisper to others via WS for real-time sync
    try {
      channelRef.current?.whisper('reaction:add', { messageId, emoji });
    } catch {}

    setShowReactionPicker(null);
  };

  const handleReactionAdd = async (messageId: string, emoji: string) => {
    // Optimistic local update
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const existing = msg.reactions?.find(r => r.emoji === emoji);
          if (existing) {
            return {
              ...msg,
              reactions: msg.reactions?.map(r =>
                r.emoji === emoji ? { ...r, count: r.count + 1 } : r
              ),
            };
          }
          return {
            ...msg,
            reactions: [
              ...(msg.reactions || []),
              { emoji, count: 1, users: [] },
            ],
          };
        }
        return msg;
      })
    );

    // Save to database via API (for persistence)
    try {
      await api.post(`/messages/${messageId}/reactions`, { emoji });
    } catch (error) {
      console.error('Failed to save reaction to database:', error);
    }

    try {
      channelRef.current?.whisper('reaction:add', { messageId, emoji });
    } catch {}
  };

  const handleReactionRemove = async (messageId: string, emoji: string) => {
    // Optimistic local update
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          const target = reactions.find(r => r.emoji === emoji);
          if (!target) return msg;
          if (target.count > 1) {
            return {
              ...msg,
              reactions: reactions.map(r =>
                r.emoji === emoji ? { ...r, count: r.count - 1 } : r
              ),
            };
          }
          return {
            ...msg,
            reactions: reactions.filter(r => r.emoji !== emoji),
          };
        }
        return msg;
      })
    );

    // Save to database via API (for persistence)
    try {
      await api.delete(
        `/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`
      );
    } catch (error) {
      console.error('Failed to remove reaction from database:', error);
    }

    try {
      channelRef.current?.whisper('reaction:remove', { messageId, emoji });
    } catch {}
  };

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<string>>(
    new Set()
  );

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      // Call API to update message
      const response = await api.put(`/messages/${messageId}`, {
        content: newContent,
      });

      if (response.data.success) {
        // Update local state
        setMessages(prev =>
          prev.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                content: newContent,
                isEdited: true,
                editedAt: new Date().toISOString(),
              };
            }
            return msg;
          })
        );
        setEditingMessageId(null);
      } else {
        console.error('Failed to edit message:', response.data.message);
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
      // TODO: Show error toast
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  const handleBookmarkMessage = async (messageId: string) => {
    try {
      const response = await api.post(`/messages/${messageId}/bookmark`);
      if (response.data.success) {
        setBookmarkedMessages(prev => new Set([...prev, messageId]));
      }
    } catch (error) {
      console.error('Failed to bookmark message:', error);
    }
  };

  const handleRemoveBookmark = async (messageId: string) => {
    try {
      const response = await api.delete(`/messages/${messageId}/bookmark`);
      if (response.data.success) {
        setBookmarkedMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(messageId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  };

  const toggleBookmark = async (messageId: string) => {
    if (bookmarkedMessages.has(messageId)) {
      await handleRemoveBookmark(messageId);
    } else {
      await handleBookmarkMessage(messageId);
    }
  };

  if (!selectedChat) {
    return (
      <div className="h-full w-full flex items-center justify-center text-[hsl(var(--chat-text-muted))]">
        <div className="text-center">
          <div className="text-2xl mb-2">Welcome to NovaChat</div>
          <div className="text-sm">
            Select a channel or conversation to start chatting
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 text-neutral-900">
      {isTopLoading && (
        <div className="flex items-center justify-center text-xs text-neutral-500 py-2">
          Loading older messages...
        </div>
      )}
      {messages.map(message => (
        <div key={message.id} className="message-enter">
          <div className="flex space-x-3 group hover:bg-neutral-50 rounded-lg p-1.5 -m-1.5 transition-colors duration-200">
            <Avatar
              fallback={message.author.name}
              size="md"
              className="flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2 mb-0.5">
                <span className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer">
                  {message.author.name}
                </span>
                <span className="text-xs text-neutral-500">
                  {message.timestamp}
                </span>
                {message.isEdited && (
                  <span className="text-xs text-neutral-500 italic">
                    (edited)
                  </span>
                )}
                {message.isPinned && (
                  <Badge variant="outline" className="text-xs h-4 px-1.5">
                    📌 Pinned
                  </Badge>
                )}
              </div>

              {/* Message Content */}
              {editingMessageId === message.id ? (
                <MessageEditor
                  messageId={message.id}
                  initialContent={message.content}
                  onSave={handleEditMessage}
                  onCancel={handleCancelEdit}
                  className="mb-1"
                />
              ) : message.type === 'voice' ? (
                <div className="mb-1">
                  <VoicePlayer
                    audioUrl={message.audioUrl}
                    duration={message.duration}
                    author={message.author.name}
                    timestamp={message.timestamp}
                  />
                </div>
              ) : (
                <div className="mb-0.5 text-neutral-900">
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                    {message.content}
                  </p>
                </div>
              )}

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((attachment, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center">
                        {attachment.type === 'image' ? (
                          <svg
                            className="w-5 h-5 text-[#1d74f5]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-[#1d74f5]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-neutral-900">
                          {attachment.name}
                        </p>
                        {attachment.size && (
                          <p className="text-xs text-neutral-500">
                            {attachment.size}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reactions */}
              <MessageReactions
                reactions={message.reactions || []}
                messageId={message.id}
                onReactionAdd={handleReactionAdd}
                onReactionRemove={handleReactionRemove}
                className="mt-2"
              />

              {/* Thread Summary */}
              {message.thread && (
                <div className="mt-2">
                  <button
                    onClick={() =>
                      handleThreadClick(message.id, message.content)
                    }
                    className="flex items-center space-x-2 px-3 py-2 bg-[hsl(var(--chat-message-bg))] border border-[hsl(var(--chat-border))] rounded-lg hover:bg-[hsl(var(--chat-message-hover))] transition-colors group/thread"
                  >
                    <div className="flex -space-x-1">
                      {message.thread.participants
                        .slice(0, 3)
                        .map((participant, idx) => (
                          <Avatar
                            key={idx}
                            fallback={participant}
                            size="sm"
                            className="border-2 border-[hsl(var(--chat-bg))]"
                          />
                        ))}
                      {message.thread.participants.length > 3 && (
                        <div className="w-6 h-6 bg-[hsl(var(--chat-text-muted))] rounded-full border-2 border-[hsl(var(--chat-bg))] flex items-center justify-center text-xs text-gray-800">
                          +{message.thread.participants.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-[hsl(var(--chat-accent))]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span className="text-xs font-medium text-[hsl(var(--chat-accent))]">
                          {message.thread.count}{' '}
                          {message.thread.count === 1 ? 'reply' : 'replies'}
                        </span>
                      </div>
                      {message.thread.lastReply && (
                        <div className="text-xs text-[hsl(var(--chat-text-muted))] mt-1">
                          Last reply by {message.thread.lastReply.author} •{' '}
                          {message.thread.lastReply.timestamp}
                        </div>
                      )}
                    </div>
                    <svg
                      className="w-4 h-4 text-[hsl(var(--chat-text-muted))]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Message Actions (hidden by default, shown on hover) */}
              <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowReactionPicker(
                        showReactionPicker === message.id ? null : message.id
                      )
                    }
                    className="p-1 hover:bg-[hsl(var(--chat-message-hover))] rounded text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] transition-colors"
                    title="Add reaction"
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
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>

                  {/* Reaction Picker Modal */}
                  {showReactionPicker === message.id && (
                    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-[9999]">
                      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">
                            Choose Reaction
                          </h3>
                          <button
                            onClick={() => setShowReactionPicker(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <svg
                              className="w-6 h-6"
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

                        <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                          {[
                            '😀',
                            '😃',
                            '😄',
                            '😁',
                            '😆',
                            '😅',
                            '🤣',
                            '😂',
                            '🙂',
                            '🙃',
                            '😉',
                            '😊',
                            '😇',
                            '🥰',
                            '😍',
                            '🤩',
                            '😘',
                            '😗',
                            '😚',
                            '😙',
                            '😋',
                            '😛',
                            '😜',
                            '🤪',
                            '😝',
                            '🤑',
                            '🤗',
                            '🤭',
                            '🤫',
                            '🤔',
                            '🤐',
                            '🤨',
                            '😐',
                            '😑',
                            '😶',
                            '😏',
                            '😒',
                            '🙄',
                            '😬',
                            '🤥',
                            '😔',
                            '😪',
                            '🤤',
                            '😴',
                            '😷',
                            '🤒',
                            '🤕',
                            '🤢',
                            '🤮',
                            '🤧',
                            '🥵',
                            '🥶',
                            '🥴',
                            '😵',
                            '🤯',
                            '🤠',
                            '🥳',
                            '😎',
                            '🤓',
                            '🧐',
                            '👍',
                            '👎',
                            '👌',
                            '✌️',
                            '🤞',
                            '🤟',
                            '🤘',
                            '🤙',
                            '👈',
                            '👉',
                            '👆',
                            '👇',
                            '☝️',
                            '✋',
                            '🤚',
                            '🖐',
                            '🖖',
                            '👋',
                            '🤝',
                            '👏',
                            '🙌',
                            '👐',
                            '🤲',
                            '🤜',
                            '🤛',
                            '✊',
                            '👊',
                          ]
                            .filter(
                              (emoji, index, arr) =>
                                arr.indexOf(emoji) === index
                            )
                            .map((emoji, index) => (
                              <button
                                key={`${emoji}-${index}`}
                                onClick={() => {
                                  handleReactionSelect(message.id, emoji);
                                  setShowReactionPicker(null);
                                }}
                                className="w-12 h-12 flex items-center justify-center text-2xl hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    handleReplyInThread(message.id, message.content)
                  }
                  className="flex items-center space-x-1 px-2 py-1 hover:bg-[hsl(var(--chat-message-hover))] rounded text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] transition-colors"
                  title="Reply in thread"
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-xs">Reply</span>
                </button>
                <button
                  onClick={() => setEditingMessageId(message.id)}
                  className="flex items-center space-x-1 px-2 py-1 hover:bg-[hsl(var(--chat-message-hover))] rounded text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] transition-colors"
                  title="Edit message"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span className="text-xs">Edit</span>
                </button>
                <button
                  onClick={() => toggleBookmark(message.id)}
                  className={`p-1 hover:bg-[hsl(var(--chat-message-hover))] rounded transition-colors ${
                    bookmarkedMessages.has(message.id)
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))]'
                  }`}
                  title={
                    bookmarkedMessages.has(message.id)
                      ? 'Remove bookmark'
                      : 'Bookmark message'
                  }
                >
                  <svg
                    className="w-4 h-4"
                    fill={
                      bookmarkedMessages.has(message.id)
                        ? 'currentColor'
                        : 'none'
                    }
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setShowAnalytics(
                      showAnalytics === message.id ? null : message.id
                    )
                  }
                  className="p-1 hover:bg-[hsl(var(--chat-message-hover))] rounded text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))] transition-colors"
                  title="Message analytics"
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

      {/* Read Receipts for last message */}
      {messages.length > 0 && (
        <div className="px-4 py-2">
          <ReadReceipts
            users={(messages as any)[0].readBy || []}
            totalRecipients={15}
            compact={true}
          />
        </div>
      )}

      {/* Message Analytics Modal */}
      {showAnalytics && (
        <MessageAnalytics
          message={{
            id: showAnalytics,
            content: messages.find(m => m.id === showAnalytics)?.content || '',
            author: messages.find(m => m.id === showAnalytics)?.author || {
              name: '',
              username: '',
            },
            timestamp:
              messages.find(m => m.id === showAnalytics)?.timestamp || '',
            readBy:
              (messages as any).find(m => m.id === showAnalytics)?.readBy || [],
            reactions:
              messages.find(m => m.id === showAnalytics)?.reactions || [],
            replies:
              (messages as any)
                .find(m => m.id === showAnalytics)
                ?.thread?.participants.map((p: string, i: number) => ({
                  id: i.toString(),
                  content: `Reply from ${p}`,
                  author: {
                    name: p,
                    username: p.toLowerCase().replace(' ', ''),
                  },
                  timestamp: '2 minutes ago',
                })) || [],
            views:
              (messages as any).find(m => m.id === showAnalytics)?.views || 0,
            shares:
              (messages as any).find(m => m.id === showAnalytics)?.shares || 0,
            bookmarks:
              (messages as any).find(m => m.id === showAnalytics)?.bookmarks ||
              0,
          }}
          isOpen={!!showAnalytics}
          onClose={() => setShowAnalytics(null)}
        />
      )}

      {/* Scroll to bottom reference */}
      <div ref={messagesEndRef} />
    </div>
  );
};
