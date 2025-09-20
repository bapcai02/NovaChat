'use client';

import React, { useEffect, useState } from 'react';
import i18next, { i18n as I18nType } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import enCommon from '@/locales/en/common.json';
import viCommon from '@/locales/vi/common.json';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [instance, setInstance] = useState<I18nType | null>(null);

  useEffect(() => {
    const saved =
      typeof window !== 'undefined' ? localStorage.getItem('locale') || '' : '';
    const initialLng = saved === 'vi' || saved === 'en' ? saved : 'en';
    const i18n = i18next.createInstance();
    i18n
      .use(initReactI18next)
      .init({
        lng: initialLng,
        fallbackLng: 'en',
        resources: {
          en: { common: enCommon },
          vi: { common: viCommon },
        },
        defaultNS: 'common',
        interpolation: { escapeValue: false },
      })
      .then(() => {
        // persist and sync <html lang>
        if (typeof window !== 'undefined') {
          localStorage.setItem('locale', initialLng);
        }
        if (typeof document !== 'undefined') {
          document.documentElement.lang = initialLng;
        }
        // listen for changes to persist
        i18n.on('languageChanged', lng => {
          if (typeof window !== 'undefined')
            localStorage.setItem('locale', lng);
          if (typeof document !== 'undefined')
            document.documentElement.lang = lng;
        });
        setInstance(i18n);
      });
  }, []);

  // If no saved locale, optionally fall back to URL prefix once (kept simple)

  if (!instance) return null;

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
};
