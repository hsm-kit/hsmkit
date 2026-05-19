import React from 'react';
import { ToolPage } from '../../components/common';
import { DESTool } from '../../components/cipher';

const DESPage: React.FC = () => (
  <ToolPage
    seoKey="des"
    canonical="https://hsmkit.com/des-encryption"
    toolName="DES/3DES Encryption Tool"
    toolCategory="SecurityApplication"
  >
    <DESTool />
  </ToolPage>
);

export default DESPage;
