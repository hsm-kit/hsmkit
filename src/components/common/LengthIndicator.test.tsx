import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FieldLabel, LengthIndicator } from './LengthIndicator';

describe('LengthIndicator', () => {
  it('renders empty values as neutral', () => {
    render(<LengthIndicator current={0} expected={16} />);
    expect(screen.getByText('[0]')).toHaveStyle({ color: '#999' });
  });

  it('renders valid and invalid fixed lengths consistently', () => {
    const { rerender } = render(<LengthIndicator current={16} expected={16} />);
    expect(screen.getByText('[16]')).toHaveStyle({ color: '#52c41a' });

    rerender(<LengthIndicator current={15} expected={16} />);
    expect(screen.getByText('[15]')).toHaveStyle({ color: '#ff4d4f' });
  });

  it('supports ranged constraints', () => {
    const { rerender } = render(<LengthIndicator current={12} min={12} max={19} />);
    expect(screen.getByText('[12]')).toHaveStyle({ color: '#52c41a' });

    rerender(<LengthIndicator current={20} min={12} max={19} />);
    expect(screen.getByText('[20]')).toHaveStyle({ color: '#ff4d4f' });
  });

  it('supports semantic format validity', () => {
    const { rerender } = render(<LengthIndicator current={4} min={2} valid={false} />);
    expect(screen.getByText('[4]')).toHaveStyle({ color: '#ff4d4f' });

    rerender(<LengthIndicator current={4} min={2} valid />);
    expect(screen.getByText('[4]')).toHaveStyle({ color: '#52c41a' });
  });

  it('keeps the indicator in the shared label row', () => {
    render(<FieldLabel label="Key" current={0} expected={[16, 24, 32]} />);
    expect(screen.getByText('Key').closest('.field-label-row')).toContainElement(screen.getByText('[0]'));
  });
});
