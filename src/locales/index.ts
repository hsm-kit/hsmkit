import en from './en';
import zh from './zh';
import ja from './ja';
import ko from './ko';
import de from './de';
import fr from './fr';

export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'de' | 'fr';

export type Translations = typeof en;

export const translations: Record<Language, Translations> = {
  en,
  zh,
  ja,
  ko,
  de,
  fr,
};

export const defaultLanguage: Language = 'en';

