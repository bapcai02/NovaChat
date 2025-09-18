"use client";

import { useEffect, useRef } from "react";
import { getWebSocketClient } from "@/lib/websocket";

export function useIdlePresence(currentUserId?: number, idleMs: number = 60_000) {
  const timerRef = useRef<number | null>(null);
  const isAwayRef = useRef(false);

  useEffect(() => {
    if (!currentUserId) return;

    const setOnline = () => {
      try {
        const ws = getWebSocketClient();
        if (ws.getConnectionState() === "connected") {
          ws.send({ type: "ping", user_id: currentUserId });
        }
      } catch {}
    };

    const setAway = () => {
      if (isAwayRef.current) return;
      isAwayRef.current = true;
      try {
        const ws = getWebSocketClient();
        if (ws.getConnectionState() === "connected") {
          ws.send({ type: "user_offline", user_id: currentUserId });
        }
      } catch {}
    };

    const resetTimer = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (isAwayRef.current) {
        isAwayRef.current = false;
        setOnline();
      }
      timerRef.current = window.setTimeout(() => setAway(), idleMs);
    };

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "visibilitychange",
    ];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true } as any));

    // initial state
    setOnline();
    resetTimer();

    const pingInterval = window.setInterval(() => setOnline(), 25_000);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.clearInterval(pingInterval);
      events.forEach((e) => window.removeEventListener(e, resetTimer as any));
    };
  }, [currentUserId, idleMs]);
}


