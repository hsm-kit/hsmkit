import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocation, useNavigate } from 'react-router-dom';
import { isGuidesPage, getGuidesPath, getGuidesSlug } from '../../utils/guidesPath';
import type { Language } from '../../locales';

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
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (lang: string) => {
    const l = lang as Language;
    setLanguage(l);

    // If we're on a guides page, navigate to the corresponding localized URL
    if (isGuidesPage(location.pathname)) {
      const slug = getGuidesSlug(location.pathname) || undefined;
      const path = getGuidesPath(l, slug);
      navigate(path);
    }
  };

  return (
    <Select
      value={language}
      onChange={handleChange}
      style={{ width: 95 }}
      variant="borderless"
      suffixIcon={<GlobalOutlined />}
      options={languageOptions}
      popupMatchSelectWidth={false}
      styles={{ popup: { root: { minWidth: 110 } } }}
      className="language-switcher"
    />
  );
};

export default LanguageSwitcher;

