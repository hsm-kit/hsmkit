import React from 'react';
import { Button, Tooltip } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { getToolByPath } from '../../data/toolRelations';
import { trackToolEvent } from '../../utils/analytics';

interface ExampleButtonProps {
  onClick: () => void;
  size?: 'small' | 'middle' | 'large';
  label?: string;
}

export const ExampleButton: React.FC<ExampleButtonProps> = React.memo(({ onClick, size = 'small', label }) => {
  const { t } = useLanguage();

  return (
    <Tooltip title={t.common?.loadExample || 'Load Example'}>
      <Button
        size={size}
        icon={<ExperimentOutlined />}
        onClick={() => {
          const tool = getToolByPath(window.location.pathname);
          if (tool) trackToolEvent('example_load', { toolId: tool.seoKey });
          onClick();
        }}
        style={{ fontSize: 12 }}
      >
        {label || t.common?.example || 'Example'}
      </Button>
    </Tooltip>
  );
});

ExampleButton.displayName = 'ExampleButton';

export default ExampleButton;
