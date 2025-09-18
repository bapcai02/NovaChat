"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  calleeName?: string;
  statusText?: string;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  onHangup?: () => void;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function VideoCallOverlay({
  open,
  onClose,
  calleeName,
  statusText,
  localStream,
  remoteStream,
  onHangup,
  minimized = false,
  onToggleMinimize,
}: Props) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<{ x: number; y: number }>({ x: 24, y: 24 });
  const mouseRef = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    if (localRef.current) {
      localRef.current.srcObject = localStream || null;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current) {
      remoteRef.current.srcObject = remoteStream || null;
    }
  }, [remoteStream]);

  if (!open) return null;

  // Minimized floating window (draggable)
  if (minimized) {
    const onMouseDown = (e: React.MouseEvent) => {
      const el = dragRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
      const onMove = (ev: MouseEvent) => {
        const dx = mouseRef.current?.dx || 0;
        const dy = mouseRef.current?.dy || 0;
        posRef.current = { x: Math.max(8, ev.clientX - dx), y: Math.max(8, ev.clientY - dy) };
        el.style.left = posRef.current.x + "px";
        el.style.top = posRef.current.y + "px";
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        mouseRef.current = null;
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };

    return (
      <div
        ref={dragRef}
        style={{ position: "fixed", left: 24, top: 24, width: 320, height: 200, zIndex: 10000 }}
        className="rounded-xl overflow-hidden border border-gray-200 shadow-2xl bg-white select-none"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 cursor-move" onMouseDown={onMouseDown}>
          <div>
            <div className="text-xs font-medium text-gray-900">{calleeName || "Video Call"}</div>
            {statusText && <div className="text-[11px] text-gray-500">{statusText}</div>}
          </div>
          <div className="flex items-center gap-1">
            {onToggleMinimize && (
              <button type="button" onClick={onToggleMinimize} className="h-7 px-2 text-xs rounded bg-gray-100 hover:bg-gray-200">Mở rộng</button>
            )}
            <button type="button" onClick={onHangup} className="h-7 px-2 text-xs rounded bg-red-600 text-white hover:bg-red-700">Kết thúc</button>
          </div>
        </div>
        <div className="relative bg-black w-full h-[calc(200px-40px)]">
          <video ref={remoteRef} className="absolute inset-0 w-full h-full object-cover bg-black" autoPlay playsInline />
          <video ref={localRef} className="absolute bottom-2 right-2 w-24 h-16 bg-black rounded border border-white/20 object-cover" autoPlay muted playsInline />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl mx-4 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">{calleeName || "Video Call"}</div>
            {statusText && <div className="text-xs text-gray-500">{statusText}</div>}
          </div>
          <div className="flex items-center gap-2">
            {onToggleMinimize && (
              <Button onClick={onToggleMinimize} className="h-8 px-3" variant="secondary">Thu nhỏ</Button>
            )}
            <Button variant="destructive" onClick={onHangup} className="h-8 px-3">Kết thúc</Button>
          </div>
        </div>
        <div className="relative bg-black">{/* viewport */}
          <video ref={remoteRef} className="w-full aspect-video bg-black" autoPlay playsInline />
          <video ref={localRef} className="absolute bottom-4 right-4 w-48 h-32 bg-black rounded-md border border-white/20" autoPlay muted playsInline />
        </div>
      </div>
    </div>
  );
}


