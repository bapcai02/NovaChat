import React from 'react';
import { cn } from '@/lib/utils';

interface UserOnlineStatusProps {
  userId: number;
  isOnline: boolean;
  className?: string;
}

export const UserOnlineStatus: React.FC<UserOnlineStatusProps> = ({
  isOnline,
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all duration-200',
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        )}
        title={isOnline ? 'Online' : 'Offline'}
      />
      {isOnline && (
        <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
      )}
    </div>
  );
};

export default UserOnlineStatus;
