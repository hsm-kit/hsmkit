import React from 'react';
import { Button, Tooltip } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';

interface ExampleButtonProps {
  onClick: () => void;
  size?: 'small' | 'middle' | 'large';
}

export const ExampleButton: React.FC<ExampleButtonProps> = React.memo(({ onClick, size = 'small' }) => {
  const { t } = useLanguage();

  return (
    <Tooltip title={t.common?.loadExample || 'Load Example'}>
      <Button
        size={size}
        icon={<ExperimentOutlined />}
        onClick={onClick}
        style={{ fontSize: 12 }}
      >
        {t.common?.example || 'Example'}
      </Button>
    </Tooltip>
  );
});

ExampleButton.displayName = 'ExampleButton';

export default ExampleButton;
