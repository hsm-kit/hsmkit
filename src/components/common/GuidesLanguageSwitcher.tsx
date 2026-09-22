import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguageContext } from '../../hooks/languageContext';
import { getGuidesPath, getGuidesSlug } from '../../utils/guidesPath';
import type { Language } from '../../locales';

const GuidesLanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguageContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = event.target.value as Language;
    setLanguage(nextLanguage);
    const slug = getGuidesSlug(location.pathname) || undefined;
    navigate(getGuidesPath(nextLanguage, slug));
  };

  return (
    <label className="guides-language-switcher">
      <span className="visually-hidden">Language</span>
      <select value={language === 'zh' ? 'zh' : 'en'} onChange={handleChange} aria-label="Language">
        <option value="en">English</option>
        <option value="zh">中文</option>
      </select>
    </label>
  );
};

export default GuidesLanguageSwitcher;
