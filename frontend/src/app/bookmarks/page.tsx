"use client";

import React from "react";
import BookmarkList from "@/components/bookmarks/BookmarkList";

export default function BookmarksPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookmarks</h1>
        <p className="text-gray-600">
          Quản lý các tin nhắn đã bookmark của bạn
        </p>
      </div>

      <BookmarkList />
    </div>
  );
}
