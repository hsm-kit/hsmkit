import React from 'react';
import { ToolPage } from '../../components/common';
import { ECCTool } from '../../components/cipher';

const ECCPage: React.FC = () => (
  <ToolPage
    seoKey="ecc"
    canonical="https://hsmkit.com/ecc-encryption"
    toolName="ECC/ECDSA Digital Signature Tool"
    toolCategory="SecurityApplication"
  >
    <ECCTool />
  </ToolPage>
);

export default ECCPage;
