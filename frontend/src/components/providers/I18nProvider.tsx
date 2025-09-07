"use client"

import React, { useEffect, useState } from 'react'
import i18next, { i18n as I18nType } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'

import enCommon from '@/locales/en/common.json'
import viCommon from '@/locales/vi/common.json'

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instance, setInstance] = useState<I18nType | null>(null)

  useEffect(() => {
    const i18n = i18next.createInstance()
    i18n
      .use(initReactI18next)
      .init({
        lng: 'en',
        fallbackLng: 'en',
        resources: {
          en: { common: enCommon },
          vi: { common: viCommon },
        },
        defaultNS: 'common',
        interpolation: { escapeValue: false },
      })
      .then(() => setInstance(i18n))
  }, [])

  if (!instance) return null

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>
}


