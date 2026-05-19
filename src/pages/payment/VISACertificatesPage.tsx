import React from 'react';
import { ToolPage } from '../../components/common';
import VISACertificatesTool from '../../components/payment/VISACertificatesTool';

const VISACertificatesPage: React.FC = () => (
  <ToolPage
    seoKey="visaCertificates"
    canonical="https://hsmkit.com/payments-visa-certificates"
    toolName="VISA Certificates Validator"
    toolCategory="SecurityApplication"
  >
    <VISACertificatesTool />
  </ToolPage>
);

export default VISACertificatesPage;
