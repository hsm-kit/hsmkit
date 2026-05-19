import React from 'react';
import { ToolPage } from '../../components/common';
import { FPETool } from '../../components/cipher';

const FPEPage: React.FC = () => (
  <ToolPage
    seoKey="fpe"
    canonical="https://hsmkit.com/fpe-encryption"
    toolName="Format-Preserving Encryption (FF1/FF3-1)"
    toolCategory="SecurityApplication"
  >
    <FPETool />
  </ToolPage>
);

export default FPEPage;
