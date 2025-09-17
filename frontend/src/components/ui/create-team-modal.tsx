"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "./button";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated?: (team: {
    id: number;
    name: string;
    display_name?: string;
    description?: string;
  }) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onTeamCreated,
}) => {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<
    Array<{ id: number; name: string; email?: string }>
  >([]);
  const [query, setQuery] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setUsers(list as any);
      } catch (e) {
        console.error(e);
        // silent
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q),
    );
  }, [users, query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Team name is required");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.post("/teams", {
        name: name.trim(),
        display_name: displayName.trim() || undefined,
        description: description.trim() || undefined,
        members: selectedMemberIds,
      });
      const data = res.data?.data;
      onTeamCreated?.(data);
      onClose();
      setName("");
      setDisplayName("");
      setDescription("");
      setSelectedMemberIds([]);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
  };

  return !isOpen ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-[hsl(222.2_84%_4.9%)] border border-[hsl(var(--chat-border))] shadow-2xl">
        <div className="px-5 pt-5 pb-3 border-b border-[hsl(var(--chat-border))] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-3-3h-2M9 20H4v-2a3 3 0 013-3h2m3-7a4 4 0 110-8 4 4 0 010 8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Create a new team</h3>
              <p className="text-[11px] text-[hsl(var(--chat-text-muted))]">
                Organize channels and members under a workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-[hsl(var(--chat-message-hover))] text-[hsl(var(--chat-text-muted))]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-[11px] font-medium mb-1">
                Team name
              </label>
              <div className="relative">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--chat-border))] bg-transparent px-3 py-2 text-xs outline-none focus:border-[hsl(var(--chat-accent))] focus:ring-2 focus:ring-[hsl(var(--chat-accent-light))]"
                  placeholder="e.g. Acme"
                />
              </div>
              <p className="text-[10px] text-[hsl(var(--chat-text-muted))] mt-1">
                A short, unique name for your workspace
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium mb-1">
                  Display name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--chat-border))] bg-transparent px-3 py-2 text-xs outline-none focus:border-[hsl(var(--chat-accent))] focus:ring-2 focus:ring-[hsl(var(--chat-accent-light))]"
                  placeholder="e.g. Acme Team"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1">
                  Description
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--chat-border))] bg-transparent px-3 py-2 text-xs outline-none focus:border-[hsl(var(--chat-accent))] focus:ring-2 focus:ring-[hsl(var(--chat-accent-light))]"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium">
                Add members
              </label>
              <span className="text-[10px] text-[hsl(var(--chat-text-muted))]">
                {selectedMemberIds.length} selected
              </span>
            </div>
            {selectedMemberIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedMemberIds.map((id) => {
                  const u = users.find((x) => x.id === id);
                  if (!u) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center space-x-1 bg-[hsl(var(--chat-message-bg))] border border-[hsl(var(--chat-border))] px-2 py-0.5 rounded-full text-[10px]"
                    >
                      <span>{u.name}</span>
                      <button
                        type="button"
                        className="text-[hsl(var(--chat-text-muted))] hover:text-[hsl(var(--chat-text))]"
                        onClick={() =>
                          setSelectedMemberIds((prev) =>
                            prev.filter((x) => x !== id),
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--chat-border))] bg-transparent px-3 py-2 text-xs outline-none focus:border-[hsl(var(--chat-accent))] focus:ring-2 focus:ring-[hsl(var(--chat-accent-light))]"
              placeholder="Search users by name or email"
            />
            <div className="max-h-40 overflow-auto rounded-lg border border-[hsl(var(--chat-border))] divide-y divide-[hsl(var(--chat-border))]">
              {filteredUsers.map((u) => {
                const checked = selectedMemberIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-center justify-between px-3 py-2 text-xs hover:bg-[hsl(var(--chat-message-hover))] cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedMemberIds((prev) =>
                            checked
                              ? prev.filter((id) => id !== u.id)
                              : [...prev, u.id],
                          );
                        }}
                      />
                      <span>{u.name}</span>
                    </div>
                    {u.email && (
                      <span className="text-[10px] text-[hsl(var(--chat-text-muted))]">
                        {u.email}
                      </span>
                    )}
                  </label>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="px-3 py-3 text-[10px] text-[hsl(var(--chat-text-muted))]">
                  No users found
                </div>
              )}
            </div>
          </div>

          {error && <div className="text-xs text-red-500">{error}</div>}

          <div className="flex items-center justify-end space-x-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !name.trim()}
              className="chat-button"
            >
              {isSubmitting ? "Creating…" : "Create team"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
