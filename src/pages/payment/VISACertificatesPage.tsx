import { createToolPage } from '../../components/common';
import VISACertificatesTool from '../../components/payment/VISACertificatesTool';

export default createToolPage(VISACertificatesTool, {
  seoKey: 'visaCertificates',
  canonical: 'https://hsmkit.com/payments-visa-certificates',
  toolName: 'VISA Certificates Validator',
  toolCategory: 'SecurityApplication',
});
