import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  MessageSquare, 
  Users, 
  Settings, 
  BarChart3, 
  FileText,
  Shield
} from 'lucide-react';

const Navigation: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">NovaChat</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              
              <Link 
                href="/chats" 
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chats</span>
              </Link>
              
              <Link 
                href="/users" 
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Users</span>
              </Link>
              
              <Link 
                href="/logs" 
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>My Logs</span>
              </Link>
              
              {user?.role === 'admin' && (
                <>
                  <Link 
                    href="/admin" 
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                  
                  <Link 
                    href="/admin/dashboard" 
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/settings" 
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
            
            {user && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Admin
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
