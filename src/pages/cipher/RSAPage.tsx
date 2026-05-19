import React from 'react';
import { ToolPage } from '../../components/common';
import { RSATool } from '../../components/cipher';

const RSAPage: React.FC = () => (
  <ToolPage
    seoKey="rsa"
    canonical="https://hsmkit.com/rsa-encryption"
    toolName="RSA Encryption & Key Generator"
    toolCategory="SecurityApplication"
  >
    <RSATool />
  </ToolPage>
);

export default RSAPage;
