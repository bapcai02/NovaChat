import React from 'react'

const channels = [
  { id: 1, name: 'general', type: 'public', unread: 0 },
  { id: 2, name: 'random', type: 'public', unread: 3 },
  { id: 3, name: 'announcements', type: 'announcement', unread: 0 },
  { id: 4, name: 'development', type: 'public', unread: 0 },
  { id: 5, name: 'marketing', type: 'public', unread: 1 },
  { id: 6, name: 'support', type: 'support', unread: 0 },
]

export function ChannelList() {
  return (
    <div className="p-3">
      {/* Channel Categories */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Channels</h3>
          <button className="text-gray-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-1">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`flex items-center px-2 py-1 rounded cursor-pointer group ${
                channel.name === 'general' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-gray-400 mr-2 text-sm">
                {channel.type === 'announcement' ? '📢' : 
                 channel.type === 'support' ? '🆘' : '#'}
              </span>
              <span className="flex-1 text-sm truncate">{channel.name}</span>
              {channel.unread > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {channel.unread}
                </span>
              )}
              <button className="opacity-0 group-hover:opacity-100 ml-1 text-gray-400 hover:text-white">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Direct Messages */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Direct Messages</h3>
          <button className="text-gray-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center px-2 py-1 rounded cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white group">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2 relative">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="flex-1 text-sm truncate">John Doe</span>
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">2</span>
          </div>
          
          <div className="flex items-center px-2 py-1 rounded cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white group">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span className="flex-1 text-sm truncate">Jane Smith</span>
          </div>
          
          <div className="flex items-center px-2 py-1 rounded cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white group">
            <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
            <span className="flex-1 text-sm truncate">Bob Johnson</span>
          </div>
        </div>
      </div>
    </div>
  )
}
