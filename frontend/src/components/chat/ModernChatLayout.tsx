"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModernSidebar from "./ModernSidebarNew";
import ModernChatHeader from "./ModernChatHeader";
import ModernChatMessages from "./ModernChatMessagesNew";
import ModernChatInput from "./ModernChatInput";
import ModernThreadChat from "./ModernThreadChat";
import RightSidebar from "./RightSidebar";
import AddMemberModal from "../modals/AddMemberModal";
import ConfirmModal from "../modals/ConfirmModal";
import { useChat } from "@/hooks/useChat";
import { getWebSocketClient } from "@/lib/websocket";
import { unreadService } from "@/services/unreadService";
import { apiService } from "@/services/api";
import { useAudioCall } from "@/hooks/useAudioCall";
import { useVideoCall } from "@/hooks/useVideoCall";
import CallOverlay from "@/components/call/CallOverlay";
import VideoCallOverlay from "@/components/call/VideoCallOverlay";
import { useIdlePresence } from "@/hooks/useIdlePresence";

interface ChatLayoutProps {
  className?: string;
}

export default function ModernChatLayout({ className }: ChatLayoutProps) {
  const {
    currentUser,
    teams,
    conversations,
    setConversations,
    currentConversation,
    messages,
    onlineUserIds,
    isLoading,
    isAppReady,
    wsStatus,
    setCurrentConversation,
    handleSelectConversation,
    loadMessages,
    sendMessage,
    addReaction,
    removeReaction,
    bookmarkMessage,
    removeBookmark,
    editMessage,
    deleteMessage,
    loadUnreadCounts,
    loadConversations,
    readPointers,
    typingByConversation,
  } = useChat();
  // Prepare audio call hook at component level (hooks cannot be called inside handlers)
  const audio = useAudioCall({
    conversationId: currentConversation?.id || 0,
    currentUserId: currentUser?.id || 0,
  });
  const video = useVideoCall({
    conversationId: currentConversation?.id || 0,
    currentUserId: currentUser?.id || 0,
  });
  const [showThread, setShowThread] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [rightSidebarMode, setRightSidebarMode] = useState<
    "members" | "settings" | "call" | "video" | null
  >(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [conversationMembers, setConversationMembers] = useState<any[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberType, setAddMemberType] = useState<"team" | "channel">(
    "team",
  );
  const [addMemberTargetId, setAddMemberTargetId] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [threadMessage, setThreadMessage] = useState<{
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    conversation_id: string;
  } | null>(null);

  // Call UI state
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callStatus, setCallStatus] = useState("Calling…");
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoStatus, setVideoStatus] = useState("Calling…");
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);

  // Auto presence: online/away based on idle
  useIdlePresence(currentUser?.id || 0, 60_000);

  // Helper function to get conversation display name
  const getConversationDisplayName = (conversation: any) => {
    if (!conversation) return "Select a conversation";

    if (conversation.type === "direct") {
      const otherUser =
        conversation.other_member ||
        conversation.members?.find(
          (member: any) => member.id !== currentUser?.id,
        );
      return otherUser?.name || conversation.title || "Direct Message";
    }

    if (conversation.type === "channel") {
      return conversation.title || conversation.channel?.name || "Channel";
    }

    if (conversation.type === "group") {
      return conversation.title || "Team";
    }

    return conversation.name || conversation.title || "Unknown";
  };

  // Helper function to get conversation avatar
  const getConversationAvatar = (conversation: any) => {
    if (!conversation) return null;

    if (conversation.type === "direct") {
      const otherUser =
        conversation.other_member ||
        conversation.members?.find(
          (member: any) => member.id !== currentUser?.id,
        );
      return otherUser?.avatar;
    }

    if (conversation.type === "channel") {
      return conversation.channel?.team?.owner?.avatar;
    }

    return null;
  };

  // Compute direct chat online status like sidebar
  const getHeaderIsOnline = () => {
    if (!currentConversation || currentConversation.type !== "direct")
      return undefined;
    const otherUser =
      currentConversation.other_member ||
      currentConversation.members?.find(
        (member: any) => member.id !== currentUser?.id,
      );
    if (!otherUser?.id) return false;
    return onlineUserIds.has(otherUser.id);
  };

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation, loadMessages]);

  // Load members when conversation changes
  const loadConversationMembers = async (conversationId: number) => {
    try {
      const response = await apiService.getConversationMembers(
        conversationId.toString(),
      );
      const members =
        (response as any)?.data?.data || (response as any)?.data || [];
      setConversationMembers(members);
    } catch (error) {
      console.error("Failed to load members:", error);
      setConversationMembers([]);
    }
  };

  useEffect(() => {
    const loadMembers = async () => {
      if (currentConversation) {
        await loadConversationMembers(currentConversation.id);
      } else {
        setConversationMembers([]);
      }
    };

    loadMembers();
  }, [currentConversation]);

  // Global event listener: jump from mentions
  useEffect(() => {
    const handler = (e: any) => {
      const item = e.detail;
      if (!item) return;
      const convId = Number(item.conversation_id);
      const msgId = Number(item.id);
      if (!convId || !msgId) return;
      if (currentConversation?.id !== convId) {
        const conv = conversations.find((c) => c.id === convId);
        if (conv) handleSelectConversation(conv);
        setTimeout(() => jumpToMessage(convId, msgId), 400);
      } else {
        jumpToMessage(convId, msgId);
      }
    };
    window.addEventListener("__nc_jump_to_message", handler as any);
    return () => window.removeEventListener("__nc_jump_to_message", handler as any);
  }, [currentConversation, conversations]);

  // Sync pin state with conversation data
  useEffect(() => {
    if (currentConversation) {
      setIsPinned(currentConversation.is_pinned || false);
    } else {
      setIsPinned(false);
    }
  }, [currentConversation]);

  const handleSendMessage = async (content: string) => {
    if (!currentConversation) return;

    try {
      await sendMessage(currentConversation.id, content, "text");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleReachBottom = () => {
    if (!currentConversation || !currentUser) return;
    try {
      const wsClient = getWebSocketClient();
      if (
        wsClient.getConnectionState() === "connected" &&
        messages.length > 0
      ) {
        const lastMsg = messages[messages.length - 1];
        wsClient.send({
          type: "message_read",
          conversation_id: currentConversation.id,
          message_id: lastMsg.id as any,
          user_id: currentUser.id,
        } as any);
      }
    } catch {}
  };

  const handleTyping = (isTyping: boolean) => {
    if (!currentConversation || !currentUser) return;

    try {
      const wsClient = getWebSocketClient();
      if (wsClient.getConnectionState() === "connected") {
        wsClient.send({
          type: isTyping ? "typing_start" : "typing_stop",
          conversation_id: currentConversation.id,
          user_id: currentUser.id,
        });
      }
    } catch (error) {
      console.error("Failed to send typing indicator:", error);
    }
  };

  const typingNames = (() => {
    if (!currentConversation) return [] as string[];
    const set = typingByConversation[currentConversation.id];
    if (!set) return [];
    const ids = Array.from(set).filter((id) => id !== (currentUser?.id || 0));
    const names = (currentConversation.members || [])
      .filter((m: any) => ids.includes(m.id))
      .map((m: any) => m.name || m.username || `user${m.id}`);
    return names;
  })();

  const jumpToMessage = (
    conversationId: number,
    messageId: number,
    q?: string,
  ) => {
    const doScroll = () => {
      const el = document.querySelector(`[data-message-id="${messageId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-yellow-300");
        setTimeout(
          () => el.classList.remove("ring-2", "ring-yellow-300"),
          1500,
        );
      }
    };
    if (currentConversation?.id !== conversationId) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        handleSelectConversation(conv);
        // delay to ensure messages loaded
        let attempts = 0;
        const tryScroll = () => {
          attempts++;
          const found = document.querySelector(
            `[data-message-id="${messageId}"]`,
          );
          if (found) {
            doScroll();
            return;
          }
          if (attempts < 8) {
            setTimeout(tryScroll, 250);
            return;
          }
        };
        setTimeout(tryScroll, 500);
      }
    } else {
      let attempts = 0;
      const tryScroll = () => {
        attempts++;
        const found = document.querySelector(
          `[data-message-id="${messageId}"]`,
        );
        if (found) {
          doScroll();
          return;
        }
        if (attempts < 8) {
          setTimeout(tryScroll, 200);
          return;
        }
      };
      tryScroll();
    }
  };

  const handleCall = () => {
    if (!currentConversation || !currentUser) return;
    try {
      // Register WS handlers
      const ws = getWebSocketClient();
      ws.onMessage((message: any) => {
        if (
          message.type === "rtc_offer" &&
          message.conversation_id === currentConversation.id &&
          message.from !== currentUser.id
        ) {
          audio.handleRemoteOffer(message.sdp);
          setCallStatus("Incoming call…");
          setIsCallOpen(true);
        }
        if (
          message.type === "rtc_answer" &&
          message.conversation_id === currentConversation.id &&
          message.from !== currentUser.id
        ) {
          audio.handleRemoteAnswer(message.sdp);
          setCallStatus("In call");
          setIsCallOpen(true);
        }
        if (
          message.type === "rtc_candidate" &&
          message.conversation_id === currentConversation.id &&
          message.from !== currentUser.id
        ) {
          audio.addIceCandidate(message.candidate);
        }
        if (
          message.type === "rtc_end" &&
          message.conversation_id === currentConversation.id
        ) {
          audio.hangup();
          setIsCallOpen(false);
          setCallStatus("Ended");
        }
      });
      // Start call
      audio.call();
      setIsCallOpen(true);
      setCallStatus("Calling…");
      setRightSidebarMode(null);
      setIsRightSidebarOpen(false);

      // Attach hangup to window for now (can be improved)
      (window as any).__ncHangup = () => audio.hangup();
    } catch (e) {
      console.error("Failed to start audio call", e);
    }
  };

  const handleVideoCall = async () => {
    if (!currentConversation || !currentUser) return;
    try {
      const ws = getWebSocketClient();
      ws.onMessage((message: any) => {
        if (
          message.type === "rtc_offer" &&
          message.media === "video" &&
          message.conversation_id === currentConversation.id &&
          message.from !== currentUser.id
        ) {
          video.handleRemoteOffer(message.sdp);
          setVideoStatus("Incoming video call…");
          setIsVideoOpen(true);
        }
        if (
          message.type === "rtc_answer" &&
          message.media === "video" &&
          message.conversation_id === currentConversation.id &&
          message.from !== currentUser.id
        ) {
          video.handleRemoteAnswer(message.sdp);
          setVideoStatus("In call");
          setIsVideoOpen(true);
        }
        if (
          message.type === "rtc_candidate" &&
          message.conversation_id === currentConversation.id &&
          message.from !== currentUser.id
        ) {
          video.addIceCandidate(message.candidate);
        }
        if (
          message.type === "rtc_end" &&
          message.conversation_id === currentConversation.id
        ) {
          video.hangup();
          setIsVideoOpen(false);
          setVideoStatus("Ended");
        }
      });
      await video.call();
      setIsVideoOpen(true);
      setVideoStatus("Calling…");
      setRightSidebarMode(null);
      setIsRightSidebarOpen(false);
      (window as any).__ncHangupVideo = () => video.hangup();
    } catch (e) {
      console.error("Failed to start video call", e);
      alert("Không thể bắt đầu cuộc gọi video. Vui lòng kiểm tra camera và microphone.");
    }
  };

  const handleViewMembers = () => {
    setRightSidebarMode("members");
    setIsRightSidebarOpen(true);
  };

  const handleToggleMute = () => {
    if (!currentConversation) return;
    setIsMuted((prev) => !prev);
    try {
      if (!isMuted) {
        apiService.muteConversation(currentConversation.id.toString());
      } else {
        apiService.unmuteConversation(currentConversation.id.toString());
      }
    } catch (e) {
      console.error("Failed to toggle mute", e);
    }
  };

  const handleTogglePin = async () => {
    if (!currentConversation) return;

    try {
      console.log("Toggling pin, current state:", isPinned);
      let response;
      if (isPinned) {
        console.log("Unpinning conversation:", currentConversation.id);
        response = await apiService.unpinConversation(
          currentConversation.id.toString(),
        );
        setIsPinned(false);
      } else {
        console.log("Pinning conversation:", currentConversation.id);
        response = await apiService.pinConversation(
          currentConversation.id.toString(),
        );
        setIsPinned(true);
      }

      console.log("Pin response:", response);

      // Update conversation data if API returns updated conversation
      if (response?.data?.data) {
        const updatedConversation = response.data.data;
        console.log("Updated conversation:", updatedConversation);
        setCurrentConversation((prev) => ({
          ...prev,
          is_pinned: updatedConversation.is_pinned,
        }));
      }

      // Reload conversations list to show pin status in sidebar
      console.log("Reloading conversations list...");
      await loadConversations();

      console.log("Pin state after toggle:", !isPinned);
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái pin");
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentConversation) return;

    if (confirm("Bạn có chắc chắn muốn rời khỏi nhóm này?")) {
      try {
        // After successful leave, close the conversation
        setCurrentConversation(null);
        setIsRightSidebarOpen(false);
      } catch (error) {
        console.error("Error leaving group:", error);
        alert("Có lỗi xảy ra khi rời nhóm");
      }
    }
  };

  const handleDeleteConversation = async () => {
    if (!currentConversation) return;

    if (confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này?")) {
      try {
        // After successful delete, close the conversation
        setCurrentConversation(null);
        setIsRightSidebarOpen(false);
      } catch (error) {
        console.error("Error deleting conversation:", error);
        alert("Có lỗi xảy ra khi xóa cuộc trò chuyện");
      }
    }
  };

  const handleSettings = () => {
    setRightSidebarMode("settings");
    setIsRightSidebarOpen(true);
  };

  const handleAddMember = () => {
    if (currentConversation?.type === "team") {
      setAddMemberType("team");
      setAddMemberTargetId(
        currentConversation.team_id?.toString() ||
          currentConversation.id.toString(),
      );
      setShowAddMemberModal(true);
    } else if (currentConversation?.type === "channel") {
      setAddMemberType("channel");
      setAddMemberTargetId(
        currentConversation.channel_id?.toString() ||
          currentConversation.id.toString(),
      );
      setShowAddMemberModal(true);
    }
  };

  const handleRemoveMember = (memberId: number) => {
    if (!currentConversation) return;

    const member = conversationMembers.find((m) => m.id === memberId);
    const memberName = member?.name || member?.username || "thành viên này";

    setConfirmTitle("Xóa thành viên khỏi nhóm");
    setConfirmMessage(
      `Bạn có chắc chắn muốn xóa ${memberName} khỏi nhóm? Hành động này không thể hoàn tác.`,
    );
    setConfirmAction(() => async () => {
      setIsConfirmLoading(true);
      try {
        if (currentConversation.type === "team") {
          await apiService.removeMemberFromTeam(
            currentConversation.team_id?.toString() ||
              currentConversation.id.toString(),
            memberId.toString(),
          );
        } else if (currentConversation.type === "channel") {
          await apiService.removeMemberFromChannel(
            currentConversation.team_id?.toString() ||
              currentConversation.id.toString(),
            currentConversation.channel_id?.toString() ||
              currentConversation.id.toString(),
            memberId.toString(),
          );
        }

        // Reload conversation members
        if (currentConversation.id) {
          loadConversationMembers(currentConversation.id);
        }

        setShowConfirmModal(false);
      } catch (error) {
        console.error("Failed to remove member:", error);
        alert("Có lỗi xảy ra khi xóa thành viên");
      } finally {
        setIsConfirmLoading(false);
      }
    });
    setShowConfirmModal(true);
  };

  const isCurrentUserOwner = () => {
    if (!currentConversation || !currentUser) return false;

    // For team conversations, check if current user is the team owner
    if (
      currentConversation.type === "team" &&
      currentConversation.team?.owner_id
    ) {
      return currentConversation.team.owner_id === currentUser.id;
    }

    // For channel conversations, check if current user is the team owner
    if (
      currentConversation.type === "channel" &&
      currentConversation.team?.owner_id
    ) {
      return currentConversation.team.owner_id === currentUser.id;
    }

    return false;
  };

  const handleOpenThread = (message: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    conversation_id: string;
  }) => {
    setThreadMessage(message);
    setShowThread(true);
  };

  const handleCloseThread = () => {
    setShowThread(false);
    setThreadMessage(null);
  };

  // App-level loading gate: wait until data & ws are ready
  if (!isAppReady) {
    return (
      <div
        className={`flex h-screen bg-white text-gray-900 items-center justify-center ${className || ""}`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-sm text-gray-500">
            {wsStatus === "connecting" ? "Connecting…" : "Loading…"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen bg-gray-50 text-gray-900 ${className || ""}`}
    >
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-80 flex-shrink-0"
      >
        <ModernSidebar
          teams={teams}
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={handleSelectConversation}
          onAddConversation={(conversation) => {
            setConversations((prev) => [conversation, ...prev]);
          }}
          currentUser={currentUser}
          onlineUserIds={onlineUserIds}
        />
      </motion.div>

      {/* Call Overlay */}
      <CallOverlay
        open={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        calleeName={
          currentConversation?.type === "direct"
            ? currentConversation?.other_member?.name ||
              currentConversation?.members?.find(
                (m: any) => m.id !== currentUser?.id,
              )?.name
            : getConversationDisplayName(currentConversation)
        }
        statusText={callStatus}
        onHangup={() => {
          (window as any).__ncHangup?.();
          setIsCallOpen(false);
        }}
      />

      {/* Video Call Overlay */}
      <VideoCallOverlay
        open={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        calleeName={
          currentConversation?.type === "direct"
            ? currentConversation?.other_member?.name ||
              currentConversation?.members?.find(
                (m: any) => m.id !== currentUser?.id,
              )?.name
            : getConversationDisplayName(currentConversation)
        }
        statusText={videoStatus}
        localStream={video.localStreamRef.current}
        remoteStream={video.remoteStreamRef.current}
        onHangup={() => {
          (window as any).__ncHangupVideo?.();
          setIsVideoOpen(false);
        }}
        minimized={isVideoMinimized}
        onToggleMinimize={() => setIsVideoMinimized((v) => !v)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white h-screen">
        {/* Chat header (or placeholder when no conversation) */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-shrink-0"
        >
          {currentConversation ? (
            <ModernChatHeader
              channelName={getConversationDisplayName(currentConversation)}
              channelType={currentConversation.type}
              memberCount={currentConversation.members?.length || 0}
              isOnline={getHeaderIsOnline()}
              lastSeen="now"
              avatar={getConversationAvatar(currentConversation)}
              isMuted={isMuted}
              isPinned={isPinned}
              onCall={handleCall}
              onVideoCall={handleVideoCall}
              onViewMembers={handleViewMembers}
              onToggleMute={handleToggleMute}
              onTogglePin={handleTogglePin}
              onSettings={handleSettings}
              onJumpToMessage={jumpToMessage}
              onMarkAllRead={async () => {
                if (!currentConversation) return;
                await unreadService.markConversationAsRead(
                  currentConversation.id,
                );
                loadUnreadCounts();
              }}
            />
          ) : (
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-500">
                Select a conversation to start
              </h2>
            </div>
          )}
        </motion.div>

        {/* Chat messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex-1 min-h-0 overflow-hidden"
        >
          {currentConversation ? (
            <ModernChatMessages
              messages={messages}
              currentUser={currentUser}
              conversationId={currentConversation.id}
              onOpenThread={handleOpenThread}
              onAddReaction={addReaction}
              onRemoveReaction={removeReaction}
              onBookmark={bookmarkMessage}
              onRemoveBookmark={removeBookmark}
              isLoading={isLoading}
              onEditMessage={async (id, content) => {
                await editMessage(id, content);
              }}
              onDeleteMessage={async (id) => {
                await deleteMessage(id);
              }}
              onReachBottom={handleReachBottom}
              members={(currentConversation?.members || []).map((m: any) => ({
                id: m.id,
                name: m.name,
                avatar: m.avatar,
              }))}
              readPointers={
                currentConversation
                  ? readPointers[currentConversation.id] || {}
                  : {}
              }
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-gray-500">
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Chat input */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex-shrink-0"
        >
          {currentConversation ? (
            <ModernChatInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              placeholder={`Type message...`}
              disabled={isLoading}
              typingUsers={typingNames}
              mentionUsers={(currentConversation?.members || []).map(
                (m: any) => ({
                  id: m.id,
                  name: m.name,
                  username: m.username,
                  avatar: m.avatar,
                }),
              )}
            />
          ) : (
            <div className="h-16 border-t border-gray-100 bg-white" />
          )}
        </motion.div>
      </div>

      <RightSidebar
        open={isRightSidebarOpen}
        mode={rightSidebarMode}
        onClose={() => setIsRightSidebarOpen(false)}
        members={conversationMembers}
        isMuted={isMuted}
        isPinned={isPinned}
        conversationType={currentConversation?.type}
        onLeaveGroup={handleLeaveGroup}
        onDeleteConversation={handleDeleteConversation}
        onToggleMute={handleToggleMute}
        onTogglePin={handleTogglePin}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        currentUserId={currentUser?.id}
        isOwner={isCurrentUserOwner()}
      />

      <AnimatePresence>
        {showThread && threadMessage && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-96 flex-shrink-0"
          >
            <ModernThreadChat
              parentMessage={threadMessage}
              onClose={handleCloseThread}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onMemberAdded={() => {
          setShowAddMemberModal(false);
          // Reload conversation members
          if (currentConversation?.id) {
            loadConversationMembers(currentConversation.id);
          }
        }}
        type={addMemberType}
        teamId={addMemberType === "team" ? addMemberTargetId : undefined}
        channelId={addMemberType === "channel" ? addMemberTargetId : undefined}
        existingMembers={conversationMembers}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => confirmAction?.()}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        isLoading={isConfirmLoading}
      />
    </div>
  );
}
