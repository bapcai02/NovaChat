import { createInstance, i18n as I18nType } from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/locales/en/common.json";
import viCommon from "@/locales/vi/common.json";

export async function initI18n(): Promise<I18nType> {
  const i18n = createInstance();
  await i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: {
      en: { common: enCommon },
      vi: { common: viCommon },
    },
    defaultNS: "common",
    interpolation: { escapeValue: false },
  });
  return i18n;
}
