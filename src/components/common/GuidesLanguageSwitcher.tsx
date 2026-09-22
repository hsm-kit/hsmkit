import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguageContext } from '../../hooks/languageContext';
import { getGuidesPath, getGuidesSlug } from '../../utils/guidesPath';
import type { Language } from '../../locales';
import HeaderLanguageMenu from './HeaderLanguageMenu';

const guideLanguageOptions = [
  { value: 'en' as const, label: 'English' },
  { value: 'zh' as const, label: '中文' },
];

const GuidesLanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguageContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    const slug = getGuidesSlug(location.pathname) || undefined;
    navigate(getGuidesPath(nextLanguage, slug));
  };

  return (
    <HeaderLanguageMenu
      language={language === 'zh' ? 'zh' : 'en'}
      options={guideLanguageOptions}
      onSelect={handleChange}
      className="guides-language-switcher"
    />
  );
};

export default GuidesLanguageSwitcher;
