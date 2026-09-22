import { createToolPage } from '../../components/common';
import { SSLCertificatesTool } from '../../components/pki';

export default createToolPage(SSLCertificatesTool, {
  seoKey: 'sslCert',
  canonical: 'https://hsmkit.com/ssl-certificates',
  toolName: 'SSL Certificates (X509)',
  toolCategory: 'SecurityApplication',
});
