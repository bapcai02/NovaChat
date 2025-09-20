'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';

interface RightSidebarProps {
  open: boolean;
  mode: 'members' | 'settings' | 'call' | 'video' | 'files' | null;
  onClose: () => void;
  members?: Array<{
    id: number;
    name?: string;
    username?: string;
    avatar?: string;
  }>;
  isMuted: boolean;
  isPinned: boolean;
  conversationType?: 'direct' | 'group' | 'channel' | 'team';
  onLeaveGroup?: () => void;
  onDeleteConversation?: () => void;
  onToggleMute: () => void;
  onTogglePin: () => void;
  onAddMember?: () => void;
  onRemoveMember?: (memberId: number) => void;
  currentUserId?: number;
  isOwner?: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  open,
  mode,
  onClose,
  members = [],
  isMuted,
  isPinned,
  conversationType,
  onLeaveGroup,
  onDeleteConversation,
  onToggleMute,
  onTogglePin,
  onAddMember,
  onRemoveMember,
  currentUserId,
  isOwner = false,
}) => {
  const { t } = useTranslation('common');
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-80 border-l border-gray-100 bg-white flex-shrink-0 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold">
              {mode === 'members' && t('members')}
              {mode === 'settings' && t('conversation_settings')}
              {mode === 'call' && t('voice_call')}
              {mode === 'video' && t('video_call')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm"
              aria-label="Close sidebar"
            >
              ×
            </button>
          </div>

          <div className="p-4 overflow-auto flex-1">
            {mode === 'members' && (
              <div className="space-y-3">
                {/* Add Member Button - Only show for owners */}
                {isOwner && onAddMember && (
                  <button
                    onClick={onAddMember}
                    className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-blue-700">
                        Thêm thành viên
                      </div>
                      <div className="text-xs text-blue-500">
                        Mời người dùng vào nhóm
                      </div>
                    </div>
                  </button>
                )}

                {/* Members List */}
                {(members || []).map(m => (
                  <div key={m.id} className="flex items-center gap-3 group">
                    {m.avatar ? (
                      <img
                        src={m.avatar}
                        alt={m.name || m.username || 'User'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold">
                        {(m.name || m.username || 'U').toString().charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {m.name || m.username}
                      </div>
                      {m.username && (
                        <div className="text-xs text-gray-500 truncate">
                          @{m.username}
                        </div>
                      )}
                    </div>
                    {/* Remove member button - only show for owners and not for current user */}
                    {(conversationType === 'team' ||
                      conversationType === 'channel') &&
                      onRemoveMember &&
                      isOwner &&
                      m.id !== currentUserId && (
                        <button
                          onClick={() => onRemoveMember(m.id)}
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all"
                          title="Xóa khỏi nhóm"
                        >
                          <svg
                            className="h-3 w-3 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                  </div>
                ))}
                {(!members || members.length === 0) && (
                  <div className="text-sm text-gray-500">{t('no_members')}</div>
                )}
              </div>
            )}

            {mode === 'settings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('mute_conversation')}</span>
                  <button
                    onClick={onToggleMute}
                    className={`px-2 py-1 text-xs rounded ${isMuted ? 'bg-gray-600 text-white' : 'bg-gray-100'}`}
                  >
                    {isMuted ? t('muted') : t('mute')}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('pin_conversation')}</span>
                  <button
                    onClick={onTogglePin}
                    className={`px-2 py-1 text-xs rounded ${isPinned ? 'bg-gray-600 text-white' : 'bg-gray-100'}`}
                  >
                    {isPinned ? t('pinned') : t('pin')}
                  </button>
                </div>

                {/* Action buttons based on conversation type */}
                <div className="border-t pt-4 space-y-2">
                  {conversationType === 'direct' && onDeleteConversation && (
                    <button
                      onClick={onDeleteConversation}
                      className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md border border-red-200 hover:border-red-300 transition-colors"
                    >
                      {t('delete_conversation')}
                    </button>
                  )}

                  {(conversationType === 'group' ||
                    conversationType === 'channel' ||
                    conversationType === 'team') &&
                    onLeaveGroup && (
                      <button
                        onClick={onLeaveGroup}
                        className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md border border-red-200 hover:border-red-300 transition-colors"
                      >
                        {t('leave_group')}
                      </button>
                    )}
                </div>
              </div>
            )}

            {mode === 'call' && (
              <div className="text-sm text-gray-600 space-y-3">
                <p>Preparing voice call UI...</p>
                <p className="text-xs text-gray-400">
                  (Placeholder) Integrate WebRTC or a calling SDK here.
                </p>
              </div>
            )}

            {mode === 'video' && (
              <div className="text-sm text-gray-600 space-y-3">
                <p>Preparing video call UI...</p>
                <p className="text-xs text-gray-400">
                  (Placeholder) Integrate WebRTC or a video SDK here.
                </p>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default RightSidebar;
