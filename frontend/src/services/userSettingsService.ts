import { apiService } from '@/services/api'

export const userSettingsService = {
  async getProfile() {
    const res: any = await apiService.get('/user/profile')
    return res?.data?.data ?? res?.data ?? res
  },
  async updateProfile(payload: { name?: string; email?: string; phone?: string; avatar?: string }) {
    const res: any = await apiService.put('/user/profile', payload)
    return res?.data?.data ?? res?.data ?? res
  },
  async changePassword(payload: { current_password: string; new_password: string; new_password_confirmation: string }) {
    const res: any = await apiService.post('/user/change-password', payload)
    return res?.data
  },
  async updatePreferences(payload: { language: 'EN' | 'VI' }) {
    const res: any = await apiService.put('/user/preferences', payload)
    return res?.data
  },
  async getSessions() {
    const res: any = await apiService.get('/user/sessions')
    return res?.data?.data ?? []
  },
  async deleteSession(id: number) {
    const res: any = await apiService.delete(`/user/sessions/${id}`)
    return res?.data
  }
}


