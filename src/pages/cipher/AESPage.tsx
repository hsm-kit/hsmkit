import React from 'react';
import { ToolPage } from '../../components/common';
import { CipherTool } from '../../components/cipher';

const AESPage: React.FC = () => (
  <ToolPage
    seoKey="aes"
    canonical="https://hsmkit.com/aes-encryption"
    toolName="AES Encryption/Decryption Tool"
    toolCategory="SecurityApplication"
  >
    <CipherTool />
  </ToolPage>
);

export default AESPage;
