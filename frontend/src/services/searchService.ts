export interface SearchResult {
  id: string
  name: string
  type: 'user' | 'team' | 'channel'
  description?: string
  avatar?: string
  isOnline?: boolean
  memberCount?: number
  unreadCount?: number
}

class SearchService {
  private baseUrl = 'http://localhost:8000/api'

  async searchUsers(query: string): Promise<SearchResult[]> {
    try {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        return this.getMockUsers(query)
      }
      
      const response = await fetch(`${this.baseUrl}/users/search?keyword=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('User search failed')
      }

      const data = await response.json()
      
      const results = data.data.map((user: any) => ({
        id: user.id.toString(),
        name: user.name,
        type: 'user' as const,
        description: user.email || 'User',
        avatar: user.avatar,
        isOnline: user.status
      }))
      
      return results
    } catch (error) {
      console.error('Error searching users:', error)
      return this.getMockUsers(query)
    }
  }

  private getMockUsers(query: string): SearchResult[] {
    const mockUsers: SearchResult[] = [
      {
        id: '1',
        name: 'John Doe',
        type: 'user',
        description: 'Software Engineer',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
        isOnline: true
      },
      {
        id: '2',
        name: 'Alice Johnson',
        type: 'user',
        description: 'Product Manager',
        avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=random',
        isOnline: false
      },
      {
        id: '3',
        name: 'Bob Wilson',
        type: 'user',
        description: 'Designer',
        avatar: 'https://ui-avatars.com/api/?name=Bob+Wilson&background=random',
        isOnline: true
      },
      {
        id: '4',
        name: 'Sarah Davis',
        type: 'user',
        description: 'Marketing Specialist',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Davis&background=random',
        isOnline: false
      },
      {
        id: '5',
        name: 'Tom Brown',
        type: 'user',
        description: 'DevOps Engineer',
        avatar: 'https://ui-avatars.com/api/?name=Tom+Brown&background=random',
        isOnline: true
      }
    ]

    if (!query.trim()) return mockUsers

    return mockUsers.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.description?.toLowerCase().includes(query.toLowerCase())
    )
  }
}

export const searchService = new SearchService()
