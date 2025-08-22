import React from 'react'

const users = [
  { id: 1, name: 'John Doe', status: 'online', role: 'admin' },
  { id: 2, name: 'Jane Smith', status: 'away', role: 'moderator' },
  { id: 3, name: 'Bob Johnson', status: 'offline', role: 'user' },
  { id: 4, name: 'Alice Brown', status: 'online', role: 'user' },
  { id: 5, name: 'Charlie Wilson', status: 'dnd', role: 'user' },
]

export function UserList() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'dnd': return 'bg-red-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online'
      case 'away': return 'Away'
      case 'dnd': return 'Do Not Disturb'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Online — {users.filter(u => u.status === 'online').length}</h3>
      </div>
      
      <div className="space-y-1">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center px-2 py-1 rounded cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white group"
          >
            <div className="relative">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-gray-800`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <span className="text-sm truncate">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="ml-1 text-red-400 text-xs">👑</span>
                )}
                {user.role === 'moderator' && (
                  <span className="ml-1 text-blue-400 text-xs">🛡️</span>
                )}
              </div>
              <div className="text-xs text-gray-400 truncate">{getStatusText(user.status)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
