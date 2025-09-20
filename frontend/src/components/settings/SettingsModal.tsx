'use client';

import React, { useEffect, useState } from 'react';
import { userSettingsService } from '@/services/userSettingsService';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BookmarkList from '@/components/bookmarks/BookmarkList';

type TabKey = 'profile' | 'security' | 'language' | 'sessions' | 'bookmarks';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const [active, setActive] = useState<TabKey>('profile');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');

  const [language, setLanguage] = useState<'EN' | 'VI'>('EN');
  const [sessions, setSessions] = useState<any[]>([]);
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const profile = await userSettingsService.getProfile();
        setUserId(profile?.id ?? null);
        setName(profile?.name || '');
        setEmail(profile?.email || '');
        setPhone(profile?.phone || '');
        setAvatar(profile?.avatar || '');
        const sess = await userSettingsService.getSessions();
        setSessions(sess);
      } catch {}
    })();
  }, [open]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const submitProfile = async () => {
    try {
      setLoading(true);
      const form = new FormData();
      // Always send all fields, even if empty
      form.append('name', name || '');
      form.append('email', email || '');
      form.append('phone', phone || '');
      if (avatarFile) {
        form.append('avatar', avatarFile);
      } else if (avatar) {
        form.append('avatar', avatar);
      }
      console.log('Submitting profile data:', {
        name,
        email,
        phone,
        avatarFile: avatarFile?.name,
        avatar
      });
      await userSettingsService.updateProfile(form as any);
      notify(t('profile_updated'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setAvatarFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    } else {
      setAvatarPreview('');
    }
  };
  const submitPassword = async () => {
    try {
      setLoading(true);
      await userSettingsService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });
      notify(t('password_changed'));
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } finally {
      setLoading(false);
    }
  };
  const submitLanguage = async () => {
    try {
      setLoading(true);
      await userSettingsService.updatePreferences({ language });
      notify(t('language_saved'));
    } finally {
      setLoading(false);
    }
  };
  const revokeSession = async (id: number) => {
    await userSettingsService.deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    notify(t('session_revoked'));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-gray-600/40" onClick={onClose} />
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="w-[92%] max-w-3xl bg-white rounded-xl shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h2 className="text-lg font-semibold">{t('settings')}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          {toast && (
            <div className="px-5 py-2 text-sm bg-green-50 text-green-700">
              {toast}
            </div>
          )}

          <div className="px-5 pt-4 pb-5 grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <div className="flex flex-col gap-2">
                {(
                  [
                    'profile',
                    'security',
                    'language',
                    'sessions',
                    'bookmarks',
                  ] as TabKey[]
                ).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActive(tab)}
                    className={`px-3 py-2 text-sm rounded text-left ${
                      active === tab
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {t(tab)}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-9">
              {active === 'profile' && (
                <div className="space-y-4">
                  <div className="space-y-2 flex flex-col items-center">
                    <label className="block text-sm mb-1 text-center">
                      {t('avatar')}
                    </label>
                    <input
                      id="avatar-input"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-input" className="inline-block">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border cursor-pointer group">
                        {avatarPreview || avatar ? (
                          <img
                            src={avatarPreview || avatar}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                            {t('add')}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gray-600/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-1 right-1 px-2 py-0.5 text-[11px] rounded-full bg-white/90 text-gray-700 border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          {t('edit')}
                        </div>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{t('name')}</label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t('ph_name')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{t('email')}</label>
                    <Input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('ph_email')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{t('phone')}</label>
                    <Input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder={t('ph_phone')}
                    />
                  </div>
                  <Button
                    disabled={loading}
                    onClick={submitProfile}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {t('save')}
                  </Button>
                </div>
              )}

              {active === 'security' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">
                      {t('current_password')}
                    </label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder={t('ph_current_password')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      {t('new_password')}
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder={t('ph_new_password')}
                    />
                  </div>
                  <div>
                    <label className="block text sm mb-1">
                      {t('confirm_new_password')}
                    </label>
                    <Input
                      type="password"
                      value={newPasswordConfirmation}
                      onChange={e => setNewPasswordConfirmation(e.target.value)}
                      placeholder={t('ph_confirm_new_password')}
                    />
                  </div>
                  <Button
                    disabled={loading}
                    onClick={submitPassword}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {t('change_password')}
                  </Button>
                </div>
              )}

              {active === 'language' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">
                      {t('language')}
                    </label>
                    <select
                      className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      value={language}
                      onChange={e => {
                        const val = e.target.value as 'EN' | 'VI';
                        setLanguage(val);
                        i18n.changeLanguage(val.toLowerCase());
                      }}
                    >
                      <option value="EN">{t('language_en')}</option>
                      <option value="VI">{t('language_vi')}</option>
                    </select>
                  </div>
                  <Button
                    disabled={loading}
                    onClick={submitLanguage}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {t('save')}
                  </Button>
                </div>
              )}

              {active === 'sessions' && (
                <div className="space-y-3">
                  {sessions.length === 0 && (
                    <div className="text-sm text-gray-500">
                      {t('no_active_sessions')}
                    </div>
                  )}
                  {sessions.map(s => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between border rounded px-3 py-2 text-sm"
                    >
                      <div>
                        <div className="font-medium">
                          {s.device_info || t('device_unknown')}
                        </div>
                        <div className="text-gray-500">
                          {s.ip_address || t('ip_na')} ·{' '}
                          {s.last_active
                            ? new Date(s.last_active).toLocaleString()
                            : t('ip_na')}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => revokeSession(s.id)}
                      >
                        {t('logout')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {active === 'bookmarks' && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Bookmarks</h3>
                    <p className="text-sm text-gray-600">
                      Quản lý các tin nhắn đã bookmark
                    </p>
                  </div>
                  <BookmarkList />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
