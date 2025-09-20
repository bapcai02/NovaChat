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
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <File className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Files</h3>
              <p className="text-sm text-gray-500">
                {files.length} {files.length === 1 ? 'file' : 'files'} shared
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadFiles}
              className="h-9 w-9 p-0 rounded-lg hover:bg-white/60 transition-colors"
              disabled={isLoading}
              title="Refresh files"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 rounded-lg hover:bg-white/60 transition-colors"
              title="Close files panel"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>
        
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { key: "all", label: "All", count: files.length, icon: "📁" },
            { key: "images", label: "Images", count: files.filter(f => f.type.startsWith("image/")).length, icon: "🖼️" },
            { key: "documents", label: "Docs", count: files.filter(f => f.type.includes("pdf") || f.type.includes("document")).length, icon: "📄" },
            { key: "videos", label: "Videos", count: files.filter(f => f.type.startsWith("video/")).length, icon: "🎥" },
            { key: "audio", label: "Audio", count: files.filter(f => f.type.startsWith("audio/")).length, icon: "🎵" },
          ].map(({ key, label, count, icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={cn(
                "px-4 py-2.5 text-sm rounded-xl transition-all duration-200 flex items-center gap-2 min-w-0 flex-shrink-0 font-medium",
                filter === key
                  ? "bg-white text-blue-700 border border-blue-200 shadow-sm ring-1 ring-blue-100"
                  : "text-gray-600 hover:bg-white/50 hover:text-gray-800 border border-transparent hover:border-gray-200"
              )}
            >
              <span className="text-lg">{icon}</span>
              <span className="whitespace-nowrap">{label}</span>
              <span className={cn(
                "px-2.5 py-1 rounded-full text-xs font-bold min-w-[20px] text-center",
                filter === key 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-gray-100 text-gray-600"
              )}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Files list */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200"></div>
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-sm text-gray-500">Loading files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <File className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {filter === "all" 
                ? "No files have been shared in this conversation yet." 
                : `No ${filter} files found. Try switching to "All" to see all files.`
              }
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Total files: <span className="font-medium">{files.length}</span></p>
              <p>Current filter: <span className="font-medium capitalize">{filter}</span></p>
            </div>
            
            {/* Debug info - only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-left max-w-md mx-auto">
                <p className="font-semibold text-gray-700 mb-2">Debug Info:</p>
                <div className="space-y-1 text-gray-600">
                  <p>Conversation ID: <span className="font-mono">{conversationId}</span></p>
                  <p>Fallback messages: <span className="font-mono">{fallbackMessages?.length || 0}</span></p>
                  <p>API response: <span className="font-mono text-xs break-all">
                    {JSON.stringify(debugData || {}, null, 2).substring(0, 100)}...
                  </span></p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* File icon with background */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {formatFileSize(file.size)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {file.sender.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {formatDate(file.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    {file.type.startsWith("image/") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(file)}
                        className="h-9 w-9 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                        title="Preview"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      className="h-9 w-9 p-0 rounded-lg hover:bg-green-50 hover:text-green-600"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* File type indicator */}
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-t-[20px] border-l-transparent border-t-gray-100"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
