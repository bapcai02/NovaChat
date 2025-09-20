'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminService, User, AdminStats } from '@/services/adminService';
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  BarChart3,
  Ban,
  UserCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banningUser, setBanningUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'user' as 'admin' | 'moderator' | 'user' | 'guest',
    status: 'active' as 'active' | 'inactive' | 'suspended' | 'banned',
    phone: '',
    bio: '',
    is_verified: false,
    is_premium: false,
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getUsers({
        page: currentPage,
        limit: 20,
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
      });

      setUsers(response.data);
      setTotalPages(response.pagination.last_page);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminService.getStats();
      setStats(response);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Fallback to avoid infinite spinner if requests hang
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setHasTimedOut(true);
      setLoading(false);
      setError(prev => prev || 'Request timed out. Please try again.');
    }, 15000);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleRetry = () => {
    setError(null);
    setHasTimedOut(false);
    setLoading(true);
    Promise.all([loadUsers(), loadStats()]).finally(() => {
      // loadUsers has its own finally to set loading=false; ensure no double flip
    });
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      role: 'user',
      status: 'active',
      phone: '',
      bio: '',
      is_verified: false,
      is_premium: false,
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username || '',
      password: '',
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      bio: user.bio || '',
      is_verified: user.is_verified,
      is_premium: user.is_premium,
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await adminService.updateUser(editingUser.id, updateData);
      } else {
        // Create user
        await adminService.createUser(formData);
      }
      setShowUserModal(false);
      loadUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user');
    }
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      await adminService.deleteUser(deletingUser.id);
      setShowDeleteModal(false);
      setDeletingUser(null);
      loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const handleBanUser = (user: User) => {
    setBanningUser(user);
    setBanReason('');
    setShowBanModal(true);
  };

  const handleUnbanUser = async (user: User) => {
    try {
      await adminService.unbanUser(user.id);
      loadUsers();
    } catch (err) {
      console.error('Error unbanning user:', err);
      setError('Failed to unban user');
    }
  };

  const handleConfirmBan = async () => {
    if (!banningUser) return;

    try {
      await adminService.banUser(banningUser.id, banReason);
      setShowBanModal(false);
      setBanningUser(null);
      setBanReason('');
      loadUsers();
    } catch (err) {
      console.error('Error banning user:', err);
      setError('Failed to ban user');
    }
  };

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [currentPage, searchQuery, roleFilter, statusFilter]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      case 'guest':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Users are already filtered by API, so we just use them directly
  const filteredUsers = users;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || hasTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Không thể tải dữ liệu
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {error || 'Đã quá thời gian chờ, vui lòng thử lại.'}
          </p>
          <Button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-700">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/reports')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button onClick={() => router.push('/chat')}>Back to Chat</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-700">
                  {stats?.total_users || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Online Users
                </p>
                <p className="text-2xl font-bold text-gray-700">
                  {stats?.online_users || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-gray-700">
                  {stats?.admins || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <EyeOff className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Suspended</p>
                <p className="text-2xl font-bold text-gray-700">
                  {stats?.suspended || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="user">User</option>
                  <option value="guest">Guest</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
                <Button
                  onClick={handleCreateUser}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Seen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {user.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-700">
                              {user.name}
                            </p>
                            {user.is_verified && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                Verified
                              </Badge>
                            )}
                            {user.is_premium && (
                              <Badge
                                variant="default"
                                className="ml-2 text-xs bg-yellow-500"
                              >
                                Premium
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          {user.username && (
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleColor(user.role)} hover:opacity-80`}
                      >
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(user.status)} hover:opacity-80`}
                        >
                          {user.status.toUpperCase()}
                        </span>
                        {user.is_online && (
                          <div className="ml-2 h-2 w-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_seen_at ? (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(user.last_seen_at).toLocaleDateString()}
                        </div>
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          {user.status === 'banned' ? (
                            <DropdownMenuItem
                              onClick={() => handleUnbanUser(user)}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleBanUser(user)}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {filteredUsers.length} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                {editingUser ? 'Edit User' : 'Create User'}
              </h2>
              <Button variant="ghost" onClick={() => setShowUserModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Input
                  value={formData.username}
                  onChange={e =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={e =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingUser
                      ? 'Leave blank to keep current'
                      : 'Enter password'
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={e =>
                      setFormData({ ...formData, role: e.target.value as any })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={e =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Enter bio"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        is_verified: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Verified</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_premium}
                    onChange={e =>
                      setFormData({ ...formData, is_premium: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Premium</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowUserModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveUser}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && banningUser && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Ban User</h2>
              <Button variant="ghost" onClick={() => setShowBanModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to ban <strong>{banningUser.name}</strong>
                ?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (optional)
                </label>
                <textarea
                  value={banReason}
                  onChange={e => setBanReason(e.target.value)}
                  placeholder="Enter ban reason"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowBanModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBan}
                className="bg-red-600 hover:bg-red-700"
              >
                Ban User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingUser && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Delete User
              </h2>
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to delete{' '}
                <strong>{deletingUser.name}</strong>?
              </p>
              <p className="text-xs text-red-600">
                This action cannot be undone. All data associated with this user
                will be permanently deleted.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
