import React from 'react';
import { ToolPage } from '../../components/common';
import ZKATool from '../../components/payment/ZKATool';

const ZKAPage: React.FC = () => (
  <ToolPage
    seoKey="zka"
    canonical="https://hsmkit.com/payments-zka"
    toolName="ZKA Cryptographic Tool"
    toolCategory="SecurityApplication"
  >
    <ZKATool />
  </ToolPage>
);

export default ZKAPage;
