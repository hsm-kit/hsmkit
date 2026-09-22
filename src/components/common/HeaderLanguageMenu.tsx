import React, { useEffect, useId, useRef, useState } from 'react';
import { CheckOutlined, DownOutlined, GlobalOutlined } from '@ant-design/icons';
import type { Language } from '../../locales';

export interface HeaderLanguageOption {
  value: Language;
  label: string;
}

interface HeaderLanguageMenuProps {
  language: Language;
  options: HeaderLanguageOption[];
  onSelect: (language: Language) => void;
  className?: string;
}

const HeaderLanguageMenu: React.FC<HeaderLanguageMenuProps> = ({
  language,
  options,
  onSelect,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const selected = options.find(option => option.value === language) || options[0];

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        containerRef.current?.querySelector<HTMLButtonElement>('.header-language-trigger')?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`header-language-menu header-language-switcher ${className}`.trim()}
      data-language-menu
    >
      <button
        type="button"
        className="header-language-trigger"
        aria-label="Language"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(current => !current)}
        onKeyDown={event => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => containerRef.current
              ?.querySelector<HTMLButtonElement>('.header-language-option')?.focus());
          }
        }}
      >
        <span className="header-language-value">{selected.label}</span>
        <GlobalOutlined className="header-language-icon" aria-hidden="true" />
        <DownOutlined className="header-language-arrow" aria-hidden="true" />
      </button>
      <div id={menuId} className="header-language-popup" role="menu" hidden={!open}>
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            className="header-language-option"
            role="menuitemradio"
            aria-checked={option.value === language}
            data-language={option.value}
            onClick={() => {
              onSelect(option.value);
              setOpen(false);
            }}
          >
            <span>{option.label}</span>
            {option.value === language && <CheckOutlined aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeaderLanguageMenu;
