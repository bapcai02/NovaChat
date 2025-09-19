"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Paperclip, Image, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import EmojiPicker from "emoji-picker-react";
import { uploadService } from "@/services/uploadService";
import { apiService } from "@/services/api";

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress?: number;
  remoteKey?: string;
  file?: File;
}

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  typingUsers?: string[];
  mentionUsers?: Array<{
    id: number;
    name?: string;
    username?: string;
    avatar?: string;
  }>;
  conversationId?: number;
}

export default function ModernChatInput({
  onSendMessage,
  onTyping,
  placeholder = "Type a message...",
  disabled = false,
  maxLength = 2000,
  typingUsers = [],
  mentionUsers = [],
  conversationId,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("common");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);

  // Load draft on mount / conversation change
  useEffect(() => {
    if (!conversationId) return;
    try {
      const key = `nc_draft_${conversationId}`;
      const saved = localStorage.getItem(key);
      if (saved) setMessage(saved);
    } catch {}
  }, [conversationId]);

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    // Prepare base64 for image attachments so we can send inline over WS
    const enriched: Attachment[] = [];
    for (const att of attachments) {
      if (att.file && att.type?.startsWith("image/") && att.size <= 1024 * 1024 * 2) {
        // Limit inline base64 to 2MB to avoid huge WS frames
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("read_error"));
            reader.readAsDataURL(att.file as File);
          });
          enriched.push({ ...att, preview: att.preview,
            // @ts-ignore add dynamic field for transport
            data: dataUrl,
          } as any);
        } catch {
          enriched.push(att);
        }
      } else {
        enriched.push(att);
      }
    }

    // WS-first sending with attachments metadata (including base64 for images when small)
    onSendMessage(message.trim(), enriched);
    setMessage("");
    setAttachments([]);
    setIsTyping(false);
    try {
      if (conversationId) localStorage.removeItem(`nc_draft_${conversationId}`);
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Mentions keyboard nav
    if (
      showMentions &&
      (e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Enter" ||
        e.key === "Escape")
    ) {
      const list = filteredMentions;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((prev) => Math.min(prev + 1, list.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Escape") {
        setShowMentions(false);
      }
      if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        applyMention(list[activeIdx]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      // Save draft
      try {
        if (conversationId) localStorage.setItem(`nc_draft_${conversationId}`, value);
      } catch {}

      // Typing indicator
      if (value.trim() && !isTyping) {
        setIsTyping(true);
        onTyping?.(true);
      } else if (!value.trim() && isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }

      // Mentions detection (last token like @abc)
      const m = /(^|\s)@(\w{0,30})$/.exec(value);
      if (m) {
        setMentionQuery(m[2] || "");
        setShowMentions(true);
        setActiveIdx(-1);
      } else {
        setShowMentions(false);
        setMentionQuery("");
      }
    }
  };

  // Auto stop typing after idle 2s
  useEffect(() => {
    if (!onTyping) return;
    if (!isTyping) return;
    const t = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 2000);
    return () => clearTimeout(t);
  }, [isTyping, onTyping, message]);

  const handleEmojiSelect = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojis(false);
    textareaRef.current?.focus();
  };

  // Paste-to-upload (images/files from clipboard)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const onPaste = async (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files = Array.from(e.clipboardData.files || []);
      if (files.length === 0) return;
      e.preventDefault();
      const evt = {
        target: { files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleFileSelect(evt);
    };
    el.addEventListener("paste", onPaste as any);
    return () => el.removeEventListener("paste", onPaste as any);
  }, []);

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
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojis]);

  const filteredMentions = mentionUsers
    .filter((u) => {
      const q = mentionQuery.toLowerCase();
      const name = (u.name || "").toLowerCase();
      const user = (u.username || "").toLowerCase();
      return !q || name.includes(q) || user.includes(q);
    })
    .slice(0, 8);

  const applyMention = (u: {
    id: number;
    name?: string;
    username?: string;
  }) => {
    setMessage(
      (prev) =>
        prev.replace(
          /(^|\s)@(\w{0,30})$/,
          `$1@${u.username || (u.name || `user${u.id}`).replace(/\s+/g, "").toLowerCase()}`,
        ) + " ",
    );
    setShowMentions(false);
    setMentionQuery("");
    textareaRef.current?.focus();
  };

  const validateFile = (file: File) => {
    const maxSize = 20 * 1024 * 1024; // 20MB limit
    const allowed = [
      "image/",
      "video/",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
      "application/x-rar-compressed",
    ];
    const okType = allowed.some(
      (prefix) => file.type.startsWith(prefix) || file.type === prefix,
    );
    const okSize = file.size <= maxSize;
    return okType && okSize;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const ok = validateFile(file);
      if (!ok) {
        alert("Tệp không hợp lệ hoặc vượt quá 20MB.");
      }
      return ok;
    });
    const newAttachments: Attachment[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
      progress: 0,
      file,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const renderWithMentions = (text: string) => {
    const safe = escapeHtml(text);
    // highlight @mentions
    return safe.replace(
      /(^|\s)(@\w{1,30})/g,
      (_m, p1, p2) => `${p1}<span class='text-red-600'>${p2}</span>`,
    );
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-100 bg-white">
      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-gray-100"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  {attachment.preview ? (
                    <div className="relative">
                      {attachment.type.startsWith("image/") ? (
                        <img
                          src={attachment.preview}
                          alt={attachment.name}
                          className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                        />
                      ) : attachment.type.startsWith("video/") ? (
                        <video
                          src={attachment.preview}
                          className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                          controls
                        />
                      ) : null}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {getFileIcon(attachment.type)}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate max-w-32 text-gray-800">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input area */}
      <div className="p-4 relative">
        <div className="flex items-end gap-2">
          {/* Attachment buttons */}
          <div
            className="flex items-center gap-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files || []);
              const evt = {
                target: { files },
              } as unknown as React.ChangeEvent<HTMLInputElement>;
              handleFileSelect(evt);
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={() => {
                setShowEmojis(!showEmojis);
              }}
              disabled={disabled}
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled}
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            {/* Ghost overlay to highlight mentions */}
            <div
              className="absolute inset-0 px-3 py-2 whitespace-pre-wrap break-words text-sm text-gray-800 pointer-events-none z-0"
              aria-hidden
              dangerouslySetInnerHTML={{
                __html: renderWithMentions(message || ""),
              }}
            />
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || t("type_message")}
              disabled={disabled}
              className="relative z-10 min-h-[40px] max-h-28 resize-none pr-12 bg-transparent border border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm text-transparent placeholder-gray-400 transition-all duration-200 rounded-lg px-3 py-2"
              style={{
                border: "1px solid #e5e7eb",
                boxShadow: "none",
                caretColor: "#111827",
              }}
              rows={1}
            />
            {showMentions && filteredMentions.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-md shadow min-w-[220px] z-30 max-h-56 overflow-auto">
                {filteredMentions.map((u, idx) => (
                  <button
                    key={u.id}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm ${activeIdx === idx ? "bg-gray-100" : ""}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyMention(u);
                    }}
                  >
                    {u.avatar ? (
                      <img src={u.avatar} className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-200" />
                    )}
                    <span className="truncate">{u.name || u.username}</span>
                    {u.username && (
                      <span className="text-xs text-gray-500">
                        @{u.username}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Character count */}
            {message.length > maxLength * 0.8 && (
              <div className="absolute bottom-1 right-12 text-xs text-gray-500">
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && attachments.length === 0)}
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
                position: "absolute",
                bottom: "100%",
                left: "0",
                marginBottom: "8px",
              }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                width={320}
                height={300}
                searchDisabled={false}
                skinTonesDisabled={false}
                previewConfig={{
                  showPreview: false,
                }}
                searchPlaceHolder={t("search_messages")}
                theme={"light" as any}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typing indicator */}
        {(isTyping || typingUsers.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 text-xs text-gray-500"
          >
            {typingUsers.length > 0
              ? `${typingUsers.slice(0, 2).join(", ")}${typingUsers.length > 2 ? "…" : ""} đang nhập…`
              : t("you_are_typing")}
          </motion.div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*"
      />
    </div>
  );
}
