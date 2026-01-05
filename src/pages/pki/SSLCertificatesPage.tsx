import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { SSLCertificatesTool } from '../../components/pki';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const SSLCertificatesPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.sslCert || seoContent.en.sslCert;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/ssl-certificates"
      faqTitle={seo.faqTitle}
      faqs={seo.faqs}
      usageTitle={seo.usageTitle}
      usageContent={
        seo.usage && seo.usage.length > 0 ? (
          <div>
            {seo.usage.map((text: string, index: number) => (
              <Paragraph key={index} style={{ marginBottom: index === seo.usage.length - 1 ? 0 : 8 }}>
                • {text}
              </Paragraph>
            ))}
          </div>
        ) : null
      }
      toolName="SSL Certificates (X509)"
      toolCategory="SecurityApplication"
    >
      <SSLCertificatesTool />
    </PageLayout>
  );
};

export default SSLCertificatesPage;

