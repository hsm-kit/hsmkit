import React from 'react';
import { getLengthColor } from '../../utils/hex';

interface LengthIndicatorProps {
  current: number;
  expected: number | number[];
  disabled?: boolean;
  style?: React.CSSProperties;
}

/**
 * 长度指示器组件
 * 显示 [current] 并根据是否匹配预期长度变色
 */
export const LengthIndicator: React.FC<LengthIndicatorProps> = ({ 
  current, 
  expected, 
  disabled = false,
  style 
}) => {
  const color = getLengthColor(current, expected, disabled);
  
  return (
    <span style={{ 
      color, 
      fontSize: 12, 
      fontWeight: 500,
      marginLeft: 8,
      ...style,
    }}>
      [{current}]
    </span>
  );
};

export default LengthIndicator;
