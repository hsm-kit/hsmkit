import en from './en';

export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'de' | 'fr';

export type Translations = typeof en;

export const defaultLanguage: Language = 'en';
