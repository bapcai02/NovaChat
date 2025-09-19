"use client";

import React, { useEffect } from "react";
import ModernChatLayout from "@/components/chat/ModernChatLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { getWebSocketClient } from "@/lib/websocket";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const params = useSearchParams();
  useEffect(() => {
    const cid = Number(params.get("cid"));
    const mid = Number(params.get("mid"));
    if (cid && mid) {
      // when layout mounts and handlers attach, dispatch jump event
      setTimeout(() => {
        const ev = new CustomEvent("__nc_jump_to_message", { detail: { conversation_id: cid, id: mid } });
        window.dispatchEvent(ev as any);
      }, 300);
    }
  }, [params]);
  return (
    <AuthGuard requireAuth={true}>
      <ModernChatLayout />
    </AuthGuard>
  );
}
