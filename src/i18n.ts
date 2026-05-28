import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';

const NS = 'translation';

i18n.use(initReactI18next).init({
  resources: {
    en: { [NS]: en },
  },
  lng: 'en',
  fallbackLng: 'en',
  ns: [NS],
  defaultNS: NS,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

const loadedLangs = new Set<string>(['en']);

const langModules: Record<string, () => Promise<{ default: unknown }>> = {
  zh: () => import('./locales/zh'),
  ja: () => import('./locales/ja'),
  ko: () => import('./locales/ko'),
  de: () => import('./locales/de'),
  fr: () => import('./locales/fr'),
};

export async function loadLanguage(lang: string): Promise<void> {
  if (loadedLangs.has(lang)) return;

  const loader = langModules[lang];
  if (!loader) return;

  const mod = await loader();
  const translations = (mod as { default: unknown }).default;
  i18n.addResourceBundle(lang, NS, translations, true, true);
  loadedLangs.add(lang);
}

export default i18n;
