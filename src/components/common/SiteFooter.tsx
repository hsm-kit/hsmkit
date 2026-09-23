import React from 'react';
import { Layout } from 'antd';
import { useLanguageContext as useLanguage } from '../../hooks/languageContext';

const { Footer } = Layout;

export const SiteFooter: React.FC = () => {
  const { t } = useLanguage();
  const links = [
    { href: '/about/', label: t.footer.about },
    { href: '/editorial-policy/', label: t.footer.editorialPolicy },
    { href: '/privacy-policy/', label: t.footer.privacyPolicy },
    { href: '/terms-of-service/', label: t.footer.termsOfService },
    { href: '/disclaimer/', label: t.footer.disclaimer },
    { href: 'mailto:contact@hsmkit.com', label: t.footer.contact },
  ];

  return (
    <Footer className="site-footer">
      <div className="site-footer-tagline">
        HSMKit.com © 2025 - {new Date().getFullYear()} | {t.footer.tagline}
      </div>
      <nav className="site-footer-links" aria-label={t.footer.tagline}>
        {links.map((link, index) => (
          <React.Fragment key={link.href}>
            {index > 0 && <span className="site-footer-separator" aria-hidden="true">•</span>}
            <a href={link.href}>{link.label}</a>
          </React.Fragment>
        ))}
      </nav>
    </Footer>
  );
};

export default SiteFooter;