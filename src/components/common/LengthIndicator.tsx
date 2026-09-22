import React from 'react';

interface LengthIndicatorProps {
  current: number;
  expected?: number | number[];
  min?: number;
  max?: number;
  valid?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

interface FieldLabelProps extends LengthIndicatorProps {
  label: React.ReactNode;
  extra?: React.ReactNode;
}

/**
 * 长度指示器组件
 * 显示 [current] 并根据是否匹配预期长度变色
 */
export const LengthIndicator: React.FC<LengthIndicatorProps> = React.memo(({ 
  current, 
  expected, 
  min,
  max,
  valid,
  disabled = false,
  style 
}) => {
  const hasConstraint = expected !== undefined || min !== undefined || max !== undefined;
  const rangeValid = (min === undefined || current >= min) && (max === undefined || current <= max);
  const lengthValid = expected !== undefined
    ? Array.isArray(expected) ? expected.includes(current) : current === expected
    : rangeValid;
  const color = disabled || current === 0
    ? '#999'
    : valid === false
      ? '#ff4d4f'
      : hasConstraint
        ? lengthValid ? '#52c41a' : '#ff4d4f'
        : valid === true ? '#52c41a' : '#999';

  return (
    <span className="length-indicator" style={{
      color,
      fontSize: 12,
      fontWeight: 500,
      marginLeft: 8,
      ...style,
    }}>
      [{current}]
    </span>
  );
});

LengthIndicator.displayName = 'LengthIndicator';

export default LengthIndicator;

export const FieldLabel: React.FC<FieldLabelProps> = React.memo(({
  label,
  extra,
  current,
  expected,
  min,
  max,
  valid,
  disabled,
}) => (
  <div className="field-label-row">
    <span className="field-label-text">{label}</span>
    <span className="field-label-meta">
      {extra}
      <LengthIndicator
        current={current}
        expected={expected}
        min={min}
        max={max}
        valid={valid}
        disabled={disabled}
      />
    </span>
  </div>
));

FieldLabel.displayName = 'FieldLabel';
