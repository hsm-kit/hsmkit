import en from './en';

export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'de' | 'fr';

export type Translations = typeof en;

export const defaultLanguage: Language = 'en';

const translationsCache: Partial<Record<Language, Translations>> = {
  en,
};

export const getCachedTranslations = (lang: Language): Translations | undefined => translationsCache[lang];

export const loadTranslations = async (lang: Language): Promise<Translations> => {
  const cached = translationsCache[lang];
  if (cached) return cached;

  // 动态导入：避免把所有语言包打进首屏 bundle
  // 这里用 switch 保持类型安全与可读性
  let mod: unknown;
  switch (lang) {
    case 'zh':
      mod = await import('./zh');
      break;
    case 'ja':
      mod = await import('./ja');
      break;
    case 'ko':
      mod = await import('./ko');
      break;
    case 'de':
      mod = await import('./de');
      break;
    case 'fr':
      mod = await import('./fr');
      break;
    case 'en':
    default:
      translationsCache.en = en;
      return en;
  }

  const loaded = (mod as { default: unknown }).default as unknown as Translations;
  translationsCache[lang] = loaded;
  return loaded;
};

