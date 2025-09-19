"use client";

import React, { useState, useEffect } from "react";
import { Download, File, Image, FileText, Archive, Video, Music, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  data?: string;
  url?: string;
  remoteKey?: string;
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
  created_at: string;
}

interface FilesTabProps {
  conversationId: number;
  onClose: () => void;
  messages?: any[]; // Fallback messages from chat
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) {
    return <Image className="h-5 w-5 text-blue-500" />;
  } else if (type.includes("pdf") || type.includes("document")) {
    return <FileText className="h-5 w-5 text-red-500" />;
  } else if (type.includes("zip") || type.includes("rar") || type.includes("7z")) {
    return <Archive className="h-5 w-5 text-orange-500" />;
  } else if (type.startsWith("video/")) {
    return <Video className="h-5 w-5 text-purple-500" />;
  } else if (type.startsWith("audio/")) {
    return <Music className="h-5 w-5 text-green-500" />;
  } else {
    return <File className="h-5 w-5 text-gray-500" />;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffInHours < 168) { // 7 days
    return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

export default function FilesTab({ conversationId, onClose, messages: fallbackMessages }: FilesTabProps) {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "images" | "documents" | "videos" | "audio">("all");
  const [debugData, setDebugData] = useState<any>(null);

  useEffect(() => {
    loadFiles();
  }, [conversationId]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      console.log("Loading files for conversation:", conversationId);
      
      // Get all messages with attachments for this conversation
      const data = await apiService.getMessages(conversationId, 1000);
      setDebugData(data);
      
      console.log("API response:", data);
      
      const allFiles: FileAttachment[] = [];
      
      if (data?.messages) {
        console.log("Found messages:", data.messages.length);
        
        data.messages.forEach((message: any, index: number) => {
          console.log(`Message ${index}:`, {
            id: message.id,
            content: message.content,
            attachments: message.attachments,
            metadata: message.metadata
          });
          
          const attachments = message.attachments || message.metadata?.attachments || [];
          console.log(`Message ${index} attachments:`, attachments);
          
          attachments.forEach((att: any, attIndex: number) => {
            console.log(`Attachment ${attIndex}:`, att);
            allFiles.push({
              id: `${message.id}-${att.name || 'file'}-${attIndex}`,
              name: att.name || 'Unknown file',
              size: att.size || 0,
              type: att.type || 'application/octet-stream',
              data: att.data,
              url: att.url,
              remoteKey: att.remoteKey,
              sender: {
                id: message.sender?.id || message.user_id,
                name: message.sender?.name || 'Unknown',
                avatar: message.sender?.avatar,
              },
              created_at: message.created_at,
            });
          });
        });
      } else {
        console.log("No messages found or wrong data structure:", data);
        
        // Fallback: try to get files from fallback messages
        if (fallbackMessages && fallbackMessages.length > 0) {
          console.log("Using fallback messages:", fallbackMessages.length);
          fallbackMessages.forEach((message: any, index: number) => {
            const attachments = message.attachments || message.metadata?.attachments || [];
            attachments.forEach((att: any, attIndex: number) => {
              allFiles.push({
                id: `fallback-${message.id}-${att.name || 'file'}-${attIndex}`,
                name: att.name || 'Unknown file',
                size: att.size || 0,
                type: att.type || 'application/octet-stream',
                data: att.data,
                url: att.url,
                remoteKey: att.remoteKey,
                sender: {
                  id: message.sender?.id || message.user_id,
                  name: message.sender?.name || 'Unknown',
                  avatar: message.sender?.avatar,
                },
                created_at: message.created_at,
              });
            });
          });
        }
      }
      
      console.log("Total files found:", allFiles.length);
      
      // Sort by date (newest first)
      allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setFiles(allFiles);
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFiles = files.filter(file => {
    if (filter === "all") return true;
    if (filter === "images") return file.type.startsWith("image/");
    if (filter === "documents") return file.type.includes("pdf") || file.type.includes("document") || file.type.includes("text");
    if (filter === "videos") return file.type.startsWith("video/");
    if (filter === "audio") return file.type.startsWith("audio/");
    return true;
  });

  const handleDownload = (file: FileAttachment) => {
    const url = file.data || file.url || (file.remoteKey ? `/storage/${file.remoteKey}` : undefined);
    
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`File "${file.name}" không thể tải xuống vì không có dữ liệu.`);
    }
  };

  const handlePreview = (file: FileAttachment) => {
    const url = file.data || file.url || (file.remoteKey ? `/storage/${file.remoteKey}` : undefined);
    
    if (url && file.type.startsWith("image/")) {
      window.open(url, "_blank");
    } else {
      handleDownload(file);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Files</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadFiles}
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        </div>
        
        {/* Filter tabs */}
        <div className="flex gap-1 mt-3">
          {[
            { key: "all", label: "All", count: files.length },
            { key: "images", label: "Images", count: files.filter(f => f.type.startsWith("image/")).length },
            { key: "documents", label: "Docs", count: files.filter(f => f.type.includes("pdf") || f.type.includes("document")).length },
            { key: "videos", label: "Videos", count: files.filter(f => f.type.startsWith("video/")).length },
            { key: "audio", label: "Audio", count: files.filter(f => f.type.startsWith("audio/")).length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={cn(
                "px-3 py-1 text-sm rounded-md transition-colors",
                filter === key
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Files list */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No files found</p>
            <p className="text-xs text-gray-400 mt-2">
              Total files: {files.length} | Filter: {filter}
            </p>
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
              <p><strong>Debug Info:</strong></p>
              <p>Conversation ID: {conversationId}</p>
              <p>Fallback messages: {fallbackMessages?.length || 0}</p>
              <p>API response: {JSON.stringify(debugData || {}, null, 2).substring(0, 200)}...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 group"
              >
                {/* File icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.sender.name}</span>
                    <span>•</span>
                    <span>{formatDate(file.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.type.startsWith("image/") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(file)}
                      className="h-8 w-8 p-0"
                      title="Preview"
                    >
                      👁️
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    className="h-8 w-8 p-0"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
