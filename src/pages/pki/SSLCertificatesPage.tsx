import React from 'react';
import { ToolPage } from '../../components/common';
import { SSLCertificatesTool } from '../../components/pki';

const SSLCertificatesPage: React.FC = () => (
  <ToolPage
    seoKey="sslCert"
    canonical="https://hsmkit.com/ssl-certificates"
    toolName="SSL Certificates (X509)"
    toolCategory="SecurityApplication"
  >
    <SSLCertificatesTool />
  </ToolPage>
);

export default SSLCertificatesPage;
