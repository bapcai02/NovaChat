'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MoreHorizontal,
  Reply,
  Heart,
  Smile,
  Trash2,
  Edit3,
  Copy,
  Flag,
  Paperclip,
  Image,
  X,
  MessageCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EmojiPicker from 'emoji-picker-react';
import { apiService } from '@/services/api';
import { getWebSocketClient } from '@/lib/websocket';
import { useChat } from '@/hooks/useChat';

interface ThreadMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  };
  timestamp: string;
  isOwn: boolean;
  isEdited?: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
  attachments?: { name: string; url: string; type: string }[];
}

interface ThreadChatProps {
  parentMessage: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    conversation_id: string;
  };
  onClose: () => void;
}

export default function ModernThreadChat({
  parentMessage,
  onClose,
}: ThreadChatProps) {
  const { currentUser } = useChat();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load thread messages from API (only on first open for this parent id)
  useEffect(() => {
    const loadThreadMessages = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getThreadMessages(parentMessage.id);
        const raw = (response as any)?.data ?? [];
        const threadMessages: ThreadMessage[] = raw.map((msg: any) => ({
          id: msg.id.toString(),
          content: msg.content,
          sender: {
            id:
              msg.user_id?.toString() ||
              msg.sender?.id?.toString() ||
              'unknown',
            name: msg.sender?.name || msg.user?.name || 'Unknown User',
            avatar: msg.sender?.avatar || msg.user?.avatar,
            isOnline: msg.sender?.is_online || msg.user?.is_online || false,
          },
          timestamp: new Date(msg.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isOwn: false,
          isEdited: msg.is_edited || false,
          reactions: msg.reactions || [],
          attachments: msg.attachments || [],
        }));
        setMessages(threadMessages);
      } catch (error) {
        console.error('Error loading thread messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
        hasLoadedRef.current = true;
      }
    };

    if (!parentMessage.id) return;
    // Reset state if parent changed
    setMessages([]);
    setIsLoading(true);
    hasLoadedRef.current = false;
    // Defer load to next tick to batch state updates
    Promise.resolve().then(() => {
      if (!hasLoadedRef.current) loadThreadMessages();
    });
  }, [parentMessage.id]);

  // Realtime: append replies without reloading entire thread
  useEffect(() => {
    try {
      const ws = getWebSocketClient();
      // Avoid duplicate handler registration across rerenders
      const key = `__nc_thread_${parentMessage.id}`;
      if ((window as any)[key]) return;
      (window as any)[key] = true;
      const handler = (raw: any) => {
        const message = raw as any;
        // Accept either dedicated thread event or chat_message carrying parent_id
        const isThreadEvt = message?.type === 'thread_reply';
        const isReplyChat =
          message?.type === 'chat_message' && !!message?.parent_id;
        if (!isThreadEvt && !isReplyChat) return;
        const parentId = parseInt((message.parent_id || '0').toString() || '0');
        if (!parentId || parentId.toString() !== parentMessage.id.toString())
          return;

        const ts = message.timestamp || new Date().toISOString();
        const newMsg = {
          id: Date.now().toString(),
          content: message.content || '',
          sender: {
            id: (message.sender_id || '').toString(),
            name: '',
            avatar: undefined,
            isOnline: false,
          },
          timestamp: new Date(ts).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isOwn: false,
        } as any;

        setMessages(prev => {
          // prevent duplicate by content+time close
          const exists = prev.some(m => m.content === newMsg.content);
          return exists ? prev : [...prev, newMsg];
        });
      };
      ws.onMessage(handler);
      return () => {
        /* no-op */
      };
    } catch {}
  }, [parentMessage.id]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojis(false);
      }
    };

    if (showEmojis) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojis]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() || attachments.length > 0) {
      try {
        // Send via WebSocket with parent_id
        const ws = getWebSocketClient();
        const optimistic: ThreadMessage = {
          id: Date.now().toString(),
          content: newMessage.trim(),
          sender: {
            id: 'current-user',
            name: 'You',
            avatar: 'https://ui-avatars.com/api/?name=You&background=random',
            isOnline: true,
          },
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isOwn: true,
        };
        setMessages(prev => [...prev, optimistic]);
        const currentUserId = currentUser?.id || null;
        const messagePayload = {
          type: 'chat_message',
          conversation_id: parentMessage.conversation_id,
          parent_id: parentMessage.id,
          sender_id: currentUserId || 0,
          content: newMessage.trim(),
          client_id: `${currentUserId || 0}-${Date.now()}`,
        };
        ws.send(messagePayload as any);
        setNewMessage('');
        setAttachments([]);
        setIsTyping(false);
      } catch (error) {
        console.error('Error sending thread message:', error);
        // Fallback to API if WS fails
        try {
          const response = await apiService.sendThreadMessage(
            parentMessage.id,
            newMessage.trim()
          );
          const data = (response as any)?.data ?? {};
          const patchedId = (data.id ?? Date.now()).toString();
          setMessages(prev =>
            prev.map(m =>
              m.id === optimistic.id ? { ...m, id: patchedId } : m
            )
          );
        } catch {}
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(
      messages.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions?.map(r =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.count + 1,
                      users: [...r.users, 'current-user'],
                    }
                  : r
              ),
            };
          } else {
            return {
              ...msg,
              reactions: [
                ...(msg.reactions || []),
                { emoji, count: 1, users: ['current-user'] },
              ],
            };
          }
        }
        return msg;
      })
    );
  };

  const ThreadMessageBubble = ({ message }: { message: ThreadMessage }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="flex gap-2 group"
    >
      {/* Avatar */}
      <Avatar className="h-6 w-6 flex-shrink-0">
        <AvatarImage src={message.sender.avatar} />
        <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          {message.sender.name
            .split(' ')
            .map(n => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Sender name and timestamp */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
          <span className="font-medium">{message.sender.name}</span>
          <span>{message.timestamp}</span>
          {message.isEdited && <span className="italic">(edited)</span>}
        </div>

        {/* Message bubble */}
        <div className="relative group">
          <div className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg max-w-full group-hover:shadow-md transition-shadow duration-200">
            <div className="whitespace-pre-wrap break-words text-sm">
              {message.content}
            </div>

            {/* Message actions */}
            <div className="absolute top-0 right-0 flex items-center gap-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-y-full z-10">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  addReaction(message.id, '👍');
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
                  addReaction(message.id, '❤️');
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-gray-700 text-white hover:text-white"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white border-gray-300 z-20"
                >
                  <DropdownMenuItem className="text-gray-600 hover:bg-gray-100 hover:text-gray-800">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-600 hover:bg-gray-100 hover:text-gray-800">
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </DropdownMenuItem>
                  {message.isOwn && (
                    <DropdownMenuItem className="text-gray-600 hover:bg-gray-100 hover:text-gray-800">
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-400 hover:bg-red-900/20 hover:text-red-300">
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                  {message.isOwn && (
                    <DropdownMenuItem className="text-red-400 hover:bg-red-900/20 hover:text-red-300">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Reactions below message bubble */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={() => addReaction(message.id, reaction.emoji)}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col h-full bg-white border-l border-gray-200"
    >
      {/* Thread Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">Thread</h3>
            <p className="text-sm text-gray-500">
              {messages.length} {messages.length === 1 ? 'reply' : 'replies'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Parent Message */}
        <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span className="font-medium">{parentMessage.sender}</span>
            <span>{parentMessage.timestamp}</span>
          </div>
          <div className="text-sm text-gray-800">{parentMessage.content}</div>

          {/* Thread indicator */}
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <MessageCircle className="h-3 w-3" />
            <span>
              {isLoading
                ? 'Loading...'
                : `${messages.length} ${messages.length === 1 ? 'reply' : 'replies'}`}
            </span>
          </div>
        </div>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-gray-500">
                Loading thread messages...
              </div>
            </div>
          ) : messages.length > 0 ? (
            messages.map(message => (
              <ThreadMessageBubble key={message.id} message={message} />
            ))
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-gray-500">No replies yet</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Thread Input */}
      <div className="p-4 border-t border-gray-100 relative">
        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 space-y-2">
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(attachment.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-200 text-gray-500"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {/* Attachment buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={() => setShowEmojis(!showEmojis)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={() => imageInputRef.current?.click()}
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 relative">
            <Textarea
              value={newMessage}
              onChange={e => {
                setNewMessage(e.target.value);
                if (e.target.value.trim() && !isTyping) {
                  setIsTyping(true);
                } else if (!e.target.value.trim() && isTyping) {
                  setIsTyping(false);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Reply in thread..."
              className="min-h-[40px] max-h-28 resize-none bg-gray-50 border-gray-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm text-gray-800 placeholder-gray-500 transition-all duration-200 rounded-lg"
              style={{
                border: '1px solid #e5e7eb',
                boxShadow: 'none',
              }}
              rows={1}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && attachments.length === 0}
            className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </Button>
        </div>
        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojis && (
            <motion.div
              ref={emojiPickerRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-0 mb-2 z-50"
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '0',
                marginBottom: '8px',
              }}
            >
              <EmojiPicker
                onEmojiClick={emojiData => {
                  setNewMessage(prev => prev + emojiData.emoji);
                  setShowEmojis(false);
                }}
                width={320}
                height={300}
                searchDisabled={false}
                skinTonesDisabled={false}
                previewConfig={{
                  showPreview: false,
                }}
                searchPlaceHolder="Search emojis..."
                theme={undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isTyping && (
          <div className="mt-2 text-xs text-gray-500">You are typing...</div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </motion.div>
  );
}
