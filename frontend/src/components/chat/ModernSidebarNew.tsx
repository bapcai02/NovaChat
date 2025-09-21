'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Hash,
  Users,
  MessageCircle,
  Bell,
  HelpCircle,
  Settings,
  BookmarkIcon,
  X,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SettingsModal from '@/components/settings/SettingsModal';
import BookmarkList from '@/components/bookmarks/BookmarkList';
import { Input } from '@/components/ui/input';
import { CustomAvatar } from '@/components/ui/custom-avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserSearchDropdown } from '@/components/ui/user-search-dropdown';
import { cn } from '@/lib/utils';
import type { User, Team, Conversation } from '@/types/chat';
import { UserSearchResult } from '@/services/userSearchService';
import UserOnlineStatus from './UserOnlineStatus';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useTranslation } from 'react-i18next';
import { apiService } from '@/services/api';
import CreateTeamModal from '@/components/modals/CreateTeamModal';
import CreateChannelModal from '@/components/modals/CreateChannelModalNew';
import CreateDirectModal from '@/components/modals/CreateDirectModal';
import AddMemberModal from '@/components/modals/AddMemberModal';

interface ModernSidebarProps {
  teams: Team[];
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onAddConversation?: (conversation: Conversation) => void;
  currentUser: User | null;
  onlineUserIds?: Set<number>;
}

export default function ModernSidebar({
  teams,
  conversations,
  currentConversation,
  onSelectConversation,
  onAddConversation,
  currentUser,
  onlineUserIds = new Set(),
}: ModernSidebarProps) {
  const [openSettings, setOpenSettings] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showCreateDirectModal, setShowCreateDirectModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberType, setAddMemberType] = useState<'team' | 'channel'>(
    'team'
  );
  const [addMemberTargetId, setAddMemberTargetId] = useState<string>('');
  const [collapsedTeams, setCollapsedTeams] = useState<Set<number>>(new Set());
  const [collapsedChannels, setCollapsedChannels] = useState<Set<number>>(new Set());
  const { t } = useTranslation('common');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mentionsCount, setMentionsCount] = useState(0);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [hideMuted, setHideMuted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getMentionsCount();
        const payload: any = (res as any)?.data || res;
        setMentionsCount(Number(payload?.count || 0));
      } catch {}
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  // Get team gradient based on index
  const getTeamGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-cyan-500 to-blue-600',
      'from-emerald-500 to-green-600',
      'from-rose-500 to-pink-600',
      'from-indigo-500 to-purple-600',
    ];
    return gradients[index % gradients.length];
  };

  // Get channel icon based on channel name
  const getChannelIcon = (channelName: string) => {
    const name = channelName.toLowerCase();
    if (name.includes('general') || name.includes('main'))
      return <Hash className="h-4 w-4 text-gray-600" />;
    if (name.includes('random') || name.includes('fun'))
      return <MessageCircle className="h-4 w-4 text-gray-600" />;
    if (name.includes('announce') || name.includes('news'))
      return <Bell className="h-4 w-4 text-gray-600" />;
    if (name.includes('help') || name.includes('support'))
      return <HelpCircle className="h-4 w-4 text-gray-600" />;
    if (name.includes('dev') || name.includes('development'))
      return <Users className="h-4 w-4 text-gray-600" />;
    return <Hash className="h-4 w-4 text-gray-600" />;
  };

  // Sort conversations: pinned first, then by updated_at
  let sortedConversations = (conversations || []).sort((a, b) => {
    // Pinned conversations first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;

    // Then by updated_at
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  // Apply filters
  if (showPinnedOnly) {
    sortedConversations = sortedConversations.filter(c => c.is_pinned);
  }
  if (hideMuted) {
    sortedConversations = sortedConversations.filter((c: any) => !c.is_muted);
  }

  const pinnedConversations = sortedConversations.filter(c => c.is_pinned);
  const unpinnedConversations = sortedConversations.filter(c => !c.is_pinned);
  const directConversations = unpinnedConversations.filter(
    conv => conv.type === 'direct'
  );
  const channelConversations = unpinnedConversations.filter(
    conv => conv.type === 'channel'
  );
  
  // Group channels by team for team display
  const teamChannels = teams.map(team => ({
    ...team,
    channels: channelConversations.filter(conv => conv.team_id === team.id)
  }));

  const timeAgo = (iso?: string) => {
    if (!iso) return '';
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diff = Math.max(0, Math.floor((now - then) / 1000));
    if (diff < 60) return 'just now';
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsUserSearchOpen(value.trim().length > 0);
  };

  const handleUserSelect = async (user: UserSearchResult) => {
    try {
      // Check if conversation already exists
      const existingConversation = conversations?.find(
        conv => conv.type === 'direct' && conv.other_member?.id === user.id
      );

      if (existingConversation) {
        // Use existing conversation
        onSelectConversation(existingConversation);
      } else {
        // Create new direct conversation
        try {
          console.log('Creating conversation for user:', user.id, user.name);
          const response = await apiService.createDirectConversation(
            user.id.toString()
          );
          const newConversation = (response as any).data;

          // Ensure the conversation has user info and members
          if (newConversation) {
            if (!newConversation.other_member) {
              newConversation.other_member = {
                id: user.id,
                name: user.name,
                username: (user as any).username || `user${user.id}`,
                avatar: user.avatar,
                is_online: user.status === 'online',
              };
            }

            // Ensure members array exists with both users
            if (
              !newConversation.members ||
              newConversation.members.length === 0
            ) {
              newConversation.members = [
                {
                  id: user.id,
                  name: user.name,
                  username: (user as any).username || `user${user.id}`,
                  avatar: user.avatar,
                  is_online: user.status === 'online',
                },
              ];
            }

            newConversation.user_name = user.name;
            newConversation.participant_name = user.name;
          }

          // Add to conversations list so it appears in sidebar
          onAddConversation?.(newConversation);
          onSelectConversation(newConversation);
        } catch (error) {
          console.error('Error creating conversation:', error);
          // Fallback: create temporary conversation object and add to list
          const directConversation: Conversation = {
            id: user.id,
            type: 'direct',
            title: user.name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            other_member: {
              id: user.id,
              name: user.name,
              email: (user as any).email || '',
              username: (user as any).username
                ? String((user as any).username)
                : `user${user.id}`,
              avatar: user.avatar || undefined,
              is_online: user.status === 'online',
            } as unknown as User,
            members: [
              {
                id: user.id,
                name: user.name,
                email: (user as any).email || '',
                username: (user as any).username
                  ? String((user as any).username)
                  : `user${user.id}`,
                avatar: user.avatar || undefined,
                is_online: user.status === 'online',
              } as unknown as User,
            ],
            unread_count: 0,
            // Add extra fields for fallback
            user_name: user.name,
            participant_name: user.name,
          } as any;
          // Add to conversations list so it appears in sidebar
          onAddConversation?.(directConversation);
          onSelectConversation(directConversation);
        }
      }

      setSearchQuery('');
      setIsUserSearchOpen(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Fallback: create temporary conversation object and add to list
      const directConversation: Conversation = {
        id: user.id,
        type: 'direct',
        title: user.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        other_member: {
          id: user.id,
          name: user.name,
          email: (user as any).email || '',
          username: (user as any).username
            ? String((user as any).username)
            : `user${user.id}`,
          avatar: user.avatar || undefined,
          is_online: user.status === 'online',
        } as unknown as User,
        members: [
          {
            id: user.id,
            name: user.name,
            email: (user as any).email || '',
            username: (user as any).username
              ? String((user as any).username)
              : `user${user.id}`,
            avatar: user.avatar || undefined,
            is_online: user.status === 'online',
          } as unknown as User,
        ],
        unread_count: 0,
        // Add extra fields for fallback
        user_name: user.name,
        participant_name: user.name,
      } as any;
      // Add to conversations list so it appears in sidebar
      onAddConversation?.(directConversation);
      onSelectConversation(directConversation);
      setSearchQuery('');
      setIsUserSearchOpen(false);
    }
  };

  const handleSearchInputFocus = () => {
    if (searchQuery.trim().length > 0) {
      setIsUserSearchOpen(true);
    }
  };

  const handleSearchInputBlur = () => {
    // Delay closing to allow for dropdown clicks
    setTimeout(() => {
      setIsUserSearchOpen(false);
    }, 150);
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [openBookmarks, setOpenBookmarks] = useState(false);

  const toggleTeamCollapse = (teamId: number) => {
    const newCollapsed = new Set(collapsedTeams);
    if (newCollapsed.has(teamId)) {
      newCollapsed.delete(teamId);
    } else {
      newCollapsed.add(teamId);
    }
    setCollapsedTeams(newCollapsed);
  };

  const toggleChannelCollapse = (channelId: number) => {
    const newCollapsed = new Set(collapsedChannels);
    if (newCollapsed.has(channelId)) {
      newCollapsed.delete(channelId);
    } else {
      newCollapsed.add(channelId);
    }
    setCollapsedChannels(newCollapsed);
  };

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 relative">
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <div className="relative">
                <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full opacity-80"></div>
                <div className="absolute top-2 left-2 w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
          </div>
          <span className="text-xs font-semibold text-gray-600">Nova</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-800"
            aria-label="Bookmarks"
            onClick={() => {
              if (!openBookmarks) {
                setOpenBookmarks(true);
                console.log('Set openBookmarks to true');
              }
            }}
          >
            <BookmarkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-800"
            aria-label="Notifications"
            onClick={() => setShowNotifications(v => !v)}
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-800"
            aria-label="Help"
          >
            <a href="https://example.com/help" target="_blank" rel="noreferrer">
              <HelpCircle className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {showNotifications && (
          <div className="absolute right-4 top-14 w-72 bg-white border border-gray-100 shadow-xl rounded-md overflow-hidden z-20">
            <div className="px-3 py-2 border-b text-sm font-semibold">
              {t('notifications')}
            </div>
            <div className="max-h-64 overflow-auto divide-y">
              <div className="px-3 py-2 text-sm text-gray-600">
                {t('no_notifications')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search + Mentions */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder={t('search_messages')}
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={handleSearchInputFocus}
              onBlur={handleSearchInputBlur}
              className="pl-10 h-9 bg-gray-50 border-gray-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm text-gray-700 placeholder-gray-500 transition-all duration-200"
              style={{
                border: '1px solid #e5e7eb',
                boxShadow: 'none',
              }}
            />
            <UserSearchDropdown
              isOpen={isUserSearchOpen}
              onClose={() => setIsUserSearchOpen(false)}
              onUserSelect={handleUserSelect}
              searchQuery={searchQuery}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="h-9 relative"
            onClick={() => router.push('/mentions')}
          >
            @ Mentions
            {mentionsCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                {mentionsCount > 99 ? '99+' : mentionsCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 bg-white">
        <button
          className={cn(
            'text-xs px-2 h-7 rounded-full border',
            showPinnedOnly
              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          )}
          onClick={() => setShowPinnedOnly(v => !v)}
          title="Show pinned only"
        >
          Pinned
        </button>
        <button
          className={cn(
            'text-xs px-2 h-7 rounded-full border',
            hideMuted
              ? 'bg-gray-200 border-gray-300 text-gray-800'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          )}
          onClick={() => setHideMuted(v => !v)}
          title="Hide muted"
        >
          Hide muted
        </button>
      </div>

      {/* Pinned Conversations */}
      {pinnedConversations.length > 0 && !showPinnedOnly && (
        <div className="px-3 py-2 border-b border-gray-100 bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <svg
              className="h-4 w-4 text-yellow-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" />
            </svg>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Pinned
            </span>
          </div>
          <div className="space-y-1">
            {pinnedConversations.map(conversation => (
              <button
                key={`pinned-${conversation.id}`}
                onClick={() => onSelectConversation(conversation)}
                className={cn(
                  'flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-all duration-200 group',
                  currentConversation?.id === conversation.id &&
                    'bg-gray-50 border border-gray-200'
                )}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="h-8 w-8 flex items-center justify-center bg-yellow-50 rounded-lg">
                    <svg
                      className="h-4 w-4 text-yellow-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title ||
                        conversation.name ||
                        'Conversation'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.type}
                    </p>
                  </div>
                </div>
                {(conversation.unread_count ?? 0) > 0 &&
                  !(conversation as any).is_muted && (
                    <Badge className="bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 h-4 min-w-[16px] flex items-center justify-center">
                      {conversation.unread_count}
                    </Badge>
                  )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-3 space-y-6 min-w-0">
          {/* Teams */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Teams
                </span>
              </div>
              <button
                onClick={() => setShowCreateTeamModal(true)}
                className="h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                title={t('create_team')}
              >
                <svg
                  className="h-3 w-3 text-gray-600"
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
              </button>
            </div>
            <div className="space-y-1">
              {teamChannels.map(team => (
                <div key={`team-${team.id}`} className="space-y-1">
                  {/* Team Header */}
                  <div className="flex items-center space-x-2 px-2 py-1 pr-4">
                    <button
                      onClick={() => toggleTeamCollapse(team.id)}
                      className="flex items-center space-x-2 flex-1 min-w-0 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors text-left"
                    >
                      <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Users className="h-3 w-3 text-white" />
                      </div>
                      <span 
                        className="text-sm font-medium text-gray-700 flex-1 min-w-0"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={team.name}
                      >
                        {team.name.length > 25 ? team.name.substring(0, 25) + '...' : team.name}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({team.channels.length})
                      </span>
                      {collapsedTeams.has(team.id) ? (
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                  </div>
                  
                  {/* Team Channels */}
                  {!collapsedTeams.has(team.id) && team.channels.map(channel => (
                    <button
                      key={`channel-${channel.id}`}
                      onClick={() => onSelectConversation(channel)}
                      className={cn(
                        'flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg px-3 py-2 ml-4 mr-1 transition-all duration-200 group min-w-0',
                        currentConversation?.id === channel.id &&
                          'bg-gray-50 border border-gray-200'
                      )}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-gray-600">#</span>
                        </div>
                        <div className="flex-1 min-w-0" style={{ overflow: 'hidden' }}>
                        <p 
                          className="text-sm font-medium text-gray-900"
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={channel.name || channel.title || 'Channel'}
                        >
                          {(channel.name || channel.title || 'Channel').length > 25 
                            ? (channel.name || channel.title || 'Channel').substring(0, 25) + '...' 
                            : (channel.name || channel.title || 'Channel')}
                        </p>
                        <p 
                          className="text-xs text-gray-500"
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Channel
                        </p>
                        </div>
                      </div>
                      {(channel.unread_count || 0) > 0 &&
                        !(channel as any).is_muted && (
                          <div className="h-5 min-w-5 px-2 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-white">
                              {(channel.unread_count || 0) > 99
                                ? '99+'
                                : channel.unread_count}
                            </span>
                          </div>
                        )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => toggleChannelCollapse(0)} // Use 0 as special ID for channels section
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors text-left"
              >
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('channels')}
                </span>
                {collapsedChannels.has(0) ? (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setShowCreateChannelModal(true)}
                className="h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                title={t('create_channel')}
              >
                <svg
                  className="h-3 w-3 text-gray-600"
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
              </button>
            </div>
            {!collapsedChannels.has(0) && (
              <div className="space-y-1">
                {channelConversations.map(conversation => (
                <button
                  key={`channel-${conversation.id}`}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    'flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg px-3 py-2 mr-2 transition-all duration-200 group min-w-0',
                    currentConversation?.id === conversation.id &&
                      'bg-gray-50 border border-gray-200'
                  )}
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="h-8 w-8 flex items-center justify-center bg-gray-100 rounded-lg">
                      {getChannelIcon(conversation.title || '')}
                    </div>
                    <div className="flex-1 min-w-0" style={{ overflow: 'hidden' }}>
                      <span 
                        className="text-sm font-medium text-gray-800 group-hover:text-blue-600 block"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={conversation.title}
                      >
                        {(conversation.title || '').length > 25 
                          ? (conversation.title || '').substring(0, 25) + '...' 
                          : (conversation.title || '')}
                      </span>
                      <p 
                        className="text-xs text-gray-500"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Channel
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mr-1">
                    {(conversation.unread_count ?? 0) > 0 &&
                      !(conversation as any).is_muted && (
                        <Badge className="bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 h-4 min-w-[16px] flex items-center justify-center">
                          {conversation.unread_count}
                        </Badge>
                      )}
                  </div>
                </button>
                ))}
              </div>
            )}
          </div>

          {/* Direct Messages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('direct_messages')}
                </span>
              </div>
              <button
                onClick={() => setShowCreateDirectModal(true)}
                className="h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                title="Start new conversation"
              >
                <svg
                  className="h-3 w-3 text-gray-600"
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
              </button>
            </div>
            <div className="space-y-1">
              {directConversations.map(conversation => {
                const otherUser =
                  conversation.other_member ||
                  conversation.members?.find(
                    member => member.id !== currentUser?.id
                  );

                // Fallback: if no other_member, try to get name from conversation data
                const displayName =
                  otherUser?.name ||
                  (conversation as any).user_name ||
                  (conversation as any).participant_name ||
                  conversation.title ||
                  'Unknown User';

                return (
                  <motion.button
                    key={`direct-${conversation.id}`}
                    onClick={() => onSelectConversation(conversation)}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    className={cn(
                      'flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg px-3 py-2 mr-2 transition-all duration-200 group min-w-0',
                      currentConversation?.id === conversation.id &&
                        'bg-gray-50 border border-gray-200'
                    )}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="relative">
                        <CustomAvatar 
                          src={otherUser?.avatar} 
                          name={otherUser?.name || 'U'}
                          size="md"
                        />
                        {/* Online/Offline indicator */}
                        <UserOnlineStatus
                          userId={otherUser?.id || 0}
                          isOnline={
                            otherUser?.id
                              ? onlineUserIds.has(otherUser.id)
                              : false
                          }
                          className="absolute -bottom-0.5 -right-0.5"
                        />
                      </div>
                      <div className="flex-1 min-w-0" style={{ overflow: 'hidden' }}>
                        <div className="flex items-center space-x-1">
                          {conversation.is_pinned && (
                            <svg
                              className="h-3 w-3 text-yellow-500 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" />
                            </svg>
                          )}
                          <p 
                            className="text-sm font-medium text-gray-800 group-hover:text-blue-600"
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={displayName}
                          >
                            {displayName.length > 25 
                              ? displayName.substring(0, 25) + '...' 
                              : displayName}
                          </p>
                        </div>
                        {conversation.last_message && (
                          <p
                            className="text-xs text-gray-500 truncate max-w-[180px]"
                            title={conversation.last_message.content}
                          >
                            {conversation.last_message.content.length > 25
                              ? `${conversation.last_message.content.substring(0, 25)}...`
                              : conversation.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-0.5 mr-1">
                      <span className="text-xs text-gray-400">
                        {timeAgo(
                          conversation.last_message?.updated_at ||
                            conversation.last_message?.created_at ||
                            conversation.updated_at
                        )}
                      </span>
                      {(conversation.unread_count ?? 0) > 0 &&
                        !(conversation as any).is_muted && (
                          <Badge className="bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 h-4 min-w-[16px] flex items-center justify-center">
                            {conversation.unread_count}
                          </Badge>
                        )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile Section */}
      {currentUser && (
        <>
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <CustomAvatar 
                  src={currentUser.avatar} 
                  name={currentUser.name || 'U'}
                  size="lg"
                />
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {currentUser.name || 'Unknown User'}
                </p>
                <p className="text-xs text-gray-500">{t('online')}</p>
              </div>
              <div className="flex items-center gap-1">
                {/* Admin button - only show for admin users */}
                {(currentUser.role === 'admin' ||
                  currentUser.role === 'super_admin') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-purple-100 text-purple-600 hover:text-purple-800"
                    onClick={() => router.push('/admin')}
                    title="Admin Panel"
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                  onClick={() => setOpenSettings(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <LogoutButton className="h-8 w-8 p-0 hover:bg-red-100 text-gray-600 hover:text-red-600">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </LogoutButton>
              </div>
            </div>
          </div>
          <SettingsModal
            open={openSettings}
            onClose={() => setOpenSettings(false)}
          />

          {/* Create Team Modal */}
          <CreateTeamModal
            isOpen={showCreateTeamModal}
            onClose={() => setShowCreateTeamModal(false)}
            onTeamCreated={team => {
              console.log('Team created:', team);
              // TODO: Add team to teams list
            }}
          />

          {/* Create Channel Modal */}
          <CreateChannelModal
            isOpen={showCreateChannelModal}
            onClose={() => setShowCreateChannelModal(false)}
            onChannelCreated={channel => {
              console.log('Channel created:', channel);
              // TODO: Add channel to conversations list
            }}
            teams={teams}
          />

          {/* Create Direct Conversation Modal */}
          <CreateDirectModal
            isOpen={showCreateDirectModal}
            onClose={() => setShowCreateDirectModal(false)}
            onConversationCreated={conversation => {
              console.log('Direct conversation created:', conversation);
              onAddConversation?.(conversation);
            }}
          />

          {/* Add Member Modal */}
          <AddMemberModal
            isOpen={showAddMemberModal}
            onClose={() => setShowAddMemberModal(false)}
            onMemberAdded={members => {
              console.log('Members added:', members);
              // TODO: Refresh team/channel data
            }}
            type={addMemberType}
            teamId={addMemberType === 'team' ? addMemberTargetId : undefined}
            channelId={
              addMemberType === 'channel' ? addMemberTargetId : undefined
            }
            existingMembers={[]} // TODO: Get existing members
          />

          {/* Bookmark modal - simplified */}
          {openBookmarks && (
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center"
              style={{ zIndex: 99999 }}
              onClick={() => setOpenBookmarks(false)}
            >
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center space-x-2">
                    <BookmarkIcon className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-lg font-semibold">Bookmarks</h2>
                  </div>
                  <button
                    onClick={() => setOpenBookmarks(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto p-6">
                    <BookmarkList />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
