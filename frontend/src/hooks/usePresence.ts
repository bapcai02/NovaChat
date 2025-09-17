import type { User } from "@/types/chat";

export function normalizeOnlineUsers(input: any): number[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((id: any) => parseInt(id?.toString?.() || "0"))
    .filter((n: number) => !!n);
}

export function upsertOnlineUsers(
  usersData: any,
  setOnlineUsers: (users: User[]) => void,
  setOnlineUserIds: (ids: Set<number>) => void,
): void {
  const ids = normalizeOnlineUsers(usersData);
  setOnlineUsers([]);
  setOnlineUserIds(new Set(ids));
}
