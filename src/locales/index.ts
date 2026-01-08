import en from './en';
import zh from './zh';
import ja from './ja';
import ko from './ko';
import de from './de';
import fr from './fr';

export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'de' | 'fr';

export type Translations = typeof en;

// Use type assertion to allow partial translations - missing keys will fall back to defaults at runtime
export const translations: Record<Language, Translations> = {
  en,
  zh: zh as unknown as Translations,
  ja: ja as unknown as Translations,
  ko: ko as unknown as Translations,
  de: de as unknown as Translations,
  fr: fr as unknown as Translations,
};

export const defaultLanguage: Language = 'en';

