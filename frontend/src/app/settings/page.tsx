"use client"

import React, { useEffect, useState } from 'react'
import { userSettingsService } from '@/services/userSettingsService'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import BookmarkList from '@/components/bookmarks/BookmarkList'

type TabKey = 'profile' | 'security' | 'language' | 'sessions' | 'bookmarks'

export default function SettingsPage() {
  const [active, setActive] = useState<TabKey>('profile')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Profile
  const [userId, setUserId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState('')

  // Security
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('')

  // Language
  const [language, setLanguage] = useState<'EN' | 'VI'>('EN')

  // Sessions
  const [sessions, setSessions] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      try {
        const profile = await userSettingsService.getProfile()
        setUserId(profile?.id ?? null)
        setName(profile?.name || '')
        setEmail(profile?.email || '')
        setPhone(profile?.phone || '')
        setAvatar(profile?.avatar || '')
        const sess = await userSettingsService.getSessions()
        setSessions(sess)
      } catch {}
    })()
  }, [])

  const submitProfile = async () => {
    try {
      setLoading(true)
      const form = new FormData()
      if (userId != null) form.append('id', String(userId))
      if (avatar) form.append('avatar', avatar)
      if (name) form.append('name', name)
      if (email) form.append('email', email)
      if (phone) form.append('phone', phone)
      await userSettingsService.updateProfile(form as any)
      setToast('Profile updated')
      setTimeout(() => setToast(null), 2000)
    } finally { setLoading(false) }
  }

  const submitPassword = async () => {
    try {
      setLoading(true)
      await userSettingsService.changePassword({ current_password: currentPassword, new_password: newPassword, new_password_confirmation: newPasswordConfirmation })
      setToast('Password changed')
      setCurrentPassword(''); setNewPassword(''); setNewPasswordConfirmation('')
      setTimeout(() => setToast(null), 2000)
    } finally { setLoading(false) }
  }

  const submitLanguage = async () => {
    try {
      setLoading(true)
      await userSettingsService.updatePreferences({ language })
      setToast('Language saved')
      setTimeout(() => setToast(null), 2000)
    } finally { setLoading(false) }
  }

  const revokeSession = async (id: number) => {
    await userSettingsService.deleteSession(id)
    setSessions(prev => prev.filter(s => s.id !== id))
    setToast('Session revoked')
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      {toast && (<div className="mb-4 text-sm bg-green-50 text-green-700 px-3 py-2 rounded">{toast}</div>)}

      <div className="flex gap-2 mb-6">
        {(['profile','security','language','sessions','bookmarks'] as TabKey[]).map(tab => (
          <button key={tab} onClick={() => setActive(tab)} className={`px-3 py-1.5 text-sm rounded ${active===tab?'bg-gray-600 text-white':'bg-gray-100 text-gray-700'}`}>{tab[0].toUpperCase()+tab.slice(1)}</button>
        ))}
      </div>

      {active==='profile' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Avatar URL</label>
            <Input value={avatar} onChange={e=>setAvatar(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <Input value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <Input value={phone} onChange={e=>setPhone(e.target.value)} />
          </div>
          <Button disabled={loading} onClick={submitProfile}>Save</Button>
        </div>
      )}

      {active==='security' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Current password</label>
            <Input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">New password</label>
            <Input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm new password</label>
            <Input type="password" value={newPasswordConfirmation} onChange={e=>setNewPasswordConfirmation(e.target.value)} />
          </div>
          <Button disabled={loading} onClick={submitPassword}>Change password</Button>
        </div>
      )}

      {active==='language' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Language</label>
            <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" value={language} onChange={e=>setLanguage(e.target.value as 'EN'|'VI')}>
              <option value="EN">English</option>
              <option value="VI">Vietnamese</option>
            </select>
          </div>
          <Button disabled={loading} onClick={submitLanguage}>Save</Button>
        </div>
      )}

      {active==='sessions' && (
        <div className="space-y-3">
          {sessions.length === 0 && <div className="text-sm text-gray-500">No active sessions</div>}
          {sessions.map(s => (
            <div key={s.id} className="flex items-center justify-between border rounded px-3 py-2 text-sm">
              <div>
                <div className="font-medium">{s.device_info || 'Unknown device'}</div>
                <div className="text-gray-500">{s.ip_address || 'N/A'} · {s.last_active ? new Date(s.last_active).toLocaleString() : 'N/A'}</div>
              </div>
              <Button variant="ghost" onClick={()=>revokeSession(s.id)}>Logout</Button>
            </div>
          ))}
        </div>
      )}

      {active==='bookmarks' && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Bookmarks</h2>
            <p className="text-sm text-gray-600">Quản lý các tin nhắn đã bookmark</p>
          </div>
          <BookmarkList />
        </div>
      )}
    </div>
  )
}


