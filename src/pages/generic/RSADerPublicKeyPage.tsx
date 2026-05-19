import React from 'react';
import { ToolPage } from '../../components/common';
import { RSADerPublicKeyTool } from '../../components/generic';

const RSADerPublicKeyPage: React.FC = () => (
  <ToolPage
    seoKey="rsaDer"
    canonical="https://hsmkit.com/rsa-der-public-key"
    toolName="RSA DER Public Key"
    toolCategory="DeveloperApplication"
  >
    <RSADerPublicKeyTool />
  </ToolPage>
);

export default RSADerPublicKeyPage;
