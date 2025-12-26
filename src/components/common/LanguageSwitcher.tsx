import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Select
      value={language}
      onChange={(value) => setLanguage(value)}
      style={{ width: 95 }}
      bordered={false}
      suffixIcon={<GlobalOutlined />}
      options={[
        { value: 'en', label: 'English' },
        { value: 'zh', label: '中文' },
        { value: 'ja', label: '日本語' },
        { value: 'ko', label: '한국어' },
        { value: 'de', label: 'Deutsch' },
        { value: 'fr', label: 'Français' },
      ]}
      popupMatchSelectWidth={false}
      dropdownStyle={{ minWidth: 110 }}
      className="language-switcher"
    />
  );
};

export default LanguageSwitcher;

