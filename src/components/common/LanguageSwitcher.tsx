import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';

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

  return (
    <Select
      value={language}
      onChange={setLanguage}
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

