'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { apiService } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated?: (team: any) => void;
}

export default function CreateTeamModal({
  isOpen,
  onClose,
  onTeamCreated,
}: CreateTeamModalProps) {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Basic info, 2: Add members
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_private: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  // Load users when step 2 is reached
  useEffect(() => {
    if (currentStep === 2 && users.length === 0) {
      loadUsers();
    }
  }, [currentStep]);

  const loadUsers = async () => {
    try {
      // Mock data for now
      setUsers([
        {
          id: 1,
          name: 'John Doe',
          username: 'john',
          avatar:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
          email: 'john@example.com',
        },
        {
          id: 2,
          name: 'Jane Smith',
          username: 'jane',
          avatar:
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
          email: 'jane@example.com',
        },
        {
          id: 3,
          name: 'Bob Wilson',
          username: 'bob',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
          email: 'bob@example.com',
        },
        {
          id: 4,
          name: 'Alice Brown',
          username: 'alice',
          avatar:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
          email: 'alice@example.com',
        },
      ]);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleUserSelect = (user: any) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.name.trim()) {
      setCurrentStep(2);
    }
  };

  const canProceedToStep2 = () => {
    return formData.name.trim().length > 0;
  };

  const canCreateTeam = () => {
    return selectedUsers.length > 0;
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      // Create team first
      const response = await apiService.createTeam({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        is_private: formData.is_private,
        members: selectedUsers.map(user => user.id),
      });

      if (response?.data?.data) {
        const team = response.data.data;

        onTeamCreated?.(team);
        onClose();
        setFormData({ name: '', description: '', is_private: false });
        setSelectedUsers([]);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Failed to create team:', error);
      alert('Có lỗi xảy ra khi tạo nhóm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('create_team')}
                </h2>
                <p className="text-sm text-gray-500">Tạo nhóm làm việc mới</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="px-6 pt-4">
            <div className="flex items-center space-x-2">
              <div
                className={`h-2 w-2 rounded-full ${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`}
              />
              <div
                className={`h-2 flex-1 rounded-full ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Thông tin cơ bản</span>
              <span>Thêm thành viên</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {currentStep === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">{t('name')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="Tên nhóm"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Mô tả về nhóm (tùy chọn)"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="private">Nhóm riêng tư</Label>
                    <p className="text-xs text-gray-500">
                      Chỉ thành viên được mời mới có thể tham gia
                    </p>
                  </div>
                  <Switch
                    id="private"
                    checked={formData.is_private}
                    onCheckedChange={checked =>
                      handleInputChange('is_private', checked)
                    }
                    disabled={isLoading}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Selected users */}
                {selectedUsers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Đã chọn ({selectedUsers.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map(user => (
                        <Badge
                          key={user.id}
                          variant="secondary"
                          className="flex items-center space-x-2 px-2 py-1"
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                          <button
                            onClick={() => handleUserSelect(user)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validation message */}
                {selectedUsers.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="h-4 w-4 text-yellow-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-yellow-800">
                        Vui lòng chọn ít nhất 1 thành viên để tạo nhóm
                      </span>
                    </div>
                  </div>
                )}

                {/* Users list */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Người dùng có sẵn
                    </span>
                  </div>
                  <ScrollArea className="h-48">
                    <div className="space-y-1">
                      {filteredUsers.map(user => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleUserSelect(user)}
                          className={`w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                            selectedUsers.some(u => u.id === user.id)
                              ? 'bg-blue-50 border border-blue-200'
                              : ''
                          }`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{user.username}
                            </p>
                          </div>
                          {selectedUsers.some(u => u.id === user.id) && (
                            <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                              <X className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          Không tìm thấy người dùng nào
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? onClose : handleBack}
                disabled={isLoading}
                className="flex-1"
              >
                {currentStep === 1 ? 'Hủy' : 'Quay lại'}
              </Button>
              {currentStep === 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceedToStep2()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Tiếp theo
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || !canCreateTeam()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isLoading ? 'Đang tạo...' : 'Tạo nhóm'}
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
