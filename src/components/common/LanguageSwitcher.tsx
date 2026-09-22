import { useLanguageContext as useLanguage } from '../../hooks/languageContext';
import type { Language } from '../../locales';
import HeaderLanguageMenu from './HeaderLanguageMenu';

// 语言选项 - 提取到组件外部避免重复创建
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const handleChange = (nextLanguage: Language) => setLanguage(nextLanguage);

  return (
    <HeaderLanguageMenu
      language={language}
      options={languageOptions as Array<{ value: Language; label: string }>}
      onSelect={handleChange}
      className="language-switcher"
    />
  );
};

export default LanguageSwitcher;

