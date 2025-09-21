import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, X } from 'lucide-react';
import { apiService } from '@/services/api';

interface CreateDirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated?: (conversation: any) => void;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  is_online?: boolean;
}

const CreateDirectModal: React.FC<CreateDirectModalProps> = ({
  isOpen,
  onClose,
  onConversationCreated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
    }
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.searchUsers(query);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setSearchResults([]);
  };

  const handleCreateConversation = async () => {
    if (!selectedUser) return;

    setIsCreating(true);
    try {
      const response = await apiService.createDirectConversation(selectedUser.id.toString());
      onConversationCreated?.(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveSelected = () => {
    setSelectedUser(null);
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-10"
            />
          </div>

          {/* Selected User */}
          {selectedUser && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500">@{selectedUser.username}</p>
                </div>
              </div>
              <button
                onClick={handleRemoveSelected}
                className="p-1 hover:bg-blue-100 rounded-full"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && !selectedUser && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                  {user.is_online && (
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Searching users...</p>
            </div>
          )}

          {/* No Results */}
          {searchQuery.length >= 2 && searchResults.length === 0 && !isLoading && !selectedUser && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No users found</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={!selectedUser || isCreating}
            >
              {isCreating ? 'Creating...' : 'Start Conversation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDirectModal;
