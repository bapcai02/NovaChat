"use client";

import React, { useEffect, useState } from "react";
import { apiService } from "@/services/api";

export default function MentionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getMentions(1, 50);
        const data = (res as any)?.data || (res as any);
        setItems(data?.items || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Mentions</h1>
      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500">No mentions</div>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className="p-3 border rounded-md bg-white">
              <div className="text-xs text-gray-500">
                In conversation #{m.conversation_id}
              </div>
              <div className="text-sm text-gray-800">{m.content}</div>
              <button
                className="mt-2 text-xs text-blue-600 hover:underline"
                onClick={() => {
                  const ev = new CustomEvent("__nc_jump_to_message", { detail: m });
                  window.dispatchEvent(ev);
                }}
              >
                Jump to message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


